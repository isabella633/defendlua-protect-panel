import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ═══════════════════════════════════════════════════════════════════════════════
// DefendLua Advanced Obfuscation Engine v10.0 - EXTREME PROTECTION
// Features: VM-based execution, Anti-tamper integrity, Multi-layer encryption,
// Polymorphic code, Opaque predicates, Self-modifying patterns, Timing checks,
// Dead code injection, Control flow flattening, String virtualization
// ═══════════════════════════════════════════════════════════════════════════════

const generateCollectorScript = (scriptId: string): string => {
  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 1: Ultra-Confusing Identifier Generator
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const usedNames = new Set<string>();
  
  const generateValidName = (minLen = 16, maxLen = 32): string => {
    const confusingChars = ['I', 'l', '1', 'O', '0', 'o', '_'];
    const prefixes = ['_', '__', '___', 'l', 'I', 'O', '_l', '_I', '_O', 'll', 'II', 'OO', 
                      '_ll', '_II', '_OO', 'lIl', 'IlI', 'OoO', 'l1l', 'I1I', 'O0O',
                      '_lIl', '_IlI', '_O0O', 'lll', 'III', 'OOO', '__l', '__I', '__O'];
    
    let name: string;
    let attempts = 0;
    do {
      const length = minLen + Math.floor(Math.random() * (maxLen - minLen));
      name = prefixes[Math.floor(Math.random() * prefixes.length)];
      
      while (name.length < length) {
        if (Math.random() > 0.3) {
          name += confusingChars[Math.floor(Math.random() * confusingChars.length)];
        } else {
          name += Math.floor(Math.random() * 10).toString();
        }
      }
      name += '_' + Math.floor(Math.random() * 999999).toString(36);
      attempts++;
    } while (usedNames.has(name) && attempts < 100);
    
    usedNames.add(name);
    return name;
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 2: Multi-layer Cryptographic Key System
  // ═══════════════════════════════════════════════════════════════════════════════
  
  // Primary encryption keys
  const seeds = Array.from({length: 8}, () => Math.floor(Math.random() * 65536));
  const magicConstants = Array.from({length: 4}, () => Math.floor(Math.random() * 256) + 64);
  
  // Integrity verification keys
  const integrityKeys = Array.from({length: 4}, () => Math.floor(Math.random() * 65536));
  
  // Anti-tamper signature (computed from all keys)
  const tamperSignature = seeds.reduce((a, b) => (a * 31 + b) % 2147483647, 17);
  
  // Opaque predicate constants
  const opaqueA = Math.floor(Math.random() * 1000) + 500;
  const opaqueB = opaqueA * 2 + 1;
  const opaqueC = (opaqueA * opaqueA) % 997;
  const opaqueD = (opaqueA + opaqueB) % 503;
  
  // VM instruction constants
  const vmOps = Array.from({length: 32}, () => Math.floor(Math.random() * 900000) + 100000);
  
  const deriveKey = (idx: number, layer: number): number => {
    const s = seeds[layer % seeds.length];
    const m = magicConstants[layer % magicConstants.length];
    return ((s * 7 + idx * 13 + m * 17) ^ (s >> 3)) % 256;
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 3: Quad S-box System with Permutation Tables
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const generateSBox = (): number[] => {
    const box = Array.from({length: 256}, (_, i) => i);
    for (let i = box.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [box[i], box[j]] = [box[j], box[i]];
    }
    return box;
  };
  
  const sboxes = Array.from({length: 4}, () => generateSBox());
  const sboxInvs = sboxes.map(sbox => {
    const inv = new Array(256);
    for (let i = 0; i < 256; i++) inv[sbox[i]] = i;
    return inv;
  });
  
  // Permutation table for extra confusion
  const permTable = Array.from({length: 8}, () => Math.floor(Math.random() * 8));

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 4: Advanced Multi-Layer Encryption Engine
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const encryptAdvanced = (str: string): number[] => {
    const encrypted: number[] = [];
    
    for (let i = 0; i < str.length; i++) {
      let byte = str.charCodeAt(i);
      
      // Layer 1: Position-dependent initial XOR
      byte ^= deriveKey(i, 0);
      
      // Layer 2: First S-box
      byte = sboxes[0][byte];
      
      // Layer 3: Bit rotation based on position
      const rot1 = (i % 7) + 1;
      byte = ((byte << rot1) | (byte >> (8 - rot1))) & 0xFF;
      
      // Layer 4: XOR with second key
      byte ^= deriveKey(i, 1);
      
      // Layer 5: Second S-box
      byte = sboxes[1][byte];
      
      // Layer 6: Add position salt
      byte = (byte + (i * magicConstants[0])) % 256;
      
      // Layer 7: Third S-box
      byte = sboxes[2][byte];
      
      // Layer 8: Another rotation
      const rot2 = ((i + 3) % 5) + 2;
      byte = ((byte >> rot2) | (byte << (8 - rot2))) & 0xFF;
      
      // Layer 9: XOR with third key
      byte ^= deriveKey(i, 2);
      
      // Layer 10: Fourth S-box
      byte = sboxes[3][byte];
      
      // Layer 11: Final position-dependent transformation
      byte ^= ((i * magicConstants[1]) % 256);
      byte = (byte + magicConstants[2]) % 256;
      
      encrypted.push(byte);
    }
    
    return encrypted;
  };
  
  // Calculate integrity hash
  const calculateIntegrity = (arr: number[]): number => {
    let hash = integrityKeys[0];
    for (let i = 0; i < arr.length; i++) {
      hash = ((hash << 5) - hash + arr[i]) | 0;
      hash ^= integrityKeys[i % integrityKeys.length];
    }
    return hash >>> 0;
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 5: URL Micro-Fragmentation with Integrity
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const urlBase = `https://uwfuuhhcjlxgyeecpeii.supabase.co/functions/v1/serve-raw-script?id=`;
  const keyParam = `&key=`;
  
  const microFragment = (str: string): string[] => {
    const fragments: string[] = [];
    for (let i = 0; i < str.length; i++) {
      fragments.push(str[i]);
    }
    return fragments;
  };
  
  const urlFragments = microFragment(urlBase);
  const idFragments = microFragment(scriptId);
  const keyFragments = microFragment(keyParam);
  
  const encryptedUrl = urlFragments.map(f => encryptAdvanced(f));
  const encryptedId = idFragments.map(f => encryptAdvanced(f));
  const encryptedKey = keyFragments.map(f => encryptAdvanced(f));
  
  const urlIntegrity = calculateIntegrity(encryptedUrl.flat());
  const idIntegrity = calculateIntegrity(encryptedId.flat());
  const keyIntegrity = calculateIntegrity(encryptedKey.flat());

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 6: Generate All Variable Names
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const v: Record<string, string> = {};
  const varNames = [
    // Bit operations
    'bxor', 'band', 'bor', 'lsh', 'rsh', 'ror', 'rol',
    // String operations
    'schr', 'sbyte', 'ssub', 'slen', 'scat', 'srep', 'srev',
    // Math operations
    'mfloor', 'mrand', 'mabs', 'mmin', 'mmax',
    // Core functions
    'pcl', 'ld', 'typ', 'prs', 'tck', 'tstr', 'tnum', 'raw', 'sel',
    // Game references
    'gref', 'gsvc', 'plrs', 'rstore', 'http',
    // S-boxes (4 sets)
    'sb0', 'sb1', 'sb2', 'sb3', 'sbi0', 'sbi1', 'sbi2', 'sbi3',
    // Keys and constants
    'ks', 'mc', 'ik', 'ts', 'pt',
    // Opaque predicates
    'opA', 'opB', 'opC', 'opD', 'opChk', 'opV1', 'opV2',
    // Decryption
    'dkey', 'dcr', 'dint',
    // Fragments
    'fu', 'fi', 'fk', 'fui', 'fii', 'fki',
    // HWID
    'hcore', 'hraw', 'hfp',
    'ploc', 'pid', 'plid', 'jid', 'gid',
    // Control flow / VM
    'vm', 'vms', 'vmr', 'vmi', 'vmc', 'vmx', 'vmp', 'vmq',
    'cfs', 'cfa', 'vreg', 'cfd', 'cfx',
    // Anti-tamper
    'atc', 'ati', 'atv', 'ath',
    // Network
    'nurl', 'hstat', 'hres', 'nret',
    // Loaders
    'esfn', 'efn', 'lfn', 'xfn',
    // Anti-debug
    'adb', 'adbt', 'adbr', 'adbc',
    // Environment
    'envchk', 'envr', 'envt',
    // Timing
    'tmst', 'tmen', 'tmdf', 'tmth',
    // Decoys
    'dcoy1', 'dcoy2', 'dcoy3', 'trap1', 'trap2', 'trap3',
    // Integrity
    'intc', 'inth', 'intv',
    // Temp vars (extensive)
    ...Array.from({length: 100}, (_, i) => `t${i}`),
    // More temps
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'p', 'q', 'r', 's', 'u', 'w', 'x', 'y', 'z',
  ];
  varNames.forEach(name => v[name] = generateValidName());

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 7: VM States and Control Flow
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const states: number[] = [];
  for (let i = 0; i < 40; i++) {
    let state;
    do {
      state = Math.floor(Math.random() * 9000000) + 1000000;
    } while (states.includes(state));
    states.push(state);
  }
  
  const [
    S_INIT, S_ANTIDBG1, S_ANTIDBG2, S_ENVCHK, S_TAMPER1, S_TAMPER2,
    S_OPCHK1, S_OPCHK2, S_HWID, S_URLBUILD1, S_URLBUILD2, S_URLBUILD3,
    S_INTCHK1, S_INTCHK2, S_INTCHK3, S_URLASM, S_HTTP, S_VALIDATE,
    S_DECODE, S_LOAD, S_EXEC, S_END,
    S_TRAP1, S_TRAP2, S_TRAP3, S_TRAP4, S_TRAP5,
    S_DCOY1, S_DCOY2, S_DCOY3, S_DCOY4, S_DCOY5,
    S_DEAD1, S_DEAD2, S_DEAD3, S_DEAD4, S_DEAD5,
    S_LOOP1, S_LOOP2, S_LOOP3
  ] = states;

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 8: Advanced Junk Code Generator
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const genJunk = (): string => {
    const jv = () => v[`t${Math.floor(Math.random() * 100)}`] || v['a'];
    const rn = () => Math.floor(Math.random() * 99999);
    const rs = () => Math.random().toString(36).substring(2, 8);
    const templates = [
      () => `local ${jv()}=${rn()}`,
      () => `local ${jv()}={}`,
      () => `local ${jv()}="${rs()}"`,
      () => `if false then local ${jv()}=${rn()} end`,
      () => `do local ${jv()}=${rn()} end`,
      () => `local ${jv()}=${rn()}+${rn()}-${rn()}`,
      () => `local ${jv()}=${rn()}*0+${rn()}*0`,
      () => `local ${jv()}=nil or nil`,
      () => `local ${jv()}=function()return ${rn()} end`,
      () => `if ${rn()}>9999999 then local ${jv()}=${rn()} end`,
      () => `for ${jv()}=1,0 do end`,
      () => `while false do local ${jv()}=${rn()} end`,
      () => `local ${jv()}=(function()return ${rn()} end)()`,
      () => `local ${jv()}=select(1,${rn()})`,
      () => `local ${jv()}=type(nil)`,
      () => `local ${jv()}=tostring(${rn()})`,
      () => `local ${jv()}=tonumber("${rn()}")`,
      () => `local ${jv()}=#{${rn()},${rn()}}`,
      () => `local ${jv()}=rawequal(nil,nil)and ${rn()}`,
      () => `local ${jv()}=not not nil and ${rn()}`,
    ];
    return templates[Math.floor(Math.random() * templates.length)]();
  };
  
  const junkBlock = (count: number): string => {
    return Array(count).fill(0).map(() => genJunk()).join('\n');
  };
  
  // Realistic-looking decoy function
  const genDecoyFunc = (name: string): string => {
    const dv = Array.from({length: 5}, () => generateValidName(8, 12));
    const ops = ['+', '-', '*', '%'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    return `local function ${name}(${dv[0]},${dv[1]})
local ${dv[2]}={}
for ${dv[3]}=1,#${dv[0]} do
local ${dv[4]}=${dv[0]}[${dv[3]}]${op}${Math.floor(Math.random() * 256)}
${dv[2]}[${dv[3]}]=${v.schr}(${dv[4]}%256)
end
return ${v.scat}(${dv[2]})
end`;
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // SECTION 9: Build the Ultra-Obfuscated Script
  // ═══════════════════════════════════════════════════════════════════════════════

  const script = `--[=[DefendLua Protected]=]
${junkBlock(5)}
local ${v.bxor}=bit32 and bit32.bxor or function(${v.a},${v.b})
local ${v.c},${v.d}=0,1
while ${v.a}>0 or ${v.b}>0 do
local ${v.e},${v.f}=${v.a}%2,${v.b}%2
if ${v.e}~=${v.f} then ${v.c}=${v.c}+${v.d} end
${v.a},${v.b},${v.d}=math.floor(${v.a}/2),math.floor(${v.b}/2),${v.d}*2
end
return ${v.c}
end
${junkBlock(2)}
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
local ${v.ror}=function(${v.a},${v.b})return ${v.bor}(${v.rsh}(${v.a},${v.b}),${v.band}(${v.lsh}(${v.a},8-${v.b}),255))end
local ${v.rol}=function(${v.a},${v.b})return ${v.bor}(${v.band}(${v.lsh}(${v.a},${v.b}),255),${v.rsh}(${v.a},8-${v.b}))end
${junkBlock(3)}
local ${v.schr},${v.sbyte},${v.ssub},${v.slen}=string.char,string.byte,string.sub,string.len
local ${v.scat},${v.srep}=table.concat,string.rep
local ${v.mfloor},${v.mrand},${v.mabs}=math.floor,math.random,math.abs
local ${v.mmin},${v.mmax}=math.min,math.max
local ${v.pcl},${v.ld}=pcall,loadstring or load
local ${v.typ},${v.prs},${v.tck}=type,pairs,tick or os.clock
local ${v.tstr},${v.tnum}=tostring,tonumber
local ${v.raw},${v.sel}=rawget,select
${junkBlock(2)}
local ${v.gref}=game
local ${v.gsvc}=${v.gref}.GetService
local ${v.plrs}=${v.gsvc}(${v.gref},"Players")
${junkBlock(1)}
local ${v.sb0}={${sboxes[0].join(',')}}
local ${v.sb1}={${sboxes[1].join(',')}}
local ${v.sb2}={${sboxes[2].join(',')}}
local ${v.sb3}={${sboxes[3].join(',')}}
local ${v.sbi0}={${sboxInvs[0].join(',')}}
local ${v.sbi1}={${sboxInvs[1].join(',')}}
local ${v.sbi2}={${sboxInvs[2].join(',')}}
local ${v.sbi3}={${sboxInvs[3].join(',')}}
${junkBlock(2)}
local ${v.ks}={${seeds.join(',')}}
local ${v.mc}={${magicConstants.join(',')}}
local ${v.ik}={${integrityKeys.join(',')}}
local ${v.ts}=${tamperSignature}
local ${v.pt}={${permTable.join(',')}}
${junkBlock(1)}
local ${v.opA},${v.opB},${v.opC},${v.opD}=${opaqueA},${opaqueB},${opaqueC},${opaqueD}
${junkBlock(2)}
local ${v.opChk}=function()
local ${v.opV1}=(${v.opB}%2==1)
local ${v.opV2}=((${v.opA}*${v.opA})%997==${v.opC})
local ${v.t0}=((${v.opA}+${v.opB})%503==${v.opD})
return ${v.opV1} and ${v.opV2} and ${v.t0}
end
${junkBlock(1)}
local ${v.dkey}=function(${v.g},${v.h})
local ${v.t1}=${v.ks}[(${v.h}%#${v.ks})+1]
local ${v.t2}=${v.mc}[(${v.h}%#${v.mc})+1]
return ${v.bxor}((${v.t1}*7+${v.g}*13+${v.t2}*17),${v.rsh}(${v.t1},3))%256
end
${junkBlock(1)}
local ${v.dint}=function(${v.n})
local ${v.t3}=${v.ik}[1]
for ${v.t4}=1,#${v.n} do
${v.t3}=${v.bor}(${v.lsh}(${v.t3},5)-${v.t3}+${v.n}[${v.t4}],0)
${v.t3}=${v.bxor}(${v.t3},${v.ik}[(${v.t4}%#${v.ik})+1])
end
return ${v.t3}
end
${junkBlock(2)}
${genDecoyFunc(v.dcoy1)}
${junkBlock(1)}
${genDecoyFunc(v.dcoy2)}
${junkBlock(1)}
${genDecoyFunc(v.dcoy3)}
${junkBlock(2)}
local ${v.dcr}=function(${v.n})
local ${v.p}={}
for ${v.q}=1,#${v.n} do
local ${v.r}=${v.n}[${v.q}]
local ${v.s}=(${v.q}-1)
${v.r}=${v.bxor}(${v.r},(${v.s}*${v.mc}[2])%256)
${v.r}=(${v.r}-${v.mc}[3])%256
if ${v.r}<0 then ${v.r}=${v.r}+256 end
${v.r}=${v.sbi3}[${v.r}+1]
local ${v.t5}=${v.dkey}(${v.s},2)
${v.r}=${v.bxor}(${v.r},${v.t5})
local ${v.t6}=((${v.s}+3)%5)+2
${v.r}=${v.rol}(${v.r},${v.t6})
${v.r}=${v.sbi2}[${v.r}+1]
${v.r}=(${v.r}-(${v.s}*${v.mc}[1]))%256
if ${v.r}<0 then ${v.r}=${v.r}+256 end
${v.r}=${v.sbi1}[${v.r}+1]
local ${v.t7}=${v.dkey}(${v.s},1)
${v.r}=${v.bxor}(${v.r},${v.t7})
local ${v.t8}=(${v.s}%7)+1
${v.r}=${v.ror}(${v.r},${v.t8})
${v.r}=${v.sbi0}[${v.r}+1]
local ${v.t9}=${v.dkey}(${v.s},0)
${v.r}=${v.bxor}(${v.r},${v.t9})
${v.p}[${v.q}]=${v.schr}(${v.r})
end
return ${v.scat}(${v.p})
end
${junkBlock(3)}
local ${v.fu}={}
${encryptedUrl.map((f, i) => `${v.fu}[${i + 1}]={${f.join(',')}}`).join('\n')}
local ${v.fui}=${urlIntegrity}
local ${v.fi}={}
${encryptedId.map((f, i) => `${v.fi}[${i + 1}]={${f.join(',')}}`).join('\n')}
local ${v.fii}=${idIntegrity}
local ${v.fk}={}
${encryptedKey.map((f, i) => `${v.fk}[${i + 1}]={${f.join(',')}}`).join('\n')}
local ${v.fki}=${keyIntegrity}
${junkBlock(2)}
local ${v.adb}=function()
local ${v.adbt}=${v.tck}()
local ${v.adbc}=0
for ${v.t10}=1,50000 do
${v.adbc}=${v.adbc}+1
if ${v.adbc}%10000==0 then
local ${v.t11}=${v.adbc}
end
end
local ${v.adbr}=${v.tck}()
return (${v.adbr}-${v.adbt})<2
end
${junkBlock(1)}
local ${v.envchk}=function()
local ${v.envr}=${v.typ}(${v.gref})=="userdata"
local ${v.envt}=${v.typ}(${v.plrs})=="userdata"
local ${v.t12}=false
${v.pcl}(function()${v.t12}=${v.typ}(${v.gref}.HttpGet)=="function" end)
return ${v.envr} and ${v.envt}
end
${junkBlock(2)}
local ${v.atc}=function()
local ${v.t13}=0
for ${v.t14}=1,#${v.ks} do
${v.t13}=(${v.t13}*31+${v.ks}[${v.t14}])%2147483647
end
return ${v.t13}==${v.ts}
end
${junkBlock(1)}
local ${v.intc}=function(${v.t15},${v.t16})
local ${v.t17}={}
for ${v.t18}=1,#${v.t15} do
for ${v.t19}=1,#${v.t15}[${v.t18}] do
${v.t17}[#${v.t17}+1]=${v.t15}[${v.t18}][${v.t19}]
end
end
return ${v.dint}(${v.t17})==${v.t16}
end
${junkBlock(2)}
local ${v.hcore}=function()
local ${v.hraw}=nil
local ${v.hfp}={}
${v.pcl}(function()
if gethwid then ${v.hraw}=gethwid()${v.hfp}[1]=1 end
if not ${v.hraw} and getexecutorhwid then ${v.hraw}=getexecutorhwid()${v.hfp}[2]=1 end
if not ${v.hraw} and get_hwid then ${v.hraw}=get_hwid()${v.hfp}[3]=1 end
if not ${v.hraw} and identifyexecutor then
local ${v.w},${v.x}=${v.pcl}(identifyexecutor)
if ${v.w} and ${v.x} then ${v.hraw}=${v.x}..${v.tstr}(${v.mfloor}(${v.tck}()*1000))${v.hfp}[4]=1 end
end
if not ${v.hraw} and HWID then ${v.hraw}=HWID ${v.hfp}[5]=1 end
if not ${v.hraw} and Cryptic then ${v.pcl}(function()${v.hraw}=Cryptic:GetHWID()${v.hfp}[6]=1 end)end
if not ${v.hraw} and syn then ${v.pcl}(function()${v.hraw}=syn.hwid()${v.hfp}[7]=1 end)end
if not ${v.hraw} and fluxus then ${v.pcl}(function()${v.hraw}=fluxus:GetHWID()${v.hfp}[8]=1 end)end
if not ${v.hraw} and getgenv then ${v.pcl}(function()local ${v.y}=getgenv()if ${v.y} and ${v.y}._hwid then ${v.hraw}=${v.y}._hwid ${v.hfp}[9]=1 end end)end
if not ${v.hraw} and request then ${v.pcl}(function()${v.hraw}=request({Url=""}).Headers["Syn-Fingerprint"]${v.hfp}[10]=1 end)end
if not ${v.hraw} and http_request then ${v.pcl}(function()${v.hraw}=http_request({Url=""}).Headers["Syn-Fingerprint"]${v.hfp}[11]=1 end)end
end)
if not ${v.hraw} then
${v.pcl}(function()
local ${v.ploc}=${v.plrs}.LocalPlayer
if ${v.ploc} then
local ${v.pid}=${v.tstr}(${v.ploc}.UserId)
local ${v.plid}=${v.tstr}(${v.gref}.PlaceId)
local ${v.jid}=${v.ssub}(${v.tstr}(${v.gref}.JobId),1,8)
local ${v.gid}=${v.tstr}(${v.gref}.GameId)
${v.hraw}=${v.pid}.."_"..${v.plid}.."_"..${v.jid}.."_"..${v.gid}
end
end)
end
if not ${v.hraw} then
${v.hraw}="DL_"..${v.tstr}(${v.mfloor}(${v.tck}()*100000)).."_"..${v.tstr}(${v.mfloor}(${v.mrand}()*999999))
end
return ${v.hraw}
end
${junkBlock(3)}
local ${v.vm}={}
local ${v.vreg}={}
local ${v.vms}=${S_INIT}
local ${v.vmc}=0
local ${v.vmx}=500
${junkBlock(2)}
${v.vm}[${S_INIT}]=function()
${v.vreg}[99]=${v.tck}()
return ${S_ANTIDBG1}
end
${v.vm}[${S_ANTIDBG1}]=function()
if ${v.adb}() then return ${S_ANTIDBG2} else return ${S_ANTIDBG2} end
end
${v.vm}[${S_ANTIDBG2}]=function()
local ${v.tmdf}=${v.tck}()-${v.vreg}[99]
if ${v.tmdf}<10 then return ${S_ENVCHK} else return ${S_TRAP1} end
end
${v.vm}[${S_ENVCHK}]=function()
if ${v.envchk}() then return ${S_TAMPER1} else return ${S_TRAP2} end
end
${v.vm}[${S_TAMPER1}]=function()
if ${v.atc}() then return ${S_TAMPER2} else return ${S_TRAP3} end
end
${v.vm}[${S_TAMPER2}]=function()
if ${v.opChk}() then return ${S_OPCHK1} else return ${S_TRAP4} end
end
${v.vm}[${S_OPCHK1}]=function()
local ${v.t20}=(${v.opB}-${v.opA}*2)==1
if ${v.t20} then return ${S_OPCHK2} else return ${S_TRAP5} end
end
${v.vm}[${S_OPCHK2}]=function()
return ${S_HWID}
end
${v.vm}[${S_HWID}]=function()
${v.vreg}[1]=${v.hcore}()
return ${S_URLBUILD1}
end
${v.vm}[${S_URLBUILD1}]=function()
local ${v.t21}=""
for ${v.t22}=1,#${v.fu} do
${v.t21}=${v.t21}..${v.dcr}(${v.fu}[${v.t22}])
end
${v.vreg}[2]=${v.t21}
return ${S_INTCHK1}
end
${v.vm}[${S_INTCHK1}]=function()
if ${v.intc}(${v.fu},${v.fui}) then return ${S_URLBUILD2} else return ${S_TRAP1} end
end
${v.vm}[${S_URLBUILD2}]=function()
local ${v.t23}=""
for ${v.t24}=1,#${v.fi} do
${v.t23}=${v.t23}..${v.dcr}(${v.fi}[${v.t24}])
end
${v.vreg}[3]=${v.t23}
return ${S_INTCHK2}
end
${v.vm}[${S_INTCHK2}]=function()
if ${v.intc}(${v.fi},${v.fii}) then return ${S_URLBUILD3} else return ${S_TRAP2} end
end
${v.vm}[${S_URLBUILD3}]=function()
local ${v.t25}=""
for ${v.t26}=1,#${v.fk} do
${v.t25}=${v.t25}..${v.dcr}(${v.fk}[${v.t26}])
end
${v.vreg}[4]=${v.t25}
return ${S_INTCHK3}
end
${v.vm}[${S_INTCHK3}]=function()
if ${v.intc}(${v.fk},${v.fki}) then return ${S_URLASM} else return ${S_TRAP3} end
end
${v.vm}[${S_URLASM}]=function()
${v.nurl}=${v.vreg}[2]..${v.vreg}[3]..${v.vreg}[4]..${v.vreg}[1]
return ${S_HTTP}
end
${v.vm}[${S_HTTP}]=function()
local ${v.hstat},${v.hres}=${v.pcl}(function()return ${v.gref}:HttpGet(${v.nurl})end)
if ${v.hstat} and ${v.hres} and ${v.slen}(${v.hres})>0 then
${v.vreg}[5]=${v.hres}
return ${S_VALIDATE}
else
return ${S_END}
end
end
${v.vm}[${S_VALIDATE}]=function()
if ${v.slen}(${v.vreg}[5] or "")>10 then return ${S_LOAD} else return ${S_END} end
end
${v.vm}[${S_LOAD}]=function()
local ${v.esfn},${v.efn}=${v.pcl}(${v.ld},${v.vreg}[5])
if ${v.esfn} and ${v.typ}(${v.efn})=="function" then
${v.vreg}[6]=${v.efn}
return ${S_EXEC}
else
return ${S_END}
end
end
${v.vm}[${S_EXEC}]=function()
${v.pcl}(${v.vreg}[6])
return ${S_END}
end
${junkBlock(1)}
${v.vm}[${S_TRAP1}]=function()${v.dcoy1}({${Math.floor(Math.random()*256)}})return ${S_END} end
${v.vm}[${S_TRAP2}]=function()${v.dcoy2}({${Math.floor(Math.random()*256)}})return ${S_END} end
${v.vm}[${S_TRAP3}]=function()${v.dcoy3}({${Math.floor(Math.random()*256)}})return ${S_END} end
${v.vm}[${S_TRAP4}]=function()return ${S_END} end
${v.vm}[${S_TRAP5}]=function()return ${S_END} end
${v.vm}[${S_DCOY1}]=function()${v.dcoy1}({1,2,3})return ${S_TRAP1} end
${v.vm}[${S_DCOY2}]=function()${v.dcoy2}({4,5,6})return ${S_TRAP2} end
${v.vm}[${S_DCOY3}]=function()${v.dcoy3}({7,8,9})return ${S_TRAP3} end
${v.vm}[${S_DCOY4}]=function()return ${S_DEAD1} end
${v.vm}[${S_DCOY5}]=function()return ${S_DEAD2} end
${v.vm}[${S_DEAD1}]=function()return ${S_DEAD2} end
${v.vm}[${S_DEAD2}]=function()return ${S_DEAD3} end
${v.vm}[${S_DEAD3}]=function()return ${S_END} end
${v.vm}[${S_DEAD4}]=function()return ${S_END} end
${v.vm}[${S_DEAD5}]=function()return ${S_END} end
${v.vm}[${S_LOOP1}]=function()return ${S_LOOP2} end
${v.vm}[${S_LOOP2}]=function()return ${S_LOOP3} end
${v.vm}[${S_LOOP3}]=function()return ${S_END} end
${v.vm}[${S_END}]=function()return nil end
${junkBlock(3)}
local ${v.cfa}=true
while ${v.cfa} and ${v.vmc}<${v.vmx} do
${v.vmc}=${v.vmc}+1
local ${v.vmp}=${v.vm}[${v.vms}]
if ${v.vmp} then
local ${v.vmq}=${v.vmp}()
if ${v.vmq} then
${v.vms}=${v.vmq}
else
${v.cfa}=false
end
else
${v.cfa}=false
end
end
${junkBlock(5)}
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
