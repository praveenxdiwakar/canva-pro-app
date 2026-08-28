import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTelegram } from '../contexts/TelegramContext';
import { motion, AnimatePresence } from 'framer-motion';
import LeaderboardModal from '../components/LeaderboardModal';

export default function Profile() {
  const { initData } = useTelegram();
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const res = await fetch('/api/users/stats', { headers: { 'x-init-data': initData } });
      return res.ok ? res.json() : null;
    },
    enabled: !!initData
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(stats?.referralUrl || '');
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
    }
  };

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24 relative">
      
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between shadow-sm z-10 relative">
        <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
          👤 Profile
        </h1>
      </div>

      <div className="px-4 pt-5 space-y-4">
        
        {/* User Info Card */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center relative overflow-hidden">
          <div className="w-20 h-20 mx-auto bg-gray-900 rounded-full border-4 border-white shadow-md mb-3 flex items-center justify-center overflow-hidden">
             <span className="text-3xl">🧑‍💻</span>
          </div>
          <h2 className="text-xl font-black text-gray-900">praveen</h2>
          <p className="text-sm text-gray-400 font-medium mb-3">@praveendiwakar</p>
          <div className="inline-block bg-purple-50 text-purple-600 text-xs font-bold px-3 py-1.5 rounded-full mb-3 border border-purple-100">
            ID: 1044031607
          </div>
          <div className="flex justify-center mb-5">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 font-black px-6 py-2 rounded-full text-sm shadow-sm flex items-center gap-1.5">
              ⭐ {stats?.lifetimePoints ?? 0} Points
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setShowLeaderboard(true)}
              className="flex-1 bg-[#f97316] hover:bg-[#ea580c] active:scale-95 transition-transform text-white font-bold py-3.5 rounded-xl shadow-md flex justify-center items-center gap-2 text-sm"
            >
              🏆 Leaderboard
            </button>
            <button className="flex-1 bg-[#06b6d4] hover:bg-[#0891b2] active:scale-95 transition-transform text-white font-bold py-3.5 rounded-xl shadow-md flex justify-center items-center gap-2 text-sm">
              🎧 Support
            </button>
          </div>
        </motion.div>

        {/* Activity Stats */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="font-black text-gray-800 text-sm flex items-center gap-2">
              📊 Activity Stats
            </h3>
            <span className="text-[10px] font-bold text-blue-500 cursor-pointer">View History →</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <StatBox val="0" label="Today's Ads" icon="📺" />
            <StatBox val="0" label="Today's Spins" icon="🎯" />
            <StatBox val={stats?.currentStreak > 0 ? `${stats.currentStreak}d` : "—"} label="Streak" icon="🔥" />
            <StatBox val={stats?.invitedFriends ?? "0"} label="Invited" icon="👥" />
            <StatBox val={stats?.lifetimePoints ?? "0"} label="Lifetime Pts" icon="⭐" />
            <StatBox val={stats?.totalRedeemed ?? "0"} label="Canva Redeemed" icon="👑" />
          </div>
        </motion.div>

        {/* Invite Friends & Earn */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-3 px-1">
            <h3 className="font-black text-gray-800 text-sm flex items-center gap-2">
              👥 Invite Friends & Earn
            </h3>
            <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-1 rounded-full">
              +5 pts / friend
            </span>
          </div>
          <div className="flex gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
            <div className="flex-1 px-3 py-2.5 text-xs truncate text-gray-500 font-mono">
              {stats?.referralUrl || "https://t.me/ShareCanvaProFree_Bot?startapp..."}
            </div>
            <button onClick={handleCopy} className="bg-purple-100 text-purple-600 px-4 py-2.5 rounded-xl shrink-0 hover:bg-purple-200 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            </button>
          </div>
        </motion.div>

        {/* Subscriptions */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm">
          <h3 className="font-black text-gray-800 text-sm flex items-center gap-2 mb-3 px-1">
            👑 My Canva Pro Subscriptions
          </h3>
          <div className="bg-gray-50 rounded-2xl p-5 text-xs font-medium text-gray-400 text-center border border-dashed border-gray-200">
            No Canva Pro subscriptions yet.
          </div>
        </motion.div>
      </div>

      {/* Render the Leaderboard Modal on top of everything if active */}
      <AnimatePresence>
        {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
      </AnimatePresence>

    </div>
  );
}

function StatBox({ val, label, icon }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-3 text-center border border-gray-100">
      <div className="text-lg font-black text-gray-900 mb-1">{val}</div>
      <div className="text-[9px] font-bold text-gray-400 uppercase flex items-center justify-center gap-1">
        <span>{icon}</span> {label}
      </div>
    </div>
  );
}