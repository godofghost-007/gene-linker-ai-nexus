
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Link, ExternalLink, AlertCircle, RefreshCw, Brain } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { analyzeResearchQuestion, linkGeneToLiterature } from "@/utils/aiService";
import MindMap from "./MindMap";

interface AskResponse {
  answer: string;
  confidence: number;
  sources?: string[];
}

interface LinkResponse {
  gene_id: string;
  summary: string;
  keywords: string[];
  papers: Array<{
    title: string;
    url: string;
    journal: string;
    year: string;
    relevance_score: number;
  }>;
  confidence: number;
}

interface AnalysisData {
  title: string;
  summary: string;
  hypothesis: string;
  keyFindings: string[];
}

const ElizaPlugin = () => {
  const [question, setQuestion] = useState("");
  const [geneId, setGeneId] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [askResponse, setAskResponse] = useState<AskResponse | null>(null);
  const [linkResponse, setLinkResponse] = useState<LinkResponse | null>(null);
  const [askError, setAskError] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [showMindMap, setShowMindMap] = useState(false);
  const { toast } = useToast();

  const askQuestion = async () => {
    if (!question.trim()) {
      toast({
        title: "Question required",
        description: "Please enter a bioinformatics research question",
        variant: "destructive",
      });
      return;
    }

    setIsAsking(true);
    setAskResponse(null);
    setAskError(null);
    setShowMindMap(false);

    try {
      const response = await analyzeResearchQuestion(question);
      setAskResponse(response);
      
      toast({
        title: "AI Analysis completed",
        description: `Response generated with ${Math.round(response.confidence * 100)}% confidence`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "AI analysis failed";
      setAskError(errorMessage);
      toast({
        title: "Analysis failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAsking(false);
    }
  };

  const linkGene = async () => {
    if (!geneId.trim()) {
      toast({
        title: "Gene ID required",
        description: "Please enter a gene identifier (e.g., TP53, BRCA1)",
        variant: "destructive",
      });
      return;
    }

    setIsLinking(true);
    setLinkResponse(null);
    setLinkError(null);
    setShowMindMap(false);

    try {
      const response = await linkGeneToLiterature(geneId);
      setLinkResponse(response);
      
      toast({
        title: "Gene analysis completed",
        description: `Found literature for ${response.gene_id} with ${Math.round(response.confidence * 100)}% confidence`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Gene analysis failed";
      setLinkError(errorMessage);
      toast({
        title: "Analysis failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLinking(false);
    }
  };

  const generateMindMap = () => {
    if (!askResponse && !linkResponse) return;

    let analysisData: AnalysisData;

    if (linkResponse) {
      analysisData = {
        title: `Gene Analysis: ${linkResponse.gene_id}`,
        summary: linkResponse.summary,
        hypothesis: `Therapeutic targeting of ${linkResponse.gene_id} pathway may provide novel treatment approaches for related diseases.`,
        keyFindings: linkResponse.keywords.slice(0, 4)
      };
    } else if (askResponse) {
      analysisData = {
        title: question,
        summary: askResponse.answer.substring(0, 200) + "...",
        hypothesis: "Further research is needed to validate these mechanisms in clinical settings.",
        keyFindings: askResponse.sources || ["Molecular mechanisms", "Regulatory pathways", "Clinical implications", "Research directions"]
      };
    } else {
      return;
    }

    setShowMindMap(true);
    return analysisData;
  };

  const retryAsk = () => {
    setAskError(null);
    askQuestion();
  };

  const retryLink = () => {
    setLinkError(null);
    linkGene();
  };

  return (
    <div className="space-y-16">
      {/* AI Research Q&A Section */}
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-gray-900 font-light text-xl">
            <MessageCircle className="w-6 h-6" />
            Intelligent Q&A
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="flex gap-4">
              <Input
                placeholder="Ask about gene functions, molecular mechanisms, research methodologies..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isAsking && askQuestion()}
                className="flex-1 border-gray-200 focus:border-gray-400 bg-white/80"
                disabled={isAsking}
              />
              <Button 
                onClick={askQuestion} 
                disabled={isAsking || !question.trim()}
                className="bg-gray-900 hover:bg-gray-800 px-10 font-light"
              >
                {isAsking ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Ask"
                )}
              </Button>
            </div>

            {askError && (
              <Alert variant="destructive" className="border-red-200 bg-red-50/50 backdrop-blur-sm">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span className="font-light">{askError}</span>
                  <Button variant="outline" size="sm" onClick={retryAsk} className="font-light">
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {isAsking && !askResponse && (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            )}

            {askResponse && (
              <div className="bg-gray-50/30 p-8 rounded-xl border-0 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-light text-gray-900">Analysis</h4>
                  <div className="flex items-center gap-4">
                    <span className="text-xs bg-gray-100/50 text-gray-700 px-4 py-2 rounded-full font-light">
                      {Math.round(askResponse.confidence * 100)}% confidence
                    </span>
                    <Button size="sm" variant="outline" onClick={generateMindMap} className="border-gray-200 font-light">
                      <Brain className="w-4 h-4 mr-2" />
                      Mind Map
                    </Button>
                  </div>
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed font-light">{askResponse.answer}</p>
                {askResponse.sources && (
                  <div className="text-xs text-gray-500 border-t pt-6 border-gray-200/50 font-light">
                    <strong>Sources:</strong> {askResponse.sources.join(", ")}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gene Literature Linking Section */}
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-gray-900 font-light text-xl">
            <Link className="w-6 h-6" />
            Gene Literature Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="flex gap-4">
              <Input
                placeholder="Enter gene symbol (e.g., TP53, BRCA1, MYC, EGFR)..."
                value={geneId}
                onChange={(e) => setGeneId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLinking && linkGene()}
                className="flex-1 border-gray-200 focus:border-gray-400 bg-white/80"
                disabled={isLinking}
              />
              <Button 
                onClick={linkGene} 
                disabled={isLinking || !geneId.trim()}
                className="bg-gray-900 hover:bg-gray-800 px-10 font-light"
              >
                {isLinking ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze"
                )}
              </Button>
            </div>

            {linkError && (
              <Alert variant="destructive" className="border-red-200 bg-red-50/50 backdrop-blur-sm">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span className="font-light">{linkError}</span>
                  <Button variant="outline" size="sm" onClick={retryLink} className="font-light">
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {isLinking && !linkResponse && (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-24 w-full" />
              </div>
            )}

            {linkResponse && (
              <div className="space-y-8">
                <div className="bg-gray-50/30 p-8 rounded-xl border-0 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-light text-gray-900">
                      Gene Analysis: {linkResponse.gene_id}
                    </h4>
                    <div className="flex items-center gap-4">
                      <span className="text-xs bg-gray-100/50 text-gray-700 px-4 py-2 rounded-full font-light">
                        {Math.round(linkResponse.confidence * 100)}% confidence
                      </span>
                      <Button size="sm" variant="outline" onClick={generateMindMap} className="border-gray-200 font-light">
                        <Brain className="w-4 h-4 mr-2" />
                        Mind Map
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed font-light">{linkResponse.summary}</p>
                  <div className="flex flex-wrap gap-3">
                    {linkResponse.keywords.map((keyword, index) => (
                      <span 
                        key={index}
                        className="text-xs bg-white/50 text-gray-600 px-4 py-2 rounded-full border border-gray-200/50 font-light"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-light text-gray-900 mb-6">Related Research Literature</h4>
                  <div className="space-y-6">
                    {linkResponse.papers.map((paper, index) => (
                      <div key={index} className="flex items-start justify-between p-8 bg-white/50 border-0 rounded-xl shadow-sm hover:shadow-md transition-all backdrop-blur-sm">
                        <div className="flex-1">
                          <h5 className="text-gray-900 font-light mb-4 leading-relaxed">{paper.title}</h5>
                          <div className="flex items-center gap-8 text-sm text-gray-600 font-light">
                            <span className="font-medium">{paper.journal}</span>
                            <span>{paper.year}</span>
                            <span className="bg-green-50/50 text-green-700 px-4 py-1 rounded-full text-xs font-light">
                              {Math.round(paper.relevance_score * 100)}% relevant
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild className="ml-8 border-gray-200 font-light">
                          <a href={paper.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            PubMed
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mind Map Visualization */}
      {showMindMap && (
        <div className="mt-16">
          <MindMap analysisData={generateMindMap()!} />
        </div>
      )}
    </div>
  );
};

export default ElizaPlugin;
