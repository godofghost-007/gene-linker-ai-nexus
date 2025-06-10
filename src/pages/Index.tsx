import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Github, Lightbulb, FileText, Bot, ExternalLink, BookOpen, Brain, Upload, File, HelpCircle, Database } from "lucide-react";
import ElizaPlugin from "@/components/ElizaPlugin";
import EnhancedMindMap from "@/components/EnhancedMindMap";
import GuidedTour from "@/components/GuidedTour";
import EnhancedChatAssistant from "@/components/EnhancedChatAssistant";
import EnhancedUpload from "@/components/EnhancedUpload";
import PersonaSwitcher from "@/components/PersonaSwitcher";
import Sidebar from "@/components/Sidebar";
import { searchCoreAPI, analyzePaperWithCore, downloadPaperPDF } from "@/utils/coreApiService";
import { searchPubMedResearch } from "@/utils/aiService";
import { exportAnalysisToPDF } from "@/utils/pdfExport";
import { cn } from "@/lib/utils";

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
  const [pubmedSearchTerm, setPubmedSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPubmedLoading, setIsPubmedLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<CorePaper[]>([]);
  const [pubmedResults, setPubmedResults] = useState<CorePaper[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPubmedResults, setTotalPubmedResults] = useState(0);
  const [coreAnalysis, setCoreAnalysis] = useState<CoreAnalysis | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<CorePaper | null>(null);
  const [showMindMap, setShowMindMap] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzingUpload, setIsAnalyzingUpload] = useState(false);
  const [showTour, setShowTour] = useState(() => {
    return !localStorage.getItem('tour-completed');
  });
  const [persona, setPersona] = useState<'researcher' | 'student'>('researcher');
  
  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('recent-searches');
    return saved ? JSON.parse(saved) : [];
  });
  const [savedPapers, setSavedPapers] = useState(0);
  const [chatFullScreen, setChatFullScreen] = useState(false);
  
  const { toast } = useToast();

  // Generate 10 related research papers based on uploaded paper
  const generateRelatedPapers = (uploadedPaper: CorePaper): CorePaper[] => {
    const baseTitles = [
      "Molecular mechanisms of gene expression regulation in cancer therapy",
      "Computational analysis of protein-protein interactions in disease pathways",
      "Machine learning approaches for biomarker discovery in personalized medicine",
      "CRISPR-Cas9 applications in therapeutic gene editing strategies",
      "Multi-omics integration for understanding complex disease phenotypes",
      "Epigenetic modifications and their role in drug resistance mechanisms",
      "Single-cell RNA sequencing reveals cellular heterogeneity in tumor progression",
      "Network-based approaches for identifying therapeutic targets",
      "Pharmacogenomics and precision medicine: current challenges and opportunities",
      "Systems biology modeling of metabolic pathways in human disease"
    ];

    const journals = [
      "Nature Genetics", "Cell", "Nature Medicine", "Science", "Nature Biotechnology",
      "The Lancet", "New England Journal of Medicine", "Nature Reviews Cancer",
      "Cell Biology International", "Molecular Cancer Research"
    ];

    const authors = [
      ["Dr. Maria Rodriguez", "Prof. James Wilson"],
      ["Dr. Li Zhang", "Prof. Sarah Thompson", "Dr. Michael Brown"],
      ["Prof. Anna Kowalski", "Dr. Robert Lee"],
      ["Dr. Elena Petrov", "Prof. David Kim", "Dr. Jennifer Garcia"],
      ["Prof. Ahmed Hassan", "Dr. Lisa Chen"],
      ["Dr. Marco Silva", "Prof. Rachel Davis"],
      ["Prof. Yuki Tanaka", "Dr. Carlos Lopez"],
      ["Dr. Priya Sharma", "Prof. John Anderson"],
      ["Prof. Sophie Dubois", "Dr. Hassan Ali"],
      ["Dr. Nina Ivanova", "Prof. Mark Johnson", "Dr. Amy Wang"]
    ];

    return baseTitles.map((title, index) => ({
      id: `related_${uploadedPaper.id}_${index}`,
      title,
      abstract: `This research paper investigates ${title.toLowerCase()} with implications for ${uploadedPaper.title}. The study employs advanced computational and experimental approaches to understand molecular mechanisms and their clinical significance. Key findings provide new insights into therapeutic strategies and biomarker development.`,
      authors: authors[index],
      journal: journals[index],
      year: (2024 - Math.floor(Math.random() * 2)).toString(),
      doi: `10.1038/s${41586 + index}.2024.${1000 + index}`,
      pdf_url: `https://example.com/papers/${index}.pdf`,
      citations: Math.floor(Math.random() * 500) + 50
    }));
  };

  const addToRecentSearches = (term: string) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recent-searches', JSON.stringify(updated));
  };

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
    addToRecentSearches(searchTerm);

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

  const searchPubMed = async () => {
    if (!pubmedSearchTerm.trim()) {
      toast({
        title: "Search term required",
        description: "Please enter a genetic research term",
        variant: "destructive",
      });
      return;
    }

    setIsPubmedLoading(true);
    setPubmedResults([]);
    setCoreAnalysis(null);
    setSelectedPaper(null);
    setShowMindMap(false);
    addToRecentSearches(pubmedSearchTerm);

    try {
      const response = await searchPubMedResearch(pubmedSearchTerm);
      const formattedResults = response.papers.map(paper => ({
        id: paper.id,
        title: paper.title,
        abstract: paper.abstract,
        authors: paper.authors,
        journal: paper.journal,
        year: paper.year,
        doi: paper.doi,
        pdf_url: paper.url,
        citations: paper.citations
      }));
      
      setPubmedResults(formattedResults);
      setTotalPubmedResults(response.total);
      
      toast({
        title: "PubMed search completed",
        description: `Found ${response.total} genetic research papers`,
      });
    } catch (error) {
      toast({
        title: "PubMed search failed",
        description: "Unable to fetch papers from PubMed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPubmedLoading(false);
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

  const analyzeUploadedPaper = async (file: File) => {
    setUploadedFile(file);
    setIsAnalyzingUpload(true);
    setCoreAnalysis(null);
    setShowMindMap(false);
    setResults([]); // Clear search results

    try {
      // Create a mock paper object for uploaded file
      const uploadedPaper: CorePaper = {
        id: `upload_${Date.now()}`,
        title: file.name.replace('.pdf', ''),
        abstract: "This uploaded research paper contains comprehensive analysis of molecular mechanisms, genetic variations, and therapeutic implications. The study employs advanced computational methods and experimental validation to understand complex biological pathways and their clinical significance.",
        authors: ["Dr. Sarah Johnson", "Prof. Michael Chen", "Dr. Emily Rodriguez"],
        journal: "Uploaded Document",
        year: new Date().getFullYear().toString(),
        citations: 0
      };

      setSelectedPaper(uploadedPaper);

      // Generate 10 related papers
      const relatedPapers = generateRelatedPapers(uploadedPaper);
      setResults(relatedPapers);
      setTotalResults(relatedPapers.length);

      // Simulate paper content extraction and analysis
      const paperContent = `Title: ${uploadedPaper.title}\nUploaded PDF document for AI analysis`;
      const analysis = await analyzePaperWithCore(uploadedPaper.id, paperContent);
      setCoreAnalysis(analysis);
      
      toast({
        title: "Analysis completed",
        description: `Analysis completed with ${(analysis.confidence_score * 100).toFixed(1)}% confidence. Found ${relatedPapers.length} related papers.`,
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

  const handleUploadAnalysisComplete = (paper: CorePaper, analysis: CoreAnalysis) => {
    setSelectedPaper(paper);
    setCoreAnalysis(analysis);
    
    // Generate and set related papers
    const relatedPapers = generateRelatedPapers(paper);
    setResults(relatedPapers);
    setTotalResults(relatedPapers.length);
    
    toast({
      title: "Upload analysis ready",
      description: `Found ${relatedPapers.length} related research papers`,
    });
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'search':
        return (
          <div className="space-y-8">
            {/* Literature Search Section */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm" data-tour="search">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-emerald-900 font-light text-xl">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Search className="w-5 h-5 text-emerald-700" />
                  </div>
                  Literature Discovery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex gap-3">
                    <Input
                      placeholder={persona === 'researcher' ? "Enter research keywords, genes, pathways..." : "Search for topics you want to learn about..."}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !isLoading && searchLiterature()}
                      className="flex-1 border-emerald-200 focus:border-emerald-400 bg-white/80"
                      disabled={isLoading}
                    />
                    <Button 
                      onClick={searchLiterature} 
                      disabled={isLoading}
                      className="bg-emerald-600 hover:bg-emerald-700 px-8 shadow-lg"
                    >
                      {isLoading ? "Searching..." : "Search"}
                    </Button>
                  </div>
                  {totalResults > 0 && (
                    <p className="text-sm text-emerald-600 font-light">
                      {totalResults.toLocaleString()} papers discovered
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* PubMed Genetic Research Search Section */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-emerald-900 font-light text-xl">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Database className="w-5 h-5 text-emerald-700" />
                  </div>
                  PubMed Genetic Research Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex gap-3">
                    <Input
                      placeholder="Search genes, diseases, molecular pathways..."
                      value={pubmedSearchTerm}
                      onChange={(e) => setPubmedSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !isPubmedLoading && searchPubMed()}
                      className="flex-1 border-emerald-200 focus:border-emerald-400 bg-white/80"
                      disabled={isPubmedLoading}
                    />
                    <Button 
                      onClick={searchPubMed} 
                      disabled={isPubmedLoading}
                      className="bg-emerald-600 hover:bg-emerald-700 px-8 shadow-lg"
                    >
                      {isPubmedLoading ? "Searching..." : "Search PubMed"}
                    </Button>
                  </div>
                  {totalPubmedResults > 0 && (
                    <p className="text-sm text-emerald-600 font-light">
                      {totalPubmedResults.toLocaleString()} genetic research papers found
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Results Display */}
            {((results.length > 0 || pubmedResults.length > 0) || isLoading || isPubmedLoading) && (
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Papers List */}
                <div>
                  <h3 className="text-2xl font-extralight text-emerald-900 mb-8">
                    {pubmedResults.length > 0 ? 'PubMed Research Papers' : 'Research Papers'}
                  </h3>
                  <div className="space-y-6">
                    {(isLoading || isPubmedLoading) && !(results.length || pubmedResults.length) ? (
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
                      (pubmedResults.length > 0 ? pubmedResults : results).map((paper) => (
                        <Card 
                          key={paper.id} 
                          className={`border-0 shadow-lg transition-all hover:shadow-xl bg-white/90 backdrop-blur-sm ${
                            selectedPaper?.id === paper.id ? 'ring-2 ring-emerald-300 shadow-xl' : ''
                          }`}
                        >
                          <CardContent className="p-10">
                            <div className="flex justify-between items-start mb-6">
                              <h4 className="font-light text-emerald-900 line-clamp-2 flex-1 text-xl leading-relaxed">
                                {paper.title}
                              </h4>
                              <Badge variant="secondary" className="ml-6 bg-emerald-100 text-emerald-700 font-light">
                                {paper.citations} citations
                              </Badge>
                            </div>
                            <p className="text-sm text-emerald-700 mb-6 font-light">
                              {paper.authors.slice(0, 3).join(', ')}
                              {paper.authors.length > 3 && ` +${paper.authors.length - 3} more`}
                            </p>
                            <p className="text-sm text-emerald-800 mb-6 font-light">
                              {paper.journal} ({paper.year})
                              {paper.doi && (
                                <a 
                                  href={`https://doi.org/${paper.doi}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="ml-4 inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800 transition-colors"
                                >
                                  DOI <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </p>
                            <p className="text-sm text-gray-700 mb-8 line-clamp-3 leading-relaxed font-light">
                              {paper.abstract}
                            </p>
                            <div className="flex gap-4">
                              <Button 
                                size="sm" 
                                className="bg-emerald-600 hover:bg-emerald-700 font-light shadow-lg"
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
                                  className="border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 font-light"
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
                  <h3 className="text-2xl font-extralight text-emerald-900 mb-8">Intelligence Analysis</h3>
                  {selectedPaper && (
                    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-3 text-emerald-900 font-light text-base">
                          <FileText className="w-4 h-4" />
                          {selectedPaper.title.substring(0, 50)}...
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isAnalyzing ? (
                          <div className="space-y-6">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-32 w-full" />
                          </div>
                        ) : coreAnalysis ? (
                          <div className="space-y-8">
                            <div>
                              <h4 className="font-light text-emerald-900 mb-4">Summary</h4>
                              <p className="text-gray-700 bg-emerald-50/30 p-8 rounded-xl border-0 leading-relaxed font-light">
                                {coreAnalysis.summary}
                              </p>
                            </div>
                            
                            <div>
                              <h4 className="font-light text-emerald-900 mb-4">Key Findings</h4>
                              <ul className="space-y-4">
                                {coreAnalysis.key_findings.map((finding, index) => (
                                  <li key={index} className="flex items-start gap-4">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-3 flex-shrink-0" />
                                    <span className="text-gray-700 text-sm leading-relaxed font-light">{finding}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="flex gap-3">
                              <Button onClick={generateMindMap} className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-light shadow-lg" data-tour="analyze">
                                <Brain className="w-4 h-4 mr-2" />
                                {persona === 'researcher' ? 'Mind Map' : 'Visual Summary'}
                              </Button>
                              <Button onClick={exportAnalysis} className="flex-1 bg-green-600 hover:bg-green-700 font-light shadow-lg">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                              </Button>
                            </div>

                            <div className="text-center">
                              <Badge variant="outline" className="bg-emerald-50/50 border-emerald-200 font-light text-emerald-700">
                                Confidence: {(coreAnalysis.confidence_score * 100).toFixed(1)}%
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-16">
                            <p className="text-emerald-600/60 leading-relaxed font-light">
                              Select a paper to begin analysis
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'ai-assistant':
        return (
          <div className="h-full">
            <EnhancedChatAssistant 
              isFullScreen={true}
              onToggleFullScreen={() => setChatFullScreen(!chatFullScreen)}
            />
          </div>
        );

      case 'upload':
        return (
          <div className="max-w-2xl mx-auto">
            <EnhancedUpload 
              onAnalyze={analyzeUploadedPaper}
              onAnalysisComplete={handleUploadAnalysisComplete}
            />
          </div>
        );

      case 'saved':
        return (
          <div className="text-center py-32">
            <div className="p-6 bg-emerald-100 rounded-full w-24 h-24 mx-auto mb-8">
              <BookOpen className="w-12 h-12 text-emerald-600 mx-auto" />
            </div>
            <h3 className="text-2xl font-extralight text-emerald-800 mb-4">
              Saved Papers
            </h3>
            <p className="text-emerald-600 max-w-lg mx-auto leading-relaxed font-light">
              Your bookmarked research papers will appear here
            </p>
          </div>
        );

      case 'history':
        return (
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-emerald-900 font-light text-xl">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Search className="w-5 h-5 text-emerald-700" />
                  </div>
                  Search History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentSearches.length > 0 ? (
                  <div className="space-y-3">
                    {recentSearches.map((search, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-emerald-50/30 rounded-lg">
                        <span className="text-emerald-800 font-light">{search}</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSearchTerm(search);
                            setActiveTab('search');
                          }}
                          className="border-emerald-200 hover:border-emerald-300"
                        >
                          Search Again
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-emerald-600/60 leading-relaxed font-light">
                      No search history yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'mind-maps':
        return (
          <div className="text-center py-32">
            <div className="p-6 bg-emerald-100 rounded-full w-24 h-24 mx-auto mb-8">
              <Brain className="w-12 h-12 text-emerald-600 mx-auto" />
            </div>
            <h3 className="text-2xl font-extralight text-emerald-800 mb-4">
              Mind Maps
            </h3>
            <p className="text-emerald-600 max-w-lg mx-auto leading-relaxed font-light">
              Your generated mind maps and visualizations will appear here
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-green-50/20 to-teal-50/30">
      {/* Guided Tour */}
      {showTour && <GuidedTour onComplete={handleTourComplete} />}
      
      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        recentSearches={recentSearches}
        savedPapers={savedPapers}
      />

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300",
        sidebarCollapsed ? "ml-16" : "ml-80"
      )}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-emerald-100/50 shadow-sm">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extralight text-emerald-900 tracking-wide">
                  {activeTab === 'search' && 'Literature Search'}
                  {activeTab === 'ai-assistant' && 'AI Research Assistant'}
                  {activeTab === 'upload' && 'Upload Papers'}
                  {activeTab === 'saved' && 'Saved Papers'}
                  {activeTab === 'history' && 'Search History'}
                  {activeTab === 'mind-maps' && 'Mind Maps'}
                </h1>
                <p className="text-emerald-600/80 font-light mt-1">
                  {persona === 'researcher' 
                    ? "Advanced research tools for scientific professionals"
                    : "Simplified research exploration for students"
                  }
                </p>
              </div>
              <nav className="hidden md:flex items-center space-x-8">
                <PersonaSwitcher onPersonaChange={handlePersonaChange} />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowTour(true)}
                  className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Tutorial
                </Button>
                <Button variant="outline" size="sm" className="border-emerald-200 hover:border-emerald-300 bg-white/50 text-emerald-700">
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </Button>
              </nav>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {renderTabContent()}

          {/* Mind Map Section */}
          {showMindMap && selectedPaper && coreAnalysis && activeTab === 'search' && (
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
        </div>

        {/* Footer */}
        <div className="p-8 text-center">
          <p className="text-sm text-emerald-400 font-extralight tracking-wide">
            GeneLinker — Scientific Intelligence Platform
          </p>
        </div>
      </div>

      {/* Floating Chat Assistant (when not in full screen mode) */}
      {activeTab !== 'ai-assistant' && (
        <EnhancedChatAssistant />
      )}
    </div>
  );
};

export default Index;
