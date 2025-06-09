
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, ArrowRight, ArrowLeft } from "lucide-react";

interface TourStep {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    target: '[data-tour="search"]',
    title: "Search Literature",
    content: "Start by searching for research papers or upload your own documents for AI analysis.",
    position: 'bottom'
  },
  {
    target: '[data-tour="upload"]',
    title: "Upload Papers",
    content: "Upload PDF research papers directly from your device for instant AI analysis.",
    position: 'bottom'
  },
  {
    target: '[data-tour="ai-panel"]',
    title: "AI Intelligence",
    content: "Use our AI assistant to analyze gene functions, explore molecular mechanisms, and generate insights.",
    position: 'left'
  },
  {
    target: '[data-tour="analyze"]',
    title: "Analyze Papers",
    content: "Click analyze to get AI-powered insights, key findings, and interactive visualizations.",
    position: 'top'
  }
];

interface GuidedTourProps {
  onComplete: () => void;
}

const GuidedTour = ({ onComplete }: GuidedTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || currentStep >= tourSteps.length) {
    return null;
  }

  const currentTourStep = tourSteps[currentStep];

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    onComplete();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 pointer-events-none" />
      <Card className="fixed z-50 w-80 bg-white shadow-2xl border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">{currentTourStep.title}</h3>
            <Button variant="ghost" size="sm" onClick={handleComplete}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            {currentTourStep.content}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {currentStep + 1} of {tourSteps.length}
            </span>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" size="sm" onClick={handlePrevious}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}
              <Button size="sm" onClick={handleNext}>
                {currentStep < tourSteps.length - 1 ? 'Next' : 'Finish'}
                {currentStep < tourSteps.length - 1 && <ArrowRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default GuidedTour;
