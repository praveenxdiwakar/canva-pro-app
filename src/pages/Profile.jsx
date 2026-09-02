import React, { useState, useEffect } from 'react';
import { useTelegram } from '../contexts/TelegramContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LeaderboardModal from '../components/LeaderboardModal';
import { fetchUserHistory } from '../api/users';
import { supabase } from '../api/supabase';
import { useSwipeNavigation } from '../hooks/useSwipeNavigation'; // ✅ ADDED SWIPE HOOK

export default function Profile() {
  const { user } = useTelegram();
  const navigate = useNavigate();
  
  // ✅ ADDED: Swipe Right -> Pro Users (/prousers) | Swipe Left -> Nowhere (null)
  const swipeHandlers = useSwipeNavigation('/prousers', null);

  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [history, setHistory] = useState([]);
  
  // States for Live Stats
  const [taskStats, setTaskStats] = useState({ ads: 0, spins: 0 });
  const [referralsCount, setReferralsCount] = useState(0);

  useEffect(() => {
    if (user?.telegramId) {
      // 1. Fetch History
      fetchUserHistory(user.telegramId).then(setHistory);

      // 2. Fetch Local Tasks (Today's Ads & Spins)
      const savedTasks = localStorage.getItem(`tasks_${user.telegramId}`);
      if (savedTasks) {
        try {
          const parsed = JSON.parse(savedTasks);
          // Only show stats if they belong to today
          if (parsed.lastDate === new Date().toDateString()) {
            setTaskStats({
              ads: (parsed.ads1 || 0) + (parsed.ads2 || 0),
              spins: parsed.spins || 0
            });
          }
        } catch (err) {
          console.error("Error parsing tasks", err);
        }
      }

      // 3. Fetch Invites (Referrals) from Database
      const fetchReferrals = async () => {
        try {
          const { count, error } = await supabase
            .from('users')
            .select('id', { count: 'exact', head: true })
            .eq('referred_by', String(user.telegramId));
          
          if (!error && count !== null) {
            setReferralsCount(count);
          }
        } catch (err) {
          console.error("Error fetching referrals:", err);
        }
      };
      fetchReferrals();
    }
  }, [user]);

  const activeSubs = history.filter(h => new Date(h.expires_at) > new Date());
  
  // Bulletproof Admin Check
  const adminIdStr = String(import.meta.env.VITE_ADMIN_TELEGRAM_ID).trim();
  const userIdStr = String(user?.telegramId).trim();
  const isAdmin = adminIdStr === userIdStr;

  const openExternalLink = (url) => {
    const tg = window.Telegram?.WebApp;
    if (tg && tg.openLink) { tg.openLink(url); } 
    else { const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.click(); }
  };

  return (
    <div {...swipeHandlers} className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24 relative overflow-x-hidden">
      {/* ✅ ADDED: {...swipeHandlers} attached to the background container */}
      
      {/* ========================================================= */}
      {/* 🌟 UPGRADED PREMIUM HEADER BANNER 🌟                        */}
      {/* ========================================================= */}
      <div className="relative w-full h-[150px] bg-gradient-to-br from-[#00C4CC] via-[#7B2CBF] to-[#6200EA] flex items-center justify-center overflow-hidden">
        
        {/* Ambient Glows */}
        <div className="absolute top-[-20px] left-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none z-0"></div>
        <div className="absolute bottom-[-30px] right-[-10px] w-40 h-40 bg-[#00E5FF]/20 rounded-full blur-[40px] pointer-events-none z-0"></div>
        
        {/* Animated Floating Particles */}
        <motion.div animate={{ y: [0, -10, 0], opacity: [0.3, 0.8, 0.3] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute top-6 left-10 text-white/50 text-[10px] select-none z-10">✨</motion.div>
        <motion.div animate={{ y: [0, 10, 0], opacity: [0.2, 0.6, 0.2] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }} className="absolute bottom-8 right-12 text-white/40 text-[14px] select-none z-10">✦</motion.div>

        {/* Canva Logo + PRO Badge */}
        <div className="relative z-20 flex items-center justify-center gap-1.5 drop-shadow-xl mt-2">
          <h1 className="text-[52px] font-bold text-white tracking-tighter" style={{ fontFamily: 'Georgia, serif' }}>
            Canva
          </h1>
          <motion.div 
            initial={{ scale: 0.8, rotate: 0 }}
            animate={{ scale: 1, rotate: 3 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
            className="bg-gradient-to-tr from-[#FFD700] via-[#F59E0B] to-[#FFD700] text-[#5B3A00] font-black text-[11px] px-2 py-0.5 rounded-[6px] uppercase tracking-widest shadow-[0_4px_10px_rgba(245,158,11,0.4)] -mt-8 border border-yellow-200/50"
          >
            Pro
          </motion.div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 📍 PROFILE HEADER BAR (Header Bottom)                     */}
      {/* ========================================================= */}
      <div className="bg-white px-5 py-4 shadow-sm border-b border-gray-100 relative z-30 flex items-center justify-center">
        <h1 className="text-[16px] font-black text-gray-900 flex items-center gap-2">
          <span className="text-[18px]">👤</span> My Profile
        </h1>
      </div>

      {/* Main Content Area */}
      <div className="px-4 pt-5 space-y-4 relative z-30">
        
        {/* Real User Card */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm text-center border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-3xl -mr-10 -mt-10 z-0"></div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden border-4 border-white shadow-md bg-gray-100 flex items-center justify-center">
              {user?.photoUrl ? (
                <img src={user.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl mt-1 block font-black text-gray-300">{(user?.firstName || "U").substring(0, 2).toUpperCase()}</span>
              )}
            </div>
            
            <h2 className="text-xl font-black text-gray-900">
              {user?.firstName || "User"} {user?.lastName || ""}
            </h2>
            <div className="text-[11px] font-medium text-gray-400 mb-2">
              @{user?.username || user?.firstName?.replace(/\s+/g, '').toLowerCase() || "user"}
            </div>
            
            <div className="inline-block bg-gray-50 border border-gray-100 text-gray-500 font-bold px-3 py-1 rounded-lg text-[10px] mb-3">
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
                className="mt-5 w-full bg-[#05030A] text-white font-black py-3.5 rounded-xl shadow-lg border border-gray-800 flex justify-center items-center gap-2 text-sm active:scale-95 transition-transform animate-pulse"
              >
                ⚙️ OPEN ADMIN DASHBOARD
              </button>
            )}

            <div className="grid grid-cols-2 gap-3 mt-5">
              <button onClick={() => setIsLeaderboardOpen(true)} className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 active:scale-95 transition-transform text-white font-bold py-3.5 rounded-xl shadow-md flex justify-center items-center gap-2 text-[13px]">
                <span className="text-lg leading-none">🏆</span> Leaderboard
              </button>
              
              <button onClick={() => openExternalLink('https://t.me/noobfrager')} className="bg-[#3B82F6] hover:bg-blue-600 active:scale-95 transition-transform text-white font-bold py-3.5 rounded-xl shadow-md flex justify-center items-center gap-2 text-[13px]">
                <span className="text-lg leading-none">🎧</span> Support
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 📊 REAL ACTIVITY STATS (NOW A PREMIUM CAROUSEL SLIDER)    */}
        {/* ========================================================= */}
        <div className="bg-white rounded-[24px] py-5 shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex justify-between items-center mb-4 px-5">
            <h3 className="font-black text-[15px] text-gray-900 flex items-center gap-2">📊 Activity Stats</h3>
            <span onClick={() => navigate('/reward-history')} className="text-[11px] text-[#6200EA] font-black cursor-pointer active:scale-95 transition-transform">View History ➔</span>
          </div>
          
          {/* ✅ ADDED: Horizontal scroll wrapper with 'no-page-swipe' class */}
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-5 pb-2 scrollbar-hide no-page-swipe" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {[
              { val: taskStats.ads, label: "Today's Ads", icon: "📺" },
              { val: taskStats.spins, label: "Today's Spins", icon: "🎡" },
              { val: user?.streak || 0, label: "Streak", icon: "🔥" },
              { val: referralsCount, label: "Invited", icon: "👥" },
              { val: user?.points || 0, label: "Current Pts", icon: "⭐" },
              { val: history.length, label: "Redeemed", icon: "👑" },
            ].map((stat, i) => (
              <div key={i} className="snap-start shrink-0 w-[100px] bg-gray-50 border border-gray-100 rounded-[16px] p-3 flex flex-col items-center justify-center shadow-sm">
                <div className="font-black text-2xl text-gray-900 leading-tight mb-1">{stat.val}</div>
                <div className="text-[9px] font-bold text-gray-500 flex items-center gap-1 text-center uppercase tracking-wider">
                  {stat.icon} {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real Subscriptions */}
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
          <h3 className="font-black text-[15px] text-gray-900 flex items-center gap-2 mb-4">👑 Pro Subscriptions</h3>
          {activeSubs.length === 0 ? (
            <div className="bg-gray-50 border-2 border-gray-100 border-dashed rounded-[16px] p-5 text-center text-[12px] font-medium text-gray-400">
              No Canva Pro subscriptions yet.
            </div>
          ) : (
            <div className="space-y-3">
              {activeSubs.map(sub => (
                <div key={sub.id} className="bg-gray-50 border border-gray-200 rounded-[16px] p-4 flex justify-between items-center shadow-sm">
                  <div>
                    <div className="font-black text-[13px] text-gray-900 mb-0.5">Active Link</div>
                    <div className="text-[10px] font-medium text-gray-500">{sub.link_name}</div>
                  </div>
                  <button onClick={() => window.open(sub.invite_link, '_blank')} className="bg-gradient-to-r from-[#6200EA] to-[#9D4EDD] active:scale-95 transition-transform text-white font-black text-[11px] px-4 py-2.5 rounded-xl shadow-md">
                    Open Canva
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <LeaderboardModal isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />
      
      {/* Hide Scrollbar Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}