import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../api/supabase';
import { useTelegram } from '../contexts/TelegramContext';

export default function FreeCanva() {
  const { user } = useTelegram();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [canvaLink, setCanvaLink] = useState(null);
  const [adZone, setAdZone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Premium Subscription Status
  const [activeSub, setActiveSub] = useState(null);
  const [loadingSub, setLoadingSub] = useState(true);

  useEffect(() => {
    // 1. Check if the user has an active 7, 15, or 30-day Premium Subscription
    if (user?.telegramId) {
      supabase
        .from('redemptions')
        .select('*')
        .eq('telegram_id', String(user.telegramId))
        .gte('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: false })
        .then(({ data }) => {
          if (data && data.length > 0) {
            setActiveSub(data[0].invite_link); // User is Premium!
          }
          setLoadingSub(false);
        });
    } else {
      setLoadingSub(false);
    }

    // 2. Fetch available Free Canva link
    supabase.from('canva_links').select('*').then(({ data }) => {
      if (data && data.length > 0) {
        const available = data.find(l => l.used_slots < l.total_slots);
        if (available) setCanvaLink(available.url || available.invitelink);
      }
    });

    // 3. Fetch Ad Zone & Inject Monetag SDK
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
  }, [user?.telegramId]);

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
          alert("⚠️ Ad failed to load. Please disable ad-blockers and try again.");
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
      
      {/* Dynamic Header Banner */}
      <div className="relative w-full h-[170px] overflow-hidden bg-gray-900 shadow-sm">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gradient-to-br from-[#7c3aed] via-[#6366f1] to-[#06b6d4] z-20">
          <h1 className="text-5xl font-black italic tracking-tighter drop-shadow-lg" style={{ fontFamily: 'Georgia, serif' }}>Canva</h1>
          <div className="mt-2 bg-black/20 px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm">
             <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">Pro Access • 100% Free</span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-4 space-y-3 -mt-4 relative z-30">
        
        {loadingSub ? (
          <div className="bg-white rounded-[24px] p-6 text-center text-gray-400 font-bold shadow-sm">Loading Access...</div>
        ) : activeSub ? (
          
          /* ========================================================= */
          /* 💎 VIP PREMIUM CARD (Bypasses Ads for Subscribed Users!) */
          /* ========================================================= */
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-[#FFD700] to-[#FF8C00] rounded-[24px] px-5 py-8 border border-yellow-300 shadow-lg text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 text-8xl opacity-20">👑</div>
            <h2 className="text-2xl font-black text-white mb-2 drop-shadow-sm relative z-10">Premium Unlocked!</h2>
            <p className="text-yellow-50 font-bold mb-6 text-sm relative z-10 px-2">Because you redeemed points, you have UNLIMITED ad-free access anytime.</p>
            <button onClick={() => openExternalLink(activeSub)} className="w-full bg-white text-orange-600 font-black text-[15px] py-4 rounded-2xl shadow-xl active:scale-95 transition-transform flex justify-center items-center gap-2 relative z-10">
              <span className="text-xl">✨</span> OPEN CANVA PRO
            </button>
          </motion.div>

        ) : (

          /* ========================================================= */
          /* 📺 FREE USER CARD (Requires the 4 Ads)                    */
          /* ========================================================= */
          <>
            <div className="bg-white border border-gray-100 rounded-[20px] px-4 py-3.5 flex items-start gap-3 shadow-sm">
              <span className="text-xl mt-0.5">📢</span>
              <p className="text-[12px] text-gray-600 leading-snug font-medium">Complete the 4 steps below to unlock your free Canva Pro access button.</p>
            </div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[24px] px-5 py-6 border border-gray-100 shadow-sm">
              
              {currentStep > 4 ? (
                
                /* 🎉 INLINE WOO HOO ANIMATION (NO POPUP!) 🎉 */
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-4 relative">
                  <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-6xl mb-4">
                    🎉
                  </motion.div>
                  <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#6200EA] to-[#00E5FF] mb-2 uppercase tracking-wide">
                    Woo Hoo!
                  </h2>
                  <p className="text-gray-500 font-bold mb-6 text-sm">
                    You completed all steps! Here is your link.
                  </p>
                  <button 
                    onClick={() => {
                      if (canvaLink) openExternalLink(canvaLink);
                      else alert("All slots full!");
                    }} 
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-black text-[15px] py-4 rounded-2xl shadow-xl active:scale-95 transition-transform flex justify-center items-center gap-2"
                  >
                    <span className="text-xl">👑</span> OPEN CANVA PRO
                  </button>
                </motion.div>

              ) : (

                /* 🟢 4-STEP PROGRESS UI */
                <div className="space-y-6">
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

                  <button onClick={handleMainAction} disabled={isProcessing} className={`w-full text-white font-black text-[14px] py-4 rounded-2xl shadow-md transition-all active:scale-95 flex justify-center items-center gap-2 ${isProcessing ? "bg-gray-400 cursor-not-allowed" : "bg-[#6200EA] hover:bg-[#5000c9]"}`}>
                    {isProcessing ? <><span>⏳</span> Waiting for Ad...</> : <><span>📺</span> Watch Ad for Step {currentStep}</>}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}

        {/* COMPACT Social / Join Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <button onClick={() => openExternalLink('https://t.me/yourchannel')} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 rounded-[16px] shadow-sm flex justify-center items-center gap-2 active:scale-95 transition-transform text-[12px]"><span className="text-[16px]">📢</span> Join Channel</button>
          <button onClick={() => openExternalLink('https://t.me/yourgroup')} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 rounded-[16px] shadow-sm flex justify-center items-center gap-2 active:scale-95 transition-transform text-[12px]"><span className="text-[16px]">👥</span> Join Group</button>
        </div>
        
        <button className="w-full bg-white border-2 border-dashed border-gray-200 text-gray-500 font-bold py-3 rounded-[16px] text-[12px] flex justify-center items-center gap-1.5 active:bg-gray-50 transition-colors">
          How to join Canva Pro <span className="text-[14px]">🌿</span>
        </button>

      </div>
    </div>
  );
}