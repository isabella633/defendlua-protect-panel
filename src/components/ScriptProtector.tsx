import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Code, AlertTriangle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LuaCodeEditor from "@/components/LuaCodeEditor";
import { checkLuaSyntax, type SyntaxError } from "@/lib/luaSyntaxChecker";
import { supabase } from "@/integrations/supabase/client";
import LuaCodeAssistant from "./LuaCodeAssistant";

interface ScriptProtectorProps {
  onBack: () => void;
  userId: string;
}

const ScriptProtector = ({ onBack, userId }: ScriptProtectorProps) => {
  const [scriptName, setScriptName] = useState("");
  const [luaCode, setLuaCode] = useState("");
  const [isProtecting, setIsProtecting] = useState(false);
  const [syntaxErrors, setSyntaxErrors] = useState<SyntaxError[]>([]);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [userPlan, setUserPlan] = useState<'free' | 'pro' | 'enterprise'>('free');
  const [scriptCount, setScriptCount] = useState(0);
  const { toast } = useToast();

  const getScriptLimit = (plan: string) => {
    switch (plan) {
      case 'free': return 3;
      case 'pro': return 999999;
      case 'enterprise': return 999999;
      default: return 3;
    }
  };

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (subscription) {
      setUserPlan(subscription.plan as 'free' | 'pro' | 'enterprise');
    }

    // Get current script count
    const { count } = await supabase
      .from('scripts')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId);
    
    setScriptCount(count || 0);
  };

  const handleProtectScript = async () => {
    const scriptLimit = getScriptLimit(userPlan);
    
    // Check script limit for free plan
    if (scriptCount >= scriptLimit) {
      toast({
        title: "Script Limit Reached",
        description: `Your ${userPlan} plan allows ${scriptLimit} scripts. Upgrade to Pro for unlimited scripts.`,
        variant: "destructive",
      });
      return;
    }

    if (!scriptName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a script name.",
        variant: "destructive",
      });
      return;
    }

    if (!luaCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter your Lua code before protecting.",
        variant: "destructive",
      });
      return;
    }

    // Check for syntax errors
    const errors = checkLuaSyntax(luaCode);
    if (errors.length > 0) {
      setSyntaxErrors(errors);
      setShowErrorDialog(true);
      return;
    }

    proceedWithProtection();
  };

  const proceedWithProtection = async () => {
    setIsProtecting(true);
    
    try {
      const { data, error } = await supabase
        .from('scripts')
        .insert({
          owner_id: userId,
          script_name: scriptName.trim(),
          script_key: luaCode,
          hwid_list: []
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Script Protected!",
        description: `${scriptName} has been successfully protected.`,
      });
      onBack();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save script.",
        variant: "destructive",
      });
    } finally {
      setIsProtecting(false);
    }
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
                Paste your Lua script below. We'll scan for syntax errors before protection.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-primary/20 bg-primary/5">
                <AlertTriangle className="h-4 w-4 text-primary" />
                <AlertDescription className="text-primary">
                  <strong>Syntax Checking Enabled:</strong> Your code will be scanned for common syntax errors before protection.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="script-name">Script Name</Label>
                <Input
                  id="script-name"
                  placeholder="My Awesome Script"
                  value={scriptName}
                  onChange={(e) => setScriptName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lua-code">Enter your .lua code:</Label>
                <LuaCodeEditor
                  value={luaCode}
                  onChange={setLuaCode}
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

      {/* Syntax Error Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              <span>Syntax Errors Found</span>
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>The following syntax errors were detected in your code:</p>
                <div className="max-h-[300px] overflow-y-auto space-y-2 bg-muted/50 rounded-md p-3">
                  {syntaxErrors.map((error, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-semibold text-foreground">Line {error.line}:</span>{" "}
                      <span className="text-muted-foreground">{error.message}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs">Would you like to proceed with protection anyway?</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={proceedWithProtection} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Protect Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <LuaCodeAssistant 
        userPlan={userPlan}
        userId={userId}
        currentCode={luaCode}
        onInsertCode={(code) => {
          setLuaCode(code);
          toast({
            title: "Code Replaced",
            description: "AI code has replaced the editor contents.",
          });
        }}
        onClearCode={() => {
          setLuaCode('');
        }}
      />
    </div>
  );
};

export default ScriptProtector;