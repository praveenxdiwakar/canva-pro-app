import React, { useState, useEffect } from 'react';
import { useTelegram } from '../contexts/TelegramContext';
import { useNavigate } from 'react-router-dom';
import LeaderboardModal from '../components/LeaderboardModal';
import { fetchUserHistory } from '../api/users';

export default function Profile() {
  const { user } = useTelegram();
  const navigate = useNavigate();
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (user?.telegramId) {
      fetchUserHistory(user.telegramId).then(setHistory);
    }
  }, [user]);

  const activeSubs = history.filter(h => new Date(h.expires_at) > new Date());
  
  // Bulletproof Admin Check
  const adminIdStr = String(import.meta.env.VITE_ADMIN_TELEGRAM_ID).trim();
  const userIdStr = String(user?.telegramId).trim();
  const isAdmin = adminIdStr === userIdStr;

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24">
      <div className="bg-white px-4 py-3 flex items-center justify-center border-b border-gray-100 shadow-sm relative">
        <h1 className="text-[15px] font-black text-gray-800 flex items-center gap-2">👤 Profile</h1>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Real User Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm text-center border border-gray-100 relative">
          <div className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden border-4 border-purple-50 shadow-md bg-gray-100 flex items-center justify-center">
            {user?.photoUrl ? (
              <img src={user.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl mt-1 block font-black text-gray-300">{(user?.firstName || "U").substring(0, 2).toUpperCase()}</span>
            )}
          </div>
          
          {/* ---- EXACT NAME & USERNAME APPLIED HERE ---- */}
          <h2 className="text-xl font-black text-gray-900">
            {user?.firstName || "User"} {user?.lastName || ""}
          </h2>
          <div className="text-[10px] text-gray-400 mb-1">
            @{user?.username || user?.firstName?.replace(/\s+/g, '').toLowerCase() || "user"}
          </div>
          
          <div className="inline-block bg-purple-50 border border-purple-100 text-purple-600 font-bold px-3 py-1 rounded-full text-[10px] mb-3">
            ID: {user?.telegramId || "0000000"}
          </div>
          
          <div>
            <div className="inline-block bg-yellow-50 border border-yellow-200 text-yellow-600 font-black px-5 py-1.5 rounded-full text-xs shadow-sm">
              ⭐ {user?.points || 0} Points
            </div>
          </div>

          {/* EXCLUSIVE ADMIN BUTTON */}
          {isAdmin && (
            <button 
              onClick={() => navigate('/admin')}
              className="mt-5 w-full bg-gray-900 text-white font-black py-3.5 rounded-xl shadow-lg border border-gray-800 flex justify-center items-center gap-2 text-sm animate-pulse"
            >
              ⚙️ OPEN ADMIN DASHBOARD
            </button>
          )}

          <div className="grid grid-cols-2 gap-3 mt-5">
            <button onClick={() => setIsLeaderboardOpen(true)} className="bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold py-3 rounded-xl shadow-md flex justify-center items-center gap-2 text-sm">
              🏆 Leaderboard
            </button>
            <button className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-3 rounded-xl shadow-md flex justify-center items-center gap-2 text-sm">
              🎧 Support
            </button>
          </div>
        </div>

        {/* Real Activity Stats */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-sm text-gray-800 flex items-center gap-2">📊 Activity Stats</h3>
            <span onClick={() => navigate('/reward-history')} className="text-[10px] text-blue-500 font-bold cursor-pointer">View History ➔</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: "0", label: "Today's Ads", icon: "📺" },
              { val: "0", label: "Today's Spins", icon: "🎡" },
              { val: user?.streak || 0, label: "Streak", icon: "🔥" },
              { val: "0", label: "Invited", icon: "👥" },
              { val: user?.points || 0, label: "Current Pts", icon: "⭐" },
              { val: history.length, label: "Canva Redeemed", icon: "👑" },
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

        {/* Real Subscriptions */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-black text-sm text-gray-800 flex items-center gap-2 mb-3">👑 My Canva Pro Subscriptions</h3>
          {activeSubs.length === 0 ? (
            <div className="bg-gray-50 border border-gray-100 border-dashed rounded-xl p-4 text-center text-[11px] font-medium text-gray-400">
              No Canva Pro subscriptions yet.
            </div>
          ) : (
            <div className="space-y-2">
              {activeSubs.map(sub => (
                <div key={sub.id} className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-xs text-gray-900">Active Link</div>
                    <div className="text-[9px] text-gray-500 mt-0.5">{sub.link_name}</div>
                  </div>
                  <button onClick={() => window.open(sub.invite_link, '_blank')} className="bg-purple-600 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg">
                    Open Canva
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <LeaderboardModal isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />
    </div>
  );
}