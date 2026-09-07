import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../api/supabase';
import { useTelegram } from '../contexts/TelegramContext';
import { useSwipeNavigation } from '../hooks/useSwipeNavigation'; 
import { useNavigate } from 'react-router-dom';

export default function FreeCanva() {
  const { user } = useTelegram();
  const navigate = useNavigate(); 
  
  const swipeHandlers = useSwipeNavigation(null, '/tasks'); 
  
  const [currentStep, setCurrentStep] = useState(1);
  const [canvaLink, setCanvaLink] = useState(null);
  const [activeLinkObj, setActiveLinkObj] = useState(null);
  const [slotUpdated, setSlotUpdated] = useState(false);
  
  // Backup Credentials State
  const [backupCreds, setBackupCreds] = useState(null);
  const [copiedField, setCopiedField] = useState("");

  const [adZone, setAdZone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState(0); 

  useEffect(() => {
    // 1. Fetch available Free Canva link
    supabase.from('canva_links').select('*').eq('tier_id', 0).then(({ data }) => {
      if (data && data.length > 0) {
        const available = data.find(l => l.used_slots < l.total_slots);
        if (available) {
          setCanvaLink(available.url || available.invitelink);
          setActiveLinkObj(available);
        }
      }
    });

    // 2. Fetch Free Canva Backup Credentials (Email, Pass, TOTP)
    supabase.from('app_settings').select('value').eq('key', 'FREE_CANVA_BACKUP').maybeSingle().then(({ data }) => {
      if (data && data.value) {
        try {
          const parsed = JSON.parse(data.value);
          if (parsed.enabled) {
            setBackupCreds(parsed);
          }
        } catch (e) {}
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

    // 4. Inject Confetti Script
    if (!document.getElementById('confetti-script')) {
      const script = document.createElement('script');
      script.id = 'confetti-script';
      script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (currentStep > 5 && window.confetti) {
      var duration = 3000;
      var end = Date.now() + duration;

      (function frame() {
        window.confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#6200EA', '#00C4CC', '#FFD700'] });
        window.confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#6200EA', '#00C4CC', '#FFD700'] });
        if (Date.now() < end) requestAnimationFrame(frame);
      }());
    }
  }, [currentStep]);

  const openExternalLink = (url) => {
    const tg = window.Telegram?.WebApp;
    if (tg && tg.openLink) { tg.openLink(url); } 
    else { const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.click(); }
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(""), 2000);
  };

  const handleOpenCanva = async () => {
    if (!canvaLink) return;
    openExternalLink(canvaLink);

    if (!slotUpdated && activeLinkObj) {
      setSlotUpdated(true);
      try {
        await supabase.from('canva_links')
          .update({ used_slots: activeLinkObj.used_slots + 1 })
          .eq('id', activeLinkObj.id);
      } catch (err) {}
    }
  };

  const triggerAdLogic = () => {
    setIsProcessing(true);
    const adFunctionName = `show_${adZone}`;
    if (adZone && typeof window[adFunctionName] === "function") {
      window[adFunctionName]()
        .then(() => { setCurrentStep(prev => prev + 1); setIsProcessing(false); })
        .catch(() => { alert("⚠️ Ad failed to load. Please try again."); setIsProcessing(false); });
    } else {
      const adUrl = adZone ? `https://go.oclasrv.com/afu.php?zoneid=${adZone}` : "https://monetag.com";
      openExternalLink(adUrl);
      setTimeout(() => { setCurrentStep(prev => prev + 1); setIsProcessing(false); }, 6000); 
    }
  };

  const handleMainAction = () => {
    if (isProcessing || countdown > 0) return;
    setCountdown(3);
    let currentCount = 3;
    const timer = setInterval(() => {
      currentCount -= 1;
      setCountdown(currentCount);
      if (currentCount <= 0) {
        clearInterval(timer);
        triggerAdLogic();
      }
    }, 1000);
  };

  return (
    <div {...swipeHandlers} className="flex flex-col min-h-[calc(100dvh-5rem)] bg-[#f5f5f5] pb-24 relative overflow-hidden">
      
      {/* HEADER */}
      <div className="relative w-full h-[160px] bg-gradient-to-br from-[#00C4CC] via-[#7B2CBF] to-[#6200EA] flex items-center justify-center overflow-hidden">
        <div className="absolute top-[-20px] left-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-[-30px] right-[-10px] w-40 h-40 bg-[#00E5FF]/20 rounded-full blur-[40px] pointer-events-none"></div>
        <motion.div animate={{ y: [0, -10, 0], opacity: [0.3, 0.8, 0.3] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute top-6 left-10 text-white/50 text-[10px] select-none">✨</motion.div>
        <motion.div animate={{ y: [0, 10, 0], opacity: [0.2, 0.6, 0.2] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }} className="absolute bottom-10 right-12 text-white/40 text-[14px] select-none">✦</motion.div>

        <div className="relative z-10 flex items-center justify-center gap-1.5 drop-shadow-xl mt-[-10px]">
          <h1 className="text-[52px] font-bold text-white tracking-tighter" style={{ fontFamily: 'Georgia, serif' }}>Canva</h1>
          <motion.div initial={{ scale: 0.8, rotate: 0 }} animate={{ scale: 1, rotate: 3 }} transition={{ type: "spring", bounce: 0.5, delay: 0.2 }} className="bg-gradient-to-tr from-[#FFD700] via-[#F59E0B] to-[#FFD700] text-[#5B3A00] font-black text-[11px] px-2 py-0.5 rounded-[6px] uppercase tracking-widest shadow-[0_4px_10px_rgba(245,158,11,0.4)] -mt-8 border border-yellow-200/50">Pro</motion.div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-[#f5f5f5] to-transparent z-10"></div>
      </div>

      <div className="px-4 pt-4 pb-4 space-y-5 relative z-30">

        <div className="bg-white border border-purple-100 rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm">
          <span className="text-2xl drop-shadow-sm">📢</span>
          <p className="text-[12px] text-gray-700 leading-snug font-medium">
            Complete all 5 steps to unlock your Canva Pro button instantly!
          </p>
        </div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl px-5 py-6 border border-purple-100 shadow-sm">
          
          {currentStep > 5 ? (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-2 relative">
              <motion.div animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-6xl mb-3">🎉</motion.div>
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#6200EA] to-[#00C4CC] mb-1 uppercase tracking-wide">Woo Hoo!</h2>
              <p className="text-gray-500 font-bold mb-5 text-xs">You completed all 5 steps!</p>
              
              {canvaLink ? (
                /* Primary Invite Link Button */
                <button 
                  onClick={handleOpenCanva} 
                  className="w-full bg-[#6200EA] hover:bg-[#5000c9] text-white font-black text-[16px] py-4 rounded-2xl shadow-lg active:scale-95 transition-transform flex justify-center items-center gap-2"
                >
                  Open Canva Pro
                </button>
              ) : backupCreds && backupCreds.email ? (
                /* 🛡️ Fallback: Direct Credentials Option */
                <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 text-left space-y-3">
                  <div className="text-center pb-1">
                    <span className="bg-purple-600 text-white font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">Account Login Access</span>
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 block mb-0.5">Email</label>
                    <div className="flex items-center justify-between bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800">
                      <span className="truncate mr-2">{backupCreds.email}</span>
                      <button onClick={() => copyToClipboard(backupCreds.email, 'email')} className="text-purple-600 hover:text-purple-800 text-[11px] font-black shrink-0">
                        {copiedField === 'email' ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 block mb-0.5">Password</label>
                    <div className="flex items-center justify-between bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800">
                      <span className="truncate mr-2">{backupCreds.password}</span>
                      <button onClick={() => copyToClipboard(backupCreds.password, 'pass')} className="text-purple-600 hover:text-purple-800 text-[11px] font-black shrink-0">
                        {copiedField === 'pass' ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {backupCreds.totpLink && (
                    <button 
                      onClick={() => openExternalLink(backupCreds.totpLink.startsWith('http') ? backupCreds.totpLink : `https://${backupCreds.totpLink}`)} 
                      className="w-full bg-[#00C4CC] hover:bg-[#00b0b8] text-white font-black text-xs py-3 rounded-xl shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-1.5 mt-1"
                    >
                      🔐 Open 2FA / TOTP Link ➔
                    </button>
                  )}
                </div>
              ) : (
                /* Fallback: All Slots Full */
                <div className="text-red-500 font-bold text-xs py-2">
                  All slots are currently full. Please try again soon!
                </div>
              )}
            </motion.div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center relative w-full mb-6 mt-2 px-1">
                <div className="absolute top-[18px] left-4 right-4 h-[2px] bg-gray-200 z-0"></div>
                {[1, 2, 3, 4, 5].map((stepNum) => {
                  const isActive = currentStep === stepNum;
                  const isCompleted = currentStep > stepNum;
                  return (
                    <div key={stepNum} className="flex flex-col items-center relative z-10 bg-white px-0.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[13px] mb-1.5 transition-all
                        ${isCompleted ? "bg-[#6200EA] text-white border-2 border-[#6200EA]" : 
                          isActive ? "bg-white border-[2px] border-[#6200EA] text-[#6200EA]" : 
                          "bg-white border-[2px] border-gray-200 text-gray-300"}`}>
                        {isCompleted ? "✓" : stepNum}
                      </div>
                      <span className={`text-[9px] font-bold text-center ${isActive ? "text-gray-900" : isCompleted ? "text-[#6200EA]" : "text-gray-400"}`}>
                        Step {stepNum}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={handleMainAction} 
                disabled={isProcessing || countdown > 0} 
                className={`w-full text-white font-bold text-[16px] py-4.5 rounded-[18px] shadow-sm transition-all active:scale-95 flex justify-center items-center gap-2 ${isProcessing || countdown > 0 ? "bg-gray-400 cursor-not-allowed" : "bg-[#6200EA] hover:bg-[#5000c9]"}`} 
                style={{ minHeight: '56px' }}
              >
                {countdown > 0 ? `Please wait... ${countdown}s` : isProcessing ? "Waiting for Ad..." : `Watch Ad (Step ${currentStep}/5)`}
              </button>
            </div>
          )}
        </motion.div>

        {/* BACKUP OPTION: EARN POINTS BANNER */}
        <AnimatePresence>
          {currentStep > 5 && (
            <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 20 }} className="bg-white rounded-3xl p-5 border border-purple-100 shadow-sm relative overflow-hidden">
              <div className="flex flex-col gap-4 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-xl shrink-0 shadow-sm border border-purple-100">💡</div>
                  <div className="flex-1 mt-0.5">
                    <h3 className="font-black text-gray-900 text-[15px] mb-1">Want Personal Access?</h3>
                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                      You can redeem 7, 15, or 30 days of private Canva Pro access directly by earning points!
                    </p>
                  </div>
                </div>
                <div className="flex justify-center w-full">
                  <button onClick={() => navigate('/tasks')} className="w-full bg-gray-900 hover:bg-black text-white font-bold text-[12px] py-3.5 rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2">
                    Go to Earn Points <span className="text-[14px]">➔</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stacked Social / Join Buttons */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
          <button onClick={() => openExternalLink('https://t.me/CanvaProMiniApp')} className="w-full bg-gradient-to-r from-[#7B2CBF] to-[#9D4EDD] text-white font-bold py-4 rounded-[16px] flex justify-center items-center gap-2 active:scale-95 transition-transform text-[14px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            Join Channel
          </button>
          <button onClick={() => openExternalLink('https://t.me/CanvaProLinkCommunity')} className="w-full bg-gradient-to-r from-[#7B2CBF] to-[#9D4EDD] text-white font-bold py-4 rounded-[16px] flex justify-center items-center gap-2 active:scale-95 transition-transform text-[14px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Join Group
          </button>
          <button onClick={() => openExternalLink('https://t.me/CanvaProLinkCommunity/2')} className="w-full bg-[#F3F4F6] text-gray-700 font-bold py-4 rounded-[16px] text-[14px] flex justify-center items-center gap-1.5 active:bg-gray-200 transition-colors">
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
          <p className="text-[13px] font-black text-[#6200EA] mb-0.5">
            Made with ❤️ by <span onClick={() => openExternalLink('https://t.me/NoobFrager')} className="cursor-pointer hover:underline">Frager</span>
          </p>
          <p className="text-[11px] text-gray-400 font-medium">v2.0.0</p>
        </div>

      </div>
    </div>
  );
}