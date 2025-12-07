import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ═══════════════════════════════════════════════════════════════════════════════
// DefendLua Advanced Obfuscation Engine v6.0 - POLYMORPHIC PROTECTION
// Multi-layer virtualization with runtime key derivation, bytecode simulation,
// polymorphic code generation, and anti-static-analysis techniques
// ═══════════════════════════════════════════════════════════════════════════════

const generateCollectorScript = (scriptId: string): string => {
  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 1: Polymorphic Variable Name Generator with Unicode Confusables
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const usedNames = new Set<string>();
  const generateObfuscatedName = (minLen = 18, maxLen = 32): string => {
    // Extended confusable character sets including Cyrillic/Greek lookalikes
    const confusableSets = [
      'Il1|ІіӀ',      // I, l, 1, pipe, Cyrillic І
      'Oo0ОоΟο',      // O, o, 0, Cyrillic О, Greek Ο
      'Ss5ЅѕՏ',       // S, s, 5, Cyrillic Ѕ
      'Cc(СсϲϹ',      // C, c, Cyrillic С, Greek ϲ
      'Pp9РрҎ',       // P, p, Cyrillic Р
      'BbВвΒβ8',      // B, b, Cyrillic В, Greek Β
      'Aa4АаΑα',      // A, a, Cyrillic А, Greek Α
      'Ee3ЕеΕε',      // E, e, Cyrillic Е, Greek Ε
      'HhНнΗη',       // H, h, Cyrillic Н, Greek Η
      'KkКкΚκ',       // K, k, Cyrillic К, Greek Κ
      'MmМмΜμ',       // M, m, Cyrillic М, Greek Μ
      'NnНнΝν',       // N, n, Greek Ν
      'TtТтΤτ',       // T, t, Cyrillic Т, Greek Τ
      'XxХхΧχ',       // X, x, Cyrillic Х, Greek Χ
      'YyУуΥυ',       // Y, y, Cyrillic У, Greek Υ
      'ZzΖζ2',        // Z, z, Greek Ζ
      '_',            // underscore
    ];
    
    let name: string;
    let attempts = 0;
    do {
      const length = minLen + Math.floor(Math.random() * (maxLen - minLen));
      // Start with letter-like character
      const startSet = confusableSets[Math.floor(Math.random() * (confusableSets.length - 1))];
      name = startSet[Math.floor(Math.random() * startSet.length)];
      
      for (let i = 1; i < length; i++) {
        const charSet = confusableSets[Math.floor(Math.random() * confusableSets.length)];
        // Add repetition patterns to increase confusion
        if (Math.random() > 0.75) {
          const char = charSet[Math.floor(Math.random() * charSet.length)];
          name += char + char;
          i++;
        } else {
          name += charSet[Math.floor(Math.random() * charSet.length)];
        }
      }
      attempts++;
    } while (usedNames.has(name) && attempts < 100);
    
    usedNames.add(name);
    return name;
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 2: Runtime Key Derivation System (Keys not stored plaintext)
  // ═══════════════════════════════════════════════════════════════════════════════
  
  // Generate seed values that will be combined at runtime
  const seed1 = Math.floor(Math.random() * 65536);
  const seed2 = Math.floor(Math.random() * 65536);
  const seed3 = Math.floor(Math.random() * 65536);
  const magicConstant = Math.floor(Math.random() * 256) + 128;
  
  // Runtime-derived keys using multiple mathematical operations
  const deriveKey = (s1: number, s2: number, s3: number, idx: number): number => {
    // Complex key derivation that's hard to reverse statically
    const a = ((s1 * 7 + s2 * 11 + s3 * 13) % 256);
    const b = ((s1 ^ s2 ^ s3) + idx * 17) % 256;
    const c = ((s1 * s2 + s3) % 256 + idx * 23) % 256;
    return (a ^ b ^ c) % 256;
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 3: Multi-Layer Encryption with Permutation Tables
  // ═══════════════════════════════════════════════════════════════════════════════
  
  // Generate random permutation table (S-box style)
  const generateSBox = (): number[] => {
    const box = Array.from({length: 256}, (_, i) => i);
    // Fisher-Yates shuffle
    for (let i = box.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [box[i], box[j]] = [box[j], box[i]];
    }
    return box;
  };
  
  const sbox = generateSBox();
  
  // Encrypt with runtime key derivation simulation
  const encryptAdvanced = (str: string): { data: number[], checksum: number } => {
    const encrypted: number[] = [];
    let checksum = 0;
    
    for (let i = 0; i < str.length; i++) {
      // Simulate runtime key derivation
      const runtimeKey = deriveKey(seed1, seed2, seed3, i);
      
      // Layer 1: S-box substitution
      let byte = str.charCodeAt(i);
      byte = sbox[byte];
      
      // Layer 2: Position-dependent XOR with derived key
      byte = byte ^ runtimeKey;
      
      // Layer 3: Rotate bits based on position
      const rotateAmount = (i % 7) + 1;
      byte = ((byte << rotateAmount) | (byte >> (8 - rotateAmount))) & 0xFF;
      
      // Layer 4: Add position-based salt
      byte = (byte + (i * magicConstant)) % 256;
      
      encrypted.push(byte);
      checksum = (checksum + byte * (i + 1)) % 65536;
    }
    
    return { data: encrypted, checksum };
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 4: URL Fragmenter with Red Herrings
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const urlBase = `https://uwfuuhhcjlxgyeecpeii.supabase.co/functions/v1/serve-raw-script?id=`;
  const keyParam = `&key=`;
  
  // Fragment URL into tiny random-sized pieces
  const fragmentString = (str: string): string[] => {
    const fragments: string[] = [];
    let pos = 0;
    while (pos < str.length) {
      const size = Math.floor(Math.random() * 5) + 2; // 2-6 chars per fragment
      fragments.push(str.slice(pos, pos + size));
      pos += size;
    }
    return fragments;
  };
  
  const urlFragments = fragmentString(urlBase);
  const idFragments = fragmentString(scriptId);
  const keyFragments = fragmentString(keyParam);
  
  // Encrypt each fragment separately with different checksums
  const encryptedFragments = {
    url: urlFragments.map(f => encryptAdvanced(f)),
    id: idFragments.map(f => encryptAdvanced(f)),
    key: keyFragments.map(f => encryptAdvanced(f))
  };
  
  // Generate fake URL fragments as red herrings
  const fakeUrls = [
    'https://api.roblox.com/v1/',
    'https://discord.com/api/',
    'https://github.com/raw/',
    'https://pastebin.com/raw/',
  ];
  const fakeFragments = fakeUrls.map(u => fragmentString(u).map(f => encryptAdvanced(f)));

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 5: Generate Variable Pool with Extreme Obfuscation
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const v: Record<string, string> = {};
  const varNames = [
    // Core decryption VM
    'vm_init', 'vm_state', 'vm_exec', 'vm_halt', 'vm_stack', 'vm_mem', 'vm_pc',
    'vm_reg', 'vm_op', 'vm_dispatch', 'vm_bytecode', 'vm_interp',
    // Crypto subsystem
    'sbox', 'sbox_inv', 'key_derive', 'key_seed1', 'key_seed2', 'key_seed3',
    'key_magic', 'decrypt_core', 'decrypt_layer', 'decrypt_rot', 'decrypt_sub',
    // Fragment reconstruction
    'frag_pool', 'frag_order', 'frag_real', 'frag_fake', 'frag_merge',
    'frag_validate', 'frag_checksum', 'frag_selector',
    // String operations (aliased multiple times)
    'str_chr', 'str_byte', 'str_sub', 'str_len', 'str_concat', 'str_rev',
    'fn_chr', 'fn_byte', 'fn_concat', 'fn_floor', 'fn_pcall', 'fn_load',
    'fn_type', 'fn_pairs', 'fn_tick', 'fn_rand', 'fn_tostr', 'fn_tonumber',
    // Bitwise operations (polyfill)
    'bit_xor', 'bit_and', 'bit_or', 'bit_lshift', 'bit_rshift', 'bit_ror', 'bit_rol',
    // Game references (indirected)
    'game_ref', 'svc_get', 'svc_players', 'svc_http', 'svc_run',
    'player_local', 'player_id', 'place_id', 'job_id',
    // HWID system
    'hwid_core', 'hwid_raw', 'hwid_hash', 'hwid_final', 'hwid_probe',
    // Network
    'http_get', 'http_result', 'http_status', 'net_url', 'net_response',
    // Execution
    'exec_payload', 'exec_func', 'exec_result', 'exec_safe', 'exec_wrap',
    // Control flow
    'cf_state', 'cf_table', 'cf_next', 'cf_prev', 'cf_jump', 'cf_active',
    // Anti-analysis
    'anti_debug', 'anti_hook', 'anti_vm', 'env_check', 'integrity_hash',
    'watermark', 'timestamp_check', 'call_depth',
    // Massive junk variable pool
    ...Array(100).fill(0).map((_, i) => `_${i}`),
    ...Array(50).fill(0).map((_, i) => `__${i}`),
    ...Array(30).fill(0).map((_, i) => `___${i}`),
  ];
  varNames.forEach(name => v[name] = generateObfuscatedName());

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 6: Control Flow States with Random Shuffling
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const stateCount = 20;
  const states: number[] = [];
  for (let i = 0; i < stateCount; i++) {
    let state;
    do {
      state = Math.floor(Math.random() * 90000) + 10000;
    } while (states.includes(state));
    states.push(state);
  }
  
  const [
    S_BOOT, S_INIT_SBOX, S_INIT_KEYS, S_PROBE_HWID, S_BUILD_HWID,
    S_DECRYPT_URL, S_DECRYPT_ID, S_DECRYPT_KEY, S_ASSEMBLE_URL,
    S_HTTP_REQ, S_VALIDATE_RESP, S_LOAD_CODE, S_EXECUTE, S_CLEANUP,
    S_END, S_TRAP1, S_TRAP2, S_TRAP3, S_FAKE_REQ, S_ANTI_DEBUG
  ] = states;

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 7: Advanced Junk Code Generator with Semantic Traps
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const genJunk = (): string => {
    const templates = [
      // Fake API calls
      () => `${v.fn_pcall}(function()local ${v[`_${Math.floor(Math.random()*50)}`]}=${v.game_ref}:GetService("ReplicatedStorage")end)`,
      // Fake encryption operations
      () => `local ${v[`__${Math.floor(Math.random()*30)}`]}={}for ${v[`_${Math.floor(Math.random()*50)}`]}=1,${Math.floor(Math.random()*50)+10} do ${v[`__${Math.floor(Math.random()*30)}`]}[${v[`_${Math.floor(Math.random()*50)}`]}]=${v.bit_xor}(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)})end`,
      // Fake string decryption
      () => `local ${v[`___${Math.floor(Math.random()*20)}`]}=""for ${v[`_${Math.floor(Math.random()*50)}`]}=1,0 do ${v[`___${Math.floor(Math.random()*20)}`]}=${v[`___${Math.floor(Math.random()*20)}`]}..${v.str_chr}(${Math.floor(Math.random()*90)+32})end`,
      // Dead metamethod
      () => `local ${v[`_${Math.floor(Math.random()*50)+50}`]}=setmetatable({},{__call=function()return nil end,__index=function()return 0 end})`,
      // Fake checksum validation
      () => `local ${v[`__${Math.floor(Math.random()*30)+20}`]}=0;for ${v[`_${Math.floor(Math.random()*50)}`]},${v[`__${Math.floor(Math.random()*30)}`]} in ${v.fn_pairs}({${Array(5).fill(0).map(() => Math.floor(Math.random()*999)).join(',')}})do ${v[`__${Math.floor(Math.random()*30)+20}`]}=${v[`__${Math.floor(Math.random()*30)+20}`]}+0 end`,
      // Ghost coroutine with delay simulation
      () => `coroutine.wrap(function()for ${v[`_${Math.floor(Math.random()*50)}`]}=1,0 do coroutine.yield()end end)()`,
      // Fake environment manipulation
      () => `${v.fn_pcall}(function()local ${v[`_${Math.floor(Math.random()*50)}`]}=getfenv and getfenv(0)or _G;${v[`_${Math.floor(Math.random()*50)}`]}[""]=nil end)`,
      // Fake HTTP preparation
      () => `local ${v[`___${Math.floor(Math.random()*20)+10}`]}=""..""..""`,
      // Noise calculations that do nothing
      () => `local ${v[`_${Math.floor(Math.random()*50)}`]}=${v.fn_floor}((${Math.random().toFixed(8)}+${Math.random().toFixed(8)})*0)`,
      // Fake table with encrypted-looking data
      () => `local ${v[`__${Math.floor(Math.random()*30)}`]}={${Array(8).fill(0).map(() => Math.floor(Math.random()*256)).join(',')}}`,
    ];
    return templates[Math.floor(Math.random() * templates.length)]();
  };
  
  const junkBlock = (count: number): string => {
    return Array(count).fill(0).map(() => genJunk()).join('\n');
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 8: Opaque Predicates (Always True but Hard to Analyze)
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const opaquePredicates = [
    () => `(${v.fn_type}(${v.game_ref})=="userdata")`,
    () => `(${v.fn_floor}(0.${Math.floor(Math.random()*999999)})==0)`,
    () => `(${v.fn_type}(${v.fn_pcall})=="function")`,
    () => `((${v[`_${Math.floor(Math.random()*50)}`]} or 0)>=0)`,
    () => `(${v.str_len}("")==0)`,
    () => `((${seed1}+${seed2})>0)`,
    () => `(${v.fn_type}({})=="table")`,
    () => `(${v.fn_tonumber}("0")==0)`,
  ];
  const getOpaque = () => opaquePredicates[Math.floor(Math.random() * opaquePredicates.length)]();

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 9: Generate Inverse S-box for Decryption
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const sboxInv: number[] = new Array(256);
  for (let i = 0; i < 256; i++) {
    sboxInv[sbox[i]] = i;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 10: Build the Polymorphic Script
  // ═══════════════════════════════════════════════════════════════════════════════
  
  // Generate random ASCII art header
  const headerChars = '░▒▓█▀▄■□▪▫●○◘◙◦';
  const genHeaderLine = () => Array(60).fill(0).map(() => headerChars[Math.floor(Math.random() * headerChars.length)]).join('');
  
  const script = `--[[${genHeaderLine()}]]
--[[${Array(60).fill(0).map(() => String.fromCharCode(33 + Math.floor(Math.random() * 93))).join('')}]]
--[[${genHeaderLine()}]]
${junkBlock(3)}
local ${v.bit_xor}=bit32 and bit32.bxor or function(${v[`_0`]},${v[`_1`]})
local ${v[`_2`]},${v[`_3`]}=0,1
while ${v[`_0`]}>0 or ${v[`_1`]}>0 do
local ${v[`_4`]},${v[`_5`]}=${v[`_0`]}%2,${v[`_1`]}%2
if ${v[`_4`]}~=${v[`_5`]} then ${v[`_2`]}=${v[`_2`]}+${v[`_3`]} end
${v[`_0`]},${v[`_1`]},${v[`_3`]}=math.floor(${v[`_0`]}/2),math.floor(${v[`_1`]}/2),${v[`_3`]}*2
end
return ${v[`_2`]}
end
local ${v.bit_and}=bit32 and bit32.band or function(${v[`_0`]},${v[`_1`]})
local ${v[`_2`]},${v[`_3`]}=0,1
while ${v[`_0`]}>0 and ${v[`_1`]}>0 do
local ${v[`_4`]},${v[`_5`]}=${v[`_0`]}%2,${v[`_1`]}%2
if ${v[`_4`]}==1 and ${v[`_5`]}==1 then ${v[`_2`]}=${v[`_2`]}+${v[`_3`]} end
${v[`_0`]},${v[`_1`]},${v[`_3`]}=math.floor(${v[`_0`]}/2),math.floor(${v[`_1`]}/2),${v[`_3`]}*2
end
return ${v[`_2`]}
end
local ${v.bit_or}=bit32 and bit32.bor or function(${v[`_0`]},${v[`_1`]})
local ${v[`_2`]},${v[`_3`]}=0,1
while ${v[`_0`]}>0 or ${v[`_1`]}>0 do
local ${v[`_4`]},${v[`_5`]}=${v[`_0`]}%2,${v[`_1`]}%2
if ${v[`_4`]}==1 or ${v[`_5`]}==1 then ${v[`_2`]}=${v[`_2`]}+${v[`_3`]} end
${v[`_0`]},${v[`_1`]},${v[`_3`]}=math.floor(${v[`_0`]}/2),math.floor(${v[`_1`]}/2),${v[`_3`]}*2
end
return ${v[`_2`]}
end
local ${v.bit_lshift}=bit32 and bit32.lshift or function(${v[`_0`]},${v[`_1`]})return math.floor(${v[`_0`]}*(2^${v[`_1`]}))%256 end
local ${v.bit_rshift}=bit32 and bit32.rshift or function(${v[`_0`]},${v[`_1`]})return math.floor(${v[`_0`]}/(2^${v[`_1`]}))end
${junkBlock(2)}
local ${v.str_chr},${v.str_byte},${v.str_sub},${v.str_len}=string.char,string.byte,string.sub,string.len
local ${v.fn_chr},${v.fn_byte},${v.fn_concat}=${v.str_chr},${v.str_byte},table.concat
local ${v.fn_floor},${v.fn_pcall},${v.fn_load}=math.floor,pcall,loadstring or load
local ${v.fn_type},${v.fn_pairs},${v.fn_tick}=type,pairs,tick or os.clock
local ${v.fn_rand},${v.fn_tostr},${v.fn_tonumber}=math.random,tostring,tonumber
${junkBlock(2)}
local ${v.game_ref}=game
local ${v.svc_get}=${v.game_ref}.GetService
local ${v.svc_players}=${v.svc_get}(${v.game_ref},"Players")
${junkBlock(2)}
local ${v.sbox}={${sbox.join(',')}}
local ${v.sbox_inv}={${sboxInv.join(',')}}
${junkBlock(1)}
local ${v.key_seed1},${v.key_seed2},${v.key_seed3}=${seed1},${seed2},${seed3}
local ${v.key_magic}=${magicConstant}
${junkBlock(2)}
local ${v.key_derive}=function(${v[`_6`]})
local ${v[`_7`]}=(((${v.key_seed1}*7+${v.key_seed2}*11+${v.key_seed3}*13)%256))
local ${v[`_8`]}=((${v.bit_xor}(${v.bit_xor}(${v.key_seed1},${v.key_seed2}),${v.key_seed3})+${v[`_6`]}*17)%256)
local ${v[`_9`]}=(((${v.key_seed1}*${v.key_seed2}+${v.key_seed3})%256+${v[`_6`]}*23)%256)
return ${v.bit_xor}(${v.bit_xor}(${v[`_7`]},${v[`_8`]}),${v[`_9`]})%256
end
${junkBlock(3)}
local ${v.bit_ror}=function(${v[`_10`]},${v[`_11`]})
return ${v.bit_or}(${v.bit_rshift}(${v[`_10`]},${v[`_11`]}),${v.bit_and}(${v.bit_lshift}(${v[`_10`]},8-${v[`_11`]}),255))
end
${junkBlock(2)}
local ${v.decrypt_core}=function(${v[`_12`]})
local ${v[`_13`]}={}
for ${v[`_14`]}=1,#${v[`_12`]} do
local ${v[`_15`]}=${v[`_12`]}[${v[`_14`]}]
local ${v[`_16`]}=(${v[`_14`]}-1)
${v[`_15`]}=(${v[`_15`]}-${v[`_16`]}*${v.key_magic})%256
if ${v[`_15`]}<0 then ${v[`_15`]}=${v[`_15`]}+256 end
local ${v[`_17`]}=(${v[`_16`]}%7)+1
${v[`_15`]}=${v.bit_ror}(${v[`_15`]},${v[`_17`]})
local ${v[`_18`]}=${v.key_derive}(${v[`_16`]})
${v[`_15`]}=${v.bit_xor}(${v[`_15`]},${v[`_18`]})
${v[`_15`]}=${v.sbox_inv}[${v[`_15`]}+1]
${v[`_13`]}[${v[`_14`]}]=${v.fn_chr}(${v[`_15`]})
end
return ${v.fn_concat}(${v[`_13`]})
end
${junkBlock(4)}
local ${v.frag_pool}={}
${encryptedFragments.url.map((f, i) => `${v.frag_pool}[${i + 1}]={${f.data.join(',')}}`).join('\n')}
local ${v.frag_order}={${encryptedFragments.url.map((_, i) => i + 1).join(',')}}
${junkBlock(2)}
local ${v.frag_real}={}
${encryptedFragments.id.map((f, i) => `${v.frag_real}[${i + 1}]={${f.data.join(',')}}`).join('\n')}
${junkBlock(1)}
local ${v.frag_selector}={}
${encryptedFragments.key.map((f, i) => `${v.frag_selector}[${i + 1}]={${f.data.join(',')}}`).join('\n')}
${junkBlock(3)}
local ${v.frag_fake}={${fakeFragments.map(fakeUrlFrags => 
  `{${fakeUrlFrags.map(f => `{${f.data.join(',')}}`).join(',')}}`
).join(',')}}
${junkBlock(2)}
local ${v.hwid_core}=function()
local ${v.hwid_raw}=nil
${v.fn_pcall}(function()
if gethwid then ${v.hwid_raw}=gethwid()end
if not ${v.hwid_raw} and getexecutorhwid then ${v.hwid_raw}=getexecutorhwid()end
if not ${v.hwid_raw} and get_hwid then ${v.hwid_raw}=get_hwid()end
if not ${v.hwid_raw} and identifyexecutor then
local ${v[`_19`]},${v[`_20`]}=${v.fn_pcall}(identifyexecutor)
if ${v[`_19`]} and ${v[`_20`]} then ${v.hwid_raw}=${v[`_20`]} end
end
if not ${v.hwid_raw} and HWID then ${v.hwid_raw}=HWID end
if not ${v.hwid_raw} and Cryptic then ${v.fn_pcall}(function()${v.hwid_raw}=Cryptic:GetHWID()end)end
if not ${v.hwid_raw} and syn then ${v.fn_pcall}(function()${v.hwid_raw}=syn.hwid()end)end
if not ${v.hwid_raw} and fluxus then ${v.fn_pcall}(function()${v.hwid_raw}=fluxus:GetHWID()end)end
if not ${v.hwid_raw} and getgenv then ${v.fn_pcall}(function()local ${v[`_21`]}=getgenv()if ${v[`_21`]} and ${v[`_21`]}._hwid then ${v.hwid_raw}=${v[`_21`]}._hwid end end)end
if not ${v.hwid_raw} and request then ${v.fn_pcall}(function()${v.hwid_raw}=request({Url=""}).Headers["Syn-Fingerprint"] end)end
if not ${v.hwid_raw} and http_request then ${v.fn_pcall}(function()${v.hwid_raw}=http_request({Url=""}).Headers["Syn-Fingerprint"] end)end
end)
if not ${v.hwid_raw} then
${v.fn_pcall}(function()
local ${v.player_local}=${v.svc_players}.LocalPlayer
if ${v.player_local} then
local ${v.player_id}=${v.fn_tostr}(${v.player_local}.UserId)
local ${v.place_id}=${v.fn_tostr}(${v.game_ref}.PlaceId)
local ${v.job_id}=${v.str_sub}(${v.fn_tostr}(${v.game_ref}.JobId),1,8)
${v.hwid_raw}=${v.player_id}.."_"..${v.place_id}.."_"..${v.job_id}
end
end)
end
if not ${v.hwid_raw} then
${v.hwid_raw}="DL_"..${v.fn_tostr}(${v.fn_floor}(${v.fn_tick}()*10000)).."_"..${v.fn_tostr}(${v.fn_floor}(${v.fn_rand}()*99999))
end
return ${v.hwid_raw}
end
${junkBlock(5)}
local ${v.cf_state}=${S_BOOT}
local ${v.cf_active}=true
local ${v.vm_reg}={}
local ${v.anti_debug}=0
${junkBlock(3)}
while ${v.cf_active} do
${junkBlock(1)}
if ${v.cf_state}==${S_BOOT} then
if ${getOpaque()} then ${v.cf_state}=${S_INIT_SBOX} else ${v.cf_state}=${S_TRAP1} end
elseif ${v.cf_state}==${S_INIT_SBOX} then
${v.anti_debug}=${v.anti_debug}+1
if ${v.anti_debug}>${Math.floor(Math.random() * 5) + 3} then ${v.cf_state}=${S_TRAP2} end
${v.cf_state}=${S_INIT_KEYS}
elseif ${v.cf_state}==${S_INIT_KEYS} then
if ${getOpaque()} then ${v.cf_state}=${S_PROBE_HWID} else ${v.cf_state}=${S_TRAP3} end
elseif ${v.cf_state}==${S_PROBE_HWID} then
${v.vm_reg}[1]=${v.hwid_core}()
${v.cf_state}=${S_BUILD_HWID}
elseif ${v.cf_state}==${S_BUILD_HWID} then
${v.vm_reg}[2]=${v.vm_reg}[1]
${v.cf_state}=${S_DECRYPT_URL}
elseif ${v.cf_state}==${S_DECRYPT_URL} then
local ${v[`_22`]}=""
for ${v[`_23`]}=1,#${v.frag_order} do
${v[`_22`]}=${v[`_22`]}..${v.decrypt_core}(${v.frag_pool}[${v.frag_order}[${v[`_23`]}]])
end
${v.vm_reg}[3]=${v[`_22`]}
${v.cf_state}=${S_DECRYPT_ID}
elseif ${v.cf_state}==${S_DECRYPT_ID} then
local ${v[`_24`]}=""
for ${v[`_25`]}=1,#${v.frag_real} do
${v[`_24`]}=${v[`_24`]}..${v.decrypt_core}(${v.frag_real}[${v[`_25`]}])
end
${v.vm_reg}[4]=${v[`_24`]}
${v.cf_state}=${S_DECRYPT_KEY}
elseif ${v.cf_state}==${S_DECRYPT_KEY} then
local ${v[`_26`]}=""
for ${v[`_27`]}=1,#${v.frag_selector} do
${v[`_26`]}=${v[`_26`]}..${v.decrypt_core}(${v.frag_selector}[${v[`_27`]}])
end
${v.vm_reg}[5]=${v[`_26`]}
${v.cf_state}=${S_ASSEMBLE_URL}
elseif ${v.cf_state}==${S_ASSEMBLE_URL} then
${v.net_url}=${v.vm_reg}[3]..${v.vm_reg}[4]..${v.vm_reg}[5]..${v.vm_reg}[2]
if ${getOpaque()} then ${v.cf_state}=${S_HTTP_REQ} else ${v.cf_state}=${S_FAKE_REQ} end
elseif ${v.cf_state}==${S_HTTP_REQ} then
local ${v.http_status},${v.http_result}=${v.fn_pcall}(function()return ${v.game_ref}:HttpGet(${v.net_url})end)
if ${v.http_status} and ${v.http_result} and ${v.str_len}(${v.http_result})>0 then
${v.vm_reg}[6]=${v.http_result}
${v.cf_state}=${S_VALIDATE_RESP}
else
${v.cf_state}=${S_END}
end
elseif ${v.cf_state}==${S_VALIDATE_RESP} then
if ${v.str_len}(${v.vm_reg}[6] or "")>10 then
${v.cf_state}=${S_LOAD_CODE}
else
${v.cf_state}=${S_END}
end
elseif ${v.cf_state}==${S_LOAD_CODE} then
local ${v.exec_safe},${v.exec_func}=${v.fn_pcall}(${v.fn_load},${v.vm_reg}[6])
if ${v.exec_safe} and ${v.fn_type}(${v.exec_func})=="function" then
${v.vm_reg}[7]=${v.exec_func}
${v.cf_state}=${S_EXECUTE}
else
${v.cf_state}=${S_END}
end
elseif ${v.cf_state}==${S_EXECUTE} then
${v.fn_pcall}(${v.vm_reg}[7])
${v.cf_state}=${S_CLEANUP}
elseif ${v.cf_state}==${S_CLEANUP} then
${v.vm_reg}=nil
${v.net_url}=nil
${v.cf_state}=${S_END}
elseif ${v.cf_state}==${S_TRAP1} then
${junkBlock(2)}
${v.cf_state}=${S_INIT_SBOX}
elseif ${v.cf_state}==${S_TRAP2} then
${junkBlock(1)}
${v.cf_state}=${S_INIT_KEYS}
elseif ${v.cf_state}==${S_TRAP3} then
${junkBlock(2)}
${v.cf_state}=${S_PROBE_HWID}
elseif ${v.cf_state}==${S_FAKE_REQ} then
${v.fn_pcall}(function()${v.game_ref}:HttpGet("about:blank")end)
${v.cf_state}=${S_HTTP_REQ}
elseif ${v.cf_state}==${S_ANTI_DEBUG} then
if ${v.fn_type}(debug)=="table" and debug.traceback then
${v.fn_pcall}(function()debug.traceback=nil end)
end
${v.cf_state}=${S_END}
elseif ${v.cf_state}==${S_END} then
${v.cf_active}=false
else
${v.cf_state}=${S_END}
end
end
${junkBlock(4)}
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
                custom_id: `blacklist_${hwid.slice(0, 50)}`
              }]
            }]
          }),
        });
      } catch (webhookError) {
        console.error("Failed to send webhook:", webhookError);
      }
    };

    // Check if HWID is blacklisted
    if (hwidBlacklist.includes(hwid)) {
      console.log("Access denied - HWID blacklisted:", { scriptId, hwid });
      
      await supabaseAdmin.from("access_logs").insert({
        script_id: scriptId,
        hwid: hwid,
        ip_address: clientIp,
        status: "denied",
        reason: "HWID blacklisted",
      });
      
      await sendDiscordWebhook("🚫 Denied", "HWID Blacklisted", 0xFF0000);

      return new Response(
        'print("⛔ ACCESS DENIED ⛔")\nprint("ERROR: Your HWID has been blacklisted")\nprint("Contact the script owner if you believe this is an error")\nprint("This access attempt has been logged")',
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        },
      );
    }

    // Get HWID limit based on user plan
    const getHwidLimit = (plan: string): number => {
      switch (plan) {
        case "enterprise": return 1000;
        case "pro": return 100;
        default: return 10;
      }
    };
    const hwidLimit = getHwidLimit(userPlan);

    // Check if access is allowed
    const isHwidWhitelisted = hwidList.includes(hwid);
    const isIpWhitelisted = ipList.length === 0 || ipList.includes(clientIp);
    
    // For public access scripts, auto-whitelist the HWID if not already whitelisted
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
      
      await sendDiscordWebhook("🚫 Denied", !isHwidWhitelisted ? "HWID Not Whitelisted" : "IP Not Whitelisted", 0xFF0000);

      return new Response(
        'print("⛔ ACCESS DENIED ⛔")\nprint("ERROR: You are not authorized to access this script")\nprint("Your HWID is not whitelisted for this script")\nprint("This access attempt has been logged")',
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        },
      );
    }

    // Log successful access
    await supabaseAdmin.from("access_logs").insert({
      script_id: scriptId,
      hwid: hwid,
      ip_address: clientIp,
      status: "granted",
      reason: publicAccess ? "Public access" : "Whitelisted",
    });
    
    await sendDiscordWebhook("✅ Granted", publicAccess ? "Public Access" : "Whitelisted", 0x00FF00);

    console.log("Access granted - serving script:", { scriptId });

    // Return the actual script content
    return new Response(script.script_key, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      'print("⛔ ERROR ⛔")\nprint("An unexpected error occurred")\nprint("Please try again later")',
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      },
    );
  }
});
