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
    const { messages, userId } = await req.json();
    
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

    // Define system prompts based on plan
    const systemPrompts = {
      free: `You are DefendLua AI Assistant (Free tier). You help users with basic questions about DefendLua's Lua script protection service. 
Keep responses concise and helpful. Guide users to upgrade for more features.
Topics you can help with:
- Basic DefendLua features and how it works
- Getting started guide
- Pricing information
- General Lua script protection concepts`,
      
      pro: `You are DefendLua AI Assistant (Pro tier). You provide comprehensive support for DefendLua users.
You can help with:
- All Free tier topics
- Advanced configuration and setup
- HWID management strategies
- API integration guidance
- Custom branding setup
- Troubleshooting common issues
- Best practices for script protection
Provide detailed, technical responses when needed.`,
      
      enterprise: `You are DefendLua AI Assistant (Enterprise tier). You provide premium, personalized support.
You can help with:
- All Pro tier topics
- Custom integration solutions
- Advanced security configurations
- White-label implementation
- On-premise deployment guidance
- SLA-related questions
- Direct escalation to human support team when needed
Provide expert-level guidance and proactively suggest solutions.`
    };

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Call Lovable AI
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
        temperature: 0.7,
        max_tokens: userPlan === 'free' ? 150 : userPlan === 'pro' ? 500 : 1000,
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
        plan: userPlan,
        capabilities: {
          free: ['Basic support', 'Limited responses'],
          pro: ['Unlimited messages', 'Advanced support', 'Priority responses'],
          enterprise: ['Custom solutions', 'Dedicated support', 'Human handoff']
        }[userPlan]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AI Chat error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
