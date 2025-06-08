
import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain } from "lucide-react";

interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  type: 'central' | 'main' | 'sub';
  connections: string[];
}

interface MindMapProps {
  analysisData: {
    title: string;
    summary: string;
    hypothesis: string;
    keyFindings: string[];
  };
}

const MindMap = ({ analysisData }: MindMapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create mind map nodes
    const nodes: MindMapNode[] = [
      // Central node
      {
        id: 'central',
        text: analysisData.title.substring(0, 30) + '...',
        x: 400,
        y: 300,
        type: 'central',
        connections: ['summary', 'hypothesis', 'findings']
      },
      // Main branches
      {
        id: 'summary',
        text: 'Summary',
        x: 200,
        y: 200,
        type: 'main',
        connections: []
      },
      {
        id: 'hypothesis',
        text: 'Hypothesis',
        x: 600,
        y: 200,
        type: 'main',
        connections: []
      },
      {
        id: 'findings',
        text: 'Key Findings',
        x: 400,
        y: 500,
        type: 'main',
        connections: []
      }
    ];

    // Add finding sub-nodes
    analysisData.keyFindings.forEach((finding, index) => {
      nodes.push({
        id: `finding-${index}`,
        text: finding.substring(0, 20) + '...',
        x: 250 + (index * 100),
        y: 550,
        type: 'sub',
        connections: []
      });
    });

    // Draw connections
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;

    nodes.forEach(node => {
      node.connections.forEach(connectionId => {
        const targetNode = nodes.find(n => n.id === connectionId);
        if (targetNode) {
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(targetNode.x, targetNode.y);
          ctx.stroke();
        }
      });
    });

    // Connect findings to main findings node
    nodes.filter(n => n.id.startsWith('finding-')).forEach(node => {
      const findingsNode = nodes.find(n => n.id === 'findings');
      if (findingsNode) {
        ctx.beginPath();
        ctx.moveTo(findingsNode.x, findingsNode.y);
        ctx.lineTo(node.x, node.y);
        ctx.stroke();
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      // Set node colors and sizes
      let radius = 40;
      let fillColor = '#e5e7eb';
      let textColor = '#374151';

      if (node.type === 'central') {
        radius = 60;
        fillColor = '#3b82f6';
        textColor = '#ffffff';
      } else if (node.type === 'main') {
        radius = 50;
        fillColor = '#10b981';
        textColor = '#ffffff';
      }

      // Draw node circle
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.fill();

      // Draw node border
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw node text
      ctx.fillStyle = textColor;
      ctx.font = node.type === 'central' ? '12px Arial' : '10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Wrap text for better fit
      const words = node.text.split(' ');
      const maxWidth = radius * 1.8;
      let line = '';
      let y = node.y;

      if (words.length > 2) {
        y = node.y - 5;
      }

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, node.x, y);
          line = words[n] + ' ';
          y += 12;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, node.x, y);
    });

  }, [analysisData]);

  return (
    <Card className="border-purple-200 bg-purple-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Brain className="w-5 h-5" />
          Research Mind Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            className="border border-purple-200 rounded-lg bg-white"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Interactive visualization</strong> of the AI analysis showing connections between research components.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MindMap;
