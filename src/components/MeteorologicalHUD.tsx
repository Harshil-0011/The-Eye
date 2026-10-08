import React, { useState } from 'react';
import {
  Cloud,
  Sun,
  Volume2,
  VolumeX,
  Camera,
  Layers,
  Sliders,
  Sparkles,
  Navigation
} from 'lucide-react';
import type { WeatherConfig } from './CloudCanvas';
import { PRESETS } from '../utils/presets';

interface HUDProps {
  config: WeatherConfig;
  onChangeConfig: (newConfig: WeatherConfig) => void;
  fps: number;
  cameraAltitude: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onTakeScreenshot: () => void;
}

export const MeteorologicalHUD: React.FC<HUDProps> = ({
  config,
  onChangeConfig,
  fps,
  cameraAltitude,
  isMuted,
  onToggleMute,
  onTakeScreenshot,
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  const updateField = <K extends keyof WeatherConfig>(field: K, value: WeatherConfig[K]) => {
    onChangeConfig({
      ...config,
      [field]: value,
    });
  };

  const applyPreset = (presetConfig: Partial<WeatherConfig>) => {
    onChangeConfig({
      ...config,
      ...presetConfig,
    });
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10 select-none">
      <div className="flex items-center justify-between w-full pointer-events-auto">
        <div className="flex items-center gap-3 glass-panel px-5 py-3 rounded-2xl">
          <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl border border-sky-500/30">
            <Cloud className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider text-slate-100 flex items-center gap-2">
              AETHERIA <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">SIMULATOR</span>
            </h1>
            <p className="text-xs text-slate-400">Volumetric Atmospheric Raymarcher</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass-panel px-4 py-2 rounded-xl text-xs font-mono text-slate-300 flex items-center gap-4">
            <div>
              <span className="text-slate-500 mr-1">FPS:</span>
              <span className={fps > 45 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>{fps}</span>
            </div>
            <div className="h-3 w-px bg-slate-700" />
            <div>
              <span className="text-slate-500 mr-1">ALT:</span>
              <span className="text-sky-400 font-bold">{cameraAltitude}m</span>
            </div>
            <div className="h-3 w-px bg-slate-700" />
            <div>
              <span className="text-slate-500 mr-1">MODE:</span>
              <span className="text-indigo-400 font-semibold uppercase">{config.cameraMode}</span>
            </div>
          </div>

          <button
            onClick={onToggleMute}
            className="glass-panel p-3 rounded-xl hover:bg-slate-800/80 transition text-slate-200 hover:text-sky-400"
            title={isMuted ? 'Unmute Soundscape' : 'Mute Soundscape'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-sky-400" />}
          </button>

          <button
            onClick={onTakeScreenshot}
            className="glass-panel p-3 rounded-xl hover:bg-slate-800/80 transition text-slate-200 hover:text-sky-400"
            title="Export HD Snapshot"
          >
            <Camera className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className={`glass-panel p-3 rounded-xl transition ${isPanelOpen ? 'bg-sky-500/20 text-sky-400 border-sky-500/40' : 'text-slate-200 hover:text-sky-400'}`}
            title="Toggle Controls Panel"
          >
            <Sliders className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isPanelOpen && (
        <div className="self-end w-96 max-h-[80vh] overflow-y-auto glass-panel p-5 rounded-3xl pointer-events-auto space-y-6 shadow-2xl border border-slate-700/50 backdrop-blur-2xl">
          <div>
            <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" /> Weather Presets
            </label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p.config)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/50 hover:bg-sky-500/20 border border-slate-700/60 hover:border-sky-500/40 text-xs text-slate-200 transition text-left"
                >
                  <span className="text-base">{p.icon}</span>
                  <span className="font-medium">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-800" />

          <div className="space-y-4">
            <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-400" /> Cloud Coverage & Mass
            </label>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Coverage Ratio</span>
                <span className="text-sky-400 font-mono">{Math.round(config.cloudCoverage * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={config.cloudCoverage}
                onChange={(e) => updateField('cloudCoverage', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Optical Density</span>
                <span className="text-sky-400 font-mono">{config.cloudDensity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={config.cloudDensity}
                onChange={(e) => updateField('cloudDensity', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Cloud Base Altitude</span>
                <span className="text-sky-400 font-mono">{config.cloudAltitude}m</span>
              </div>
              <input
                type="range"
                min="30"
                max="400"
                step="10"
                value={config.cloudAltitude}
                onChange={(e) => updateField('cloudAltitude', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="h-px bg-slate-800" />

          <div className="space-y-4">
            <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" /> Atmospheric Dynamics
            </label>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Sun Elevation Angle</span>
                <span className="text-amber-400 font-mono">{config.sunElevation}°</span>
              </div>
              <input
                type="range"
                min="-10"
                max="90"
                step="1"
                value={config.sunElevation}
                onChange={(e) => updateField('sunElevation', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Wind Velocity</span>
                <span className="text-teal-400 font-mono">{config.windSpeed} knots</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={config.windSpeed}
                onChange={(e) => updateField('windSpeed', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Precipitation / Darkness</span>
                <span className="text-blue-400 font-mono">{Math.round(config.precipitation * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.precipitation}
                onChange={(e) => updateField('precipitation', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="h-px bg-slate-800" />

          <div>
            <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase mb-2 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-indigo-400" /> Camera Navigation
            </label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => updateField('cameraMode', 'orbit')}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition ${
                  config.cameraMode === 'orbit'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                    : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:text-slate-200'
                }`}
              >
                Orbit Camera
              </button>
              <button
                onClick={() => updateField('cameraMode', 'fly')}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition ${
                  config.cameraMode === 'fly'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                    : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:text-slate-200'
                }`}
              >
                Fly Cockpit Mode
              </button>
            </div>
            {config.cameraMode === 'fly' && (
              <p className="text-[10px] text-slate-400 mt-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                WASD / Arrows to steer • Space/Shift for altitude climb/descent
              </p>
            )}
          </div>
        </div>
      )}

      <div className="pointer-events-auto self-start text-[11px] text-slate-500 font-mono glass-panel px-3 py-1.5 rounded-lg border border-slate-800">
        3D Raymarching Engine • Rayleigh & Mie Scattering • Beer-Lambert Light Attenuation
      </div>
    </div>
  );
};
