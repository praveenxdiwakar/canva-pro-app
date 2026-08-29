import React from 'react';
import { motion } from 'framer-motion';

export default function LeaderboardModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  // Mock data to match your screenshot layout exactly
  const topThree = [
    { rank: 2, name: "..", initials: ".", color: "bg-blue-400", pts: 48 },
    { rank: 1, name: "Mahdi I.", initials: "MI", color: "bg-pink-400", pts: 88 },
    { rank: 3, name: "Meet P.", initials: "MP", color: "bg-green-400", pts: 44 }
  ];

  const others = [
    { rank: 4, name: "Farzaneh", initials: "F", color: "bg-blue-500", pts: 35 },
    { rank: 5, name: "Wassila B.", initials: "WB", color: "bg-orange-500", pts: 28 },
    { rank: 6, name: "Bk S.", initials: "BS", color: "bg-purple-400", pts: 27 },
    { rank: 7, name: "Shashi Shaurya", initials: "SS", color: "bg-yellow-500", pts: 25 },
    { rank: 8, name: "Hai H.", initials: "HH", color: "bg-teal-500", pts: 25 },
    { rank: 9, name: "Md Aive", initials: "MA", color: "bg-pink-500", pts: 24 }
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50">
      <motion.div 
        initial={{ y: "100%" }} 
        animate={{ y: 0 }} 
        exit={{ y: "100%" }}
        className="bg-[#f5f5f5] w-full h-[90vh] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden max-w-md mx-auto relative"
      >
        {/* Header */}
        <div className="bg-white px-5 py-4 rounded-t-3xl flex justify-between items-center z-10 shadow-sm">
          <div>
            <h2 className="font-black text-lg text-gray-900 flex items-center gap-2">🏆 Leaderboard</h2>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">Top earners ranked by points</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold hover:bg-gray-200">
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1 pb-20 px-4 pt-8">
          
          {/* Podium */}
          <div className="flex justify-center items-end gap-3 mb-10 h-40">
            {topThree.map((user, i) => (
              <div key={i} className="flex flex-col items-center relative">
                {/* Avatar positioned floating above the bar */}
                <div className={`w-12 h-12 rounded-full ${user.color} flex items-center justify-center text-white font-black text-sm absolute -top-14 border-4 border-[#f5f5f5] shadow-sm z-10`}>
                  {user.initials}
                </div>
                <div className="text-[10px] font-bold text-gray-800 absolute -top-2 whitespace-nowrap">{user.name}</div>
                <div className="text-[10px] font-black text-yellow-500 absolute top-2 flex items-center gap-0.5 z-10">⭐ {user.pts}</div>
                
                {/* Podium Bar */}
                <div className={`w-16 ${user.rank === 1 ? 'h-24' : user.rank === 2 ? 'h-16' : 'h-12'} ${user.color} rounded-t-xl flex items-end justify-center pb-2 shadow-inner relative`}>
                   <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-[10px] absolute top-6 shadow-sm">
                     {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'}
                   </div>
                </div>
              </div>
            ))}
          </div>

          {/* Leaderboard List */}
          <div className="space-y-2">
            {others.map((u, i) => (
              <div key={i} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-gray-400 w-4 text-center">#{u.rank}</span>
                  <div className={`w-8 h-8 rounded-full ${u.color} flex items-center justify-center text-white font-bold text-xs`}>
                    {u.initials}
                  </div>
                  <span className="font-bold text-xs text-gray-900">{u.name}</span>
                </div>
                <div className="flex items-center gap-1 text-yellow-500 font-black text-xs">
                   ⭐ {u.pts}
                </div>
              </div>
            ))}
          </div>

        </div>
      </motion.div>
    </div>
  );
}