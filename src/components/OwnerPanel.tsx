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
  Globe,
  Plus,
  X,
  History,
  Ban,
  Bell,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import LuaCodeAssistant from "./LuaCodeAssistant";

interface OwnerPanelProps {
  scriptId: string;
  onBack: () => void;
}

const OwnerPanel = ({ scriptId, onBack }: OwnerPanelProps) => {
  const [scriptName, setScriptName] = useState(`DefendScript_${scriptId.slice(-6)}`);
  const [sourceCode, setSourceCode] = useState(`-- Protected Lua Script (${scriptId})
function protectedFunction()
    print("This script is protected by DefendLua")
    -- Your original code would be here, obfuscated
end

protectedFunction()`);
  const [rawLink, setRawLink] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hwidList, setHwidList] = useState<string[]>([]);
  const [newHwid, setNewHwid] = useState("");
  const [ipList, setIpList] = useState<string[]>([]);
  const [newIp, setNewIp] = useState("");
  const [hwidBlacklist, setHwidBlacklist] = useState<string[]>([]);
  const [newBlacklistHwid, setNewBlacklistHwid] = useState("");
  const [publicAccess, setPublicAccess] = useState(false);
  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  const [userPlan, setUserPlan] = useState<"free" | "pro" | "enterprise">("free");
  const [userId, setUserId] = useState<string>("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const { toast } = useToast();

  const getHwidLimit = (plan: string) => {
    switch (plan) {
      case 'free': return 10;
      case 'pro': return 100;
      case 'enterprise': return 999999;
      default: return 10;
    }
  };

  useEffect(() => {
    // Generate raw link pointing to edge function
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const projectId = supabaseUrl?.split("//")[1]?.split(".")[0];
    setRawLink(`https://${projectId}.supabase.co/functions/v1/serve-raw-script?id=${scriptId}`);

    // Load script data including HWID list
    loadScriptData();
    loadUserData();
  }, [scriptId]);

  const loadUserData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("plan")
        .eq("user_id", user.id)
        .maybeSingle();

      if (subscription) {
        setUserPlan(subscription.plan as "free" | "pro" | "enterprise");
      }
    }
  };

  const loadScriptData = async () => {
    const { data, error } = await supabase
      .from("scripts")
      .select("script_name, script_key, hwid_list, ip_list, hwid_blacklist, public_access, webhook_url")
      .eq("id", scriptId)
      .single();

    if (data) {
      setScriptName(data.script_name);
      setSourceCode(data.script_key);
      setHwidList(data.hwid_list || []);
      setIpList(data.ip_list || []);
      setHwidBlacklist(data.hwid_blacklist || []);
      setPublicAccess(data.public_access || false);
      setWebhookUrl((data as any).webhook_url || "");
    }

    // Load access logs
    const { data: logs } = await supabase
      .from("access_logs")
      .select("*")
      .eq("script_id", scriptId)
      .order("accessed_at", { ascending: false })
      .limit(5000);

    if (logs) {
      setAccessLogs(logs);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    const updateData: any = {
      script_name: scriptName,
      script_key: sourceCode,
      hwid_list: hwidList,
      ip_list: ipList,
      hwid_blacklist: hwidBlacklist,
      public_access: publicAccess,
    };

    // Only include webhook_url for Pro/Enterprise plans
    if (userPlan === "pro" || userPlan === "enterprise") {
      updateData.webhook_url = webhookUrl || null;
    }

    const { error } = await supabase
      .from("scripts")
      .update(updateData)
      .eq("id", scriptId);

    setIsSaving(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save changes.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Script Saved",
        description: "Your changes have been successfully saved.",
      });
    }
  };

  const addHwid = () => {
    if (!newHwid.trim()) return;

    const hwidLimit = getHwidLimit(userPlan);
    if (hwidList.length >= hwidLimit) {
      toast({
        title: "HWID Limit Reached",
        description: `Your ${userPlan} plan allows ${hwidLimit} HWIDs per script. ${userPlan === 'free' ? 'Upgrade to Pro for 100 HWIDs.' : userPlan === 'pro' ? 'Upgrade to Enterprise for unlimited.' : ''}`,
        variant: "destructive",
      });
      return;
    }

    if (hwidList.includes(newHwid.trim())) {
      toast({
        title: "Already exists",
        description: "This HWID is already in the whitelist.",
        variant: "destructive",
      });
      return;
    }

    setHwidList([...hwidList, newHwid.trim()]);
    setNewHwid("");
    toast({
      title: "HWID Added",
      description: "Remember to save your changes.",
    });
  };

  const removeHwid = (hwid: string) => {
    setHwidList(hwidList.filter((h) => h !== hwid));
    toast({
      title: "HWID Removed",
      description: "Remember to save your changes.",
    });
  };

  const addIp = () => {
    if (!newIp.trim()) return;

    // Basic IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(newIp.trim())) {
      toast({
        title: "Invalid IP",
        description: "Please enter a valid IPv4 address.",
        variant: "destructive",
      });
      return;
    }

    if (ipList.includes(newIp.trim())) {
      toast({
        title: "Already exists",
        description: "This IP is already in the whitelist.",
        variant: "destructive",
      });
      return;
    }

    setIpList([...ipList, newIp.trim()]);
    setNewIp("");
    toast({
      title: "IP Added",
      description: "Remember to save your changes.",
    });
  };

  const removeIp = (ip: string) => {
    setIpList(ipList.filter((i) => i !== ip));
    toast({
      title: "IP Removed",
      description: "Remember to save your changes.",
    });
  };

  const addBlacklistHwid = () => {
    if (!newBlacklistHwid.trim()) return;

    if (hwidBlacklist.includes(newBlacklistHwid.trim())) {
      toast({
        title: "Already blacklisted",
        description: "This HWID is already in the blacklist.",
        variant: "destructive",
      });
      return;
    }

    setHwidBlacklist([...hwidBlacklist, newBlacklistHwid.trim()]);
    setNewBlacklistHwid("");
    toast({
      title: "HWID Blacklisted",
      description: "Remember to save your changes.",
    });
  };

  const removeBlacklistHwid = (hwid: string) => {
    setHwidBlacklist(hwidBlacklist.filter((h) => h !== hwid));
    toast({
      title: "HWID Unblacklisted",
      description: "Remember to save your changes.",
    });
  };

  const blacklistFromLogs = (hwid: string) => {
    if (hwidBlacklist.includes(hwid)) {
      toast({
        title: "Already blacklisted",
        description: "This HWID is already in the blacklist.",
        variant: "destructive",
      });
      return;
    }

    setHwidBlacklist([...hwidBlacklist, hwid]);
    toast({
      title: "HWID Blacklisted",
      description: "Remember to save your changes.",
    });
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
    const blob = new Blob([sourceCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
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
          <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">DefendLua</h1>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Owner Panel
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Script Management</h2>
            <p className="text-muted-foreground">Manage your protected Lua script and access raw links</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Script Info Card */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-primary" />
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
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(scriptId, "Script ID")}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Alert className="border-primary/20 bg-primary/5">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-primary">Script is protected and ready to use!</AlertDescription>
                </Alert>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    HWID Whitelist ({hwidList.length}/{getHwidLimit(userPlan) === 999999 ? '∞' : getHwidLimit(userPlan)})
                  </label>
                  <div className="space-y-2">
                    {hwidList.length === 0 ? (
                      <Alert className="border-accent/20 bg-accent/5">
                        <AlertDescription className="text-accent text-sm">
                          Empty whitelist = all HWIDs allowed
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {hwidList.map((hwid) => (
                          <div
                            key={hwid}
                            className="flex items-center justify-between bg-muted/50 p-2 rounded border border-border/50"
                          >
                            <span className="text-sm font-mono">{hwid}</span>
                            <Button variant="ghost" size="icon" onClick={() => removeHwid(hwid)} className="h-6 w-6">
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Input
                        value={newHwid}
                        onChange={(e) => setNewHwid(e.target.value)}
                        placeholder="Enter HWID to whitelist"
                        onKeyDown={(e) => e.key === "Enter" && addHwid()}
                      />
                      <Button variant="outline" size="icon" onClick={addHwid}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">IP Whitelist</label>
                  <div className="space-y-2">
                    {ipList.length === 0 ? (
                      <Alert className="border-accent/20 bg-accent/5">
                        <AlertDescription className="text-accent text-sm">Empty = no IP restrictions</AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {ipList.map((ip) => (
                          <div
                            key={ip}
                            className="flex items-center justify-between bg-muted/50 p-2 rounded border border-border/50"
                          >
                            <span className="text-sm font-mono">{ip}</span>
                            <Button variant="ghost" size="icon" onClick={() => removeIp(ip)} className="h-6 w-6">
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Input
                        value={newIp}
                        onChange={(e) => setNewIp(e.target.value)}
                        placeholder="Enter IP to whitelist"
                        onKeyDown={(e) => e.key === "Enter" && addIp()}
                      />
                      <Button variant="outline" size="icon" onClick={addIp}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {(userPlan === "pro" || userPlan === "enterprise") && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Public Access</label>
                    <div className="flex items-center justify-between bg-muted/50 p-3 rounded border border-border/50">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Allow Anyone</p>
                        <p className="text-xs text-muted-foreground">
                          {userPlan === "pro" ? "Pro" : "Enterprise"} feature: Skip HWID checks (still logs all access)
                        </p>
                      </div>
                      <Switch checked={publicAccess} onCheckedChange={setPublicAccess} />
                    </div>
                  </div>
                )}

                {(userPlan === "pro" || userPlan === "enterprise") && (
                  <div>
                    <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Discord Webhook
                    </label>
                    <div className="space-y-2">
                      <Input
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        placeholder="https://discord.com/api/webhooks/..."
                        className="font-mono text-xs"
                      />
                      <Alert className="border-primary/20 bg-primary/5">
                        <AlertDescription className="text-xs text-primary">
                          Access logs will be sent to this Discord webhook. You can also blacklist HWIDs by reacting to the webhook message.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">HWID Blacklist</label>
                  <div className="space-y-2">
                    {hwidBlacklist.length === 0 ? (
                      <Alert className="border-muted bg-muted/30">
                        <AlertDescription className="text-sm">No blacklisted HWIDs</AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {hwidBlacklist.map((hwid) => (
                          <div
                            key={hwid}
                            className="flex items-center justify-between bg-destructive/10 p-2 rounded border border-destructive/30"
                          >
                            <span className="text-sm font-mono text-destructive">{hwid}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeBlacklistHwid(hwid)}
                              className="h-6 w-6"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Input
                        value={newBlacklistHwid}
                        onChange={(e) => setNewBlacklistHwid(e.target.value)}
                        placeholder="Enter HWID to blacklist"
                        onKeyDown={(e) => e.key === "Enter" && addBlacklistHwid()}
                      />
                      <Button variant="outline" size="icon" onClick={addBlacklistHwid}>
                        <Ban className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Editor */}
            <Card className="lg:col-span-2">
              <Tabs defaultValue="editor" className="w-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Code className="w-5 h-5 text-primary" />
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
                      <TabsTrigger value="logs">
                        <History className="w-4 h-4 mr-2" />
                        Access Logs
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
                      <Button onClick={handleSave} variant="primary" disabled={isSaving}>
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
                      Distribute this loader script - it automatically detects HWIDs and handles authentication.
                    </CardDescription>

                    <Alert className="border-accent/20 bg-accent/5">
                      <Link className="h-4 w-4 text-accent" />
                      <AlertDescription className="text-accent">
                        {publicAccess
                          ? "🌐 Public Access ON - New HWIDs are auto-whitelisted"
                          : "🔒 HWID Protection ON - Only whitelisted HWIDs can access"}
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      <div className="p-6 bg-muted/30 rounded-lg border border-border/50 text-center space-y-3">
                        <div className="space-y-2">
                          <h4 className="font-medium text-lg">Protected Script Loader</h4>
                          <p className="text-sm text-muted-foreground">
                            Copy and distribute this simple loader. HWID collection and validation happens server-side automatically - maximum protection with zero exposed logic.
                          </p>
                        </div>
                        <Button
                          variant="primary"
                          size="lg"
                          onClick={() => {
                            const baseUrl = rawLink.replace("?key=YOUR_HWID", "");
                            const simpleLoader = `loadstring(game:HttpGet("${baseUrl}"))()`;
                            copyToClipboard(simpleLoader, "Loader script");
                          }}
                          className="w-full"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Script Loader
                        </Button>
                        <Alert className="border-primary/20 bg-primary/5 text-left">
                          <Shield className="h-4 w-4 text-primary" />
                          <AlertDescription className="text-primary text-xs">
                            <strong>Two-Stage Protection:</strong> Users see only a simple loader. The server automatically collects HWID, validates access, and serves your script - all protection logic stays hidden server-side.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>
                  </CardContent>
                </TabsContent>

                <TabsContent value="logs">
                  <CardContent className="space-y-4">
                    <CardDescription>
                      View all access attempts to your script. Blacklist suspicious HWIDs instantly.
                    </CardDescription>

                    <ScrollArea className="h-[450px] border border-border/50 rounded-lg">
                      <div className="p-4 space-y-2">
                        {accessLogs.length === 0 ? (
                          <Alert>
                            <AlertDescription>No access attempts recorded yet.</AlertDescription>
                          </Alert>
                        ) : (
                          accessLogs.map((log) => (
                            <div
                              key={log.id}
                              className={`p-3 rounded-lg border ${
                                log.status === "allowed"
                                  ? "bg-primary/5 border-primary/20"
                                  : "bg-destructive/5 border-destructive/20"
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center space-x-2">
                                    <Badge
                                      variant={log.status === "allowed" ? "default" : "destructive"}
                                      className="text-xs"
                                    >
                                      {log.status}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(log.accessed_at).toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="text-sm font-mono space-y-1">
                                    <div>
                                      <span className="text-muted-foreground">HWID:</span>{" "}
                                      <span className="text-foreground">{log.hwid}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">IP:</span>{" "}
                                      <span className="text-foreground">{log.ip_address || "N/A"}</span>
                                    </div>
                                    {log.reason && (
                                      <div>
                                        <span className="text-muted-foreground">Reason:</span>{" "}
                                        <span className="text-foreground">{log.reason}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {log.status === "allowed" && !hwidBlacklist.includes(log.hwid) && (
                                  <Button variant="destructive" size="sm" onClick={() => blacklistFromLogs(log.hwid)}>
                                    <Ban className="w-3 h-3 mr-1" />
                                    Block
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </main>

      <LuaCodeAssistant
        userPlan={userPlan}
        userId={userId}
        currentCode={sourceCode}
        onInsertCode={(code) => {
          setSourceCode((prev) => {
            if (!prev.trim()) return code;
            return prev + "\n\n" + code;
          });
          toast({
            title: "Code Inserted",
            description: "AI code has been added to your editor",
          });
        }}
        onClearCode={() => {
          setSourceCode("");
        }}
      />
    </div>
  );
};

export default OwnerPanel;
