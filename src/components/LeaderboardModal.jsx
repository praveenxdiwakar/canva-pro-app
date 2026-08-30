import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../api/supabase';

export default function LeaderboardModal({ isOpen, onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Leaderboard Data whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Changed to select('*') to ensure we grab photo_url regardless of database casing
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('points', { ascending: false })
        .limit(100); 
      
      if (data && !error) {
        setUsers(data);
      }
    } catch (err) {
      console.error("Error fetching leaderboard", err);
    }
    setLoading(false);
  };

  // Helper to format full names nicely
  const formatName = (first, last) => {
    const f = first || "Unknown";
    const l = last ? ` ${last}` : "";
    return (f + l).trim();
  };

  // Helper to safely extract Initials (Emoji & Special Character Safe!)
  const getInitials = (first, last) => {
    // Array.from() safely handles emojis and special characters unlike charAt()
    const f = first ? Array.from(first)[0].toUpperCase() : "?";
    const l = last ? Array.from(last)[0].toUpperCase() : "";
    return f + l;
  };

  // Helper to safely grab the photo URL regardless of database column casing
  const getPhotoUrl = (u) => {
    return u.photo_url || u.photourl || u.photoUrl || null;
  };

  // Fixed colors for Top 3, dynamic hashed colors for the rest
  const getAvatarBg = (index, nameStr) => {
    if (index === 0) return 'bg-[#FF65B3]'; // 1st Place
    if (index === 1) return 'bg-[#7C7CFF]'; // 2nd Place
    if (index === 2) return 'bg-[#29D697]'; // 3rd Place
    
    const colors = ['bg-[#FF8A65]', 'bg-[#FFB74D]', 'bg-[#4DB6AC]', 'bg-[#7986CB]', 'bg-[#F06292]', 'bg-[#64B5F6]'];
    let hash = 0;
    for (let i = 0; i < nameStr.length; i++) {
       hash = nameStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Rearrange the top 3 array so 2nd Place is left, 1st Place is middle, 3rd Place is right
  const top3 = [users[1], users[0], users[2]]; 

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center">
          
          <motion.div 
            initial={{ y: "100%" }} 
            animate={{ y: 0 }} 
            exit={{ y: "100%" }} 
            transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
            className="w-full max-w-md bg-[#F9FAFB] rounded-t-[32px] sm:rounded-[32px] h-[90vh] sm:h-[80vh] flex flex-col overflow-hidden shadow-2xl"
          >
            
            {/* Header (Sticky) */}
            <div className="bg-white px-6 py-5 flex items-center justify-between z-10 border-b border-gray-100 rounded-t-[32px] shadow-sm">
              <div>
                <h2 className="text-[22px] font-black text-gray-900 flex items-center gap-2">
                  <span className="text-2xl drop-shadow-sm">🏆</span> Leaderboard
                </h2>
                <p className="text-[13px] text-gray-400 font-medium mt-0.5">Top earners ranked by points</p>
              </div>
              <button 
                onClick={onClose} 
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 active:scale-95 transition-all"
              >
                ✕
              </button>
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <span className="text-4xl animate-spin mb-3">⏳</span>
                <span className="font-bold text-sm">Loading Rankings...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <span className="text-4xl mb-3">👻</span>
                <span className="font-bold text-sm">No users yet!</span>
              </div>
            ) : (
              
              <div className="flex-1 overflow-y-auto pb-10 px-4">
                
                {/* ========================================= */}
                {/* --- THE 3D PODIUM (Top 3) ---             */}
                {/* ========================================= */}
                {users.length >= 1 && (
                  <div className="flex justify-center items-end gap-3 mt-10 mb-8 px-2">
                    {top3.map((u, i) => {
                      if (!u) return <div key={`spacer-${i}`} className="flex-1 max-w-[90px]" />; 
                      
                      const isFirst = i === 1;
                      const isSecond = i === 0;
                      
                      const nameStr = formatName(u.first_name || u.firstname, u.last_name || u.lastname);
                      const photo = getPhotoUrl(u);
                      
                      const originalIndex = isFirst ? 0 : isSecond ? 1 : 2; 
                      const bgColor = getAvatarBg(originalIndex, nameStr);
                      const height = isFirst ? 'h-[130px]' : isSecond ? 'h-[90px]' : 'h-[75px]';
                      const medal = isFirst ? '🥇' : isSecond ? '🥈' : '🥉';
                      
                      return (
                        <div key={`podium-${u.telegram_id || u.telegramid || i}`} className="flex flex-col items-center flex-1 max-w-[95px]">
                          
                          {/* Avatar with Photo Support */}
                          <div className={`w-[52px] h-[52px] rounded-full text-white flex items-center justify-center font-black text-lg mb-2 shadow-sm border-2 border-white overflow-hidden ${bgColor}`}>
                            {photo ? (
                              <img src={photo} alt={nameStr} className="w-full h-full object-cover" />
                            ) : (
                              getInitials(u.first_name || u.firstname, u.last_name || u.lastname)
                            )}
                          </div>
                          
                          {/* Name & Points */}
                          <div className="text-[12px] font-black text-gray-900 truncate w-full text-center mb-0.5 px-1">{nameStr.split(' ')[0]}</div>
                          <div className="text-[13px] font-black text-[#FACC15] mb-2 flex items-center gap-1">
                            ⭐ {u.points}
                          </div>
                          
                          {/* Podium Block */}
                          <div className={`w-full rounded-t-[20px] flex justify-center pt-3 ${bgColor} ${height} shadow-inner`}>
                            <span className="text-2xl drop-shadow-md bg-white/20 rounded-full w-8 h-8 flex items-center justify-center backdrop-blur-sm border border-white/20">
                              {medal}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ========================================= */}
                {/* --- THE SCROLLABLE LIST (All Users) ---   */}
                {/* ========================================= */}
                <div className="space-y-3 mt-4">
                  {users.map((u, i) => {
                    const nameStr = formatName(u.first_name || u.firstname, u.last_name || u.lastname);
                    const photo = getPhotoUrl(u);
                    const bgColor = getAvatarBg(i, nameStr);
                    const isTop3 = i < 3;
                    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;

                    return (
                      <div key={`list-${u.telegram_id || u.telegramid || i}`} className="bg-white rounded-[20px] p-4 flex items-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-50">
                        
                        <div className="flex items-center gap-4 flex-1 overflow-hidden">
                          {/* Rank # or Medal Badge */}
                          <div className="w-8 flex justify-center flex-shrink-0">
                            {isTop3 ? (
                              <span className="text-[22px] drop-shadow-sm">{medal}</span>
                            ) : (
                              <span className="text-[15px] font-black text-gray-400">#{i + 1}</span>
                            )}
                          </div>

                          {/* Avatar with Photo Support */}
                          <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-black text-[13px] flex-shrink-0 shadow-sm border-2 border-white overflow-hidden ${bgColor}`}>
                            {photo ? (
                              <img src={photo} alt={nameStr} className="w-full h-full object-cover" />
                            ) : (
                              getInitials(u.first_name || u.firstname, u.last_name || u.lastname)
                            )}
                          </div>

                          {/* Full Name */}
                          <div className="font-bold text-[14px] text-gray-900 truncate">
                            {nameStr}
                          </div>
                        </div>

                        {/* Points Badge */}
                        <div className="flex items-center gap-1.5 font-black text-[15px] text-[#FACC15] flex-shrink-0 ml-3">
                          ⭐ {u.points}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}