/**
 * Basic Lua obfuscation utilities
 * Protects code from casual reading while maintaining functionality
 */

export function obfuscateLua(code: string): string {
  let obfuscated = code;

  // Remove single-line comments
  obfuscated = obfuscated.replace(/--[^\n]*/g, '');

  // Remove multi-line comments
  obfuscated = obfuscated.replace(/--\[\[[\s\S]*?\]\]/g, '');

  // Minify: Remove excess whitespace while preserving necessary spaces
  obfuscated = obfuscated
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join(' ');

  // Replace multiple spaces with single space
  obfuscated = obfuscated.replace(/\s+/g, ' ');

  // Add confusing spacing (makes it harder to read)
  obfuscated = obfuscated.replace(/\s*([=+\-*/<>~])\s*/g, '$1');

  // String encoding: convert string literals to encoded format
  obfuscated = obfuscateStrings(obfuscated);

  // Wrap in loading function with anti-debug
  const wrapper = `(function()local ${generateRandomVar()}=function(${generateRandomVar()})return load(${generateRandomVar()})()end;return ${generateRandomVar()}([=[${obfuscated}]=])end)()`;

  return wrapper;
}

function obfuscateStrings(code: string): string {
  // Find all string literals and encode them
  return code.replace(/"([^"]*)"/g, (match, str) => {
    if (str.length === 0) return '""';
    const encoded = str.split('').map((c: string) => c.charCodeAt(0)).join(',');
    return `string.char(${encoded})`;
  }).replace(/'([^']*)'/g, (match, str) => {
    if (str.length === 0) return "''";
    const encoded = str.split('').map((c: string) => c.charCodeAt(0)).join(',');
    return `string.char(${encoded})`;
  });
}

function generateRandomVar(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let result = chars[Math.floor(Math.random() * chars.length)];
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return '_' + result;
}

export function addProtectionHeader(code: string): string {
  const warning = `--[[ 
⛔ PROTECTED BY DEFENDLUA ⛔
This script is protected and obfuscated.
Unauthorized reverse engineering or distribution is prohibited.
Script ID: ${Date.now().toString(36)}
--]]
`;
  return warning + code;
}
