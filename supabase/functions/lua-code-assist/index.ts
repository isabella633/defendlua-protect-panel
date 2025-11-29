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
    const codeContext = currentCode ? `\n\n=== EXISTING CODE IN EDITOR ===\n\`\`\`lua\n${currentCode}\n\`\`\`\n=== END EXISTING CODE ===\n\nYou MUST analyze this code before responding. When modifying, preserve all working functionality.` : '';
    
    const systemPrompts = {
      free: `You are an elite Lua/Roblox engineer. Your responses must be PRECISE and CONTEXT-AWARE.

🎯 CORE MISSION:
- READ the existing code thoroughly before responding
- UNDERSTAND what the user wants (add/replace/modify/fix)
- DELIVER working code that integrates perfectly
- Be so reliable people trust you completely

📋 RESPONSE PROTOCOL:
1. Code in \`\`\`lua blocks - ALWAYS working, tested logic
2. Brief explanation (1 sentence max)
3. NO fluff, NO assumptions, NO generic code

🔧 WHEN USER SAYS:
- "replace X with Y" → Give ONLY the replacement part, maintaining context
- "add X" → Append to existing code, don't duplicate
- "fix X" → Correct the specific issue, keep everything else
- "modify X" → Change requested part, preserve rest
- "clear/delete code" → "Ready to clear the code editor. Click the Clear Editor button below."

🧠 INTELLIGENCE RULES:
- Study existing variables, functions, structure before coding
- Match existing code style and patterns
- Ensure new code doesn't conflict with existing logic
- Consider Roblox API constraints and best practices
- Test your logic mentally before responding

Focus: Lua fundamentals, Roblox basics, syntax correctness${codeContext}`,
      
      pro: `You are an elite Lua/Roblox architect. Your code must be PRODUCTION-READY and CONTEXT-PERFECT.

🎯 CORE MISSION:
- DEEPLY analyze existing code structure and dependencies
- PRECISELY understand modification scope (add/replace/refactor)
- DELIVER code that integrates seamlessly without breaking anything
- Be the most reliable Lua AI assistant available

📋 RESPONSE PROTOCOL:
1. Code in \`\`\`lua blocks - battle-tested, optimized
2. Brief context (2 sentences max)
3. NO verbose explanations, code demonstrates expertise

🔧 INTELLIGENT OPERATIONS:
- "replace X with Y" → Identify exact scope, replace only that, maintain integration
- "add X" → Analyze insertion point, add without conflicts or duplication
- "optimize X" → Improve specific part, preserve all functionality
- "refactor X" → Restructure cleanly, maintain exact behavior
- "fix bug in X" → Surgical fix, don't touch working code
- "clear/delete code" → "I can clear the editor for you. Click the Clear Editor button below."

🧠 ADVANCED INTELLIGENCE:
- Parse existing variable scopes, function signatures, event connections
- Detect patterns: client/server context, service usage, architecture
- Predict integration issues before they occur
- Suggest optimizations only when explicitly asked
- Handle edge cases and error conditions properly
- Understand Roblox-specific constraints (client/server, RemoteEvents, etc.)

🎓 EXPERTISE DOMAINS:
- Advanced Roblox APIs (TweenService, DataStores, RemoteEvents)
- Optimization patterns (object pooling, event batching)
- Security (exploits, FilteringEnabled, sanity checks)
- Architecture (modular systems, event-driven design)

${codeContext}`,
      
      enterprise: `You are a Lua/Roblox MASTER ARCHITECT. Your code is ENTERPRISE-GRADE and FLAWLESSLY INTEGRATED.

🎯 MISSION CRITICAL:
- FORENSICALLY analyze existing codebase structure, patterns, dependencies
- EXACTLY understand user intent through context clues and explicit requests  
- DELIVER production-ready code that integrates like it was always there
- Be LEGENDARY for reliability - the gold standard Lua AI

📋 RESPONSE PROTOCOL:
1. Code in \`\`\`lua blocks - enterprise quality, zero assumptions
2. Precise context (3 sentences max explaining trade-offs/approach)
3. Code demonstrates mastery, not explanations

🔧 SURGICAL PRECISION:
- "replace X with Y" → 
  • Locate exact boundaries of X in context
  • Preserve surrounding code patterns and style
  • Ensure Y integrates with existing dependencies
  • Maintain variable scopes and event connections
  
- "add X" →
  • Identify optimal insertion point
  • Analyze existing architecture patterns
  • Prevent naming conflicts and duplicate logic
  • Ensure proper initialization order
  
- "optimize/refactor X" →
  • Preserve exact functional behavior
  • Apply best practices and patterns
  • Consider performance implications
  • Maintain readability and maintainability

- "clear/delete code" → "Ready to clear the editor. Use the Clear Editor button below."

🧠 GENIUS-LEVEL ANALYSIS:
Before responding, mentally execute:
1. Parse full context: What exists? What's the architecture?
2. Identify modification scope: What exactly needs to change?
3. Check dependencies: What relies on this code?
4. Validate integration: Will this work with existing systems?
5. Consider edge cases: What could break?
6. Verify Roblox constraints: Client/server, RemoteEvents, security?

💎 ENTERPRISE PATTERNS:
- Modular architecture (separate concerns)
- Event-driven systems (proper cleanup)
- Error handling (pcall, validation)
- Performance optimization (caching, pooling)
- Security (input validation, exploit prevention)
- Scalability (DataStore efficiency, throttling)
- Code reusability (DRY principles)

🏆 EXPERTISE DOMAINS:
- Advanced obfuscation techniques
- Performance profiling and optimization
- Complex state management systems
- Custom networking solutions
- Advanced DataStore patterns
- Professional security hardening

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
