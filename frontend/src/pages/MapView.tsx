import React, { useState } from 'react';
import { MapPin, ShieldAlert, Compass, Target, Navigation } from 'lucide-react';
import { Entity } from '../types';

interface MapViewProps {
  entities: Entity[];
}

export const MapView: React.FC<MapViewProps> = ({ entities }) => {
  const [selectedCity, setSelectedCategory] = useState<string>('ALL');

  const geoEntities = entities.filter(
    (e) => e.properties?.lat !== undefined && e.properties?.lng !== undefined
  );

  const cities = Array.from(new Set(geoEntities.map((e) => e.properties?.city || 'Unknown')));

  const filtered = selectedCity === 'ALL'
    ? geoEntities
    : geoEntities.filter((e) => (e.properties?.city || 'Unknown') === selectedCity);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Compass className="w-5 h-5 text-[#38BDF8]" />
          <div>
            <h2 className="text-xl font-bold font-grotesk text-white">Geospatial Intelligence Map</h2>
            <p className="text-xs text-[#8B98AB]">Real-time spatial telemetry & operational target location tracking</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <Navigation className="w-3.5 h-3.5 text-[#8B98AB]" />
          <span className="text-[#8B98AB]">Sector:</span>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#0A0E14] border border-white/10 rounded px-2.5 py-1 text-white focus:outline-none focus:border-[#38BDF8]"
          >
            <option value="ALL">All Sectors ({geoEntities.length})</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Layout Map Representation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-[#0A0E14] border border-white/10 p-6 rounded-md min-h-[500px] relative flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs font-mono text-[#8B98AB] border-b border-white/10 pb-3">
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Satellite Telemetry Sync Active</span>
            </span>
            <span>Grid Coordinates: 37.7749° N, 122.4194° W</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-6">
            {filtered.slice(0, 12).map((item) => (
              <div
                key={item.id}
                className="bg-[#121822] border border-white/10 p-3 rounded space-y-2 hover:border-[#38BDF8] transition"
              >
                <div className="flex items-center justify-between">
                  <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-[#38BDF8]/20 text-[#38BDF8]">
                    {item.type}
                  </span>
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <h4 className="font-grotesk font-bold text-white text-xs truncate">{item.name}</h4>
                <p className="text-[10px] font-mono text-[#8B98AB]">
                  Lat: {Number(item.properties?.lat).toFixed(2)}, Lng: {Number(item.properties?.lng).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="text-[11px] font-mono text-[#8B98AB] border-t border-white/10 pt-3 flex justify-between">
            <span>Displaying {Math.min(filtered.length, 12)} of {filtered.length} Tracked Targets</span>
            <span>Target Risk Protocol: Level 3</span>
          </div>
        </div>

        {/* Spatial Target List */}
        <div className="bg-[#121822] border border-white/10 p-4 rounded-md space-y-3">
          <h3 className="font-grotesk font-bold text-white text-sm border-b border-white/10 pb-2 flex items-center space-x-2">
            <Target className="w-4 h-4 text-[#38BDF8]" />
            <span>Target Hotspots ({filtered.length})</span>
          </h3>

          <div className="space-y-2 overflow-y-auto max-h-[420px] font-mono text-xs">
            {filtered.map((e) => (
              <div key={e.id} className="p-2.5 bg-[#0A0E14] border border-white/10 rounded space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white font-grotesk">{e.name}</span>
                  <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                    e.properties?.risk_rating === 'HIGH' || e.properties?.risk_rating === 'SEVERE'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {e.properties?.risk_rating || 'GUARDED'}
                  </span>
                </div>
                <p className="text-[10px] text-[#8B98AB]">City: {e.properties?.city || 'Global Sector'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
