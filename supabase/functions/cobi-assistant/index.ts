import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

type CobiAction =
  | { type: "navigate"; pathname: string; params?: Record<string, unknown> }
  | { type: "none" };

type CobiResponse = {
  reply: string;
  action?: CobiAction;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();

    const userName = String(body?.userName ?? "User");
    const language = String(body?.language ?? "en");
    const selectedAccountNo = String(body?.selectedAccountNo ?? "");

    // ✅ IMPORTANT: homepage sends `messages`
    const messages: ChatMsg[] = Array.isArray(body?.messages) ? body.messages : [];

    if (!messages.length) {
      return json({
        reply: "Please say something for me to help with.",
        action: { type: "none" },
      } satisfies CobiResponse);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceRole) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in secrets.");
    }

    const openAiKey = Deno.env.get("OPENAI_API_KEY_COBI");
    if (!openAiKey) throw new Error("Missing OPENAI_API_KEY_COBI in Supabase secrets.");

    const supabase = createClient(supabaseUrl, supabaseServiceRole);

    const system: ChatMsg = {
      role: "system",
      content: `You are Cobi, a helpful voice assistant for a banking app user named ${userName}.

User context:
- Language: ${language}
- Selected account number (may be empty): ${selectedAccountNo}
- Currency: SGD only.

App navigation rules (VERY IMPORTANT):
- If user says "open transfer" or similar -> action.navigate to /transferscreen (no params).
- If user says anything about transfer money / paynow -> action.navigate to /paynow (NO recipient/amount).
- If user says anything about request money / givenow -> action.navigate to /givenow (NO params).
- If user says "show transactions" -> action.navigate to /transactions with params { accountNo: selectedAccountNo } if available.
- If user says "notifications" -> action.navigate to /notifications.

Transfer tool rule:
- Only call tool transfer_money if user clearly provided recipient name AND amount.
- Recipient must be validated by name and account existence (Localaccounts or Foreignaccounts).
- If missing recipient or amount, ask a short follow-up question (do NOT call the tool).

Output format rule:
- Always respond with normal assistant text.
- If navigation is needed, include action.navigate in the JSON you return (not inside assistant text).`,
    };

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [system, ...messages],
        tools: [
          {
            type: "function",
            function: {
              name: "transfer_money",
              description:
                "Transfer money to a recipient (SGD). Recipient is a person name; server will validate.",
              parameters: {
                type: "object",
                properties: {
                  recipientName: { type: "string" },
                  amount: { type: "number" },
                },
                required: ["recipientName", "amount"],
              },
            },
          },
        ],
        tool_choice: "auto",
        temperature: 0.2,
      }),
    });

    if (!openaiRes.ok) throw new Error(`OpenAI error: ${await openaiRes.text()}`);

    const aiData = await openaiRes.json();
    const msg = aiData?.choices?.[0]?.message;

    // -------------
    // TOOL CALL: transfer_money
    // -------------
    if (msg?.tool_calls?.length) {
      const first = msg.tool_calls[0];
      if (first?.function?.name === "transfer_money") {
        const args = JSON.parse(first.function.arguments || "{}");
        const recipientName = String(args.recipientName ?? "").trim();
        const amount = Number(args.amount);

        if (!recipientName || !Number.isFinite(amount) || amount <= 0) {
          return json({
            reply:
              "I need a recipient name and an amount. Example: “Send 2 dollars to Alex.”",
            action: { type: "none" },
          } satisfies CobiResponse);
        }

        // ✅ Recipient lookup by NAME only (Local + Foreign)
        const receiver = await findAccountByName(supabase, recipientName);
        if (!receiver) {
          return json({
            reply: `I can’t find an account for “${recipientName}”. Please check the name.`,
            action: { type: "none" },
          } satisfies CobiResponse);
        }

        // ✅ Sender lookup by selectedAccountNo (Local + Foreign)
        const sender = selectedAccountNo
          ? await findAccountByAccountNo(supabase, selectedAccountNo)
          : null;

        if (!sender) {
          return json({
            reply: "I couldn’t find your sending account. Please select an account first.",
            action: { type: "none" },
          } satisfies CobiResponse);
        }

        // ✅ Use your existing RPC (recommended)
        const { data, error } = await supabase.rpc("transfer_funds", {
          sender_account_no: sender.accountNo,
          receiver_account_no: receiver.accountNo,
          amount,
          description: `Cobi transfer to ${receiver.name}`,
        });

        if (error) {
          return json({
            reply: `Transfer failed: ${error.message}`,
            action: { type: "none" },
          } satisfies CobiResponse);
        }
        if (data && (data as any).error) {
          return json({
            reply: `Transfer failed: ${(data as any).error}`,
            action: { type: "none" },
          } satisfies CobiResponse);
        }

        return json({
          reply: `Done! Sent SGD ${amount.toFixed(2)} to ${receiver.name}.`,
          action: { type: "none" },
        } satisfies CobiResponse);
      }
    }

    // -------------
    // NORMAL RESPONSE + NAV DETECTION (based on last USER message)
    // -------------
    const content =
      String(msg?.content ?? "").trim() ||
      "Sorry, I didn’t catch that. Can you repeat?";

    const lastUserText = getLastUserText(messages);
    const nav = detectNavigation(lastUserText, selectedAccountNo);

    const res: CobiResponse = nav
      ? { reply: content, action: nav }
      : { reply: content, action: { type: "none" } };

    return json(res);
  } catch (error) {
    return new Response(JSON.stringify({ error: String((error as any)?.message ?? error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

function json(obj: unknown) {
  return new Response(JSON.stringify(obj), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getLastUserText(messages: ChatMsg[]) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]?.role === "user") return String(messages[i]?.content ?? "");
  }
  return "";
}

// ----------
// Account lookup helpers
// ----------
type FoundAccount = { table: "Localaccounts" | "Foreignaccounts"; accountNo: string; name: string };

async function findAccountByName(supabase: any, name: string): Promise<FoundAccount | null> {
  // Local
  const l = await supabase
    .from("Localaccounts")
    .select("accountNo,name")
    .ilike("name", name)
    .maybeSingle();

  if (l?.data?.accountNo) {
    return { table: "Localaccounts", accountNo: l.data.accountNo, name: l.data.name };
  }

  // Foreign
  const f = await supabase
    .from("Foreignaccounts")
    .select("accountNo,name")
    .ilike("name", name)
    .maybeSingle();

  if (f?.data?.accountNo) {
    return { table: "Foreignaccounts", accountNo: f.data.accountNo, name: f.data.name };
  }

  return null;
}

async function findAccountByAccountNo(supabase: any, accountNo: string): Promise<FoundAccount | null> {
  const l = await supabase
    .from("Localaccounts")
    .select("accountNo,name")
    .eq("accountNo", accountNo)
    .maybeSingle();

  if (l?.data?.accountNo) {
    return { table: "Localaccounts", accountNo: l.data.accountNo, name: l.data.name };
  }

  const f = await supabase
    .from("Foreignaccounts")
    .select("accountNo,name")
    .eq("accountNo", accountNo)
    .maybeSingle();

  if (f?.data?.accountNo) {
    return { table: "Foreignaccounts", accountNo: f.data.accountNo, name: f.data.name };
  }

  return null;
}

// ----------
// Navigation detection (based on USER intent)
// ----------
function detectNavigation(lastUserText: string, selectedAccountNo: string): CobiAction | null {
  const q = (lastUserText || "").toLowerCase();

  // open transfer -> transferscreen
  if (q.includes("open transfer") || q.includes("transfer screen") || q.includes("pay and transfer")) {
    return { type: "navigate", pathname: "/transferscreen" };
  }

  // transactions
  if (q.includes("transactions") || q.includes("transaction history") || q.includes("recent transactions")) {
    return {
      type: "navigate",
      pathname: "/transactions",
      params: selectedAccountNo ? { accountNo: selectedAccountNo } : {},
    };
  }

  // notifications
  if (q.includes("notification")) {
    return { type: "navigate", pathname: "/notifications" };
  }

  // paynow / transfer money -> paynow default screen (NO recipient/amount)
  if (
    q.includes("paynow") ||
    q.includes("transfer money") ||
    q.includes("send money") ||
    q.includes("transfer") ||
    q.includes("pay ")
  ) {
    return { type: "navigate", pathname: "/paynow" };
  }

  // givenow / request money -> givenow default screen
  if (q.includes("request money") || q.includes("givenow") || q.includes("request ")) {
    return { type: "navigate", pathname: "/givenow" };
  }

  return null;
}
