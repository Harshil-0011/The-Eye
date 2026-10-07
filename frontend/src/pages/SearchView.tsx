import React, { useState } from 'react';
import { SearchResponse, SearchResultCard } from '../types';
import { Search, Calendar, Shield, ArrowRight } from 'lucide-react';

interface SearchViewProps {
  searchData: SearchResponse | null;
  onSelectResult: (card: SearchResultCard) => void;
  onSearch: (q: string, typeFilter?: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({ searchData, onSelectResult, onSearch }) => {
  const [selectedType, setSelectedType] = useState<string>('ALL');

  if (!searchData) {
    return (
      <div className="glass-panel p-12 text-center rounded-xl space-y-4">
        <Search className="w-12 h-12 text-[#38BDF8] mx-auto opacity-80 animate-pulse" />
        <h2 className="text-xl font-bold font-grotesk text-white">Perform a Search</h2>
        <p className="text-sm text-[#8B98AB]">Use the top search bar to query entities, events, and documents across all sources.</p>
      </div>
    );
  }

  const results = selectedType === 'ALL'
    ? searchData.results
    : searchData.results.filter(r => r.object_type === selectedType);

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 rounded-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-grotesk text-white">Search Results</h2>
          <p className="text-xs text-[#8B98AB] font-mono mt-0.5">Found {searchData.total_results} matches for "{searchData.query}"</p>
        </div>

        <div className="flex space-x-2 text-xs font-mono">
          {['ALL', 'entity', 'event', 'document'].map((type) => {
            const count = type === 'ALL'
              ? searchData.total_results
              : searchData.facets.object_type[type] || 0;
            const isActive = selectedType === type;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-full uppercase font-bold tracking-wider border transition ${
                  isActive
                    ? 'bg-[#38BDF8] text-[#0A0E14] border-[#38BDF8]'
                    : 'bg-white/5 text-[#8B98AB] border-white/10 hover:text-white'
                }`}
              >
                {type} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((card) => (
          <div
            key={card.id}
            onClick={() => onSelectResult(card)}
            className="glass-card p-5 rounded-xl space-y-3 cursor-pointer hover:border-[#38BDF8]/50 transition group relative"
          >
            <div className="flex items-start justify-between">
              <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded border ${
                card.object_type === 'entity' ? 'bg-sky-500/10 text-[#38BDF8] border-sky-500/30' :
                card.object_type === 'event' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}>
                {card.object_type}
              </span>
              {card.confidence < 1.0 && (
                <span className="text-[10px] font-mono text-[#8B98AB]">Confidence: {(card.confidence * 100).toFixed(0)}%</span>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold font-grotesk text-white group-hover:text-[#38BDF8] transition flex items-center justify-between">
                <span>{card.title}</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition text-[#38BDF8]" />
              </h3>
              {card.subtitle && <p className="text-xs text-[#8B98AB] font-mono mt-0.5">{card.subtitle}</p>}
            </div>

            {card.description && (
              <p className="text-xs text-[#8B98AB] font-inter line-clamp-2">{card.description}</p>
            )}

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-[#8B98AB]">
              <div className="flex items-center space-x-1">
                <Shield className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>{card.source_name || 'Source Registered'}</span>
              </div>
              {card.date && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(card.date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {results.length === 0 && (
          <div className="col-span-2 glass-panel p-8 text-center text-[#8B98AB] font-mono text-xs">
            No matching items found for this facet filter.
          </div>
        )}
      </div>
    </div>
  );
};
