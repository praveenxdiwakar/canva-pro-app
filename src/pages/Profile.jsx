import React, { useState } from 'react';
import { useTelegram } from '../contexts/TelegramContext';
import { useNavigate } from 'react-router-dom';
import LeaderboardModal from '../components/LeaderboardModal';

export default function Profile() {
  const { user } = useTelegram();
  const navigate = useNavigate();
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24">
      
      {/* Top Bar */}
      <div className="bg-white px-4 py-3 flex items-center justify-center border-b border-gray-100 shadow-sm relative">
        <h1 className="text-[15px] font-black text-gray-800 flex items-center gap-2">👤 Profile</h1>
      </div>

      <div className="px-4 pt-4 space-y-4">
        
        {/* User Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm text-center border border-gray-100 relative">
          <div className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden border-4 border-purple-50 shadow-md bg-gray-100">
            {user?.photoUrl ? (
              <img src={user.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl mt-4 block">🧑‍💻</span>
            )}
          </div>
          
          <h2 className="text-xl font-black text-gray-900">{user?.firstName || "User"}</h2>
          <div className="text-[10px] text-gray-400 mb-1">@{user?.firstName?.toLowerCase() || "user"}</div>
          
          <div className="inline-block bg-purple-50 border border-purple-100 text-purple-600 font-bold px-3 py-1 rounded-full text-[10px] mb-3">
            ID: {user?.telegramId || "0000000"}
          </div>
          
          <div>
            <div className="inline-block bg-yellow-50 border border-yellow-200 text-yellow-600 font-black px-5 py-1.5 rounded-full text-xs shadow-sm">
              ⭐ {user?.points || 0} Points
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5">
            <button 
              onClick={() => setIsLeaderboardOpen(true)}
              className="bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold py-3 rounded-xl shadow-md flex justify-center items-center gap-2 text-sm"
            >
              🏆 Leaderboard
            </button>
            <button className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-3 rounded-xl shadow-md flex justify-center items-center gap-2 text-sm">
              🎧 Support
            </button>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-sm text-gray-800 flex items-center gap-2">📊 Activity Stats</h3>
            <span onClick={() => navigate('/reward-history')} className="text-[10px] text-blue-500 font-bold cursor-pointer">View History ➔</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: "0", label: "Today's Ads", icon: "📺" },
              { val: "0", label: "Today's Spins", icon: "🎡" },
              { val: "—", label: "Streak", icon: "🔥" },
              { val: "0", label: "Invited", icon: "👥" },
              { val: "0", label: "Lifetime Pts", icon: "⭐" },
              { val: "0", label: "Canva Redeemed", icon: "👑" },
            ].map((stat, i) => (
              <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center">
                <div className="font-black text-lg text-gray-900 leading-tight">{stat.val}</div>
                <div className="text-[8px] font-bold text-gray-500 mt-1 flex items-center gap-1 text-center">
                  {stat.icon} {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invite Friends */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-black text-sm text-gray-800 flex items-center gap-2">👥 Invite Friends & Earn</h3>
            <span className="text-[9px] font-bold text-orange-500">+5 pts / friend</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-50 border border-gray-200 text-gray-400 text-[10px] font-medium px-3 py-3 rounded-xl overflow-hidden text-ellipsis whitespace-nowrap">
              https://t.me/ShareCanvaProFree_Bot?startapp=...
            </div>
            <button className="bg-purple-50 border border-purple-100 text-purple-600 p-3 rounded-xl hover:bg-purple-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
          </div>
        </div>

        {/* My Subscriptions */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-black text-sm text-gray-800 flex items-center gap-2 mb-3">👑 My Canva Pro Subscriptions</h3>
          <div className="bg-gray-50 border border-gray-100 border-dashed rounded-xl p-4 text-center text-[11px] font-medium text-gray-400">
            No Canva Pro subscriptions yet.
          </div>
        </div>

      </div>

      <LeaderboardModal isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />
    </div>
  );
}