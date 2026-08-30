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
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }

    // Elegant organic progress simulation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        // Random fluid increments
        return prev + (Math.random() * 10 + 2);
      });
    }, 150);

    const tgIdStr = String(initialUser.telegramId);
    const localPts = parseInt(localStorage.getItem(`canva_pts_${tgIdStr}`)) || 0;
    const localStreak = parseInt(localStorage.getItem(`canva_streak_${tgIdStr}`)) || 0;
    const localDate = localStorage.getItem(`canva_date_${tgIdStr}`);

    syncUser(initialUser, startParam).then(dbUser => {
      clearInterval(progressInterval);
      setProgress(100); // Snap to 100% on complete

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
      }, 500); // Allow progress bar to visually finish before dismissing
    });
  }, []);

  return (
    <TelegramContext.Provider value={{ user, setUser }}>
      <AnimatePresence>
        {!isReady && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FAFAFA]"
          >
            <div className="flex flex-col items-center justify-center flex-1 w-full max-w-sm px-8">
              
              {/* Premium iOS-style Icon Mark */}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="relative w-20 h-20 mb-8"
              >
                {/* Soft under-glow */}
                <div className="absolute inset-0 bg-[#6200EA] rounded-[22px] blur-xl opacity-20"></div>
                {/* Main Icon Container */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#6200EA] to-[#00C4CC] rounded-[22px] shadow-sm flex items-center justify-center overflow-hidden">
                   {/* Clean glass reflection overlay */}
                   <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent"></div>
                   <span className="text-3xl font-black text-white tracking-tighter mix-blend-overlay">CP</span>
                </div>
              </motion.div>

              {/* Clean Corporate Typography */}
              <motion.h1 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                className="text-[19px] font-bold text-gray-900 tracking-tight mb-1"
              >
                Canva Pro App
              </motion.div>
              
              <motion.div 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                className="flex items-center gap-2 mb-12"
              >
                <motion.div 
                  animate={{ opacity: [0.3, 1, 0.3] }} 
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} 
                  className="w-1.5 h-1.5 rounded-full bg-[#6200EA]" 
                />
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                  Authenticating
                </span>
              </motion.div>

              {/* Ultra-thin Elegant Progress Line */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="w-full max-w-[200px]"
              >
                <div className="h-[2px] w-full bg-gray-200/60 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-[#6200EA] to-[#00C4CC] rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "circOut", duration: 0.3 }}
                  />
                </div>
              </motion.div>

            </div>

            {/* Minimalist Footer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="pb-8 text-[9px] font-bold text-gray-300 uppercase tracking-widest"
            >
              Secured Connection
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