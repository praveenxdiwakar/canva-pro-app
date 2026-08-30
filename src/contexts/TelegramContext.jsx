import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { syncUser } from '../api/tasks';
import { supabase } from '../api/supabase';

const TelegramContext = createContext({});

export function TelegramProvider({ children }) {
  const tg = window.Telegram?.WebApp;
  const tgUser = tg?.initDataUnsafe?.user;
  
  // 🚨 BROWSER BLOCKER 🚨
  const isBrowser = !tgUser?.id && !import.meta.env.DEV;

  if (isBrowser) {
    return (
      <div className="min-h-[100dvh] bg-[#F3F4F6] flex flex-col items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100 max-w-sm w-full text-center">
          {/* Professional SVG Warning Icon */}
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h1 className="text-xl font-black text-gray-900 mb-2 tracking-tight">
            Telegram Required
          </h1>
          <p className="text-[13px] text-gray-500 font-medium mb-8 leading-relaxed">
            This mini app is securely linked to Telegram. Please open it directly through our official bot.
          </p>

          <a 
            href="https://telegram.me/CanvaProMiniApp" 
            className="block w-full bg-[#2481cc] hover:bg-[#1d6ba8] active:scale-[0.98] transition-all text-white font-bold py-3.5 rounded-xl shadow-md"
          >
            Open in Telegram
          </a>
        </div>
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

    // Snappy, realistic loading progress
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15; 
      });
    }, 100);

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
      }, 300); // Quick fade out for a snappy app feel
    });
  }, []);

  let statusText = "Connecting...";
  if (loadingProgress > 40) statusText = "Syncing profile...";
  if (loadingProgress > 80) statusText = "Ready";

  return (
    <TelegramContext.Provider value={{ user, setUser }}>
      <AnimatePresence>
        {!isReady && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F9FAFB]"
          >
            {/* Clean, Modern Spinner */}
            <div className="relative w-14 h-14 mb-6">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-full h-full rounded-full border-[3px] border-gray-200 border-t-[#6200EA]"
              />
            </div>
            
            <h1 className="text-lg font-black text-gray-900 tracking-tight mb-1">
              Canva Pro App
            </h1>
            <p className="text-[13px] font-medium text-gray-500">
              {statusText}
            </p>

            {/* Minimalist Progress Bar */}
            <div className="w-48 h-1 bg-gray-200 rounded-full mt-6 overflow-hidden">
              <motion.div 
                className="h-full bg-[#6200EA]"
                animate={{ width: `${loadingProgress}%` }}
                transition={{ ease: "easeOut", duration: 0.2 }}
              />
            </div>
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