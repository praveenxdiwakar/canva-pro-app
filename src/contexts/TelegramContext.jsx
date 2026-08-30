import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { syncUser } from '../api/tasks';
import { supabase } from '../api/supabase';

const TelegramContext = createContext({});

export function TelegramProvider({ children }) {
  const tg = window.Telegram?.WebApp;
  const tgUser = tg?.initDataUnsafe?.user;
  
  // 🚨 BROWSER BLOCKER 🚨
  // If there is no Telegram User ID, it means they opened the link in Safari/Chrome.
  // (Note: `!import.meta.env.DEV` ensures you can still test it on localhost on your PC, but it will block everyone on the live Vercel link).
  const isBrowser = !tgUser?.id && !import.meta.env.DEV;

  if (isBrowser) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#05030A] text-white px-6 select-none overflow-hidden text-center">
        {/* Ambient Red/Purple Error Glow */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-600/15 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none"></div>
        
        {/* Error Icon */}
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 shadow-[0_0_30px_rgba(220,38,38,0.15)] z-10">
          <span className="text-4xl drop-shadow-md">⚠️</span>
        </div>
        
        {/* Error Typography */}
        <h1 className="text-2xl font-black tracking-tight text-white mb-3 drop-shadow-md z-10">
          Connection Error
        </h1>
        <p className="text-[13px] font-medium text-gray-400 max-w-[280px] leading-relaxed mb-10 z-10">
          Unable to authenticate with Telegram. Please try reopening the app directly inside the Telegram Mini App.
        </p>

        {/* Action Button */}
        <a 
          href="https://t.me/" 
          className="relative overflow-hidden group bg-white text-[#05030A] font-black py-4 px-10 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95 transition-all z-10 flex items-center gap-2"
        >
          <span className="text-xl">✈️</span> Open in Telegram
        </a>
      </div>
    );
  }

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
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }

    // Smoothly increment progress to simulate complex loading
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 88) {
          clearInterval(interval);
          return 88; // Hold at 88% until DB finishes
        }
        return prev + (Math.random() * 15 + 5); 
      });
    }, 250);

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
      }, 600); 
    });
  }, []);

  // Dynamic Status Text based on progress
  let statusText = "Initializing Core...";
  if (loadingProgress > 25) statusText = "Authenticating Telegram Session...";
  if (loadingProgress > 55) statusText = "Syncing Cloud Database...";
  if (loadingProgress > 85) statusText = "Preparing Your VIP Dashboard...";
  if (loadingProgress === 100) statusText = "Access Granted! 🚀";

  return (
    <TelegramContext.Provider value={{ user, setUser }}>
      <AnimatePresence>
        {!isReady && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-[#05030A] text-white px-6 py-12 select-none overflow-hidden"
          >
            {/* --- AMBIENT BACKGROUND & PARTICLES --- */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-[#6200EA]/20 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
              <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-[#00E5FF]/15 rounded-full blur-[100px] mix-blend-screen"></div>
              
              {/* Floating Light Orbs */}
              <motion.div animate={{ y: [-20, 20, -20], x: [-10, 10, -10], opacity: [0.3, 0.8, 0.3] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute top-[30%] left-[20%] w-2 h-2 bg-cyan-300 rounded-full blur-[2px]"></motion.div>
              <motion.div animate={{ y: [20, -20, 20], x: [15, -15, 15], opacity: [0.2, 0.6, 0.2] }} transition={{ repeat: Infinity, duration: 5, delay: 1 }} className="absolute top-[60%] right-[25%] w-3 h-3 bg-purple-400 rounded-full blur-[3px]"></motion.div>
            </div>

            {/* --- TOP BRANDING --- */}
            <motion.div 
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center mt-10 z-10"
            >
              <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-cyan-200 drop-shadow-lg">
                CANVA PRO APP
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-purple-500"></span>
                <p className="text-[9px] font-bold text-purple-300 tracking-[0.3em] uppercase">
                  VIP Access
                </p>
                <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-cyan-500"></span>
              </div>
            </motion.div>

            {/* --- CENTER HOLOGRAPHIC SPINNER --- */}
            <motion.div 
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2, type: "spring" }}
              className="relative flex flex-col items-center justify-center z-10 my-auto"
            >
              <div className="relative w-36 h-36 flex items-center justify-center">
                
                {/* Outer Dashed Orbit */}
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                  className="absolute inset-0 rounded-full border border-dashed border-white/20"
                />

                {/* Middle Fast Gradient Ring */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute inset-2 rounded-full border-2 border-transparent border-t-[#00E5FF] border-b-[#6200EA] opacity-80"
                />
                
                {/* Inner Glowing Core */}
                <div className="absolute inset-6 rounded-full bg-gradient-to-tr from-[#6200EA]/20 to-[#00E5FF]/20 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(98,0,234,0.3)]">
                  <motion.div 
                    animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="text-4xl drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]"
                  >
                    👑
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* --- BOTTOM PROGRESS SYSTEM --- */}
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="w-full max-w-[280px] z-10 mb-8"
            >
              {/* Dynamic Text */}
              <div className="text-center mb-4">
                <p className="text-[11px] font-bold text-cyan-100 tracking-wider uppercase drop-shadow-md">
                  {statusText}
                </p>
              </div>

              {/* Progress Bar Container */}
              <div className="relative w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner">
                {/* Glowing Progress Fill */}
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#6200EA] via-[#9D4EDD] to-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.8)]"
                  animate={{ width: `${Math.min(loadingProgress, 100)}%` }}
                  transition={{ ease: "easeOut", duration: 0.3 }}
                />
              </div>

              {/* Data readout */}
              <div className="flex justify-between items-center mt-2 px-1">
                <span className="text-[8px] text-white/40 font-mono tracking-widest">
                  SYS.SYNC
                </span>
                <span className="text-[10px] font-black font-mono text-cyan-300">
                  {Math.round(Math.min(loadingProgress, 100))}%
                </span>
              </div>
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