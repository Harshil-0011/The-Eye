import React from 'react';
import { X, Shield, Trash2 } from 'lucide-react';
import { GraphNode } from '../types';

interface DetailPanelProps {
  selectedNode: GraphNode | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({ selectedNode, onClose, onDelete }) => {
  if (!selectedNode) return null;

  return (
    <aside className="w-80 bg-[#121822] border-l border-white/10 h-full flex flex-col justify-between z-20 overflow-y-auto">
      <div className="p-5 space-y-5">
        <div className="flex items-start justify-between border-b border-white/10 pb-3">
          <div>
            <span className="inline-block px-2 py-0.5 text-[10px] font-mono uppercase font-bold rounded bg-[#38BDF8]/20 text-[#38BDF8] mb-1">
              {selectedNode.type}
            </span>
            <h2 className="text-lg font-bold font-grotesk text-white">{selectedNode.label}</h2>
            <p className="text-xs text-[#8B98AB] font-mono">ID: {selectedNode.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8B98AB] hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-[#8B98AB]">Confidence Score</span>
            <span className="text-[#38BDF8] font-bold">{(selectedNode.confidence * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#0A0E14] rounded overflow-hidden">
            <div
              className="h-full bg-[#38BDF8]"
              style={{ width: `${selectedNode.confidence * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xs font-mono uppercase text-[#8B98AB]">Aliases</h3>
          {selectedNode.aliases && selectedNode.aliases.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selectedNode.aliases.map((alias, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-xs bg-[#0A0E14] border border-white/10 rounded font-inter text-white"
                >
                  {alias}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#8B98AB] italic">No aliases recorded.</p>
          )}
        </div>

        <div className="space-y-1.5 bg-[#0A0E14] p-3 rounded border border-white/10 text-xs font-mono">
          <div className="flex items-center space-x-1.5 text-[#38BDF8]">
            <Shield className="w-3.5 h-3.5" />
            <span className="font-bold">Provenance Source</span>
          </div>
          <p className="text-[#8B98AB]">Source ID: {selectedNode.source_id}</p>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xs font-mono uppercase text-[#8B98AB]">Extracted Properties</h3>
          {Object.keys(selectedNode.properties || {}).length > 0 ? (
            <div className="bg-[#0A0E14] border border-white/10 rounded p-3 space-y-1.5 font-mono text-xs">
              {Object.entries(selectedNode.properties).map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-white/5 pb-1 last:border-0">
                  <span className="text-[#8B98AB]">{k}:</span>
                  <span className="text-white">{String(v)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#8B98AB] italic">No properties.</p>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-white/10 bg-[#0A0E14]">
        <button
          onClick={() => onDelete(selectedNode.id)}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded text-xs font-mono font-bold uppercase transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Purge Entity</span>
        </button>
      </div>
    </aside>
  );
};
