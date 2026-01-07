import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, Code, AlertTriangle, ArrowLeft, CheckCircle2, XCircle, AlertCircle, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LuaCodeEditor from "@/components/LuaCodeEditor";
import { checkLuaSyntax, getSyntaxSummary, applyAllAutoFixes, applyAutoFix, type SyntaxError } from "@/lib/luaSyntaxChecker";
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
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [userPlan, setUserPlan] = useState<'free' | 'pro' | 'enterprise'>('free');
  const [scriptCount, setScriptCount] = useState(0);
  const { toast } = useToast();

  // Real-time syntax checking
  const syntaxErrors = useMemo(() => {
    if (!luaCode.trim()) return [];
    return checkLuaSyntax(luaCode);
  }, [luaCode]);

  const syntaxSummary = useMemo(() => getSyntaxSummary(syntaxErrors), [syntaxErrors]);

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
    try {
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('plan')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (subError) {
        console.error('Error loading subscription:', subError);
      }
      
      if (subscription) {
        setUserPlan(subscription.plan as 'free' | 'pro' | 'enterprise');
      }

      const { count, error: countError } = await supabase
        .from('scripts')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', userId);
      
      if (countError) {
        console.error('Error loading script count:', countError);
      }
      
      setScriptCount(count || 0);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error",
        description: "Failed to load user data. Please refresh the page.",
        variant: "destructive",
      });
    }
  };

  const handleProtectScript = async () => {
    const scriptLimit = getScriptLimit(userPlan);
    
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
    if (syntaxErrors.length > 0) {
      setShowErrorDialog(true);
      return;
    }

    proceedWithProtection();
  };

  const proceedWithProtection = async () => {
    setIsProtecting(true);
    setShowErrorDialog(false);
    
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

      if (error) {
        if (error.code === '23505') {
          throw new Error('A script with this name already exists.');
        }
        throw error;
      }

      toast({
        title: "Script Protected!",
        description: `${scriptName} has been successfully protected and saved.`,
      });
      onBack();
    } catch (error: any) {
      console.error('Protection error:', error);
      toast({
        title: "Protection Failed",
        description: error.message || "Failed to save script. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProtecting(false);
    }
  };

  const handleAutoFixAll = () => {
    const fixedCode = applyAllAutoFixes(luaCode, syntaxErrors);
    setLuaCode(fixedCode);
    toast({
      title: "Auto-Fix Applied",
      description: `Fixed ${syntaxSummary.fixableCount} issue${syntaxSummary.fixableCount !== 1 ? 's' : ''}.`,
    });
  };

  const handleAutoFixSingle = (error: SyntaxError) => {
    if (error.autoFix) {
      const fixedCode = applyAutoFix(luaCode, error.line, error.autoFix);
      setLuaCode(fixedCode);
      toast({
        title: "Fixed",
        description: error.autoFix.description,
      });
    }
  };

  const getSyntaxStatusBadge = () => {
    if (!luaCode.trim()) {
      return (
        <Badge variant="outline" className="text-muted-foreground">
          <Code className="w-3 h-3 mr-1" />
          No code entered
        </Badge>
      );
    }

    if (syntaxSummary.errorCount === 0 && syntaxSummary.warningCount === 0) {
      return (
        <Badge variant="outline" className="text-green-600 border-green-600/30 bg-green-600/10">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          No issues found
        </Badge>
      );
    }

    if (syntaxSummary.errorCount > 0) {
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          {syntaxSummary.errorCount} error{syntaxSummary.errorCount !== 1 ? 's' : ''}
          {syntaxSummary.warningCount > 0 && `, ${syntaxSummary.warningCount} warning${syntaxSummary.warningCount !== 1 ? 's' : ''}`}
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="text-yellow-600 border-yellow-600/30 bg-yellow-600/10">
        <AlertCircle className="w-3 h-3 mr-1" />
        {syntaxSummary.warningCount} warning{syntaxSummary.warningCount !== 1 ? 's' : ''}
      </Badge>
    );
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
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Code className="w-5 h-5 text-security-primary" />
                    <span>Lua Code Input</span>
                  </CardTitle>
                  <CardDescription>
                    Paste your Lua script below. Real-time syntax validation is enabled.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getSyntaxStatusBadge()}
                  {syntaxSummary.fixableCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAutoFixAll}
                      className="text-primary border-primary/30 hover:bg-primary/10"
                    >
                      <Wand2 className="w-3.5 h-3.5 mr-1.5" />
                      Fix {syntaxSummary.fixableCount} issue{syntaxSummary.fixableCount !== 1 ? 's' : ''}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-primary/20 bg-primary/5">
                <AlertTriangle className="h-4 w-4 text-primary" />
                <AlertDescription className="text-primary">
                  <strong>Real-Time Syntax Checking:</strong> Your code is continuously scanned for Lua syntax errors. 
                  Hover over line numbers with error icons to see details.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="script-name">Script Name</Label>
                <Input
                  id="script-name"
                  placeholder="My Awesome Script"
                  value={scriptName}
                  onChange={(e) => setScriptName(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="lua-code">Enter your .lua code:</Label>
                </div>
                <LuaCodeEditor
                  value={luaCode}
                  onChange={setLuaCode}
                  syntaxErrors={syntaxErrors}
                />
              </div>

              {/* Real-time error display with auto-fix buttons */}
              {syntaxErrors.length > 0 && (
                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                      <span>Syntax Issues Detected</span>
                    </div>
                    {syntaxSummary.fixableCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleAutoFixAll}
                        className="text-xs h-7"
                      >
                        <Wand2 className="w-3 h-3 mr-1" />
                        Fix All ({syntaxSummary.fixableCount})
                      </Button>
                    )}
                  </div>
                  <div className="max-h-[200px] overflow-y-auto space-y-2">
                    {syntaxErrors.slice(0, 15).map((error, index) => (
                      <div 
                        key={index} 
                        className={`flex items-start justify-between gap-2 text-sm p-2 rounded ${
                          error.severity === 'error' 
                            ? 'bg-destructive/10 text-destructive' 
                            : 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
                        }`}
                      >
                        <div className="flex items-start gap-2 flex-1">
                          {error.severity === 'error' ? (
                            <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                          )}
                          <div>
                            <span className="font-semibold">Line {error.line}:</span>{" "}
                            <span>{error.message}</span>
                          </div>
                        </div>
                        {error.autoFix && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAutoFixSingle(error)}
                            className="h-6 px-2 text-xs shrink-0 hover:bg-background/50"
                          >
                            <Wand2 className="w-3 h-3 mr-1" />
                            Fix
                          </Button>
                        )}
                      </div>
                    ))}
                    {syntaxErrors.length > 15 && (
                      <p className="text-xs text-muted-foreground text-center pt-2">
                        ... and {syntaxErrors.length - 15} more issue{syntaxErrors.length - 15 !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              )}

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

      {/* Syntax Error Confirmation Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Syntax Issues Detected
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p className="text-foreground">
                  Your code has {syntaxSummary.errorCount > 0 && (
                    <span className="font-semibold text-destructive">
                      {syntaxSummary.errorCount} error{syntaxSummary.errorCount !== 1 ? 's' : ''}
                    </span>
                  )}
                  {syntaxSummary.errorCount > 0 && syntaxSummary.warningCount > 0 && ' and '}
                  {syntaxSummary.warningCount > 0 && (
                    <span className="font-semibold text-yellow-600">
                      {syntaxSummary.warningCount} warning{syntaxSummary.warningCount !== 1 ? 's' : ''}
                    </span>
                  )}.
                  {syntaxSummary.fixableCount > 0 && (
                    <span className="text-muted-foreground">
                      {' '}({syntaxSummary.fixableCount} can be auto-fixed)
                    </span>
                  )}
                </p>
                
                <div className="max-h-[250px] overflow-y-auto space-y-2 bg-muted/50 rounded-md p-3">
                  {syntaxErrors.map((error, index) => (
                    <div 
                      key={index} 
                      className={`flex items-start justify-between gap-2 text-sm p-2 rounded ${
                        error.severity === 'error' 
                          ? 'bg-destructive/10' 
                          : 'bg-yellow-500/10'
                      }`}
                    >
                      <div className="flex items-start gap-2 flex-1">
                        {error.severity === 'error' ? (
                          <XCircle className="w-4 h-4 mt-0.5 shrink-0 text-destructive" />
                        ) : (
                          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-yellow-600" />
                        )}
                        <div>
                          <span className="font-semibold text-foreground">Line {error.line}:</span>{" "}
                          <span className="text-muted-foreground">{error.message}</span>
                        </div>
                      </div>
                      {error.autoFix && (
                        <Badge variant="outline" className="text-xs shrink-0">
                          Fixable
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="bg-destructive/5 border border-destructive/20 rounded-md p-3">
                  <p className="text-sm text-destructive">
                    <strong>Warning:</strong> Protecting a script with syntax errors may cause it to fail when executed. 
                    It's recommended to fix these issues first.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            {syntaxSummary.fixableCount > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  handleAutoFixAll();
                  setShowErrorDialog(false);
                }}
                className="w-full sm:w-auto order-first sm:order-none"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Auto-Fix {syntaxSummary.fixableCount} Issues
              </Button>
            )}
            <AlertDialogCancel className="w-full sm:w-auto">
              Go Back & Fix
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={proceedWithProtection} 
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Continue Anyway
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