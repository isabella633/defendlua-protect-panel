import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Plus, 
  Search, 
  Calendar, 
  Code, 
  Eye, 
  Trash2,
  LogOut,
  Key,
  CheckCircle,
  ShoppingCart,
  ExternalLink,
  Settings,
  ArrowDown,
  Clock,
  MessageCircle,
  Link as LinkIcon,
  Unlink,
  Sun,
  Moon,
  Bot
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AIChatWidget from "./AIChatWidget";
import VersionHistoryDialog from "./VersionHistoryDialog";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, BarChart3, History } from "lucide-react";

interface Script {
  id: string;
  script_name: string;
  created_at: string;
  updated_at: string;
  script_key: string;
  hwid_list: string[];
  disabled?: boolean;
  auto_disabled_at?: string | null;
  auto_disabled_reason?: string | null;
}

interface ScriptDashboardProps {
  onNewScript: () => void;
  onViewScript: (scriptId: string) => void;
  onLogout: () => void;
  userId: string;
}

const ScriptDashboard = ({ onNewScript, onViewScript, onLogout, userId }: ScriptDashboardProps) => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activationCode, setActivationCode] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const [isDowngrading, setIsDowngrading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [userEmail, setUserEmail] = useState("");
  const [discordLink, setDiscordLink] = useState<any>(null);
  const [historyScript, setHistoryScript] = useState<Script | null>(null);
  const [dismissedBanner, setDismissedBanner] = useState(
    () => localStorage.getItem("autoDisabledBannerDismissed") === "1",
  );
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const { toast } = useToast();
  const navigate = useNavigate();

  const toggleTheme = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    document.documentElement.classList.toggle('dark', newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
  };

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
    fetchScripts();
    fetchUserEmail();
    fetchDiscordLink();
  }, [userId]);

  const fetchDiscordLink = async () => {
    const { data } = await supabase
      .from("discord_links")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    setDiscordLink(data);
  };

  const unlinkDiscord = async () => {
    const { error } = await supabase
      .from("discord_links")
      .delete()
      .eq("user_id", userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to unlink Discord account",
        variant: "destructive",
      });
    } else {
      setDiscordLink(null);
      toast({
        title: "Discord Unlinked",
        description: "Your Discord account has been unlinked.",
      });
    }
  };

  const fetchUserEmail = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) setUserEmail(user.email);
  };

  const fetchSubscription = async () => {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (data) setSubscription(data);
  };

  const fetchScripts = async () => {
    const { data, error } = await supabase
      .from('scripts')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });
    
    if (data) setScripts(data);
  };

  const handleActivateCode = async () => {
    if (!activationCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter an activation code",
        variant: "destructive",
      });
      return;
    }

    setIsActivating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('redeem-activation-code', {
        body: { code: activationCode.trim() }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Activation Successful!",
        description: `Your ${data.plan} plan has been activated for ${data.duration_days} days.`,
      });

      setActivationCode("");
      fetchSubscription();
    } catch (error: any) {
      toast({
        title: "Activation Failed",
        description: error.message || "Failed to activate code. Please check and try again.",
        variant: "destructive",
      });
    } finally {
      setIsActivating(false);
    }
  };

  const handleDowngrade = async () => {
    setIsDowngrading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('downgrade-subscription');

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Plan Downgraded",
        description: "You have been downgraded to the Free plan.",
      });

      fetchSubscription();
    } catch (error: any) {
      toast({
        title: "Downgrade Failed",
        description: error.message || "Failed to downgrade plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDowngrading(false);
    }
  };

  const filteredScripts = scripts.filter(script =>
    script.script_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteScript = async (scriptId: string) => {
    try {
      const { error } = await supabase
        .from('scripts')
        .delete()
        .eq('id', scriptId);

      if (error) throw error;

      setScripts(prev => prev.filter(s => s.id !== scriptId));
      toast({
        title: "Script Deleted",
        description: "The script has been permanently removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete script.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">DefendLua</h1>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Dashboard
            </Badge>
          </div>
          <Button variant="ghost" onClick={onLogout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="scripts" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="scripts">Scripts</TabsTrigger>
              <TabsTrigger value="discord">
                <MessageCircle className="w-4 h-4 mr-2" />
                Discord
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scripts" className="space-y-6">
          {/* Subscription Status */}
          <Card className="mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Current Subscription</CardTitle>
                  <CardDescription>Your active plan and benefits</CardDescription>
                </div>
                <Badge 
                  variant={subscription?.plan === 'pro' || subscription?.plan === 'enterprise' ? 'default' : 'secondary'}
                  className={subscription?.plan === 'pro' || subscription?.plan === 'enterprise' ? 'bg-primary text-primary-foreground' : ''}
                >
                  {subscription?.plan?.toUpperCase() || 'FREE'} PLAN
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {/* Script Benefits */}
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Script Protection</h4>
                  <div className="space-y-1 text-sm">
                    {subscription?.plan === 'free' || !subscription?.plan ? (
                      <>
                        <p className="text-muted-foreground">• 3 scripts maximum</p>
                        <p className="text-muted-foreground">• 10 HWIDs per script</p>
                        <p className="text-muted-foreground">• Basic protection</p>
                      </>
                    ) : subscription?.plan === 'pro' ? (
                      <>
                        <p className="text-foreground">• Unlimited scripts</p>
                        <p className="text-foreground">• Unlimited HWIDs per script</p>
                        <p className="text-foreground">• Advanced protection</p>
                        <p className="text-foreground">• Discord webhook logging</p>
                        <p className="text-foreground">• Public access mode</p>
                      </>
                    ) : (
                      <>
                        <p className="text-foreground">• Unlimited scripts</p>
                        <p className="text-foreground">• Unlimited HWIDs per script</p>
                        <p className="text-foreground">• Enterprise-grade protection</p>
                        <p className="text-foreground">• Discord webhook logging</p>
                        <p className="text-foreground">• Public access mode</p>
                        <p className="text-foreground">• Custom branding</p>
                      </>
                    )}
                  </div>
                </div>

                {/* AI Benefits */}
                <div>
                  <h4 className="font-semibold mb-2 text-sm">AI Assistant</h4>
                  <div className="space-y-1 text-sm">
                    {subscription?.plan === 'free' || !subscription?.plan ? (
                      <>
                        <p className="text-muted-foreground">• 5 AI messages per session</p>
                        <p className="text-muted-foreground">• Standard response speed</p>
                        <p className="text-muted-foreground">• Basic responses (150 tokens)</p>
                      </>
                    ) : subscription?.plan === 'pro' ? (
                      <>
                        <p className="text-foreground">• 100 AI messages per session</p>
                        <p className="text-foreground">• Priority response speed</p>
                        <p className="text-foreground">• Detailed responses (2000 tokens)</p>
                        <p className="text-foreground">• Advanced support</p>
                      </>
                    ) : (
                      <>
                        <p className="text-foreground">• Unlimited AI messages</p>
                        <p className="text-foreground">• Instant response speed</p>
                        <p className="text-foreground">• Comprehensive responses (4000 tokens)</p>
                        <p className="text-foreground">• Premium support</p>
                        <p className="text-foreground">• Custom AI training</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Support */}
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Support & Analytics</h4>
                  <div className="space-y-1 text-sm">
                    {subscription?.plan === 'free' || !subscription?.plan ? (
                      <>
                        <p className="text-muted-foreground">• Community support</p>
                        <p className="text-muted-foreground">• Basic analytics</p>
                      </>
                    ) : subscription?.plan === 'pro' ? (
                      <>
                        <p className="text-foreground">• Priority email support</p>
                        <p className="text-foreground">• Advanced analytics</p>
                        <p className="text-foreground">• Usage insights</p>
                      </>
                    ) : (
                      <>
                        <p className="text-foreground">• 24/7 dedicated support</p>
                        <p className="text-foreground">• Real-time analytics</p>
                        <p className="text-foreground">• Custom reporting</p>
                        <p className="text-foreground">• SLA guarantee</p>
                      </>
                    )}
                  </div>
                </div>

                {subscription?.expires_at && (
                  <div className="pt-3 border-t">
                    {(() => {
                      const expiresAt = new Date(subscription.expires_at);
                      const now = new Date();
                      const diffTime = expiresAt.getTime() - now.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
                      
                      if (diffDays <= 0) {
                        return (
                          <div className="flex items-center gap-2 text-destructive">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">Plan expired</span>
                          </div>
                        );
                      }
                      
                      const isUrgent = diffDays <= 3;
                      const isWarning = diffDays <= 7;
                      
                      return (
                        <div className="space-y-2">
                          <div className={`flex items-center gap-2 ${isUrgent ? 'text-destructive' : isWarning ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {diffDays === 1 
                                ? `Expires in ${diffHours} hours` 
                                : `${diffDays} days remaining`}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${isUrgent ? 'bg-destructive' : isWarning ? 'bg-yellow-500' : 'bg-primary'}`}
                              style={{ width: `${Math.min(100, Math.max(5, (diffDays / 30) * 100))}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Expires: {expiresAt.toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Watermark Notice for Free Users */}
          {(subscription?.plan === 'free' || !subscription?.plan) && (
            <Card className="mb-6 border-amber-500/30 bg-gradient-to-br from-accent/5 to-background">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Promotional Watermark Active</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      Your scripts include a rainbow "DEFENDLUA.LOL" watermark visible to all users. This cannot be removed on the Free plan.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Upgrade to Pro or Enterprise</strong> to remove the watermark or toggle it on/off per script.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pro Plan Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Activation Code Card */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Activate Pro Plan
                </CardTitle>
                <CardDescription>
                  Enter your activation code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label htmlFor="activation-code" className="sr-only">Activation Code</Label>
                    <Input
                      id="activation-code"
                      placeholder="Paste code here"
                      value={activationCode}
                      onChange={(e) => setActivationCode(e.target.value)}
                      disabled={isActivating}
                      className="font-mono"
                    />
                  </div>
                  <Button 
                    onClick={handleActivateCode}
                    disabled={isActivating || !activationCode.trim()}
                    variant="hero"
                  >
                    {isActivating ? "..." : "Activate"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Purchase Code Card */}
            <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Buy Pro Activation Keys
                </CardTitle>
                <CardDescription>
                  Purchase auto-generated, secure Pro keys
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>✓ Unlimited scripts</p>
                  <p>✓ Unlimited HWIDs per script</p>
                  <p>✓ Advanced analytics & priority support</p>
                  <p>✓ 100 AI questions per session</p>
                </div>
                <a href="https://defendlua.mysellauth.com/product/pro-activation-keys" target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="hero" className="w-full gap-2">
                    Buy Pro Keys Now
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
                <p className="text-xs text-center text-muted-foreground">
                  Keys are auto-generated and updated regularly
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Your Protected Scripts</h2>
              <p className="text-muted-foreground">
                Manage and monitor all your Lua scripts protected by DefendLua
              </p>
            </div>
            <Button onClick={onNewScript} variant="hero" size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Protect New Script
            </Button>
          </div>

          {/* Search and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="md:col-span-2">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search your scripts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{scripts.length}</div>
                  <div className="text-sm text-muted-foreground">Total Scripts</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {scripts.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Protected</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Auto-disabled banner */}
          {!dismissedBanner && scripts.some((s) => s.auto_disabled_at) && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Some scripts were auto-disabled</AlertTitle>
              <AlertDescription>
                <p className="mb-2">
                  Your plan only allows 3 active scripts. The following are currently disabled and won't run for users:
                </p>
                <ul className="list-disc list-inside text-sm mb-3">
                  {scripts
                    .filter((s) => s.auto_disabled_at)
                    .map((s) => (
                      <li key={s.id}>{s.script_name}</li>
                    ))}
                </ul>
                <div className="flex gap-2">
                  <Button size="sm" variant="hero" onClick={() => navigate("/pricing")}>
                    Upgrade to Pro
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      localStorage.setItem("autoDisabledBannerDismissed", "1");
                      setDismissedBanner(true);
                    }}
                  >
                    Dismiss
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Scripts Grid */}
          {filteredScripts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {searchTerm ? "No scripts found" : "No scripts yet"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm 
                    ? "Try adjusting your search terms" 
                    : "Start by protecting your first Lua script"
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={onNewScript} variant="hero">
                    <Plus className="w-4 h-4 mr-2" />
                    Protect Your First Script
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScripts.map((script) => (
                <Card key={script.id} className="hover:shadow-lg transition-all duration-300 group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{script.script_name}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(script.created_at)}
                        </CardDescription>
                      </div>
                      {script.auto_disabled_at ? (
                        <Badge variant="destructive">Disabled</Badge>
                      ) : (
                        <Badge className="bg-primary/10 text-primary">Protected</Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>HWIDs: {script.hwid_list.length}</span>
                        <span>Updated: {formatDate(script.updated_at)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => onViewScript(script.id)}
                          variant="primary"
                          size="sm"
                          className="flex-1"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Manage
                        </Button>

                        <Button
                          onClick={() => navigate(`/analytics/${script.id}`)}
                          variant="outline"
                          size="sm"
                          title="Analytics"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </Button>

                        <Button
                          onClick={() => setHistoryScript(script)}
                          variant="outline"
                          size="sm"
                          title="Version history"
                        >
                          <History className="w-4 h-4" />
                        </Button>

                        <Button
                          onClick={() => deleteScript(script.id)}
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:border-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
            </TabsContent>

            <TabsContent value="discord">
              <div className="grid gap-6">
                {/* Discord Link Status */}
                {discordLink ? (
                  <Card className="border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-500">
                        <MessageCircle className="h-5 w-5" />
                        Discord Linked
                      </CardTitle>
                      <CardDescription>
                        Your Discord account is linked to DefendLua
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">Discord Username</p>
                        <p className="text-lg font-medium">{discordLink.discord_username || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Linked on {new Date(discordLink.linked_at).toLocaleDateString()}
                        </p>
                      </div>

                      <Button variant="destructive" onClick={unlinkDiscord} className="w-full">
                        <Unlink className="h-4 w-4 mr-2" />
                        Unlink Discord Account
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <LinkIcon className="h-5 w-5" />
                        Link Your Discord
                      </CardTitle>
                      <CardDescription>
                        Connect your Discord account to manage scripts via bot commands
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="hero" onClick={() => navigate("/link-discord")} className="w-full gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Go to Link Discord Page
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Available Commands */}
                <Card>
                  <CardHeader>
                    <CardTitle>Available Bot Commands</CardTitle>
                    <CardDescription>Use these slash commands in Discord after linking your account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { cmd: "/help", desc: "Show all available bot commands" },
                        { cmd: "/link <code>", desc: "Link your Discord account using a generated code" },
                        { cmd: "/scripts", desc: "List all your protected scripts with stats" },
                        { cmd: "/stats", desc: "View detailed stats — pick script from dropdown" },
                        { cmd: "/info", desc: "View full script details — pick from dropdown" },
                        { cmd: "/logs", desc: "View last 10 access attempts — pick from dropdown" },
                        { cmd: "/denied", desc: "View recently denied HWIDs — pick from dropdown" },
                        { cmd: "/whitelist <hwid>", desc: "Add HWID to whitelist — pick script from dropdown" },
                        { cmd: "/unwhitelist <hwid>", desc: "Remove HWID from whitelist — pick from dropdown" },
                        { cmd: "/blacklist <hwid>", desc: "Add HWID to blacklist — pick from dropdown" },
                        { cmd: "/unblacklist <hwid>", desc: "Remove HWID from blacklist — pick from dropdown" },
                        { cmd: "/resetwhitelist", desc: "Clear all HWIDs from whitelist — dropdown + confirmation" },
                        { cmd: "/resetblacklist", desc: "Clear all HWIDs from blacklist — dropdown + confirmation" },
                        { cmd: "/rename <name>", desc: "Rename a script — pick from dropdown" },
                        { cmd: "/toggle", desc: "Toggle public/private access — pick from dropdown" },
                        { cmd: "/webhook [url]", desc: "Set or remove webhook URL — pick from dropdown" },
                        { cmd: "/delete", desc: "Permanently delete a script — dropdown + confirmation" },
                        { cmd: "/lookup <hwid>", desc: "Check if an HWID exists in any of your scripts" },
                        { cmd: "/setup <provider> <link> [expiry] [mode]", desc: "Set up a key system (Linkvertise/WorkInk) — pick script from dropdown" },
                        { cmd: "/removesetup", desc: "Remove the key system from a script — pick from dropdown" },
                        { cmd: "/getkey", desc: "Get a key by completing a monetization link — pick script from dropdown" },
                        { cmd: "/redeem <key> <hwid>", desc: "Redeem a key to get whitelisted on a script" },
                      ].map(({ cmd, desc }) => (
                        <div key={cmd} className="bg-muted/50 rounded-lg p-3">
                          <code className="text-sm font-mono text-primary">{cmd}</code>
                          <p className="text-sm text-muted-foreground mt-1">{desc}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Bot Invite */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      Add Bot to Your Server
                    </CardTitle>
                    <CardDescription>Invite the official DefendLua bot</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <a 
                      href="https://discord.com/oauth2/authorize?client_id=1385790808900501676&permissions=2147502080&integration_type=0&scope=bot" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Button variant="hero" className="w-full gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Add DefendLua Bot to Server
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="grid gap-6">
                {/* Account Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>Your account details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={userEmail} disabled className="bg-muted" />
                    </div>

                    <div className="space-y-2">
                      <Label>User ID</Label>
                      <Input value={userId} disabled className="bg-muted font-mono text-xs" />
                    </div>
                  </CardContent>
                </Card>

                {/* Theme Toggle */}
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize how DefendLua looks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        <div>
                          <p className="font-medium">{darkMode ? "Dark Mode" : "Light Mode"}</p>
                          <p className="text-sm text-muted-foreground">
                            {darkMode ? "Switch to light theme" : "Switch to dark theme"}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" onClick={toggleTheme}>
                        {darkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                        {darkMode ? "Light" : "Dark"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Subscription Details */}
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Subscription Plan</CardTitle>
                        <CardDescription>Your current plan and all benefits</CardDescription>
                      </div>
                      <Badge 
                        variant={subscription?.plan === 'pro' || subscription?.plan === 'enterprise' ? 'default' : 'secondary'}
                        className={subscription?.plan === 'pro' || subscription?.plan === 'enterprise' ? 'bg-primary text-primary-foreground' : ''}
                      >
                        {subscription?.plan?.toUpperCase() || 'FREE'} PLAN
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      {/* Script Benefits */}
                      <div>
                        <h4 className="font-semibold mb-3">Script Protection</h4>
                        <div className="space-y-2 text-sm">
                          {subscription?.plan === 'free' || !subscription?.plan ? (
                            <>
                              <p className="text-muted-foreground">• 3 scripts maximum</p>
                              <p className="text-muted-foreground">• 10 HWIDs per script</p>
                              <p className="text-muted-foreground">• Basic protection</p>
                            </>
                          ) : subscription?.plan === 'pro' ? (
                            <>
                              <p className="text-foreground">• Unlimited scripts</p>
                              <p className="text-foreground">• Unlimited HWIDs per script</p>
                              <p className="text-foreground">• Advanced protection</p>
                              <p className="text-foreground">• Discord webhook logging</p>
                              <p className="text-foreground">• Public access mode</p>
                            </>
                          ) : (
                            <>
                              <p className="text-foreground">• Unlimited scripts</p>
                              <p className="text-foreground">• Unlimited HWIDs per script</p>
                              <p className="text-foreground">• Enterprise-grade protection</p>
                              <p className="text-foreground">• Discord webhook logging</p>
                              <p className="text-foreground">• Public access mode</p>
                              <p className="text-foreground">• Custom branding</p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* AI Benefits */}
                      <div className="pt-4 border-t">
                        <h4 className="font-semibold mb-3">AI Assistant Limits</h4>
                        <div className="space-y-2 text-sm">
                          {subscription?.plan === 'free' || !subscription?.plan ? (
                            <>
                              <p className="text-muted-foreground">• <strong>5 AI messages</strong> per session</p>
                              <p className="text-muted-foreground">• Standard response speed</p>
                              <p className="text-muted-foreground">• Basic responses (150 tokens max)</p>
                            </>
                          ) : subscription?.plan === 'pro' ? (
                            <>
                              <p className="text-foreground">• <strong>100 AI messages</strong> per session</p>
                              <p className="text-foreground">• Priority response speed</p>
                              <p className="text-foreground">• Detailed responses (2000 tokens max)</p>
                              <p className="text-foreground">• Advanced technical support</p>
                            </>
                          ) : (
                            <>
                              <p className="text-foreground">• <strong>Unlimited AI messages</strong></p>
                              <p className="text-foreground">• Instant response speed</p>
                              <p className="text-foreground">• Comprehensive responses (4000 tokens max)</p>
                              <p className="text-foreground">• Premium support</p>
                              <p className="text-foreground">• Custom AI training available</p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Support */}
                      <div className="pt-4 border-t">
                        <h4 className="font-semibold mb-3">Support & Analytics</h4>
                        <div className="space-y-2 text-sm">
                          {subscription?.plan === 'free' || !subscription?.plan ? (
                            <>
                              <p className="text-muted-foreground">• Community support</p>
                              <p className="text-muted-foreground">• Basic analytics</p>
                            </>
                          ) : subscription?.plan === 'pro' ? (
                            <>
                              <p className="text-foreground">• Priority email support</p>
                              <p className="text-foreground">• Advanced analytics dashboard</p>
                              <p className="text-foreground">• Usage insights & reports</p>
                            </>
                          ) : (
                            <>
                              <p className="text-foreground">• 24/7 dedicated support team</p>
                              <p className="text-foreground">• Real-time analytics</p>
                              <p className="text-foreground">• Custom reporting & insights</p>
                              <p className="text-foreground">• SLA guarantee (99.9% uptime)</p>
                            </>
                          )}
                        </div>
                      </div>

                      {subscription?.expires_at && (
                        <div className="pt-4 border-t">
                          <p className="text-sm font-medium">
                            Plan expires: <span className="text-muted-foreground">{new Date(subscription.expires_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}</span>
                          </p>
                        </div>
                      )}

                      {(subscription?.plan === 'free' || !subscription?.plan) && (
                        <div className="pt-4">
                          <a href="https://defendlua.mysellauth.com/product/pro-activation-keys" target="_blank" rel="noopener noreferrer">
                            <Button variant="hero" className="w-full">
                              Buy Pro Activation Keys
                            </Button>
                          </a>
                          <p className="text-xs text-center text-muted-foreground mt-2">
                            Or <a href="/contact" className="text-primary hover:underline">contact us</a> for Enterprise
                          </p>
                        </div>
                      )}

                      {(subscription?.plan === 'pro' || subscription?.plan === 'enterprise') && (
                        <div className="pt-4 border-t">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" className="w-full text-destructive hover:text-destructive" disabled={isDowngrading}>
                                <ArrowDown className="w-4 h-4 mr-2" />
                                {isDowngrading ? "Downgrading..." : "Downgrade to Free Plan"}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Downgrade to Free Plan?</AlertDialogTitle>
                                <AlertDialogDescription className="space-y-2">
                                  <p>Are you sure you want to downgrade? You will immediately lose access to:</p>
                                  <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                                    <li>Unlimited scripts (limited to 3)</li>
                                    <li>Unlimited HWIDs per script (limited to 10)</li>
                                    <li>Discord webhook logging</li>
                                    <li>Priority AI responses</li>
                                    <li>Advanced analytics</li>
                                  </ul>
                                  <p className="mt-3 font-medium">This action takes effect immediately and cannot be undone.</p>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={handleDowngrade}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Yes, Downgrade
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <p className="text-xs text-center text-muted-foreground mt-2">
                            You can upgrade again anytime with an activation key
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <AIChatWidget 
        userPlan={subscription?.plan || 'free'} 
        userId={userId} 
      />

      <VersionHistoryDialog
        scriptId={historyScript?.id ?? null}
        scriptName={historyScript?.script_name}
        open={!!historyScript}
        onOpenChange={(o) => !o && setHistoryScript(null)}
        onRestored={fetchScripts}
      />
    </div>
  );
};

export default ScriptDashboard;