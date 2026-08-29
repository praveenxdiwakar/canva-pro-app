import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTelegram } from '../contexts/TelegramContext';
import { motion } from 'framer-motion';

export default function FreeCanva() {
  const { initData } = useTelegram();
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { data: stepData } = useQuery({
    queryKey: ['steps'],
    queryFn: async () => {
      const res = await fetch('/api/tasks/home-ad-step', { headers: { 'x-init-data': initData } });
      return res.ok ? res.json() : null;
    },
    enabled: !!initData
  });

  const steps = stepData?.steps ?? [
    { id: 1, completed: false }, 
    { id: 2, completed: false },
    { id: 3, completed: false }, 
    { id: 4, completed: false }
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progressPercentage = Math.min(100, Math.max(0, (completedCount / (steps.length - 1)) * 100));

  const handleLink = (url) => {
    if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100dvh-5rem)] bg-[#f5f5f5] pb-24">
      <div className="relative w-full h-44 overflow-hidden bg-gray-900">
        <img 
          src="/banner.jpg" 
          alt="Canva Pro" 
          className="absolute inset-0 w-full h-full object-cover object-center z-10" 
          onError={(e) => e.target.style.display = 'none'}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)' }}>
          <h1 className="text-4xl font-black italic tracking-tighter drop-shadow-md" style={{ fontFamily: 'Georgia, serif' }}>Canva</h1>
        </div>
      </div>

      <div className="px-4 pt-4 pb-4 space-y-3">
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-start gap-2 shadow-sm">
          <span className="text-lg mt-0.5">📢</span>
          <p className="text-[13px] text-gray-600 leading-snug font-medium">
            Complete 4 Step, the Canva Pro button will be unlocked. Then click again to open Canva Pro.
          </p>
        </div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl px-4 py-6 border border-gray-100 shadow-sm space-y-6">
          <div className="relative w-full max-w-[260px] mx-auto mt-2 mb-2">
            <div className="absolute top-[18px] left-[12%] right-[12%] h-[3px] bg-gray-200 z-0 rounded-full">
              <div className="h-full bg-[#6200EA] transition-all duration-500 rounded-full" style={{ width: `${progressPercentage}%` }} />
            </div>

            <div className="relative z-10 flex justify-between items-start w-full">
              {steps.map((step, index) => {
                const isActive = !step.completed && (index === 0 || steps[index - 1].completed);
                return (
                  <div key={index} className="flex flex-col items-center w-14">
                    <div className="bg-white p-1 rounded-full mb-1">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition-all ${
                          step.completed 
                            ? "bg-[#6200EA] text-white shadow-[0_3px_8px_rgba(98,0,234,0.4)]" 
                            : isActive
                              ? "bg-white border-[2.5px] border-[#6200EA] text-[#6200EA]"
                              : "bg-gray-100 border-[2.5px] border-gray-200 text-gray-400"
                        }`}
                      >
                        {step.completed ? "✓" : step.id}
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold text-center ${step.completed ? "text-[#6200EA]" : isActive ? "text-gray-700" : "text-gray-400"}`}>
                      Step {step.id}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <button disabled={isWatchingAd || countdown > 0} className="w-full bg-[#6200EA] hover:bg-[#4A00B4] active:scale-[0.98] disabled:opacity-60 text-white font-black text-[17px] py-4 rounded-xl shadow-md shadow-purple-100 transition-all flex items-center justify-center gap-2">
            {isWatchingAd ? "Loading Ad…" : countdown > 0 ? `⏳ Wait ${countdown}s…` : "Watch Ads to Unlock Canva Pro"}
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }} className="bg-white rounded-2xl px-4 py-4 border border-gray-100 shadow-sm space-y-3">
          <button onClick={() => handleLink('https://t.me/ShareCanvaProFree')} className="w-full hover:opacity-90 active:scale-[0.98] text-white font-bold text-base py-4 rounded-xl shadow-md shadow-purple-100 transition-all flex items-center justify-center gap-2.5" style={{ background: "linear-gradient(90deg, #6704E3, #8B22AF)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="white" fillOpacity="0.25"/></svg>
            Join Channel
          </button>
          <button onClick={() => handleLink('https://t.me/sharecanvaprofree_group')} className="w-full hover:opacity-90 active:scale-[0.98] text-white font-bold text-base py-4 rounded-xl shadow-md shadow-purple-100 transition-all flex items-center justify-center gap-2.5" style={{ background: "linear-gradient(90deg, #6704E3, #8B22AF)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="7" r="3" fill="white" fillOpacity="0.9"/><circle cx="17" cy="8" r="2.5" fill="white" fillOpacity="0.6"/><path d="M2 20C2 16.686 5.134 14 9 14C12.866 14 16 16.686 16 20" stroke="white" strokeWidth="2" strokeLinecap="round"/><path d="M16 14C18.761 14 21 16.239 21 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7"/></svg>
            Join Group
          </button>
          <button onClick={() => handleLink('https://t.me/ShareCanvaProFree')} className="w-full bg-gray-50 border border-gray-200 hover:bg-gray-100 active:scale-[0.98] text-gray-700 font-semibold text-base py-4 rounded-xl transition-all flex items-center justify-center gap-2">
            How to join Canva Pro 🌿
          </button>
        </motion.div>
      </div>
    </div>
  );
}