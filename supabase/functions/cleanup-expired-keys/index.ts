import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find all expired, redeemed keys that have an HWID
    const { data: expiredKeys, error: fetchError } = await supabase
      .from("generated_keys")
      .select("id, script_id, redeemed_hwid")
      .eq("redeemed", true)
      .not("redeemed_hwid", "is", null)
      .lt("expires_at", new Date().toISOString());

    if (fetchError) {
      console.error("Error fetching expired keys:", fetchError);
      return new Response(JSON.stringify({ error: "Failed to fetch expired keys" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!expiredKeys || expiredKeys.length === 0) {
      return new Response(JSON.stringify({ message: "No expired keys to clean up", removed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Group expired HWIDs by script_id
    const scriptHwids = new Map<string, string[]>();
    for (const key of expiredKeys) {
      if (!key.redeemed_hwid) continue;
      const existing = scriptHwids.get(key.script_id) || [];
      existing.push(key.redeemed_hwid);
      scriptHwids.set(key.script_id, existing);
    }

    let totalRemoved = 0;

    // For each script, remove expired HWIDs from hwid_list
    for (const [scriptId, hwidsToRemove] of scriptHwids) {
      const { data: script, error: scriptError } = await supabase
        .from("scripts")
        .select("hwid_list")
        .eq("id", scriptId)
        .single();

      if (scriptError || !script) continue;

      const currentList: string[] = script.hwid_list || [];
      const hwidSet = new Set(hwidsToRemove);
      
      // Only keep HWIDs that are NOT in the expired set,
      // UNLESS they also have a non-expired valid key
      const { data: activeKeys } = await supabase
        .from("generated_keys")
        .select("redeemed_hwid")
        .eq("script_id", scriptId)
        .eq("redeemed", true)
        .not("redeemed_hwid", "is", null)
        .gte("expires_at", new Date().toISOString());

      const activeHwids = new Set((activeKeys || []).map(k => k.redeemed_hwid).filter(Boolean));

      const newList = currentList.filter(hwid => {
        // Keep if not in expired set, or if it has another active key
        if (!hwidSet.has(hwid)) return true;
        if (activeHwids.has(hwid)) return true;
        totalRemoved++;
        return false;
      });

      if (newList.length !== currentList.length) {
        await supabase
          .from("scripts")
          .update({ hwid_list: newList })
          .eq("id", scriptId);
      }
    }

    // Delete the expired key records to keep the table clean
    const expiredIds = expiredKeys.map(k => k.id);
    await supabase
      .from("generated_keys")
      .delete()
      .in("id", expiredIds);

    console.log(`Cleanup complete: removed ${totalRemoved} expired HWIDs, deleted ${expiredIds.length} expired keys`);

    return new Response(JSON.stringify({ 
      message: "Cleanup complete", 
      removed_hwids: totalRemoved,
      deleted_keys: expiredIds.length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Cleanup error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
