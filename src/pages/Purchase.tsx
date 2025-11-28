import { useState } from "react";
import { Shield, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Purchase = () => {
  const [activationCode, setActivationCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRedeeming(true);

    try {
      const { data, error } = await supabase.functions.invoke('redeem-activation-code', {
        body: { code: activationCode.trim() }
      });

      if (error) {
        if (error.message?.includes('authentication') || error.message?.includes('JWT')) {
          toast({
            title: "Authentication Required",
            description: "Please log in to redeem an activation code.",
            variant: "destructive",
          });
          navigate("/");
          return;
        }
        throw error;
      }

      if (data.error) {
        toast({
          title: "Activation Failed",
          description: data.error,
          variant: "destructive",
        });
        setIsRedeeming(false);
        return;
      }

      toast({
        title: "Success!",
        description: `Your ${data.plan.toUpperCase()} plan has been activated for ${data.duration_days} days!`,
      });

      setTimeout(() => navigate("/"), 2000);
    } catch (error: any) {
      console.error("Redemption error:", error);
      toast({
        title: "Redemption Failed",
        description: error.message || "An error occurred while redeeming your code.",
        variant: "destructive",
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-soft-blue/20 via-white to-soft-purple/20">
      {/* Navigation */}
      <nav className="border-b border-soft-blue/20 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold gradient-text">DefendLua</span>
            </Link>
            <Link to="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">
              <span className="gradient-text">Activate Pro Plan</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Enter your activation code to unlock Pro features
            </p>
          </div>

          <Card className="p-8 mb-8 border-soft-blue/20 bg-white/80 backdrop-blur-sm">
            <form onSubmit={handleRedeemCode} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code">Activation Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter your activation code"
                  value={activationCode}
                  onChange={(e) => setActivationCode(e.target.value)}
                  required
                  disabled={isRedeeming}
                  className="font-mono"
                />
                <p className="text-sm text-muted-foreground">
                  Have a code? Enter it above to activate your Pro subscription
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isRedeeming || !activationCode.trim()}
              >
                {isRedeeming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Activating...
                  </>
                ) : (
                  "Activate Pro"
                )}
              </Button>
            </form>
          </Card>

          {/* Pro Features */}
          <Card className="p-8 border-soft-blue/20 bg-white/80 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-6 text-center gradient-text">
              What's Included in Pro
            </h2>
            <ul className="space-y-4">
              {[
                "Unlimited scripts",
                "Up to 100 HWIDs per script",
                "Advanced analytics",
                "Priority support",
                "30-day access logs",
                "Custom branding",
                "API access",
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </Card>

          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              Don't have a code?{" "}
              <Link to="/contact" className="text-primary hover:underline font-medium">
                Contact us
              </Link>{" "}
              to purchase one
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Purchase;
