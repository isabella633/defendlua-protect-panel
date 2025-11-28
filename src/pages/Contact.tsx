import { Shield, Mail, MessageSquare, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Contact = () => {
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
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center border-soft-blue/20 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
              <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Email Us</h3>
              <p className="text-muted-foreground mb-4">support@defendlua.com</p>
              <a href="mailto:support@defendlua.com">
                <Button variant="outline" className="w-full">Send Email</Button>
              </a>
            </Card>

            <Card className="p-8 text-center border-soft-blue/20 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
              <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Live Chat</h3>
              <p className="text-muted-foreground mb-4">Available 9AM - 6PM EST</p>
              <Button variant="outline" className="w-full" onClick={() => {
                alert('Live chat coming soon! For now, please email us at support@defendlua.com');
              }}>Start Chat</Button>
            </Card>

            <Card className="p-8 text-center border-soft-blue/20 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
              <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Help Center</h3>
              <p className="text-muted-foreground mb-4">Browse our FAQ and guides</p>
              <Link to="/docs">
                <Button variant="outline" className="w-full">Visit Help Center</Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-white/50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-12 gradient-text">Common Questions</h2>
          <Accordion type="single" collapsible className="space-y-4">
            {[
              {
                q: "What's your average response time?",
                a: "We typically respond to all inquiries within 24 hours during business days. For urgent issues, Enterprise customers have access to priority support with faster response times."
              },
              {
                q: "Do you offer phone support?",
                a: "Phone support is available for Enterprise plan customers. Contact us at support@defendlua.com to learn more about our Enterprise offerings and schedule a call."
              },
              {
                q: "Can I schedule a demo?",
                a: "Yes! Enterprise customers can schedule personalized demos to see how DefendLua can protect their scripts. Email us at support@defendlua.com to request a demo."
              },
              {
                q: "Where can I find technical documentation?",
                a: "Visit our Docs page for comprehensive technical documentation, API references, integration guides, and code examples. You can also find video tutorials and best practices."
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, PayPal, and bank transfers for Enterprise customers. All payments are processed securely through our payment provider."
              },
              {
                q: "How do I report a bug or issue?",
                a: "Email us at support@defendlua.com with details about the issue, including error messages, steps to reproduce, and your script configuration. We'll investigate and respond promptly."
              }
            ].map((faq, i) => (
              <Card key={i} className="border-soft-blue/20 bg-white/80 backdrop-blur-sm">
                <AccordionItem value={`item-${i}`} className="border-none">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-soft-blue/5">
                    <span className="text-lg font-bold text-left">{faq.q}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              </Card>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
};

export default Contact;