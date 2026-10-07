import React, { useState } from 'react';
import { Calendar, Tag, Filter } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  category: string;
  source_name: string;
  description?: string;
  entity_names: string[];
}

interface TimelineViewProps {
  events: TimelineEvent[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ events }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = Array.from(new Set(events.map((e) => e.category || 'General')));

  const filteredEvents = selectedCategory === 'ALL'
    ? events
    : events.filter((e) => (e.category || 'General') === selectedCategory);

  const sortedEvents = [...filteredEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-[#38BDF8]" />
          <div>
            <h2 className="font-grotesk font-bold text-white text-lg">Event Chronology</h2>
            <p className="text-xs text-[#8B98AB]">Filter dated occurrences across resolved entities</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <Filter className="w-4 h-4 text-[#8B98AB]" />
          <span className="text-[#8B98AB]">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#121822] border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-[#38BDF8]"
          >
            <option value="ALL">All Categories ({events.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="relative pl-6 border-l-2 border-[#38BDF8]/30 space-y-6">
        {sortedEvents.map((ev) => (
          <div key={ev.id} className="relative group">
            <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#0A0E14] border-2 border-[#38BDF8] group-hover:bg-[#38BDF8] transition-all sky-glow" />

            <div className="glass-card p-4 rounded-xl space-y-2 max-w-2xl transition hover:border-[#38BDF8]/40">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30">
                  {ev.category || 'General'}
                </span>
                <span className="text-xs font-mono text-[#8B98AB]">{new Date(ev.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>

              <h3 className="font-grotesk font-bold text-white text-base">{ev.title}</h3>

              {ev.description && (
                <p className="text-xs text-[#8B98AB] font-inter leading-relaxed">{ev.description}</p>
              )}

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono text-[#8B98AB]">
                <div className="flex items-center space-x-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Entities: {ev.entity_names.join(', ') || 'N/A'}</span>
                </div>
                <span className="text-[10px] opacity-75">Source: {ev.source_name}</span>
              </div>
            </div>
          </div>
        ))}

        {sortedEvents.length === 0 && (
          <div className="glass-card p-8 rounded-xl text-center text-[#8B98AB] font-mono text-xs">
            No chronological events recorded for this selection.
          </div>
        )}
      </div>
    </div>
  );
};
