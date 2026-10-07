import React, { useState } from 'react';
import { Document } from '../types';
import { FileText } from 'lucide-react';

interface DocumentsViewProps {
  documents: Document[];
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ documents }) => {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(documents[0] || null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
      <div className="space-y-3">
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#38BDF8]" />
            <h2 className="font-grotesk font-bold text-white text-base">Ingested Files ({documents.length})</h2>
          </div>
        </div>

        <div className="space-y-2 overflow-y-auto max-h-[70vh]">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className={`glass-card p-4 rounded-xl space-y-2 cursor-pointer transition ${
                selectedDoc?.id === doc.id ? 'border-[#38BDF8] bg-[#38BDF8]/10' : 'hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-white/10 rounded text-white">
                  {doc.file_type || 'TXT'}
                </span>
                <span className="text-[10px] font-mono text-[#8B98AB]">{new Date(doc.extraction_date).toLocaleDateString()}</span>
              </div>
              <h3 className="font-grotesk font-bold text-white text-sm line-clamp-1">{doc.title}</h3>
            </div>
          ))}
        </div>
      </div>

      <div className="md:col-span-2 glass-panel p-6 rounded-xl space-y-4 flex flex-col h-full overflow-hidden">
        {selectedDoc ? (
          <>
            <div className="border-b border-white/10 pb-4 flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/30 rounded">
                  {selectedDoc.file_type || 'DOCUMENT'}
                </span>
                <h2 className="text-xl font-bold font-grotesk text-white mt-1">{selectedDoc.title}</h2>
                <p className="text-xs font-mono text-[#8B98AB] mt-0.5">Source ID: {selectedDoc.source_id}</p>
              </div>
            </div>

            <div className="flex-1 bg-black/40 border border-white/5 rounded-xl p-4 overflow-y-auto font-mono text-xs text-white/90 leading-relaxed whitespace-pre-wrap">
              {selectedDoc.content || 'No text content extracted for this document.'}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#8B98AB] font-mono text-xs">
            Select a document to preview content.
          </div>
        )}
      </div>
    </div>
  );
};
