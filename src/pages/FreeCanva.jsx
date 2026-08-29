import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTelegram } from '../contexts/TelegramContext';
import { motion } from 'framer-motion';

export default function FreeCanva() {
  const { initData } = useTelegram();
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Fetch Step Progress
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

  // Calculate completed steps for the connecting line width
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
      {/* Banner */}
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
        {/* Info Text */}
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-start gap-2 shadow-sm">
          <span className="text-lg mt-0.5">📢</span>
          <p className="text-[13px] text-gray-600 leading-snug font-medium">
            Complete 4 Step, the Canva Pro button will be unlocked. Then click again to open Canva Pro.
          </p>
        </div>

        {/* Steps Card */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl px-4 py-6 border border-gray-100 shadow-sm space-y-6">
          
          {/* PERFECTLY CENTERED STEPPER */}
          <div className="relative flex justify-between items-start w-full max-w-[260px] mx-auto">
            {/* Background Line */}
            <div className="absolute top-[18px] left-[10%] right-[10%] h-[2px] bg-gray-200 z-0">
              <div 
                className="h-full bg-[#6200EA] transition-all duration-500" 
                style={{ width: `${progressPercentage}%` }} 
              />
            </div>

            {/* Step Circles */}
            {steps.map((step, index) => {
              const isActive = !step.completed && (index === 0 || steps[index - 1].completed);
              return (
                <div key={index} className="flex flex-col items-center z-10 w-12">
                  <div className="bg-white p-1 rounded-full">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition-all"
                      style={
                        step.completed 
                          ? { backgroundColor: "#6200EA", color: "#fff", boxShadow: "0 3px 8px #6200EA66" }
                          : isActive
                            ? { backgroundColor: "#fff", border: "2px solid #6200EA", color: "#6200EA" }
                            : { backgroundColor: "#f3f4f6", border: "2px solid #e5e7eb", color: "#9ca3af" }
                      }
                    >
                      {step.completed ? "✓" : step.id}
                    </div>
                  </div>
                  <span 
                    className="text-[10px] font-bold mt-1"
                    style={{ color: step.completed ? "#6200EA" : isActive ? "#374151" : "#9ca3af" }}
                  >
                    Step {step.id}
                  </span>
                </div>
              );
            })}
          </div>

          <button 
            disabled={isWatchingAd || countdown > 0}
            className="w-full bg-[#6200EA] hover:bg-[#4A00B4] active:scale-[0.98] disabled:opacity-60 text-white font-black text-[17px] py-4 rounded-xl shadow-md shadow-purple-100 transition-all flex items-center justify-center gap-2"
          >
            {isWatchingAd ? "Loading Ad…" : countdown > 0 ? `⏳ Wait ${countdown}s…` : "Watch Ads to Unlock Canva Pro"}
          </button>
        </motion.div>

        {/* Action Buttons */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }} className="bg-white rounded-2xl px-4 py-4 border border-gray-100 shadow-sm space-y-3">
          <button onClick={() => handleLink('https://t.me/ShareCanvaProFree')} className="w-full hover:opacity-90 active:scale-[0.98] text-white font-bold text-base py-4 rounded-xl shadow-md shadow-purple-100 transition-all flex items-center justify-center gap-2.5" style={{ background: "linear-gradient(90deg, #6704E3, #8B22AF)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="white" fillOpacity="0.25"/>
            </svg>
            Join Channel
          </button>
          <button onClick={() => handleLink('https://t.me/sharecanvaprofree_group')} className="w-full hover:opacity-90 active:scale-[0.98] text-white font-bold text-base py-4 rounded-xl shadow-md shadow-purple-100 transition-all flex items-center justify-center gap-2.5" style={{ background: "linear-gradient(90deg, #6704E3, #8B22AF)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="9" cy="7" r="3" fill="white" fillOpacity="0.9"/>
              <circle cx="17" cy="8" r="2.5" fill="white" fillOpacity="0.6"/>
              <path d="M2 20C2 16.686 5.134 14 9 14C12.866 14 16 16.686 16 20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M16 14C18.761 14 21 16.239 21 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7"/>
            </svg>
            Join Group
          </button>
          <button onClick={() => handleLink('https://t.me/ShareCanvaProFree')} className="w-full bg-gray-50 border border-gray-200 hover:bg-gray-100 active:scale-[0.98] text-gray-700 font-semibold text-base py-4 rounded-xl transition-all flex items-center justify-center gap-2">
            How to join Canva Pro 🌿
          </button>
        </motion.div>

        {/* What You Get Card */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="bg-white rounded-2xl px-4 py-5 border border-gray-100 shadow-sm">
          <div className="text-center mb-4">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">WHAT YOU GET</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-purple-50 rounded-xl p-2.5 text-center border border-purple-100/50">
              <div className="text-xl mb-1.5">🎨</div>
              <div className="text-[10px] font-black text-purple-700 leading-tight">Premium<br/>Templates</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-2.5 text-center border border-amber-100/50">
              <div className="text-xl mb-1.5">✨</div>
              <div className="text-[10px] font-black text-amber-700 leading-tight">Magic AI<br/>Tools</div>
            </div>
            <div className="bg-green-50 rounded-xl p-2.5 text-center border border-green-100/50">
              <div className="text-xl mb-1.5">🆓</div>
              <div className="text-[10px] font-black text-green-700 leading-tight">100%<br/>Free</div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-medium text-gray-500">
            <span>🔒</span>
            <span>No payment required</span>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center pt-2 pb-4 space-y-1">
          <button className="text-[13px] text-[#6200EA] font-bold hover:underline">by H2N</button>
          <div className="text-[11px] text-gray-400 font-medium">@ShareCanvaProFree_Bot</div>
        </div>
      </div>
    </div>
  );
}