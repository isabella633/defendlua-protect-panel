export interface SyntaxError {
  line: number;
  message: string;
  severity: 'error' | 'warning';
}

export function checkLuaSyntax(code: string): SyntaxError[] {
  const errors: SyntaxError[] = [];
  const lines = code.split('\n');
  
  // Track block structures
  const blockStack: Array<{ keyword: string; line: number }> = [];
  
  // Keywords that start blocks
  const blockStarters = ['function', 'if', 'for', 'while', 'repeat', 'do'];
  
  // Track multi-line strings
  let inMultiLineString = false;
  let multiLineStringStart = 0;
  
  // Track multi-line comments
  let inMultiLineComment = false;
  let multiLineCommentStart = 0;
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();
    
    // Handle multi-line comments
    if (trimmed.includes('--[[') && !inMultiLineComment) {
      inMultiLineComment = true;
      multiLineCommentStart = lineNum;
    }
    if (inMultiLineComment) {
      if (trimmed.includes(']]')) {
        inMultiLineComment = false;
      }
      return;
    }
    
    // Handle multi-line strings
    if (trimmed.includes('[[') && !trimmed.includes('--[[') && !inMultiLineString) {
      inMultiLineString = true;
      multiLineStringStart = lineNum;
    }
    if (inMultiLineString) {
      if (trimmed.includes(']]')) {
        inMultiLineString = false;
      }
      return;
    }
    
    // Skip single-line comments and empty lines
    if (trimmed.startsWith('--') || trimmed === '') return;
    
    // Remove string contents to avoid false positives
    const lineWithoutStrings = trimmed
      .replace(/"[^"]*"/g, '""')
      .replace(/'[^']*'/g, "''");
    
    // Check for unmatched quotes
    const singleQuotes = (trimmed.match(/'/g) || []).length;
    const doubleQuotes = (trimmed.match(/"/g) || []).length;
    
    if (singleQuotes % 2 !== 0) {
      errors.push({ line: lineNum, message: "Unmatched single quote", severity: 'error' });
    }
    if (doubleQuotes % 2 !== 0) {
      errors.push({ line: lineNum, message: "Unmatched double quote", severity: 'error' });
    }
    
    // Check for unmatched parentheses on this line
    const openParens = (lineWithoutStrings.match(/\(/g) || []).length;
    const closeParens = (lineWithoutStrings.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      errors.push({ line: lineNum, message: "Unmatched parentheses", severity: 'error' });
    }
    
    // Check for unmatched brackets
    const openBrackets = (lineWithoutStrings.match(/\[(?!\[)/g) || []).length;
    const closeBrackets = (lineWithoutStrings.match(/\](?!\])/g) || []).length;
    if (openBrackets !== closeBrackets) {
      errors.push({ line: lineNum, message: "Unmatched brackets", severity: 'error' });
    }
    
    // Check for unmatched braces
    const openBraces = (lineWithoutStrings.match(/\{/g) || []).length;
    const closeBraces = (lineWithoutStrings.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push({ line: lineNum, message: "Unmatched curly braces", severity: 'error' });
    }
    
    // Track block structures (only if not inside a string)
    blockStarters.forEach(keyword => {
      // Match keyword as whole word, not inside strings
      const regex = new RegExp(`\\b${keyword}\\b`);
      if (regex.test(lineWithoutStrings)) {
        // Don't count 'end' on the same line for inline functions
        if (!lineWithoutStrings.includes('end')) {
          blockStack.push({ keyword, line: lineNum });
        } else {
          // Check if there's a matching end on the same line
          const keywordCount = (lineWithoutStrings.match(new RegExp(`\\b${keyword}\\b`, 'g')) || []).length;
          const endCount = (lineWithoutStrings.match(/\bend\b/g) || []).length;
          if (keywordCount > endCount) {
            blockStack.push({ keyword, line: lineNum });
          }
        }
      }
    });
    
    // Count standalone 'end' keywords
    const endMatches = lineWithoutStrings.match(/\bend\b/g) || [];
    const starterMatches = blockStarters.reduce((count, kw) => {
      return count + ((lineWithoutStrings.match(new RegExp(`\\b${kw}\\b`, 'g')) || []).length);
    }, 0);
    
    const standaloneEnds = endMatches.length - starterMatches;
    for (let i = 0; i < standaloneEnds; i++) {
      if (blockStack.length > 0) {
        blockStack.pop();
      } else {
        errors.push({ line: lineNum, message: "Unexpected 'end' - no matching block starter", severity: 'error' });
      }
    }
    
    if (trimmed.startsWith('until')) {
      const lastBlock = blockStack[blockStack.length - 1];
      if (!lastBlock || lastBlock.keyword !== 'repeat') {
        errors.push({ line: lineNum, message: "'until' without matching 'repeat'", severity: 'error' });
      } else {
        blockStack.pop();
      }
    }
    
    // Check for 'then' after if/elseif (only if not a multi-line statement)
    if (/\b(if|elseif)\b/.test(lineWithoutStrings) && !lineWithoutStrings.includes('then')) {
      // Check if it's likely a complete statement
      if (!trimmed.endsWith(',') && !trimmed.endsWith('and') && !trimmed.endsWith('or')) {
        errors.push({ line: lineNum, message: "Missing 'then' after if/elseif statement", severity: 'error' });
      }
    }
    
    // Check for 'do' after for/while
    if (/\b(for|while)\b/.test(lineWithoutStrings) && !lineWithoutStrings.includes('do')) {
      if (!trimmed.endsWith(',')) {
        errors.push({ line: lineNum, message: "Missing 'do' after for/while statement", severity: 'error' });
      }
    }
    
    // Check for common mistakes - using = instead of == in conditions
    if (/\b(if|elseif|while)\s+[^=]*[^=!<>]=[^=]/.test(lineWithoutStrings)) {
      errors.push({ line: lineNum, message: "Possible assignment in condition (use '==' for comparison)", severity: 'warning' });
    }
    
    // Check for != instead of ~=
    if (lineWithoutStrings.includes('!=')) {
      errors.push({ line: lineNum, message: "Use '~=' instead of '!=' for not-equal comparison", severity: 'error' });
    }
    
    // Check for && instead of 'and'
    if (lineWithoutStrings.includes('&&')) {
      errors.push({ line: lineNum, message: "Use 'and' instead of '&&' for logical AND", severity: 'error' });
    }
    
    // Check for || instead of 'or'
    if (lineWithoutStrings.includes('||')) {
      errors.push({ line: lineNum, message: "Use 'or' instead of '||' for logical OR", severity: 'error' });
    }
    
    // Check for ! instead of 'not' (but not in strings or !=)
    if (/(?<![~=])!(?!=)/.test(lineWithoutStrings)) {
      errors.push({ line: lineNum, message: "Use 'not' instead of '!' for logical NOT", severity: 'warning' });
    }
    
    // Check for ++ or -- operators
    if (/\+\+|--(?!\[)/.test(lineWithoutStrings.replace(/--.*$/, ''))) {
      if (lineWithoutStrings.includes('++')) {
        errors.push({ line: lineNum, message: "Lua doesn't have '++' operator, use 'x = x + 1'", severity: 'error' });
      }
    }
    
    // Check for invalid variable names starting with numbers
    if (/\blocal\s+\d/.test(lineWithoutStrings)) {
      errors.push({ line: lineNum, message: "Variable names cannot start with a number", severity: 'error' });
    }
    
    // Check for missing comma in table constructors
    if (/\}\s*\{/.test(lineWithoutStrings)) {
      errors.push({ line: lineNum, message: "Possible missing comma between table elements", severity: 'warning' });
    }
    
    // Check for elseif written as 'else if'
    if (/\belse\s+if\b/.test(lineWithoutStrings)) {
      errors.push({ line: lineNum, message: "Use 'elseif' instead of 'else if'", severity: 'error' });
    }
    
    // Check for nil comparison that could be simplified
    if (/==\s*nil\b|\bnil\s*==/.test(lineWithoutStrings)) {
      errors.push({ line: lineNum, message: "Consider using 'not x' instead of 'x == nil'", severity: 'warning' });
    }
    
    // Check for empty function body (potential incomplete code)
    if (/\bfunction\s*\([^)]*\)\s*end\b/.test(lineWithoutStrings)) {
      errors.push({ line: lineNum, message: "Empty function body detected", severity: 'warning' });
    }
    
    // Check for semicolons (not needed in Lua but allowed)
    if (lineWithoutStrings.includes(';')) {
      errors.push({ line: lineNum, message: "Semicolons are optional in Lua", severity: 'warning' });
    }
  });
  
  // Check for unclosed multi-line comments
  if (inMultiLineComment) {
    errors.push({ 
      line: multiLineCommentStart, 
      message: "Unclosed multi-line comment starting with '--[['", 
      severity: 'error' 
    });
  }
  
  // Check for unclosed multi-line strings
  if (inMultiLineString) {
    errors.push({ 
      line: multiLineStringStart, 
      message: "Unclosed multi-line string starting with '[['", 
      severity: 'error' 
    });
  }
  
  // Check for unclosed blocks
  if (blockStack.length > 0) {
    blockStack.forEach(block => {
      errors.push({ 
        line: block.line, 
        message: `Unclosed '${block.keyword}' block - missing 'end'`,
        severity: 'error'
      });
    });
  }
  
  // Sort by line number, then severity
  return errors.sort((a, b) => {
    if (a.line !== b.line) return a.line - b.line;
    if (a.severity === 'error' && b.severity === 'warning') return -1;
    if (a.severity === 'warning' && b.severity === 'error') return 1;
    return 0;
  });
}

// Get a summary of errors
export function getSyntaxSummary(errors: SyntaxError[]): { errorCount: number; warningCount: number } {
  return {
    errorCount: errors.filter(e => e.severity === 'error').length,
    warningCount: errors.filter(e => e.severity === 'warning').length
  };
}