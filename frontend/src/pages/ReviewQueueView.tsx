import React from 'react';
import { MergeRecord } from '../types';
import { GitMerge, Check, X } from 'lucide-react';

interface ReviewQueueViewProps {
  records: MergeRecord[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export const ReviewQueueView: React.FC<ReviewQueueViewProps> = ({ records, onAccept, onReject }) => {
  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 rounded-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <GitMerge className="w-5 h-5 text-amber-400" />
          <div>
            <h2 className="text-xl font-bold font-grotesk text-white">Proposed Entity Merges</h2>
            <p className="text-xs text-[#8B98AB]">Human review queue for candidate deduplication and cross-source linking</p>
          </div>
        </div>

        <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full font-mono text-xs font-bold">
          {records.length} Pending
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {records.map((rec) => (
          <div key={rec.id} className="glass-card p-6 rounded-xl space-y-5 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-md">
                Similarity Score: {(rec.score * 100).toFixed(0)}%
              </span>
              <span className="text-[10px] font-mono text-[#8B98AB]">{new Date(rec.created_at).toLocaleDateString()}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-black/40 border border-white/5 p-4 rounded-xl text-xs font-mono">
              <div className="space-y-1">
                <span className="text-[10px] uppercase text-[#8B98AB] font-bold">Primary Candidate</span>
                <p className="text-sm font-bold text-white font-grotesk">{rec.target_entity_id}</p>
              </div>
              <div className="space-y-1 border-l border-white/10 pl-4">
                <span className="text-[10px] uppercase text-[#8B98AB] font-bold">Proposed Duplicate</span>
                <p className="text-sm font-bold text-[#38BDF8] font-grotesk">{rec.source_entity_id}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#8B98AB]">Scoring Evidence</h4>
              <div className="bg-black/30 border border-white/5 p-3 rounded-lg text-xs font-mono space-y-1">
                {Object.entries(rec.evidence || {}).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-[#8B98AB]">{k}:</span>
                    <span className="text-white font-semibold">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => onAccept(rec.id)}
                className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 rounded-lg text-xs font-mono uppercase font-bold tracking-wider transition"
              >
                <Check className="w-4 h-4" />
                <span>Accept Merge</span>
              </button>
              <button
                onClick={() => onReject(rec.id)}
                className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 rounded-lg text-xs font-mono uppercase font-bold tracking-wider transition"
              >
                <X className="w-4 h-4" />
                <span>Keep Separate</span>
              </button>
            </div>
          </div>
        ))}

        {records.length === 0 && (
          <div className="col-span-2 glass-panel p-12 text-center text-[#8B98AB] font-mono text-sm space-y-2">
            <Check className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="text-white font-grotesk text-base font-bold">Review Queue Clean</p>
            <p className="text-xs">All candidate entity merges have been resolved or automated.</p>
          </div>
        )}
      </div>
    </div>
  );
};
