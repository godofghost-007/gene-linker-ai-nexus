
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, File, CheckCircle, AlertCircle, X } from "lucide-react";

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

interface EnhancedUploadProps {
  onAnalyze: (file: File) => Promise<void>;
  className?: string;
}

const EnhancedUpload = ({ onAnalyze, className }: EnhancedUploadProps) => {
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

    // Mock extracted entities
    const mockEntities: ExtractedEntity[] = [
      { type: 'gene', name: 'TP53', confidence: 0.95 },
      { type: 'gene', name: 'BRCA1', confidence: 0.88 },
      { type: 'disease', name: 'Breast Cancer', confidence: 0.92 },
      { type: 'pathway', name: 'DNA Repair', confidence: 0.85 },
    ];

    setUploadStatus({
      status: 'complete',
      progress: 100,
      fileName: file.name,
      extractedEntities: mockEntities
    });

    // Call the analyze function
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
      case 'gene': return 'bg-blue-100 text-blue-800';
      case 'disease': return 'bg-red-100 text-red-800';
      case 'drug': return 'bg-green-100 text-green-800';
      case 'pathway': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const resetUpload = () => {
    setUploadStatus({ status: 'idle', progress: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className={`border-0 shadow-sm bg-white/70 backdrop-blur-sm ${className}`} data-tour="upload">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-gray-900 font-light text-lg">
          <Upload className="w-5 h-5" />
          Research Paper Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
              className="border-2 border-dashed border-gray-200 rounded-lg p-8 hover:border-gray-300 transition-colors cursor-pointer bg-gray-50/50 text-center"
            >
              <File className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-light">
                Drop PDF files here or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Supports PDF up to 10MB
              </p>
            </div>
          </div>
        )}

        {(uploadStatus.status === 'uploading' || uploadStatus.status === 'parsing') && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <File className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600 flex-1 truncate">
                {uploadStatus.fileName}
              </span>
              <Button variant="ghost" size="sm" onClick={resetUpload}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {uploadStatus.status === 'uploading' ? 'Uploading...' : 'Extracting entities...'}
                </span>
                <span className="text-gray-400">{uploadStatus.progress}%</span>
              </div>
              <Progress value={uploadStatus.progress} className="h-2" />
            </div>
          </div>
        )}

        {uploadStatus.status === 'complete' && uploadStatus.extractedEntities && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Analysis Complete</span>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Extracted Entities</h4>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {uploadStatus.extractedEntities.map((entity, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge className={`text-xs px-2 py-1 ${getStatusColor(entity.type)}`}>
                      {entity.type}
                    </Badge>
                    <span className="text-xs text-gray-600 truncate">{entity.name}</span>
                    <span className="text-xs text-gray-400">
                      {Math.round(entity.confidence * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 bg-gray-900 hover:bg-gray-800 text-sm" size="sm">
                Add to Graph
              </Button>
              <Button variant="outline" size="sm" onClick={resetUpload} className="text-sm">
                Upload Another
              </Button>
            </div>
          </div>
        )}

        {uploadStatus.status === 'error' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Upload Failed</span>
            </div>
            <p className="text-sm text-gray-600">{uploadStatus.error}</p>
            <Button variant="outline" size="sm" onClick={resetUpload} className="w-full">
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedUpload;
