import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RedeemRequest {
  code: string;
}

Deno.serve(async (req) => {
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

    console.log('Auth header present, creating client');

    // Create client with service role for auth verification and data access
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create client for user verification with their JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false }
      }
    );

    console.log('Getting user from JWT');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
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
        JSON.stringify({ error: 'Database error while checking code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!codeData) {
      console.log('Code not found');
      return new Response(
        JSON.stringify({ error: 'Invalid activation code' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate code status
    if (!codeData.is_active) {
      return new Response(
        JSON.stringify({ error: 'This activation code has been deactivated' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (codeData.used_count >= codeData.max_uses) {
      return new Response(
        JSON.stringify({ error: 'This activation code has already been used' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'This activation code has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
        JSON.stringify({ error: 'Failed to update subscription' }),
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
