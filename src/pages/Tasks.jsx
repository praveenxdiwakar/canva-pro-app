import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTelegram } from '../contexts/TelegramContext';
import { motion } from 'framer-motion';

export default function Tasks() {
  const { initData } = useTelegram();
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch Step Progress
  const { data: stepData } = useQuery({
    queryKey: ['steps'],
    queryFn: async () => {
      const res = await fetch('/api/tasks/home-ad-step', { headers: { 'x-init-data': initData } });
      return res.ok ? res.json() : null;
    },
    enabled: !!initData
  });

  const allComplete = stepData?.allComplete ?? false;

  const { data: canvaLinkData } = useQuery({
    queryKey: ['canva-link'],
    queryFn: async () => {
      const res = await fetch('/api/users/canva-link', { headers: { 'x-init-data': initData } });
      return res.ok ? res.json() : null;
    },
    enabled: !!initData && allComplete
  });

  const handleCopy = (link) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
    }
  };

  const steps = stepData?.steps ?? [
    { id: 1, completed: false }, 
    { id: 2, completed: false },
    { id: 3, completed: false }, 
    { id: 4, completed: false }
  ];

  return (
    <div className="flex flex-col min-h-[calc(100dvh-5rem)] bg-[#f5f5f5]">
      {/* Sleek Gradient Banner Header */}
      <div 
        className="w-full h-44 flex flex-col items-center justify-center text-white shadow-md relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)' }}
      >
        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-2 shadow-inner">
          <span className="text-3xl font-black italic select-none" style={{ fontFamily: 'Georgia, serif' }}>C</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight drop-shadow-sm">Canva Pro Team</h1>
        <p className="text-xs text-white/80 font-medium">Unlock full access in 4 simple steps</p>
      </div>
      
      <div className="px-4 pt-4 pb-24 space-y-4">
        {/* Info Banner */}
        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3.5 flex items-start gap-3 shadow-sm">
          <span className="text-xl">📢</span>
          <p className="text-[13px] text-gray-600 leading-snug font-medium">
            Complete all 4 steps below to unlock the official Canva Pro Team invite button.
          </p>
        </div>

        {/* 4 Steps Card */}
        <motion.div 
          initial={{ opacity: 0, y: 8 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-5"
        >
          {/* Progress Indicator */}
          <div className="flex items-center justify-between px-2">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${step.completed ? 'bg-purple-600 text-white shadow-md shadow-purple-200' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                    {step.completed ? '✓' : step.id}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">Step {step.id}</span>
                </div>
                {index !== steps.length - 1 && (
                  <div className="flex-1 h-[3px] mx-2 -mt-4 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 transition-all duration-500" style={{ width: step.completed ? '100%' : '0%' }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Button */}
          {allComplete ? (
            <div className="space-y-3 pt-2">
              <button 
                onClick={() => window.open(canvaLinkData?.link, '_blank')} 
                className="w-full bg-green-500 hover:bg-green-600 active:scale-[0.98] text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2 text-base"
              >
                🎉 Click to Open Canva Pro
              </button>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2">
                <p className="text-xs text-gray-500 text-center font-medium">Or copy the link manually into your browser:</p>
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-2">
                  <span className="flex-1 text-xs text-gray-600 truncate font-mono px-1">{canvaLinkData?.link || "https://canva.com/brand/join?token=..."}</span>
                  <button 
                    onClick={() => handleCopy(canvaLinkData?.link || "")} 
                    className="bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-all shrink-0"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button 
              disabled={isWatchingAd} 
              className="w-full bg-[#6200EA] hover:bg-[#4A00B4] active:scale-[0.98] disabled:opacity-60 text-white font-black text-lg py-5 rounded-2xl shadow-xl shadow-purple-200 transition-all flex items-center justify-center gap-2"
            >
              {isWatchingAd ? "Loading Ad..." : "Watch Ads to Unlock Canva Pro"}
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}