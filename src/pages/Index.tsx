import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Github, Lightbulb, FileText, Bot, Settings, ExternalLink, BookOpen, Brain } from "lucide-react";
import ElizaPlugin from "@/components/ElizaPlugin";
import ApiConfig from "@/components/ApiConfig";
import EnhancedMindMap from "@/components/EnhancedMindMap";
import { searchCoreAPI, analyzePaperWithCore, downloadPaperPDF } from "@/utils/coreApiService";
import { exportAnalysisToPDF } from "@/utils/pdfExport";

interface CorePaper {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  journal: string;
  year: string;
  doi?: string;
  pdf_url?: string;
  citations: number;
}

interface CoreAnalysis {
  summary: string;
  key_findings: string[];
  methodology: string;
  conclusions: string;
  research_gaps: string[];
  future_directions: string[];
  confidence_score: number;
}

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<CorePaper[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [coreAnalysis, setCoreAnalysis] = useState<CoreAnalysis | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<CorePaper | null>(null);
  const [showMindMap, setShowMindMap] = useState(false);
  const { toast } = useToast();

  const searchLiterature = async () => {
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
    setCoreAnalysis(null);
    setSelectedPaper(null);
    setShowMindMap(false);

    try {
      const response = await searchCoreAPI(searchTerm, 10);
      setResults(response.papers);
      setTotalResults(response.total_results);
      
      toast({
        title: "Search completed",
        description: `Found ${response.total_results} papers via Core API`,
      });
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Unable to fetch papers from Core API. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeWithAI = async (paper: CorePaper) => {
    setSelectedPaper(paper);
    setIsAnalyzing(true);
    setCoreAnalysis(null);
    setShowMindMap(false);

    try {
      const paperContent = `Title: ${paper.title}\nAbstract: ${paper.abstract}\nAuthors: ${paper.authors.join(', ')}\nJournal: ${paper.journal} (${paper.year})`;
      const analysis = await analyzePaperWithCore(paper.id, paperContent);
      setCoreAnalysis(analysis);
      
      toast({
        title: "AI analysis completed",
        description: `Analysis completed with ${(analysis.confidence_score * 100).toFixed(1)}% confidence`,
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Unable to analyze with AI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateMindMap = () => {
    if (!selectedPaper || !coreAnalysis) return;
    setShowMindMap(true);
    
    toast({
      title: "Mind map generated",
      description: "Interactive visualization created successfully",
    });
  };

  const exportAnalysis = () => {
    if (!selectedPaper || !coreAnalysis) return;

    const exportData = {
      paper: {
        id: selectedPaper.id,
        title: selectedPaper.title,
        authors: selectedPaper.authors,
        journal: selectedPaper.journal,
        year: selectedPaper.year,
        abstract: selectedPaper.abstract
      },
      analysis: coreAnalysis,
      mindMapData: showMindMap ? coreAnalysis : undefined
    };

    exportAnalysisToPDF(exportData);

    toast({
      title: "Analysis exported",
      description: "PDF report saved to downloads",
    });
  };

  const downloadPaper = async (paper: CorePaper) => {
    if (!paper.pdf_url) {
      toast({
        title: "PDF not available",
        description: "This paper doesn't have a downloadable PDF",
        variant: "destructive",
      });
      return;
    }

    try {
      await downloadPaperPDF(paper.pdf_url, paper.title);
      toast({
        title: "Download started",
        description: "Paper PDF is being downloaded",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Unable to download the paper PDF",
        variant: "destructive",
      });
    }
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
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Core API Powered</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Research Tools</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">AI Assistant</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">API Docs</a>
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
            AI-Powered Scientific Research Assistant
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Search millions of research papers via Core API, analyze with GPT-4, generate interactive mind maps, and export comprehensive PDF reports.
          </p>
          <div className="flex justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Core API Integration
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              GPT-4 Analysis
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              PDF Export & Download
            </span>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Literature Search
            </TabsTrigger>
            <TabsTrigger value="eliza" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              API Config
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            {/* Search Section */}
            <Card className="mb-8 border-blue-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Search className="w-5 h-5" />
                  Scientific Literature Search (Core API)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Input
                    placeholder="Enter research terms (e.g., CRISPR gene editing, machine learning cancer, COVID-19 vaccines)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isLoading && searchLiterature()}
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={searchLiterature} 
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? "Searching..." : "Search Core API"}
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Search millions of open access research papers with AI analysis, mind maps, and PDF export
                </p>
                {totalResults > 0 && (
                  <p className="text-sm text-blue-600 mt-1 font-medium">
                    Found {totalResults.toLocaleString()} papers in Core database
                  </p>
                )}
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
                      Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="border-gray-200">
                          <CardContent className="p-6">
                            <Skeleton className="h-6 w-3/4 mb-3" />
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-5/6 mb-3" />
                            <div className="flex gap-2">
                              <Skeleton className="h-8 w-24" />
                              <Skeleton className="h-8 w-24" />
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      results.map((paper) => (
                        <Card 
                          key={paper.id} 
                          className={`border-gray-200 transition-all hover:shadow-md ${
                            selectedPaper?.id === paper.id ? 'ring-2 ring-blue-500 border-blue-300' : ''
                          }`}
                        >
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                                {paper.title}
                              </h4>
                              <Badge variant="secondary" className="ml-2">
                                {paper.citations} citations
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              {paper.authors.slice(0, 3).join(', ')}
                              {paper.authors.length > 3 && ` +${paper.authors.length - 3} more`}
                            </p>
                            <p className="text-sm text-blue-600 mb-3">
                              {paper.journal} ({paper.year})
                              {paper.doi && (
                                <a 
                                  href={`https://doi.org/${paper.doi}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="ml-2 inline-flex items-center gap-1 hover:underline"
                                >
                                  DOI <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </p>
                            <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                              {paper.abstract}
                            </p>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                className="bg-teal-600 hover:bg-teal-700"
                                onClick={() => analyzeWithAI(paper)}
                                disabled={isAnalyzing}
                              >
                                <Lightbulb className="w-4 h-4 mr-2" />
                                {isAnalyzing && selectedPaper?.id === paper.id ? "Analyzing..." : "Analyze with AI"}
                              </Button>
                              {paper.pdf_url && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => downloadPaper(paper)}
                                >
                                  <BookOpen className="w-4 h-4 mr-2" />
                                  Download PDF
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>

                {/* AI Analysis */}
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">AI Analysis & Mind Map</h3>
                  {selectedPaper && (
                    <Card className="border-teal-200 bg-teal-50/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-teal-900">
                          <FileText className="w-5 h-5" />
                          {selectedPaper.title.substring(0, 60)}...
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isAnalyzing ? (
                          <div className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-20 w-full" />
                          </div>
                        ) : coreAnalysis ? (
                          <div className="space-y-6">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">AI Summary</h4>
                              <p className="text-gray-700 bg-white p-4 rounded-lg border">
                                {coreAnalysis.summary}
                              </p>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Key Findings</h4>
                              <ul className="space-y-2">
                                {coreAnalysis.key_findings.map((finding, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0" />
                                    <span className="text-gray-700 text-sm">{finding}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Methodology</h4>
                              <p className="text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-200 text-sm">
                                {coreAnalysis.methodology}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Conclusions</h4>
                              <p className="text-gray-700 bg-green-50 p-3 rounded-lg border border-green-200 text-sm">
                                {coreAnalysis.conclusions}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <Button onClick={generateMindMap} className="flex-1 bg-purple-600 hover:bg-purple-700">
                                <Brain className="w-4 h-4 mr-2" />
                                Generate Mind Map
                              </Button>
                              <Button onClick={exportAnalysis} className="flex-1 bg-green-600 hover:bg-green-700">
                                <Download className="w-4 h-4 mr-2" />
                                Export PDF
                              </Button>
                            </div>

                            <div className="text-center">
                              <Badge variant="outline" className="bg-white">
                                Confidence: {(coreAnalysis.confidence_score * 100).toFixed(1)}%
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-8">
                            Select a paper and click "Analyze with AI" to get comprehensive analysis
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* Mind Map Section */}
            {showMindMap && selectedPaper && coreAnalysis && (
              <div className="mt-8">
                <EnhancedMindMap 
                  analysisData={{
                    title: selectedPaper.title,
                    summary: coreAnalysis.summary,
                    key_findings: coreAnalysis.key_findings,
                    methodology: coreAnalysis.methodology,
                    conclusions: coreAnalysis.conclusions,
                    research_gaps: coreAnalysis.research_gaps,
                    future_directions: coreAnalysis.future_directions
                  }}
                />
              </div>
            )}

            {/* Empty State */}
            {!isLoading && results.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Search Scientific Literature
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Enter keywords to search millions of research papers via Core API, analyze with AI, generate mind maps, and export comprehensive reports.
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
            GeneLinker AI • Powered by Core API & OpenAI GPT-4 • Real-time research analysis • PDF export & download • Built for Open Science
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;