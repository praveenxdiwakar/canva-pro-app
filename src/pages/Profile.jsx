import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTelegram } from '../contexts/TelegramContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LeaderboardModal from '../components/LeaderboardModal';

// Helper component for activity stats grid items
function StatBox({ label, value, emoji }) {
  return (
    <div className="bg-gray-50 rounded-xl p-2.5 text-center border border-gray-100 shadow-sm">
      <div className="text-sm font-black text-gray-900">{value}</div>
      <div className="text-[10px] text-gray-400 mt-0.5 font-semibold flex items-center justify-center gap-1">
        <span>{emoji}</span> {label}
      </div>
    </div>
  );
}

export default function Profile() {
  const { initData, user: telegramUser } = useTelegram();
  const navigate = useNavigate();
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const { data: userData } = useQuery({
    queryKey: ['user-me'],
    queryFn: async () => {
      const res = await fetch('/api/users/me', { headers: { 'x-init-data': initData } });
      return res.ok ? res.json() : null;
    },
    enabled: !!initData
  });

  const { data: stats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const res = await fetch('/api/users/stats', { headers: { 'x-init-data': initData } });
      return res.ok ? res.json() : null;
    },
    enabled: !!initData
  });

  const { data: adminStatus } = useQuery({
    queryKey: ['admin-me'],
    queryFn: async () => {
      const res = await fetch('/api/admin/me', { headers: { 'x-init-data': initData } });
      return res.ok ? res.json() : { isAdmin: false };
    },
    enabled: !!initData
  });

  const { data: config } = useQuery({
    queryKey: ['app-config'],
    queryFn: async () => {
      const res = await fetch('/api/config');
      return res.ok ? res.json() : null;
    },
    staleTime: 60000
  });

  const supportLink = config?.supportLink ?? "https://t.me/hnn79";

  const firstName = telegramUser?.firstName || userData?.firstName || "User";
  const lastName = telegramUser?.lastName || userData?.lastName || "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const username = telegramUser?.username || userData?.username || "";
  const photoUrl = telegramUser?.photoUrl || userData?.photoUrl || "";
  const points = userData?.points ?? 0;
  
  // Natively grab the user's Telegram ID
  const telegramId = telegramUser?.telegramId || userData?.telegramId || "";
  
  // 🔒 STRICT ADMIN CHECK: Only your ID (5589713552) or a backend-verified admin sees the button
  const isMasterAdmin = telegramId === "5589713552" || adminStatus?.isAdmin;

  const handleOpenSupport = () => {
    if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(supportLink);
    } else {
      window.open(supportLink, '_blank');
    }
  };

  const handleCopyReferral = () => {
    const link = stats?.referralUrl || `https://t.me/ShareCanvaProFree_Bot?startapp=${telegramId}`;
    navigator.clipboard.writeText(link);
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
    }
  };

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24 relative">
      
      {/* Top Header */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between shadow-sm z-10 relative">
        <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
          👤 Profile
        </h1>
        {/* Only shows if user is 5589713552 */}
        {isMasterAdmin && (
          <button 
            onClick={() => navigate('/admin')} 
            className="bg-orange-100 hover:bg-orange-200 text-orange-600 text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all shadow-sm"
          >
            <span>⚙️</span> Admin
          </button>
        )}
      </div>

      <div className="px-4 pt-4 space-y-4">
        
        {/* User Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center relative overflow-hidden">
          <div className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden bg-purple-100 flex items-center justify-center border-4 border-white shadow-md">
            {photoUrl ? (
              <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl">🧑‍💻</span>
            )}
          </div>
          
          <h2 className="text-lg font-black text-gray-900">{fullName}</h2>
          {username && <p className="text-sm text-gray-400 font-medium mb-1.5">@{username}</p>}
          
          <div className="inline-block bg-purple-100 text-purple-600 text-xs font-bold px-3 py-1 rounded-full mb-4 shadow-xs">
            ID: {telegramId}
          </div>

          <div className="flex justify-center mb-5">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 font-black px-6 py-2 rounded-full text-sm shadow-sm flex items-center gap-1.5">
              ⭐ {points} Points
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setShowLeaderboard(true)}
              className="flex-1 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] transition-transform text-white font-bold py-3.5 rounded-xl shadow-md flex justify-center items-center gap-2 text-sm"
            >
              🏆 Leaderboard
            </button>
            <button 
              onClick={handleOpenSupport}
              className="flex-1 bg-cyan-500 hover:bg-cyan-600 active:scale-[0.98] transition-transform text-white font-bold py-3.5 rounded-xl shadow-md flex justify-center items-center gap-2 text-sm"
            >
              🎧 Support
            </button>
          </div>
        </motion.div>

        {/* Activity Stats Grid */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-black text-purple-600 text-sm">📊 Activity Stats</h3>
            <button onClick={() => navigate('/reward-history')} className="text-xs text-blue-500 font-bold hover:underline">
              View History →
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <StatBox label="Today's Ads" value={stats?.todayAdsWatched ?? 0} emoji="📺" />
            <StatBox label="Today's Spins" value={stats?.todaySpins ?? 0} emoji="🎡" />
            <StatBox label="Streak" value={stats?.currentStreak > 0 ? `Day ${stats.currentStreak}` : "—"} emoji="🔥" />
            <StatBox label="Invited" value={stats?.invitedFriends ?? 0} emoji="👥" />
            <StatBox label="Lifetime Pts" value={stats?.lifetimePoints ?? 0} emoji="⭐" />
            <StatBox label="Canva Redeemed" value={stats?.totalRedeemed ?? 0} emoji="👑" />
          </div>
        </motion.div>

        {/* Invite Friends Section */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span>👥</span>
            <h3 className="font-black text-orange-500 text-sm">Invite Friends & Earn</h3>
            <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded-full">+5 pts / friend</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5 text-xs truncate text-gray-500 border border-gray-100 flex items-center font-mono">
              {stats?.referralUrl || `https://t.me/ShareCanvaProFree_Bot?startapp=${telegramId}`}
            </div>
            <button 
              onClick={handleCopyReferral} 
              className="bg-purple-100 hover:bg-purple-200 text-purple-600 px-3.5 py-2.5 rounded-xl shrink-0 transition-colors flex items-center justify-center font-bold text-xs"
            >
              Copy
            </button>
          </div>
        </motion.div>

        {/* Subscriptions */}
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

      <AnimatePresence>
        {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
      </AnimatePresence>

    </div>
  );
}