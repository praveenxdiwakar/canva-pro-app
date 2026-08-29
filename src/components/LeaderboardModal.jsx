import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchLeaderboard } from '../api/users';

export default function LeaderboardModal({ isOpen, onClose }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchLeaderboard().then(data => {
        setLeaderboard(data);
        setLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Helper to get initials
  const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : "U";

  // Reorder top 3 for podium (2nd place on left, 1st place middle, 3rd place right)
  const topThreeData = leaderboard.slice(0, 3);
  const topThree = [];
  if (topThreeData[1]) topThree.push({ rank: 2, data: topThreeData[1], color: "bg-blue-400" });
  if (topThreeData[0]) topThree.push({ rank: 1, data: topThreeData[0], color: "bg-pink-400" });
  if (topThreeData[2]) topThree.push({ rank: 3, data: topThreeData[2], color: "bg-green-400" });

  const others = leaderboard.slice(3);

  const colors = ["bg-blue-500", "bg-orange-500", "bg-purple-400", "bg-yellow-500", "bg-teal-500", "bg-pink-500"];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50">
      <motion.div 
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        className="bg-[#f5f5f5] w-full h-[90vh] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden max-w-md mx-auto relative"
      >
        <div className="bg-white px-5 py-4 rounded-t-3xl flex justify-between items-center z-10 shadow-sm">
          <div>
            <h2 className="font-black text-lg text-gray-900 flex items-center gap-2">🏆 Leaderboard</h2>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">Top earners ranked by points</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold hover:bg-gray-200">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 pb-20 px-4 pt-8">
          {loading ? (
            <div className="text-center text-gray-400 font-bold mt-10">Loading ranks...</div>
          ) : (
            <>
              {/* Podium */}
              <div className="flex justify-center items-end gap-3 mb-10 h-40">
                {topThree.map((item, i) => (
                  <div key={i} className="flex flex-col items-center relative">
                    <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center text-white font-black text-sm absolute -top-14 border-4 border-[#f5f5f5] shadow-sm z-10 overflow-hidden`}>
                      {item.data.photo_url ? <img src={item.data.photo_url} alt="" className="w-full h-full object-cover" /> : getInitials(item.data.first_name)}
                    </div>
                    <div className="text-[10px] font-bold text-gray-800 absolute -top-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-[60px]">{item.data.first_name || "User"}</div>
                    <div className="text-[10px] font-black text-yellow-500 absolute top-2 flex items-center gap-0.5 z-10">⭐ {item.data.points}</div>
                    
                    <div className={`w-16 ${item.rank === 1 ? 'h-24' : item.rank === 2 ? 'h-16' : 'h-12'} ${item.color} rounded-t-xl flex items-end justify-center pb-2 shadow-inner relative`}>
                       <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-[10px] absolute top-6 shadow-sm">
                         {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : '🥉'}
                       </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Leaderboard List */}
              <div className="space-y-2">
                {others.map((u, i) => {
                  const rank = i + 4;
                  const color = colors[i % colors.length];
                  return (
                    <div key={u.id} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-gray-400 w-4 text-center">#{rank}</span>
                        <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white font-bold text-xs overflow-hidden`}>
                          {u.photo_url ? <img src={u.photo_url} alt="" className="w-full h-full object-cover" /> : getInitials(u.first_name)}
                        </div>
                        <span className="font-bold text-xs text-gray-900">{u.first_name || "User"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500 font-black text-xs">⭐ {u.points}</div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}