import { Shield, Zap, Code, Lock, Activity, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Features = () => {
  const features = [
    {
      icon: Shield,
      title: "HWID Protection",
      description: "Lock scripts to specific hardware IDs to prevent unauthorized access and sharing.",
      details: [
        "Secure HWID verification",
        "Multi-device support",
        "Automatic blacklist management",
        "Real-time access control",
      ],
    },
    {
      icon: Lock,
      title: "Script Key System",
      description: "Generate unique keys for each script with full control over access and permissions.",
      details: ["Unique key generation", "Key expiration support", "Usage tracking", "Easy key management"],
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized verification process that won't slow down your scripts.",
      details: ["Sub-100ms verification", "CDN-powered delivery", "Minimal overhead", "99.9% uptime"],
    },
    {
      icon: Database,
      title: "Secure Storage",
      description: "Your scripts and keys are encrypted and stored securely in the cloud.",
      details: ["End-to-end encryption", "Automated backups", "Data redundancy", "GDPR compliant"],
    },
    {
      icon: Activity,
      title: "Real-time Dashboard",
      description: "Monitor all your protected scripts and manage access in one place.",
      details: ["Live usage analytics", "Access logs", "User management", "Custom alerts"],
    },
    {
      icon: Code,
      title: "Easy Integration",
      description: "Simple API that works with any Lua executor in just a few lines of code.",
      details: ["Simple API calls", "Clear documentation", "Example scripts", "Developer support"],
    },
  ];

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
            <div className="hidden md:flex items-center gap-6">
              <Link to="/features" className="text-soft-blue-dark font-medium">
                Features
              </Link>
              <Link to="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </Link>
              <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link to="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
                Docs
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
            <Link to="/">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            <span className="gradient-text">Powerful Features</span>
            <br />
            <span className="text-foreground">for Script Protection</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Everything you need to protect, monitor, and monetize your Lua scripts with confidence.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-8 hover:shadow-lg transition-all duration-300 border-soft-blue/20 bg-white/80 backdrop-blur-sm"
              >
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.details.map((detail, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-soft-blue to-soft-purple p-12 rounded-2xl text-black">
            <h2 className="text-4xl font-bold mb-4">Ready to Protect Your Scripts?</h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of developers who trust DefendLua to secure their work.
            </p>
            <Link to="/">
              <Button size="lg" variant="secondary" className="font-semibold">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;
