import { Shield, Upload, Key, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const HowItWorks = () => {
  const steps = [
    {
      icon: Upload,
      number: "01",
      title: "Upload Your Script",
      description:
        "Simply paste your Lua script or upload the file to our secure platform. Your code is encrypted and stored safely.",
      code: `-- Your original script
local myScript = "Hello World"
print(myScript)`,
    },
    {
      icon: Key,
      number: "02",
      title: "Get Your Script Key",
      description:
        "Instantly receive a unique script key and integration code. Copy the verification snippet to add protection.",
      code: `-- Add this to your script
local DefendLua = loadstring(game:HttpGet("https://api.defendlua.com/verify"))()
DefendLua.verify("YOUR_SCRIPT_KEY")`,
    },
    {
      icon: Shield,
      number: "03",
      title: "Manage Access",
      description:
        "Control who can use your script through our dashboard. Add or remove HWIDs, monitor usage, and track analytics in real-time.",
      code: `-- Protected script runs
if DefendLua.isVerified() then
  -- Your protected code here
  print("Access granted!")
end`,
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
              <Link to="/features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link to="/how-it-works" className="text-soft-blue-dark font-medium">
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
            <span className="gradient-text">How It Works</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Protect your Lua scripts in three simple steps. No complex setup required.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          {steps.map((step, index) => (
            <div key={index} className="mb-16 last:mb-0">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className={index % 2 === 1 ? "md:order-2" : ""}>
                  <Card className="p-8 border-soft-blue/20 bg-white/80 backdrop-blur-sm">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-r from-soft-blue to-soft-purple flex items-center justify-center text-white font-bold text-xl">
                        {step.number}
                      </div>
                      <step.icon className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-3xl font-bold mb-4 text-foreground">{step.title}</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">{step.description}</p>
                  </Card>
                </div>
                <div className={index % 2 === 1 ? "md:order-1" : ""}>
                  <Card className="p-6 bg-slate-900 border-soft-blue/20">
                    <pre className="text-sm text-green-400 overflow-x-auto">
                      <code>{step.code}</code>
                    </pre>
                  </Card>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex justify-center my-8">
                  <div className="h-12 w-0.5 bg-gradient-to-b from-soft-blue to-soft-purple" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-white/50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-12 gradient-text">Why Developers Choose DefendLua</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: CheckCircle, title: "Simple Setup", desc: "Get started in under 5 minutes" },
              { icon: Shield, title: "Bank-Level Security", desc: "Military-grade encryption" },
              { icon: Key, title: "Full Control", desc: "Manage access your way" },
            ].map((benefit, i) => (
              <Card
                key={i}
                className="p-6 text-center border-soft-blue/20 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all"
              >
                <benefit.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-soft-blue to-soft-purple p-12 rounded-2xl text-black">
            <h2 className="text-4xl font-bold mb-4">Start Protecting Your Scripts Today</h2>
            <p className="text-lg mb-8 opacity-90">Join thousands of developers who trust DefendLua</p>
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

export default HowItWorks;
