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
    <aside className="w-96 glass-panel border-l border-white/10 h-full flex flex-col justify-between z-20 overflow-y-auto">
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div>
            <span className="inline-block px-2.5 py-0.5 text-[10px] font-mono uppercase font-bold tracking-wider rounded bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/30 mb-2">
              {selectedNode.type}
            </span>
            <h2 className="text-xl font-bold font-grotesk text-white">{selectedNode.label}</h2>
            <p className="text-xs text-[#8B98AB] font-mono mt-0.5">ID: {selectedNode.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8B98AB] hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-[#8B98AB] uppercase tracking-wider">Confidence Rating</span>
            <span className="text-[#38BDF8] font-bold">{(selectedNode.confidence * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-[#38BDF8] transition-all duration-300"
              style={{ width: `${selectedNode.confidence * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#8B98AB]">Known Aliases</h3>
          {selectedNode.aliases && selectedNode.aliases.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {selectedNode.aliases.map((alias, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 text-xs bg-white/5 border border-white/10 rounded font-inter text-white/90"
                >
                  {alias}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#8B98AB] italic">No aliases recorded.</p>
          )}
        </div>

        <div className="space-y-2 glass-card p-3 rounded-lg">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#38BDF8]">
            <Shield className="w-4 h-4" />
            <span className="uppercase font-bold tracking-wider">Provenance Trace</span>
          </div>
          <p className="text-xs text-[#8B98AB]">Source ID: {selectedNode.source_id}</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#8B98AB]">Extracted Attributes</h3>
          {Object.keys(selectedNode.properties || {}).length > 0 ? (
            <div className="bg-black/30 border border-white/5 rounded-lg p-3 space-y-2 font-mono text-xs">
              {Object.entries(selectedNode.properties).map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-white/5 pb-1 last:border-0">
                  <span className="text-[#8B98AB]">{k}:</span>
                  <span className="text-white font-medium text-right">{String(v)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#8B98AB] italic">No additional properties.</p>
          )}
        </div>
      </div>

      <div className="p-6 border-t border-white/10 bg-black/20 space-y-2">
        <button
          onClick={() => onDelete(selectedNode.id)}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 rounded-lg text-xs font-mono uppercase font-bold tracking-wider transition"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete & Purge Derived Links</span>
        </button>
      </div>
    </aside>
  );
};
