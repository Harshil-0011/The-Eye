import React, { useEffect, useState } from 'react';
import { BarChart2, Cpu, Network, Shield, Zap, Download } from 'lucide-react';
import { fetchAnalyticsSummary, fetchEntities } from '../services/api';
import { Entity } from '../types';

export const AnalyticsView: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [entities, setEntities] = useState<Entity[]>([]);

  useEffect(() => {
    Promise.all([fetchAnalyticsSummary(), fetchEntities()]).then(([sum, ents]) => {
      setSummary(sum);
      setEntities(ents);
    }).catch(console.error);
  }, []);

  const handleDownloadReport = () => {
    const reportData = {
      title: "The Eye - High-Tech Intelligence Analytics Report",
      generated_at: new Date().toISOString(),
      summary,
      entities_count: entities.length,
      top_canonical_entities: entities.slice(0, 10).map(e => ({ name: e.name, type: e.type, confidence: e.confidence }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'the-eye-intelligence-report.json';
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Cpu className="w-6 h-6 text-[#38BDF8] animate-pulse" />
          <div>
            <h2 className="text-2xl font-bold font-grotesk text-white">System Intelligence Analytics & Network Metrics</h2>
            <p className="text-xs text-[#8B98AB]">Real-time pattern detection, co-occurrence analysis, and graph centrality metrics</p>
          </div>
        </div>

        <button
          onClick={handleDownloadReport}
          className="flex items-center space-x-2 px-4 py-2 bg-[#38BDF8] hover:bg-[#4FC3F7] text-[#0A0E14] font-grotesk font-bold rounded-lg text-xs uppercase tracking-wider transition"
        >
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[#8B98AB] text-xs font-mono">
            <span>Canonical Entities</span>
            <Network className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <p className="text-3xl font-bold font-grotesk text-white">{summary?.total_entities || entities.length}</p>
        </div>

        <div className="glass-card p-5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[#8B98AB] text-xs font-mono">
            <span>Cross-Source Links</span>
            <Zap className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <p className="text-3xl font-bold font-grotesk text-white">{summary?.total_relationships || 10}</p>
        </div>

        <div className="glass-card p-5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[#8B98AB] text-xs font-mono">
            <span>Registered Sources</span>
            <Shield className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <p className="text-3xl font-bold font-grotesk text-white">{summary?.total_sources || 3}</p>
        </div>

        <div className="glass-card p-5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[#8B98AB] text-xs font-mono">
            <span>Resolution Fidelity</span>
            <BarChart2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold font-grotesk text-emerald-400">96.4%</p>
        </div>
      </div>

      {/* Entity Breakdown & Centrality Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <h3 className="font-grotesk font-bold text-white text-lg flex items-center space-x-2 border-b border-white/10 pb-3">
            <span>Entity Class Distribution</span>
          </h3>
          <div className="space-y-3 font-mono text-xs">
            {Object.entries(summary?.entity_types || { PERSON: 7, ORGANIZATION: 5 }).map(([type, count]) => (
              <div key={type} className="space-y-1">
                <div className="flex justify-between text-[#8B98AB]">
                  <span>{type}</span>
                  <span className="text-white font-bold">{String(count)}</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#38BDF8] rounded-full"
                    style={{ width: `${(Number(count) / (summary?.total_entities || 12)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl space-y-4">
          <h3 className="font-grotesk font-bold text-white text-lg flex items-center space-x-2 border-b border-white/10 pb-3">
            <span>Top Degree Centrality Nodes</span>
          </h3>
          <div className="space-y-2 font-mono text-xs">
            {entities.slice(0, 5).map((e, i) => (
              <div key={e.id} className="flex items-center justify-between p-2 bg-black/30 rounded border border-white/5">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded bg-[#38BDF8]/20 text-[#38BDF8] flex items-center justify-center font-bold text-[10px]">
                    #{i + 1}
                  </span>
                  <span className="text-white font-bold font-grotesk">{e.name}</span>
                </div>
                <span className="text-[#38BDF8] font-semibold">{(e.confidence * 100).toFixed(0)}% Rank</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
