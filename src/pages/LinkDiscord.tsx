import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Copy, RefreshCw, Unlink, MessageCircle, Bot, ExternalLink } from "lucide-react";
import logoImage from "@/assets/defendlua-logo.png";
import SEO from "@/components/SEO";

export default function LinkDiscord() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [linkCode, setLinkCode] = useState<string | null>(null);
  const [codeExpiry, setCodeExpiry] = useState<Date | null>(null);
  const [discordLink, setDiscordLink] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  // Official DefendLua Discord Bot
  const OFFICIAL_BOT_INVITE = "https://discord.com/oauth2/authorize?client_id=1385790808900501676&permissions=2147502080&integration_type=0&scope=bot";

  const copyInviteLink = async () => {
    const { copyToClipboard } = await import("@/lib/copyToClipboard");
    const ok = await copyToClipboard(OFFICIAL_BOT_INVITE);
    if (ok) toast.success("Invite link copied to clipboard!");
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/");
      return;
    }
    setUser(session.user);
    await fetchDiscordLink(session.user.id);
    await fetchExistingCode(session.user.id);
    setLoading(false);
  };

  const fetchDiscordLink = async (userId: string) => {
    const { data } = await supabase
      .from("discord_links")
      .select("*")
      .eq("user_id", userId)
      .single();
    setDiscordLink(data);
  };

  const fetchExistingCode = async (userId: string) => {
    const { data } = await supabase
      .from("discord_link_codes")
      .select("*")
      .eq("user_id", userId)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    
    if (data) {
      setLinkCode(data.code);
      setCodeExpiry(new Date(data.expires_at));
    }
  };

  const generateCode = async () => {
    if (!user) return;
    setGenerating(true);

    try {
      // Generate code using database function
      const { data: codeData, error: codeError } = await supabase
        .rpc("generate_discord_link_code");

      if (codeError) throw codeError;

      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      const { error: insertError } = await supabase
        .from("discord_link_codes")
        .insert({
          user_id: user.id,
          code: codeData,
          expires_at: expiresAt.toISOString(),
        });

      if (insertError) throw insertError;

      setLinkCode(codeData);
      setCodeExpiry(expiresAt);
      toast.success("Link code generated!");
    } catch (error: any) {
      console.error("Error generating code:", error);
      toast.error("Failed to generate code");
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = async () => {
    if (linkCode) {
      const { copyToClipboard } = await import("@/lib/copyToClipboard");
      const ok = await copyToClipboard(linkCode);
      if (ok) toast.success("Code copied to clipboard!");
    }
  };

  const unlinkDiscord = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("discord_links")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to unlink Discord");
    } else {
      setDiscordLink(null);
      toast.success("Discord account unlinked!");
    }
  };

  const formatTimeRemaining = () => {
    if (!codeExpiry) return "";
    const now = new Date();
    const diff = codeExpiry.getTime() - now.getTime();
    if (diff <= 0) return "Expired";
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Update timer every second
  useEffect(() => {
    if (!codeExpiry) return;
    const timer = setInterval(() => {
      const now = new Date();
      if (codeExpiry.getTime() <= now.getTime()) {
        setLinkCode(null);
        setCodeExpiry(null);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [codeExpiry]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <SEO title="Link Discord — DefendLua" description="Link your Discord account to DefendLua to manage HWID whitelists and scripts from the official Discord bot." path="/link-discord" />
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" aria-label="Back to home" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <img src={logoImage} alt="DefendLua logo" className="h-8 w-8" />
          <h1 className="text-2xl font-bold">Link Discord</h1>
        </div>

        {discordLink ? (
          // Already linked
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
              
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Available Commands:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li><code className="bg-muted px-1 rounded">/scripts</code> - List your scripts</li>
                  <li><code className="bg-muted px-1 rounded">/whitelist &lt;script&gt; &lt;hwid&gt;</code> - Add HWID to whitelist</li>
                  <li><code className="bg-muted px-1 rounded">/unwhitelist &lt;script&gt; &lt;hwid&gt;</code> - Remove from whitelist</li>
                  <li><code className="bg-muted px-1 rounded">/blacklist &lt;script&gt; &lt;hwid&gt;</code> - Add HWID to blacklist</li>
                  <li><code className="bg-muted px-1 rounded">/unblacklist &lt;script&gt; &lt;hwid&gt;</code> - Remove from blacklist</li>
                </ul>
              </div>

              <Button variant="destructive" onClick={unlinkDiscord} className="w-full">
                <Unlink className="h-4 w-4 mr-2" />
                Unlink Discord Account
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Not linked - show code generator
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Link Your Discord Account</CardTitle>
              <CardDescription>
                Generate a code and use it with the Discord bot to link your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Generate Code */}
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                  Generate a Link Code
                </h3>
                
                {linkCode ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={linkCode}
                        readOnly
                        className="font-mono text-lg text-center tracking-wider"
                      />
                      <Button variant="outline" size="icon" aria-label="Copy link code" onClick={copyCode}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Expires in: <span className="font-mono">{formatTimeRemaining()}</span>
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={generateCode} 
                      disabled={generating}
                      className="w-full"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
                      Generate New Code
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={generateCode} 
                    disabled={generating}
                    className="w-full"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
                    Generate Link Code
                  </Button>
                )}
              </div>

              {/* Step 2: Use in Discord */}
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                  Use the Code in Discord
                </h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Send this command to the DefendLua bot:
                  </p>
                  <code className="block bg-muted p-3 rounded text-sm font-mono">
                    /link {linkCode || "YOUR_CODE"}
                  </code>
                </div>
              </div>

              {/* Step 3: Done */}
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                  Start Managing Scripts
                </h3>
                <p className="text-sm text-muted-foreground">
                  Once linked, you can use Discord commands to manage your script whitelists and blacklists!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Official Bot Invite */}
        <Card className="mt-6 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Add Official Bot to Your Server
            </CardTitle>
            <CardDescription>
              Invite the official DefendLua bot to your Discord server
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                The bot requires these permissions to function properly:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Send Messages</li>
                <li>Use Slash Commands</li>
                <li>Embed Links</li>
              </ul>
            </div>
            
            <div className="flex gap-2">
              <Input
                value={OFFICIAL_BOT_INVITE}
                readOnly
                className="font-mono text-xs"
              />
              <Button variant="outline" size="icon" aria-label="Copy Discord bot invite link" onClick={copyInviteLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <a 
              href={OFFICIAL_BOT_INVITE} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <Button variant="hero" className="w-full gap-2">
                <ExternalLink className="h-4 w-4" />
                Add DefendLua Bot to Server
              </Button>
            </a>
          </CardContent>
        </Card>

        {/* Bot Info */}
        <Card className="mt-6 border-muted">
          <CardHeader>
            <CardTitle className="text-lg">About the Discord Bot</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              The DefendLua Discord bot lets you manage your script access controls directly from Discord.
              No need to open the website - just use slash commands!
            </p>
            <p>
              <strong>Note:</strong> Make sure you're messaging the official DefendLua bot.
              Never share your link code with anyone else.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
