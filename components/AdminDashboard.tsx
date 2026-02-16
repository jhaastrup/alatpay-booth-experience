import React, { useEffect, useState, useMemo } from 'react';
import { Visitor } from '../types';
import { fetchAllLeads } from '../services/submissionService';

interface AdminDashboardProps {
  visitors: Visitor[];
  onReset: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ visitors: localVisitors, onReset }) => {
  const [globalVisitors, setGlobalVisitors] = useState<Visitor[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const syncData = async () => {
    setIsSyncing(true);
    try {
      const data = await fetchAllLeads();
      // Only update if we actually got data back to prevent clearing the UI on temporary network blips
      if (data && data.length > 0) {
        setGlobalVisitors(data);
      }
      setLastSynced(new Date());
    } catch (err) {
      console.error("Manual sync failed:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    syncData();
    // Auto-sync every 30 seconds to keep the booth dashboard live
    const interval = setInterval(syncData, 30000);
    return () => clearInterval(interval);
  }, []);

  const allVisitors = useMemo(() => {
    // We use a Map keyed by email and name to deduplicate records 
    // that might exist in both local storage and the global sheet.
    const map = new Map<string, Visitor>();
    
    // 1. Process Global Data (Records from all devices)
    globalVisitors.forEach(v => {
      const key = `${v.email}-${v.name}`.toLowerCase();
      map.set(key, v);
    });
    
    // 2. Process Local Data (Unsynced records from this device)
    localVisitors.forEach(v => {
      const key = `${v.email}-${v.name}`.toLowerCase();
      if (!map.has(key)) {
        map.set(key, v);
      }
    });
    
    // 3. Convert back to list and sort by time (Newest First)
    let list = Array.from(map.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // 4. Filter based on user search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      list = list.filter(v => 
        v.name.toLowerCase().includes(lower) || 
        v.email.toLowerCase().includes(lower) || 
        v.organization?.toLowerCase().includes(lower) ||
        v.visitorNumber.toString().includes(lower)
      );
    }

    return list;
  }, [localVisitors, globalVisitors, searchTerm]);

  const exportToCSV = () => {
    const headers = ['Rank', 'Name', 'Email', 'Phone', 'Organization', 'Outcome', 'Timestamp'];
    const rows = allVisitors.map(v => [
      v.visitorNumber,
      `"${v.name}"`,
      v.email,
      v.phone,
      `"${v.organization || 'N/A'}"`,
      v.isWinner ? 'Winner' : 'Participant',
      v.timestamp
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `alatpay_booth_leads_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const winnersCount = allVisitors.filter(v => v.isWinner).length;

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`flex h-3 w-3 rounded-full ${isSyncing ? 'bg-orange-400 animate-ping' : 'bg-green-500'}`}></span>
            <span className="text-[10px] font-black text-[#be0b27] uppercase tracking-[0.3em]">
              {isSyncing ? 'Synchronizing Kiosks...' : 'Central Hub Connected'}
            </span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Lead Dashboard</h1>
          <p className="text-gray-500 font-medium mt-1">
            Aggregating {allVisitors.length} registrations across all booth devices.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <button
            onClick={syncData}
            disabled={isSyncing}
            className="flex-1 lg:flex-none px-6 py-3.5 bg-gray-50 text-gray-700 rounded-2xl text-sm font-bold border border-gray-200 hover:bg-white hover:border-[#be0b27] hover:text-[#be0b27] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Feed
          </button>
          <button
            onClick={exportToCSV}
            className="flex-1 lg:flex-none px-6 py-3.5 bg-[#be0b27] text-white rounded-2xl text-sm font-bold shadow-lg shadow-red-900/10 hover:bg-[#92091d] transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Global CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Leads', value: allVisitors.length, color: 'text-gray-900', bg: 'bg-white', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
          { label: 'Winners', value: winnersCount, color: 'text-[#be0b27]', bg: 'bg-white', icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7' },
          { label: 'Win Rate', value: `${allVisitors.length ? Math.round((winnersCount / allVisitors.length) * 100) : 0}%`, color: 'text-orange-600', bg: 'bg-white', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
          { label: 'Cloud Last Sync', value: lastSynced ? lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending', color: 'text-white', bg: 'bg-[#be0b27]', icon: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z' },
        ].map((kpi, i) => (
          <div key={i} className={`${kpi.bg} p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between group transition-all hover:scale-[1.02]`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${kpi.color === 'text-white' ? 'bg-white/20' : 'bg-gray-50 group-hover:bg-red-50 group-hover:text-[#be0b27] transition-colors'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={kpi.icon} />
              </svg>
            </div>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${kpi.color === 'text-white' ? 'text-white/60' : 'text-gray-400'}`}>{kpi.label}</p>
              <p className={`text-4xl font-black ${kpi.color}`}>{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row gap-6 justify-between items-center bg-gray-50/30">
          <div className="relative w-full md:max-w-2xl">
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              className="w-full pl-14 pr-6 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#be0b27] outline-none transition-all text-sm font-medium shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#be0b27]"></div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Winners</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Participants</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto flex-grow">
          <table className="w-full text-left text-sm min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/50 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] border-b border-gray-100">
                <th className="px-10 py-6">ID / Rank</th>
                <th className="px-10 py-6">Lead Details</th>
                <th className="px-10 py-6">Organization</th>
                <th className="px-10 py-6 text-center">Outcome</th>
                <th className="px-10 py-6 text-right">Submission Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(isSyncing && allVisitors.length === 0) ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-10 py-8"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : (
                allVisitors.map((v) => (
                  <tr key={v.id} className="group hover:bg-red-50/30 transition-colors">
                    <td className="px-10 py-6 font-mono text-[11px] text-gray-400">
                      <span className="bg-gray-100 px-3 py-1.5 rounded-lg text-gray-600 font-black group-hover:bg-[#be0b27] group-hover:text-white transition-colors">#{v.visitorNumber}</span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="font-extrabold text-gray-900 group-hover:text-[#be0b27] transition-colors">{v.name}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase mt-0.5 tracking-tight">{v.email}</div>
                    </td>
                    <td className="px-10 py-6 text-gray-500 font-medium">{v.organization || "Independent"}</td>
                    <td className="px-10 py-6 text-center">
                      {v.isWinner ? (
                        <span className="bg-[#be0b27] text-white px-4 py-1.5 rounded-full text-[10px] font-black shadow-md shadow-red-900/10 uppercase tracking-widest">Winner</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Participant</span>
                      )}
                    </td>
                    <td className="px-10 py-6 text-right whitespace-nowrap">
                      <div className="text-gray-900 font-black">{new Date(v.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{new Date(v.timestamp).toLocaleDateString([], {month: 'short', day: 'numeric', year: 'numeric'})}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {allVisitors.length === 0 && !isSyncing && (
            <div className="flex flex-col items-center justify-center py-40 space-y-4 opacity-30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="font-black text-xl tracking-tight uppercase">No Central Leads Found</p>
              <button onClick={syncData} className="text-[#be0b27] text-xs font-black uppercase border-b-2 border-[#be0b27] pb-1">Check Connections</button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-4 border-t border-gray-100">
        <button
          onClick={onReset}
          className="text-[10px] text-gray-300 font-black hover:text-red-500 transition-colors uppercase tracking-[0.3em]"
        >
          Clear Device Storage
        </button>

        <a 
          href="#" 
          className="flex items-center gap-3 text-[#be0b27] font-black text-sm px-8 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Exit Dashboard
        </a>
      </div>
    </div>
  );
};

export default AdminDashboard;
