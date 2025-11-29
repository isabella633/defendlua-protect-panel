import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userId, currentCode } = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's subscription plan
    let userPlan = 'free';
    if (userId) {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (subscription) {
        userPlan = subscription.plan;
      }
    }

    // Define system prompts based on plan with code context
    const codeContext = currentCode ? `\n\nCurrent Lua code being worked on:\n\`\`\`lua\n${currentCode}\n\`\`\`\n\nProvide assistance based on this code when relevant.` : '';
    
    // Define system prompts based on plan with code context
    const codeContext = currentCode ? `\n\nCurrent code:\n\`\`\`lua\n${currentCode}\n\`\`\`\n\nReference this when relevant.` : '';
    
    const systemPrompts = {
      free: `You are a Lua coding expert. Respond with CODE FIRST, minimal text.

CRITICAL RULES:
- Code in \`\`\`lua blocks ONLY
- Explanation: MAX 1 sentence after code
- NO introductions, NO long descriptions
- Just solve the problem

Focus: Basic Lua, Roblox basics, syntax fixes${codeContext}`,
      
      pro: `You are a Lua coding expert. Respond with CODE FIRST, minimal text.

CRITICAL RULES:
- Code in \`\`\`lua blocks ONLY
- Explanation: MAX 2 sentences after code
- NO introductions, NO verbose descriptions
- Code speaks for itself

Focus: Advanced Lua, Roblox APIs, optimization, patterns, security${codeContext}`,
      
      enterprise: `You are an expert Lua architect. Respond with CODE FIRST, minimal text.

CRITICAL RULES:
- Code in \`\`\`lua blocks ONLY  
- Explanation: MAX 3 sentences after code
- NO preambles, NO essays
- Production-quality code with brief context

Focus: Enterprise patterns, advanced optimization, obfuscation, architecture, performance profiling${codeContext}`
    };

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Call Lovable AI with appropriate limits based on plan
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: systemPrompts[userPlan as keyof typeof systemPrompts] || systemPrompts.free
          },
          ...messages
        ],
        temperature: 0.4,
        max_tokens: userPlan === 'free' ? 400 : userPlan === 'pro' ? 3000 : 6000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        message: aiMessage,
        plan: userPlan
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Lua Code Assist error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
