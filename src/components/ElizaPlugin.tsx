
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Link, ExternalLink } from "lucide-react";

interface AskResponse {
  answer: string;
}

interface LinkResponse {
  gene_id: string;
  summary: string;
  papers: Array<{
    title: string;
    url: string;
  }>;
}

const ElizaPlugin = () => {
  const [question, setQuestion] = useState("");
  const [geneId, setGeneId] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [askResponse, setAskResponse] = useState<AskResponse | null>(null);
  const [linkResponse, setLinkResponse] = useState<LinkResponse | null>(null);
  const { toast } = useToast();

  const askQuestion = async () => {
    if (!question.trim()) {
      toast({
        title: "Question required",
        description: "Please enter a bioinformatics question",
        variant: "destructive",
      });
      return;
    }

    setIsAsking(true);
    setAskResponse(null);

    try {
      // Mock AI response - replace with actual API call to /ask endpoint
      const mockResponse: AskResponse = {
        answer: `Based on current bioinformatics research, here's what we know about "${question}": This involves complex molecular mechanisms including gene expression regulation, protein interactions, and metabolic pathways. The latest studies suggest multiple regulatory networks are involved, with implications for therapeutic targeting and disease understanding. Further research is needed to fully elucidate the mechanisms involved.`
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setAskResponse(mockResponse);
      
      toast({
        title: "Question answered",
        description: "AI analysis completed successfully",
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Unable to process question. Please try again.",
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
        description: "Please enter a gene identifier",
        variant: "destructive",
      });
      return;
    }

    setIsLinking(true);
    setLinkResponse(null);

    try {
      // Mock gene linking response - replace with actual API call to /link endpoint
      const mockResponse: LinkResponse = {
        gene_id: geneId,
        summary: `Gene ${geneId} encodes a protein involved in critical cellular processes. This gene has been extensively studied in the context of cancer biology, metabolic regulation, and developmental processes. Current research indicates its role in signal transduction pathways and potential therapeutic implications.`,
        papers: [
          {
            title: `Functional Analysis of ${geneId} in Cancer Progression`,
            url: "https://openalex.org/example1"
          },
          {
            title: `Recent Advances in ${geneId} Research and Therapeutic Targeting`,
            url: "https://openalex.org/example2"
          },
          {
            title: `Molecular Mechanisms of ${geneId} Regulation`,
            url: "https://openalex.org/example3"
          }
        ]
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setLinkResponse(mockResponse);
      
      toast({
        title: "Gene analysis completed",
        description: "Literature linked successfully",
      });
    } catch (error) {
      toast({
        title: "Linking failed",
        description: "Unable to link gene to literature. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Ask Question Section */}
      <Card className="border-purple-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <MessageCircle className="w-5 h-5" />
            Ask Research Question
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Ask about gene functions, pathways, or mechanisms..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
                className="flex-1"
              />
              <Button 
                onClick={askQuestion} 
                disabled={isAsking}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isAsking ? "Processing..." : "Ask AI"}
              </Button>
            </div>

            {isAsking && !askResponse && (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            )}

            {askResponse && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">AI Response</h4>
                <p className="text-gray-700">{askResponse.answer}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Link Gene Section */}
      <Card className="border-indigo-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-900">
            <Link className="w-5 h-5" />
            Link Gene to Literature
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Enter gene ID (e.g., TP53, BRCA1, MYC)..."
                value={geneId}
                onChange={(e) => setGeneId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && linkGene()}
                className="flex-1"
              />
              <Button 
                onClick={linkGene} 
                disabled={isLinking}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isLinking ? "Linking..." : "Find Literature"}
              </Button>
            </div>

            {isLinking && !linkResponse && (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-20 w-full" />
              </div>
            )}

            {linkResponse && (
              <div className="space-y-4">
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <h4 className="font-semibold text-indigo-900 mb-2">
                    Gene Summary: {linkResponse.gene_id}
                  </h4>
                  <p className="text-gray-700">{linkResponse.summary}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Related Literature</h4>
                  <div className="space-y-2">
                    {linkResponse.papers.map((paper, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow">
                        <span className="text-gray-700 font-medium">{paper.title}</span>
                        <Button variant="outline" size="sm" asChild>
                          <a href={paper.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View
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
    </div>
  );
};

export default ElizaPlugin;
