import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../api/supabase';

export default function FreeCanva() {
  const [currentStep, setCurrentStep] = useState(1);
  const [canvaLink, setCanvaLink] = useState(null);
  const [adZone, setAdZone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Custom Modals
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });
  const [celebration, setCelebration] = useState({ isOpen: false, message: "", link: "" });

  useEffect(() => {
    supabase.from('canva_links').select('*').then(({ data }) => {
      if (data && data.length > 0) {
        const available = data.find(l => l.used_slots < l.total_slots);
        if (available) setCanvaLink(available.url || available.invitelink);
      }
    });

    supabase.from('app_settings').select('value').eq('key', 'MONETAG_ZONE_ID').maybeSingle().then(({data}) => {
      if (data && data.value) {
        const zoneId = data.value;
        setAdZone(zoneId);
        if (!document.getElementById(`monetag-sdk-${zoneId}`)) {
          const script = document.createElement('script');
          script.id = `monetag-sdk-${zoneId}`;
          script.src = '//libtl.com/sdk.js';
          script.setAttribute('data-zone', zoneId);
          script.setAttribute('data-sdk', `show_${zoneId}`);
          script.defer = true;
          document.head.appendChild(script);
        }
      }
    });
  }, []);

  const progressPercentage = Math.min(100, ((currentStep - 1) / 3) * 100);

  const openExternalLink = (url) => {
    const tg = window.Telegram?.WebApp;
    if (tg && tg.openLink) {
      tg.openLink(url);
    } else {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.click();
    }
  };

  const handleMainAction = () => {
    if (currentStep > 4) {
      if (canvaLink) {
        // Trigger WOO HOO Celebration instead of directly opening!
        setCelebration({ isOpen: true, message: "You completed all steps! Here is your Free Canva Pro access.", link: canvaLink });
      } else {
        setErrorModal({ isOpen: true, message: "All current Canva Pro slots are full! Check back soon or earn points in the Tasks tab." });
      }
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);

    const adFunctionName = `show_${adZone}`;
    if (adZone && typeof window[adFunctionName] === "function") {
      window[adFunctionName]()
        .then(() => {
          setCurrentStep(prev => prev + 1);
          setIsProcessing(false);
        })
        .catch(() => {
          setErrorModal({ isOpen: true, message: "Ad failed to load. Please disable ad-blockers and try again." });
          setIsProcessing(false);
        });
    } else {
      const adUrl = adZone ? `https://go.oclasrv.com/afu.php?zoneid=${adZone}` : "https://monetag.com";
      openExternalLink(adUrl);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsProcessing(false);
      }, 6000); 
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100dvh-5rem)] bg-[#f5f5f5] pb-24 relative">
      <div className="relative w-full h-[170px] overflow-hidden bg-gray-900 shadow-sm">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gradient-to-br from-[#7c3aed] via-[#6366f1] to-[#06b6d4] z-20">
          <h1 className="text-5xl font-black italic tracking-tighter drop-shadow-lg" style={{ fontFamily: 'Georgia, serif' }}>Canva</h1>
          <div className="mt-2 bg-black/20 px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm">
             <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">Pro Access • 100% Free</span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-4 space-y-3 -mt-4 relative z-30">
        <div className="bg-white border border-gray-100 rounded-[20px] px-4 py-3.5 flex items-start gap-3 shadow-sm">
          <span className="text-xl mt-0.5">📢</span>
          <p className="text-[12px] text-gray-600 leading-snug font-medium">Complete the 4 steps below to unlock your free Canva Pro access button.</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[24px] px-5 py-6 border border-gray-100 shadow-sm space-y-6">
          <div className="relative w-full max-w-[280px] mx-auto mt-2 mb-4">
            <div className="absolute top-[18px] left-[10%] right-[10%] h-[4px] bg-gray-100 z-0 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 transition-all duration-700 ease-out rounded-full" style={{ width: `${progressPercentage}%` }} />
            </div>
            <div className="relative z-10 flex justify-between items-start w-full">
              {[1, 2, 3, 4].map((stepNum) => {
                const isCompleted = currentStep > stepNum;
                const isActive = currentStep === stepNum;
                return (
                  <div key={stepNum} className="flex flex-col items-center w-12">
                    <div className="bg-white p-1 rounded-full mb-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300 shadow-sm ${isCompleted ? "bg-green-500 text-white border-2 border-green-500" : isActive ? "bg-white border-[3px] border-[#6200EA] text-[#6200EA] shadow-md scale-110" : "bg-gray-50 border-2 border-gray-200 text-gray-300"}`}>
                        {isCompleted ? "✓" : stepNum}
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold text-center ${isCompleted ? "text-green-600" : isActive ? "text-gray-800" : "text-gray-400"}`}>Step {stepNum}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <button onClick={handleMainAction} disabled={isProcessing} className={`w-full text-white font-black text-[14px] py-4 rounded-2xl shadow-md transition-all active:scale-95 flex justify-center items-center gap-2 ${currentStep > 4 ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 animate-pulse" : isProcessing ? "bg-gray-400 cursor-not-allowed" : "bg-[#6200EA] hover:bg-[#5000c9]"}`}>
            {currentStep > 4 ? <><span>🎁</span> UNLOCK CANVA PRO</> : isProcessing ? <><span>⏳</span> Waiting for Ad...</> : <><span>📺</span> Watch Ad for Step {currentStep}</>}
          </button>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 mt-2">
          <button onClick={() => openExternalLink('https://t.me/yourchannel')} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 rounded-[16px] shadow-sm flex justify-center items-center gap-2 active:scale-95 transition-transform text-[12px]"><span className="text-[16px]">📢</span> Join Channel</button>
          <button onClick={() => openExternalLink('https://t.me/yourgroup')} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 rounded-[16px] shadow-sm flex justify-center items-center gap-2 active:scale-95 transition-transform text-[12px]"><span className="text-[16px]">👥</span> Join Group</button>
        </div>

      </div>

      {/* --- CUSTOM MODALS --- */}
      <AnimatePresence>
        {errorModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="text-lg font-black text-gray-900 mb-2">Oops!</h3>
              <p className="text-sm text-gray-500 font-medium mb-6">{errorModal.message}</p>
              <button onClick={() => setErrorModal({ isOpen: false, message: "" })} className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl text-sm active:scale-95 shadow-md">Got it</button>
            </motion.div>
          </div>
        )}

        {/* WOO HOO CELEBRATION MODAL */}
        {celebration.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
               <div className="absolute top-10 left-10 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
               <div className="absolute top-20 right-20 w-3 h-3 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '0.2s'}}></div>
               <div className="absolute bottom-40 left-20 w-5 h-5 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '0.5s'}}></div>
               <div className="absolute bottom-20 right-10 w-4 h-4 bg-green-500 rounded-full animate-ping" style={{ animationDelay: '0.7s'}}></div>
            </div>

            <motion.div initial={{ scale: 0.5, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: "spring", bounce: 0.6 }} className="bg-gradient-to-b from-purple-500 to-indigo-600 rounded-[32px] p-8 w-full max-w-sm shadow-2xl text-center relative overflow-hidden border-4 border-white/20">
              <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-7xl mb-4 drop-shadow-2xl">🎉</motion.div>
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight drop-shadow-md">WOO HOO!</h2>
              <p className="text-purple-100 font-medium mb-6 text-sm leading-relaxed">{celebration.message}</p>
              
              <div className="bg-black/20 rounded-2xl p-4 mb-6 backdrop-blur-sm border border-white/10">
                 <div className="text-[10px] text-purple-200 font-bold uppercase tracking-widest mb-1">Your Pro Link is Ready</div>
                 <div className="text-white font-black text-lg">Click below to activate!</div>
              </div>

              <div className="space-y-3 relative z-10">
                <button onClick={() => openExternalLink(celebration.link)} className="w-full bg-white text-purple-700 font-black py-4 rounded-xl text-[15px] active:scale-95 shadow-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                  <span className="text-xl">👑</span> OPEN CANVA PRO
                </button>
                <button onClick={() => setCelebration({ isOpen: false, message: "", link: "" })} className="w-full bg-transparent border-2 border-white/30 text-white font-bold py-3 rounded-xl text-sm active:scale-95 transition-colors hover:bg-white/10">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}