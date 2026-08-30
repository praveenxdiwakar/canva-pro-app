import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    // 1. Check for Active Premium Subscriptions (WITH LOCAL BACKUP)
    if (user?.telegramId) {
      const tgIdStr = String(user.telegramId);

      // --- INSTANT LOCAL LOAD ---
      const localPremium = localStorage.getItem(`canva_premium_${tgIdStr}`);
      if (localPremium) {
        const parsed = JSON.parse(localPremium);
        if (new Date(parsed.expires_at) > new Date()) {
          setActiveSub(parsed);
          setLoadingSub(false);
        }
      }

      // --- CLOUD SYNC ---
      supabase
        .from('redemptions')
        .select('*')
        .eq('telegram_id', tgIdStr)
        .gte('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: false })
        .then(({ data, error }) => {
          if (data && data.length > 0) {
            setActiveSub(data[0]);
            localStorage.setItem(`canva_premium_${tgIdStr}`, JSON.stringify(data[0]));
          } else if (!error && data?.length === 0) {
            setActiveSub(null);
            localStorage.removeItem(`canva_premium_${tgIdStr}`);
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

  // Premium Countdown Timer Logic
  useEffect(() => {
    if (!activeSub) return;
    const interval = setInterval(() => {
      const difference = new Date(activeSub.expires_at) - new Date();
      if (difference <= 0) {
        clearInterval(interval);
        setActiveSub(null); // Sub expired, revert to free version!
        if (user?.telegramId) localStorage.removeItem(`canva_premium_${String(user.telegramId)}`);
        setTimeLeft("");
      } else {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const m = Math.floor((difference / 1000 / 60) % 60);
        const s = Math.floor((difference / 1000) % 60);
        setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSub, user?.telegramId]);

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
      
      {/* Header Banner (Matches screenshot aesthetic) */}
      <div className="relative w-full h-[150px] bg-gradient-to-r from-[#00C4CC] to-[#7B2CBF] flex items-center justify-center shadow-sm">
         <h1 className="text-6xl font-bold text-white italic tracking-tighter" style={{ fontFamily: 'Georgia, serif' }}>Canva</h1>
      </div>

      {/* CHANGED: Removed the negative margin (-mt-4) and added padding (pt-6) to create a perfect gap */}
      <div className="px-4 pt-6 pb-4 space-y-5 relative z-30">
        
        {loadingSub ? (
          <div className="bg-white rounded-[24px] p-6 text-center text-gray-400 font-bold shadow-sm">Loading Access...</div>
        ) : activeSub ? (
          
          /* ========================================================= */
          /* 💎 VIP PREMIUM CARD (With Live Countdown)                 */
          /* ========================================================= */
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-[#FFD700] to-[#F59E0B] rounded-[24px] px-5 py-8 border border-yellow-300 shadow-lg text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-2 -mr-2 text-7xl opacity-20">👑</div>
            <h2 className="text-2xl font-black text-white mb-1 drop-shadow-sm relative z-10">Premium Unlocked!</h2>
            <p className="text-yellow-50 font-bold mb-4 text-xs relative z-10">Ad-Free VIP Access</p>
            
            <div className="bg-black/20 rounded-xl p-3 mb-6 inline-block mx-auto backdrop-blur-sm border border-white/20">
               <div className="text-[10px] text-yellow-100 font-bold uppercase tracking-widest mb-0.5">Access Expires In</div>
               <div className="text-white font-black text-xl tracking-wider font-mono">{timeLeft || "Calculating..."}</div>
            </div>

            <button onClick={() => openExternalLink(activeSub.invite_link)} className="w-full bg-white text-orange-600 font-black text-[15px] py-4 rounded-2xl shadow-xl active:scale-95 transition-transform flex justify-center items-center gap-2 relative z-10">
              <span className="text-xl">✨</span> OPEN CANVA PRO
            </button>
          </motion.div>

        ) : (

          /* ========================================================= */
          /* 📺 FREE USER CARD                                         */
          /* ========================================================= */
          <>
            {/* Instruction Alert - Now has a perfect gap from the banner */}
            <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm">
              <span className="text-2xl drop-shadow-sm">📢</span>
              <p className="text-[12px] text-gray-700 leading-snug font-medium">
                Complete 4 steps, the Canva Pro button will be unlocked. Then click again to open Canva Pro.
              </p>
            </div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl px-5 py-6 border border-gray-100 shadow-sm">
              
              {currentStep > 4 ? (
                
                /* 🎉 INLINE WOO HOO ANIMATION 🎉 */
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-4 relative">
                  <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-6xl mb-4">🎉</motion.div>
                  <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#6200EA] to-[#00E5FF] mb-2 uppercase tracking-wide">Woo Hoo!</h2>
                  <p className="text-gray-500 font-bold mb-6 text-sm">You completed all steps! Here is your link.</p>
                  <button 
                    onClick={() => {
                      if (canvaLink) openExternalLink(canvaLink);
                      else alert("All slots full!");
                    }} 
                    className="w-full bg-[#6200EA] text-white font-black text-[16px] py-4 rounded-2xl shadow-lg active:scale-95 transition-transform flex justify-center items-center gap-2"
                  >
                    Open Canva Pro
                  </button>
                </motion.div>

              ) : (

                /* 🟢 4-STEP PROGRESS UI */
                <div className="space-y-6">
                  
                  {/* Custom Step Indicator matching screenshot */}
                  <div className="flex justify-between items-center relative w-full mb-6 mt-2 px-2">
                    <div className="absolute top-[18px] left-6 right-6 h-[2px] bg-gray-200 z-0"></div>
                    {[1, 2, 3, 4].map((stepNum) => {
                      const isActive = currentStep === stepNum;
                      const isCompleted = currentStep > stepNum;
                      
                      return (
                        <div key={stepNum} className="flex flex-col items-center relative z-10 bg-white px-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-[15px] mb-1.5 transition-all
                            ${isCompleted ? "bg-[#6200EA] text-white border-2 border-[#6200EA]" : 
                              isActive ? "bg-white border-[2px] border-red-500 text-red-500" : 
                              "bg-white border-[2px] border-gray-200 text-gray-300"}`}>
                            {isCompleted ? "✓" : stepNum}
                          </div>
                          <span className={`text-[10px] font-bold text-center 
                            ${isActive ? "text-gray-900" : isCompleted ? "text-[#6200EA]" : "text-gray-400"}`}>
                            Step {stepNum}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <button onClick={handleMainAction} disabled={isProcessing} className={`w-full text-white font-bold text-[16px] py-4.5 rounded-[18px] shadow-sm transition-all active:scale-95 flex justify-center items-center gap-2 ${isProcessing ? "bg-gray-400 cursor-not-allowed" : "bg-[#6200EA] hover:bg-[#5000c9]"}`} style={{ minHeight: '56px' }}>
                    {isProcessing ? "Waiting for Ad..." : "Watch Ads to Unlock Canva Pro"}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}

        {/* Stacked Social / Join Buttons */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
          <button onClick={() => openExternalLink('https://t.me/yourchannel')} className="w-full bg-gradient-to-r from-[#7B2CBF] to-[#9D4EDD] text-white font-bold py-4 rounded-[16px] flex justify-center items-center gap-2 active:scale-95 transition-transform text-[14px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            Join Channel
          </button>
          <button onClick={() => openExternalLink('https://t.me/yourgroup')} className="w-full bg-gradient-to-r from-[#7B2CBF] to-[#9D4EDD] text-white font-bold py-4 rounded-[16px] flex justify-center items-center gap-2 active:scale-95 transition-transform text-[14px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Join Group
          </button>
          <button className="w-full bg-[#F3F4F6] text-gray-700 font-bold py-4 rounded-[16px] text-[14px] flex justify-center items-center gap-1.5 active:bg-gray-200 transition-colors">
            How to join Canva Pro <span className="text-[16px]">🌿</span>
          </button>
        </div>

        {/* Features / Benefits Card */}
        <div className="bg-white rounded-3xl px-4 py-6 border border-gray-100 shadow-sm text-center">
          <h3 className="text-[11px] font-black text-gray-400 tracking-[0.15em] mb-5 uppercase">What You Get</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#F3E8FF] rounded-[20px] p-3 flex flex-col items-center justify-center gap-2 h-[90px]">
              <span className="text-2xl drop-shadow-sm">🎨</span>
              <span className="text-[10px] font-black text-[#7B2CBF] leading-tight">Premium<br/>Templates</span>
            </div>
            <div className="bg-[#FEF3C7] rounded-[20px] p-3 flex flex-col items-center justify-center gap-2 h-[90px]">
              <span className="text-2xl drop-shadow-sm">✨</span>
              <span className="text-[10px] font-black text-[#D97706] leading-tight">Magic AI<br/>Tools</span>
            </div>
            <div className="bg-[#D1FAE5] rounded-[20px] p-3 flex flex-col items-center justify-center gap-2 h-[90px]">
              <div className="bg-[#10B981] text-white font-black text-[9px] px-2 py-0.5 rounded uppercase tracking-wider">Free</div>
              <span className="text-[10px] font-black text-[#059669] leading-tight">100% Free</span>
            </div>
          </div>
          <div className="mt-5 text-[11px] text-gray-400 font-medium flex items-center justify-center gap-1.5">
            <span className="text-yellow-500">🔒</span> No payment required
          </div>
        </div>

        {/* Footer Credit */}
        <div className="text-center pt-2 pb-6">
          <p className="text-[13px] font-black text-[#6200EA] mb-0.5">by H2N</p>
          <p className="text-[11px] text-gray-400 font-medium">@ShareCanvaProFree_Bot</p>
        </div>

      </div>
    </div>
  );
}