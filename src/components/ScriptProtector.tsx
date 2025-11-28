import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Shield, Copy, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ScriptProtectorProps {
  onComplete?: () => void;
}

const ScriptProtector = ({ onComplete }: ScriptProtectorProps) => {
  const { user } = useAuth();
  const [scriptName, setScriptName] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [isProtected, setIsProtected] = useState(false);

  const handleProtect = async () => {
    if (!scriptName) {
      toast.error("Please enter a script name");
      return;
    }
    
    if (!user) {
      toast.error("You must be signed in");
      return;
    }
    
    try {
      const key = `defendlua_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { error } = await supabase
        .from('scripts')
        .insert({
          owner_id: user.id,
          script_name: scriptName,
          script_key: key,
          hwid_list: []
        });

      if (error) throw error;

      setGeneratedKey(key);
      setIsProtected(true);
      toast.success("Script protected successfully!");
      
      if (onComplete) {
        setTimeout(() => onComplete(), 2000);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to protect script");
    }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(generatedKey);
    toast.success("Key copied to clipboard!");
  };

  const reset = () => {
    setScriptName("");
    setGeneratedKey("");
    setIsProtected(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto animate-fade-in">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <CardTitle>Protect New Script</CardTitle>
        </div>
        <CardDescription>Create a protected script with unique key</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isProtected ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="scriptName">Script Name</Label>
              <Input
                id="scriptName"
                placeholder="My Awesome Script"
                value={scriptName}
                onChange={(e) => setScriptName(e.target.value)}
              />
            </div>
            <Button onClick={handleProtect} className="w-full">
              <Shield className="h-4 w-4 mr-2" />
              Protect Script
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 bg-success/10 border border-success/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-success font-medium">Script protected successfully!</span>
            </div>
            
            <div className="space-y-2">
              <Label>Your Script Key</Label>
              <div className="flex gap-2">
                <Input value={generatedKey} readOnly className="font-mono" />
                <Button variant="outline" size="icon" onClick={copyKey}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button onClick={reset} variant="outline" className="w-full">
              Protect Another Script
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScriptProtector;
