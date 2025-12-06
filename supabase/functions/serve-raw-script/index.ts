import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ═══════════════════════════════════════════════════════════════════════════════
// MoonSec-Style Obfuscated Loader Generator v4.0
// Professional anti-exploit protection with layered obfuscation
// ═══════════════════════════════════════════════════════════════════════════════

const generateCollectorScript = (scriptId: string): string => {
  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 1: Encryption Engine
  // ─────────────────────────────────────────────────────────────────────────────
  
  // Primary XOR encryption with rotating key and salt
  const encryptString = (str: string, primaryKey: number, salt: number): number[] => {
    const encrypted: number[] = [];
    for (let i = 0; i < str.length; i++) {
      const rotatingKey = (primaryKey + (i * 7) + (salt * 3)) % 256;
      encrypted.push(str.charCodeAt(i) ^ rotatingKey);
    }
    return encrypted;
  };

  // Secondary layer encryption for extra protection
  const encryptWithShuffle = (str: string, key: number): { data: number[], map: number[] } => {
    const encrypted = encryptString(str, key, 13);
    // Create index mapping for shuffle
    const indices = encrypted.map((_, i) => i);
    // Fisher-Yates shuffle with seeded random
    const seededRandom = (seed: number, i: number) => ((seed * 1103515245 + 12345 + i) >>> 16) % 32768;
    for (let i = indices.length - 1; i > 0; i--) {
      const j = seededRandom(key, i) % (i + 1);
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return { data: encrypted, map: indices };
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 2: Variable Name Obfuscation Engine
  // ─────────────────────────────────────────────────────────────────────────────
  
  // MoonSec-style confusing variable names (Il1O0 pattern)
  const usedNames = new Set<string>();
  const generateObfuscatedName = (minLen = 12, maxLen = 18): string => {
    const startChars = 'IlOoQqZzXxYyWwVvUuCc'; // Must start with letter
    const bodyChars = 'Il1O0QqZzXxYyWwVvUuCc_'; // Body can include confusing chars
    
    let name: string;
    let attempts = 0;
    do {
      const length = minLen + Math.floor(Math.random() * (maxLen - minLen));
      name = startChars[Math.floor(Math.random() * startChars.length)];
      for (let i = 1; i < length; i++) {
        name += bodyChars[Math.floor(Math.random() * bodyChars.length)];
      }
      attempts++;
    } while (usedNames.has(name) && attempts < 100);
    
    usedNames.add(name);
    return name;
  };

  // Generate all variable names upfront
  const v: Record<string, string> = {};
  const varList = [
    // Core functions
    'xorFunc', 'chrFunc', 'concatFunc', 'byteFunc', 'lenFunc', 'subFunc',
    // Encryption related
    'primaryKey', 'saltVal', 'decryptFunc', 'decryptResult', 'decryptIdx', 'decryptVal', 'decryptTemp',
    // Data arrays
    'urlData', 'scriptIdData', 'keyParamData', 'hwidPrefixData',
    // Game references
    'gameRef', 'svcFunc', 'playersRef', 'playerRef', 'httpSvc',
    // Utility functions
    'tostrFunc', 'floorFunc', 'randomFunc', 'tickFunc', 'waitFunc',
    'pcallFunc', 'loadstrFunc', 'warnFunc', 'printFunc', 'typeFunc',
    // HWID related
    'hwidVal', 'getHwidFunc', 'hwidFallback', 'hwidCheck',
    // Execution
    'mainExec', 'urlBuilder', 'fullUrl', 'httpResponse', 'successFlag', 'loadedFunc', 'loadErr',
    // Coroutine
    'coroThread', 'coroResult', 'coroErr',
    // Junk variables
    'junk1', 'junk2', 'junk3', 'junk4', 'junk5', 'junk6', 'junk7', 'junk8',
    'deadLoop', 'fakeTable', 'ghostFunc', 'phantomVal', 'shadowArr',
    // Loop variables  
    'loopI', 'loopJ', 'loopK', 'tempA', 'tempB', 'tempC',
    // Anti-tamper
    'integrityCheck', 'envCheck', 'antiDebug'
  ];
  varList.forEach(name => v[name] = generateObfuscatedName());

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 3: Encrypt All Strings
  // ─────────────────────────────────────────────────────────────────────────────
  
  const primaryKey = Math.floor(Math.random() * 200) + 50;
  const saltVal = Math.floor(Math.random() * 50) + 10;
  
  const urlBase = `https://uwfuuhhcjlxgyeecpeii.supabase.co/functions/v1/serve-raw-script?id=`;
  const keyParamStr = `&key=`;
  const hwidPrefix = ``;
  
  const urlEncrypted = encryptString(urlBase, primaryKey, saltVal);
  const scriptIdEncrypted = encryptString(scriptId, primaryKey, saltVal);
  const keyParamEncrypted = encryptString(keyParamStr, primaryKey, saltVal);

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 4: Junk Code Generator
  // ─────────────────────────────────────────────────────────────────────────────
  
  const generateJunkBlock = (complexity: number): string => {
    const blocks: string[] = [];
    
    // Dead loop that does nothing
    blocks.push(`local ${v.junk1}=0;for ${v.loopI}=1,${Math.floor(Math.random() * 20) + 5} do ${v.junk1}=${v.junk1}+(${v.loopI}*0);end`);
    
    // Fake table population
    blocks.push(`local ${v.fakeTable}={};for ${v.loopJ}=1,${Math.floor(Math.random() * 15) + 3} do ${v.fakeTable}[${v.loopJ}]=((${v.loopJ}*${Math.floor(Math.random() * 999)})*0);end`);
    
    // Ghost function that returns nothing useful
    blocks.push(`local ${v.ghostFunc}=(function(${v.tempA},${v.tempB})local ${v.tempC}=(${v.tempA} or 0)+(${v.tempB} or 0);return ${v.tempC}*0;end)`);
    
    // Phantom calculation
    blocks.push(`local ${v.phantomVal}=(function()local ${v.shadowArr}={${Array(8).fill(0).map(() => Math.floor(Math.random() * 999)).join(',')}};local ${v.tempA}=0;for ${v.loopK},${v.tempB} in pairs(${v.shadowArr}) do ${v.tempA}=${v.tempA}+(${v.tempB}*0);end;return ${v.tempA};end)()`);
    
    // Dead coroutine
    blocks.push(`local ${v.junk5}=coroutine.wrap(function()local ${v.junk6}=0;for ${v.loopI}=1,${Math.floor(Math.random() * 5) + 2} do ${v.junk6}=${v.junk6}+0;coroutine.yield();end;return ${v.junk6};end);pcall(function()for ${v.loopJ}=1,${Math.floor(Math.random() * 3) + 1} do ${v.junk5}();end;end)`);
    
    // Math garbage
    blocks.push(`local ${v.junk7}=math.floor(math.random()*0)*${Math.floor(Math.random() * 9999)}`);
    blocks.push(`local ${v.junk8}=(${Math.floor(Math.random() * 999)}*0)+(${Math.floor(Math.random() * 999)}*0)`);
    
    // Shuffle and return based on complexity
    const shuffled = blocks.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(complexity, blocks.length)).join('\n');
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 5: Generate Anti-Tamper Checks
  // ─────────────────────────────────────────────────────────────────────────────
  
  const antiTamperBlock = `
local ${v.integrityCheck}=(function()
local ${v.tempA}=0
for ${v.loopI}=1,${primaryKey} do ${v.tempA}=${v.tempA}+1 end
return ${v.tempA}==${primaryKey}
end)()
local ${v.envCheck}=(function()
return type(game)=="userdata" and type(game.GetService)=="function"
end)()
if not ${v.integrityCheck} or not ${v.envCheck} then return end`;

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 6: Build The Obfuscated Lua Script
  // ─────────────────────────────────────────────────────────────────────────────
  
  const headerComment = `--[[${'═'.repeat(60)}]]
--[[ DefendLua Protection System v4.0 - MoonSec Style ]]
--[[ ${Array(56).fill(0).map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('')} ]]
--[[${'═'.repeat(60)}]]`;

  const luaScript = `${headerComment}
${generateJunkBlock(2)}
local ${v.xorFunc}=bit32 and bit32.bxor or function(${v.tempA},${v.tempB})
local ${v.decryptResult},${v.decryptIdx}=0,1
while ${v.tempA}>0 or ${v.tempB}>0 do
local ${v.loopI},${v.loopJ}=${v.tempA}%2,${v.tempB}%2
if ${v.loopI}~=${v.loopJ} then ${v.decryptResult}=${v.decryptResult}+${v.decryptIdx} end
${v.tempA},${v.tempB},${v.decryptIdx}=math.floor(${v.tempA}/2),math.floor(${v.tempB}/2),${v.decryptIdx}*2
end
return ${v.decryptResult}
end
${generateJunkBlock(2)}
local ${v.chrFunc}=string.char
local ${v.concatFunc}=table.concat
local ${v.byteFunc}=string.byte
local ${v.lenFunc}=string.len
local ${v.subFunc}=string.sub
local ${v.tostrFunc}=tostring
local ${v.floorFunc}=math.floor
local ${v.randomFunc}=math.random
local ${v.tickFunc}=tick or os.clock
local ${v.pcallFunc}=pcall
local ${v.loadstrFunc}=loadstring
local ${v.warnFunc}=warn or print
local ${v.typeFunc}=type
${generateJunkBlock(2)}
local ${v.gameRef}=game
local ${v.svcFunc}=${v.gameRef}.GetService
local ${v.playersRef}=${v.svcFunc}(${v.gameRef},"Players")
${antiTamperBlock}
${generateJunkBlock(3)}
local ${v.primaryKey}=${primaryKey}
local ${v.saltVal}=${saltVal}
local ${v.urlData}={${urlEncrypted.join(',')}}
local ${v.scriptIdData}={${scriptIdEncrypted.join(',')}}
local ${v.keyParamData}={${keyParamEncrypted.join(',')}}
${generateJunkBlock(2)}
local ${v.decryptFunc}=function(${v.decryptTemp})
local ${v.decryptResult}={}
for ${v.decryptIdx}=1,#${v.decryptTemp} do
local ${v.decryptVal}=${v.decryptTemp}[${v.decryptIdx}]
local ${v.loopK}=(${v.primaryKey}+((${v.decryptIdx}-1)*7)+(${v.saltVal}*3))%256
${v.decryptResult}[${v.decryptIdx}]=${v.chrFunc}(${v.xorFunc}(${v.decryptVal},${v.loopK}))
end
return ${v.concatFunc}(${v.decryptResult})
end
${generateJunkBlock(2)}
local ${v.getHwidFunc}=function()
local ${v.hwidVal}=nil
${v.pcallFunc}(function()
if gethwid then ${v.hwidVal}=gethwid() end
if not ${v.hwidVal} and getexecutorhwid then ${v.hwidVal}=getexecutorhwid() end
if not ${v.hwidVal} and get_hwid then ${v.hwidVal}=get_hwid() end
if not ${v.hwidVal} and HWID then ${v.hwidVal}=HWID end
if not ${v.hwidVal} and Cryptic then ${v.pcallFunc}(function() ${v.hwidVal}=Cryptic:GetHWID() end) end
if not ${v.hwidVal} and syn then ${v.pcallFunc}(function() ${v.hwidVal}=syn.hwid() end) end
if not ${v.hwidVal} and fluxus then ${v.pcallFunc}(function() ${v.hwidVal}=fluxus:GetHWID() end) end
end)
if not ${v.hwidVal} then
${v.pcallFunc}(function()
local ${v.playerRef}=${v.playersRef}.LocalPlayer
if ${v.playerRef} then
${v.hwidVal}=${v.tostrFunc}(${v.playerRef}.UserId).."_"..${v.tostrFunc}(${v.gameRef}.PlaceId).."_"..${v.tostrFunc}(${v.gameRef}.JobId):sub(1,8)
end
end)
end
if not ${v.hwidVal} then
${v.hwidVal}="DL_"..${v.tostrFunc}(${v.floorFunc}(${v.tickFunc}()*10000)).."_"..${v.tostrFunc}(${v.floorFunc}(${v.randomFunc}()*99999))
end
return ${v.hwidVal}
end
${generateJunkBlock(3)}
local ${v.mainExec}=function()
local ${v.hwidVal}=${v.getHwidFunc}()
local ${v.urlBuilder}=${v.decryptFunc}(${v.urlData})
local ${v.tempA}=${v.decryptFunc}(${v.scriptIdData})
local ${v.tempB}=${v.decryptFunc}(${v.keyParamData})
local ${v.fullUrl}=${v.urlBuilder}..${v.tempA}..${v.tempB}..${v.hwidVal}
local ${v.successFlag},${v.httpResponse}=${v.pcallFunc}(function()
return ${v.gameRef}:HttpGet(${v.fullUrl})
end)
if ${v.successFlag} and ${v.httpResponse} and ${v.lenFunc}(${v.httpResponse})>0 then
local ${v.loadedFunc},${v.loadErr}=${v.pcallFunc}(${v.loadstrFunc},${v.httpResponse})
if ${v.loadedFunc} and ${v.typeFunc}(${v.loadErr})=="function" then
local ${v.tempC}=${v.pcallFunc}(${v.loadErr})
if not ${v.tempC} then
${v.warnFunc}("[DL] Execution error")
end
else
${v.warnFunc}("[DL] Load error: "..${v.tostrFunc}(${v.loadErr} or "unknown"))
end
else
${v.warnFunc}("[DL] Request failed: "..${v.tostrFunc}(${v.httpResponse} or "timeout"))
end
end
${generateJunkBlock(2)}
local ${v.coroThread}=coroutine.create(${v.mainExec})
local ${v.coroResult},${v.coroErr}=coroutine.resume(${v.coroThread})
if not ${v.coroResult} then ${v.warnFunc}("[DL] "..${v.tostrFunc}(${v.coroErr})) end
`;

  return luaScript;
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
