import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../api/supabase';
import { useTelegram } from '../contexts/TelegramContext';
import { useSwipeNavigation } from '../hooks/useSwipeNavigation';

export default function ProUsers() {
  const { user: currentUser } = useTelegram(); 
  
  // Ensure these paths match your App.jsx routes precisely
  const swipeHandlers = useSwipeNavigation('/redeem', '/profile'); 

  const [loading, setLoading] = useState(true);
  const [proUsers, setProUsers] = useState([]);
  const [filter, setFilter] = useState('all'); 

  useEffect(() => {
    fetchProUsers();
  }, []);

  const fetchProUsers = async () => {
    setLoading(true);
    try {
      const { data: redemptions, error: redErr } = await supabase
        .from('redemptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (redErr) console.error("Redemptions fetch error:", redErr);

      const { data: users, error: userErr } = await supabase.from('users').select('*');
      if (userErr) console.error("Users fetch error:", userErr);

      if (redemptions) {
        const safeUsers = users || [];

        const mergedData = redemptions.map(redemption => {
          const rId = String(redemption?.telegram_id || redemption?.telegramid || redemption?.telegramId || redemption?.id || "").trim();

          let userProfile = safeUsers.find(u => {
            const uId = String(u?.telegram_id || u?.telegramid || u?.telegramId || u?.id || "").trim();
            return uId === rId && rId !== "";
          }) || {};
          
          if (currentUser && String(currentUser.telegramId) === rId) {
             userProfile = {
                first_name: currentUser.firstName,
                last_name: currentUser.lastName,
                username: currentUser.username,
                photo_url: currentUser.photoUrl
             };
          }

          return {
            ...redemption,
            redempId: rId,
            user: userProfile,
            statusInfo: calculateStatus(redemption?.expires_at || redemption?.expiresat || redemption?.expiresAt)
          };
        });
        
        setProUsers(mergedData);
      }
    } catch (error) {
      console.error("Error fetching pro users:", error);
    }
    setLoading(false);
  };

  const calculateStatus = (expiresAtStr) => {
    if (!expiresAtStr) return { status: 'expired', label: 'Expired', color: 'bg-red-50 text-red-600 border-red-200', timeText: 'Access Ended' };

    const expiresAt = new Date(expiresAtStr);
    const now = new Date();
    const diffMs = expiresAt - now;
    
    if (isNaN(expiresAt.getTime()) || diffMs <= 0) {
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

  const filteredUsers = proUsers.filter(item => {
    if (filter === 'all') return true;
    return item?.statusInfo?.status === filter;
  });

  const tabs = [
    { id: 'all', icon: '🌍', label: 'All Users' },
    { id: 'active', icon: '✅', label: 'Active' },
    { id: 'expiring', icon: '⚠️', label: 'Expiring' },
    { id: 'expired', icon: '❌', label: 'Expired' }
  ];

  return (
    <div {...swipeHandlers} className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24 relative overflow-x-hidden">
      
      <div className="relative w-full h-[150px] bg-gradient-to-br from-[#00C4CC] via-[#7B2CBF] to-[#6200EA] flex items-center justify-center overflow-hidden">
        <div className="absolute top-[-20px] left-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none z-0"></div>
        <div className="absolute bottom-[-30px] right-[-10px] w-40 h-40 bg-[#00E5FF]/20 rounded-full blur-[40px] pointer-events-none z-0"></div>
        
        <div className="relative z-20 flex items-center justify-center gap-1.5 drop-shadow-xl mt-2">
          <h1 className="text-[52px] font-bold text-white tracking-tighter" style={{ fontFamily: 'Georgia, serif' }}>
            Canva
          </h1>
          <div className="bg-gradient-to-tr from-[#FFD700] via-[#F59E0B] to-[#FFD700] text-[#5B3A00] font-black text-[11px] px-2 py-0.5 rounded-[6px] uppercase tracking-widest shadow-[0_4px_10px_rgba(245,158,11,0.4)] -mt-8 border border-yellow-200/50">
            Pro
          </div>
        </div>
      </div>

      <div className="bg-white px-5 py-5 shadow-sm border-b border-gray-100 relative z-30">
        <h1 className="text-[16px] font-black text-gray-900 flex items-center gap-2 mb-1.5">
          <span className="text-[18px]">🌟</span> Pro Community
        </h1>
        <p className="text-[11px] text-gray-500 font-medium leading-relaxed mb-4">
          View all members who have successfully redeemed Canva Pro using their points.
        </p>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1 no-page-swipe">
          {tabs.map(tab => {
            const isActive = filter === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold transition-all shadow-sm border ${
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

      <div className="px-4 pt-5 space-y-4 relative z-30">
        {!loading && (
          <div className="grid grid-cols-3 gap-2.5 mb-1">
            <div className="bg-white rounded-[16px] p-3 border border-gray-100 shadow-sm text-center">
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Active</div>
              <div className="text-lg font-black text-[#10B981] leading-none">{proUsers.filter(u => u?.statusInfo?.status === 'active').length}</div>
            </div>
            <div className="bg-white rounded-[16px] p-3 border border-gray-100 shadow-sm text-center">
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Expiring</div>
              <div className="text-lg font-black text-[#F59E0B] leading-none">{proUsers.filter(u => u?.statusInfo?.status === 'expiring').length}</div>
            </div>
            <div className="bg-white rounded-[16px] p-3 border border-gray-100 shadow-sm text-center">
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total</div>
              <div className="text-lg font-black text-[#6200EA] leading-none">{proUsers.length}</div>
            </div>
          </div>
        )}

        <div className="space-y-3 pb-4">
          {loading ? (
            <div className="text-center py-10 flex flex-col items-center">
              <span className="text-3xl animate-spin mb-3">⏳</span>
              <span className="text-xs text-gray-400 font-bold">Loading Pro Users...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="bg-white rounded-[24px] p-8 text-center border border-gray-100 shadow-sm mt-4">
              <span className="text-4xl mb-3 block opacity-50">👻</span>
              <h3 className="font-black text-gray-800 text-[15px] mb-1">No users found</h3>
              <p className="text-[11px] text-gray-400 font-medium">There are no users matching this filter.</p>
            </div>
          ) : (
            filteredUsers.map((item, index) => {
              const fName = item?.user?.first_name || item?.user?.firstname || item?.user?.firstName || "";
              const lName = item?.user?.last_name || item?.user?.lastname || item?.user?.lastName || "";
              const uName = item?.user?.username || item?.user?.userName || "";
              const photoUrl = item?.user?.photo_url || item?.user?.photourl || item?.user?.photoUrl || "";
              
              let displayName = `${fName} ${lName}`.trim();
              if (!displayName || displayName === "Unknown") {
                displayName = item?.redempId ? `Member ${item.redempId.substring(0, 5)}` : "Pro Member";
              }

              const displayUsername = uName ? `@${uName.replace('@', '')}` : (item?.redempId ? `@user_${item.redempId.substring(0,4)}` : "@user");
              const initial = displayName.charAt(0).toUpperCase();

              const claimedDays = item?.tier_id === 1 ? '7 Days' : item?.tier_id === 2 ? '15 Days' : item?.tier_id === 3 ? '30 Days' : 'Pro';
              const claimDate = item?.created_at || item?.createdat || item?.createdAt || new Date().toISOString();

              return (
                <div 
                  key={item?.id || index}
                  className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3 relative overflow-hidden"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-50 rounded-full border-2 border-purple-100 overflow-hidden flex-shrink-0 flex items-center justify-center relative z-10 shadow-sm">
                      {photoUrl ? (
                        <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-black text-[#6200EA]">{initial}</span>
                      )}
                    </div>
                    <div className="relative z-10">
                      <h3 className="font-black text-[13px] text-gray-900 leading-tight">{displayName}</h3>
                      <p className="text-[9px] text-gray-400 font-medium mb-1.5">{displayUsername}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold bg-gray-50 border border-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase tracking-wide">
                          {claimedDays}
                        </span>
                        <span className="text-[8px] text-gray-400">
                          Claimed: {new Date(claimDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end relative z-10">
                    <div className={`px-2 py-1 rounded-md border text-[9px] font-black uppercase tracking-wider mb-1 ${item?.statusInfo?.color}`}>
                      {item?.statusInfo?.label}
                    </div>
                    <div className="text-[10px] font-bold text-gray-500">
                      {item?.statusInfo?.timeText}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}