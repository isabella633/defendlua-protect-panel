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
        'print("⛔ ACCESS DENIED ⛔")\nprint("ERROR: Script ID not provided")',
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' } 
        }
      );
    }

    if (!hwid) {
      return new Response(
        'print("⛔ ACCESS DENIED ⛔")\nprint("UNAUTHORIZED: This script is protected by DefendLua")\nprint("Authentication required: Add ?key=YOUR_HWID to access")\nprint("Contact script owner for authorization")',
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

    // Fetch script data
    const { data: script, error } = await supabaseAdmin
      .from('scripts')
      .select('script_key, hwid_list, ip_list, hwid_blacklist, public_access, script_name, owner_id')
      .eq('id', scriptId)
      .single();

    if (error || !script) {
      console.error('Script not found:', error);
      return new Response(
        'print("⛔ ACCESS DENIED ⛔")\nprint("ERROR: Script not found or does not exist")\nprint("This access attempt has been logged")',
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' } 
        }
      );
    }

    // Fetch owner's subscription plan
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('plan')
      .eq('user_id', script.owner_id)
      .single();

    const userPlan = subscription?.plan || 'free';
    const hwidList = script.hwid_list || [];
    const ipList = script.ip_list || [];
    const hwidBlacklist = script.hwid_blacklist || [];
    const publicAccess = script.public_access || false;

    // Helper function to log access attempts
    const logAccess = async (status: string, reason?: string) => {
      await supabaseAdmin.from('access_logs').insert({
        script_id: scriptId,
        hwid,
        ip_address: clientIp,
        status,
        reason
      });
    };

    // Check blacklist first (applies to all plans)
    if (hwidBlacklist.includes(hwid)) {
      console.log('Access denied - blacklisted:', { scriptId, hwid, clientIp });
      await logAccess('denied', 'HWID blacklisted');
      return new Response(
        `print("⛔ ACCESS DENIED ⛔")\nprint("FORBIDDEN: HWID has been blacklisted")\nprint("Your HWID: ${hwid}")\nprint("Contact the script owner if you believe this is an error")`,
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' } 
        }
      );
    }

    // Check IP whitelist (applies to all plans)
    const isIpWhitelisted = ipList.length === 0 || ipList.includes(clientIp);
    if (!isIpWhitelisted) {
      console.log('Access denied - IP not authorized:', { scriptId, hwid, clientIp });
      await logAccess('denied', 'IP address not authorized');
      return new Response(
        `print("⛔ ACCESS DENIED ⛔")\nprint("FORBIDDEN: IP address not authorized")\nprint("Your HWID: ${hwid}")\nprint("Contact the script owner to request IP whitelist authorization")`,
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' } 
        }
      );
    }

    // Check if HWID is already whitelisted
    const isHwidWhitelisted = hwidList.includes(hwid);
    
    // For Pro/Enterprise with public access enabled, auto-whitelist new HWIDs
    const isProOrEnterprise = userPlan === 'pro' || userPlan === 'enterprise';
    if (isProOrEnterprise && publicAccess && !isHwidWhitelisted) {
      console.log('Auto-whitelisting new HWID:', { scriptId, scriptName: script.script_name, hwid, clientIp, plan: userPlan });
      
      // Add HWID to whitelist
      const updatedHwidList = [...hwidList, hwid];
      await supabaseAdmin
        .from('scripts')
        .update({ hwid_list: updatedHwidList })
        .eq('id', scriptId);
      
      await logAccess('allowed', 'Auto-whitelisted (Public Access)');
    } else if (isProOrEnterprise && publicAccess) {
      console.log('Public access granted (already whitelisted):', { scriptId, scriptName: script.script_name, hwid, clientIp, plan: userPlan });
      await logAccess('allowed', 'Public access (already whitelisted)');
    } else if (!isHwidWhitelisted) {
      // For Free plan OR Pro/Enterprise with public access disabled, deny if not whitelisted
      console.log('Access denied - HWID not authorized:', { scriptId, hwid, clientIp, plan: userPlan });
      await logAccess('denied', 'HWID not authorized');
      return new Response(
        `print("⛔ ACCESS DENIED ⛔")\nprint("FORBIDDEN: HWID not authorized")\nprint("Your HWID: ${hwid}")\nprint("Contact the script owner to request HWID authorization")`,
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' } 
        }
      );
    } else {
      console.log('Script execution authorized:', { scriptId, scriptName: script.script_name, hwid, clientIp, plan: userPlan });
      await logAccess('allowed', 'HWID whitelisted');
    }

    // Return raw script for Roblox execution only
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
      'print("Error: Internal server error")',
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' } 
      }
    );
  }
});
