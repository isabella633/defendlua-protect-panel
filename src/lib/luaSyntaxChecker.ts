export interface SyntaxError {
  line: number;
  message: string;
}

export function checkLuaSyntax(code: string): SyntaxError[] {
  const errors: SyntaxError[] = [];
  const lines = code.split('\n');
  
  // Track block structures
  const blockStack: Array<{ keyword: string; line: number }> = [];
  
  // Keywords that start blocks
  const blockStarters = ['function', 'if', 'for', 'while', 'repeat', 'do'];
  const blockEnders = ['end', 'until'];
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();
    
    // Skip comments and empty lines
    if (trimmed.startsWith('--') || trimmed === '') return;
    
    // Check for unmatched quotes
    const singleQuotes = (trimmed.match(/'/g) || []).length;
    const doubleQuotes = (trimmed.match(/"/g) || []).length;
    
    if (singleQuotes % 2 !== 0) {
      errors.push({ line: lineNum, message: "Unmatched single quote" });
    }
    if (doubleQuotes % 2 !== 0) {
      errors.push({ line: lineNum, message: "Unmatched double quote" });
    }
    
    // Check for unmatched parentheses on this line
    const openParens = (trimmed.match(/\(/g) || []).length;
    const closeParens = (trimmed.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      errors.push({ line: lineNum, message: "Unmatched parentheses" });
    }
    
    // Check for unmatched brackets
    const openBrackets = (trimmed.match(/\[/g) || []).length;
    const closeBrackets = (trimmed.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      errors.push({ line: lineNum, message: "Unmatched brackets" });
    }
    
    // Track block structures
    blockStarters.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`);
      if (regex.test(trimmed)) {
        blockStack.push({ keyword, line: lineNum });
      }
    });
    
    if (trimmed.includes('end')) {
      if (blockStack.length > 0) {
        blockStack.pop();
      } else {
        errors.push({ line: lineNum, message: "Unexpected 'end' - no matching block starter" });
      }
    }
    
    if (trimmed.startsWith('until')) {
      const lastBlock = blockStack[blockStack.length - 1];
      if (!lastBlock || lastBlock.keyword !== 'repeat') {
        errors.push({ line: lineNum, message: "'until' without matching 'repeat'" });
      } else {
        blockStack.pop();
      }
    }
    
    // Check for common Lua syntax errors
    if (trimmed.includes('==') && /\b(if|elseif|while)\s+.*[^=!<>]=(?!=)/.test(trimmed)) {
      errors.push({ line: lineNum, message: "Possible assignment in condition (use '==' for comparison)" });
    }
    
    // Check for 'then' after if/elseif
    if (/\b(if|elseif)\b/.test(trimmed) && !trimmed.includes('then') && !trimmed.endsWith('\\')) {
      errors.push({ line: lineNum, message: "Missing 'then' after if/elseif statement" });
    }
    
    // Check for 'do' after for/while
    if (/\b(for|while)\b/.test(trimmed) && !trimmed.includes('do') && !trimmed.endsWith('\\')) {
      errors.push({ line: lineNum, message: "Missing 'do' after for/while statement" });
    }
  });
  
  // Check for unclosed blocks
  if (blockStack.length > 0) {
    blockStack.forEach(block => {
      errors.push({ 
        line: block.line, 
        message: `Unclosed '${block.keyword}' block - missing 'end'` 
      });
    });
  }
  
  return errors;
}
