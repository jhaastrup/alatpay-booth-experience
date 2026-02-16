
import React from 'react';
import { Visitor } from '../types';

interface AdminDashboardProps {
  visitors: Visitor[];
  onReset: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ visitors, onReset }) => {
  const exportToCSV = () => {
    const headers = ['Visitor #', 'Name', 'Email', 'Phone', 'Org', 'Winner', 'Timestamp'];
    const rows = visitors.map(v => [
      v.visitorNumber,
      v.name,
      v.email,
      v.phone,
      v.organization || 'N/A',
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
    link.setAttribute('download', `alatpay_visitors_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const winnersCount = visitors.filter(v => v.isWinner).length;

  return (
    <div className="glass rounded-3xl p-8 shadow-2xl space-y-8 animate-in slide-in-from-top-8 duration-500 max-w-2xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#be0b27]">Booth Dashboard</h2>
          <p className="text-sm text-gray-500">Event Monitoring & Analytics</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-[#be0b27] text-white rounded-lg text-sm font-bold shadow-md hover:bg-[#92091d] transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2 border border-red-200 text-red-500 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
          <p className="text-xs font-bold text-red-400 uppercase">Total Visitors</p>
          <p className="text-3xl font-black text-red-900">{visitors.length}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
          <p className="text-xs font-bold text-orange-500 uppercase">Gifts Won</p>
          <p className="text-3xl font-black text-orange-700">{winnersCount}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
          <p className="text-xs font-bold text-green-500 uppercase">Success Rate</p>
          <p className="text-3xl font-black text-green-700">
            {visitors.length > 0 ? Math.round((winnersCount / visitors.length) * 100) : 0}%
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Recent Submissions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100">
              <tr>
                <th className="py-3 font-bold text-gray-500">#</th>
                <th className="py-3 font-bold text-gray-500">Name</th>
                <th className="py-3 font-bold text-gray-500">Org</th>
                <th className="py-3 font-bold text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {visitors.slice().reverse().slice(0, 10).map((v) => (
                <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 font-mono text-xs">{v.visitorNumber}</td>
                  <td className="py-3 font-bold text-gray-800">{v.name}</td>
                  <td className="py-3 text-gray-500">{v.organization || '-'}</td>
                  <td className="py-3">
                    {v.isWinner ? (
                      <span className="bg-[#be0b27]/10 text-[#be0b27] px-2 py-0.5 rounded-full text-[10px] font-bold">WINNER</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full text-[10px] font-bold">PASSED</span>
                    )}
                  </td>
                </tr>
              ))}
              {visitors.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-gray-400 italic">No visitors yet today.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center">
        <a href="#" className="text-xs text-[#be0b27] font-bold hover:underline">Back to Main App</a>
      </div>
    </div>
  );
};

export default AdminDashboard;
