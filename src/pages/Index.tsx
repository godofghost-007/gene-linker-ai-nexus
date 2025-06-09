import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Github, Lightbulb, FileText, Bot, ExternalLink, BookOpen, Brain, Upload, File, HelpCircle } from "lucide-react";
import ElizaPlugin from "@/components/ElizaPlugin";
import EnhancedMindMap from "@/components/EnhancedMindMap";
import GuidedTour from "@/components/GuidedTour";
import ChatAssistant from "@/components/ChatAssistant";
import EnhancedUpload from "@/components/EnhancedUpload";
import PersonaSwitcher from "@/components/PersonaSwitcher";
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzingUpload, setIsAnalyzingUpload] = useState(false);
  const [showTour, setShowTour] = useState(() => {
    return !localStorage.getItem('tour-completed');
  });
  const [persona, setPersona] = useState<'researcher' | 'student'>('researcher');
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      toast({
        title: "File uploaded",
        description: `${file.name} ready for analysis`,
      });
    } else {
      toast({
        title: "Invalid file",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
    }
  };

  const analyzeUploadedPaper = async () => {
    if (!uploadedFile) return;

    setIsAnalyzingUpload(true);
    setCoreAnalysis(null);
    setShowMindMap(false);

    try {
      // Create a mock paper object for uploaded file
      const uploadedPaper: CorePaper = {
        id: `upload_${Date.now()}`,
        title: uploadedFile.name.replace('.pdf', ''),
        abstract: "Uploaded research paper for analysis",
        authors: ["Unknown"],
        journal: "Uploaded Document",
        year: new Date().getFullYear().toString(),
        citations: 0
      };

      setSelectedPaper(uploadedPaper);

      // Simulate paper content extraction and analysis
      const paperContent = `Title: ${uploadedPaper.title}\nUploaded PDF document for AI analysis`;
      const analysis = await analyzePaperWithCore(uploadedPaper.id, paperContent);
      setCoreAnalysis(analysis);
      
      toast({
        title: "Analysis completed",
        description: `Analysis completed with ${(analysis.confidence_score * 100).toFixed(1)}% confidence`,
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Unable to analyze uploaded paper. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzingUpload(false);
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
        title: "Analysis completed",
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

  const handleTourComplete = () => {
    localStorage.setItem('tour-completed', 'true');
    setShowTour(false);
  };

  const handlePersonaChange = (newPersona: 'researcher' | 'student') => {
    setPersona(newPersona);
    toast({
      title: "Interface updated",
      description: `Switched to ${newPersona} mode`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Guided Tour */}
      {showTour && <GuidedTour onComplete={handleTourComplete} />}
      
      {/* Chat Assistant */}
      <ChatAssistant />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/50">
        <div className="container mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/95eed986-cbe2-4cff-bcac-bfd6e297178e.png" 
                alt="GeneLinker Logo" 
                className="w-8 h-8"
              />
              <h1 className="text-2xl font-extralight text-gray-900 tracking-wide">GeneLinker</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <PersonaSwitcher onPersonaChange={handlePersonaChange} />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowTour(true)}
                className="text-gray-500 hover:text-gray-900"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Tutorial
              </Button>
              <Button variant="outline" size="sm" className="border-gray-200 hover:border-gray-300 bg-white/50">
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-extralight text-gray-900 mb-6 tracking-tight leading-tight">
            Scientific Intelligence Platform
          </h2>
          <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            {persona === 'researcher' 
              ? "Advanced AI-powered research analysis and literature discovery for scientific professionals"
              : "Simplified research exploration and learning tools for students and beginners"
            }
          </p>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-12 bg-gray-50/50 border border-gray-100/50 backdrop-blur-sm">
            <TabsTrigger value="search" className="flex items-center gap-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Search className="w-5 h-5" />
              Literature Discovery
            </TabsTrigger>
            <TabsTrigger value="eliza" className="flex items-center gap-3 data-[state=active]:bg-white data-[state=active]:shadow-sm" data-tour="ai-panel">
              <Bot className="w-5 h-5" />
              AI Intelligence
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            {/* Search & Upload Section */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm" data-tour="search">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-gray-900 font-light text-lg">
                    <Search className="w-5 h-5" />
                    Search Literature
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Input
                        placeholder={persona === 'researcher' ? "Enter research keywords, genes, pathways..." : "Search for topics you want to learn about..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !isLoading && searchLiterature()}
                        className="flex-1 border-gray-200 focus:border-gray-400 bg-white/80"
                        disabled={isLoading}
                      />
                      <Button 
                        onClick={searchLiterature} 
                        disabled={isLoading}
                        className="bg-gray-900 hover:bg-gray-800 px-6"
                      >
                        {isLoading ? "Searching..." : "Search"}
                      </Button>
                    </div>
                    {totalResults > 0 && (
                      <p className="text-sm text-gray-500 font-light">
                        {totalResults.toLocaleString()} papers discovered
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <EnhancedUpload onAnalyze={analyzeUploadedPaper} />
            </div>

            {/* Results Section */}
            {(results.length > 0 || isLoading) && (
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Papers List */}
                <div>
                  <h3 className="text-2xl font-extralight text-gray-900 mb-8">Research Papers</h3>
                  <div className="space-y-6">
                    {isLoading && !results.length ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="border-0 shadow-sm bg-white/80">
                          <CardContent className="p-10">
                            <Skeleton className="h-6 w-3/4 mb-6" />
                            <Skeleton className="h-4 w-full mb-4" />
                            <Skeleton className="h-4 w-5/6 mb-6" />
                            <div className="flex gap-4">
                              <Skeleton className="h-10 w-28" />
                              <Skeleton className="h-10 w-28" />
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      results.map((paper) => (
                        <Card 
                          key={paper.id} 
                          className={`border-0 shadow-sm transition-all hover:shadow-lg bg-white/80 backdrop-blur-sm ${
                            selectedPaper?.id === paper.id ? 'ring-1 ring-gray-300 shadow-lg' : ''
                          }`}
                        >
                          <CardContent className="p-10">
                            <div className="flex justify-between items-start mb-6">
                              <h4 className="font-light text-gray-900 line-clamp-2 flex-1 text-xl leading-relaxed">
                                {paper.title}
                              </h4>
                              <Badge variant="secondary" className="ml-6 bg-gray-100 text-gray-700 font-light">
                                {paper.citations}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-6 font-light">
                              {paper.authors.slice(0, 3).join(', ')}
                              {paper.authors.length > 3 && ` +${paper.authors.length - 3} more`}
                            </p>
                            <p className="text-sm text-gray-700 mb-6 font-light">
                              {paper.journal} ({paper.year})
                              {paper.doi && (
                                <a 
                                  href={`https://doi.org/${paper.doi}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="ml-4 inline-flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors"
                                >
                                  DOI <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </p>
                            <p className="text-sm text-gray-600 mb-8 line-clamp-3 leading-relaxed font-light">
                              {paper.abstract}
                            </p>
                            <div className="flex gap-4">
                              <Button 
                                size="sm" 
                                className="bg-gray-900 hover:bg-gray-800 font-light"
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
                                  className="border-gray-200 hover:border-gray-300 font-light"
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
                  <h3 className="text-2xl font-extralight text-gray-900 mb-8">Intelligence Analysis</h3>
                  {selectedPaper && (
                    <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-3 text-gray-900 font-light text-base">
                          <FileText className="w-4 h-4" />
                          {selectedPaper.title.substring(0, 50)}...
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {(isAnalyzing || isAnalyzingUpload) ? (
                          <div className="space-y-6">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-32 w-full" />
                          </div>
                        ) : coreAnalysis ? (
                          <div className="space-y-8">
                            <div>
                              <h4 className="font-light text-gray-900 mb-4">Summary</h4>
                              <p className="text-gray-700 bg-gray-50/50 p-8 rounded-xl border-0 leading-relaxed font-light">
                                {coreAnalysis.summary}
                              </p>
                            </div>
                            
                            <div>
                              <h4 className="font-light text-gray-900 mb-4">Key Findings</h4>
                              <ul className="space-y-4">
                                {coreAnalysis.key_findings.map((finding, index) => (
                                  <li key={index} className="flex items-start gap-4">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-3 flex-shrink-0" />
                                    <span className="text-gray-700 text-sm leading-relaxed font-light">{finding}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-light text-gray-900 mb-4">Methodology</h4>
                              <p className="text-gray-700 bg-blue-50/30 p-6 rounded-xl border-0 text-sm leading-relaxed font-light">
                                {coreAnalysis.methodology}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-light text-gray-900 mb-4">Conclusions</h4>
                              <p className="text-gray-700 bg-green-50/30 p-6 rounded-xl border-0 text-sm leading-relaxed font-light">
                                {coreAnalysis.conclusions}
                              </p>
                            </div>

                            <div className="flex gap-3">
                              <Button onClick={generateMindMap} className="flex-1 bg-gray-900 hover:bg-gray-800 font-light" data-tour="analyze">
                                <Brain className="w-4 h-4 mr-2" />
                                {persona === 'researcher' ? 'Mind Map' : 'Visual Summary'}
                              </Button>
                              <Button onClick={exportAnalysis} className="flex-1 bg-gray-700 hover:bg-gray-600 font-light">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                              </Button>
                            </div>

                            <div className="text-center">
                              <Badge variant="outline" className="bg-white/50 border-gray-200 font-light">
                                Confidence: {(coreAnalysis.confidence_score * 100).toFixed(1)}%
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-16">
                            <p className="text-gray-400 leading-relaxed font-light">
                              Select a paper or upload a document to begin analysis
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
              <div className="mt-20">
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
            {!isLoading && results.length === 0 && !uploadedFile && (
              <div className="text-center py-32">
                <Search className="w-16 h-16 text-gray-200 mx-auto mb-8" />
                <h3 className="text-2xl font-extralight text-gray-500 mb-4">
                  Discover Scientific Literature
                </h3>
                <p className="text-gray-400 max-w-lg mx-auto leading-relaxed font-light">
                  Search research papers or upload your own documents for AI-powered analysis
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="eliza">
            <ElizaPlugin />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-24 text-center">
          <p className="text-sm text-gray-300 font-extralight tracking-wide">
            GeneLinker — Scientific Intelligence Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
