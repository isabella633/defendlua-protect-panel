import { Textarea } from "@/components/ui/textarea";
import { type SyntaxError } from "@/lib/luaSyntaxChecker";
import { AlertCircle, XCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LuaCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  syntaxErrors?: SyntaxError[];
}

const LuaCodeEditor = ({ value, onChange, className, syntaxErrors = [] }: LuaCodeEditorProps) => {
  const lines = value.split("\n");
  const lineCount = lines.length;

  // Create a map of line numbers to errors for quick lookup
  const errorsByLine = syntaxErrors.reduce((acc, error) => {
    if (!acc[error.line]) {
      acc[error.line] = [];
    }
    acc[error.line].push(error);
    return acc;
  }, {} as Record<number, SyntaxError[]>);

  const getLineStatus = (lineNum: number) => {
    const errors = errorsByLine[lineNum];
    if (!errors) return null;
    
    const hasError = errors.some(e => e.severity === 'error');
    const hasWarning = errors.some(e => e.severity === 'warning');
    
    return { hasError, hasWarning, errors };
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="relative flex border border-border/50 rounded-md bg-muted/30 overflow-hidden">
        {/* Line numbers with error indicators */}
        <div className="select-none bg-muted/50 text-right text-sm font-mono text-muted-foreground border-r border-border/50 flex flex-col">
          {Array.from({ length: Math.max(lineCount, 1) }, (_, i) => {
            const lineNum = i + 1;
            const status = getLineStatus(lineNum);
            
            return (
              <div 
                key={lineNum} 
                className={`leading-6 px-2 flex items-center justify-end gap-1 ${
                  status?.hasError 
                    ? 'bg-destructive/20 text-destructive' 
                    : status?.hasWarning 
                      ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' 
                      : ''
                }`}
              >
                {status && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help">
                        {status.hasError ? (
                          <XCircle className="w-3.5 h-3.5" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5" />
                        )}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <div className="space-y-1">
                        {status.errors.map((err, idx) => (
                          <div key={idx} className="text-xs">
                            <span className={`font-medium ${err.severity === 'error' ? 'text-destructive' : 'text-yellow-600'}`}>
                              {err.severity === 'error' ? 'Error' : 'Warning'}:
                            </span>{' '}
                            {err.message}
                          </div>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}
                <span className="min-w-[1.5rem]">{lineNum}</span>
              </div>
            );
          })}
        </div>

        {/* Code textarea */}
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="-- Enter your Lua code here
function myFunction()
    print('Hello, World!')
end

myFunction()"
          className={`min-h-[300px] font-mono text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none leading-6 ${className}`}
          style={{
            paddingTop: "0.5rem",
            paddingBottom: "0.5rem",
          }}
        />
      </div>
    </TooltipProvider>
  );
};

export default LuaCodeEditor;