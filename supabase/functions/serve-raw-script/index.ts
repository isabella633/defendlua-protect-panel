import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ═══════════════════════════════════════════════════════════════════════════════
// DefendLua Advanced Obfuscation Engine v8.0 - MULTI-LAYER DEFENSE
// Features: Nested S-boxes, Metamethod hiding, Dynamic dispatch, Opaque predicates,
// Decoy routines, Self-referential checksums, Anti-analysis traps
// ═══════════════════════════════════════════════════════════════════════════════

const generateCollectorScript = (scriptId: string): string => {
  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 1: Enhanced Identifier Generator with More Confusion
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const usedNames = new Set<string>();
  
  const generateValidName = (minLen = 14, maxLen = 28): string => {
    const startChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_';
    const allChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_';
    const confusingPatterns = ['Il1', 'O0o', 'l1I', '0Oo', 'Ll1', 'iIl', 'oO0', '_l_', '_I_', '_O_', 'lIl', 'I1l', 'O0O'];
    
    let name: string;
    let attempts = 0;
    do {
      const length = minLen + Math.floor(Math.random() * (maxLen - minLen));
      const prefixes = ['_', '__', '___', 'l', 'I', 'O', '_l', '_I', '_O', 'll', 'II', 'OO', '_ll', '_II', '_OO', 'lIl', 'IlI'];
      name = prefixes[Math.floor(Math.random() * prefixes.length)];
      
      while (name.length < length) {
        if (Math.random() > 0.5 && name.length < length - 3) {
          const pattern = confusingPatterns[Math.floor(Math.random() * confusingPatterns.length)];
          name += pattern;
        } else {
          name += allChars[Math.floor(Math.random() * allChars.length)];
        }
      }
      name += '_' + Math.floor(Math.random() * 99999).toString();
      attempts++;
    } while (usedNames.has(name) && attempts < 100);
    
    usedNames.add(name);
    return name;
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 2: Multi-layer Key System with Checksums
  // ═══════════════════════════════════════════════════════════════════════════════
  
  // Primary keys
  const seed1 = Math.floor(Math.random() * 65536);
  const seed2 = Math.floor(Math.random() * 65536);
  const seed3 = Math.floor(Math.random() * 65536);
  const magicConstant = Math.floor(Math.random() * 256) + 128;
  
  // Secondary keys for nested encryption
  const seed4 = Math.floor(Math.random() * 65536);
  const seed5 = Math.floor(Math.random() * 65536);
  const magicConstant2 = Math.floor(Math.random() * 128) + 64;
  
  // Opaque predicate constants (look random but are mathematically fixed)
  const opaqueA = Math.floor(Math.random() * 1000) + 500;
  const opaqueB = opaqueA * 2 + 1; // Always odd
  const opaqueC = opaqueA * opaqueA % 997; // Modular arithmetic
  
  // Checksum seed
  const checksumKey = Math.floor(Math.random() * 65536);
  
  const deriveKey = (s1: number, s2: number, s3: number, idx: number): number => {
    const a = ((s1 * 7 + s2 * 11 + s3 * 13) % 256);
    const b = ((s1 ^ s2 ^ s3) + idx * 17) % 256;
    const c = ((s1 * s2 + s3) % 256 + idx * 23) % 256;
    return (a ^ b ^ c) % 256;
  };
  
  const deriveKey2 = (s4: number, s5: number, idx: number): number => {
    const a = ((s4 * 13 + s5 * 17) % 256);
    const b = ((s4 ^ s5) + idx * 31) % 256;
    return (a ^ b) % 256;
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 3: Triple S-box System (harder to reverse)
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const generateSBox = (): number[] => {
    const box = Array.from({length: 256}, (_, i) => i);
    for (let i = box.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [box[i], box[j]] = [box[j], box[i]];
    }
    return box;
  };
  
  const sbox1 = generateSBox();
  const sbox2 = generateSBox();
  const sbox3 = generateSBox(); // Third layer
  
  const sbox1Inv: number[] = new Array(256);
  const sbox2Inv: number[] = new Array(256);
  const sbox3Inv: number[] = new Array(256);
  for (let i = 0; i < 256; i++) {
    sbox1Inv[sbox1[i]] = i;
    sbox2Inv[sbox2[i]] = i;
    sbox3Inv[sbox3[i]] = i;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 4: Enhanced Multi-Layer Encryption with Triple S-box
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const encryptAdvanced = (str: string): number[] => {
    const encrypted: number[] = [];
    
    for (let i = 0; i < str.length; i++) {
      const runtimeKey1 = deriveKey(seed1, seed2, seed3, i);
      const runtimeKey2 = deriveKey2(seed4, seed5, i);
      
      let byte = str.charCodeAt(i);
      
      // Layer 1: First S-box substitution
      byte = sbox1[byte];
      
      // Layer 2: XOR with first derived key
      byte = byte ^ runtimeKey1;
      
      // Layer 3: Second S-box substitution  
      byte = sbox2[byte];
      
      // Layer 4: Rotate bits (position-dependent)
      const rotateAmount = (i % 7) + 1;
      byte = ((byte << rotateAmount) | (byte >> (8 - rotateAmount))) & 0xFF;
      
      // Layer 5: XOR with second derived key
      byte = byte ^ runtimeKey2;
      
      // Layer 6: Third S-box substitution
      byte = sbox3[byte];
      
      // Layer 7: Add position-based salt with primary magic
      byte = (byte + (i * magicConstant)) % 256;
      
      // Layer 8: XOR with secondary magic (position dependent)
      byte = byte ^ ((i * magicConstant2) % 256);
      
      encrypted.push(byte);
    }
    
    return encrypted;
  };
  
  // Calculate checksum for integrity verification
  const calculateChecksum = (arr: number[]): number => {
    let sum = checksumKey;
    for (let i = 0; i < arr.length; i++) {
      sum = (sum * 31 + arr[i]) % 65536;
    }
    return sum;
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 5: URL Fragmentation with Checksums
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const urlBase = `https://uwfuuhhcjlxgyeecpeii.supabase.co/functions/v1/serve-raw-script?id=`;
  const keyParam = `&key=`;
  
  const fragmentString = (str: string): string[] => {
    const fragments: string[] = [];
    let pos = 0;
    while (pos < str.length) {
      const size = Math.floor(Math.random() * 3) + 2; // Smaller fragments
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
  
  // Calculate checksums for each fragment group
  const urlChecksums = encryptedUrl.map(f => calculateChecksum(f));
  const idChecksums = encryptedId.map(f => calculateChecksum(f));
  const keyChecksums = encryptedKey.map(f => calculateChecksum(f));

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 6: Generate Variable Names (Extended)
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const v: Record<string, string> = {};
  const varNames = [
    // Core operations
    'bxor', 'band', 'bor', 'lsh', 'rsh', 'ror',
    'schr', 'sbyte', 'ssub', 'slen', 'scat',
    'mfloor', 'mrand', 'pcl', 'ld', 'typ', 'prs', 'tck', 'tstr', 'tnum',
    'gref', 'gsvc', 'plrs',
    // Triple S-box system
    'sb1', 'sb2', 'sb3', 'sbi1', 'sbi2', 'sbi3',
    // Extended key system
    'ks1', 'ks2', 'ks3', 'ks4', 'ks5', 'kmag', 'kmag2', 'kchk',
    'kder1', 'kder2',
    // Opaque predicates
    'opA', 'opB', 'opC', 'opChk',
    // Decryption
    'bror', 'dcr',
    // Fragments
    'fp', 'fi', 'fk', 'fpc', 'fic', 'fkc',
    // HWID
    'hcore', 'hraw',
    'ploc', 'pid', 'plid', 'jid',
    // Control flow
    'cfs', 'cfa', 'vreg', 'cfd',
    // Network
    'nurl', 'hstat', 'hres', 'esfn', 'efn',
    // Metamethod / dispatch tables
    'mtbl', 'dtbl', 'dcoy', 'trap', 'vchk',
    // Anti-analysis
    'antdbg', 'tmchk', 'envchk',
    // Temp vars (many needed)
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'u', 'w', 'x', 'y', 'z',
    'aa', 'ab', 'ac', 'ad', 'ae', 'af', 'ag', 'ah', 'ai', 'aj', 'ak', 'am', 'an', 'ao', 'ap', 'aq', 'ar', 'as', 'at', 'au',
    'ba', 'bb', 'bc', 'bd', 'be', 'bf', 'bg', 'bh', 'bi', 'bj', 'bk', 'bm', 'bn', 'bo', 'bp', 'bq', 'br', 'bs', 'bt', 'bu',
    'ca', 'cb', 'cc', 'cd', 'ce', 'cf', 'cg', 'ch', 'ci', 'cj', 'ck', 'cm', 'cn', 'co', 'cp', 'cq', 'cr', 'cs', 'ct', 'cu',
    'da', 'db', 'dc', 'dd', 'de', 'df', 'dg', 'dh', 'di', 'dj', 'dk', 'dm', 'dn',
    'ea', 'eb', 'ec', 'ed', 'ee', 'ef', 'eg', 'eh', 'ei', 'ej', 'ek', 'em', 'en',
  ];
  varNames.forEach(name => v[name] = generateValidName());

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 7: Control Flow States (More Complex)
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const states: number[] = [];
  for (let i = 0; i < 25; i++) {
    let state;
    do {
      state = Math.floor(Math.random() * 900000) + 100000;
    } while (states.includes(state));
    states.push(state);
  }
  
  const [
    S_BOOT, S_INIT, S_ANTDBG, S_ENVCHK, S_OPCHK, S_HWID, 
    S_URL1, S_URL2, S_URL3, S_CHKSUM, S_ASM,
    S_HTTP, S_CHK, S_LOAD, S_EXEC, S_END, 
    S_TRAP1, S_TRAP2, S_TRAP3, S_DCOY1, S_DCOY2, S_DCOY3, S_T1, S_T2, S_T3
  ] = states;

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 8: Enhanced Junk Code Generator
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const genJunk = (): string => {
    const jv = () => v[varNames[Math.floor(Math.random() * 30) + 80]] || v['a'];
    const rn = () => Math.floor(Math.random() * 9999);
    const templates = [
      () => `local ${jv()}=${rn()}`,
      () => `local ${jv()}={}`,
      () => `local ${jv()}=""`,
      () => `if false then local ${jv()}=${rn()} end`,
      () => `do local ${jv()}=${rn()} end`,
      () => `local ${jv()}=${rn()}+${rn()}`,
      () => `local ${jv()}=${rn()}*0`,
      () => `local ${jv()}=nil`,
      () => `local ${jv()}=function()return ${rn()} end`,
      () => `if ${rn()}>999999 then local ${jv()}=${rn()} end`,
    ];
    return templates[Math.floor(Math.random() * templates.length)]();
  };
  
  const junkBlock = (count: number): string => {
    return Array(count).fill(0).map(() => genJunk()).join('\n');
  };
  
  // Generate decoy function that looks like real decryption but does nothing useful
  const genDecoyDecrypt = (): string => {
    const dv1 = generateValidName();
    const dv2 = generateValidName();
    const dv3 = generateValidName();
    return `local function ${v.dcoy}(${dv1})
local ${dv2}={}
for ${dv3}=1,#${dv1} do
${dv2}[${dv3}]=${v.schr}(${v.bxor}(${dv1}[${dv3}],${Math.floor(Math.random() * 256)}))
end
return ${v.scat}(${dv2})
end`;
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 9: Build the Enhanced Script
  // ═══════════════════════════════════════════════════════════════════════════════

  const script = `--[[ Protected ]]
${junkBlock(3)}
local ${v.bxor}=bit32 and bit32.bxor or function(${v.a},${v.b})
local ${v.c},${v.d}=0,1
while ${v.a}>0 or ${v.b}>0 do
local ${v.e},${v.f}=${v.a}%2,${v.b}%2
if ${v.e}~=${v.f} then ${v.c}=${v.c}+${v.d} end
${v.a},${v.b},${v.d}=math.floor(${v.a}/2),math.floor(${v.b}/2),${v.d}*2
end
return ${v.c}
end
${junkBlock(1)}
local ${v.band}=bit32 and bit32.band or function(${v.a},${v.b})
local ${v.c},${v.d}=0,1
while ${v.a}>0 and ${v.b}>0 do
local ${v.e},${v.f}=${v.a}%2,${v.b}%2
if ${v.e}==1 and ${v.f}==1 then ${v.c}=${v.c}+${v.d} end
${v.a},${v.b},${v.d}=math.floor(${v.a}/2),math.floor(${v.b}/2),${v.d}*2
end
return ${v.c}
end
${junkBlock(1)}
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
${junkBlock(2)}
local ${v.schr},${v.sbyte},${v.ssub},${v.slen}=string.char,string.byte,string.sub,string.len
local ${v.scat}=table.concat
local ${v.mfloor},${v.pcl},${v.ld}=math.floor,pcall,loadstring or load
local ${v.typ},${v.prs},${v.tck}=type,pairs,tick or os.clock
local ${v.mrand},${v.tstr},${v.tnum}=math.random,tostring,tonumber
${junkBlock(2)}
local ${v.gref}=game
local ${v.gsvc}=${v.gref}.GetService
local ${v.plrs}=${v.gsvc}(${v.gref},"Players")
${junkBlock(1)}
local ${v.sb1}={${sbox1.join(',')}}
local ${v.sb2}={${sbox2.join(',')}}
local ${v.sb3}={${sbox3.join(',')}}
local ${v.sbi1}={${sbox1Inv.join(',')}}
local ${v.sbi2}={${sbox2Inv.join(',')}}
local ${v.sbi3}={${sbox3Inv.join(',')}}
${junkBlock(1)}
local ${v.ks1},${v.ks2},${v.ks3}=${seed1},${seed2},${seed3}
local ${v.ks4},${v.ks5}=${seed4},${seed5}
local ${v.kmag},${v.kmag2}=${magicConstant},${magicConstant2}
local ${v.kchk}=${checksumKey}
${junkBlock(1)}
local ${v.opA},${v.opB},${v.opC}=${opaqueA},${opaqueB},${opaqueC}
${junkBlock(2)}
local ${v.opChk}=function()
local ${v.aa}=(${v.opB}%2==1)
local ${v.ab}=((${v.opA}*${v.opA})%997==${v.opC})
return ${v.aa} and ${v.ab}
end
${junkBlock(1)}
local ${v.kder1}=function(${v.g})
local ${v.h}=(((${v.ks1}*7+${v.ks2}*11+${v.ks3}*13)%256))
local ${v.i}=((${v.bxor}(${v.bxor}(${v.ks1},${v.ks2}),${v.ks3})+${v.g}*17)%256)
local ${v.j}=(((${v.ks1}*${v.ks2}+${v.ks3})%256+${v.g}*23)%256)
return ${v.bxor}(${v.bxor}(${v.h},${v.i}),${v.j})%256
end
local ${v.kder2}=function(${v.g})
local ${v.h}=(((${v.ks4}*13+${v.ks5}*17)%256))
local ${v.i}=((${v.bxor}(${v.ks4},${v.ks5})+${v.g}*31)%256)
return ${v.bxor}(${v.h},${v.i})%256
end
${junkBlock(1)}
local ${v.bror}=function(${v.k},${v.m})
return ${v.bor}(${v.rsh}(${v.k},${v.m}),${v.band}(${v.lsh}(${v.k},8-${v.m}),255))
end
${junkBlock(2)}
${genDecoyDecrypt()}
${junkBlock(1)}
local ${v.vchk}=function(${v.n},${v.aa})
local ${v.ab}=${v.kchk}
for ${v.ac}=1,#${v.n} do
${v.ab}=(${v.ab}*31+${v.n}[${v.ac}])%65536
end
return ${v.ab}==${v.aa}
end
${junkBlock(1)}
local ${v.dcr}=function(${v.n})
local ${v.p}={}
for ${v.q}=1,#${v.n} do
local ${v.r}=${v.n}[${v.q}]
local ${v.s}=(${v.q}-1)
${v.r}=${v.bxor}(${v.r},(${v.s}*${v.kmag2})%256)
${v.r}=(${v.r}-(${v.s}*${v.kmag}))%256
if ${v.r}<0 then ${v.r}=${v.r}+256 end
${v.r}=${v.sbi3}[${v.r}+1]
local ${v.ad}=${v.kder2}(${v.s})
${v.r}=${v.bxor}(${v.r},${v.ad})
local ${v.t}=(${v.s}%7)+1
${v.r}=${v.bror}(${v.r},${v.t})
${v.r}=${v.sbi2}[${v.r}+1]
local ${v.u}=${v.kder1}(${v.s})
${v.r}=${v.bxor}(${v.r},${v.u})
${v.r}=${v.sbi1}[${v.r}+1]
${v.p}[${v.q}]=${v.schr}(${v.r})
end
return ${v.scat}(${v.p})
end
${junkBlock(3)}
local ${v.fp}={}
${encryptedUrl.map((f, i) => `${v.fp}[${i + 1}]={${f.join(',')}}`).join('\n')}
local ${v.fpc}={${urlChecksums.join(',')}}
local ${v.fi}={}
${encryptedId.map((f, i) => `${v.fi}[${i + 1}]={${f.join(',')}}`).join('\n')}
local ${v.fic}={${idChecksums.join(',')}}
local ${v.fk}={}
${encryptedKey.map((f, i) => `${v.fk}[${i + 1}]={${f.join(',')}}`).join('\n')}
local ${v.fkc}={${keyChecksums.join(',')}}
${junkBlock(2)}
local ${v.mtbl}={}
setmetatable(${v.mtbl},{
__index=function(${v.ae},${v.af})
if ${v.typ}(${v.af})=="number" then
return rawget(${v.ae},${v.bxor}(${v.af},${Math.floor(Math.random() * 256)}))
end
return nil
end,
__newindex=function(${v.ae},${v.af},${v.ag})
if ${v.typ}(${v.af})=="number" then
rawset(${v.ae},${v.bxor}(${v.af},${Math.floor(Math.random() * 256)}),${v.ag})
end
end
})
${junkBlock(1)}
local ${v.antdbg}=function()
local ${v.ah}=${v.tck}()
local ${v.ai}=0
for ${v.aj}=1,10000 do ${v.ai}=${v.ai}+1 end
local ${v.ak}=${v.tck}()
return (${v.ak}-${v.ah})<1
end
${junkBlock(1)}
local ${v.envchk}=function()
return ${v.typ}(${v.gref})=="userdata" and ${v.typ}(${v.plrs})=="userdata"
end
${junkBlock(2)}
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
${junkBlock(3)}
local ${v.dtbl}={}
${v.dtbl}[${S_BOOT}]=function()
if ${v.envchk}() then return ${S_ANTDBG} else return ${S_TRAP1} end
end
${v.dtbl}[${S_ANTDBG}]=function()
if ${v.antdbg}() then return ${S_INIT} else return ${S_INIT} end
end
${v.dtbl}[${S_INIT}]=function()
return ${S_OPCHK}
end
${v.dtbl}[${S_OPCHK}]=function()
if ${v.opChk}() then return ${S_HWID} else return ${S_TRAP2} end
end
${v.dtbl}[${S_HWID}]=function()
${v.vreg}[1]=${v.hcore}()
return ${S_URL1}
end
${v.dtbl}[${S_URL1}]=function()
local ${v.ba}=""
for ${v.bb}=1,#${v.fp} do
if ${v.vchk}(${v.fp}[${v.bb}],${v.fpc}[${v.bb}]) then
${v.ba}=${v.ba}..${v.dcr}(${v.fp}[${v.bb}])
else
return ${S_TRAP3}
end
end
${v.vreg}[2]=${v.ba}
return ${S_URL2}
end
${v.dtbl}[${S_URL2}]=function()
local ${v.bc}=""
for ${v.bd}=1,#${v.fi} do
if ${v.vchk}(${v.fi}[${v.bd}],${v.fic}[${v.bd}]) then
${v.bc}=${v.bc}..${v.dcr}(${v.fi}[${v.bd}])
else
return ${S_TRAP3}
end
end
${v.vreg}[3]=${v.bc}
return ${S_URL3}
end
${v.dtbl}[${S_URL3}]=function()
local ${v.be}=""
for ${v.bf}=1,#${v.fk} do
if ${v.vchk}(${v.fk}[${v.bf}],${v.fkc}[${v.bf}]) then
${v.be}=${v.be}..${v.dcr}(${v.fk}[${v.bf}])
else
return ${S_TRAP3}
end
end
${v.vreg}[4]=${v.be}
return ${S_ASM}
end
${v.dtbl}[${S_ASM}]=function()
${v.nurl}=${v.vreg}[2]..${v.vreg}[3]..${v.vreg}[4]..${v.vreg}[1]
return ${S_HTTP}
end
${v.dtbl}[${S_HTTP}]=function()
local ${v.hstat},${v.hres}=${v.pcl}(function()return ${v.gref}:HttpGet(${v.nurl})end)
if ${v.hstat} and ${v.hres} and ${v.slen}(${v.hres})>0 then
${v.vreg}[5]=${v.hres}
return ${S_CHK}
else
return ${S_END}
end
end
${v.dtbl}[${S_CHK}]=function()
if ${v.slen}(${v.vreg}[5] or "")>10 then
return ${S_LOAD}
else
return ${S_END}
end
end
${v.dtbl}[${S_LOAD}]=function()
local ${v.esfn},${v.efn}=${v.pcl}(${v.ld},${v.vreg}[5])
if ${v.esfn} and ${v.typ}(${v.efn})=="function" then
${v.vreg}[6]=${v.efn}
return ${S_EXEC}
else
return ${S_END}
end
end
${v.dtbl}[${S_EXEC}]=function()
${v.pcl}(${v.vreg}[6])
return ${S_END}
end
${v.dtbl}[${S_TRAP1}]=function()return ${S_END} end
${v.dtbl}[${S_TRAP2}]=function()return ${S_END} end
${v.dtbl}[${S_TRAP3}]=function()return ${S_END} end
${v.dtbl}[${S_DCOY1}]=function()${v.dcoy}({1,2,3})return ${S_END} end
${v.dtbl}[${S_DCOY2}]=function()${v.dcoy}({4,5,6})return ${S_END} end
${v.dtbl}[${S_DCOY3}]=function()${v.dcoy}({7,8,9})return ${S_END} end
${v.dtbl}[${S_T1}]=function()return ${S_INIT} end
${v.dtbl}[${S_T2}]=function()return ${S_HWID} end
${v.dtbl}[${S_T3}]=function()return ${S_URL1} end
${v.dtbl}[${S_END}]=function()return nil end
${junkBlock(2)}
local ${v.cfs}=${S_BOOT}
local ${v.cfa}=true
local ${v.vreg}={}
local ${v.cfd}=0
${junkBlock(1)}
while ${v.cfa} and ${v.cfd}<100 do
${v.cfd}=${v.cfd}+1
local ${v.bg}=${v.dtbl}[${v.cfs}]
if ${v.bg} then
local ${v.bh}=${v.bg}()
if ${v.bh} then
${v.cfs}=${v.bh}
else
${v.cfa}=false
end
else
${v.cfa}=false
end
end
${junkBlock(3)}
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
