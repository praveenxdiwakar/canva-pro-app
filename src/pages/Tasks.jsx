import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTelegram } from '../contexts/TelegramContext';
import { motion } from 'framer-motion';

export default function Tasks() {
  const { initData } = useTelegram();
  const queryClient = useQueryClient();
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

  // Fetch Canva Link if all steps are complete
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
    { id: 1, completed: false }, { id: 2, completed: false },
    { id: 3, completed: false }, { id: 4, completed: false }
  ];

  return (
    <div className="flex flex-col min-h-[calc(100dvh-5rem)] bg-[#f5f5f5]">
      <div className="relative w-full h-40 overflow-hidden">
        <img src="/banner.jpg" alt="Canva Pro" className="w-full h-full object-cover" />
      </div>
      
      <div className="px-4 pt-4 pb-24 space-y-3">
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-start gap-2 shadow-sm">
          <span className="text-lg mt-0.5">📢</span>
          <p className="text-[13px] text-gray-600 leading-snug">
            Complete 4 Steps, the Canva Pro button will be unlocked. Then click again to open Canva Pro.
          </p>
        </div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl px-4 py-4 border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white ${step.completed ? 'bg-purple-600' : 'bg-gray-200 text-gray-400'}`}>
                  {step.completed ? '✓' : step.id}
                </div>
                {index !== steps.length - 1 && (
                  <div className="flex-1 h-[2px] mx-2 bg-gray-200">
                    <div className="h-full bg-purple-600 transition-all" style={{ width: step.completed ? '100%' : '0%' }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {allComplete ? (
            <div className="space-y-3 mt-4">
              <button onClick={() => window.open(canvaLinkData?.link, '_blank')} className="w-full bg-green-500 text-white font-bold py-4 rounded-xl">
                🎉 Click to Open Canva Pro
              </button>
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 space-y-2">
                <p className="text-[13px] text-gray-600 text-center">Copy Canva Pro link and paste it in your browser:</p>
                <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2">
                  <span className="flex-1 text-xs text-gray-500 truncate">{canvaLinkData?.link || "Loading..."}</span>
                  <button onClick={() => handleCopy(canvaLinkData?.link)} className="bg-cyan-500 text-white text-xs font-bold px-3 py-1.5 rounded-md">
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button disabled={isWatchingAd} className="w-full bg-[#6200EA] text-white font-black text-xl py-7 rounded-xl mt-4">
              {isWatchingAd ? "Loading Ad..." : "Watch Ads to Unlock Canva Pro"}
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}