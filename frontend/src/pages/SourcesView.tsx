import React, { useState } from 'react';
import { Source } from '../types';
import { Database, Upload } from 'lucide-react';

interface SourcesViewProps {
  sources: Source[];
  onUploadSuccess: () => void;
}

export const SourcesView: React.FC<SourcesViewProps> = ({ sources, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [sourceName, setSourceName] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !sourceName) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('source_name', sourceName);

    try {
      const res = await fetch('/api/v1/ingestion/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        alert('Ingestion pipeline completed successfully!');
        setFile(null);
        setSourceName('');
        onUploadSuccess();
      }
    } catch (err) {
      alert('Ingestion failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-xl space-y-4">
        <div className="flex items-center space-x-3">
          <Upload className="w-5 h-5 text-[#38BDF8]" />
          <div>
            <h2 className="text-xl font-bold font-grotesk text-white">Data Ingestion Wizard</h2>
            <p className="text-xs text-[#8B98AB]">Ingest CSV, JSON, Excel, PDF, or HTML into the canonical intelligence model</p>
          </div>
        </div>

        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <input
            type="text"
            placeholder="Source Designation (e.g., Q3 Report)"
            value={sourceName}
            onChange={(e) => setSourceName(e.target.value)}
            className="px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#38BDF8]"
            required
          />

          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-[#8B98AB] file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-mono file:bg-[#38BDF8]/20 file:text-[#38BDF8]"
            required
          />

          <button
            type="submit"
            disabled={isUploading}
            className="px-6 py-2 bg-[#38BDF8] hover:bg-[#4FC3F7] text-[#0A0E14] font-grotesk font-bold rounded-lg text-xs uppercase tracking-wider transition disabled:opacity-50"
          >
            {isUploading ? 'Ingesting...' : 'Run Pipeline'}
          </button>
        </form>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden border border-white/10">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-grotesk font-bold text-white text-base flex items-center space-x-2">
            <Database className="w-4 h-4 text-[#38BDF8]" />
            <span>Registered Provenance Sources</span>
          </h3>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-black/40 text-[11px] font-mono uppercase tracking-wider text-[#8B98AB]">
              <th className="p-4">Name</th>
              <th className="p-4">Origin File</th>
              <th className="p-4">Reliability</th>
              <th className="p-4">Records</th>
              <th className="p-4">Last Refresh</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs font-inter">
            {sources.map((s) => (
              <tr key={s.id} className="hover:bg-white/5 transition">
                <td className="p-4 font-bold text-white font-grotesk">{s.name}</td>
                <td className="p-4 font-mono text-[#8B98AB]">{s.origin}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {s.reliability_rating}
                  </span>
                </td>
                <td className="p-4 font-mono text-white">{s.record_count}</td>
                <td className="p-4 font-mono text-[#8B98AB]">{new Date(s.last_refresh).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
