import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTelegram } from '../contexts/TelegramContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LeaderboardModal from '../components/LeaderboardModal';

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

  const { data: adminStatus } = useQuery({
    queryKey: ['admin-me'],
    queryFn: async () => {
      const res = await fetch('/api/admin/me', { headers: { 'x-init-data': initData } });
      return res.ok ? res.json() : { isAdmin: false };
    },
    enabled: !!initData
  });

  const telegramId = telegramUser?.telegramId || userData?.telegramId || "";
  const isMasterAdmin = telegramId === "5589713552" || adminStatus?.isAdmin;
  const points = userData?.points ?? 0;

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24 relative">
      <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between shadow-sm z-10 relative">
        <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">👤 Profile</h1>
        {isMasterAdmin && (
          <button onClick={() => navigate('/admin')} className="bg-orange-100 hover:bg-orange-200 text-orange-600 text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all shadow-sm">
            <span>⚙️</span> Admin
          </button>
        )}
      </div>

      <div className="px-4 pt-4 space-y-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center relative overflow-hidden">
          <div className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden bg-purple-100 flex items-center justify-center border-4 border-white shadow-md">
            <span className="text-3xl">🧑‍💻</span>
          </div>
          <h2 className="text-lg font-black text-gray-900">{telegramUser?.firstName || "User"}</h2>
          
          <div className="inline-block bg-purple-100 text-purple-600 text-xs font-bold px-3 py-1 rounded-full mb-4 shadow-xs mt-2">
            ID: {telegramId}
          </div>

          <div className="flex justify-center mb-5">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 font-black px-6 py-2 rounded-full text-sm shadow-sm flex items-center gap-1.5">
              ⭐ {points} Points (Live DB)
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}