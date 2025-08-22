import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Code, 
  Link, 
  Copy, 
  Save, 
  Eye, 
  Settings, 
  Download,
  ArrowLeft,
  CheckCircle,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OwnerPanelProps {
  scriptId: string;
  onBack: () => void;
  onLogout: () => void;
}

const OwnerPanel = ({ scriptId, onBack, onLogout }: OwnerPanelProps) => {
  const [scriptName, setScriptName] = useState(`DefendScript_${scriptId.slice(-6)}`);
  const [sourceCode, setSourceCode] = useState(`-- Protected Lua Script (${scriptId})
function protectedFunction()
    print("This script is protected by DefendLua")
    -- Your original code would be here, obfuscated
end

protectedFunction()`);
  const [rawLink, setRawLink] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Generate raw link
    const baseUrl = window.location.origin;
    setRawLink(`${baseUrl}/api/raw/${scriptId}`);
  }, [scriptId]);

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate saving
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Script Saved",
        description: "Your changes have been successfully saved.",
      });
    }, 1000);
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const downloadScript = () => {
    const blob = new Blob([sourceCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scriptName}.lua`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Started",
      description: "Your script file is being downloaded.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-security-primary" />
              <h1 className="text-2xl font-bold text-security-primary">DefendLua</h1>
              <Badge variant="secondary" className="bg-security-primary/10 text-security-primary">
                Owner Panel
              </Badge>
            </div>
          </div>
          <Button variant="ghost" onClick={onLogout} className="text-muted-foreground hover:text-foreground">
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Script Management</h2>
            <p className="text-muted-foreground">
              Manage your protected Lua script and access raw links
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Script Info Card */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-security-primary" />
                  <span>Script Info</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Script Name</label>
                  <Input
                    value={scriptName}
                    onChange={(e) => setScriptName(e.target.value)}
                    placeholder="Enter script name"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Script ID</label>
                  <div className="flex items-center space-x-2">
                    <Input value={scriptId} readOnly className="bg-muted/50" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(scriptId, "Script ID")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Alert className="border-security-primary/20 bg-security-primary/5">
                  <CheckCircle className="h-4 w-4 text-security-primary" />
                  <AlertDescription className="text-security-primary">
                    Script is protected and ready to use!
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Main Editor */}
            <Card className="lg:col-span-2">
              <Tabs defaultValue="editor" className="w-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Code className="w-5 h-5 text-security-primary" />
                      <span>Script Editor</span>
                    </CardTitle>
                    <TabsList>
                      <TabsTrigger value="editor">
                        <Eye className="w-4 h-4 mr-2" />
                        Editor
                      </TabsTrigger>
                      <TabsTrigger value="raw-link">
                        <Globe className="w-4 h-4 mr-2" />
                        Raw Link
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </CardHeader>
                
                <TabsContent value="editor">
                  <CardContent className="space-y-4">
                    <CardDescription>
                      Edit your protected script source code. Changes are automatically obfuscated.
                    </CardDescription>
                    
                    <Textarea
                      value={sourceCode}
                      onChange={(e) => setSourceCode(e.target.value)}
                      className="min-h-[400px] font-mono text-sm bg-muted/30 border-border/50"
                      placeholder="-- Edit your Lua code here"
                    />
                    
                    <div className="flex items-center space-x-3">
                      <Button
                        onClick={handleSave}
                        variant="protect"
                        disabled={isSaving}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                      
                      <Button variant="outline" onClick={downloadScript}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </TabsContent>
                
                <TabsContent value="raw-link">
                  <CardContent className="space-y-4">
                    <CardDescription>
                      Use this raw link to access your protected script directly.
                    </CardDescription>
                    
                    <Alert className="border-security-secondary/20 bg-security-secondary/5">
                      <Link className="h-4 w-4 text-security-secondary" />
                      <AlertDescription className="text-security-secondary">
                        This link provides direct access to your protected Lua script.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Raw Link URL</label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={rawLink}
                          readOnly
                          className="bg-muted/50 font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          onClick={() => copyToClipboard(rawLink, "Raw link")}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                      <h4 className="font-medium mb-2">Usage Examples:</h4>
                      <div className="space-y-2 text-sm font-mono text-muted-foreground">
                        <div>
                          <span className="text-security-primary">Lua:</span> loadstring(game:HttpGet("{rawLink}"))()
                        </div>
                        <div>
                          <span className="text-security-primary">cURL:</span> curl -s "{rawLink}"
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OwnerPanel;