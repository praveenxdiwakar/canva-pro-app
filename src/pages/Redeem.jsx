import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelegram } from '../contexts/TelegramContext';
import { supabase } from '../api/supabase';
import { useSwipeNavigation } from '../hooks/useSwipeNavigation'; // ✅ ADDED SWIPE HOOK

export default function Redeem() {
  const { user, setUser } = useTelegram();
  const navigate = useNavigate();
  
  // ✅ ADDED: Swipe Right -> Tasks (/tasks) | Swipe Left -> Pro Users (/prousers)
  const swipeHandlers = useSwipeNavigation('/tasks', '/prousers'); 
  
  const [loading, setLoading] = useState(false);
  
  // Premium Subscription Status & Timer
  const [activeSub, setActiveSub] = useState(null);
  const [loadingSub, setLoadingSub] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");
  
  // Custom Modal States
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, tierId: null, cost: 0, days: 0 });
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });
  const [celebration, setCelebration] = useState({ isOpen: false, message: "", link: "", days: 0 });

  // Hardcoded Static Tiers with new pricing
  const tiers = [
    { id: 1, durationDays: 7, pointsCost: 49, title: "Starter", subtitle: "7 Days Full Access" },
    { id: 2, durationDays: 15, pointsCost: 89, title: "Quick Access", subtitle: "15 Days Full Access" },
    { id: 3, durationDays: 30, pointsCost: 179, title: "Most Popular", subtitle: "30 Days Full Access", badge: "🔥 BEST VALUE" }
  ];

  const currentPoints = user?.points || 0;
  const firstRewardCost = 49;
  const mainProgress = Math.min(100, Math.round((currentPoints / firstRewardCost) * 100));

  // 1. Fetch Active Subscription on Load (WITH LOCAL BACKUP)
  useEffect(() => {
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
  }, [user?.telegramId]);

  // 2. Live Countdown Timer
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
    if (tg && tg.openLink) { tg.openLink(url); } 
    else { const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.click(); }
  };

  const executeRedemption = async () => {
    const { tierId, cost, days } = confirmModal;
    setConfirmModal({ isOpen: false, tierId: null, cost: 0, days: 0 });
    setLoading(true);

    try {
      const tgIdStr = String(user.telegramId);

      if (currentPoints < cost) {
        setErrorModal({ isOpen: true, message: "You don't have enough points for this reward!" });
        setLoading(false); return;
      }

      const { data: links, error: linkErr } = await supabase.from('canva_links').select('*');
      if (linkErr) throw new Error(`DB Error (Links): ${linkErr.message}`);
      
      const availableLink = links?.find(l => l.used_slots < l.total_slots);

      if (!availableLink) {
        setErrorModal({ isOpen: true, message: "All Canva Pro slots are currently full. Please try again later or contact the admin!" });
        setLoading(false); return;
      }

      const newPoints = currentPoints - cost;
      const finalUrl = availableLink.url || availableLink.invitelink;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);

      const newRedemption = {
        telegram_id: tgIdStr,
        tier_id: tierId,
        points_cost: cost,
        link_name: availableLink.name,
        invite_link: finalUrl,
        expires_at: expiresAt.toISOString()
      };

      // 1. Save Redemption
      const { error: insertError } = await supabase.from('redemptions').insert([newRedemption]);
      if (insertError) throw new Error(`DB Error (redemptions): ${insertError.message || insertError.details}`);

      // 2. Deduct Points
      const { error: userError } = await supabase.from('users').update({ points: newPoints }).eq('telegram_id', tgIdStr);
      if (userError) throw new Error(`DB Error (users): ${userError.message}`);
      localStorage.setItem(`canva_pts_${tgIdStr}`, newPoints);
      localStorage.setItem(`canva_premium_${tgIdStr}`, JSON.stringify(newRedemption));

      // 3. Increment Used Slots
      const { error: slotsError } = await supabase.from('canva_links').update({ used_slots: availableLink.used_slots + 1 }).eq('id', availableLink.id);
      if (slotsError) throw new Error(`DB Error (canva_links): ${slotsError.message}`);

      // 4. Log to Task History
      const { error: histError } = await supabase.from('task_history').insert([{ telegram_id: tgIdStr, task_name: `Redeemed ${days} Days Pro`, points_earned: -cost, icon: '💎' }]);
      if (histError) throw new Error(`DB Error (task_history): ${histError.message}`);

      // Update UI & Celebrate
      setUser({ ...user, points: newPoints });
      setActiveSub(newRedemption); 
      setCelebration({ isOpen: true, message: `You successfully unlocked Canva Pro for ${days} Days!`, link: finalUrl, days });

    } catch (err) {
      console.error(err);
      setErrorModal({ isOpen: true, message: err.message || "A network error occurred. Please try again." });
    }
    setLoading(false);
  };

  return (
    {/* ✅ ADDED: {...swipeHandlers} attached to the background container */}
    <div {...swipeHandlers} className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24 relative overflow-x-hidden">
      
      {/* ========================================================= */}
      {/* 🌟 UPGRADED PREMIUM HEADER BANNER 🌟                        */}
      {/* ========================================================= */}
      <div className="relative w-full h-[150px] bg-gradient-to-br from-[#00C4CC] via-[#7B2CBF] to-[#6200EA] flex items-center justify-center overflow-hidden">
        
        {/* Ambient Glows */}
        <div className="absolute top-[-20px] left-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none z-0"></div>
        <div className="absolute bottom-[-30px] right-[-10px] w-40 h-40 bg-[#00E5FF]/20 rounded-full blur-[40px] pointer-events-none z-0"></div>
        
        {/* Animated Floating Particles */}
        <motion.div animate={{ y: [0, -10, 0], opacity: [0.3, 0.8, 0.3] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute top-6 left-10 text-white/50 text-[10px] select-none z-10">✨</motion.div>
        <motion.div animate={{ y: [0, 10, 0], opacity: [0.2, 0.6, 0.2] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }} className="absolute bottom-8 right-12 text-white/40 text-[14px] select-none z-10">✦</motion.div>

        {/* Canva Logo + PRO Badge */}
        <div className="relative z-20 flex items-center justify-center gap-1.5 drop-shadow-xl mt-2">
          <h1 className="text-[52px] font-bold text-white tracking-tighter" style={{ fontFamily: 'Georgia, serif' }}>
            Canva
          </h1>
          <motion.div 
            initial={{ scale: 0.8, rotate: 0 }}
            animate={{ scale: 1, rotate: 3 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
            className="bg-gradient-to-tr from-[#FFD700] via-[#F59E0B] to-[#FFD700] text-[#5B3A00] font-black text-[11px] px-2 py-0.5 rounded-[6px] uppercase tracking-widest shadow-[0_4px_10px_rgba(245,158,11,0.4)] -mt-8 border border-yellow-200/50"
          >
            Pro
          </motion.div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 📍 BALANCE & PROGRESS SECTION (Header Bottom)             */}
      {/* ========================================================= */}
      <div className="bg-white px-5 py-5 shadow-sm border-b border-gray-100 relative z-30">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-4">
            <div className="w-[50px] h-[50px] bg-gradient-to-br from-[#8B5CF6] to-[#6200EA] rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-purple-200 border-2 border-purple-200">🪙</div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold mb-0.5 uppercase tracking-widest">Your Balance</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[34px] font-black text-gray-900 leading-none tracking-tighter">{currentPoints}</span>
                <span className="text-[11px] font-bold text-gray-400">pts</span>
              </div>
            </div>
          </div>
          
          <button onClick={() => navigate('/tasks')} className="border border-purple-200 text-[#6200EA] bg-purple-50 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
            Earn
          </button>

        </div>

        {/* Global Progress */}
        <div className="flex justify-between items-end mb-1.5">
          <span className="text-[11px] text-gray-500 font-medium">
            {currentPoints >= firstRewardCost ? 'First reward unlocked! 🎉' : `${firstRewardCost} pts to first reward`}
          </span>
          <span className="text-[11px] font-black text-[#8B5CF6]">{mainProgress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div className="bg-[#8B5CF6] h-2 rounded-full transition-all duration-500" style={{ width: `${mainProgress}%` }}></div>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-4">
        
        {loadingSub ? (
          <div className="text-center py-10 text-gray-400 font-bold">Checking subscription status...</div>
        ) : activeSub ? (
          
          /* VIP PREMIUM CARD */
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-[#FFD700] to-[#F59E0B] rounded-[24px] px-5 py-8 border border-yellow-300 shadow-lg text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-2 -mr-2 text-7xl opacity-20">👑</div>
            <h2 className="text-2xl font-black text-white mb-2 drop-shadow-sm relative z-10">Premium Active!</h2>
            <p className="text-yellow-50 font-bold mb-6 text-xs relative z-10">You already have an active subscription. Enjoy!</p>
            
            <div className="bg-black/20 rounded-xl p-4 mb-6 inline-block mx-auto backdrop-blur-sm border border-white/20">
               <div className="text-[10px] text-yellow-100 font-bold uppercase tracking-widest mb-1">Time Remaining</div>
               <div className="text-white font-black text-2xl tracking-wider font-mono">{timeLeft || "Calculating..."}</div>
            </div>

            <button onClick={() => openExternalLink(activeSub.invite_link)} className="w-full bg-white text-orange-600 font-black text-[15px] py-4 rounded-2xl shadow-xl active:scale-95 transition-transform flex justify-center items-center gap-2 relative z-10">
              <span className="text-xl">✨</span> OPEN CANVA PRO
            </button>
            <p className="text-[10px] text-yellow-100 font-bold mt-4 relative z-10">
              You can redeem a new package once this timer expires.
            </p>
          </motion.div>

        ) : (

          /* ========================================================= */
          /* 💎 TIERS LIST (NOW A PREMIUM HORIZONTAL SLIDER)           */
          /* ========================================================= */
          <>
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 no-page-swipe" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {tiers.map(tier => {
                const progress = Math.min(100, Math.round((currentPoints / tier.pointsCost) * 100));
                const missing = Math.max(0, tier.pointsCost - currentPoints);
                const canRedeem = missing === 0;

                return (
                  <div key={tier.id} className="snap-center shrink-0 w-[85%] bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 relative overflow-hidden">
                    {tier.badge && (
                      <div className="absolute top-5 right-5 bg-orange-50 text-orange-600 font-black text-[9px] px-2.5 py-1.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                        {tier.badge}
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-5">
                      <div className="flex gap-3.5">
                        <div className="w-[52px] h-[52px] rounded-2xl border-2 border-gray-100 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                          <span className="text-xl font-black leading-none text-gray-700">{tier.durationDays}</span>
                          <span className="text-[7px] font-bold uppercase tracking-widest mt-0.5">Days</span>
                        </div>
                        <div>
                          <h3 className="font-black text-gray-900 text-[17px] leading-tight mb-0.5">Canva Pro</h3>
                          <p className="text-[11px] text-gray-500 font-medium mb-1.5">{tier.subtitle}</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-[22px] font-black text-gray-900 leading-none">{tier.pointsCost}</span>
                            <span className="text-[10px] font-bold text-gray-500">points</span>
                          </div>
                        </div>
                      </div>
                      {!tier.badge && <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider mt-1">{tier.title}</span>}
                    </div>
                    
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[11px] font-bold text-gray-700">{currentPoints} / {tier.pointsCost} pts</span>
                      <span className="text-[10px] font-medium text-gray-400">{canRedeem ? 'Ready to claim!' : `Need ${missing} more`}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-5 overflow-hidden">
                      <div className="bg-gray-300 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>

                    {canRedeem ? (
                      <button 
                        onClick={() => setConfirmModal({ isOpen: true, tierId: tier.id, cost: tier.pointsCost, days: tier.durationDays })}
                        disabled={loading}
                        className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] active:scale-[0.98] text-white font-bold py-3.5 rounded-xl text-[13px] shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? 'Processing...' : '🎁 Unlock Now'}
                      </button>
                    ) : (
                      <button disabled className="w-full border-2 border-dashed border-gray-200 text-gray-400 font-bold py-3.5 rounded-xl text-[12px] flex items-center justify-center gap-1.5 bg-gray-50/50">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        Need {missing} more points
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Swipe Indicator Dots */}
            <div className="flex justify-center gap-1.5 mb-4 mt-[-5px]">
               {tiers.map((_, idx) => (
                 <div key={idx} className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
               ))}
            </div>
            
            {/* KEEP EARNING SECTION */}
            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 mt-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 flex items-center justify-center text-3xl drop-shadow-sm">🎯</div>
                <div>
                  <h3 className="font-black text-gray-900 text-[15px] leading-tight mb-0.5">Keep earning!</h3>
                  <p className="text-[11px] text-gray-500 font-medium">Watch ads · Complete tasks</p>
                </div>
              </div>
              <button onClick={() => navigate('/tasks')} className="w-full bg-[#9333EA] hover:bg-purple-700 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl shadow-md text-[14px] transition-all flex justify-center items-center gap-2">
                Earn More Points &gt;
              </button>
            </div>

            {/* CONTACT SUPPORT LINK */}
            <div className="text-center mt-6 mb-2">
              <p className="text-[11px] text-gray-400 font-medium">
                Need help? <span className="text-gray-500 cursor-pointer hover:underline font-bold" onClick={() => openExternalLink('https://t.me/noobfrager')}>🎧 Contact Support</span>
              </p>
            </div>
          </>
        )}
      </div>

      {/* --- CUSTOM MODALS --- */}
      <AnimatePresence>
        
        {/* CONFIRMATION MODAL */}
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center">
              <div className="text-4xl mb-3">💎</div>
              <h3 className="text-lg font-black text-gray-900 mb-2">Confirm Redemption</h3>
              <p className="text-sm text-gray-500 font-medium mb-6">Are you sure you want to spend <span className="font-black text-purple-600">{confirmModal.cost} points</span> to unlock {confirmModal.days} Days of Canva Pro?</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmModal({ isOpen: false, tierId: null, cost: 0, days: 0 })} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl text-sm active:scale-95">Cancel</button>
                <button onClick={executeRedemption} className="flex-1 bg-purple-600 text-white font-bold py-3 rounded-xl text-sm active:scale-95 shadow-md">Yes, Unlock!</button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ERROR MODAL */}
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
                <button onClick={() => setCelebration({ isOpen: false, message: "", link: "", days: 0 })} className="w-full bg-transparent border-2 border-white/30 text-white font-bold py-3 rounded-xl text-sm active:scale-95 transition-colors hover:bg-white/10">
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