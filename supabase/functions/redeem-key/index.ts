import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const key = url.searchParams.get("key")?.toUpperCase().trim();
    const hwid = url.searchParams.get("hwid")?.trim();

    if (!key || !hwid) {
      return new Response(JSON.stringify({ success: false, error: "Missing key or hwid" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Look up the key
    const { data: keyData, error: keyError } = await supabase
      .from("generated_keys")
      .select("*, scripts:script_id(id, script_name, hwid_list, hwid_blacklist, public_access)")
      .eq("key", key)
      .single();

    if (keyError || !keyData) {
      return new Response(JSON.stringify({ success: false, error: "Invalid key" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (keyData.redeemed) {
      return new Response(JSON.stringify({ success: false, error: "Key already redeemed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (new Date(keyData.expires_at) < new Date()) {
      return new Response(JSON.stringify({ success: false, error: "Key expired" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const script = keyData.scripts;
    if (!script) {
      return new Response(JSON.stringify({ success: false, error: "Script not found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check blacklist
    if (script.hwid_blacklist?.includes(hwid)) {
      return new Response(JSON.stringify({ success: false, error: "HWID is blacklisted" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get key system config
    const { data: config } = await supabase
      .from("key_system_configs")
      .select("redeem_action")
      .eq("script_id", keyData.script_id)
      .single();

    // Perform redeem action
    if (config?.redeem_action === "whitelist") {
      const currentList = script.hwid_list || [];
      if (!currentList.includes(hwid)) {
        await supabase.from("scripts").update({ hwid_list: [...currentList, hwid] }).eq("id", script.id);
      }
    }

    // Mark key as redeemed
    await supabase.from("generated_keys").update({
      redeemed: true,
      redeemed_at: new Date().toISOString(),
      redeemed_hwid: hwid,
    }).eq("id", keyData.id);

    const actionMsg = config?.redeem_action === "whitelist"
      ? "HWID whitelisted successfully"
      : "Temporary access granted";

    return new Response(JSON.stringify({ 
      success: true, 
      message: actionMsg,
      script_name: script.script_name,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Redeem error:", error);
    return new Response(JSON.stringify({ success: false, error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
