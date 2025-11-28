import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Code, AlertTriangle, LogOut, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ScriptProtectorProps {
  onBack: () => void;
}

const ScriptProtector = ({ onBack }: ScriptProtectorProps) => {
  const [luaCode, setLuaCode] = useState("");
  const [isProtecting, setIsProtecting] = useState(false);
  const { toast } = useToast();

  const handleProtectScript = async () => {
    if (!luaCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter your Lua code before protecting.",
        variant: "destructive",
      });
      return;
    }

    setIsProtecting(true);
    
    // Simulate script protection process
    setTimeout(() => {
      setIsProtecting(false);
      const scriptId = `script_${Date.now()}`;
      toast({
        title: "Script Protected!",
        description: "Your Lua script has been successfully protected.",
      });
      onBack();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">DefendLua</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Protect Your Lua Script</h2>
            <p className="text-muted-foreground text-lg">
              Upload your Lua code and we'll secure it with advanced obfuscation
            </p>
          </div>

          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-security-primary" />
                <span>Lua Code Input</span>
              </CardTitle>
              <CardDescription>
                Paste your Lua script below. We DO NOT scan for syntax errors.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-security-accent/20 bg-security-accent/5">
                <AlertTriangle className="h-4 w-4 text-security-accent" />
                <AlertDescription className="text-security-accent">
                  <strong>Important:</strong> We DO NOT scan for syntax errors. 
                  Please ensure your Lua code is valid before protection.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                 <label htmlFor="lua-code" className="text-sm font-medium">
                  Enter your .lua code:
                </label>
                <Textarea
                  id="lua-code"
                  placeholder="-- Enter your Lua code here
function myFunction()
    print('Hello, World!')
end

myFunction()"
                  value={luaCode}
                  onChange={(e) => setLuaCode(e.target.value)}
                  className="min-h-[300px] font-mono text-sm bg-muted/30 border-border/50"
                />
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleProtectScript}
                  variant="primary"
                  size="lg"
                  disabled={isProtecting}
                  className="px-8"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  {isProtecting ? "Protecting Script..." : "Protect Script"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ScriptProtector;