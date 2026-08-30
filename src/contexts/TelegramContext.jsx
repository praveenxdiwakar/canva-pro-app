import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { syncUser } from '../api/tasks';
import { supabase } from '../api/supabase';

const TelegramContext = createContext({});

export function TelegramProvider({ children }) {
  const tg = window.Telegram?.WebApp;
  const tgUser = tg?.initDataUnsafe?.user;
  
  const startParam = tg?.initDataUnsafe?.start_param || null; 

  const initialUser = {
    telegramId: tgUser?.id ? String(tgUser.id) : (import.meta.env.VITE_ADMIN_TELEGRAM_ID || "5589713552"),
    firstName: tgUser?.first_name || "User",
    lastName: tgUser?.last_name || "",
    username: tgUser?.username || "",
    photoUrl: tgUser?.photo_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    points: 0, 
    streak: 0,
    last_checkin: null
  };

  const [user, setUser] = useState(initialUser);
  const [isReady, setIsReady] = useState(false); 
  const [loadingProgress, setLoadingProgress] = useState(15);

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }

    // Simulate smooth progress increments while fetching
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 85) {
          clearInterval(interval);
          return 85;
        }
        return prev + 20;
      });
    }, 200);

    const tgIdStr = String(initialUser.telegramId);

    const localPts = parseInt(localStorage.getItem(`canva_pts_${tgIdStr}`)) || 0;
    const localStreak = parseInt(localStorage.getItem(`canva_streak_${tgIdStr}`)) || 0;
    const localDate = localStorage.getItem(`canva_date_${tgIdStr}`);

    syncUser(initialUser, startParam).then(dbUser => {
      clearInterval(interval);
      setLoadingProgress(100);

      setTimeout(() => {
        if (dbUser) {
          const finalPoints = Math.max(dbUser.points || 0, localPts);
          const finalStreak = Math.max(dbUser.streak || 0, localStreak);
          const finalDate = dbUser.last_checkin || localDate || null;

          setUser(prev => ({ 
            ...prev, 
            points: finalPoints,
            streak: finalStreak,
            last_checkin: finalDate
          }));

          if (localPts > (dbUser.points || 0)) {
            supabase.from('users').update({ points: finalPoints }).eq('telegram_id', tgIdStr).then();
          }
        } else {
          setUser(prev => ({ ...prev, points: localPts, streak: localStreak, last_checkin: localDate }));
        }
        setIsReady(true); 
      }, 400); // Small delay for final progress bar flourish
    });
  }, []);

  return (
    <TelegramContext.Provider value={{ user, setUser }}>
      <AnimatePresence>
        {!isReady && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-gradient-to-b from-[#0F0C29] via-[#302B63] to-[#24243E] text-white px-6 py-12 select-none overflow-hidden"
          >
            {/* Background Decorative Glows */}
            <div className="absolute top-[-10%] left-[-20%] w-72 h-72 bg-purple-600/30 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-20%] w-72 h-72 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Top Branding Section */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center mt-8 z-10"
            >
              <div className="w-16 h-16 bg-gradient-to-tr from-[#6200EA] to-[#00E5FF] rounded-3xl p-[2px] shadow-2xl mb-4 shadow-purple-500/30">
                <div className="w-full h-full bg-[#1A1833] rounded-[22px] flex items-center justify-center text-3xl">
                  🎨
                </div>
              </div>
              <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-cyan-300">
                Canva Pro App
              </h1>
              <p className="text-[11px] font-medium text-purple-300/70 tracking-widest uppercase mt-1">
                Exclusive VIP Experience
              </p>
            </motion.div>

            {/* Center Pulsing Loader / Ring Animation */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative flex flex-col items-center justify-center z-10 my-auto"
            >
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* Outer Spinning Ring */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-cyan-400 border-l-purple-500 shadow-[0_0_20px_rgba(0,229,255,0.2)]"
                />
                
                {/* Inner Pulse Ring */}
                <div className="absolute inset-3 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-md flex items-center justify-center">
                  <motion.span 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="text-3xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  >
                    💎
                  </motion.span>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <span className="text-xs font-bold text-cyan-300 tracking-wider uppercase animate-pulse">
                  Authenticating Session
                </span>
              </div>
            </motion.div>

            {/* Bottom Progress Bar & Status */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-[260px] z-10 mb-4"
            >
              <div className="flex justify-between items-center text-[10px] font-bold text-purple-300/80 mb-2 uppercase tracking-wider">
                <span>Syncing Cloud</span>
                <span>{loadingProgress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden p-[1px] backdrop-blur-sm border border-white/5">
                <motion.div 
                  className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full rounded-full shadow-[0_0_10px_rgba(0,229,255,0.5)]"
                  animate={{ width: `${loadingProgress}%` }}
                  transition={{ type: "spring", stiffness: 50, damping: 15 }}
                />
              </div>
              <p className="text-[9px] text-center text-white/30 font-medium mt-4">
                Secured by Telegram & Supabase
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isReady && children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
}