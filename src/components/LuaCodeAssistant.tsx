import { useState, useEffect, useRef } from "react";
import { Bot, X, Send, Loader2, Code, Sparkles, Zap, Crown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  codeBlock?: string;
  action?: "clear_code";
}

interface LuaCodeAssistantProps {
  userPlan?: "free" | "pro" | "enterprise";
  userId?: string;
  currentCode?: string;
  onInsertCode?: (code: string) => void;
  onClearCode?: () => void;
}

const LuaCodeAssistant = ({
  userPlan = "free",
  userId,
  currentCode,
  onInsertCode,
  onClearCode,
}: LuaCodeAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi! I'm your Lua Code Assistant${userPlan !== "free" ? ` (${userPlan.toUpperCase()} tier)` : ""}. I can help you with Lua scripting, debugging, and optimization. Ask me anything!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const limits = {
    free: { maxMessages: 10, maxTokens: 300, label: "10 questions" },
    pro: { maxMessages: 200, maxTokens: 2500, label: "200 questions" },
    enterprise: { maxMessages: Infinity, maxTokens: 5000, label: "Unlimited" },
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Check message limits
    if (messageCount >= limits[userPlan].maxMessages) {
      toast({
        title: "Question Limit Reached",
        description:
          userPlan === "free"
            ? "Upgrade to Pro for 200 questions per session!"
            : "Upgrade to Enterprise for unlimited questions!",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setMessageCount((prev) => prev + 1);

    try {
      const { data, error } = await supabase.functions.invoke("lua-code-assist", {
        body: {
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          currentCode,
        },
      });

      if (error) throw error;

      // Extract code block from response if present
      const codeBlockMatch = data.message.match(/```(?:lua)?\n([\s\S]*?)```/);
      const codeBlock = codeBlockMatch ? codeBlockMatch[1].trim() : undefined;

      // Check if the message is about clearing/deleting code
      const clearKeywords = ["clear", "delete", "remove", "empty", "erase"];
      const codeKeywords = ["code", "editor", "text box", "input", "everything"];
      const messageText = data.message.toLowerCase();
      const hasClearIntent =
        clearKeywords.some((k) => messageText.includes(k)) && codeKeywords.some((k) => messageText.includes(k));

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        codeBlock,
        action: hasClearIntent ? "clear_code" : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Code assist error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to get assistance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanIcon = () => {
    switch (userPlan) {
      case "enterprise":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case "pro":
        return <Zap className="w-4 h-4 text-purple-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPlanColor = () => {
    switch (userPlan) {
      case "enterprise":
        return "from-yellow-500/20 to-orange-500/20 border-yellow-500/30";
      case "pro":
        return "from-purple-500/20 to-pink-500/20 border-purple-500/30";
      default:
        return "from-blue-500/20 to-cyan-500/20 border-blue-500/30";
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className="fixed bottom-6 left-6 rounded-full h-16 w-16 shadow-lg hover:shadow-xl transition-all z-50"
        variant="secondary"
      >
        <Bot className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 left-6 w-96 h-[600px] shadow-2xl flex flex-col border-2 border-primary/20 z-50">
      {/* Header */}
      <div className={`bg-gradient-to-r ${getPlanColor()} border-b p-4 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-bold text-foreground flex items-center gap-2">
              Lua Assistant (BETA)
              {getPlanIcon()}
            </h3>
            <p className="text-xs text-muted-foreground">{limits[userPlan].label}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Plan Badge */}
      <div className="px-4 py-2 bg-muted/50 border-b flex items-center justify-between">
        <Badge variant={userPlan === "free" ? "secondary" : "default"}>{userPlan.toUpperCase()} Plan</Badge>
        <span className="text-xs text-muted-foreground">
          {userPlan === "enterprise"
            ? "Unlimited questions"
            : `${messageCount}/${limits[userPlan].maxMessages} questions`}
        </span>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[85%] rounded-lg p-3 ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {message.codeBlock && message.role === "assistant" && onInsertCode && (
                <Button size="sm" variant="outline" onClick={() => onInsertCode(message.codeBlock!)} className="mt-2">
                  <Plus className="w-3 h-3 mr-1" />
                  Insert Code
                </Button>
              )}
              {message.action === "clear_code" && message.role === "assistant" && onClearCode && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    onClearCode();
                    toast({
                      title: "Code Cleared",
                      description: "The editor has been cleared",
                    });
                  }}
                  className="mt-2"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear Editor
                </Button>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder={
              messageCount >= limits[userPlan].maxMessages ? "Upgrade to continue..." : "Ask about your Lua code..."
            }
            disabled={isLoading || messageCount >= limits[userPlan].maxMessages}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !input.trim() || messageCount >= limits[userPlan].maxMessages}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        {messageCount >= limits[userPlan].maxMessages && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {userPlan === "free" ? "Upgrade to Pro for 200 questions!" : "Upgrade to Enterprise for unlimited!"}
          </p>
        )}
      </div>
    </Card>
  );
};

export default LuaCodeAssistant;
