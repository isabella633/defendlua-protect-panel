import { Shield, BookOpen, Code, Terminal, Key, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Docs = () => {
  const sections = [
    {
      icon: BookOpen,
      title: "Getting Started",
      description: "Quick start guide to protect your first script",
      topics: ["Creating an account", "Understanding the dashboard", "Your first protected script", "Testing protection"]
    },
    {
      icon: Code,
      title: "API Reference",
      description: "Complete API documentation with examples",
      topics: ["Authentication", "Script verification", "HWID management", "Webhook integration"]
    },
    {
      icon: Terminal,
      title: "Integration Guide",
      description: "Step-by-step integration tutorials",
      topics: ["Lua script integration", "Custom loaders", "Error handling", "Best practices"]
    },
    {
      icon: Key,
      title: "Security",
      description: "Learn about our security measures",
      topics: ["Encryption methods", "HWID binding", "Key rotation", "Access control"]
    },
    {
      icon: Users,
      title: "Advanced Features",
      description: "Unlock the full potential of DefendLua",
      topics: ["Custom branding", "Analytics API", "Bulk operations", "White-label setup"]
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
              <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link to="/docs" className="text-soft-blue-dark font-medium">Docs</Link>
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
              <Card key={index} className="p-8 border-soft-blue/20 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <section.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-3 text-foreground">{section.title}</h3>
                <p className="text-muted-foreground mb-6">{section.description}</p>
                <ul className="space-y-2">
                  {section.topics.map((topic, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {topic}
                    </li>
                  ))}
                </ul>
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
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-soft-blue to-soft-purple p-12 rounded-2xl text-white">
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