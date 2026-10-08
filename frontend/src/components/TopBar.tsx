import React from 'react';
import { Search as SearchIcon, Filter, Cloud } from 'lucide-react';

interface TopBarProps {
  globalQuery: string;
  setGlobalQuery: (query: string) => void;
  onSearchSubmit: () => void;
  cloudTheme?: 'NIGHT' | 'GOLDEN' | 'STORM' | 'HIGH_ALTITUDE';
  setCloudTheme?: (theme: 'NIGHT' | 'GOLDEN' | 'STORM' | 'HIGH_ALTITUDE') => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  globalQuery,
  setGlobalQuery,
  onSearchSubmit,
  cloudTheme = 'NIGHT',
  setCloudTheme,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  return (
    <header className="h-14 border-b border-white/10 bg-[#121822]/90 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-10">
      <div className="relative flex-1 max-w-lg">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-4 w-4 text-[#8B98AB]" />
        </div>
        <input
          type="text"
          value={globalQuery}
          onChange={(e) => setGlobalQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search entities, events, documents..."
          className="w-full pl-9 pr-4 py-1.5 bg-[#0A0E14] border border-white/10 text-xs text-white placeholder-[#8B98AB] rounded-md focus:outline-none focus:border-[#38BDF8] font-inter"
        />
      </div>

      <div className="flex items-center space-x-3 text-xs font-mono">
        {setCloudTheme && (
          <div className="flex items-center space-x-1.5 bg-[#0A0E14] border border-white/10 px-2.5 py-1 rounded">
            <Cloud className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="text-[#8B98AB]">Sky:</span>
            <select
              value={cloudTheme}
              onChange={(e) => setCloudTheme(e.target.value as any)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="NIGHT" className="bg-[#121822]">Night Flight</option>
              <option value="GOLDEN" className="bg-[#121822]">Golden Hour</option>
              <option value="STORM" className="bg-[#121822]">Cumulus Storm</option>
              <option value="HIGH_ALTITUDE" className="bg-[#121822]">High Altitude</option>
            </select>
          </div>
        )}

        <span className="px-2.5 py-1 rounded bg-[#0A0E14] border border-white/10 text-[#8B98AB] flex items-center space-x-1.5">
          <Filter className="w-3 h-3 text-[#38BDF8]" />
          <span>Canonical View</span>
        </span>
      </div>
    </header>
  );
};
