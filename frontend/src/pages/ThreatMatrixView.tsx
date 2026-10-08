import React from 'react';
import { ShieldAlert, AlertTriangle, UserX, FileCheck } from 'lucide-react';
import { Entity } from '../types';

interface ThreatMatrixViewProps {
  entities: Entity[];
}

export const ThreatMatrixView: React.FC<ThreatMatrixViewProps> = ({ entities }) => {
  const highRiskEntities = entities.filter(
    (e) => e.properties?.risk_rating === 'HIGH' || e.properties?.risk_rating === 'SEVERE' || e.properties?.risk_rating === 'ELEVATED'
  );

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 rounded-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ShieldAlert className="w-5 h-5 text-red-400" />
          <div>
            <h2 className="text-xl font-bold font-grotesk text-white">Target Threat Score Matrix & Watchlist</h2>
            <p className="text-xs text-[#8B98AB]">Executive risk scoring, security clearance audit, and target dossiers</p>
          </div>
        </div>

        <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded font-mono text-xs font-bold">
          {highRiskEntities.length} Elevated Targets
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {highRiskEntities.slice(0, 10).map((item) => (
          <div key={item.id} className="glass-card p-4 rounded space-y-3 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-[#38BDF8]/20 text-[#38BDF8] rounded font-bold">
                {item.type}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-red-500/20 text-red-400 border border-red-500/30 rounded font-bold">
                {item.properties?.risk_rating || 'ELEVATED'}
              </span>
            </div>

            <div>
              <h3 className="font-grotesk font-bold text-white text-base">{item.name}</h3>
              <p className="text-xs text-[#8B98AB] font-mono">{item.properties?.role || 'High-Value Target Entity'}</p>
            </div>

            <div className="pt-2 border-t border-white/5 flex justify-between text-xs font-mono text-[#8B98AB]">
              <span>City: {item.properties?.city || 'Global'}</span>
              <span>Tax/ID: {item.properties?.tax_id || 'N/A'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
