import { Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for testing and small projects",
      features: [
        "Up to 3 protected scripts",
        "Up to 10 HWIDs per script",
        "Basic access logs",
        "HWID whitelist management",
        "IP whitelist management",
        "HWID blacklist management",
        "Community support",
        "7-day log retention",
        "10 AI questions per session",
        "Standard AI responses (500 tokens)",
      ],
      cta: "Get Started",
      popular: false,
      link: "/",
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "per month",
      description: "Buy activation keys online - auto-generated & secure",
      features: [
        "Unlimited scripts",
        "Unlimited HWIDs per script",
        "Discord webhook logging",
        "Real-time access notifications",
        "Public access mode (auto-whitelist)",
        "Advanced analytics dashboard",
        "HWID whitelist management",
        "IP whitelist management",
        "HWID blacklist management",
        "Priority support",
        "30-day log retention",
        "Custom branding",
        "API access",
        "100 AI questions per session",
        "Priority AI responses (2000 tokens)",
      ],
      cta: "Buy Pro Keys",
      popular: true,
      link: "https://defendlua.mysellauth.com/product/pro-activation-keys",
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For organizations with advanced needs",
      features: [
        "Everything in Pro",
        "Unlimited HWIDs per script",
        "Discord webhook logging",
        "Real-time access notifications",
        "Public access mode (auto-whitelist)",
        "Dedicated support manager",
        "Custom integrations",
        "SLA guarantee",
        "On-premise option available",
        "White-label solution",
        "Unlimited AI questions",
        "Expert AI responses (8000 tokens)",
        "Custom AI training available",
        "24/7 priority support",
        "90-day log retention",
      ],
      cta: "Contact Sales",
      popular: false,
      link: "/contact",
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
              <Link to="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </Link>
              <Link to="/pricing" className="text-soft-blue-dark font-medium">
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
            <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">Simple, Transparent Pricing</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Choose the plan that's right for you. All plans include our core security features.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`p-8 relative ${
                  plan.popular
                    ? "border-primary shadow-xl scale-105 bg-white"
                    : "border-soft-blue/20 bg-white/80 backdrop-blur-sm"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                    Most Popular
                  </Badge>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className={`text-4xl font-bold ${plan.popular ? 'text-green-600' : 'gradient-text'}`}>{plan.price}</span>
                    <span className="text-muted-foreground ml-2">/ {plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to={plan.link || "/"} target={plan.name === "Pro" ? "_blank" : undefined} rel={plan.name === "Pro" ? "noopener noreferrer" : undefined}>
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"} size="lg">
                    {plan.cta}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-white/50">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">Frequently Asked Questions</span>
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "Can I change plans later?",
                a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, PayPal, and cryptocurrency payments.",
              },
              {
                q: "How do I activate my Pro plan?",
                a: "Purchase a Pro activation key from our secure online store at defendlua.mysellauth.com. Keys are auto-generated and regularly updated. Once purchased, enter the key in your dashboard to instantly activate your Pro plan.",
              },
              {
                q: "What happens if I exceed my HWID limit?",
                a: "On Free, you'll receive a notification and can upgrade your plan or remove old HWIDs to add new ones.",
              },
            ].map((faq, i) => (
              <Card key={i} className="p-6 border-green-200/50 bg-white/80 backdrop-blur-sm hover:border-green-400/50 transition-colors">
                <h3 className="text-lg font-semibold mb-2 text-green-700">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-soft-blue to-soft-purple p-12 rounded-2xl text-black">
            <h2 className="text-4xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-lg mb-8 opacity-90">Our team is here to help you choose the right plan</p>
            <Link to="/contact">
              <Button size="lg" variant="secondary" className="font-semibold">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
