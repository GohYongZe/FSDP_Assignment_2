import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// These headers allow your React Native app to call this function without being blocked
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle the "Preflight" request from the browser/mobile app
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, userName } = await req.json()

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const openAiKey = Deno.env.get('OPENAI_API_KEY') ?? ''

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Ask OpenAI what to do
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: `You are Cobi, an assistant for ${userName}.` },
          { role: 'user', content: query }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "transfer_money",
              description: "Transfer money to a recipient",
              parameters: {
                type: "object",
                properties: {
                  recipient: { type: "string" },
                  amount: { type: "number" }
                },
                required: ["recipient", "amount"]
              }
            }
          }
        ]
      })
    })

    const aiData = await response.json()
    
    // Check if OpenAI returned an error (usually invalid API key)
    if (aiData.error) {
      throw new Error(aiData.error.message)
    }

    const message = aiData.choices[0].message

    // 2. Logic to handle the transfer if AI triggered the tool
    if (message.tool_calls) {
      const toolCall = message.tool_calls[0]
      const { recipient, amount } = JSON.parse(toolCall.function.arguments)

      // Get current balance from your Localaccounts table
      const { data: account } = await supabase
        .from('Localaccounts')
        .select('balance')
        .eq('name', userName)
        .single()

      if (!account) throw new Error("Account not found")

      const currentBalance = parseFloat(account.balance.replace('S$', '').replace(',', ''))
      
      if (currentBalance < amount) {
        return new Response(JSON.stringify({ message: "You don't have enough money for that!" }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Update balance
      const newBalance = `S$ ${(currentBalance - amount).toFixed(2)}`
      await supabase.from('Localaccounts').update({ balance: newBalance }).eq('name', userName)

      return new Response(JSON.stringify({ message: `Success! Sent S$${amount} to ${recipient}.` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Default text response
    return new Response(JSON.stringify({ message: message.content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})