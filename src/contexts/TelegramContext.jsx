import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { syncUser } from '../api/tasks';
import { supabase } from '../api/supabase';

const TelegramContext = createContext({});

export function TelegramProvider({ children }) {
  const tg = window.Telegram?.WebApp;
  const tgUser = tg?.initDataUnsafe?.user;
  
  const startParam = tg?.initDataUnsafe?.start_param || null; 

  // Grab the EXACT Telegram data (including last_name and username)
  const initialUser = {
    telegramId: tgUser?.id ? String(tgUser.id) : (import.meta.env.VITE_ADMIN_TELEGRAM_ID || "5589713552"),
    firstName: tgUser?.first_name || "User",
    lastName: tgUser?.last_name || "",
    username: tgUser?.username || "", // <-- Grabs real @username
    photoUrl: tgUser?.photo_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    points: 0, 
    streak: 0,
    last_checkin: null
  };

  const [user, setUser] = useState(initialUser);
  const [isReady, setIsReady] = useState(false); 

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }

    const tgIdStr = String(initialUser.telegramId);

    // Grab emergency local backups
    const localPts = parseInt(localStorage.getItem(`canva_pts_${tgIdStr}`)) || 0;
    const localStreak = parseInt(localStorage.getItem(`canva_streak_${tgIdStr}`)) || 0;
    const localDate = localStorage.getItem(`canva_date_${tgIdStr}`);

    syncUser(initialUser, startParam).then(dbUser => {
      if (dbUser) {
        // SMART AUTO-HEAL: Take the higher value between Cloud and Local Backup
        const finalPoints = Math.max(dbUser.points || 0, localPts);
        const finalStreak = Math.max(dbUser.streak || 0, localStreak);
        const finalDate = dbUser.last_checkin || localDate || null;

        setUser(prev => ({ 
          ...prev, 
          points: finalPoints,
          streak: finalStreak,
          last_checkin: finalDate
        }));

        // If Local Backup was higher, force re-upload
        if (localPts > (dbUser.points || 0)) {
          supabase.from('users').update({ points: finalPoints }).eq('telegram_id', tgIdStr).then();
        }
      } else {
        setUser(prev => ({ ...prev, points: localPts, streak: localStreak, last_checkin: localDate }));
      }
      setIsReady(true); 
    });
  }, []);

  return (
    <TelegramContext.Provider value={{ user, setUser }}>
      {!isReady ? (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[#F9FAFB] relative overflow-hidden">
          
          {/* Subtle Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#6200EA]/10 rounded-full blur-[60px]"></div>
          
          <div className="relative flex flex-col items-center z-10">
            {/* Modern Gradient Spinner */}
            <div className="relative w-16 h-16 mb-6">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                className="absolute inset-0 rounded-full border-[4px] border-gray-200/50 border-t-[#6200EA] border-r-[#00E5FF] shadow-lg"
              />
              {/* Inner Sparkle Icon */}
              <div className="absolute inset-0 flex items-center justify-center text-xl drop-shadow-sm">
                ✨
              </div>
            </div>
            
            {/* Professional Typography */}
            <h2 className="text-[17px] font-black text-gray-800 mb-1.5 tracking-tight">
              Loading Profile
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] animate-pulse">
              Securely syncing...
            </p>
          </div>
          
        </div>
      ) : (
        children
      )}
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