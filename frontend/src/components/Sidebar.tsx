import React from 'react';
import {
  Search,
  Network,
  Clock,
  Users,
  FileText,
  GitMerge,
  Database,
  BarChart2,
  Compass,
  DollarSign,
  ShieldAlert,
  Layers
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingReviewCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, pendingReviewCount }) => {
  const navItems = [
    { id: 'search', label: 'Search', icon: Search },
    { id: 'graph', label: 'Graph Explorer', icon: Network },
    { id: 'map', label: 'Tactical Map', icon: Compass },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'financial', label: 'Financial Flow', icon: DollarSign },
    { id: 'threat', label: 'Threat Matrix', icon: ShieldAlert },
    { id: 'ontology', label: 'Ontology', icon: Layers },
    { id: 'entities', label: 'Entities', icon: Users },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'review', label: 'Review Queue', icon: GitMerge, badge: pendingReviewCount },
    { id: 'sources', label: 'Sources & Ingest', icon: Database },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  ];

  return (
    <aside className="w-64 bg-[#0A0E14] border-r border-white/10 flex flex-col justify-between h-screen shrink-0 select-none">
      <div>
        <div className="p-5 border-b border-white/10 flex items-center space-x-3">
          <div className="w-6 h-6 rounded bg-[#38BDF8] flex items-center justify-center text-[#0A0E14] font-mono font-bold text-xs">
            E
          </div>
          <div>
            <h1 className="font-grotesk text-lg font-bold tracking-tight text-white">THE EYE</h1>
            <p className="text-[10px] text-[#8B98AB] tracking-wider uppercase font-mono">Palantir Workspace</p>
          </div>
        </div>

        <nav className="p-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#121822] text-[#38BDF8] border border-[#38BDF8]/40'
                    : 'text-[#8B98AB] hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#38BDF8]' : 'text-[#8B98AB]'}`} />
                  <span className="font-inter">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 rounded">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-white/10 text-xs text-[#8B98AB] font-mono flex items-center justify-between">
        <span className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Foundry Sync Active</span>
        </span>
        <span className="text-[10px] opacity-60">v1.0.0</span>
      </div>
    </aside>
  );
};
