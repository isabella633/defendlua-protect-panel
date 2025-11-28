import { Shield, Lock, Zap, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">DefendLua</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/auth')}>Sign In</Button>
              <Button onClick={() => navigate('/auth')}>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-5xl font-bold animate-fade-in">
            Protect & Monetize Your Lua Scripts
          </h1>
          <p className="text-xl text-muted-foreground animate-fade-in">
            The trusted platform for securing your Lua code with advanced whitelisting, 
            licensing, and script protection.
          </p>
          <div className="flex gap-4 justify-center animate-fade-in">
            <Button size="lg" className="text-lg px-8 py-6" onClick={() => navigate('/auth')}>
              Start Protecting Your Scripts
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Why DefendLua?</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Advanced Protection</h3>
              <p className="text-muted-foreground">
                Military-grade security keeps your code safe from reverse engineering
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                <Lock className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold">Smart Whitelisting</h3>
              <p className="text-muted-foreground">
                Control exactly who can run your scripts with HWID whitelisting
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Instant Setup</h3>
              <p className="text-muted-foreground">
                Get started in minutes with our intuitive dashboard
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
