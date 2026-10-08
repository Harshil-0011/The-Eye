import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { GraphData, GraphNode } from '../types';
import { Maximize2, Download, ZoomIn, ZoomOut, Filter } from 'lucide-react';

interface GraphExplorerProps {
  graphData: GraphData;
  onNodeSelect: (node: GraphNode | null) => void;
  selectedNodeId?: string;
  onExpandNeighbors?: (nodeId: string) => void;
}

export const GraphExplorer: React.FC<GraphExplorerProps> = ({
  graphData,
  onNodeSelect,
  selectedNodeId,
  onExpandNeighbors,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [layoutName, setLayoutName] = useState<'cose' | 'concentric' | 'grid' | 'breadthfirst'>('cose');
  const [selectedEdgeType, setSelectedEdgeType] = useState<string>('ALL');

  useEffect(() => {
    if (!containerRef.current) return;

    const filteredEdges = selectedEdgeType === 'ALL'
      ? graphData.edges
      : graphData.edges.filter(e => e.type === selectedEdgeType);

    const elements = [
      ...graphData.nodes.map((n) => ({
        data: {
          id: n.id,
          label: n.label,
          type: n.type,
          confidence: n.confidence,
          aliases: n.aliases,
          properties: n.properties,
          source_id: n.source_id,
        },
      })),
      ...filteredEdges.map((e) => ({
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.type,
          weight: e.weight,
        },
      })),
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#121822',
            'border-width': 1.5,
            'border-color': 'rgba(255, 255, 255, 0.2)',
            'label': 'data(label)',
            'color': '#FFFFFF',
            'font-family': 'Inter, sans-serif',
            'font-size': '11px',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'width': 24,
            'height': 24,
            'transition-property': 'background-color, border-color, bounds',
            'transition-duration': 0.15,
          },
        },
        {
          selector: 'node[type = "PERSON"]',
          style: {
            'border-color': '#38BDF8',
          },
        },
        {
          selector: 'node[type = "ORGANIZATION"]',
          style: {
            'border-color': '#818CF8',
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-color': '#38BDF8',
            'border-width': 3,
            'background-color': '#38BDF8',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 1,
            'line-color': 'rgba(255, 255, 255, 0.15)',
            'target-arrow-color': 'rgba(255, 255, 255, 0.25)',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'color': '#8B98AB',
            'font-family': 'JetBrains Mono, monospace',
            'font-size': '9px',
            'text-rotation': 'autorotate',
            'text-background-opacity': 0.9,
            'text-background-color': '#0A0E14',
            'text-background-padding': '2px',
          },
        },
        {
          selector: 'edge:selected',
          style: {
            'line-color': '#38BDF8',
            'target-arrow-color': '#38BDF8',
            'width': 2,
          },
        },
      ],
      layout: {
        name: layoutName,
        animate: true,
        animationDuration: 300,
      },
    });

    cy.on('tap', 'node', (evt) => {
      const nodeData = evt.target.data();
      onNodeSelect({
        id: nodeData.id,
        label: nodeData.label,
        type: nodeData.type,
        confidence: nodeData.confidence,
        aliases: nodeData.aliases,
        properties: nodeData.properties,
        source_id: nodeData.source_id,
      });
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        onNodeSelect(null);
      }
    });

    cy.on('dbltap', 'node', (evt) => {
      const nodeId = evt.target.id();
      if (onExpandNeighbors) {
        onExpandNeighbors(nodeId);
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [graphData, layoutName, selectedEdgeType]);

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleReset = () => cyRef.current?.fit();

  const handleExportPNG = () => {
    if (!cyRef.current) return;
    const png64 = cyRef.current.png({ full: true, bg: '#0A0E14' });
    const downloadLink = document.createElement('a');
    downloadLink.href = png64;
    downloadLink.download = 'the-eye-graph.png';
    downloadLink.click();
  };

  const edgeTypes = Array.from(new Set(graphData.edges.map((e) => e.type)));

  return (
    <div className="relative w-full h-full bg-[#0A0E14] rounded-md border border-white/10 overflow-hidden min-h-[500px]">
      <div ref={containerRef} className="w-full h-full relative z-0 min-h-[500px]" />

      <div className="absolute top-3 left-3 z-10 bg-[#121822] border border-white/10 p-1.5 rounded-md flex items-center space-x-2 text-xs font-mono">
        <button onClick={handleZoomIn} title="Zoom In" className="p-1 hover:bg-white/10 rounded text-[#8B98AB] hover:text-white">
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button onClick={handleZoomOut} title="Zoom Out" className="p-1 hover:bg-white/10 rounded text-[#8B98AB] hover:text-white">
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button onClick={handleReset} title="Fit View" className="p-1 hover:bg-white/10 rounded text-[#8B98AB] hover:text-white">
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <div className="h-3 w-px bg-white/10" />

        <select
          value={layoutName}
          onChange={(e) => setLayoutName(e.target.value as any)}
          className="bg-transparent text-white focus:outline-none cursor-pointer"
        >
          <option value="cose" className="bg-[#121822]">Force (Cose)</option>
          <option value="concentric" className="bg-[#121822]">Concentric</option>
          <option value="grid" className="bg-[#121822]">Grid</option>
          <option value="breadthfirst" className="bg-[#121822]">Hierarchical</option>
        </select>

        <div className="h-3 w-px bg-white/10" />

        <div className="flex items-center space-x-1">
          <Filter className="w-3 h-3 text-[#38BDF8]" />
          <select
            value={selectedEdgeType}
            onChange={(e) => setSelectedEdgeType(e.target.value)}
            className="bg-transparent text-white focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-[#121822]">All Edges</option>
            {edgeTypes.map((t) => (
              <option key={t} value={t} className="bg-[#121822]">{t}</option>
            ))}
          </select>
        </div>

        <div className="h-3 w-px bg-white/10" />

        <button onClick={handleExportPNG} title="Export PNG" className="p-1 text-[#38BDF8] hover:underline flex items-center space-x-1">
          <Download className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold">Export</span>
        </button>
      </div>

      <div className="absolute bottom-3 right-3 z-10 bg-[#121822] border border-white/10 p-2.5 rounded-md text-xs font-mono space-y-1 pointer-events-none">
        <div className="text-[10px] uppercase text-[#8B98AB] font-bold border-b border-white/10 pb-1">Legend</div>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full border border-[#38BDF8] bg-[#121822]" />
          <span className="text-white text-[11px]">Person</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full border border-[#818CF8] bg-[#121822]" />
          <span className="text-white text-[11px]">Organization</span>
        </div>
      </div>
    </div>
  );
};
