import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  // Get live points securely from Browser Storage
  const livePoints = parseInt(localStorage.getItem('user_points') || '0');

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24 relative">
      
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between shadow-sm relative">
        <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">👤 Profile</h1>
        <button onClick={() => navigate('/admin')} className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
          <span>⚙️</span> Admin
        </button>
      </div>

      <div className="px-4 pt-4 space-y-4">
        
        {/* User Card Profile info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
          <div className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden bg-purple-100 flex items-center justify-center border-4 border-white shadow-md">
            <span className="text-3xl">🧑‍💻</span>
          </div>
          
          <h2 className="text-lg font-black text-gray-900">App User</h2>
          <div className="inline-block bg-purple-100 text-purple-600 text-xs font-bold px-3 py-1 rounded-full mb-3 mt-1.5 shadow-xs">
            ID: 5589713552
          </div>

          <div className="flex justify-center mb-4">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 font-black px-5 py-1.5 rounded-full text-sm flex items-center gap-1.5 shadow-sm">
              ⭐ {livePoints} Points
            </div>
          </div>
          
          <div className="flex gap-3">
            <button className="flex-1 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
              🏆 Leaderboard
            </button>
            <button className="flex-1 bg-cyan-500 hover:bg-cyan-600 active:scale-[0.98] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
              🎧 Support
            </button>
          </div>
        </motion.div>

        {/* Activity Stats Grid */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-purple-600 text-sm">📊 Activity Stats</h3>
            <button onClick={() => navigate('/reward-history')} className="text-xs text-blue-500 font-bold hover:underline">
              View History →
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <StatBox label="Today's Ads" value={0} emoji="📺" />
            <StatBox label="Today's Spins" value={0} emoji="🎡" />
            <StatBox label="Streak" value="Day 1" emoji="🔥" />
            <StatBox label="Invited" value={0} emoji="👥" />
            <StatBox label="Lifetime Pts" value={livePoints} emoji="⭐" />
            <StatBox label="Redeemed" value={0} emoji="👑" />
          </div>
        </motion.div>

        {/* Invite Friends */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span>👥</span>
            <h3 className="font-black text-orange-500 text-sm">Invite Friends & Earn</h3>
            <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded-full">+5 pts / friend</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5 text-xs truncate text-gray-500 border border-gray-100">
              https://t.me/ShareCanvaProFree_Bot?startapp=5589713552
            </div>
            <button onClick={() => alert("Copied!")} className="bg-purple-100 text-purple-600 font-bold text-xs px-3 py-2.5 rounded-xl shrink-0">
              COPY
            </button>
          </div>
        </motion.div>

        {/* Canva Pro Subscriptions */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center gap-2">
            <span>👑</span>
            <h3 className="font-black text-cyan-500 text-sm">My Canva Pro Subscriptions</h3>
          </div>
          <div className="px-4 pb-4">
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-400 text-center border border-dashed border-gray-200">
              No Canva Pro subscriptions yet.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Subcomponent for the stats grid
function StatBox({ label, value, emoji }) {
  return (
    <div className="bg-gray-50 rounded-xl p-2.5 text-center">
      <div className="text-sm font-black text-gray-900">{value}</div>
      <div className="text-[10px] text-gray-400 mt-0.5 font-semibold flex items-center justify-center gap-1">
        <span>{emoji}</span> {label}
      </div>
    </div>
  );
}