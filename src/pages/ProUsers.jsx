import React, { useState } from 'react';

export default function ProUsers() {
  const [activeTab, setActiveTab] = useState('All');

  // Hardcoded mockup data to match screenshot exactly
  const usersList = [
    { name: "Md. Sahid Hasan", status: "Active", time: "7d left", points: "7d · 20pts", initials: "MS", color: "bg-pink-400" },
    { name: "Huian Y.", status: "Active", time: "7d left", points: "7d · 20pts", initials: "HY", color: "bg-green-500" },
    { name: "Riyad", status: "Active", time: "6d left", points: "7d · 20pts", initials: "R", color: "bg-orange-400" },
    { name: "MD SHM Chowdhury T.", status: "Active", time: "28d left", points: "30d · 80pts", initials: "MS", color: "bg-purple-400" },
    { name: "Meet P.", status: "Active", time: "13d left", points: "15d · 45pts", initials: "MP", color: "bg-orange-500" },
    { name: "Badong", status: "Active", time: "4d left", points: "7d · 20pts", initials: "B", color: "bg-blue-400" },
    { name: "Anurag", status: "Expired", time: "Expired", points: "7d · 20pts", initials: "A", color: "bg-gray-400" },
    { name: "Asif H.", status: "Expired", time: "Expired", points: "7d · 20pts", initials: "AH", color: "bg-gray-400" },
    { name: "LaL M.", status: "Expired", time: "Expired", points: "7d · 20pts", initials: "LM", color: "bg-gray-400" },
  ];

  const filteredUsers = usersList.filter(u => activeTab === 'All' || u.status === activeTab);

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24">
      <div className="bg-white px-4 py-3 flex items-center justify-center border-b border-gray-100 shadow-sm">
        <h1 className="text-[15px] font-black text-gray-800 flex items-center gap-2">⭐ Pro Users</h1>
      </div>

      <div className="px-4 pt-4">
        <div className="text-center mb-4">
          <p className="text-[10px] text-gray-500 font-medium">6 active • 4 expiring • 8 expired</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl flex items-center px-3 py-2.5 mb-4 shadow-sm border border-gray-100">
          <span className="text-gray-400 mr-2 text-sm">🔍</span>
          <input type="text" placeholder="Search by name or username..." className="bg-transparent border-none outline-none text-xs w-full text-gray-700" />
        </div>

        {/* Tabs */}
        <div className="flex justify-between items-center bg-gray-50 p-1 rounded-2xl mb-4 border border-gray-200">
          {['Active', 'Expiring Soon', 'Expired', 'All'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 text-[9px] font-bold rounded-xl flex items-center justify-center gap-1 transition-all
                ${activeTab === tab ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              {tab} 
              <span className={`px-1.5 py-0.5 rounded-full text-[8px] ${activeTab === tab ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {tab === 'Active' ? '6' : tab === 'Expiring Soon' ? '4' : tab === 'Expired' ? '8' : '18'}
              </span>
            </button>
          ))}
        </div>

        {/* Users List */}
        <div className="space-y-2">
          {filteredUsers.map((u, i) => (
            <div key={i} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${u.color} flex items-center justify-center text-white font-black text-xs shadow-sm`}>
                  {u.initials}
                </div>
                <div>
                  <div className="font-bold text-xs text-gray-900 leading-tight">{u.name}</div>
                  <div className="text-[9px] font-medium text-gray-400 mt-0.5">{u.points}</div>
                </div>
              </div>
              <div className={`text-[10px] font-bold ${u.status === 'Expired' ? 'text-gray-400' : 'text-orange-500'}`}>
                {u.time}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <span className="text-[10px] text-gray-400 font-medium">8 members shown</span>
        </div>
      </div>
    </div>
  );
}