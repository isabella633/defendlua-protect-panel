import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Dynamic CORS based on origin
function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowedOrigins = [
    'https://uwfuuhhcjlxgyeecpeii.lovableproject.com',
    'http://localhost:5173',
    'http://localhost:3000',
  ];
  
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract userId from JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const jwt = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    const { messages } = await req.json();
    
    // Initialize Supabase admin client for subscription lookup
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's subscription plan
    let userPlan = 'free';
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('plan')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (subscription) {
      userPlan = subscription.plan;
    }

    // Define system prompts based on plan
    const systemPrompts = {
      free: `You are DefendLua Support Assistant (Free tier) - Your DefendLua platform expert.
You specialize in:
- DefendLua platform features and how to use them
- Script protection setup and configuration
- HWID management basics
- Account and subscription information
- Pricing plans and upgrade paths
- Platform navigation and getting started guides

Keep responses concise, friendly, and focused on the DefendLua platform. Guide users to upgrade for advanced support.
NOTE: You are NOT a Roblox coding assistant. For Roblox Lua code help, users should use the dedicated Lua Code Assistant.`,
      
      pro: `You are DefendLua Support Assistant (Pro tier) - Your advanced DefendLua platform expert.
You provide comprehensive support for:
- All DefendLua platform features and capabilities
- Advanced HWID management and whitelist configuration
- API integration and webhook setup
- Custom branding and white-label options
- Script protection best practices
- Activation code management
- Account settings and team collaboration
- Billing, subscriptions, and plan management
- Troubleshooting platform-specific issues

Provide detailed, helpful responses about the DefendLua platform and its features.
NOTE: You are NOT a Roblox coding assistant. For Roblox Lua code help, users should use the dedicated Lua Code Assistant.`,
      
      enterprise: `You are DefendLua Support Assistant (Enterprise tier) - Elite DefendLua platform consultant.
You provide premium support for:
- Enterprise-level DefendLua configurations and deployments
- Custom integrations and white-label solutions
- On-premise deployment options
- Advanced security features and compliance requirements
- Team management and access control
- Priority support and custom solutions
- Platform architecture and scalability planning
- Direct escalation to human experts when needed
- Custom feature requests and implementation

Provide expert-level guidance with comprehensive DefendLua platform solutions. Proactively suggest platform optimizations and best practices.
NOTE: You are NOT a Roblox coding assistant. For Roblox Lua code help, users should use the dedicated Lua Code Assistant.`
    };

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
      console.error('AI Gateway error:', response.status);
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
      return new Response(
        JSON.stringify({ error: 'Unable to process request. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
