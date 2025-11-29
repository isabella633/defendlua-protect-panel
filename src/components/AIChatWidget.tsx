import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Loader2, Crown, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatWidgetProps {
  userPlan?: 'free' | 'pro' | 'enterprise';
  userId?: string;
}

const AIChatWidget = ({ userPlan = 'free', userId }: AIChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi! I'm DefendLua AI Assistant${userPlan !== 'free' ? ` (${userPlan.toUpperCase()} tier)` : ''}. How can I help you today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const limits = {
    free: { maxMessages: 5, responseTime: 'Standard', label: '5 msgs' },
    pro: { maxMessages: 100, responseTime: 'Priority', label: '100 msgs' },
    enterprise: { maxMessages: Infinity, responseTime: 'Instant', label: 'Unlimited' }
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
        title: "Message Limit Reached",
        description: userPlan === 'free' 
          ? "Upgrade to Pro for 100 messages per session!"
          : "Upgrade to Enterprise for unlimited messages!",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setMessageCount(prev => prev + 1);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanIcon = () => {
    switch (userPlan) {
      case 'enterprise':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'pro':
        return <Zap className="w-4 h-4 text-purple-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPlanColor = () => {
    switch (userPlan) {
      case 'enterprise':
        return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
      case 'pro':
        return 'from-purple-500/20 to-pink-500/20 border-purple-500/30';
      default:
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className="fixed bottom-6 right-6 rounded-full h-16 w-16 shadow-lg hover:shadow-xl transition-all"
      >
        <MessageSquare className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl flex flex-col border-2 border-primary/20">
      {/* Header */}
      <div className={`bg-gradient-to-r ${getPlanColor()} border-b p-4 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          {getPlanIcon()}
          <div>
            <h3 className="font-bold text-foreground">DefendLua AI</h3>
            <p className="text-xs text-muted-foreground">
              {limits[userPlan].responseTime} Response
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Plan Badge */}
      <div className="px-4 py-2 bg-muted/50 border-b flex items-center justify-between">
        <Badge variant={userPlan === 'free' ? 'secondary' : 'default'}>
          {userPlan.toUpperCase()} Plan
        </Badge>
        <span className="text-xs text-muted-foreground">
          {userPlan === 'enterprise' 
            ? 'Unlimited messages' 
            : `${messageCount}/${limits[userPlan].maxMessages} messages`
          }
        </span>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
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
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={
              messageCount >= limits[userPlan].maxMessages
                ? 'Upgrade to continue...'
                : 'Type your message...'
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
            {userPlan === 'free' 
              ? 'Upgrade to Pro for 100 messages!'
              : 'Upgrade to Enterprise for unlimited!'}
          </p>
        )}
      </div>
    </Card>
  );
};

export default AIChatWidget;
