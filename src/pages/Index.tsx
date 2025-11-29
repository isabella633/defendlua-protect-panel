import { useState, useEffect } from "react";
import { Shield, Lock, Code, Users, CheckCircle, Zap, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import AuthForm from "@/components/AuthForm";
import ScriptDashboard from "@/components/ScriptDashboard";
import ScriptProtector from "@/components/ScriptProtector";
import OwnerPanel from "@/components/OwnerPanel";
import ConsentDialog from "@/components/ConsentDialog";

type View = 'landing' | 'auth' | 'dashboard' | 'protect' | 'owner';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [currentScriptId, setCurrentScriptId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setCurrentView('dashboard');
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user && currentView === 'auth') {
        setCurrentView('dashboard');
      } else if (!session?.user && currentView !== 'landing') {
        setCurrentView('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = () => {
    setCurrentView('dashboard');
  };

  const handleViewScript = (scriptId: string) => {
    setCurrentScriptId(scriptId);
    setCurrentView('owner');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setCurrentScriptId(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentView('landing');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Shield className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  if (currentView === 'auth') {
    return <AuthForm onSuccess={handleAuthSuccess} onBack={() => setCurrentView('landing')} />;
  }

  if (currentView === 'dashboard' && user) {
    return (
      <ScriptDashboard
        onNewScript={() => setCurrentView('protect')}
        onViewScript={handleViewScript}
        onLogout={handleLogout}
        userId={user.id}
      />
    );
  }

  if (currentView === 'protect' && user) {
    return <ScriptProtector onBack={handleBackToDashboard} userId={user.id} />;
  }

  if (currentView === 'owner' && user && currentScriptId) {
    return <OwnerPanel scriptId={currentScriptId} onBack={handleBackToDashboard} />;
  }

  // Landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">DefendLua</h1>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                Protect & Monetize
              </Badge>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
                Features
              </Link>
              <Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
                How It Works
              </Link>
              <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
                Pricing
              </Link>
              <Link to="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
                Docs
              </Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
                Contact
              </Link>
              <Button onClick={() => setCurrentView('auth')} variant="default" size="sm">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent pointer-events-none" />
        
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center relative">
            {/* Animated floating elements */}
            <div className="absolute -top-10 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse" />
            <div className="absolute top-20 right-20 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-pulse delay-1000" />
            
            <Badge variant="secondary" className="mb-6 animate-fade-in">
              <Zap className="w-3 h-3 mr-1" />
              Trusted by Developers
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent animate-fade-in">
              Protect & Monetize Your Lua Scripts
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
              The trusted platform for securing your Lua code with advanced whitelisting, 
              licensing, and script protection. Simple, reliable, and developer-friendly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
              <Button onClick={() => setCurrentView('auth')} variant="hero" size="lg" className="group">
                Start Protecting Now
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Link to="/docs">
                <Button variant="gentle" size="lg">
                  <Code className="w-4 h-4 mr-2" />
                  View Documentation
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>No complex setup</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Instant protection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Developer-first</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Why DefendLua?
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for Modern Developers
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to protect, manage, and monetize your Lua scripts in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 hover:border-primary/50 hover:shadow-lg transition-all group">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Advanced Protection</CardTitle>
                <CardDescription>
                  Military-grade encryption and obfuscation keeps your code safe from reverse engineering and unauthorized access.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 hover:shadow-lg transition-all group">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Lock className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Smart Whitelisting</CardTitle>
                <CardDescription>
                  Control exactly who can run your scripts with flexible user-based or HWID whitelisting options.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 hover:shadow-lg transition-all group">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Instant Setup</CardTitle>
                <CardDescription>
                  Get started in minutes, not hours. No complex configuration or technical knowledge required.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Simple Process
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Protect your scripts in three easy steps
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Upload Script",
                  description: "Simply paste or upload your Lua script to our secure platform",
                  icon: Code
                },
                {
                  step: "2",
                  title: "Configure Protection",
                  description: "Set up whitelisting, licensing, and access controls",
                  icon: Lock
                },
                {
                  step: "3",
                  title: "Deploy & Monitor",
                  description: "Get your protected script URL and track usage in real-time",
                  icon: Users
                }
              ].map((item, index) => (
                <div key={index} className="relative">
                  <Card className="h-full border-2">
                    <CardContent className="pt-6">
                      <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-4 font-bold text-lg">
                        {item.step}
                      </div>
                      <item.icon className="w-6 h-6 text-primary mb-4" />
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                  {index < 2 && (
                    <ChevronRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Simple Pricing
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Choose Your Plan
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Start free and scale as you grow. All plans include core protection features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Free",
                price: "$0",
                period: "forever",
                features: ["1 protected script", "Up to 5 HWIDs", "Basic analytics", "Community support"]
              },
              {
                name: "Pro",
                price: "$9.99",
                period: "per month",
                features: ["Unlimited scripts", "Up to 100 HWIDs", "Advanced analytics", "Priority support"],
                popular: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "contact us",
                features: ["Unlimited everything", "Dedicated support", "Custom integrations", "SLA guarantee"]
              }
            ].map((plan, index) => (
              <Card key={index} className={`border-2 ${plan.popular ? 'border-primary shadow-xl' : 'hover:border-primary/50'} transition-all relative`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-2">/ {plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/pricing">
                    <Button variant={plan.popular ? "default" : "outline"} className="w-full">
                      Learn More
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-accent/10 to-transparent">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto border-2 shadow-xl">
            <CardContent className="p-12 text-center">
              <Badge variant="secondary" className="mb-6">
                Get Started Today
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Protect Your Code?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join hundreds of developers who trust DefendLua to secure their Lua scripts. 
                Start protecting your work in minutes.
              </p>
              <Button onClick={() => setCurrentView('auth')} variant="hero" size="lg" className="group">
                Create Free Account
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-6 h-6 text-primary" />
                <span className="font-bold text-lg">DefendLua</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The trusted platform for Lua script protection and monetization.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link to="/docs" className="hover:text-foreground transition-colors">Documentation</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/how-it-works" className="hover:text-foreground transition-colors">How It Works</Link></li>
                <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link to="/docs" className="hover:text-foreground transition-colors">Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/50 mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2024 DefendLua. All rights reserved.
          </div>
        </div>
      </footer>
      
      <ConsentDialog />
    </div>
  );
};

export default Index;
