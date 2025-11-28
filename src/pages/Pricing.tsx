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
        "1 protected script",
        "Up to 5 HWIDs",
        "Basic analytics",
        "Community support",
        "7-day access logs"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "per month",
      description: "For serious developers and small teams",
      features: [
        "Unlimited scripts",
        "Up to 100 HWIDs per script",
        "Advanced analytics",
        "Priority support",
        "30-day access logs",
        "Custom branding",
        "API access"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For organizations with advanced needs",
      features: [
        "Everything in Pro",
        "Unlimited HWIDs",
        "Dedicated support",
        "Custom integrations",
        "SLA guarantee",
        "On-premise option",
        "White-label solution"
      ],
      cta: "Contact Sales",
      popular: false
    }
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
              <Link to="/features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
              <Link to="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</Link>
              <Link to="/pricing" className="text-soft-blue-dark font-medium">Pricing</Link>
              <Link to="/docs" className="text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
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
            <span className="gradient-text">Simple, Transparent Pricing</span>
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
                    ? 'border-primary shadow-xl scale-105 bg-white' 
                    : 'border-soft-blue/20 bg-white/80 backdrop-blur-sm'
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-soft-blue to-soft-purple">
                    Most Popular
                  </Badge>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold gradient-text">{plan.price}</span>
                    <span className="text-muted-foreground ml-2">/ {plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/">
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                  >
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
          <h2 className="text-4xl font-bold text-center mb-12 gradient-text">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "Can I change plans later?",
                a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately."
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, PayPal, and cryptocurrency payments."
              },
              {
                q: "Is there a free trial for Pro?",
                a: "Yes! We offer a 14-day free trial for the Pro plan with no credit card required."
              },
              {
                q: "What happens if I exceed my HWID limit?",
                a: "You'll receive a notification and can upgrade your plan or remove old HWIDs to add new ones."
              }
            ].map((faq, i) => (
              <Card key={i} className="p-6 border-soft-blue/20 bg-white/80 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-2">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-soft-blue to-soft-purple p-12 rounded-2xl text-white">
            <h2 className="text-4xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-lg mb-8 opacity-90">
              Our team is here to help you choose the right plan
            </p>
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