import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Dynamic CORS based on origin
function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowedOrigins = [
    'https://uwfuuhhcjlxgyeecpeii.lovableproject.com',
    'https://defendlua.lol',
    'https://www.defendlua.lol',
    'https://defendlua-protect-panel.lovable.app',
    'http://localhost:5173',
    'http://localhost:3000',
  ];
  
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

interface RedeemRequest {
  code: string;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting redemption request');
    
    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('No auth header provided');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Auth header present, creating admin client');

    // Create admin client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Verifying user JWT');
    // Extract and verify JWT token using admin client
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(jwt);
    
    if (userError || !user) {
      console.log('User verification failed:', userError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User verified:', user.id);

    // Parse request body
    const { code }: RedeemRequest = await req.json();

    if (!code || !code.trim()) {
      console.log('No code provided in request');
      return new Response(
        JSON.stringify({ error: 'Activation code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Checking activation code:', code.trim());

    // Check if code exists and is valid
    const { data: codeData, error: codeError } = await supabaseAdmin
      .from('activation_codes')
      .select('*')
      .eq('code', code.trim())
      .maybeSingle();

    if (codeError) {
      console.error('Code lookup error:', codeError);
      return new Response(
        JSON.stringify({ error: 'Unable to process request. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use generic error message for all code validation failures to prevent enumeration
    const genericCodeError = { error: 'Invalid or expired activation code' };
    const VALIDATION_DELAY_MS = 200;
    const codeErrorResponse = async (status: number) => {
      // Constant-time delay to prevent timing-based enumeration
      await new Promise(r => setTimeout(r, VALIDATION_DELAY_MS));
      return new Response(
        JSON.stringify(genericCodeError),
        { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    };

    if (!codeData) {
      console.log('Code not found');
      return await codeErrorResponse(400);
    }

    // Validate code status - use same generic message for all failures
    if (!codeData.is_active) {
      console.log('Code deactivated');
      return await codeErrorResponse(400);
    }

    if (codeData.used_count >= codeData.max_uses) {
      console.log('Code max uses reached');
      return await codeErrorResponse(400);
    }

    if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
      console.log('Code expired');
      return await codeErrorResponse(400);
    }

    console.log('Code validated, updating subscription for user:', user.id);

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + codeData.duration_days);

    // Update or create subscription using upsert
    const { error: subError } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        plan: codeData.plan,
        status: 'active',
        activated_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (subError) {
      console.error('Subscription update error:', subError);
      return new Response(
        JSON.stringify({ error: 'Unable to process request. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Increment code usage
    const { error: updateError } = await supabaseAdmin
      .from('activation_codes')
      .update({ used_count: codeData.used_count + 1 })
      .eq('code', code.trim());

    if (updateError) {
      console.error('Code update error:', updateError);
      // Don't fail the whole operation, just log it
    }

    console.log('Activation successful');

    return new Response(
      JSON.stringify({
        success: true,
        plan: codeData.plan,
        duration_days: codeData.duration_days,
        expires_at: expiresAt.toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
