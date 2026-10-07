import React, { useState } from 'react';
import { Entity } from '../types';
import { Users, Trash2 } from 'lucide-react';

interface EntitiesViewProps {
  entities: Entity[];
  onDeleteEntity: (id: string) => void;
}

export const EntitiesView: React.FC<EntitiesViewProps> = ({ entities, onDeleteEntity }) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filtered = filterType === 'ALL'
    ? entities
    : entities.filter((e) => e.type === filterType);

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 rounded-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="w-5 h-5 text-[#38BDF8]" />
          <div>
            <h2 className="text-xl font-bold font-grotesk text-white">Resolved Entities</h2>
            <p className="text-xs text-[#8B98AB]">Canonical table view of normalized persons, organizations, and topics</p>
          </div>
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-[#121822] border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#38BDF8]"
        >
          <option value="ALL">All Entity Types</option>
          <option value="PERSON">Persons</option>
          <option value="ORGANIZATION">Organizations</option>
          <option value="LOCATION">Locations</option>
        </select>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden border border-white/10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-black/40 text-[11px] font-mono uppercase tracking-wider text-[#8B98AB]">
              <th className="p-4">Name</th>
              <th className="p-4">Type</th>
              <th className="p-4">Aliases</th>
              <th className="p-4">Confidence</th>
              <th className="p-4">Updated</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs font-inter">
            {filtered.map((ent) => (
              <tr key={ent.id} className="hover:bg-white/5 transition">
                <td className="p-4 font-bold text-white font-grotesk">{ent.name}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30">
                    {ent.type}
                  </span>
                </td>
                <td className="p-4 text-[#8B98AB]">
                  {ent.aliases && ent.aliases.length > 0 ? ent.aliases.join(', ') : '—'}
                </td>
                <td className="p-4 font-mono text-[#38BDF8]">{(ent.confidence * 100).toFixed(0)}%</td>
                <td className="p-4 font-mono text-[#8B98AB]">{new Date(ent.updated_at).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => onDeleteEntity(ent.id)}
                    className="p-1.5 hover:bg-red-500/20 text-red-400 rounded transition"
                    title="Delete Entity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#8B98AB] font-mono text-xs">
                  No entities found matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
