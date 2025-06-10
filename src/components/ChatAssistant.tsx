
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Bot, User, Minimize2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeResearchQuestion } from "@/utils/aiService";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  confidence?: number;
}

const ChatAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your research assistant. Ask me about genes, diseases, molecular mechanisms, or any research questions.",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const query = input;
    setInput("");
    setIsLoading(true);

    try {
      console.log('Sending research question to AI:', query);
      const response = await analyzeResearchQuestion(query);
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: response.answer,
        sender: 'ai',
        timestamp: new Date(),
        confidence: response.confidence
      };

      setMessages(prev => [...prev, aiResponse]);
      
      toast({
        title: "AI Analysis Complete",
        description: `Response generated with ${Math.round(response.confidence * 100)}% confidence`,
      });
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: "I'm sorry, I encountered an issue processing your request. Please try again or rephrase your question.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          onClick={() => setIsMinimized(false)}
          className="rounded-full w-14 h-14 bg-emerald-600 hover:bg-emerald-700 shadow-lg"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-96 bg-white/95 backdrop-blur-xl shadow-2xl border-0 z-40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-900 font-light">Research Assistant</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="h-6 w-6 p-0 text-emerald-600 hover:text-emerald-800"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex flex-col h-80">
        <ScrollArea className="flex-1 mb-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'ai' && (
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Bot className="w-3 h-3 text-emerald-600" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    message.sender === 'user'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50/50 text-emerald-900 border border-emerald-100'
                  }`}
                >
                  <div className="font-light">{message.content}</div>
                  {message.confidence && (
                    <div className="text-xs text-emerald-600 mt-2 pt-2 border-t border-emerald-200">
                      Confidence: {Math.round(message.confidence * 100)}%
                    </div>
                  )}
                </div>
                {message.sender === 'user' && (
                  <div className="w-6 h-6 bg-emerald-200 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-emerald-600" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Bot className="w-3 h-3 text-emerald-600" />
                </div>
                <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                    <span className="text-emerald-700 font-light">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="flex gap-2">
          <Input
            placeholder="Ask about genes, diseases, research..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            className="text-sm border-emerald-200 focus:border-emerald-400"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !input.trim()} 
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatAssistant;
