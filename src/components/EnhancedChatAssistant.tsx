import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Sparkles,
  Brain,
  BookOpen,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'research' | 'analysis';
  metadata?: {
    confidence?: number;
    sources?: string[];
    relatedTopics?: string[];
  };
}

interface EnhancedChatAssistantProps {
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

const EnhancedChatAssistant = ({ isFullScreen = false, onToggleFullScreen }: EnhancedChatAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI research assistant. I can help you with:\n\n• Literature analysis and summaries\n• Gene function explanations\n• Research methodology guidance\n• Data interpretation\n• Citation recommendations\n\nWhat would you like to explore today?",
      sender: 'ai',
      timestamp: new Date(),
      type: 'text',
      metadata: {
        confidence: 1.0,
        relatedTopics: ['Research Methods', 'Literature Review', 'Data Analysis']
      }
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const callOpenAI = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY || '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'}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are an expert AI research assistant specializing in biomedical research, genetics, molecular biology, and scientific literature analysis. You provide accurate, well-researched responses with scientific rigor. 

Key capabilities:
- Explain complex biological concepts clearly
- Analyze research papers and methodologies
- Provide gene function information
- Suggest research directions
- Help with data interpretation
- Recommend relevant literature

Always:
- Use scientific terminology appropriately
- Cite relevant research when possible
- Provide confidence levels for your responses
- Suggest related topics for further exploration
- Be helpful but acknowledge limitations

Format responses clearly with proper structure when explaining complex topics.`
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  };

  const generateFallbackResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('gene') || lowerMessage.includes('dna')) {
      return "I can help you understand gene functions and DNA mechanisms. Genes encode proteins that perform specific cellular functions, and their expression is tightly regulated through various molecular mechanisms including transcriptional control, epigenetic modifications, and post-translational modifications.";
    }
    
    if (lowerMessage.includes('cancer') || lowerMessage.includes('tumor')) {
      return "Cancer involves the dysregulation of normal cellular processes, particularly cell cycle control and apoptosis. Key pathways include p53 tumor suppressor pathway, PI3K/AKT signaling, and DNA damage response mechanisms. Would you like me to explain any specific aspect of cancer biology?";
    }
    
    if (lowerMessage.includes('research') || lowerMessage.includes('study')) {
      return "I can assist with various aspects of research methodology including experimental design, statistical analysis, literature review strategies, and data interpretation. What specific research challenge are you facing?";
    }
    
    return "I understand you're asking about a scientific topic. While I'm currently experiencing some connectivity issues with my advanced AI capabilities, I can still help with basic research questions. Could you please rephrase your question or ask about a specific biological concept?";
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let aiResponse: string;
      let confidence = 0.9;
      let sources: string[] = [];
      let relatedTopics: string[] = [];

      try {
        aiResponse = await callOpenAI(input);
        sources = ["OpenAI GPT-4", "Scientific Literature Database"];
        relatedTopics = extractRelatedTopics(input);
      } catch (error) {
        aiResponse = generateFallbackResponse(input);
        confidence = 0.7;
        sources = ["Local Knowledge Base"];
        
        toast({
          title: "Using offline mode",
          description: "AI assistant is running in offline mode with limited capabilities.",
          variant: "default",
        });
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        type: determineMessageType(input),
        metadata: {
          confidence,
          sources,
          relatedTopics
        }
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const extractRelatedTopics = (message: string): string[] => {
    const topics = [];
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('gene')) topics.push('Genomics', 'Molecular Biology');
    if (lowerMessage.includes('protein')) topics.push('Proteomics', 'Structural Biology');
    if (lowerMessage.includes('cancer')) topics.push('Oncology', 'Cell Biology');
    if (lowerMessage.includes('research')) topics.push('Research Methods', 'Statistics');
    
    return topics.slice(0, 3);
  };

  const determineMessageType = (message: string): 'text' | 'research' | 'analysis' => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('analyze') || lowerMessage.includes('analysis')) return 'analysis';
    if (lowerMessage.includes('research') || lowerMessage.includes('study')) return 'research';
    return 'text';
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Message content has been copied.",
    });
  };

  const getMessageIcon = (type?: string) => {
    switch (type) {
      case 'research': return <BookOpen className="w-4 h-4" />;
      case 'analysis': return <Brain className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  if (isMinimized && !isFullScreen) {
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

  const containerClasses = isFullScreen 
    ? "w-full h-full bg-white shadow-none border-0" 
    : "fixed bottom-4 right-4 w-96 h-[600px] bg-white shadow-2xl border-0 z-40 rounded-lg";

  return (
    <Card className={containerClasses}>
      <CardHeader className="pb-3 border-b border-emerald-100">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Bot className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <span className="text-emerald-900 font-medium">AI Research Assistant</span>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-emerald-600">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!isFullScreen && onToggleFullScreen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleFullScreen}
                className="h-6 w-6 p-0"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            )}
            {!isFullScreen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="h-6 w-6 p-0"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col h-full">
        <ScrollArea 
          ref={scrollAreaRef}
          className={cn("flex-1 p-4", isFullScreen ? "h-[calc(100vh-200px)]" : "h-[480px]")}
        >
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.sender === 'ai' && (
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {getMessageIcon(message.type)}
                  </div>
                )}
                
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg p-4 relative group",
                    message.sender === 'user'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-50 text-gray-900 border border-gray-200'
                  )}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                  
                  {message.metadata && message.sender === 'ai' && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          Confidence: {Math.round((message.metadata.confidence || 0) * 100)}%
                        </Badge>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyMessage(message.content)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {message.metadata.relatedTopics && message.metadata.relatedTopics.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {message.metadata.relatedTopics.map((topic, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="text-xs opacity-60 mt-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                
                {message.sender === 'user' && (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                    <span className="text-sm text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <Input
              placeholder="Ask about research, genes, methodologies..."
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
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span className="text-xs text-emerald-600">Powered by GPT-4</span>
            </div>
            <span className="text-xs text-gray-500">
              {messages.length - 1} messages
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedChatAssistant;