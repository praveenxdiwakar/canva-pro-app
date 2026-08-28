import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTelegram } from '../contexts/TelegramContext';
import { motion } from 'framer-motion';

export default function Profile() {
  const { initData } = useTelegram();

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
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24">
      <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
        <h1 className="text-xl font-black text-gray-900">👤 Profile</h1>
      </div>

      <div className="px-4 pt-4 space-y-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-orange-50 rounded-xl p-3">
              <div className="text-2xl mb-1">🔥</div>
              <div className="text-lg font-black text-gray-900">{stats?.currentStreak ?? "—"}</div>
              <div className="text-[10px] font-bold text-gray-500 uppercase">Day Streak</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-3">
              <div className="text-2xl mb-1">👥</div>
              <div className="text-lg font-black text-gray-900">{stats?.invitedFriends ?? "0"}</div>
              <div className="text-[10px] font-bold text-gray-500 uppercase">Invited</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-3">
              <div className="text-2xl mb-1">⭐</div>
              <div className="text-lg font-black text-gray-900">{stats?.lifetimePoints ?? "0"}</div>
              <div className="text-[10px] font-bold text-gray-500 uppercase">Lifetime Pts</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-3">
              <div className="text-2xl mb-1">👑</div>
              <div className="text-lg font-black text-gray-900">{stats?.totalRedeemed ?? "0"}</div>
              <div className="text-[10px] font-bold text-gray-500 uppercase">Canva Redeemed</div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span>👥</span>
            <h3 className="font-black text-orange-500 text-sm">Invite Friends & Earn</h3>
            <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded-full">+5 pts / friend</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5 text-xs truncate text-gray-500 border border-gray-100">
              {stats?.referralUrl || "Loading..."}
            </div>
            <button onClick={handleCopy} className="bg-purple-100 text-purple-600 px-3 py-2.5 rounded-xl shrink-0 font-bold">
              Copy
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}