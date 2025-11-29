import { Textarea } from "@/components/ui/textarea";

interface LuaCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const LuaCodeEditor = ({ value, onChange, className }: LuaCodeEditorProps) => {
  const lines = value.split("\n");
  const lineCount = lines.length;

  return (
    <div className="relative flex border border-border/50 rounded-md bg-muted/30 overflow-hidden">
      {/* Line numbers */}
      <div className="select-none bg-muted/50 px-3 py-2 text-right text-sm font-mono text-muted-foreground border-r border-border/50">
        {Array.from({ length: Math.max(lineCount, 1) }, (_, i) => (
          <div key={i + 1} className="leading-6">
            {i + 1}
          </div>
        ))}
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
  );
};

export default LuaCodeEditor;
