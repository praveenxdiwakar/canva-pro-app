import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../api/supabase';

export default function FreeCanva() {
  const [currentStep, setCurrentStep] = useState(1);
  const [canvaLink, setCanvaLink] = useState(null);
  const [adZone, setAdZone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // 1. Fetch available Canva link from Supabase (Real-time)
    supabase.from('canva_links').select('*').then(({ data }) => {
      if (data && data.length > 0) {
        const available = data.find(l => l.used_slots < l.total_slots);
        // Fallback to invitelink if url is empty
        if (available) setCanvaLink(available.url || available.invitelink);
      }
    });

    // 2. Fetch Monetag Ad Zone from Supabase Admin Settings
    supabase.from('app_settings').select('value').eq('key', 'MONETAG_ZONE_ID').maybeSingle().then(({data}) => {
      if (data && data.value) setAdZone(data.value);
    });
  }, []);

  // Calculate progress bar percentage
  const progressPercentage = Math.min(100, ((currentStep - 1) / 3) * 100);

  // Bulletproof Link Opener (Bypasses Telegram & Browser Popup Blockers)
  const openExternalLink = (url) => {
    const tg = window.Telegram?.WebApp;
    if (tg && tg.openLink) {
      tg.openLink(url); // Native Telegram opener
    } else {
      // Invisible anchor tag click for standard web browsers
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleMainAction = () => {
    // If all 4 steps are complete, unlock the Canva Link!
    if (currentStep > 4) {
      if (canvaLink) {
        openExternalLink(canvaLink);
      } else {
        alert("All current Canva Pro slots are full! Check back soon or earn points in the Tasks tab.");
      }
      return;
    }

    // Step 1 to 4: Trigger Ad and progress to next step
    if (isProcessing) return;
    setIsProcessing(true);

    // Open Monetag Ad securely using the bulletproof opener
    const adUrl = adZone ? `https://go.oclasrv.com/afu.php?zoneid=${adZone}` : "https://monetag.com";
    openExternalLink(adUrl);

    // Smart Timer: Wait 6 seconds to ensure the user viewed the ad before unlocking the next step
    setTimeout(() => {
      setCurrentStep(prev => prev + 1);
      setIsProcessing(false);
    }, 6000); 
  };

  return (
    <div className="flex flex-col min-h-[calc(100dvh-5rem)] bg-[#f5f5f5] pb-24">
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
        
        {/* Instruction Alert */}
        <div className="bg-white border border-gray-100 rounded-[20px] px-4 py-3.5 flex items-start gap-3 shadow-sm">
          <span className="text-xl mt-0.5">📢</span>
          <p className="text-[12px] text-gray-600 leading-snug font-medium">
            Complete the 4 steps below to unlock your free Canva Pro access button.
          </p>
        </div>

        {/* Steps Progress & Action Card */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[24px] px-5 py-6 border border-gray-100 shadow-sm space-y-6">
          <div className="relative w-full max-w-[280px] mx-auto mt-2 mb-4">
            {/* Progress Bar Line */}
            <div className="absolute top-[18px] left-[10%] right-[10%] h-[4px] bg-gray-100 z-0 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 transition-all duration-700 ease-out rounded-full" style={{ width: `${progressPercentage}%` }} />
            </div>

            {/* Step Circles */}
            <div className="relative z-10 flex justify-between items-start w-full">
              {[1, 2, 3, 4].map((stepNum) => {
                const isCompleted = currentStep > stepNum;
                const isActive = currentStep === stepNum;
                
                return (
                  <div key={stepNum} className="flex flex-col items-center w-12">
                    <div className="bg-white p-1 rounded-full mb-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300 shadow-sm
                        ${isCompleted ? "bg-green-500 text-white border-2 border-green-500" : 
                          isActive ? "bg-white border-[3px] border-[#6200EA] text-[#6200EA] shadow-md scale-110" : 
                          "bg-gray-50 border-2 border-gray-200 text-gray-300"}`}>
                        {isCompleted ? "✓" : stepNum}
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold text-center ${isCompleted ? "text-green-600" : isActive ? "text-gray-800" : "text-gray-400"}`}>
                      Step {stepNum}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Dynamic Action Button */}
          <button 
            onClick={handleMainAction} 
            disabled={isProcessing}
            className={`w-full text-white font-black text-[14px] py-4 rounded-2xl shadow-md transition-all active:scale-95 flex justify-center items-center gap-2
              ${currentStep > 4 ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 animate-pulse" : 
                isProcessing ? "bg-gray-400 cursor-not-allowed" : "bg-[#6200EA] hover:bg-[#5000c9]"}`}
          >
            {currentStep > 4 ? (
              <><span>🎁</span> UNLOCK CANVA PRO</>
            ) : isProcessing ? (
              <><span>⏳</span> Verifying Ad View...</>
            ) : (
              <><span>📺</span> Watch Ad for Step {currentStep}</>
            )}
          </button>
        </motion.div>

        {/* COMPACT Social / Join Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <button onClick={() => openExternalLink('https://t.me/yourchannel')} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 rounded-[16px] shadow-sm flex justify-center items-center gap-2 active:scale-95 transition-transform text-[12px]">
            <span className="text-[16px]">📢</span> Join Channel
          </button>
          <button onClick={() => openExternalLink('https://t.me/yourgroup')} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 rounded-[16px] shadow-sm flex justify-center items-center gap-2 active:scale-95 transition-transform text-[12px]">
            <span className="text-[16px]">👥</span> Join Group
          </button>
        </div>
        
        <button className="w-full bg-white border-2 border-dashed border-gray-200 text-gray-500 font-bold py-3 rounded-[16px] text-[12px] flex justify-center items-center gap-1.5 active:bg-gray-50 transition-colors">
          How to join Canva Pro <span className="text-[14px]">🌿</span>
        </button>

        {/* Features / Benefits Card */}
        <div className="bg-white rounded-[24px] px-4 py-5 border border-gray-100 shadow-sm text-center mt-2">
          <h3 className="text-[10px] font-black text-gray-400 tracking-[0.15em] mb-4 uppercase">What You Get</h3>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-purple-50/50 rounded-2xl p-3 flex flex-col items-center gap-1.5 border border-purple-100/50">
              <span className="text-2xl drop-shadow-sm">🎨</span>
              <span className="text-[9px] font-black text-purple-700 leading-tight">Premium<br/>Templates</span>
            </div>
            <div className="bg-yellow-50/50 rounded-2xl p-3 flex flex-col items-center gap-1.5 border border-yellow-100/50">
              <span className="text-2xl drop-shadow-sm">✨</span>
              <span className="text-[9px] font-black text-yellow-700 leading-tight">Magic AI<br/>Tools</span>
            </div>
            <div className="bg-green-50/50 rounded-2xl p-3 flex flex-col items-center gap-1.5 border border-green-100/50">
              <span className="text-2xl drop-shadow-sm">🆓</span>
              <span className="text-[9px] font-black text-green-700 leading-tight">100%<br/>Free Forever</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 text-[10px] text-gray-400 font-bold flex items-center justify-center gap-1.5">
            🔒 Safe & Secure • No payment required
          </div>
        </div>

        {/* Footer Credit */}
        <div className="text-center pt-2 pb-6">
          <p className="text-[12px] font-black text-[#6200EA] mb-0.5">by H2N</p>
          <p className="text-[10px] text-gray-400 font-medium">@ShareCanvaProFree_Bot</p>
        </div>

      </div>
    </div>
  );
}