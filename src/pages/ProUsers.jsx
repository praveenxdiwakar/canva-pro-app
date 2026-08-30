import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../api/supabase';

export default function ProUsers() {
  const [loading, setLoading] = useState(true);
  const [proUsers, setProUsers] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'expiring', 'expired'

  useEffect(() => {
    fetchProUsers();
  }, []);

  const fetchProUsers = async () => {
    setLoading(true);
    try {
      // 1. Fetch all redemptions (latest first)
      const { data: redemptions } = await supabase
        .from('redemptions')
        .select('*')
        .order('created_at', { ascending: false });

      // 2. Fetch all users to get their profile data
      const { data: users } = await supabase
        .from('users')
        .select('telegram_id, first_name, last_name, username, photo_url');

      if (redemptions && users) {
        // 3. Merge the data and calculate status
        const mergedData = redemptions.map(redemption => {
          const userProfile = users.find(u => String(u.telegram_id) === String(redemption.telegram_id)) || {};
          
          return {
            ...redemption,
            user: userProfile,
            statusInfo: calculateStatus(redemption.expires_at)
          };
        });
        
        setProUsers(mergedData);
      }
    } catch (error) {
      console.error("Error fetching pro users:", error);
    }
    setLoading(false);
  };

  // Helper to determine status & time left
  const calculateStatus = (expiresAtStr) => {
    const expiresAt = new Date(expiresAtStr);
    const now = new Date();
    const diffMs = expiresAt - now;
    
    if (diffMs <= 0) {
      return { status: 'expired', label: 'Expired', color: 'bg-red-50 text-red-600 border-red-200', timeText: 'Access Ended' };
    }
    
    const daysLeft = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    
    if (daysLeft <= 3) {
      return { 
        status: 'expiring', 
        label: 'Expiring Soon', 
        color: 'bg-orange-50 text-orange-600 border-orange-200', 
        timeText: `${daysLeft}d ${hoursLeft}h left` 
      };
    }
    
    return { 
      status: 'active', 
      label: 'Active', 
      color: 'bg-green-50 text-green-600 border-green-200', 
      timeText: `${daysLeft}d ${hoursLeft}h left` 
    };
  };

  // Filter the users based on the selected tab
  const filteredUsers = proUsers.filter(item => {
    if (filter === 'all') return true;
    return item.statusInfo.status === filter;
  });

  const tabs = [
    { id: 'all', icon: '🌍', label: 'All Users' },
    { id: 'active', icon: '✅', label: 'Active' },
    { id: 'expiring', icon: '⚠️', label: 'Expiring' },
    { id: 'expired', icon: '❌', label: 'Expired' }
  ];

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24">
      
      {/* Header Section */}
      <div className="bg-white px-5 py-6 shadow-sm border-b border-gray-100 rounded-b-3xl">
        <h1 className="text-[15px] font-black text-gray-900 flex items-center gap-2 mb-4">
          <span className="text-2xl">🌟</span> Pro Community
        </h1>
        <p className="text-[12px] text-gray-500 font-medium leading-relaxed mb-5">
          View all members who have successfully redeemed Canva Pro using their points.
        </p>

        {/* Filter Tabs (Scrollable horizontally) */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
          {tabs.map(tab => {
            const isActive = filter === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all shadow-sm border ${
                  isActive 
                    ? 'bg-[#6200EA] text-white border-[#6200EA]' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Stats Summary */}
      {!loading && (
        <div className="px-4 mt-4 grid grid-cols-3 gap-2">
          <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm text-center">
            <div className="text-[10px] font-bold text-gray-400 uppercase">Active</div>
            <div className="text-lg font-black text-green-500">{proUsers.filter(u => u.statusInfo.status === 'active').length}</div>
          </div>
          <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm text-center">
            <div className="text-[10px] font-bold text-gray-400 uppercase">Expiring</div>
            <div className="text-lg font-black text-orange-500">{proUsers.filter(u => u.statusInfo.status === 'expiring').length}</div>
          </div>
          <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm text-center">
            <div className="text-[10px] font-bold text-gray-400 uppercase">Total</div>
            <div className="text-lg font-black text-[#6200EA]">{proUsers.length}</div>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="px-4 pt-4 space-y-3">
        {loading ? (
          <div className="text-center py-10 flex flex-col items-center">
            <span className="text-3xl animate-spin mb-3">⏳</span>
            <span className="text-xs text-gray-400 font-bold">Loading Pro Users...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-sm mt-4">
            <span className="text-4xl mb-3 block opacity-50">👻</span>
            <h3 className="font-black text-gray-800 text-[15px] mb-1">No users found</h3>
            <p className="text-[11px] text-gray-400 font-medium">There are no users matching this filter.</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {filteredUsers.map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3 relative overflow-hidden"
              >
                {/* User Info Left Side */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-50 rounded-full border-2 border-purple-100 overflow-hidden flex-shrink-0 flex items-center justify-center relative z-10">
                    {item.user?.photo_url ? (
                      <img src={item.user.photo_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-black text-purple-400">
                        {(item.user?.first_name || "U").substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="relative z-10">
                    <h3 className="font-black text-[13px] text-gray-900 leading-tight">
                      {item.user?.first_name || "Unknown"} {item.user?.last_name || ""}
                    </h3>
                    <p className="text-[9px] text-gray-400 font-medium mb-1">
                      @{item.user?.username || "user"}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                        {item.tier_id === 1 ? '7 Days' : item.tier_id === 2 ? '15 Days' : '30 Days'} Pro
                      </span>
                      <span className="text-[8px] text-gray-400">
                        Claimed: {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Right Side */}
                <div className="flex flex-col items-end relative z-10">
                  <div className={`px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-wider mb-1 ${item.statusInfo.color}`}>
                    {item.statusInfo.label}
                  </div>
                  <div className="text-[10px] font-bold text-gray-600">
                    {item.statusInfo.timeText}
                  </div>
                </div>

                {/* Background Decor if Active */}
                {item.statusInfo.status === 'active' && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 rounded-full blur-xl -mr-4 -mt-4 z-0"></div>
                )}
                {item.statusInfo.status === 'expiring' && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-orange-50 rounded-full blur-xl -mr-4 -mt-4 z-0"></div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
      
      {/* Quick Add style block for scrollbar hiding without external dependencies */}
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}