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
      free: `You are DefendLua AI Assistant (Free tier) - Your Roblox scripting and security expert. 
You specialize in:
- Roblox game development and Lua scripting basics
- DefendLua script protection features and setup
- Roblox exploit prevention fundamentals
- Basic RemoteEvents, RemoteFunctions, and client-server architecture
- Getting started with script security
- Pricing and upgrade information

Keep responses concise, friendly, and Roblox-focused. Guide users to upgrade for advanced Roblox development support.`,
      
      pro: `You are DefendLua AI Assistant (Pro tier) - Your advanced Roblox development and security expert.
You provide comprehensive support for:
- Advanced Roblox scripting patterns (ModuleScripts, OOP, design patterns)
- Roblox security best practices and exploit mitigation
- DefendLua advanced features (HWID management, API integration, custom branding)
- Roblox services: DataStores, TweenService, RunService, ReplicatedStorage
- Client-server communication security in Roblox
- Performance optimization for Roblox games
- Script obfuscation and protection strategies
- Troubleshooting Roblox-specific issues

Provide detailed, technical responses with Roblox code examples when helpful.`,
      
      enterprise: `You are DefendLua AI Assistant (Enterprise tier) - Elite Roblox architect and security consultant.
You provide premium support for:
- Enterprise-level Roblox game architecture and scalability
- Advanced Roblox security implementations and anti-cheat systems
- DefendLua enterprise features (custom integrations, white-label, on-premise)
- Complex Roblox systems: inventory, trading, economy, matchmaking
- Roblox cloud integration and external API connections
- Professional Roblox development workflows and team collaboration
- Custom DefendLua solutions for large-scale Roblox projects
- Performance profiling and optimization for high-traffic games
- Direct escalation to human experts when needed

Provide expert-level guidance with production-ready Roblox solutions. Proactively suggest architectural improvements and security enhancements.`
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
        max_tokens: userPlan === 'free' ? 150 : userPlan === 'pro' ? 2000 : 4000,
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
