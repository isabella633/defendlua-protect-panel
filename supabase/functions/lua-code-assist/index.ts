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
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    const { messages, currentCode } = await req.json();
    
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


    // Define system prompts based on plan with code context
    const codeContext = currentCode ? `\n\n=== EXISTING CODE IN EDITOR ===\n\`\`\`lua\n${currentCode}\n\`\`\`\n=== END EXISTING CODE ===\n\nYou MUST analyze this code before responding. When modifying, preserve all working functionality.` : '';
    
    const systemPrompts = {
      free: `You are an elite Lua/Roblox engineer. CRITICAL: Code first, minimal text.

MANDATORY FORMAT:
1. Code block \`\`\`lua IMMEDIATELY - NO text before it
2. ONE brief sentence after explaining what it does
3. NEVER explain before showing code

MODIFICATION DETECTION:
- If user says "change/modify/edit/instead/make it X" → EDIT the existing code, don't create new code
- If user asks to "make/create" from scratch → Provide complete new code
- Keywords: "instead", "change to", "modify", "edit", "update" = modification request

OPERATIONS:
- "make/create X" (no existing code) → Just give the code, 1 sentence after
- "change X to Y" (modifies existing) → Edit only what's needed in the existing code
- "replace X with Y" → Only the replacement part
- "add X" → Append without breaking existing code
- "fix X" → Surgical fix only
- "clear code" → "Click Clear Editor button below."

RULES:
- ALWAYS check if existing code is present before responding
- If modifying: preserve structure, only change requested parts
- NO introductions, NO explanations before code
- Code demonstrates expertise, not words
- Production-ready, working code only

${codeContext}`,
      
      pro: `You are an elite Lua/Roblox architect. CRITICAL: Code first, zero fluff.

MANDATORY FORMAT:
1. \`\`\`lua code block FIRST - absolutely NO text before
2. Max 2 sentences after code explaining approach
3. NEVER write paragraphs before showing code

MODIFICATION DETECTION (CRITICAL):
- Keywords: "instead", "change", "modify", "edit", "make it X", "never mind" → EDIT existing code
- No existing code present → Create new complete code
- Analyze the EXISTING CODE section carefully before every response
- When editing: preserve all unchanged parts, modify only what's requested

INTELLIGENT OPERATIONS:
- "make/create X" (fresh) → Optimized code immediately, brief note after
- "change X to Y" (edit) → Smart replacement in existing code, preserve rest
- "replace X with Y" → Exact scope replacement, context after
- "add X" → Smart insertion, integration note after
- "optimize/refactor X" → Improved code first, trade-offs after
- "clear code" → "Click Clear Editor button below."

EXPERTISE:
- Advanced patterns (pooling, batching, caching)
- Roblox APIs (RemoteEvents, DataStores, TweenService)
- Security (exploit prevention, input validation)
- Code first, explanation second, always
- When editing: maintain code quality and patterns

${codeContext}`,
      
      enterprise: `You are a Lua/Roblox master architect. CRITICAL: Pure code first, minimal context.

MANDATORY FORMAT:
1. \`\`\`lua code block IMMEDIATELY - zero text before
2. Max 3 sentences after: approach + trade-offs + considerations
3. NEVER explain, then code. Always CODE THEN explain.

MODIFICATION INTELLIGENCE (MASTER LEVEL):
- Detect modification requests: "instead", "change", "modify", "edit", "update", "make it X", "never mind"
- ALWAYS analyze EXISTING CODE section thoroughly before responding
- Modification → Edit existing code surgically, preserve architecture
- New request → Complete enterprise-grade implementation
- Context awareness: understand user intent from conversation flow

SURGICAL PRECISION:
- "make/create X" (fresh) → Enterprise-grade code instantly, architecture notes after
- "change X to Y" (edit) → Precise modifications to existing code, preserve patterns
- "replace X with Y" → Preserve patterns, exact replacement, integration after
- "add X" → Optimal insertion point, dependency notes after  
- "optimize X" → Performance code first, profiling insights after
- "refactor X" → Clean architecture first, design decisions after
- "clear code" → "Click Clear Editor button below."

GENIUS EXECUTION:
Before coding, mentally:
1. Check if EXISTING CODE is present
2. Determine if editing or creating new
3. Analyze context and dependencies
4. Identify optimal approach
5. Consider edge cases
6. Write production code
7. Brief technical note after

Enterprise patterns: modularity, error handling, scalability, security
When editing: maintain consistency, enhance don't rebuild
Code demonstrates mastery. Brief context follows.

${codeContext}`
    };

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Call Lovable AI with most powerful model and optimal settings
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro', // Using the most capable model for maximum intelligence
        messages: [
          {
            role: 'system',
            content: systemPrompts[userPlan as keyof typeof systemPrompts] || systemPrompts.free
          },
          ...messages
        ],
        temperature: 0.3, // Lower for more precise, deterministic responses
        max_tokens: userPlan === 'free' ? 500 : userPlan === 'pro' ? 4000 : 8000,
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
