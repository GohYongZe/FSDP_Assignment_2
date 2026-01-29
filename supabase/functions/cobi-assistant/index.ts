import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { query, userName } = await req.json()
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const openAiKey = Deno.env.get('OPENAI_API_KEY')!

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openAiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: `You are Cobi, a banking assistant for ${userName}.` },
          { role: 'user', content: query }
        ],
        tools: [{
          type: "function",
          function: {
            name: "transfer_money",
            description: "Transfer money to a recipient",
            parameters: {
              type: "object",
              properties: { recipient: { type: "string" }, amount: { type: "number" } },
              required: ["recipient", "amount"]
            }
          }
        }]
      })
    })

    const aiData = await response.json()
    const message = aiData.choices[0].message

    if (message.tool_calls) {
      const { recipient, amount } = JSON.parse(message.tool_calls[0].function.arguments)

      // Fetch balances for both parties
      const { data: sender } = await supabase.from('Localaccounts').select('balance').eq('name', userName).single()
      const { data: receiver } = await supabase.from('Localaccounts').select('balance').eq('name', recipient).single()

      if (!sender || !receiver) throw new Error("Account not found")

      const sBal = parseFloat(sender.balance.replace('S$', '').replace(',', ''))
      const rBal = parseFloat(receiver.balance.replace('S$', '').replace(',', ''))

      if (sBal < amount) return new Response(JSON.stringify({ message: "Insufficient funds" }), { headers: corsHeaders })

      // Update both balances
      await supabase.from('Localaccounts').update({ balance: `S$ ${(sBal - amount).toFixed(2)}` }).eq('name', userName)
      await supabase.from('Localaccounts').update({ balance: `S$ ${(rBal + amount).toFixed(2)}` }).eq('name', recipient)

      return new Response(JSON.stringify({ message: `Success! Sent S$${amount} to ${recipient}.` }), { headers: corsHeaders })
    }

    return new Response(JSON.stringify({ message: message.content }), { headers: corsHeaders })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: corsHeaders, status: 400 })
  }
})