import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ═══════════════════════════════════════════════════════════════════════════════
// MoonSec-Style Obfuscated Loader Generator v5.0 - EXTREME EDITION
// Multi-layer virtualization with control flow flattening
// ═══════════════════════════════════════════════════════════════════════════════

const generateCollectorScript = (scriptId: string): string => {
  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 1: Advanced Encryption Engine
  // ═══════════════════════════════════════════════════════════════════════════════
  
  // Multi-layer XOR with prime rotation, fibonacci shift, and salt cascade
  const encryptStringAdvanced = (str: string, keys: number[]): number[] => {
    const encrypted: number[] = [];
    const fib = [1, 1];
    for (let i = 2; i < str.length + 10; i++) fib[i] = (fib[i-1] + fib[i-2]) % 256;
    
    for (let i = 0; i < str.length; i++) {
      const k1 = keys[0];
      const k2 = keys[1];
      const k3 = keys[2];
      const fibShift = fib[i % fib.length];
      const primeRotation = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29][i % 10];
      const cascadeKey = (k1 + (i * k2) + (fibShift * k3) + primeRotation) % 256;
      
      // Triple XOR with bit manipulation
      let byte = str.charCodeAt(i);
      byte = byte ^ cascadeKey;
      byte = byte ^ ((k1 * (i + 1)) % 256);
      byte = byte ^ (((k2 + k3) * primeRotation) % 256);
      encrypted.push(byte);
    }
    return encrypted;
  };

  // Generate cryptographic constants
  const genPrime = () => [31, 37, 41, 43, 47, 53, 59, 61, 67, 71][Math.floor(Math.random() * 10)];
  const k1 = Math.floor(Math.random() * 200) + 50;
  const k2 = genPrime();
  const k3 = Math.floor(Math.random() * 100) + 20;
  const keys = [k1, k2, k3];

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 2: Variable Obfuscation Engine - Maximum Confusion
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const usedNames = new Set<string>();
  const generateObfuscatedName = (minLen = 16, maxLen = 28): string => {
    // Unicode confusables + standard confusing chars
    const startChars = 'IlOoQqZzXxYyWwVvUuCcKkSsPpBbDdGgJjNnMmRrTtFfHhLl';
    const bodyChars = 'Il1O0QqZzXxYyWwVvUuCcKkSsPpBbDdGgJjNnMmRrTtFfHhLl_';
    
    let name: string;
    let attempts = 0;
    do {
      const length = minLen + Math.floor(Math.random() * (maxLen - minLen));
      name = startChars[Math.floor(Math.random() * startChars.length)];
      for (let i = 1; i < length; i++) {
        // Occasionally add double characters for confusion
        if (Math.random() > 0.7) {
          const char = bodyChars[Math.floor(Math.random() * bodyChars.length)];
          name += char + char;
          i++;
        } else {
          name += bodyChars[Math.floor(Math.random() * bodyChars.length)];
        }
      }
      attempts++;
    } while (usedNames.has(name) && attempts < 100);
    
    usedNames.add(name);
    return name;
  };

  // Generate massive variable pool
  const v: Record<string, string> = {};
  const varList = [
    // Core VM
    'vm_state', 'vm_pc', 'vm_stack', 'vm_memory', 'vm_opcodes', 'vm_dispatch', 'vm_execute',
    'vm_reg_a', 'vm_reg_b', 'vm_reg_c', 'vm_reg_d', 'vm_flags', 'vm_jump_table',
    // Crypto
    'crypto_key1', 'crypto_key2', 'crypto_key3', 'crypto_fib', 'crypto_prime', 'crypto_cascade',
    'decrypt_fn', 'decrypt_result', 'decrypt_idx', 'decrypt_byte', 'decrypt_temp', 'decrypt_xor',
    // String table (virtualized)
    'str_table', 'str_decode', 'str_index', 'str_cache', 'str_builder',
    // Data segments (encoded)
    'data_seg_1', 'data_seg_2', 'data_seg_3', 'data_seg_4', 'data_seg_5',
    // Core functions (aliased)
    'fn_xor', 'fn_chr', 'fn_concat', 'fn_byte', 'fn_len', 'fn_sub', 'fn_type',
    'fn_tostr', 'fn_floor', 'fn_random', 'fn_tick', 'fn_pcall', 'fn_loadstr',
    'fn_warn', 'fn_pairs', 'fn_ipairs', 'fn_select', 'fn_unpack', 'fn_rawget',
    // Game refs
    'ref_game', 'ref_svc', 'ref_players', 'ref_player', 'ref_http', 'ref_run',
    // HWID
    'hwid_val', 'hwid_fn', 'hwid_check', 'hwid_fallback', 'hwid_parts',
    // Execution
    'exec_main', 'exec_url', 'exec_full', 'exec_resp', 'exec_ok', 'exec_fn', 'exec_err',
    // Control flow
    'cf_state', 'cf_next', 'cf_table', 'cf_dispatch', 'cf_loop', 'cf_condition',
    // Opaque predicates
    'op_pred_1', 'op_pred_2', 'op_pred_3', 'op_pred_4', 'op_result',
    // Coroutine
    'coro_thread', 'coro_result', 'coro_err', 'coro_wrap',
    // Junk (massive pool)
    ...Array(50).fill(0).map((_, i) => `junk_${i}`),
    // Loops
    ...Array(20).fill(0).map((_, i) => `loop_${i}`),
    // Temps
    ...Array(30).fill(0).map((_, i) => `tmp_${i}`),
    // Anti-analysis
    'anti_debug', 'anti_tamper', 'env_check', 'integrity', 'checksum', 'watermark'
  ];
  varList.forEach(name => v[name] = generateObfuscatedName());

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 3: Encrypt All Strings with Segmentation
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const urlBase = `https://uwfuuhhcjlxgyeecpeii.supabase.co/functions/v1/serve-raw-script?id=`;
  const keyParam = `&key=`;
  
  // Split URL into segments for extra confusion
  const urlPart1 = urlBase.slice(0, 20);
  const urlPart2 = urlBase.slice(20, 45);
  const urlPart3 = urlBase.slice(45);
  
  const enc1 = encryptStringAdvanced(urlPart1, keys);
  const enc2 = encryptStringAdvanced(urlPart2, keys);
  const enc3 = encryptStringAdvanced(urlPart3, keys);
  const encId = encryptStringAdvanced(scriptId, keys);
  const encKey = encryptStringAdvanced(keyParam, keys);

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 4: Opaque Predicates Generator
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const genOpaquePredicate = (): string => {
    const predicates = [
      `(${v.tmp_0}*${v.tmp_0})>=(0)`,
      `(${Math.floor(Math.random()*100)}*0)==0`,
      `(${v.fn_type}(${v.ref_game})=="userdata")`,
      `(${v.fn_floor}(${Math.random().toFixed(6)})==0)`,
      `((${v.tmp_1} or 0)+(${v.tmp_2} or 0))>=-1`,
      `(${v.fn_len}("")==0)`,
      `(${v.fn_type}(${v.fn_pcall})=="function")`,
    ];
    return predicates[Math.floor(Math.random() * predicates.length)];
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 5: Control Flow Flattening State Machine
  // ═══════════════════════════════════════════════════════════════════════════════
  
  // Generate random state IDs
  const states = Array(12).fill(0).map(() => Math.floor(Math.random() * 9000) + 1000);
  const [S_INIT, S_DECRYPT, S_HWID, S_BUILD_URL, S_REQUEST, S_LOAD, S_EXECUTE, S_END, S_JUNK1, S_JUNK2, S_JUNK3, S_ANTI] = states;

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 6: Advanced Junk Code Generator
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const junkPool: string[] = [];
  const genJunk = () => {
    const templates = [
      // Dead metamethod
      () => `local ${v[`junk_${Math.floor(Math.random()*20)}`]}=setmetatable({},{__index=function()return 0 end})`,
      // Recursive nothing
      () => `local ${v[`junk_${Math.floor(Math.random()*20)+20}`]};${v[`junk_${Math.floor(Math.random()*20)+20}`]}=function()if false then ${v[`junk_${Math.floor(Math.random()*20)+20}`]}()end end`,
      // Ghost coroutine
      () => `local ${v[`junk_${Math.floor(Math.random()*10)+30}`]}=coroutine.create(function()while false do coroutine.yield(0)end end)`,
      // Phantom closure
      () => `local ${v[`junk_${Math.floor(Math.random()*10)+40}`]}=(function(...)local ${v.tmp_5}=0;for ${v.loop_0}=1,${v.fn_select}("#",...)do ${v.tmp_5}=${v.tmp_5}+0 end;return ${v.tmp_5} end)(${Array(5).fill(0).map(() => Math.floor(Math.random()*999)).join(',')})`,
      // Fake environment manipulation
      () => `local ${v[`junk_${Math.floor(Math.random()*5)}`]}=getfenv and getfenv(0) or _G;${v[`junk_${Math.floor(Math.random()*5)}`]}[""]=nil`,
      // Dead pcall chain
      () => `${v.fn_pcall}(function()${v.fn_pcall}(function()${v.fn_pcall}(function()return 0 end)end)end)`,
      // Opaque calculation
      () => `local ${v[`loop_${Math.floor(Math.random()*10)}`]}=${v.fn_floor}((${Math.random().toFixed(8)}*0)+(${Math.random().toFixed(8)}*0))`,
      // Fake string operations
      () => `local ${v[`tmp_${Math.floor(Math.random()*10)+10}`]}=${v.fn_sub}("",1,0)..${v.fn_sub}("",1,0)`,
      // Dead conditional
      () => `if(${v.fn_floor}(0.${Math.floor(Math.random()*9999999)})==${Math.floor(Math.random()*999)+1})then local ${v[`tmp_${Math.floor(Math.random()*10)+20}`]}=${Math.floor(Math.random()*99999)} end`,
      // Noise table
      () => `local ${v[`junk_${Math.floor(Math.random()*5)+5}`]}={[${Math.floor(Math.random()*999)}]=${Math.floor(Math.random()*999)},[${Math.floor(Math.random()*999)}]=${Math.floor(Math.random()*999)},[${Math.floor(Math.random()*999)}]=${Math.floor(Math.random()*999)}}`,
    ];
    return templates[Math.floor(Math.random() * templates.length)]();
  };
  
  // Pre-generate junk pool
  for (let i = 0; i < 30; i++) junkPool.push(genJunk());
  const getJunkBlock = (count: number) => {
    const selected: string[] = [];
    for (let i = 0; i < count; i++) {
      selected.push(junkPool[Math.floor(Math.random() * junkPool.length)]);
    }
    return selected.join('\n');
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 7: Generate the VM-Style Obfuscated Script
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const header = `--[[${'▓'.repeat(70)}]]
--[[${'░'.repeat(70)}]]
--[[  ${Array(64).fill(0).map(() => String.fromCharCode(33 + Math.floor(Math.random() * 93))).join('')}  ]]
--[[${'░'.repeat(70)}]]
--[[${'▓'.repeat(70)}]]`;

  const script = `${header}
${getJunkBlock(3)}
local ${v.fn_xor}=bit32 and bit32.bxor or function(${v.tmp_0},${v.tmp_1})
local ${v.tmp_2},${v.tmp_3}=0,1
while ${v.tmp_0}>0 or ${v.tmp_1}>0 do
local ${v.tmp_4},${v.tmp_5}=${v.tmp_0}%2,${v.tmp_1}%2
if ${v.tmp_4}~=${v.tmp_5} then ${v.tmp_2}=${v.tmp_2}+${v.tmp_3} end
${v.tmp_0},${v.tmp_1},${v.tmp_3}=${v.fn_floor}(${v.tmp_0}/2),${v.fn_floor}(${v.tmp_1}/2),${v.tmp_3}*2
end
return ${v.tmp_2}
end
${getJunkBlock(2)}
local ${v.fn_chr},${v.fn_concat},${v.fn_byte},${v.fn_len},${v.fn_sub}=string.char,table.concat,string.byte,string.len,string.sub
local ${v.fn_tostr},${v.fn_floor},${v.fn_random},${v.fn_tick}=tostring,math.floor,math.random,tick or os.clock
local ${v.fn_pcall},${v.fn_loadstr},${v.fn_warn},${v.fn_type}=pcall,loadstring,warn or print,type
local ${v.fn_pairs},${v.fn_ipairs},${v.fn_select},${v.fn_unpack}=pairs,ipairs,select,unpack or table.unpack
local ${v.fn_rawget}=rawget
${getJunkBlock(2)}
local ${v.ref_game}=game
local ${v.ref_svc}=${v.ref_game}.GetService
local ${v.ref_players}=${v.ref_svc}(${v.ref_game},"Players")
${getJunkBlock(2)}
local ${v.crypto_key1},${v.crypto_key2},${v.crypto_key3}=${k1},${k2},${k3}
local ${v.crypto_fib}={1,1}
for ${v.loop_1}=3,50 do ${v.crypto_fib}[${v.loop_1}]=(${v.crypto_fib}[${v.loop_1}-1]+${v.crypto_fib}[${v.loop_1}-2])%256 end
local ${v.crypto_prime}={2,3,5,7,11,13,17,19,23,29}
${getJunkBlock(3)}
local ${v.data_seg_1}={${enc1.join(',')}}
local ${v.data_seg_2}={${enc2.join(',')}}
local ${v.data_seg_3}={${enc3.join(',')}}
local ${v.data_seg_4}={${encId.join(',')}}
local ${v.data_seg_5}={${encKey.join(',')}}
${getJunkBlock(2)}
local ${v.decrypt_fn}=function(${v.decrypt_temp})
local ${v.decrypt_result}={}
for ${v.decrypt_idx}=1,#${v.decrypt_temp} do
local ${v.decrypt_byte}=${v.decrypt_temp}[${v.decrypt_idx}]
local ${v.loop_2}=${v.crypto_fib}[(${v.decrypt_idx}-1)%#${v.crypto_fib}+1]
local ${v.loop_3}=${v.crypto_prime}[(${v.decrypt_idx}-1)%10+1]
local ${v.crypto_cascade}=(${v.crypto_key1}+((${v.decrypt_idx}-1)*${v.crypto_key2})+(${v.loop_2}*${v.crypto_key3})+${v.loop_3})%256
${v.decrypt_byte}=${v.fn_xor}(${v.decrypt_byte},${v.crypto_cascade})
${v.decrypt_byte}=${v.fn_xor}(${v.decrypt_byte},(${v.crypto_key1}*${v.decrypt_idx})%256)
${v.decrypt_byte}=${v.fn_xor}(${v.decrypt_byte},((${v.crypto_key2}+${v.crypto_key3})*${v.loop_3})%256)
${v.decrypt_result}[${v.decrypt_idx}]=${v.fn_chr}(${v.decrypt_byte})
end
return ${v.fn_concat}(${v.decrypt_result})
end
${getJunkBlock(3)}
local ${v.op_pred_1}=function()return(${genOpaquePredicate()})end
local ${v.op_pred_2}=function()return(${genOpaquePredicate()})end
local ${v.op_pred_3}=function()return(${genOpaquePredicate()})end
${getJunkBlock(2)}
local ${v.anti_tamper}=(function()
local ${v.tmp_6}=0
for ${v.loop_4}=1,${k1} do ${v.tmp_6}=${v.tmp_6}+1 end
return ${v.tmp_6}==${k1}
end)()
local ${v.env_check}=(function()
return ${v.fn_type}(${v.ref_game})=="userdata" and ${v.fn_type}(${v.ref_game}.GetService)=="function"
end)()
local ${v.integrity}=(function()
return ${v.fn_type}(${v.fn_loadstr})=="function" and ${v.fn_type}(${v.fn_pcall})=="function"
end)()
if not(${v.anti_tamper} and ${v.env_check} and ${v.integrity})then return end
${getJunkBlock(4)}
local ${v.hwid_fn}=function()
local ${v.hwid_val}=nil
local ${v.hwid_parts}={}
${v.fn_pcall}(function()
if gethwid then ${v.hwid_val}=gethwid()end
if not ${v.hwid_val} and getexecutorhwid then ${v.hwid_val}=getexecutorhwid()end
if not ${v.hwid_val} and get_hwid then ${v.hwid_val}=get_hwid()end
if not ${v.hwid_val} and identifyexecutor then
local ${v.tmp_7},${v.tmp_8}=${v.fn_pcall}(identifyexecutor)
if ${v.tmp_7} and ${v.tmp_8} then ${v.hwid_parts}[1]=${v.tmp_8}end
end
if not ${v.hwid_val} and HWID then ${v.hwid_val}=HWID end
if not ${v.hwid_val} and Cryptic then ${v.fn_pcall}(function()${v.hwid_val}=Cryptic:GetHWID()end)end
if not ${v.hwid_val} and syn then ${v.fn_pcall}(function()${v.hwid_val}=syn.hwid()end)end
if not ${v.hwid_val} and fluxus then ${v.fn_pcall}(function()${v.hwid_val}=fluxus:GetHWID()end)end
if not ${v.hwid_val} and getgenv then ${v.fn_pcall}(function()local ${v.tmp_9}=getgenv()if ${v.tmp_9} and ${v.tmp_9}._hwid then ${v.hwid_val}=${v.tmp_9}._hwid end end)end
end)
if not ${v.hwid_val} then
${v.fn_pcall}(function()
local ${v.ref_player}=${v.ref_players}.LocalPlayer
if ${v.ref_player} then
local ${v.tmp_10}=${v.fn_tostr}(${v.ref_player}.UserId)
local ${v.tmp_11}=${v.fn_tostr}(${v.ref_game}.PlaceId)
local ${v.tmp_12}=${v.fn_sub}(${v.fn_tostr}(${v.ref_game}.JobId),1,8)
${v.hwid_val}=${v.tmp_10}.."_"..${v.tmp_11}.."_"..${v.tmp_12}
end
end)
end
if not ${v.hwid_val} then
${v.hwid_val}="DL_"..${v.fn_tostr}(${v.fn_floor}(${v.fn_tick}()*10000)).."_"..${v.fn_tostr}(${v.fn_floor}(${v.fn_random}()*99999))
end
return ${v.hwid_val}
end
${getJunkBlock(4)}
local ${v.cf_state}=${S_INIT}
local ${v.vm_reg_a},${v.vm_reg_b},${v.vm_reg_c},${v.vm_reg_d}=nil,nil,nil,nil
local ${v.cf_loop}=true
${getJunkBlock(2)}
while ${v.cf_loop} do
${getJunkBlock(1)}
if ${v.cf_state}==${S_INIT} then
if ${v.op_pred_1}()then
${v.cf_state}=${S_HWID}
else
${v.cf_state}=${S_JUNK1}
end
elseif ${v.cf_state}==${S_HWID} then
${v.vm_reg_a}=${v.hwid_fn}()
${v.cf_state}=${S_DECRYPT}
elseif ${v.cf_state}==${S_DECRYPT} then
local ${v.str_builder}={}
${v.str_builder}[1]=${v.decrypt_fn}(${v.data_seg_1})
${v.str_builder}[2]=${v.decrypt_fn}(${v.data_seg_2})
${v.str_builder}[3]=${v.decrypt_fn}(${v.data_seg_3})
${v.vm_reg_b}=${v.fn_concat}(${v.str_builder})
${v.vm_reg_c}=${v.decrypt_fn}(${v.data_seg_4})
${v.vm_reg_d}=${v.decrypt_fn}(${v.data_seg_5})
${v.cf_state}=${S_BUILD_URL}
elseif ${v.cf_state}==${S_BUILD_URL} then
${v.exec_url}=${v.vm_reg_b}..${v.vm_reg_c}..${v.vm_reg_d}..${v.vm_reg_a}
if ${v.op_pred_2}()then
${v.cf_state}=${S_REQUEST}
else
${v.cf_state}=${S_JUNK2}
end
elseif ${v.cf_state}==${S_REQUEST} then
local ${v.exec_ok},${v.exec_resp}=${v.fn_pcall}(function()
return ${v.ref_game}:HttpGet(${v.exec_url})
end)
if ${v.exec_ok} and ${v.exec_resp} and ${v.fn_len}(${v.exec_resp})>0 then
${v.vm_reg_a}=${v.exec_resp}
${v.cf_state}=${S_LOAD}
else
${v.cf_state}=${S_END}
end
elseif ${v.cf_state}==${S_LOAD} then
local ${v.exec_ok},${v.exec_fn}=${v.fn_pcall}(${v.fn_loadstr},${v.vm_reg_a})
if ${v.exec_ok} and ${v.fn_type}(${v.exec_fn})=="function" then
${v.vm_reg_b}=${v.exec_fn}
${v.cf_state}=${S_EXECUTE}
else
${v.cf_state}=${S_END}
end
elseif ${v.cf_state}==${S_EXECUTE} then
${v.fn_pcall}(${v.vm_reg_b})
${v.cf_state}=${S_END}
elseif ${v.cf_state}==${S_JUNK1} then
${getJunkBlock(2)}
${v.cf_state}=${S_HWID}
elseif ${v.cf_state}==${S_JUNK2} then
${getJunkBlock(2)}
${v.cf_state}=${S_REQUEST}
elseif ${v.cf_state}==${S_JUNK3} then
${getJunkBlock(1)}
${v.cf_state}=${S_ANTI}
elseif ${v.cf_state}==${S_ANTI} then
if not ${v.op_pred_3}()then ${v.cf_state}=${S_JUNK3} else ${v.cf_state}=${S_END} end
elseif ${v.cf_state}==${S_END} then
${v.cf_loop}=false
else
${v.cf_state}=${S_END}
end
end
${getJunkBlock(3)}
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

    // Helper function to send Discord webhook with URL validation
    const sendDiscordWebhook = async (status: string, reason: string, color: number) => {
      if (!webhookUrl || (userPlan !== "pro" && userPlan !== "enterprise")) return;
      
      // Validate Discord webhook URL to prevent SSRF
      const discordWebhookRegex = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+$/;
      if (!discordWebhookRegex.test(webhookUrl)) {
        console.warn("Invalid Discord webhook URL format, skipping webhook notification");
        return;
      }
      
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
