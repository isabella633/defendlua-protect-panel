export interface SyntaxError {
  line: number;
  message: string;
  severity: 'error' | 'warning';
  autoFix?: AutoFix;
}

export interface AutoFix {
  description: string;
  search: string;
  replace: string;
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
    // Skip parenthesis check for lines that are just 'end)' or 'end,' or similar callback closures
    // These are valid Lua patterns for closing anonymous functions passed as arguments
    const isCallbackClosure = /^\s*end\s*[,\)]/.test(trimmed) || /^\s*\}\s*[,\)]/.test(trimmed);
    
    if (!isCallbackClosure) {
      const openParens = (lineWithoutStrings.match(/\(/g) || []).length;
      const closeParens = (lineWithoutStrings.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        errors.push({ line: lineNum, message: "Unmatched parentheses", severity: 'error' });
      }
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
      const regex = new RegExp(`\\b${keyword}\\b`);
      if (regex.test(lineWithoutStrings)) {
        if (!lineWithoutStrings.includes('end')) {
          blockStack.push({ keyword, line: lineNum });
        } else {
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
    
    // Check for 'then' after if/elseif
    if (/\b(if|elseif)\b/.test(lineWithoutStrings) && !lineWithoutStrings.includes('then')) {
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
    
    // Check for != instead of ~= (with auto-fix)
    if (lineWithoutStrings.includes('!=')) {
      const match = line.match(/!=/);
      if (match) {
        errors.push({ 
          line: lineNum, 
          message: "Use '~=' instead of '!=' for not-equal comparison", 
          severity: 'error',
          autoFix: {
            description: "Replace '!=' with '~='",
            search: '!=',
            replace: '~='
          }
        });
      }
    }
    
    // Check for && instead of 'and' (with auto-fix)
    if (lineWithoutStrings.includes('&&')) {
      errors.push({ 
        line: lineNum, 
        message: "Use 'and' instead of '&&' for logical AND", 
        severity: 'error',
        autoFix: {
          description: "Replace '&&' with 'and'",
          search: '&&',
          replace: ' and '
        }
      });
    }
    
    // Check for || instead of 'or' (with auto-fix)
    if (lineWithoutStrings.includes('||')) {
      errors.push({ 
        line: lineNum, 
        message: "Use 'or' instead of '||' for logical OR", 
        severity: 'error',
        autoFix: {
          description: "Replace '||' with 'or'",
          search: '||',
          replace: ' or '
        }
      });
    }
    
    // Check for ! instead of 'not' (with auto-fix)
    const notMatch = lineWithoutStrings.match(/(?<![~=])!(?!=)(\w+)/);
    if (notMatch) {
      errors.push({ 
        line: lineNum, 
        message: "Use 'not' instead of '!' for logical NOT", 
        severity: 'warning',
        autoFix: {
          description: "Replace '!' with 'not '",
          search: `!${notMatch[1]}`,
          replace: `not ${notMatch[1]}`
        }
      });
    }
    
    // Check for ++ operator (with auto-fix)
    const incrementMatch = line.match(/(\w+)\s*\+\+/);
    if (incrementMatch) {
      errors.push({ 
        line: lineNum, 
        message: "Lua doesn't have '++' operator, use 'x = x + 1'", 
        severity: 'error',
        autoFix: {
          description: `Replace '${incrementMatch[1]}++' with '${incrementMatch[1]} = ${incrementMatch[1]} + 1'`,
          search: `${incrementMatch[1]}++`,
          replace: `${incrementMatch[1]} = ${incrementMatch[1]} + 1`
        }
      });
    }
    
    // Check for -- decrement operator (not comment)
    const decrementMatch = line.match(/(\w+)\s*--(?!\[)/);
    if (decrementMatch && !trimmed.startsWith('--')) {
      // Make sure it's not a comment
      const beforeDecrement = line.substring(0, line.indexOf(decrementMatch[0]));
      if (!beforeDecrement.includes('--')) {
        errors.push({ 
          line: lineNum, 
          message: "Lua doesn't have '--' operator, use 'x = x - 1'", 
          severity: 'error',
          autoFix: {
            description: `Replace '${decrementMatch[1]}--' with '${decrementMatch[1]} = ${decrementMatch[1]} - 1'`,
            search: `${decrementMatch[1]}--`,
            replace: `${decrementMatch[1]} = ${decrementMatch[1]} - 1`
          }
        });
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
    
    // Check for elseif written as 'else if' (with auto-fix)
    if (/\belse\s+if\b/.test(lineWithoutStrings)) {
      errors.push({ 
        line: lineNum, 
        message: "Use 'elseif' instead of 'else if'", 
        severity: 'error',
        autoFix: {
          description: "Replace 'else if' with 'elseif'",
          search: 'else if',
          replace: 'elseif'
        }
      });
    }
    
    // Check for nil comparison that could be simplified
    if (/==\s*nil\b|\bnil\s*==/.test(lineWithoutStrings)) {
      errors.push({ line: lineNum, message: "Consider using 'not x' instead of 'x == nil'", severity: 'warning' });
    }
    
    // Check for empty function body
    if (/\bfunction\s*\([^)]*\)\s*end\b/.test(lineWithoutStrings)) {
      errors.push({ line: lineNum, message: "Empty function body detected", severity: 'warning' });
    }
    
    // Check for semicolons
    if (lineWithoutStrings.includes(';')) {
      errors.push({ 
        line: lineNum, 
        message: "Semicolons are optional in Lua", 
        severity: 'warning',
        autoFix: {
          description: "Remove semicolon",
          search: ';',
          replace: ''
        }
      });
    }
    
    // Check for += operator (with auto-fix)
    const plusEqualsMatch = line.match(/(\w+)\s*\+=/);
    if (plusEqualsMatch) {
      errors.push({ 
        line: lineNum, 
        message: "Lua doesn't have '+=' operator", 
        severity: 'error',
        autoFix: {
          description: `Replace '${plusEqualsMatch[1]} +=' with '${plusEqualsMatch[1]} = ${plusEqualsMatch[1]} +'`,
          search: `${plusEqualsMatch[1]} +=`,
          replace: `${plusEqualsMatch[1]} = ${plusEqualsMatch[1]} +`
        }
      });
    }
    
    // Check for -= operator (with auto-fix)
    const minusEqualsMatch = line.match(/(\w+)\s*-=(?!-)/);
    if (minusEqualsMatch) {
      errors.push({ 
        line: lineNum, 
        message: "Lua doesn't have '-=' operator", 
        severity: 'error',
        autoFix: {
          description: `Replace '${minusEqualsMatch[1]} -=' with '${minusEqualsMatch[1]} = ${minusEqualsMatch[1]} -'`,
          search: `${minusEqualsMatch[1]} -=`,
          replace: `${minusEqualsMatch[1]} = ${minusEqualsMatch[1]} -`
        }
      });
    }
    
    // Check for *= operator (with auto-fix)
    const multiplyEqualsMatch = line.match(/(\w+)\s*\*=/);
    if (multiplyEqualsMatch) {
      errors.push({ 
        line: lineNum, 
        message: "Lua doesn't have '*=' operator", 
        severity: 'error',
        autoFix: {
          description: `Replace '${multiplyEqualsMatch[1]} *=' with '${multiplyEqualsMatch[1]} = ${multiplyEqualsMatch[1]} *'`,
          search: `${multiplyEqualsMatch[1]} *=`,
          replace: `${multiplyEqualsMatch[1]} = ${multiplyEqualsMatch[1]} *`
        }
      });
    }
    
    // Check for /= operator (with auto-fix)
    const divideEqualsMatch = line.match(/(\w+)\s*\/=/);
    if (divideEqualsMatch) {
      errors.push({ 
        line: lineNum, 
        message: "Lua doesn't have '/=' operator", 
        severity: 'error',
        autoFix: {
          description: `Replace '${divideEqualsMatch[1]} /=' with '${divideEqualsMatch[1]} = ${divideEqualsMatch[1]} /'`,
          search: `${divideEqualsMatch[1]} /=`,
          replace: `${divideEqualsMatch[1]} = ${divideEqualsMatch[1]} /`
        }
      });
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
export function getSyntaxSummary(errors: SyntaxError[]): { errorCount: number; warningCount: number; fixableCount: number } {
  return {
    errorCount: errors.filter(e => e.severity === 'error').length,
    warningCount: errors.filter(e => e.severity === 'warning').length,
    fixableCount: errors.filter(e => e.autoFix).length
  };
}

// Apply a single auto-fix to code
export function applyAutoFix(code: string, lineNum: number, fix: AutoFix): string {
  const lines = code.split('\n');
  if (lineNum > 0 && lineNum <= lines.length) {
    lines[lineNum - 1] = lines[lineNum - 1].replace(fix.search, fix.replace);
  }
  return lines.join('\n');
}

// Apply all auto-fixes to code
export function applyAllAutoFixes(code: string, errors: SyntaxError[]): string {
  let result = code;
  // Sort by line number descending to avoid index shifting issues
  const fixableErrors = errors
    .filter(e => e.autoFix)
    .sort((a, b) => b.line - a.line);
  
  for (const error of fixableErrors) {
    if (error.autoFix) {
      result = applyAutoFix(result, error.line, error.autoFix);
    }
  }
  return result;
}