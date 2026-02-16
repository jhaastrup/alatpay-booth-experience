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
  const [syncError, setSyncError] = useState<string | null>(null);

  const syncGlobalData = async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const data = await fetchAllLeads();
      // ALWAYS set the data, even if empty, to clear loading states and update UI
      setGlobalVisitors(data);
      setLastSynced(new Date());
      if (data.length === 0 && localVisitors.length === 0) {
        console.warn("No data returned from sync.");
      }
    } catch (err) {
      console.error("Sync error", err);
      setSyncError("Connection failed. Please check the Webhook URL.");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    syncGlobalData();
    // Auto-refresh every 60 seconds while admin is open
    const interval = setInterval(syncGlobalData, 60000);
    return () => clearInterval(interval);
  }, []);

  const allVisitors = useMemo(() => {
    const map = new Map<string, Visitor>();
    
    // 1. Add Global data (Source of Truth)
    globalVisitors.forEach(v => {
      if (v && v.id) map.set(v.id, v);
    });
    
    // 2. Add Local data (Catch instances where sync hasn't completed)
    localVisitors.forEach(v => {
      if (v && v.id && !map.has(v.id)) {
        map.set(v.id, v);
      }
    });
    
    let list = Array.from(map.values());

    // 3. Robust Sorting (handle potential malformed dates)
    list.sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return timeB - timeA;
    });

    // 4. Filtering
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      list = list.filter(v => 
        v.name?.toLowerCase().includes(lower) || 
        v.email?.toLowerCase().includes(lower) || 
        v.organization?.toLowerCase().includes(lower) ||
        v.visitorNumber?.toString().includes(lower)
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
    link.setAttribute('download', `alatpay_booth_leads_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const winnersCount = allVisitors.filter(v => v.isWinner).length;

  return (
    <div className="flex flex-col min-h-[80vh] space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#be0b27] font-bold text-xs uppercase tracking-widest">
            <span className={`flex h-2 w-2 rounded-full ${isSyncing ? 'bg-orange-400 animate-ping' : 'bg-green-500'}`}></span>
            {isSyncing ? 'Syncing with Central Hub...' : 'Central Registry Active'}
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Booth Analytics</h2>
          <p className="text-sm text-gray-500 font-medium">Real-time lead aggregation across all active tablets.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {syncError && (
            <div className="bg-red-50 text-red-600 text-[10px] font-bold px-3 py-2 rounded-xl border border-red-100 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {syncError}
            </div>
          )}
          <button
            onClick={syncGlobalData}
            disabled={isSyncing}
            className="px-5 py-2.5 bg-gray-50 text-gray-700 rounded-xl text-sm font-bold border border-gray-200 hover:bg-white hover:border-[#be0b27] hover:text-[#be0b27] transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
          <button
            onClick={exportToCSV}
            className="px-5 py-2.5 bg-[#be0b27] text-white rounded-xl text-sm font-bold shadow-lg shadow-red-900/10 hover:bg-[#92091d] hover:-translate-y-0.5 transition-all flex items-center gap-2 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:border-[#be0b27]/20 group">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-[#be0b27] mb-4 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Leads</p>
            <p className="text-4xl font-black text-gray-900 leading-none">{allVisitors.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:border-orange-200 group">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Winners</p>
            <p className="text-4xl font-black text-gray-900 leading-none">{winnersCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:border-green-200 group">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Conversion</p>
            <p className="text-4xl font-black text-gray-900 leading-none">
              {allVisitors.length > 0 ? Math.round((winnersCount / allVisitors.length) * 100) : 0}%
            </p>
          </div>
        </div>

        <div className="bg-[#be0b27] p-6 rounded-3xl shadow-xl shadow-red-900/10 flex flex-col justify-between text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl transition-all group-hover:scale-150"></div>
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4 relative z-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-black text-white/60 uppercase tracking-widest mb-1">Status</p>
            <p className="text-xl font-black leading-none">
              {lastSynced ? lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending...'}
            </p>
            <p className="text-[10px] font-bold mt-2 uppercase text-white/40 tracking-wider">Syncing every 60s</p>
          </div>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col flex-grow min-h-[500px]">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/30">
          <div className="relative w-full md:max-w-xl">
            <input
              type="text"
              placeholder="Search by name, email, organization or visitor #..."
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#be0b27] outline-none transition-all text-sm font-medium shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchTerm && (
               <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                 </svg>
               </button>
            )}
          </div>
          
          <div className="flex items-center gap-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
             <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#be0b27]"></div>
                <span>Winners</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
                <span>Visitors</span>
             </div>
          </div>
        </div>

        <div className="overflow-x-auto flex-grow">
          <table className="w-full text-left text-sm border-collapse min-w-[800px]">
            <thead className="sticky top-0 z-20">
              <tr className="bg-gray-50 text-[11px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="px-8 py-5">Rank / ID</th>
                <th className="px-8 py-5">Lead Information</th>
                <th className="px-8 py-5">Company / Org</th>
                <th className="px-8 py-5">Contact Points</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {isSyncing && allVisitors.length === 0 ? (
                Array(10).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6"><div className="h-4 bg-gray-100 rounded w-12"></div></td>
                    <td className="px-8 py-6"><div className="h-4 bg-gray-100 rounded w-40"></div></td>
                    <td className="px-8 py-6"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                    <td className="px-8 py-6"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                    <td className="px-8 py-6"><div className="h-4 bg-gray-100 rounded w-16 mx-auto"></div></td>
                    <td className="px-8 py-6"><div className="h-4 bg-gray-100 rounded w-12 ml-auto"></div></td>
                  </tr>
                ))
              ) : (
                allVisitors.map((v) => (
                  <tr key={v.id} className="group hover:bg-red-50/40 transition-all duration-200">
                    <td className="px-8 py-5">
                      <span className="bg-gray-100 group-hover:bg-[#be0b27] group-hover:text-white px-3 py-1.5 rounded-lg text-gray-600 font-black text-[11px] transition-colors shadow-sm">
                        #{v.visitorNumber}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="font-extrabold text-gray-900 group-hover:text-[#be0b27] transition-colors">{v.name}</div>
                      <div className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter mt-0.5">{v.id.substring(0, 8)}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-gray-600 font-medium italic">{v.organization || "No Organization"}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-gray-900 font-bold">{v.email}</div>
                      <div className="text-[11px] text-gray-400 font-medium">{v.phone}</div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      {v.isWinner ? (
                        <div className="inline-flex items-center gap-1.5 bg-[#be0b27] text-white px-4 py-1.5 rounded-full text-[10px] font-black shadow-lg shadow-red-900/20 uppercase tracking-widest">
                           <span className="relative flex h-1.5 w-1.5">
                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-100 opacity-75"></span>
                             <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                           </span>
                           Winner
                        </div>
                      ) : (
                        <span className="bg-gray-100 text-gray-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-200/50">Visitor</span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right whitespace-nowrap">
                      <div className="text-gray-900 font-black tracking-tighter">
                        {new Date(v.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', second: '2-digit'})}
                      </div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        {new Date(v.timestamp).toLocaleDateString([], {month: 'short', day: 'numeric'})}
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {allVisitors.length === 0 && !isSyncing && (
                <tr>
                  <td colSpan={6} className="py-32 text-center">
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="space-y-1">
                         <p className="font-black text-lg text-gray-900 uppercase tracking-tight">Zero Leads Found</p>
                         <p className="text-sm text-gray-500 font-medium max-w-xs mx-auto">Either no one has registered yet, or the device is having trouble connecting to the Central Hub.</p>
                      </div>
                      <button onClick={syncGlobalData} className="px-6 py-2.5 bg-[#be0b27] text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-red-900/10 hover:scale-105 active:scale-95 transition-all">
                        Try Syncing Again
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-8">
          <button
            onClick={onReset}
            className="text-[11px] text-gray-400 font-black hover:text-red-600 transition-colors uppercase tracking-[0.2em]"
          >
            Purge Local Storage
          </button>
          <div className="h-6 w-[1px] bg-gray-200 hidden sm:block"></div>
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Cloud Persistent Mode Active
          </div>
        </div>

        <a 
          href="#" 
          className="group flex items-center gap-3 text-[#be0b27] font-black text-sm px-6 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#be0b27]/20 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:-translate-x-1.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Return to Kiosk Mode
        </a>
      </div>
    </div>
  );
};

export default AdminDashboard;
