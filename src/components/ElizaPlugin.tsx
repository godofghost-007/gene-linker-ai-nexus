
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Link, ExternalLink, AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

// Simulate more realistic research data
const generateRealisticAskResponse = (question: string): AskResponse => {
  const responses = {
    "brca1": {
      answer: "BRCA1 (Breast Cancer gene 1) is a tumor suppressor gene that produces a protein involved in DNA repair through homologous recombination. When functioning normally, BRCA1 helps maintain genomic stability by repairing double-strand DNA breaks. Mutations in BRCA1 significantly increase the risk of breast and ovarian cancers, as cells lose their ability to properly repair DNA damage, leading to accumulation of mutations and potential malignant transformation.",
      confidence: 0.92,
      sources: ["Nature Genetics 2021", "Cell 2020", "NEJM 2019"]
    },
    "tp53": {
      answer: "TP53, known as the 'guardian of the genome,' encodes the p53 protein that acts as a crucial tumor suppressor. It monitors DNA integrity and responds to cellular stress by either halting cell division to allow DNA repair or triggering apoptosis (programmed cell death) if damage is irreparable. TP53 mutations are found in over 50% of human cancers, making it one of the most frequently altered genes in cancer development.",
      confidence: 0.95,
      sources: ["Science 2022", "Nature Reviews Cancer 2021", "Cell Death & Disease 2020"]
    },
    "default": {
      answer: `Based on current bioinformatics research regarding "${question}", this involves complex molecular mechanisms including gene expression regulation, protein interactions, and metabolic pathways. The gene likely plays roles in cellular homeostasis, signal transduction, or metabolic processes. Current studies suggest involvement in multiple regulatory networks with implications for disease pathogenesis and potential therapeutic targeting.`,
      confidence: 0.78,
      sources: ["PubMed Central", "BioRxiv 2023", "Nature Communications 2022"]
    }
  };

  const lowerQuestion = question.toLowerCase();
  if (lowerQuestion.includes("brca1") || lowerQuestion.includes("breast cancer gene")) {
    return responses.brca1;
  } else if (lowerQuestion.includes("tp53") || lowerQuestion.includes("p53")) {
    return responses.tp53;
  } else {
    return responses.default;
  }
};

const generateRealisticLinkResponse = (geneId: string): LinkResponse => {
  const geneData = {
    "BRCA1": {
      summary: "BRCA1 encodes a nuclear phosphoprotein that plays a critical role in DNA damage repair, cell cycle checkpoint control, and maintenance of genomic stability. Loss of BRCA1 function through mutations predisposes individuals to breast and ovarian cancers.",
      keywords: ["DNA repair", "homologous recombination", "tumor suppressor", "hereditary cancer", "genomic stability"],
      papers: [
        {
          title: "BRCA1 and BRCA2 pathways in genomic instability and cancer predisposition",
          url: "https://openalex.org/W3125847692",
          journal: "Nature Reviews Cancer",
          year: "2023",
          relevance_score: 0.95
        },
        {
          title: "Therapeutic targeting of BRCA1-deficient cancer cells",
          url: "https://openalex.org/W3098234156",
          journal: "Cell",
          year: "2022",
          relevance_score: 0.89
        },
        {
          title: "BRCA1 protein function in DNA damage response pathways",
          url: "https://openalex.org/W3087654321",
          journal: "Science",
          year: "2023",
          relevance_score: 0.87
        }
      ],
      confidence: 0.94
    },
    "TP53": {
      summary: "TP53 functions as a sequence-specific transcription factor that regulates the expression of genes involved in cell cycle arrest, DNA repair, and apoptosis. Known as the 'guardian of the genome,' p53 prevents the propagation of genetically damaged cells.",
      keywords: ["tumor suppressor", "cell cycle control", "apoptosis", "DNA damage response", "transcription factor"],
      papers: [
        {
          title: "p53: The guardian of the genome at 40 years",
          url: "https://openalex.org/W3156789234",
          journal: "Nature",
          year: "2023",
          relevance_score: 0.97
        },
        {
          title: "Therapeutic strategies targeting mutant p53 in cancer",
          url: "https://openalex.org/W3134567890",
          journal: "Cell",
          year: "2022",
          relevance_score: 0.91
        },
        {
          title: "p53-mediated DNA damage response mechanisms",
          url: "https://openalex.org/W3112345678",
          journal: "Nature Cell Biology",
          year: "2023",
          relevance_score: 0.88
        }
      ],
      confidence: 0.96
    }
  };

  const upperGeneId = geneId.toUpperCase();
  if (geneData[upperGeneId as keyof typeof geneData]) {
    return {
      gene_id: upperGeneId,
      ...geneData[upperGeneId as keyof typeof geneData]
    };
  }

  // Default response for unknown genes
  return {
    gene_id: upperGeneId,
    summary: `Gene ${upperGeneId} encodes a protein involved in cellular processes. Research indicates potential roles in signal transduction, metabolic regulation, or developmental pathways. Further investigation is needed to fully characterize its biological functions and clinical significance.`,
    keywords: ["gene expression", "protein function", "cellular processes", "regulatory pathways"],
    papers: [
      {
        title: `Functional characterization of ${upperGeneId} in cellular biology`,
        url: "https://openalex.org/example1",
        journal: "Molecular Biology Reports",
        year: "2023",
        relevance_score: 0.82
      },
      {
        title: `${upperGeneId} gene expression patterns across tissues`,
        url: "https://openalex.org/example2",
        journal: "Gene Expression Patterns",
        year: "2022",
        relevance_score: 0.78
      },
      {
        title: `Computational analysis of ${upperGeneId} protein interactions`,
        url: "https://openalex.org/example3",
        journal: "Bioinformatics",
        year: "2023",
        relevance_score: 0.75
      }
    ],
    confidence: 0.72
  };
};

