import { Shield, Mail, MessageSquare, HelpCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message Sent!",
      description: "We'll get back to you as soon as possible.",
    });
    
    setIsSubmitting(false);
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
            <div className="hidden md:flex items-center gap-6">
              <Link to="/features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
              <Link to="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</Link>
              <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link to="/docs" className="text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
              <Link to="/contact" className="text-soft-blue-dark font-medium">Contact</Link>
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
            <span className="gradient-text">Get in Touch</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: Mail,
                title: "Email Us",
                description: "support@defendlua.com",
                action: "Send Email"
              },
              {
                icon: MessageSquare,
                title: "Live Chat",
                description: "Available 9AM - 6PM EST",
                action: "Start Chat"
              },
              {
                icon: HelpCircle,
                title: "Help Center",
                description: "Browse our FAQ and guides",
                action: "Visit Help Center"
              }
            ].map((method, i) => (
              <Card key={i} className="p-6 text-center border-soft-blue/20 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
                <method.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">{method.title}</h3>
                <p className="text-muted-foreground mb-4">{method.description}</p>
                <Button variant="outline" className="w-full">{method.action}</Button>
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <Card className="p-8 md:p-12 border-soft-blue/20 bg-white/80 backdrop-blur-sm">
            <h2 className="text-3xl font-bold mb-6 gradient-text text-center">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Your name" 
                    required 
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your@email.com" 
                    required 
                    className="mt-2"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input 
                  id="subject" 
                  placeholder="How can we help?" 
                  required 
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message" 
                  placeholder="Tell us more about your question or issue..." 
                  rows={6}
                  required 
                  className="mt-2"
                />
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full md:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-white/50">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl font-bold text-center mb-12 gradient-text">Common Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "What's your average response time?",
                a: "We typically respond to all inquiries within 24 hours during business days."
              },
              {
                q: "Do you offer phone support?",
                a: "Phone support is available for Enterprise plan customers. Contact us to learn more."
              },
              {
                q: "Can I schedule a demo?",
                a: "Yes! Enterprise customers can schedule personalized demos. Use the contact form to request one."
              },
              {
                q: "Where can I find technical documentation?",
                a: "Visit our Docs page for comprehensive technical documentation and API references."
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
    </div>
  );
};

export default Contact;