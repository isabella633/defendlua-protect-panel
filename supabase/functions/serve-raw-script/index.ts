import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const scriptId = url.searchParams.get("id");
    const hwid = url.searchParams.get("key") || url.searchParams.get("hwid");

    if (!scriptId) {
      return new Response('print("⛔ ACCESS DENIED ⛔")\nprint("ERROR: Script ID not provided")', {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    if (!hwid) {
      console.log("Stage 1 - Serving HWID collector:", { scriptId });
      const functionUrl = `${url.origin}/functions/v1/serve-raw-script`;
      
      // Simple HWID collector that extracts hardware info
      const collectorScript = `-- DefendLua HWID Collector
local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")

local function getHWID()
    local hwid = ""
    pcall(function()
        local info = {}
        table.insert(info, tostring(game.PlaceId))
        table.insert(info, tostring(game.JobId))
        if Players.LocalPlayer then
            table.insert(info, tostring(Players.LocalPlayer.UserId))
        end
        local combined = table.concat(info, "-")
        -- Simple hash
        local hash = 0
        for i = 1, #combined do
            hash = (hash * 31 + string.byte(combined, i)) % 2147483647
        end
        hwid = string.format("%08X", hash)
    end)
    return hwid ~= "" and hwid or "UNKNOWN"
end

local hwid = getHWID()
local scriptUrl = "${functionUrl}?id=${scriptId}&hwid=" .. hwid

local success, result = pcall(function()
    local response = game:HttpGet(scriptUrl)
    return response
end)

if success and result then
    local fn, err = loadstring(result)
    if fn then
        fn()
    else
        print("Error loading script: " .. tostring(err))
    end
else
    print("Error fetching script: " .. tostring(result))
end
`;
      return new Response(collectorScript, {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    console.log("Stage 2 - Validating access:", { scriptId, hwid: "provided" });

    // Create Supabase client with service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Get client IP address from request headers
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";

    console.log("Request details:", { scriptId, hwid: hwid ? "provided" : "missing", clientIp });

    // Fetch script data
    const { data: script, error } = await supabaseAdmin
      .from("scripts")
      .select("script_key, hwid_list, ip_list, hwid_blacklist, public_access, script_name, owner_id")
      .eq("id", scriptId)
      .single();

    if (error || !script) {
      console.error("Script not found:", error);
      return new Response(
        'print("⛔ ACCESS DENIED ⛔")\nprint("ERROR: Script not found or does not exist")\nprint("This access attempt has been logged")',
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        },
      );
    }

    // Fetch owner's subscription plan
    const { data: subscription } = await supabaseAdmin
      .from("subscriptions")
      .select("plan")
      .eq("user_id", script.owner_id)
      .single();

    const userPlan = subscription?.plan || "free";
    const hwidList = script.hwid_list || [];
    const ipList = script.ip_list || [];
    const hwidBlacklist = script.hwid_blacklist || [];
    const publicAccess = script.public_access || false;

    // Helper function to log access attempts
    const logAccess = async (status: string, reason?: string) => {
      await supabaseAdmin.from("access_logs").insert({
        script_id: scriptId,
        hwid,
        ip_address: clientIp,
        status,
        reason,
      });
    };

    // Check blacklist first (applies to all plans)
    if (hwidBlacklist.includes(hwid)) {
      console.log("Access denied - blacklisted:", { scriptId, hwid, clientIp });
      await logAccess("denied", "HWID blacklisted");
      return new Response(
        `print("⛔ ACCESS DENIED ⛔")\nprint("FORBIDDEN: HWID has been blacklisted")\nprint("Contact the script owner if you believe this is an error")`,
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        },
      );
    }

    // Check IP whitelist (applies to all plans)
    const isIpWhitelisted = ipList.length === 0 || ipList.includes(clientIp);
    if (!isIpWhitelisted) {
      console.log("Access denied - IP not authorized:", { scriptId, hwid, clientIp });
      await logAccess("denied", "IP address not authorized");
      return new Response(
        `print("⛔ ACCESS DENIED ⛔")\nprint("FORBIDDEN: IP address not authorized")\nprint("Contact the script owner to request IP whitelist authorization")`,
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        },
      );
    }

    // Check if HWID is already whitelisted
    const isHwidWhitelisted = hwidList.includes(hwid);

    // Get HWID limit based on plan
    const getHwidLimit = (plan: string): number => {
      switch (plan) {
        case "free": return 10;
        case "pro": return 100;
        case "enterprise": return 999999; // effectively unlimited
        default: return 10;
      }
    };

    const hwidLimit = getHwidLimit(userPlan);
    const currentHwidCount = hwidList.length;

    // For Pro/Enterprise with public access enabled, auto-whitelist new HWIDs
    const isProOrEnterprise = userPlan === "pro" || userPlan === "enterprise";
    if (isProOrEnterprise && publicAccess && !isHwidWhitelisted) {
      // Check HWID limit before auto-whitelisting
      if (currentHwidCount >= hwidLimit) {
        console.log("HWID limit reached - cannot auto-whitelist:", {
          scriptId,
          hwid,
          clientIp,
          plan: userPlan,
          currentCount: currentHwidCount,
          limit: hwidLimit,
        });
        await logAccess("denied", `HWID limit reached (${currentHwidCount}/${hwidLimit})`);
        return new Response(
          `print("⛔ ACCESS DENIED ⛔")\nprint("HWID limit reached for this script")\nprint("Contact the script owner to upgrade their plan or remove unused HWIDs")`,
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "text/plain" },
          },
        );
      }

      console.log("Auto-whitelisting new HWID:", {
        scriptId,
        scriptName: script.script_name,
        hwid,
        clientIp,
        plan: userPlan,
        hwidCount: `${currentHwidCount + 1}/${hwidLimit}`,
      });

      // Add HWID to whitelist
      const updatedHwidList = [...hwidList, hwid];
      await supabaseAdmin.from("scripts").update({ hwid_list: updatedHwidList }).eq("id", scriptId);

      await logAccess("allowed", "Auto-whitelisted (Public Access)");
    } else if (isProOrEnterprise && publicAccess) {
      console.log("Public access granted (already whitelisted):", {
        scriptId,
        scriptName: script.script_name,
        hwid,
        clientIp,
        plan: userPlan,
      });
      await logAccess("allowed", "Public access (already whitelisted)");
    } else if (!isHwidWhitelisted) {
      // For Free plan OR Pro/Enterprise with public access disabled, deny if not whitelisted
      console.log("Access denied - HWID not authorized:", { scriptId, hwid, clientIp, plan: userPlan });
      await logAccess("denied", "HWID not authorized");
      return new Response(
        `print("⛔ ACCESS DENIED ⛔")\nprint("FORBIDDEN: HWID not authorized")\nprint("Contact the script owner to request HWID authorization")`,
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        },
      );
    } else {
      console.log("Script execution authorized:", {
        scriptId,
        scriptName: script.script_name,
        hwid,
        clientIp,
        plan: userPlan,
      });
      await logAccess("allowed", "HWID whitelisted");
    }

    // Return raw script for Roblox execution only
    return new Response(script.script_key, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
        "X-Protected-By": "DefendLua",
      },
    });
  } catch (error) {
    console.error("Error serving raw script:", error);
    return new Response('print("Error: Internal server error")', {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
});
