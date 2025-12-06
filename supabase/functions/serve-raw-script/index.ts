import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Moonsec/LuArmor-style heavy obfuscation for collector script
const generateCollectorScript = (scriptId: string) => {
  // String encryption using XOR cipher with rotating key
  const encryptString = (str: string, key: number): number[] => {
    const chars: number[] = [];
    for (let i = 0; i < str.length; i++) {
      chars.push(str.charCodeAt(i) ^ ((key + i * 7) % 256));
    }
    return chars;
  };

  const key = Math.floor(Math.random() * 200) + 50;
  const scriptIdEnc = encryptString(scriptId, key);
  const urlBase = encryptString(`https://uwfuuhhcjlxgyeecpeii.supabase.co/functions/v1/serve-raw-script?id=`, key);
  const keyParam = encryptString(`&key=`, key);
  
  // Generate random variable names - MUST start with a letter
  const randVar = () => {
    const startChars = 'IlOQZXYWVUCqzxywvuc'; // Letters only for start
    const midChars = 'Il1O0QqZzXxYyWwVvUuCc'; // Can include confusing chars after
    let result = startChars[Math.floor(Math.random() * startChars.length)];
    for (let i = 0; i < 8 + Math.floor(Math.random() * 5); i++) {
      result += midChars[Math.floor(Math.random() * midChars.length)];
    }
    return result;
  };

  // Create all variable names upfront
  const vars: Record<string, string> = {};
  const varNames = [
    'xorFn', 'chrFn', 'concatFn', 'keyVal', 'scriptIdData', 'urlData', 'keyParamData',
    'decryptFn', 'resultArr', 'idx', 'val', 'gameRef', 'svcFn', 'playersRef', 'playerRef',
    'hwidVal', 'getHwidFn', 'tostrFn', 'floorFn', 'tickFn', 'pcallFn', 'loadstrFn', 
    'warnFn', 'execFn', 'urlStr', 'respStr', 'successBool', 'funcRef', 'errMsg',
    'junkA', 'junkB', 'loopIdx', 'tempVar', 'coroRef'
  ];
  varNames.forEach(name => vars[name] = randVar());

  // Build the obfuscated Lua script - clean and valid syntax
  return `local ${vars.xorFn}=bit32 and bit32.bxor or function(a,b)
local r,p=0,1
while a>0 or b>0 do
local x,y=a%2,b%2
if x~=y then r=r+p end
a,b,p=math.floor(a/2),math.floor(b/2),p*2
end
return r
end
local ${vars.chrFn}=string.char
local ${vars.concatFn}=table.concat
local ${vars.tostrFn}=tostring
local ${vars.floorFn}=math.floor
local ${vars.tickFn}=tick or os.clock
local ${vars.pcallFn}=pcall
local ${vars.loadstrFn}=loadstring
local ${vars.warnFn}=warn or print
local ${vars.gameRef}=game
local ${vars.svcFn}=${vars.gameRef}.GetService
local ${vars.playersRef}=${vars.svcFn}(${vars.gameRef},"Players")
local ${vars.keyVal}=${key}
local ${vars.scriptIdData}={${scriptIdEnc.join(',')}}
local ${vars.urlData}={${urlBase.join(',')}}
local ${vars.keyParamData}={${keyParam.join(',')}}
local ${vars.decryptFn}=function(${vars.tempVar})
local ${vars.resultArr}={}
for ${vars.idx}=1,#${vars.tempVar} do
local ${vars.val}=${vars.tempVar}[${vars.idx}]
${vars.resultArr}[${vars.idx}]=${vars.chrFn}(${vars.xorFn}(${vars.val},(${vars.keyVal}+(${vars.idx}-1)*7)%256))
end
return ${vars.concatFn}(${vars.resultArr})
end
local ${vars.getHwidFn}=function()
local ${vars.hwidVal}=nil
${vars.pcallFn}(function()
if gethwid then ${vars.hwidVal}=gethwid() end
if not ${vars.hwidVal} and getexecutorhwid then ${vars.hwidVal}=getexecutorhwid() end
if not ${vars.hwidVal} and HWID then ${vars.hwidVal}=HWID end
end)
if not ${vars.hwidVal} then
${vars.pcallFn}(function()
local ${vars.playerRef}=${vars.playersRef}.LocalPlayer
if ${vars.playerRef} then
${vars.hwidVal}=${vars.tostrFn}(${vars.playerRef}.UserId).."_"..${vars.tostrFn}(${vars.gameRef}.PlaceId)
end
end)
end
if not ${vars.hwidVal} then
${vars.hwidVal}="FB_"..${vars.tostrFn}(${vars.floorFn}(${vars.tickFn}()*1000))
end
return ${vars.hwidVal}
end
local ${vars.execFn}=function()
local ${vars.hwidVal}=${vars.getHwidFn}()
local ${vars.urlStr}=${vars.decryptFn}(${vars.urlData})..${vars.decryptFn}(${vars.scriptIdData})..${vars.decryptFn}(${vars.keyParamData})..${vars.hwidVal}
local ${vars.successBool},${vars.respStr}=${vars.pcallFn}(function()
return ${vars.gameRef}:HttpGet(${vars.urlStr})
end)
if ${vars.successBool} and ${vars.respStr} then
local ${vars.funcRef},${vars.errMsg}=${vars.loadstrFn}(${vars.respStr})
if ${vars.funcRef} then
${vars.funcRef}()
else
${vars.warnFn}("[DefendLua] "..${vars.tostrFn}(${vars.errMsg} or "Error"))
end
else
${vars.warnFn}("[DefendLua] Request failed")
end
end
local ${vars.coroRef}=coroutine.create(${vars.execFn})
coroutine.resume(${vars.coroRef})
`;
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
      
      const collectorScript = generateCollectorScript(scriptId);
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
      .select("script_key, hwid_list, ip_list, hwid_blacklist, public_access, script_name, owner_id, webhook_url")
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
    const webhookUrl = (script as any).webhook_url;

    // Helper function to send Discord webhook
    const sendDiscordWebhook = async (status: string, reason: string, color: number) => {
      if (!webhookUrl || (userPlan !== "pro" && userPlan !== "enterprise")) return;
      
      try {
        const embed = {
          title: `🛡️ DefendLua Access Log`,
          description: `**Script:** ${script.script_name}`,
          color: color,
          fields: [
            { name: "Status", value: status, inline: true },
            { name: "Reason", value: reason, inline: true },
            { name: "HWID", value: `\`${hwid}\``, inline: false },
            { name: "IP Address", value: `\`${clientIp}\``, inline: true },
            { name: "Script ID", value: `\`${scriptId}\``, inline: true },
          ],
          timestamp: new Date().toISOString(),
          footer: { text: "DefendLua Protection System" }
        };

        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            embeds: [embed],
            components: status === "denied" ? [] : [{
              type: 1,
              components: [{
                type: 2,
                style: 4,
                label: "🚫 Blacklist this HWID",
                custom_id: `blacklist_${scriptId}_${hwid}`
              }]
            }]
          })
        });
        console.log("Discord webhook sent successfully");
      } catch (webhookError) {
        console.error("Failed to send Discord webhook:", webhookError);
      }
    };

    // Helper function to log access attempts
    const logAccess = async (status: string, reason?: string) => {
      await supabaseAdmin.from("access_logs").insert({
        script_id: scriptId,
        hwid,
        ip_address: clientIp,
        status,
        reason,
      });

      // Send Discord webhook for Pro/Enterprise users
      const color = status === "allowed" ? 0x00ff00 : 0xff0000; // Green for allowed, red for denied
      await sendDiscordWebhook(status.toUpperCase(), reason || "N/A", color);
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
        case "free":
          return 10;
        case "pro":
          return 100;
        case "enterprise":
          return 999999; // effectively unlimited
        default:
          return 10;
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
