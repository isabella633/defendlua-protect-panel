import { Shield, BookOpen, Code, Terminal, Key, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SEO from "@/components/SEO";

const Docs = () => {
  const sections = [
    {
      icon: BookOpen,
      title: "Getting Started",
      description: "Quick start guide to protect your first script",
      topics: [
        {
          name: "Creating an account",
          content:
            "Sign up for DefendLua by clicking 'Get Started' and filling out the registration form. Verify your email to activate your account and access the dashboard.",
        },
        {
          name: "Understanding the dashboard",
          content:
            "The dashboard is your central hub for managing scripts. Here you'll find an overview of all your protected scripts, active HWIDs, and recent activity logs.",
        },
        {
          name: "Your first protected script",
          content:
            "Create a new script by clicking 'Add Script', give it a name, and copy the generated script key. You'll use this key to integrate protection into your Lua code.",
        },
        {
          name: "Testing protection",
          content:
            "Test your protected script by running it in a safe environment. The verification system will check the HWID and script key before allowing execution.",
        },
      ],
    },
    {
      icon: Code,
      title: "API Reference",
      description: "Complete API documentation with examples",
      topics: [
        {
          name: "Authentication",
          content:
            "All API requests require authentication using your API key. Include it in the Authorization header: 'Authorization: Bearer YOUR_API_KEY'",
        },
        {
          name: "Script verification",
          content:
            "The verify endpoint checks if a script key and HWID combination is authorized. Returns success status and user information on valid requests.",
        },
        {
          name: "HWID management",
          content:
            "Manage hardware IDs through the API. Add, remove, or list HWIDs associated with your scripts. Each script can have multiple authorized HWIDs.",
        },
        {
          name: "Webhook integration",
          content:
            "Set up webhooks to receive real-time notifications about script usage, unauthorized access attempts, and HWID changes.",
        },
      ],
    },
    {
      icon: Terminal,
      title: "Integration Guide",
      description: "Step-by-step integration tutorials",
      topics: [
        {
          name: "Lua script integration",
          content:
            "Add DefendLua protection to your Lua scripts by including the verification code at the start of your script. The loader will handle HWID checking and authorization.",
        },
        {
          name: "Custom loaders",
          content:
            "Create custom loaders for specific platforms or use cases. Loaders handle the verification process and can be customized to fit your workflow.",
        },
        {
          name: "Error handling",
          content:
            "Implement proper error handling for verification failures. Show user-friendly messages and log errors for debugging purposes.",
        },
        {
          name: "Best practices",
          content:
            "Keep your script keys secure, never hardcode them in public code. Use environment variables and regularly rotate keys for sensitive scripts.",
        },
      ],
    },
    {
      icon: Key,
      title: "Security",
      description: "Learn about our security measures",
      topics: [
        {
          name: "Encryption methods",
          content:
            "All script keys and HWIDs are encrypted using AES-256 encryption. Communication between your script and our servers uses TLS 1.3 for maximum security.",
        },
        {
          name: "HWID binding",
          content:
            "Hardware ID binding ensures scripts only run on authorized devices. Each HWID is uniquely identified and validated against your whitelist.",
        },
        {
          name: "Key rotation",
          content:
            "Regularly rotate your script keys to maintain security. The dashboard makes it easy to generate new keys and update your scripts.",
        },
        {
          name: "Access control",
          content:
            "Implement role-based access control for team members. Control who can create scripts, manage HWIDs, and view analytics.",
        },
      ],
    },
    {
      icon: Users,
      title: "Advanced Features",
      description: "Unlock the full potential of DefendLua",
      topics: [
        {
          name: "Custom branding",
          content:
            "White-label the verification experience with your own branding. Customize error messages, loader screens, and user-facing text.",
        },
        {
          name: "Analytics API",
          content:
            "Access detailed analytics through our API. Track script usage, identify trends, and monitor user behavior across all your protected scripts.",
        },
        {
          name: "Bulk operations",
          content:
            "Manage multiple scripts and HWIDs at once using bulk operations. Import/export HWID lists and perform batch updates efficiently.",
        },
        {
          name: "White-label setup",
          content:
            "Enterprise plans include full white-labeling capabilities. Use your own domain, branding, and customize the entire user experience.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-soft-blue/20 via-white to-soft-purple/20">
      <SEO title="Documentation — DefendLua" description="DefendLua docs: getting started, script protection, HWID whitelist, IP whitelist, Discord bot, and API reference." path="/docs" />
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
              <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link to="/docs" className="text-soft-blue-dark font-medium">
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
            <span className="gradient-text">Documentation</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Everything you need to know to integrate and use DefendLua effectively.
          </p>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sections.map((section, index) => (
              <Card
                key={index}
                className="border-soft-blue/20 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-8">
                  <section.icon className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-2xl font-bold mb-3 text-foreground">{section.title}</h3>
                  <p className="text-muted-foreground mb-6">{section.description}</p>
                  <Accordion type="single" collapsible className="w-full">
                    {section.topics.map((topic, i) => (
                      <AccordionItem key={i} value={`item-${i}`}>
                        <AccordionTrigger className="text-sm hover:text-primary">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {topic.name}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground pl-4">
                          {topic.content}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start Example */}
      <section className="py-20 px-4 bg-white/50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-12 gradient-text">Quick Start Example</h2>
          <Card className="p-8 border-soft-blue/20 bg-white/80 backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-4">Basic Script Protection</h3>
            <p className="text-muted-foreground mb-6">
              Here's a simple example of how to protect your Lua script with DefendLua:
            </p>
            <Card className="p-6 bg-slate-900 border-soft-blue/20 mb-6">
              <pre className="text-sm text-green-400 overflow-x-auto">
                <code>{`-- Load the DefendLua library
local DefendLua = loadstring(game:HttpGet(
  "https://api.defendlua.com/verify"
))()

-- Your script key (get this from dashboard)
local SCRIPT_KEY = "your_script_key_here"

-- Verify access
local success, result = pcall(function()
  return DefendLua.verify(SCRIPT_KEY)
end)

if success and result.authorized then
  print("Access granted! HWID:", result.hwid)
  
  -- Your protected code goes here
  print("Running protected script...")
  
else
  print("Access denied:", result.message)
  return
end`}</code>
              </pre>
            </Card>
            <div className="flex gap-4">
              <Button>View Full Documentation</Button>
              <Button variant="outline">See More Examples</Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-soft-blue to-soft-purple p-12 rounded-2xl text-black">
            <h2 className="text-4xl font-bold mb-4">Need Help?</h2>
            <p className="text-lg mb-8 opacity-90">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <Link to="/contact">
              <Button size="lg" variant="secondary" className="font-semibold">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Docs;
