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

    // Get client IP address from request headers
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    console.log('Request details:', { scriptId, hwid: hwid ? 'provided' : 'missing', clientIp });

    // Fetch script with HWID and IP verification
    const { data: script, error } = await supabaseAdmin
      .from('scripts')
      .select('script_key, hwid_list, ip_list, script_name')
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

    // Dual Protection: HWID + IP Whitelist
    const hwidList = script.hwid_list || [];
    const ipList = script.ip_list || [];
    
    const isHwidWhitelisted = hwidList.includes(hwid);
    const isIpWhitelisted = ipList.length === 0 || ipList.includes(clientIp);

    // Both HWID and IP must be authorized
    if (!isHwidWhitelisted || !isIpWhitelisted) {
      const reason = !isHwidWhitelisted ? 'HWID not authorized' : 'IP address not authorized';
      console.log('Access denied:', { scriptId, reason, hwid, clientIp, allowedHwids: hwidList.length, allowedIps: ipList.length });
      return new Response(
        `-- ⛔ ACCESS DENIED ⛔\n-- FORBIDDEN: ${reason}\n-- Your IP: ${clientIp}\n-- This access attempt has been logged\n-- Contact the script owner to request authorization`,
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' } 
        }
      );
    }

    console.log('Script execution authorized:', { scriptId, scriptName: script.script_name, hwid, clientIp });

    // Return script for execution (protected by HWID whitelist)
    return new Response(
      script.script_key,
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-cache',
          'X-Protected-By': 'DefendLua'
        } 
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
