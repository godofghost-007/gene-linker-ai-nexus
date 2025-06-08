
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings, Eye, EyeOff, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ApiConfig = () => {
  const [apiKey, setApiKey] = useState("");
  const [modelName, setModelName] = useState("mixtral-8x7b-32768");
  const [showKey, setShowKey] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved configuration from localStorage
    const savedApiKey = localStorage.getItem("genelinker_api_key");
    const savedModel = localStorage.getItem("genelinker_model_name");
    
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedModel) setModelName(savedModel);
  }, []);

  const saveConfiguration = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key required",
        description: "Please enter your API key",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem("genelinker_api_key", apiKey);
    localStorage.setItem("genelinker_model_name", modelName);

    toast({
      title: "Configuration saved",
      description: "API settings have been saved locally",
    });
  };

  const clearConfiguration = () => {
    localStorage.removeItem("genelinker_api_key");
    localStorage.removeItem("genelinker_model_name");
    setApiKey("");
    setModelName("mixtral-8x7b-32768");

    toast({
      title: "Configuration cleared",
      description: "All API settings have been removed",
    });
  };

  return (
    <Card className="border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Settings className="w-5 h-5" />
          API Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key (OpenRouter/Groq/OpenAI)</Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                placeholder="Enter your API key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model-name">Model Name</Label>
            <Input
              id="model-name"
              placeholder="e.g., mixtral-8x7b-32768, gpt-4, llama-3.1-70b"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={saveConfiguration} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
            <Button variant="outline" onClick={clearConfiguration}>
              Clear
            </Button>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Note:</strong> API keys are stored locally in your browser.</p>
            <p>Supported providers: OpenRouter, Groq, OpenAI</p>
            <p>For production use, consider using a backend service.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiConfig;
