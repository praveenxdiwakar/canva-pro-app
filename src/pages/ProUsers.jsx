import React, { useState, useEffect } from 'react';
import { fetchProList } from '../api/users';

export default function ProUsers() {
  const [activeTab, setActiveTab] = useState('All');
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProList().then(data => {
      const formattedData = data.map(item => {
        const expiresAt = new Date(item.expires_at);
        const now = new Date();
        const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
        const isActive = daysLeft > 0;
        
        return {
          id: item.id,
          name: item.users.first_name || "Unknown User",
          photo: item.users.photo_url,
          initials: (item.users.first_name || "U").substring(0, 2).toUpperCase(),
          status: isActive ? (daysLeft <= 3 ? 'Expiring Soon' : 'Active') : 'Expired',
          time: isActive ? `${daysLeft}d left` : 'Expired',
          points: item.link_name,
          color: isActive ? 'bg-pink-400' : 'bg-gray-400'
        };
      });
      setUsersList(formattedData);
      setLoading(false);
    });
  }, []);

  const filteredUsers = usersList.filter(u => activeTab === 'All' || u.status === activeTab || (activeTab === 'Active' && u.status === 'Expiring Soon'));
  
  const counts = {
    Active: usersList.filter(u => u.status === 'Active' || u.status === 'Expiring Soon').length,
    ExpiringSoon: usersList.filter(u => u.status === 'Expiring Soon').length,
    Expired: usersList.filter(u => u.status === 'Expired').length,
    All: usersList.length
  };

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24">
      <div className="bg-white px-4 py-3 flex items-center justify-center border-b border-gray-100 shadow-sm">
        <h1 className="text-[15px] font-black text-gray-800 flex items-center gap-2">⭐ Pro Users</h1>
      </div>

      <div className="px-4 pt-4">
        <div className="text-center mb-4">
          <p className="text-[10px] text-gray-500 font-medium">{counts.Active} active • {counts.ExpiringSoon} expiring • {counts.Expired} expired</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-between items-center bg-gray-50 p-1 rounded-2xl mb-4 border border-gray-200">
          {['Active', 'Expiring Soon', 'Expired', 'All'].map(tab => {
            const countKey = tab === 'Expiring Soon' ? 'ExpiringSoon' : tab;
            return (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 text-[9px] font-bold rounded-xl flex items-center justify-center gap-1 transition-all ${activeTab === tab ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <span className="truncate max-w-[50px]">{tab}</span>
                <span className={`px-1 py-0.5 rounded-full text-[8px] ${activeTab === tab ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {counts[countKey]}
                </span>
              </button>
            )
          })}
        </div>

        {/* Users List */}
        <div className="space-y-2">
          {loading ? <div className="text-center text-gray-400 text-xs mt-10">Loading users...</div> : filteredUsers.length === 0 ? <div className="text-center text-gray-400 text-xs mt-10">No users found.</div> : filteredUsers.map(u => (
            <div key={u.id} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${u.color} flex items-center justify-center text-white font-black text-xs shadow-sm overflow-hidden`}>
                  {u.photo ? <img src={u.photo} alt="" className="w-full h-full object-cover" /> : u.initials}
                </div>
                <div>
                  <div className="font-bold text-xs text-gray-900 leading-tight">{u.name}</div>
                  <div className="text-[9px] font-medium text-gray-400 mt-0.5">Link: {u.points}</div>
                </div>
              </div>
              <div className={`text-[10px] font-bold ${u.status === 'Expired' ? 'text-gray-400' : 'text-orange-500'}`}>
                {u.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}