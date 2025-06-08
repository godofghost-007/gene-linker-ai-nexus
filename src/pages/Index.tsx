import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Download, Github, Lightbulb, FileText, Bot, Settings } from "lucide-react";
import ElizaPlugin from "@/components/ElizaPlugin";
import ApiConfig from "@/components/ApiConfig";

interface PubMedResult {
  pmid: string;
  title: string;
  abstract: string;
  authors: string;
  journal: string;
  year: string;
}

interface AIAnalysis {
  summary: string;
  hypothesis: string;
  keyFindings: string[];
}

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PubMedResult[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<PubMedResult | null>(null);
  const { toast } = useToast();

  const searchPubMed = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Search term required",
        description: "Please enter a biomedical search term",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResults([]);
    setAiAnalysis(null);
    setSelectedPaper(null);

    try {
      // Mock PubMed search results for demo
      const mockResults: PubMedResult[] = [
        {
          pmid: "12345678",
          title: "TP53 mutations in lung cancer: molecular mechanisms and therapeutic implications",
          abstract: "Background: TP53 is the most frequently mutated gene in human cancers, including lung cancer. Methods: We analyzed TP53 mutations in 150 lung cancer samples using next-generation sequencing. Results: TP53 mutations were found in 60% of cases, with missense mutations being the most common. Patients with TP53 mutations showed reduced overall survival. Conclusion: TP53 mutations play a crucial role in lung cancer progression and may serve as therapeutic targets.",
          authors: "Smith J, Johnson M, Williams K",
          journal: "Nature Medicine",
          year: "2023"
        },
        {
          pmid: "87654321",
          title: "Therapeutic targeting of mutant TP53 in lung adenocarcinoma",
          abstract: "Introduction: Mutant TP53 represents a major oncogenic driver in lung adenocarcinoma. Objective: To evaluate novel therapeutic approaches targeting mutant TP53. Methods: Cell line studies and xenograft models were used. Results: Combination therapy with MDM2 inhibitors and chemotherapy showed enhanced efficacy. Conclusions: Targeting mutant TP53 pathways offers promising therapeutic opportunities.",
          authors: "Brown A, Davis L, Miller R",
          journal: "Cell",
          year: "2023"
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setResults(mockResults);
      
      toast({
        title: "Search completed",
        description: `Found ${mockResults.length} relevant papers`,
      });
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Unable to fetch papers from PubMed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeWithAI = async (paper: PubMedResult) => {
    setSelectedPaper(paper);
    setIsLoading(true);
    setAiAnalysis(null);

    try {
      // Mock AI analysis for demo
      const mockAnalysis: AIAnalysis = {
        summary: "This study demonstrates that TP53 mutations are prevalent in lung cancer (60% of cases) and significantly impact patient survival. The research identifies missense mutations as the predominant type and establishes TP53 as both a prognostic marker and potential therapeutic target.",
        hypothesis: "Based on this research, we hypothesize that combination therapies targeting both mutant TP53 and downstream pathways (such as MDM2 inhibitors with traditional chemotherapy) could significantly improve treatment outcomes for lung cancer patients with TP53 mutations. Further investigation into TP53-specific biomarkers may enable personalized treatment strategies.",
        keyFindings: [
          "TP53 mutations present in 60% of lung cancer cases",
          "Missense mutations are the most common type",
          "Reduced overall survival in TP53 mutant patients",
          "Potential for targeted therapeutic interventions"
        ]
      };

      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setAiAnalysis(mockAnalysis);
      
      toast({
        title: "AI analysis completed",
        description: "Generated summary and research hypothesis",
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Unable to analyze with AI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportSummary = () => {
    if (!selectedPaper || !aiAnalysis) return;

    const exportData = {
      paper: selectedPaper,
      analysis: aiAnalysis,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `genelinker-analysis-${selectedPaper.pmid}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: "Analysis saved to downloads",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-blue-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">GeneLinker</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Demo</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">How it Works</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">API</a>
              <Button variant="outline" size="sm">
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Your AI Copilot for Biomedical Research
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Analyze scientific papers, discover hidden relationships, and accelerate breakthroughs with AI.
          </p>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Paper Search
            </TabsTrigger>
            <TabsTrigger value="eliza" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Eliza AI Assistant
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configuration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            {/* Search Section */}
            <Card className="mb-8 border-blue-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Search className="w-5 h-5" />
                  Search Scientific Papers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Input
                    placeholder="Enter biomedical terms (e.g., TP53 AND lung cancer)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchPubMed()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={searchPubMed} 
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? "Searching..." : "Search PubMed"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results Section */}
            {(results.length > 0 || isLoading) && (
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Papers List */}
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Search Results</h3>
                  <div className="space-y-4">
                    {isLoading && !results.length ? (
                      Array.from({ length: 2 }).map((_, i) => (
                        <Card key={i} className="border-gray-200">
                          <CardContent className="p-6">
                            <Skeleton className="h-6 w-3/4 mb-3" />
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-5/6 mb-3" />
                            <Skeleton className="h-8 w-32" />
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      results.map((paper) => (
                        <Card 
                          key={paper.pmid} 
                          className={`border-gray-200 cursor-pointer transition-all hover:shadow-md ${
                            selectedPaper?.pmid === paper.pmid ? 'ring-2 ring-blue-500 border-blue-300' : ''
                          }`}
                          onClick={() => analyzeWithAI(paper)}
                        >
                          <CardContent className="p-6">
                            <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                              {paper.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-3">
                              {paper.authors} • {paper.journal} ({paper.year})
                            </p>
                            <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                              {paper.abstract}
                            </p>
                            <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                              <Lightbulb className="w-4 h-4 mr-2" />
                              Analyze with AI
                            </Button>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>

                {/* AI Analysis */}
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">AI Analysis</h3>
                  {selectedPaper && (
                    <Card className="border-teal-200 bg-teal-50/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-teal-900">
                          <FileText className="w-5 h-5" />
                          {selectedPaper.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isLoading && !aiAnalysis ? (
                          <div className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-20 w-full" />
                          </div>
                        ) : aiAnalysis ? (
                          <div className="space-y-6">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">AI Summary</h4>
                              <p className="text-gray-700 bg-white p-4 rounded-lg border">
                                {aiAnalysis.summary}
                              </p>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Generated Hypothesis</h4>
                              <p className="text-gray-700 bg-blue-50 p-4 rounded-lg border border-blue-200">
                                {aiAnalysis.hypothesis}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Key Findings</h4>
                              <ul className="space-y-2">
                                {aiAnalysis.keyFindings.map((finding, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0" />
                                    <span className="text-gray-700">{finding}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <Button onClick={exportSummary} className="w-full bg-green-600 hover:bg-green-700">
                              <Download className="w-4 h-4 mr-2" />
                              Export Analysis
                            </Button>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-8">
                            Select a paper to analyze with AI
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && results.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Search biomedical literature
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Enter keywords like "TP53 AND lung cancer" to find relevant research papers and generate AI-powered insights.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="eliza">
            <ElizaPlugin />
          </TabsContent>

          <TabsContent value="config">
            <ApiConfig />
          </TabsContent>
        </Tabs>

        {/* Footer Note */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500">
            GeneLinker is in public beta • Open-source • API-first • Built with ❤️ for Open Science
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
