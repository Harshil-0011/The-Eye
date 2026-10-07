import React from 'react';
import { Search as SearchIcon, Filter } from 'lucide-react';

interface TopBarProps {
  globalQuery: string;
  setGlobalQuery: (query: string) => void;
  onSearchSubmit: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ globalQuery, setGlobalQuery, onSearchSubmit }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  return (
    <header className="h-16 border-b border-white/10 glass-panel px-6 flex items-center justify-between z-10 shrink-0">
      <div className="relative flex-1 max-w-xl">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <SearchIcon className="h-4 w-4 text-[#8B98AB]" />
        </div>
        <input
          type="text"
          value={globalQuery}
          onChange={(e) => setGlobalQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Global entity, event, or document search..."
          className="w-full pl-10 pr-4 py-2 glass-pill text-sm text-white placeholder-[#8B98AB] rounded-full focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] font-inter transition-all"
        />
      </div>

      <div className="flex items-center space-x-3 text-xs font-mono">
        <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#8B98AB] flex items-center space-x-1.5">
          <Filter className="w-3 h-3 text-[#38BDF8]" />
          <span>Canonical Only</span>
        </span>
        <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
          Auto-Resolution Active
        </span>
      </div>
    </header>
  );
};
