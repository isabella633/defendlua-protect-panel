import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const scriptId = url.pathname.split('/').pop();
    const hwid = url.searchParams.get('key') || url.searchParams.get('hwid');

    console.log('Raw script request:', { scriptId, hwid: hwid ? 'provided' : 'missing' });

    if (!scriptId) {
      return new Response(
        '-- Error: Script ID not provided',
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' } 
        }
      );
    }

    if (!hwid) {
      return new Response(
        '-- ⛔ ACCESS DENIED ⛔\n-- UNAUTHORIZED: This script is protected by DefendLua\n-- Authentication required: Add ?key=YOUR_HWID to access\n-- Contact script owner for authorization',
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' } 
        }
      );
    }

    // Create Supabase client with service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch script with HWID verification
    const { data: script, error } = await supabaseAdmin
      .from('scripts')
      .select('script_key, hwid_list, script_name')
      .eq('id', scriptId)
      .single();

    if (error || !script) {
      console.error('Script not found:', error);
      return new Response(
        '-- ⛔ ACCESS DENIED ⛔\n-- ERROR: Script not found or does not exist\n-- This access attempt has been logged',
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' } 
        }
      );
    }

    // MAXIMUM SECURITY: Deny all access attempts
    console.log('Access denied (maximum security mode):', { scriptId, scriptName: script.script_name, hwid });
    return new Response(
      '-- ⛔ ACCESS DENIED ⛔\n-- MAXIMUM SECURITY: This script is protected by DefendLua\n-- Direct raw access is disabled for all users\n-- This access attempt has been logged\n-- Please use the authorized client application',
      { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' } 
      }
    );

  } catch (error) {
    console.error('Error serving raw script:', error);
    return new Response(
      '-- Error: Internal server error',
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' } 
      }
    );
  }
});
