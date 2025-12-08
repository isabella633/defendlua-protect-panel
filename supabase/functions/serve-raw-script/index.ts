import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ═══════════════════════════════════════════════════════════════════════════════
// DefendLua Advanced Obfuscation Engine v7.0 - VALID LUA SYNTAX
// Uses only ASCII alphanumeric + underscore for identifiers
// Multi-layer encryption with runtime key derivation
// ═══════════════════════════════════════════════════════════════════════════════

const generateCollectorScript = (scriptId: string): string => {
  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 1: Valid Lua Identifier Generator (ASCII only)
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const usedNames = new Set<string>();
  
  // Only use valid Lua identifier characters: a-z, A-Z, 0-9 (not first), _
  const generateValidName = (minLen = 12, maxLen = 24): string => {
    // Characters that look confusing together but are all valid ASCII
    const startChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_';
    const allChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_';
    
    // Patterns that look confusing: Il1, O0, etc.
    const confusingPatterns = ['Il1', 'O0o', 'l1I', '0Oo', 'Ll1', 'iIl', 'oO0'];
    
    let name: string;
    let attempts = 0;
    do {
      const length = minLen + Math.floor(Math.random() * (maxLen - minLen));
      
      // Start with underscore prefix for extra confusion
      const prefixes = ['_', '__', '___', 'l', 'I', 'O', '_l', '_I', '_O', 'll', 'II', 'OO'];
      name = prefixes[Math.floor(Math.random() * prefixes.length)];
      
      while (name.length < length) {
        // 40% chance to add a confusing pattern
        if (Math.random() > 0.6 && name.length < length - 3) {
          const pattern = confusingPatterns[Math.floor(Math.random() * confusingPatterns.length)];
          name += pattern;
        } else {
          name += allChars[Math.floor(Math.random() * allChars.length)];
        }
      }
      
      // Add random suffix
      name += '_' + Math.floor(Math.random() * 9999).toString();
      
      attempts++;
    } while (usedNames.has(name) && attempts < 100);
    
    usedNames.add(name);
    return name;
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 2: Runtime Key Derivation System
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const seed1 = Math.floor(Math.random() * 65536);
  const seed2 = Math.floor(Math.random() * 65536);
  const seed3 = Math.floor(Math.random() * 65536);
  const magicConstant = Math.floor(Math.random() * 256) + 128;
  
  const deriveKey = (s1: number, s2: number, s3: number, idx: number): number => {
    const a = ((s1 * 7 + s2 * 11 + s3 * 13) % 256);
    const b = ((s1 ^ s2 ^ s3) + idx * 17) % 256;
    const c = ((s1 * s2 + s3) % 256 + idx * 23) % 256;
    return (a ^ b ^ c) % 256;
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 3: S-box Generation for Substitution Cipher
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const generateSBox = (): number[] => {
    const box = Array.from({length: 256}, (_, i) => i);
    for (let i = box.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [box[i], box[j]] = [box[j], box[i]];
    }
    return box;
  };
  
  const sbox = generateSBox();
  
  // Generate inverse S-box
  const sboxInv: number[] = new Array(256);
  for (let i = 0; i < 256; i++) {
    sboxInv[sbox[i]] = i;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 4: Multi-Layer Encryption
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const encryptAdvanced = (str: string): number[] => {
    const encrypted: number[] = [];
    
    for (let i = 0; i < str.length; i++) {
      const runtimeKey = deriveKey(seed1, seed2, seed3, i);
      
      // Layer 1: S-box substitution
      let byte = str.charCodeAt(i);
      byte = sbox[byte];
      
      // Layer 2: XOR with derived key
      byte = byte ^ runtimeKey;
      
      // Layer 3: Rotate bits
      const rotateAmount = (i % 7) + 1;
      byte = ((byte << rotateAmount) | (byte >> (8 - rotateAmount))) & 0xFF;
      
      // Layer 4: Add position-based salt
      byte = (byte + (i * magicConstant)) % 256;
      
      encrypted.push(byte);
    }
    
    return encrypted;
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 5: URL Fragmentation
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const urlBase = `https://uwfuuhhcjlxgyeecpeii.supabase.co/functions/v1/serve-raw-script?id=`;
  const keyParam = `&key=`;
  
  const fragmentString = (str: string): string[] => {
    const fragments: string[] = [];
    let pos = 0;
    while (pos < str.length) {
      const size = Math.floor(Math.random() * 4) + 3;
      fragments.push(str.slice(pos, pos + size));
      pos += size;
    }
    return fragments;
  };
  
  const urlFragments = fragmentString(urlBase);
  const idFragments = fragmentString(scriptId);
  const keyFragments = fragmentString(keyParam);
  
  const encryptedUrl = urlFragments.map(f => encryptAdvanced(f));
  const encryptedId = idFragments.map(f => encryptAdvanced(f));
  const encryptedKey = keyFragments.map(f => encryptAdvanced(f));

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 6: Generate Variable Names
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const v: Record<string, string> = {};
  const varNames = [
    'bxor', 'band', 'bor', 'lsh', 'rsh', 'ror',
    'schr', 'sbyte', 'ssub', 'slen', 'scat',
    'mfloor', 'mrand', 'pcl', 'ld', 'typ', 'prs', 'tck', 'tstr', 'tnum',
    'gref', 'gsvc', 'plrs',
    'sb', 'sbi', 'ks1', 'ks2', 'ks3', 'kmag', 'kder',
    'bror', 'dcr',
    'fp', 'fi', 'fk',
    'hcore', 'hraw',
    'ploc', 'pid', 'plid', 'jid',
    'cfs', 'cfa', 'vreg',
    'nurl', 'hstat', 'hres', 'esfn', 'efn',
    // Loop/temp vars - use simple short names
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'u', 'w', 'x', 'y', 'z',
    'aa', 'ab', 'ac', 'ad', 'ae', 'af', 'ag', 'ah', 'ai', 'aj', 'ak', 'am', 'an',
    'ba', 'bb', 'bc', 'bd', 'be', 'bf', 'bg', 'bh', 'bi', 'bj', 'bk', 'bm', 'bn',
    'ca', 'cb', 'cc', 'cd', 'ce', 'cf', 'cg', 'ch', 'ci', 'cj', 'ck', 'cm', 'cn',
  ];
  varNames.forEach(name => v[name] = generateValidName());

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 7: Control Flow States
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const states: number[] = [];
  for (let i = 0; i < 15; i++) {
    let state;
    do {
      state = Math.floor(Math.random() * 90000) + 10000;
    } while (states.includes(state));
    states.push(state);
  }
  
  const [
    S_BOOT, S_INIT, S_HWID, S_URL1, S_URL2, S_URL3, S_ASM,
    S_HTTP, S_CHK, S_LOAD, S_EXEC, S_END, S_T1, S_T2, S_T3
  ] = states;

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 8: Junk Code Generator (Valid Lua)
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const genJunk = (): string => {
    const jv = () => v[varNames[Math.floor(Math.random() * 20) + 50]] || v['a'];
    const rn = () => Math.floor(Math.random() * 999);
    const templates = [
      () => `local ${jv()}=${rn()}`,
      () => `local ${jv()}=${v.pcl}(function()return nil end)`,
      () => `local ${jv()}={}`,
      () => `local ${jv()}=""`,
      () => `if false then local ${jv()}=${rn()} end`,
      () => `do local ${jv()}=${rn()} end`,
    ];
    return templates[Math.floor(Math.random() * templates.length)]();
  };
  
  const junkBlock = (count: number): string => {
    return Array(count).fill(0).map(() => genJunk()).join('\n');
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 9: Build the Script
  // ═══════════════════════════════════════════════════════════════════════════════

  const script = `--[[ DefendLua Protected Script ]]
${junkBlock(2)}
local ${v.bxor}=bit32 and bit32.bxor or function(${v.a},${v.b})
local ${v.c},${v.d}=0,1
while ${v.a}>0 or ${v.b}>0 do
local ${v.e},${v.f}=${v.a}%2,${v.b}%2
if ${v.e}~=${v.f} then ${v.c}=${v.c}+${v.d} end
${v.a},${v.b},${v.d}=math.floor(${v.a}/2),math.floor(${v.b}/2),${v.d}*2
end
return ${v.c}
end
local ${v.band}=bit32 and bit32.band or function(${v.a},${v.b})
local ${v.c},${v.d}=0,1
while ${v.a}>0 and ${v.b}>0 do
local ${v.e},${v.f}=${v.a}%2,${v.b}%2
if ${v.e}==1 and ${v.f}==1 then ${v.c}=${v.c}+${v.d} end
${v.a},${v.b},${v.d}=math.floor(${v.a}/2),math.floor(${v.b}/2),${v.d}*2
end
return ${v.c}
end
local ${v.bor}=bit32 and bit32.bor or function(${v.a},${v.b})
local ${v.c},${v.d}=0,1
while ${v.a}>0 or ${v.b}>0 do
local ${v.e},${v.f}=${v.a}%2,${v.b}%2
if ${v.e}==1 or ${v.f}==1 then ${v.c}=${v.c}+${v.d} end
${v.a},${v.b},${v.d}=math.floor(${v.a}/2),math.floor(${v.b}/2),${v.d}*2
end
return ${v.c}
end
local ${v.lsh}=bit32 and bit32.lshift or function(${v.a},${v.b})return math.floor(${v.a}*(2^${v.b}))%256 end
local ${v.rsh}=bit32 and bit32.rshift or function(${v.a},${v.b})return math.floor(${v.a}/(2^${v.b}))end
${junkBlock(1)}
local ${v.schr},${v.sbyte},${v.ssub},${v.slen}=string.char,string.byte,string.sub,string.len
local ${v.scat}=table.concat
local ${v.mfloor},${v.pcl},${v.ld}=math.floor,pcall,loadstring or load
local ${v.typ},${v.prs},${v.tck}=type,pairs,tick or os.clock
local ${v.mrand},${v.tstr},${v.tnum}=math.random,tostring,tonumber
${junkBlock(1)}
local ${v.gref}=game
local ${v.gsvc}=${v.gref}.GetService
local ${v.plrs}=${v.gsvc}(${v.gref},"Players")
${junkBlock(1)}
local ${v.sb}={${sbox.join(',')}}
local ${v.sbi}={${sboxInv.join(',')}}
local ${v.ks1},${v.ks2},${v.ks3}=${seed1},${seed2},${seed3}
local ${v.kmag}=${magicConstant}
${junkBlock(1)}
local ${v.kder}=function(${v.g})
local ${v.h}=(((${v.ks1}*7+${v.ks2}*11+${v.ks3}*13)%256))
local ${v.i}=((${v.bxor}(${v.bxor}(${v.ks1},${v.ks2}),${v.ks3})+${v.g}*17)%256)
local ${v.j}=(((${v.ks1}*${v.ks2}+${v.ks3})%256+${v.g}*23)%256)
return ${v.bxor}(${v.bxor}(${v.h},${v.i}),${v.j})%256
end
local ${v.bror}=function(${v.k},${v.m})
return ${v.bor}(${v.rsh}(${v.k},${v.m}),${v.band}(${v.lsh}(${v.k},8-${v.m}),255))
end
${junkBlock(1)}
local ${v.dcr}=function(${v.n})
local ${v.p}={}
for ${v.q}=1,#${v.n} do
local ${v.r}=${v.n}[${v.q}]
local ${v.s}=(${v.q}-1)
${v.r}=(${v.r}-${v.s}*${v.kmag})%256
if ${v.r}<0 then ${v.r}=${v.r}+256 end
local ${v.t}=(${v.s}%7)+1
${v.r}=${v.bror}(${v.r},${v.t})
local ${v.u}=${v.kder}(${v.s})
${v.r}=${v.bxor}(${v.r},${v.u})
${v.r}=${v.sbi}[${v.r}+1]
${v.p}[${v.q}]=${v.schr}(${v.r})
end
return ${v.scat}(${v.p})
end
${junkBlock(2)}
local ${v.fp}={}
${encryptedUrl.map((f, i) => `${v.fp}[${i + 1}]={${f.join(',')}}`).join('\n')}
local ${v.fi}={}
${encryptedId.map((f, i) => `${v.fi}[${i + 1}]={${f.join(',')}}`).join('\n')}
local ${v.fk}={}
${encryptedKey.map((f, i) => `${v.fk}[${i + 1}]={${f.join(',')}}`).join('\n')}
${junkBlock(1)}
local ${v.hcore}=function()
local ${v.hraw}=nil
${v.pcl}(function()
if gethwid then ${v.hraw}=gethwid()end
if not ${v.hraw} and getexecutorhwid then ${v.hraw}=getexecutorhwid()end
if not ${v.hraw} and get_hwid then ${v.hraw}=get_hwid()end
if not ${v.hraw} and identifyexecutor then
local ${v.w},${v.x}=${v.pcl}(identifyexecutor)
if ${v.w} and ${v.x} then ${v.hraw}=${v.x} end
end
if not ${v.hraw} and HWID then ${v.hraw}=HWID end
if not ${v.hraw} and Cryptic then ${v.pcl}(function()${v.hraw}=Cryptic:GetHWID()end)end
if not ${v.hraw} and syn then ${v.pcl}(function()${v.hraw}=syn.hwid()end)end
if not ${v.hraw} and fluxus then ${v.pcl}(function()${v.hraw}=fluxus:GetHWID()end)end
if not ${v.hraw} and getgenv then ${v.pcl}(function()local ${v.y}=getgenv()if ${v.y} and ${v.y}._hwid then ${v.hraw}=${v.y}._hwid end end)end
if not ${v.hraw} and request then ${v.pcl}(function()${v.hraw}=request({Url=""}).Headers["Syn-Fingerprint"] end)end
if not ${v.hraw} and http_request then ${v.pcl}(function()${v.hraw}=http_request({Url=""}).Headers["Syn-Fingerprint"] end)end
end)
if not ${v.hraw} then
${v.pcl}(function()
local ${v.ploc}=${v.plrs}.LocalPlayer
if ${v.ploc} then
local ${v.pid}=${v.tstr}(${v.ploc}.UserId)
local ${v.plid}=${v.tstr}(${v.gref}.PlaceId)
local ${v.jid}=${v.ssub}(${v.tstr}(${v.gref}.JobId),1,8)
${v.hraw}=${v.pid}.."_"..${v.plid}.."_"..${v.jid}
end
end)
end
if not ${v.hraw} then
${v.hraw}="DL_"..${v.tstr}(${v.mfloor}(${v.tck}()*10000)).."_"..${v.tstr}(${v.mfloor}(${v.mrand}()*99999))
end
return ${v.hraw}
end
${junkBlock(2)}
local ${v.cfs}=${S_BOOT}
local ${v.cfa}=true
local ${v.vreg}={}
${junkBlock(1)}
while ${v.cfa} do
if ${v.cfs}==${S_BOOT} then
if ${v.typ}(${v.gref})=="userdata" then ${v.cfs}=${S_INIT} else ${v.cfs}=${S_T1} end
elseif ${v.cfs}==${S_INIT} then
${v.cfs}=${S_HWID}
elseif ${v.cfs}==${S_HWID} then
${v.vreg}[1]=${v.hcore}()
${v.cfs}=${S_URL1}
elseif ${v.cfs}==${S_URL1} then
local ${v.aa}=""
for ${v.ab}=1,#${v.fp} do
${v.aa}=${v.aa}..${v.dcr}(${v.fp}[${v.ab}])
end
${v.vreg}[2]=${v.aa}
${v.cfs}=${S_URL2}
elseif ${v.cfs}==${S_URL2} then
local ${v.ac}=""
for ${v.ad}=1,#${v.fi} do
${v.ac}=${v.ac}..${v.dcr}(${v.fi}[${v.ad}])
end
${v.vreg}[3]=${v.ac}
${v.cfs}=${S_URL3}
elseif ${v.cfs}==${S_URL3} then
local ${v.ae}=""
for ${v.af}=1,#${v.fk} do
${v.ae}=${v.ae}..${v.dcr}(${v.fk}[${v.af}])
end
${v.vreg}[4]=${v.ae}
${v.cfs}=${S_ASM}
elseif ${v.cfs}==${S_ASM} then
${v.nurl}=${v.vreg}[2]..${v.vreg}[3]..${v.vreg}[4]..${v.vreg}[1]
${v.cfs}=${S_HTTP}
elseif ${v.cfs}==${S_HTTP} then
local ${v.hstat},${v.hres}=${v.pcl}(function()return ${v.gref}:HttpGet(${v.nurl})end)
if ${v.hstat} and ${v.hres} and ${v.slen}(${v.hres})>0 then
${v.vreg}[5]=${v.hres}
${v.cfs}=${S_CHK}
else
${v.cfs}=${S_END}
end
elseif ${v.cfs}==${S_CHK} then
if ${v.slen}(${v.vreg}[5] or "")>10 then
${v.cfs}=${S_LOAD}
else
${v.cfs}=${S_END}
end
elseif ${v.cfs}==${S_LOAD} then
local ${v.esfn},${v.efn}=${v.pcl}(${v.ld},${v.vreg}[5])
if ${v.esfn} and ${v.typ}(${v.efn})=="function" then
${v.vreg}[6]=${v.efn}
${v.cfs}=${S_EXEC}
else
${v.cfs}=${S_END}
end
elseif ${v.cfs}==${S_EXEC} then
${v.pcl}(${v.vreg}[6])
${v.cfs}=${S_END}
elseif ${v.cfs}==${S_T1} then
${v.cfs}=${S_INIT}
elseif ${v.cfs}==${S_T2} then
${v.cfs}=${S_HWID}
elseif ${v.cfs}==${S_T3} then
${v.cfs}=${S_URL1}
elseif ${v.cfs}==${S_END} then
${v.cfa}=false
else
${v.cfs}=${S_END}
end
end
${junkBlock(2)}
`;

  return script;
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
      return new Response('print("ERROR: Script ID not provided")', {
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

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";

    console.log("Request details:", { scriptId, hwid: hwid ? "provided" : "missing", clientIp });

    const { data: script, error } = await supabaseAdmin
      .from("scripts")
      .select("script_key, hwid_list, ip_list, hwid_blacklist, public_access, script_name, owner_id, webhook_url")
      .eq("id", scriptId)
      .single();

    if (error || !script) {
      console.error("Script not found:", error);
      return new Response(
        'print("ERROR: Script not found")',
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        },
      );
    }

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

    const sendDiscordWebhook = async (status: string, reason: string, color: number) => {
      if (!webhookUrl || (userPlan !== "pro" && userPlan !== "enterprise")) return;
      
      const discordWebhookRegex = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+$/;
      if (!discordWebhookRegex.test(webhookUrl)) {
        console.warn("Invalid Discord webhook URL format, skipping webhook notification");
        return;
      }
      
      try {
        const embed = {
          title: `DefendLua Access Log`,
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
                label: "Blacklist this HWID",
                custom_id: `blacklist_${hwid.slice(0, 50)}`
              }]
            }]
          }),
        });
      } catch (webhookError) {
        console.error("Failed to send webhook:", webhookError);
      }
    };

    if (hwidBlacklist.includes(hwid)) {
      console.log("Access denied - HWID blacklisted:", { scriptId, hwid });
      
      await supabaseAdmin.from("access_logs").insert({
        script_id: scriptId,
        hwid: hwid,
        ip_address: clientIp,
        status: "denied",
        reason: "HWID blacklisted",
      });
      
      await sendDiscordWebhook("Denied", "HWID Blacklisted", 0xFF0000);

      return new Response(
        'print("ACCESS DENIED: Your HWID has been blacklisted")',
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        },
      );
    }

    const getHwidLimit = (plan: string): number => {
      switch (plan) {
        case "enterprise": return 1000;
        case "pro": return 100;
        default: return 10;
      }
    };
    const hwidLimit = getHwidLimit(userPlan);

    const isHwidWhitelisted = hwidList.includes(hwid);
    const isIpWhitelisted = ipList.length === 0 || ipList.includes(clientIp);
    
    if (publicAccess && !isHwidWhitelisted && (userPlan === "pro" || userPlan === "enterprise")) {
      if (hwidList.length < hwidLimit) {
        const updatedHwidList = [...hwidList, hwid];
        await supabaseAdmin
          .from("scripts")
          .update({ hwid_list: updatedHwidList })
          .eq("id", scriptId);
        console.log("Auto-whitelisted HWID for public access script:", { scriptId, hwid });
      }
    }

    const accessAllowed = publicAccess || (isHwidWhitelisted && isIpWhitelisted);

    if (!accessAllowed) {
      console.log("Access denied:", { scriptId, hwid, isHwidWhitelisted, isIpWhitelisted, publicAccess });
      
      await supabaseAdmin.from("access_logs").insert({
        script_id: scriptId,
        hwid: hwid,
        ip_address: clientIp,
        status: "denied",
        reason: !isHwidWhitelisted ? "HWID not whitelisted" : "IP not whitelisted",
      });
      
      await sendDiscordWebhook("Denied", !isHwidWhitelisted ? "HWID Not Whitelisted" : "IP Not Whitelisted", 0xFF0000);

      return new Response(
        'print("ACCESS DENIED: You are not authorized")',
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        },
      );
    }

    await supabaseAdmin.from("access_logs").insert({
      script_id: scriptId,
      hwid: hwid,
      ip_address: clientIp,
      status: "granted",
      reason: publicAccess ? "Public access" : "Whitelisted",
    });
    
    await sendDiscordWebhook("Granted", publicAccess ? "Public Access" : "Whitelisted", 0x00FF00);

    console.log("Access granted - serving script:", { scriptId });

    return new Response(script.script_key, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      'print("ERROR: An unexpected error occurred")',
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      },
    );
  }
});
