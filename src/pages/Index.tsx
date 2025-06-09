import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Github, Lightbulb, FileText, Bot, ExternalLink, BookOpen, Brain } from "lucide-react";
import ElizaPlugin from "@/components/ElizaPlugin";
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
        description: `Found ${response.total_results} papers`,
      });
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Unable to fetch papers. Please try again.",
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/95eed986-cbe2-4cff-bcac-bfd6e297178e.png" 
                alt="GeneLinker Logo" 
                className="w-8 h-8"
              />
              <h1 className="text-2xl font-light text-gray-900 tracking-tight">GeneLinker</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">Research</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">Assistant</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">Documentation</a>
              <Button variant="outline" size="sm" className="border-gray-200 hover:border-gray-300">
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-light text-gray-900 mb-6 tracking-tight">
            Scientific Research Assistant
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Search and analyze scientific literature with advanced AI capabilities and interactive visualizations.
          </p>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-12 bg-gray-50 border border-gray-100">
            <TabsTrigger value="search" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Search className="w-4 h-4" />
              Literature Search
            </TabsTrigger>
            <TabsTrigger value="eliza" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Bot className="w-4 h-4" />
              AI Assistant
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            {/* Search Section */}
            <Card className="mb-12 border-0 shadow-sm bg-gray-50/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-gray-900 font-medium text-lg">
                  <Search className="w-5 h-5" />
                  Scientific Literature Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Input
                    placeholder="Enter research terms (e.g., CRISPR gene editing, machine learning cancer)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isLoading && searchLiterature()}
                    className="flex-1 border-gray-200 focus:border-gray-400 bg-white"
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={searchLiterature} 
                    disabled={isLoading}
                    className="bg-gray-900 hover:bg-gray-800 px-8"
                  >
                    {isLoading ? "Searching..." : "Search"}
                  </Button>
                </div>
                {totalResults > 0 && (
                  <p className="text-sm text-gray-600 mt-4 font-medium">
                    {totalResults.toLocaleString()} papers found
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Results Section */}
            {(results.length > 0 || isLoading) && (
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Papers List */}
                <div>
                  <h3 className="text-2xl font-light text-gray-900 mb-8">Search Results</h3>
                  <div className="space-y-6">
                    {isLoading && !results.length ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="border-0 shadow-sm">
                          <CardContent className="p-8">
                            <Skeleton className="h-6 w-3/4 mb-4" />
                            <Skeleton className="h-4 w-full mb-3" />
                            <Skeleton className="h-4 w-5/6 mb-4" />
                            <div className="flex gap-3">
                              <Skeleton className="h-9 w-24" />
                              <Skeleton className="h-9 w-24" />
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      results.map((paper) => (
                        <Card 
                          key={paper.id} 
                          className={`border-0 shadow-sm transition-all hover:shadow-md ${
                            selectedPaper?.id === paper.id ? 'ring-1 ring-gray-300 shadow-md' : ''
                          }`}
                        >
                          <CardContent className="p-8">
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="font-medium text-gray-900 line-clamp-2 flex-1 text-lg leading-relaxed">
                                {paper.title}
                              </h4>
                              <Badge variant="secondary" className="ml-4 bg-gray-100 text-gray-700">
                                {paper.citations}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-4 font-medium">
                              {paper.authors.slice(0, 3).join(', ')}
                              {paper.authors.length > 3 && ` +${paper.authors.length - 3} more`}
                            </p>
                            <p className="text-sm text-gray-700 mb-4">
                              {paper.journal} ({paper.year})
                              {paper.doi && (
                                <a 
                                  href={`https://doi.org/${paper.doi}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="ml-3 inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                  DOI <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </p>
                            <p className="text-sm text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                              {paper.abstract}
                            </p>
                            <div className="flex gap-3">
                              <Button 
                                size="sm" 
                                className="bg-gray-900 hover:bg-gray-800"
                                onClick={() => analyzeWithAI(paper)}
                                disabled={isAnalyzing}
                              >
                                <Lightbulb className="w-4 h-4 mr-2" />
                                {isAnalyzing && selectedPaper?.id === paper.id ? "Analyzing..." : "Analyze"}
                              </Button>
                              {paper.pdf_url && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => downloadPaper(paper)}
                                  className="border-gray-200 hover:border-gray-300"
                                >
                                  <BookOpen className="w-4 h-4 mr-2" />
                                  Download
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
                  <h3 className="text-2xl font-light text-gray-900 mb-8">Analysis & Visualization</h3>
                  {selectedPaper && (
                    <Card className="border-0 shadow-sm bg-gray-50/30">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-3 text-gray-900 font-medium text-base">
                          <FileText className="w-5 h-5" />
                          {selectedPaper.title.substring(0, 50)}...
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isAnalyzing ? (
                          <div className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-24 w-full" />
                          </div>
                        ) : coreAnalysis ? (
                          <div className="space-y-8">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-3">Summary</h4>
                              <p className="text-gray-700 bg-white p-6 rounded-lg border-0 shadow-sm leading-relaxed">
                                {coreAnalysis.summary}
                              </p>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-gray-900 mb-3">Key Findings</h4>
                              <ul className="space-y-3">
                                {coreAnalysis.key_findings.map((finding, index) => (
                                  <li key={index} className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2.5 flex-shrink-0" />
                                    <span className="text-gray-700 text-sm leading-relaxed">{finding}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 mb-3">Methodology</h4>
                              <p className="text-gray-700 bg-blue-50/50 p-4 rounded-lg border-0 text-sm leading-relaxed">
                                {coreAnalysis.methodology}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 mb-3">Conclusions</h4>
                              <p className="text-gray-700 bg-green-50/50 p-4 rounded-lg border-0 text-sm leading-relaxed">
                                {coreAnalysis.conclusions}
                              </p>
                            </div>

                            <div className="flex gap-3">
                              <Button onClick={generateMindMap} className="flex-1 bg-gray-900 hover:bg-gray-800">
                                <Brain className="w-4 h-4 mr-2" />
                                Mind Map
                              </Button>
                              <Button onClick={exportAnalysis} className="flex-1 bg-gray-700 hover:bg-gray-600">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                              </Button>
                            </div>

                            <div className="text-center">
                              <Badge variant="outline" className="bg-white border-gray-200">
                                Confidence: {(coreAnalysis.confidence_score * 100).toFixed(1)}%
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <p className="text-gray-500 leading-relaxed">
                              Select a paper and click "Analyze" to get comprehensive analysis
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* Mind Map Section */}
            {showMindMap && selectedPaper && coreAnalysis && (
              <div className="mt-12">
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
              <div className="text-center py-20">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-light text-gray-600 mb-3">
                  Search Scientific Literature
                </h3>
                <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                  Enter keywords to search research papers and analyze with AI.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="eliza">
            <ElizaPlugin />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-20 text-center">
          <p className="text-sm text-gray-400 font-light">
            GeneLinker — Scientific Research Assistant
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
