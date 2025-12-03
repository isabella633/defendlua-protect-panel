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
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AIChatWidget from "./AIChatWidget";

interface Script {
  id: string;
  script_name: string;
  created_at: string;
  updated_at: string;
  script_key: string;
  hwid_list: string[];
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
  const [subscription, setSubscription] = useState<any>(null);
  const [userEmail, setUserEmail] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscription();
    fetchScripts();
    fetchUserEmail();
  }, [userId]);

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
                        <p className="text-foreground">• Up to 100 HWIDs per script</p>
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
                    <p className="text-sm text-muted-foreground">
                      Plan expires: {new Date(subscription.expires_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

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
                  <p>✓ Up to 100 HWIDs per script</p>
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
                      <Badge className="bg-primary/10 text-primary">
                        Protected
                      </Badge>
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
                              <p className="text-foreground">• Up to 100 HWIDs per script</p>
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
    </div>
  );
};

export default ScriptDashboard;