
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
  Search,
  ExternalLink,
  Loader2,
  Brain,
  BookOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeResearchQuestion, searchPubMedResearch } from "@/utils/aiService";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'research' | 'pubmed';
  data?: any;
}

interface EnhancedChatAssistantProps {
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

const EnhancedChatAssistant = ({ isFullScreen = false, onToggleFullScreen }: EnhancedChatAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your intelligent research assistant. I can help you with genetic research, analyze papers, and search PubMed for the latest scientific literature. What would you like to explore?",
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [input, setInput] = useState("");
  const [pubmedQuery, setPubmedQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPubmedLoading, setIsPubmedLoading] = useState(false);
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
      timestamp: new Date(),
      type: 'text'
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
        type: 'research',
        data: {
          confidence: response.confidence,
          sources: response.sources
        }
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
        timestamp: new Date(),
        type: 'text'
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

  const handlePubMedSearch = async () => {
    if (!pubmedQuery.trim() || isPubmedLoading) return;

    const searchQuery = pubmedQuery;
    setPubmedQuery("");
    setIsPubmedLoading(true);

    try {
      console.log('Searching PubMed for:', searchQuery);
      const response = await searchPubMedResearch(searchQuery);
      
      const pubmedMessage: Message = {
        id: Date.now().toString(),
        content: `Found ${response.total} research papers related to "${searchQuery}"`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'pubmed',
        data: {
          query: searchQuery,
          papers: response.papers,
          total: response.total
        }
      };

      setMessages(prev => [...prev, pubmedMessage]);
      
      toast({
        title: "PubMed Search Complete",
        description: `Found ${response.total} relevant papers`,
      });
    } catch (error) {
      console.error('PubMed search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search PubMed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPubmedLoading(false);
    }
  };

  if (!isFullScreen && isMinimized) {
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
    ? "h-full w-full bg-white/95 backdrop-blur-xl border-0" 
    : "fixed bottom-4 right-4 w-96 h-[600px] bg-white/95 backdrop-blur-xl shadow-2xl border-0 z-40";

  return (
    <Card className={containerClasses}>
      <CardHeader className="pb-3 border-b border-emerald-100">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Brain className="w-4 h-4 text-emerald-700" />
            </div>
            <span className="text-emerald-900 font-light">AI Research Intelligence</span>
          </div>
          {!isFullScreen && (
            <div className="flex gap-2">
              {onToggleFullScreen && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleFullScreen}
                  className="h-6 w-6 p-0 text-emerald-600 hover:text-emerald-800"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="h-6 w-6 p-0 text-emerald-600 hover:text-emerald-800"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className={cn("p-4 pt-0 flex flex-col", isFullScreen ? "h-full" : "h-[520px]")}>
        {/* PubMed Search Bar */}
        <div className="mb-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
          <h4 className="text-sm font-medium text-emerald-800 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            PubMed Genetic Research Search
          </h4>
          <div className="flex gap-2">
            <Input
              placeholder="Search genes, diseases, pathways..."
              value={pubmedQuery}
              onChange={(e) => setPubmedQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isPubmedLoading && handlePubMedSearch()}
              className="text-sm border-emerald-200 focus:border-emerald-400"
              disabled={isPubmedLoading}
            />
            <Button 
              onClick={handlePubMedSearch} 
              disabled={isPubmedLoading || !pubmedQuery.trim()} 
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isPubmedLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 mb-4" ref={scrollAreaRef}>
          <div className="space-y-4 pr-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'ai' && (
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-emerald-700" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] p-3 rounded-lg text-sm ${
                    message.sender === 'user'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white/80 text-emerald-900 border border-emerald-100'
                  }`}
                >
                  <div className="font-light leading-relaxed">{message.content}</div>
                  
                  {/* Research Response Data */}
                  {message.type === 'research' && message.data && (
                    <div className="mt-3 pt-3 border-t border-emerald-100">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs bg-emerald-50 border-emerald-200">
                          {Math.round(message.data.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      <div className="text-xs text-emerald-600">
                        <strong>Sources:</strong> {message.data.sources?.join(", ")}
                      </div>
                    </div>
                  )}

                  {/* PubMed Results */}
                  {message.type === 'pubmed' && message.data && (
                    <div className="mt-3 space-y-3">
                      {message.data.papers?.slice(0, 5).map((paper: any, index: number) => (
                        <div key={index} className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                          <h5 className="text-xs font-medium text-emerald-900 mb-2 leading-tight">
                            {paper.title}
                          </h5>
                          <div className="flex items-center justify-between text-xs text-emerald-600 mb-2">
                            <span>{paper.journal} ({paper.year})</span>
                            <Badge variant="secondary" className="text-xs">
                              {paper.citations} citations
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-emerald-500">
                              {paper.authors.slice(0, 2).join(", ")}
                              {paper.authors.length > 2 && ` +${paper.authors.length - 2} more`}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="h-6 px-2 text-xs border-emerald-200 hover:border-emerald-300"
                            >
                              <a href={paper.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                PubMed
                              </a>
                            </Button>
                          </div>
                        </div>
                      ))}
                      {message.data.papers?.length > 5 && (
                        <p className="text-xs text-emerald-500 text-center">
                          ... and {message.data.papers.length - 5} more papers
                        </p>
                      )}
                    </div>
                  )}
                </div>
                {message.sender === 'user' && (
                  <div className="w-8 h-8 bg-emerald-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-emerald-700" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="bg-white/80 border border-emerald-100 p-3 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span className="text-emerald-700 font-light">Analyzing your research question...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="flex gap-2">
          <Input
            placeholder="Ask about genes, molecular mechanisms, research..."
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

export default EnhancedChatAssistant;
