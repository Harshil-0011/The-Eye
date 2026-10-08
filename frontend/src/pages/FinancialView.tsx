import React from 'react';
import { DollarSign, ArrowUpRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const FinancialView: React.FC = () => {
  const transactions = [
    { id: 'tx-101', sender: 'Cyberdyne Systems', receiver: 'Apex Cybernetics', amount: '$14,500,000', status: 'CLEARED', risk: 'LOW', date: '2024-03-12' },
    { id: 'tx-102', sender: 'Nexus AI Corp', receiver: 'Orbital Tech', amount: '$8,200,000', status: 'PENDING', risk: 'ELEVATED', date: '2024-04-05' },
    { id: 'tx-103', sender: 'Alexander Vance', receiver: 'Vanguard Security', amount: '$2,450,000', status: 'FLAGGED', risk: 'HIGH', date: '2024-04-18' },
    { id: 'tx-104', sender: 'Aegis Dynamics', receiver: 'Cyberdyne Systems', amount: '$19,000,000', status: 'CLEARED', risk: 'LOW', date: '2024-05-01' },
    { id: 'tx-105', sender: 'Elena Rostova', receiver: 'Nexus AI Corp', amount: '$5,100,000', status: 'REVIEW', risk: 'GUARDED', date: '2024-05-14' },
  ];

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 rounded-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <DollarSign className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-xl font-bold font-grotesk text-white">Palantir Wire Transfer & Fund Flow Analytics</h2>
            <p className="text-xs text-[#8B98AB]">Financial transaction tracking, capital flow routing, and anomaly detection</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded space-y-1">
          <span className="text-xs font-mono text-[#8B98AB]">Total Monitored Liquidity</span>
          <p className="text-2xl font-bold font-grotesk text-white">$49,250,000</p>
        </div>
        <div className="glass-card p-4 rounded space-y-1">
          <span className="text-xs font-mono text-[#8B98AB]">Flagged Wire Anomaly Ratio</span>
          <p className="text-2xl font-bold font-grotesk text-amber-400">4.97%</p>
        </div>
        <div className="glass-card p-4 rounded space-y-1">
          <span className="text-xs font-mono text-[#8B98AB]">Audit Ledger Integrity</span>
          <p className="text-2xl font-bold font-grotesk text-emerald-400">Verified 100%</p>
        </div>
      </div>

      <div className="glass-panel rounded-md overflow-hidden border border-white/10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-[#0A0E14] text-[11px] font-mono uppercase tracking-wider text-[#8B98AB]">
              <th className="p-3.5">Tx ID</th>
              <th className="p-3.5">Origin Entity</th>
              <th className="p-3.5">Destination Entity</th>
              <th className="p-3.5">Transfer Value</th>
              <th className="p-3.5">Risk Rating</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs font-mono">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-white/5 transition">
                <td className="p-3.5 font-bold text-white">{tx.id}</td>
                <td className="p-3.5 text-[#38BDF8]">{tx.sender}</td>
                <td className="p-3.5 text-[#818CF8]">{tx.receiver}</td>
                <td className="p-3.5 font-bold text-white">{tx.amount}</td>
                <td className="p-3.5">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    tx.risk === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    tx.risk === 'ELEVATED' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {tx.risk}
                  </span>
                </td>
                <td className="p-3.5 text-[#8B98AB]">{tx.status}</td>
                <td className="p-3.5 text-[#8B98AB]">{tx.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
