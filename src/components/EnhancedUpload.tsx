
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, File, CheckCircle, AlertCircle, X, Brain, Download } from "lucide-react";

interface ExtractedEntity {
  type: 'gene' | 'disease' | 'drug' | 'pathway';
  name: string;
  confidence: number;
}

interface UploadStatus {
  status: 'idle' | 'uploading' | 'parsing' | 'complete' | 'error';
  progress: number;
  fileName?: string;
  extractedEntities?: ExtractedEntity[];
  error?: string;
}

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

interface EnhancedUploadProps {
  onAnalyze: (file: File) => Promise<void>;
  onAnalysisComplete?: (paper: CorePaper, analysis: CoreAnalysis) => void;
  className?: string;
}

const EnhancedUpload = ({ onAnalyze, onAnalysisComplete, className }: EnhancedUploadProps) => {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ status: 'idle', progress: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== 'application/pdf') return;

    setUploadStatus({ status: 'uploading', progress: 0, fileName: file.name });

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadStatus(prev => ({ ...prev, progress: i }));
    }

    setUploadStatus(prev => ({ ...prev, status: 'parsing', progress: 0 }));

    // Simulate parsing
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadStatus(prev => ({ ...prev, progress: i }));
    }

    // Enhanced mock extracted entities with more variety
    const mockEntities: ExtractedEntity[] = [
      { type: 'gene', name: 'TP53', confidence: 0.95 },
      { type: 'gene', name: 'BRCA1', confidence: 0.88 },
      { type: 'gene', name: 'EGFR', confidence: 0.92 },
      { type: 'gene', name: 'KRAS', confidence: 0.87 },
      { type: 'disease', name: 'Breast Cancer', confidence: 0.92 },
      { type: 'disease', name: 'Lung Cancer', confidence: 0.85 },
      { type: 'drug', name: 'Trastuzumab', confidence: 0.90 },
      { type: 'drug', name: 'Cisplatin', confidence: 0.84 },
      { type: 'pathway', name: 'DNA Repair', confidence: 0.85 },
      { type: 'pathway', name: 'Cell Cycle', confidence: 0.88 },
      { type: 'pathway', name: 'Apoptosis', confidence: 0.91 },
      { type: 'pathway', name: 'PI3K/AKT Signaling', confidence: 0.86 },
    ];

    setUploadStatus({
      status: 'complete',
      progress: 100,
      fileName: file.name,
      extractedEntities: mockEntities
    });

    // Create enhanced mock paper and analysis data
    const uploadedPaper: CorePaper = {
      id: `upload_${Date.now()}`,
      title: file.name.replace('.pdf', ''),
      abstract: "This uploaded research paper contains comprehensive analysis of molecular mechanisms, genetic variations, and therapeutic implications. The study employs advanced computational methods and experimental validation to understand complex biological pathways and their clinical significance.",
      authors: ["Dr. Sarah Johnson", "Prof. Michael Chen", "Dr. Emily Rodriguez"],
      journal: "Uploaded Document",
      year: new Date().getFullYear().toString(),
      citations: 0
    };

    // Enhanced mock analysis with more detailed content
    const mockAnalysis: CoreAnalysis = {
      summary: "This research paper presents a comprehensive investigation into the molecular mechanisms underlying cancer progression and therapeutic resistance. The study combines genomic analysis, proteomic profiling, and functional assays to identify novel biomarkers and potential therapeutic targets. Key findings include the identification of critical regulatory pathways and their implications for personalized medicine approaches.",
      key_findings: [
        "Identification of novel genetic variants associated with treatment response",
        "Discovery of previously unknown protein-protein interactions",
        "Characterization of metabolic pathway alterations in disease progression",
        "Development of predictive biomarker panels for clinical outcomes",
        "Validation of therapeutic targets through functional genomics approaches"
      ],
      methodology: "The study employed a multi-omics approach combining whole-genome sequencing, RNA-seq analysis, mass spectrometry-based proteomics, and functional validation studies. Statistical analysis included machine learning algorithms for pattern recognition and predictive modeling.",
      conclusions: "The findings provide new insights into disease mechanisms and offer promising avenues for therapeutic intervention. The identified biomarkers show potential for clinical translation and could significantly impact patient stratification and treatment selection.",
      research_gaps: [
        "Limited sample size from diverse populations",
        "Need for longitudinal studies to validate findings",
        "Requirement for additional functional validation",
        "Integration with clinical outcome data needed"
      ],
      future_directions: [
        "Expand study to include larger, more diverse cohorts",
        "Develop clinical-grade biomarker assays",
        "Investigate combination therapy approaches",
        "Conduct prospective clinical validation studies"
      ],
      confidence_score: 0.91
    };

    // Call the analysis completion callback if provided
    if (onAnalysisComplete) {
      onAnalysisComplete(uploadedPaper, mockAnalysis);
    }

    // Call the original analyze function
    try {
      await onAnalyze(file);
    } catch (error) {
      setUploadStatus(prev => ({
        ...prev,
        status: 'error',
        error: 'Analysis failed. Please try again.'
      }));
    }
  };

  const getStatusColor = (type: ExtractedEntity['type']) => {
    switch (type) {
      case 'gene': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'disease': return 'bg-red-50 text-red-700 border-red-200';
      case 'drug': return 'bg-green-50 text-green-700 border-green-200';
      case 'pathway': return 'bg-teal-50 text-teal-700 border-teal-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const resetUpload = () => {
    setUploadStatus({ status: 'idle', progress: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className={`border-0 shadow-lg bg-gradient-to-br from-emerald-50/80 to-green-50/60 backdrop-blur-md ${className}`} data-tour="upload">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-emerald-900 font-light text-xl">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Upload className="w-5 h-5 text-emerald-700" />
          </div>
          Research Paper Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {uploadStatus.status === 'idle' && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-200 rounded-xl p-12 hover:border-emerald-300 transition-all cursor-pointer bg-gradient-to-br from-emerald-25/30 to-green-25/20 text-center group hover:shadow-md"
            >
              <div className="p-4 bg-emerald-100 rounded-full w-16 h-16 mx-auto mb-6 group-hover:bg-emerald-200 transition-colors">
                <File className="w-8 h-8 text-emerald-600 mx-auto" />
              </div>
              <p className="text-emerald-800 font-medium text-lg mb-2">
                Upload Research Paper
              </p>
              <p className="text-sm text-emerald-600 mb-4">
                Drop PDF files here or click to browse
              </p>
              <p className="text-xs text-emerald-500">
                Supports PDF up to 10MB • AI-powered analysis included
              </p>
            </div>
          </div>
        )}

        {(uploadStatus.status === 'uploading' || uploadStatus.status === 'parsing') && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-white/60 rounded-xl border border-emerald-100">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <File className="w-5 h-5 text-emerald-700" />
              </div>
              <span className="text-sm text-emerald-800 flex-1 truncate font-medium">
                {uploadStatus.fileName}
              </span>
              <Button variant="ghost" size="sm" onClick={resetUpload} className="text-emerald-600 hover:text-emerald-800">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-emerald-700 font-medium">
                  {uploadStatus.status === 'uploading' ? 'Uploading document...' : 'Extracting research entities...'}
                </span>
                <span className="text-emerald-600">{uploadStatus.progress}%</span>
              </div>
              <Progress value={uploadStatus.progress} className="h-3 bg-emerald-100" />
            </div>
          </div>
        )}

        {uploadStatus.status === 'complete' && uploadStatus.extractedEntities && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-emerald-50/50 rounded-xl border border-emerald-200">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-emerald-800 font-semibold">Analysis Complete</span>
                <p className="text-sm text-emerald-600">Research entities extracted and ready for analysis</p>
              </div>
            </div>
            
            <div className="bg-white/70 rounded-xl p-6 border border-emerald-100">
              <h4 className="text-lg font-semibold text-emerald-900 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Extracted Research Entities
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                {uploadStatus.extractedEntities.map((entity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg border hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-3">
                      <Badge className={`text-xs px-3 py-1 font-medium border ${getStatusColor(entity.type)}`}>
                        {entity.type}
                      </Badge>
                      <span className="text-sm text-gray-800 font-medium">{entity.name}</span>
                    </div>
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-medium">
                      {Math.round(entity.confidence * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all" size="lg">
                <Brain className="w-4 h-4 mr-2" />
                Generate Analysis
              </Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all" size="lg">
                <Download className="w-4 h-4 mr-2" />
                Add to Graph
              </Button>
            </div>
            <Button 
              variant="outline" 
              onClick={resetUpload} 
              className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
              size="lg"
            >
              Upload Another Paper
            </Button>
          </div>
        )}

        {uploadStatus.status === 'error' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <span className="text-red-800 font-semibold">Upload Failed</span>
                <p className="text-sm text-red-600">{uploadStatus.error}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={resetUpload} 
              className="w-full border-red-200 text-red-700 hover:bg-red-50"
              size="lg"
            >
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedUpload;