const ElizaPlugin = () => {
  const [question, setQuestion] = useState("");
  const [geneId, setGeneId] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [askResponse, setAskResponse] = useState<AskResponse | null>(null);
  const [linkResponse, setLinkResponse] = useState<LinkResponse | null>(null);
  const [askError, setAskError] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const { toast } = useToast();

  // Simulate API call with realistic delay and error handling
  const simulateApiCall = async <T,>(
    fn: () => T,
    delay: number = 2000,
    errorRate: number = 0.05
  ): Promise<T> => {
    await new Promise(resolve => setTimeout(resolve, delay));
    
    if (Math.random() < errorRate) {
      throw new Error("API temporarily unavailable. Please try again.");
    }
    
    return fn();
  };

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
    setAskError(null);

    try {
      const response = await simulateApiCall(
        () => generateRealisticAskResponse(question),
        2000,
        0.05
      );
      
      setAskResponse(response);
      
      toast({
        title: "Analysis completed",
        description: `Response generated with ${Math.round(response.confidence * 100)}% confidence`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
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
        description: "Please enter a gene identifier",
        variant: "destructive",
      });
      return;
    }

    setIsLinking(true);
    setLinkResponse(null);
    setLinkError(null);

    try {
      const response = await simulateApiCall(
        () => generateRealisticLinkResponse(geneId),
        1800,
        0.03
      );
      
      setLinkResponse(response);
      
      toast({
        title: "Gene analysis completed",
        description: `Found ${response.papers.length} relevant papers with ${Math.round(response.confidence * 100)}% confidence`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
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

  const retryAsk = () => {
    setAskError(null);
    askQuestion();
  };

  const retryLink = () => {
    setLinkError(null);
    linkGene();
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
                onKeyPress={(e) => e.key === 'Enter' && !isAsking && askQuestion()}
                className="flex-1"
                disabled={isAsking}
              />
              <Button 
                onClick={askQuestion} 
                disabled={isAsking || !question.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isAsking ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Ask AI"
                )}
              </Button>
            </div>

            {askError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{askError}</span>
                  <Button variant="outline" size="sm" onClick={retryAsk}>
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {isAsking && !askResponse && (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            )}

            {askResponse && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-purple-900">AI Response</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      {Math.round(askResponse.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{askResponse.answer}</p>
                {askResponse.sources && (
                  <div className="text-xs text-gray-600">
                    <strong>Sources:</strong> {askResponse.sources.join(", ")}
                  </div>
                )}
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
                onKeyPress={(e) => e.key === 'Enter' && !isLinking && linkGene()}
                className="flex-1"
                disabled={isLinking}
              />
              <Button 
                onClick={linkGene} 
                disabled={isLinking || !geneId.trim()}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isLinking ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  "Find Literature"
                )}
              </Button>
            </div>

            {linkError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{linkError}</span>
                  <Button variant="outline" size="sm" onClick={retryLink}>
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}

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
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-indigo-900">
                      Gene Summary: {linkResponse.gene_id}
                    </h4>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                      {Math.round(linkResponse.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{linkResponse.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    {linkResponse.keywords.map((keyword, index) => (
                      <span 
                        key={index}
                        className="text-xs bg-white text-indigo-600 px-2 py-1 rounded border"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Related Literature</h4>
                  <div className="space-y-3">
                    {linkResponse.papers.map((paper, index) => (
                      <div key={index} className="flex items-start justify-between p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow">
                        <div className="flex-1">
                          <h5 className="text-gray-900 font-medium mb-2">{paper.title}</h5>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{paper.journal}</span>
                            <span>{paper.year}</span>
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                              {Math.round(paper.relevance_score * 100)}% relevant
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild className="ml-4">
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
