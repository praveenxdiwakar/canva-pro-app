import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelegram } from '../contexts/TelegramContext';
import { supabase } from '../api/supabase';

export default function AccessGate({ children }) {
  const { user } = useTelegram();
  const tgId = user?.telegramId || user?.id;

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Database confirmed states (TRUE only if bot verified it)
  const [completed, setCompleted] = useState({
    bot: false,
    channel: false,
    group: false
  });

  // Local clicked states (Hides the button immediately upon click)
  const [clicked, setClicked] = useState({
    bot: false,
    channel: false,
    group: false
  });

  // Task list with the updated ?start=verify bot link
  const tasks = [
    { id: 'bot', title: 'Start Bot', subtitle: '@CanvaProMiniAppBot', url: 'https://t.me/CanvaProMiniAppBot?start=verify' },
    { id: 'channel', title: 'Join Channel', subtitle: '@CanvaProMiniApp', url: 'https://t.me/CanvaProMiniApp' },
    { id: 'group', title: 'Join Group', subtitle: '@CanvaProLinkCommunity', url: 'https://t.me/CanvaProLinkCommunity' }
  ];

  // Helper: Ping Render to check Telegram Live Member Status
  const pingLiveVerification = useCallback(async () => {
    if (!tgId) return;
    try {
      // This tells your Render bot to instantly check their live Telegram status
      await fetch(`https://canva-bot-backend.onrender.com/verify?tgId=${tgId}`);
    } catch (err) {
      console.error("Live verification ping failed:", err);
    }
  }, [tgId]);

  // Function to strictly query Supabase for verification status
  const checkDatabaseAccess = useCallback(async () => {
    if (!tgId) {
      setLoading(false);
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('is_bot_started, is_channel_joined, is_group_joined')
        .eq('telegram_id', String(tgId))
        .maybeSingle();

      if (error) {
        console.error("Access verification error:", error.message);
        return false;
      }

      if (data) {
        const botOk = Boolean(data.is_bot_started);
        const channelOk = Boolean(data.is_channel_joined);
        const groupOk = Boolean(data.is_group_joined);

        setCompleted({
          bot: botOk,
          channel: channelOk,
          group: groupOk
        });

        return botOk && channelOk && groupOk;
      } else {
        return false;
      }
    } catch (err) {
      console.error("Failed to check access:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [tgId]);

  // Initial load, Auto-Refresh on Return, and Realtime Database Listener
  useEffect(() => {
    if (!tgId) {
      setLoading(false);
      return;
    }

    const tgIdStr = String(tgId);
    
    // 1. Check database immediately, AND ping Render for live verification in background
    checkDatabaseAccess();
    pingLiveVerification();

    // 2. Auto-refresh when user comes back from the Telegram Chat
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        pingLiveVerification(); // Ask bot to check live status again
        checkDatabaseAccess();  // Pull latest from Supabase
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", checkDatabaseAccess);

    // 3. Realtime listener for instant background updates from Supabase
    const accessSubscription = supabase
      .channel(`access-gate-${tgIdStr}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'users',
        filter: `telegram_id=eq.${tgIdStr}` 
      }, (payload) => {
        if (payload?.new) {
          setCompleted({
            bot: Boolean(payload.new.is_bot_started),
            channel: Boolean(payload.new.is_channel_joined),
            group: Boolean(payload.new.is_group_joined)
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(accessSubscription);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", checkDatabaseAccess);
    };
  }, [tgId, checkDatabaseAccess, pingLiveVerification]);

  // Open link and instantly hide the button locally
  const openTelegramLink = (taskId, url) => {
    setClicked(prev => ({ ...prev, [taskId]: true }));
    
    const tg = window.Telegram?.WebApp;
    if (tg && tg.openTelegramLink) {
      tg.openTelegramLink(url);
    } else if (tg && tg.openLink) {
      tg.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  };

  // Manual Check Button
  const handleVerify = async () => {
    setVerifying(true);
    setErrorMsg("");

    // Force Render to check Telegram live API before we look at the database
    await pingLiveVerification();

    // Check Supabase again after giving the bot a moment to update it
    setTimeout(async () => {
      const isFullyAuthorized = await checkDatabaseAccess();
      setVerifying(false);
      
      if (!isFullyAuthorized) {
        const missing = [];
        if (!completed.bot) missing.push("Start Bot");
        if (!completed.channel) missing.push("Join Channel");
        if (!completed.group) missing.push("Join Group");

        setErrorMsg(
          missing.length > 0 
            ? `Still waiting for verification on: ${missing.join(', ')}.` 
            : "Membership not verified yet. Please make sure you joined."
        );
        
        // Unhide buttons for tasks that failed verification so they can try again
        setClicked(prev => ({
          bot: prev.bot && completed.bot,
          channel: prev.channel && completed.channel,
          group: prev.group && completed.group
        }));
      }
    }, 1500); // 1.5 second wait gives the backend time to finish updating
  };

  // STRICT CHECK: Every single requirement must be true in the database
  const hasFullAccess = completed.bot && completed.channel && completed.group;

  if (loading) return null;
  if (hasFullAccess) return children;

  return (
    <div className="min-h-[100dvh] bg-[#0E0E11] text-white flex flex-col font-sans relative overflow-hidden">
      
      

      <div className="flex-1 px-5 pt-8 pb-10 flex flex-col items-center">
        
        {/* App Logo & Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-[#8B5CF6] to-[#6200EA] flex items-center justify-center text-3xl shadow-[0_8px_30px_rgba(98,0,234,0.3)] mb-4">
            🎨
          </div>
          <h2 className="text-2xl font-bold mb-1 tracking-tight">Canva Pro Mini App</h2>
          <p className="text-gray-400 text-sm">Canva Pro completely free</p>
        </div>

        {/* Main Access Card */}
        <div className="w-full bg-[#18181B] rounded-[24px] p-5 shadow-2xl border border-white/5 relative z-10">
          <h3 className="text-lg font-bold mb-1">Access required</h3>
          <p className="text-sm text-gray-400 mb-6">Complete all steps below to unlock the app.</p>

          {/* Task List */}
          <div className="space-y-5 mb-8">
            {tasks.map((task) => {
              const isDone = completed[task.id];
              const isWaiting = clicked[task.id] && !isDone;

              return (
                <div key={task.id} className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${isDone ? 'border-[#10B981] bg-[#10B981]/10' : isWaiting ? 'border-[#8B5CF6]' : 'border-gray-600'}`}>
                    {isDone && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                    {isWaiting && (
                      <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }} 
                        className="w-3 h-3 border-[2px] border-[#8B5CF6] border-t-transparent rounded-full" 
                      />
                    )}
                  </div>
                  <div>
                    <h4 className={`text-[15px] font-bold ${isDone ? 'text-[#10B981]' : isWaiting ? 'text-[#8B5CF6]' : 'text-white'}`}>
                      {task.title}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {isWaiting ? "Verifying with Telegram..." : task.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {tasks.map((task) => {
              // HIDE BUTTON IF DONE OR IF CLICKED
              if (!completed[task.id] && !clicked[task.id]) {
                return (
                  <button 
                    key={`btn-${task.id}`}
                    onClick={() => openTelegramLink(task.id, task.url)}
                    className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:opacity-95 text-white font-bold py-3.5 rounded-xl text-[14px] active:scale-[0.98] transition-all tracking-wide"
                  >
                    {task.title.toUpperCase()}
                  </button>
                );
              }
              return null;
            })}

            <button 
              onClick={handleVerify}
              disabled={verifying}
              className="w-full bg-[#27272A] hover:bg-[#3F3F46] text-white font-bold py-3.5 rounded-xl text-[14px] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
            >
              {verifying ? (
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }} 
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" 
                />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
              )}
              {verifying ? "VERIFYING..." : "CHECK AGAIN"}
            </button>
          </div>
        </div>

        <p className="text-center text-[#52525B] text-xs mt-6 px-4">
          Complete the required actions, then tap CHECK AGAIN to open the app.
        </p>
      </div>

      {/* Error Modal */}
      <AnimatePresence>
        {errorMsg && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setErrorMsg("")}
              className="absolute inset-0 bg-black/80 z-40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ y: 100, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: 100, opacity: 0 }} 
              className="absolute bottom-10 left-4 right-4 z-50"
            >
              <div className="bg-[#18181B] border border-white/10 rounded-[20px] p-5 shadow-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 border border-amber-500/50 text-sm font-bold">
                    !
                  </div>
                  <h3 className="text-white font-bold text-[16px]">Access Denied</h3>
                </div>
                <p className="text-gray-400 text-sm mb-5 leading-relaxed">{errorMsg}</p>
                <button 
                  onClick={() => setErrorMsg("")}
                  className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white font-bold py-3.5 rounded-xl text-[14px] active:scale-[0.98] transition-all"
                >
                  OK, GOT IT
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}