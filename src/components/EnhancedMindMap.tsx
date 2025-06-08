import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Download, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  type: 'central' | 'main' | 'sub' | 'detail';
  connections: string[];
  color: string;
  size: number;
}

interface EnhancedMindMapProps {
  analysisData: {
    title: string;
    summary: string;
    key_findings: string[];
    methodology: string;
    conclusions: string;
    research_gaps: string[];
    future_directions: string[];
  };
}

const EnhancedMindMap = ({ analysisData }: EnhancedMindMapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const createMindMapNodes = (): MindMapNode[] => {
    const centerX = 400;
    const centerY = 300;
    const nodes: MindMapNode[] = [];

    // Central node
    nodes.push({
      id: 'central',
      text: analysisData.title.substring(0, 40) + '...',
      x: centerX,
      y: centerY,
      type: 'central',
      connections: ['findings', 'methodology', 'conclusions', 'gaps', 'future'],
      color: '#3b82f6',
      size: 80
    });

    // Main branches
    const mainBranches = [
      { id: 'findings', text: 'Key Findings', x: centerX - 200, y: centerY - 150, data: analysisData.key_findings },
      { id: 'methodology', text: 'Methodology', x: centerX + 200, y: centerY - 150, data: [analysisData.methodology] },
      { id: 'conclusions', text: 'Conclusions', x: centerX - 200, y: centerY + 150, data: [analysisData.conclusions] },
      { id: 'gaps', text: 'Research Gaps', x: centerX + 200, y: centerY + 150, data: analysisData.research_gaps },
      { id: 'future', text: 'Future Directions', x: centerX, y: centerY + 250, data: analysisData.future_directions }
    ];

    mainBranches.forEach(branch => {
      nodes.push({
        id: branch.id,
        text: branch.text,
        x: branch.x,
        y: branch.y,
        type: 'main',
        connections: [],
        color: '#10b981',
        size: 60
      });

      // Add sub-nodes for each main branch
      branch.data.slice(0, 3).forEach((item, index) => {
        const angle = (index - 1) * 0.5;
        const distance = 120;
        const subX = branch.x + Math.cos(angle) * distance;
        const subY = branch.y + Math.sin(angle) * distance;

        nodes.push({
          id: `${branch.id}_sub_${index}`,
          text: item.substring(0, 25) + (item.length > 25 ? '...' : ''),
          x: subX,
          y: subY,
          type: 'sub',
          connections: [],
          color: '#8b5cf6',
          size: 40
        });
      });
    });

    return nodes;
  };

  const drawMindMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    const nodes = createMindMapNodes();

    // Draw connections first
    ctx.strokeStyle = '#e5e7eb';
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

    // Draw connections from main nodes to their sub-nodes
    nodes.filter(n => n.type === 'main').forEach(mainNode => {
      const subNodes = nodes.filter(n => n.id.startsWith(mainNode.id + '_sub_'));
      subNodes.forEach(subNode => {
        ctx.beginPath();
        ctx.moveTo(mainNode.x, mainNode.y);
        ctx.lineTo(subNode.x, subNode.y);
        ctx.stroke();
      });
    });

    // Draw nodes
    nodes.forEach(node => {
      // Draw node circle with gradient
      const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.size / 2);
      gradient.addColorStop(0, node.color);
      gradient.addColorStop(1, node.color + '80');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size / 2, 0, 2 * Math.PI);
      ctx.fill();

      // Draw node border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw node text
      ctx.fillStyle = '#ffffff';
      ctx.font = `${node.type === 'central' ? '14' : node.type === 'main' ? '12' : '10'}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Wrap text for better fit
      const words = node.text.split(' ');
      const maxWidth = node.size * 1.5;
      let line = '';
      let y = node.y;

      if (words.length > 2 && node.type !== 'sub') {
        y = node.y - 5;
      }

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, node.x, y);
          line = words[n] + ' ';
          y += 14;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, node.x, y);
    });

    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    setOffset(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));

    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.3));
  };

  const handleReset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const exportMindMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `mindmap_${analysisData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  useEffect(() => {
    drawMindMap();
  }, [analysisData, scale, offset]);

  return (
    <Card className="border-purple-200 bg-purple-50/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-900">
            <Brain className="w-5 h-5" />
            Interactive Research Mind Map
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={exportMindMap}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border border-purple-200 rounded-lg bg-white cursor-move"
            style={{ maxWidth: '100%', height: 'auto' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Interactive Mind Map:</strong> Drag to pan, use zoom controls, and export as PNG. Visualizes research components and their relationships.</p>
          <p className="mt-1"><strong>Scale:</strong> {(scale * 100).toFixed(0)}% | <strong>Nodes:</strong> {5 + analysisData.key_findings.length + analysisData.research_gaps.length + analysisData.future_directions.length}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedMindMap;