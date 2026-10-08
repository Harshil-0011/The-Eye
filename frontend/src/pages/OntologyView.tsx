import React from 'react';
import { Database, GitBranch, Layers, Tag } from 'lucide-react';

export const OntologyView: React.FC = () => {
  const objectTypes = [
    { name: 'Person', count: 3500, description: 'Individual human actor with properties, roles, and risk levels.' },
    { name: 'Organization', count: 1500, description: 'Corporate, military, or research institution.' },
    { name: 'Event', count: 2000, description: 'Dated operational occurrence linked to one or more entities.' },
    { name: 'Document', count: 500, description: 'Ingested raw intelligence file or HTML/PDF text source.' },
  ];

  const linkTypes = [
    { name: 'EMPLOYED_BY', weight: '1.0', description: 'Affiliation between Person and Organization.' },
    { name: 'PARTNERS_WITH', weight: '0.85', description: 'Strategic agreement between Organizations.' },
    { name: 'RESEARCH_COLLABORATION', weight: '0.88', description: 'Joint R&D initiative link.' },
    { name: 'SECURITY_AUDIT', weight: '0.90', description: 'Cryptographic or compliance inspection edge.' },
  ];

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 rounded-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Layers className="w-5 h-5 text-[#38BDF8]" />
          <div>
            <h2 className="text-xl font-bold font-grotesk text-white">Palantir Foundry Data Ontology Browser</h2>
            <p className="text-xs text-[#8B98AB]">Canonical schema definition, object types, and relationship link definitions</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-5 rounded-md space-y-4">
          <h3 className="font-grotesk font-bold text-white text-base border-b border-white/10 pb-2 flex items-center space-x-2">
            <Database className="w-4 h-4 text-[#38BDF8]" />
            <span>Object Schema Definitions</span>
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {objectTypes.map((obj) => (
              <div key={obj.name} className="p-3 bg-[#0A0E14] border border-white/10 rounded space-y-1">
                <div className="flex justify-between">
                  <span className="font-bold text-white font-grotesk text-sm">{obj.name}</span>
                  <span className="text-[#38BDF8] font-bold">{obj.count} Instances</span>
                </div>
                <p className="text-[#8B98AB] font-inter text-xs">{obj.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-md space-y-4">
          <h3 className="font-grotesk font-bold text-white text-base border-b border-white/10 pb-2 flex items-center space-x-2">
            <GitBranch className="w-4 h-4 text-[#38BDF8]" />
            <span>Link Schema Definitions</span>
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {linkTypes.map((link) => (
              <div key={link.name} className="p-3 bg-[#0A0E14] border border-white/10 rounded space-y-1">
                <div className="flex justify-between">
                  <span className="font-bold text-[#38BDF8]">{link.name}</span>
                  <span className="text-white">Default Weight: {link.weight}</span>
                </div>
                <p className="text-[#8B98AB] font-inter text-xs">{link.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
