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

  const syncGlobalData = async () => {
    setIsSyncing(true);
    try {
      const data = await fetchAllLeads();
      if (data && data.length > 0) {
        setGlobalVisitors(data);
        setLastSynced(new Date());
      }
    } catch (err) {
      console.error("Sync error", err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    syncGlobalData();
  }, []);

  const allVisitors = useMemo(() => {
    const map = new Map<string, Visitor>();
    globalVisitors.forEach(v => map.set(v.id, v));
    localVisitors.forEach(v => {
      if (!map.has(v.id)) map.set(v.id, v);
    });
    
    let list = Array.from(map.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      list = list.filter(v => 
        v.name.toLowerCase().includes(lower) || 
        v.email.toLowerCase().includes(lower) || 
        v.organization?.toLowerCase().includes(lower)
      );
    }

    return list;
  }, [localVisitors, globalVisitors, searchTerm]);

  const exportToCSV = () => {
    const headers = ['Visitor #', 'Name', 'Email', 'Phone', 'Org', 'Winner', 'Timestamp'];
    const rows = allVisitors.map(v => [
      v.visitorNumber,
      `"${v.name}"`,
      v.email,
      v.phone,
      `"${v.organization || 'N/A'}"`,
      v.isWinner ? 'Yes' : 'No',
      v.timestamp
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `alatpay_leads_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const winnersCount = allVisitors.filter(v => v.isWinner).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#be0b27] font-bold text-xs uppercase tracking-widest">
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            Management Portal
          </div>
          <h2 className="text-3xl font-black text-gray-900">Booth Performance</h2>
          <p className="text-sm text-gray-500 font-medium">Track lead generation and visitor engagement across all devices.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={syncGlobalData}
            disabled={isSyncing}
            className="px-5 py-2.5 bg-gray-50 text-gray-700 rounded-xl text-sm font-bold border border-gray-200 hover:bg-white hover:border-[#be0b27] hover:text-[#be0b27] transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Feed
          </button>
          <button
            onClick={exportToCSV}
            className="px-5 py-2.5 bg-[#be0b27] text-white rounded-xl text-sm font-bold shadow-lg shadow-red-900/10 hover:bg-[#92091d] hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export All Records
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-[#be0b27] mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Visitors</p>
            <p className="text-4xl font-black text-gray-900 leading-none">{allVisitors.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Gifts Distributed</p>
            <p className="text-4xl font-black text-gray-900 leading-none">{winnersCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Engagement Rate</p>
            <p className="text-4xl font-black text-gray-900 leading-none">
              {allVisitors.length > 0 ? Math.round((winnersCount / allVisitors.length) * 100) : 0}%
            </p>
          </div>
        </div>

        <div className="bg-[#be0b27] p-6 rounded-3xl shadow-xl shadow-red-900/10 flex flex-col justify-between text-white">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-black text-white/60 uppercase tracking-widest mb-1">Last Sync</p>
            <p className="text-xl font-black leading-none">
              {lastSynced ? lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
            </p>
            <p className="text-[10px] font-bold mt-2 uppercase text-white/40">Real-time cloud updates</p>
          </div>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full md:max-w-md">
            <input
              type="text"
              placeholder="Search leads by name, email, or company..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#be0b27] outline-none transition-all text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-[#be0b27]"></div>
              <span>Winner</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-gray-100 border border-gray-200"></div>
              <span>Visitor</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-[11px] font-black text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">ID / Rank</th>
                <th className="px-6 py-4">Visitor Information</th>
                <th className="px-6 py-4">Organization</th>
                <th className="px-6 py-4">Contact Detail</th>
                <th className="px-6 py-4 text-center">Outcome</th>
                <th className="px-6 py-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isSyncing && allVisitors.length === 0 ? (
                Array(6).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-5"><div className="h-4 bg-gray-100 rounded w-12"></div></td>
                    <td className="px-6 py-5"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                    <td className="px-6 py-5"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                    <td className="px-6 py-5"><div className="h-4 bg-gray-100 rounded w-40"></div></td>
                    <td className="px-6 py-5"><div className="h-4 bg-gray-100 rounded w-16 mx-auto"></div></td>
                    <td className="px-6 py-5"><div className="h-4 bg-gray-100 rounded w-12 ml-auto"></div></td>
                  </tr>
                ))
              ) : (
                allVisitors.map((v) => (
                  <tr key={v.id} className="group hover:bg-red-50/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-[10px] text-gray-400">
                      <span className="bg-gray-100 px-2 py-1 rounded text-gray-600 font-black">#{v.visitorNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{v.name}</div>
                      <div className="text-[10px] font-medium text-gray-400">{v.id.split('-')[0].toUpperCase()}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-medium">{v.organization || <span className="text-gray-200">Not specified</span>}</td>
                    <td className="px-6 py-4">
                      <div className="text-gray-800 font-medium">{v.email}</div>
                      <div className="text-[10px] text-gray-400">{v.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {v.isWinner ? (
                        <span className="bg-[#be0b27] text-white px-3 py-1 rounded-lg text-[10px] font-black shadow-sm shadow-red-900/20">WINNER</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-400 px-3 py-1 rounded-lg text-[10px] font-bold">PASSED</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="text-gray-900 font-bold">{new Date(v.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</div>
                      <div className="text-[10px] text-gray-400">{new Date(v.timestamp).toLocaleDateString([], {month: 'short', day: 'numeric'})}</div>
                    </td>
                  </tr>
                ))
              )}
              {allVisitors.length === 0 && !isSyncing && (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <div className="max-w-xs mx-auto space-y-3 opacity-30">
                      <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <p className="font-black text-sm uppercase tracking-widest">No matching leads</p>
                      <p className="text-xs font-medium">Try adjusting your filters or refreshing the global feed.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer / Meta Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 py-4 px-2">
        <div className="flex items-center gap-6">
          <button
            onClick={onReset}
            className="text-xs text-gray-400 font-bold hover:text-red-600 transition-colors uppercase tracking-widest"
          >
            Clear Local Cache
          </button>
          <div className="h-4 w-[1px] bg-gray-200"></div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
            Cloud records are protected & persistent
          </p>
        </div>

        <a 
          href="#" 
          className="group flex items-center gap-2 text-[#be0b27] font-black text-sm hover:underline"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Exit Dashboard
        </a>
      </div>
    </div>
  );
};

export default AdminDashboard;
