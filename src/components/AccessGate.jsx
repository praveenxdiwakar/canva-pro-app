import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelegram } from '../contexts/TelegramContext';
import { supabase } from '../api/supabase';

export default function AccessGate({ children }) {
  const { user } = useTelegram();
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Local state to track which steps the user has completed
  const [completed, setCompleted] = useState({
    bot: false,
    channel: false,
    group: false
  });

  const tasks = [
    { id: 'bot', title: 'Start Bot', subtitle: '@CanvaProMiniAppBot', url: 'https://t.me/CanvaProMiniAppBot' },
    { id: 'channel', title: 'Join Channel', subtitle: '@CanvaProMiniApp', url: 'https://t.me/CanvaProMiniApp' },
    { id: 'group', title: 'Join Group', subtitle: '@CanvaProLinkCommunity', url: 'https://t.me/CanvaProLinkCommunity' }
  ];

  // 1. Instant Realtime Database Detection
  useEffect(() => {
    if (!user?.telegramId) {
      setLoading(false);
      return;
    }

    const tgIdStr = String(user.telegramId);

    // Function to check access initially
    const checkAccess = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('is_bot_started, is_channel_joined, is_group_joined')
          .eq('telegram_id', tgIdStr)
          .single();

        if (data) {
          setCompleted({
            bot: data.is_bot_started || false,
            channel: data.is_channel_joined || false,
            group: data.is_group_joined || false
          });
        } else {
          // Fallback to local storage
          const localData = JSON.parse(localStorage.getItem(`access_${tgIdStr}`)) || {};
          setCompleted(prev => ({ ...prev, ...localData }));
        }
      } catch (err) {
        console.error("DB Check failed", err);
      }
      setLoading(false);
    };

    checkAccess(); // Run initial check

    // 🚀 MAGIC: Instant Realtime Listener!
    // The millisecond the database updates, the UI changes instantly with ZERO delay.
    const accessSubscription = supabase
      .channel(`access-check-${tgIdStr}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'users',
        filter: `telegram_id=eq.${tgIdStr}` 
      }, (payload) => {
        setCompleted({
          bot: payload.new.is_bot_started || false,
          channel: payload.new.is_channel_joined || false,
          group: payload.new.is_group_joined || false
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(accessSubscription);
    };
  }, [user?.telegramId]);

  const openTelegramLink = (url, id) => {
    const tg = window.Telegram?.WebApp;
    if (tg && tg.openTelegramLink) {
      tg.openTelegramLink(url);
    } else if (tg && tg.openLink) {
      tg.openLink(url);
    } else {
      window.open(url, '_blank');
    }

    // Optimistically mark as clicked locally for instant UI feedback
    const newState = { ...completed, [id]: true };
    setCompleted(newState);
    if (user?.telegramId) {
      localStorage.setItem(`access_${user.telegramId}`, JSON.stringify(newState));
    }
  };

  const handleVerify = () => {
    setVerifying(true);
    setErrorMsg("");

    // Fast 1-second simulated delay for snappy UI feedback
    setTimeout(async () => {
      if (user?.telegramId) {
        const { data } = await supabase
          .from('users')
          .select('is_bot_started, is_channel_joined, is_group_joined')
          .eq('telegram_id', String(user.telegramId))
          .single();

        const isFullyJoined = data?.is_bot_started && data?.is_channel_joined && data?.is_group_joined;
        const localData = JSON.parse(localStorage.getItem(`access_${user.telegramId}`)) || {};
        const localFullyJoined = localData.bot && localData.channel && localData.group;

        if (isFullyJoined || localFullyJoined) {
          setVerifying(false);
        } else {
          setVerifying(false);
          setErrorMsg("Unable to verify membership. Please try again.");
        }
      } else {
        setVerifying(false);
        setErrorMsg("Unable to identify user.");
      }
    }, 1000); // ⚡ Reduced to 1 second
  };

  const hasFullAccess = completed.bot && completed.channel && completed.group;

  // If loading or they have full access, render the main app seamlessly!
  if (loading) return null; 
  if (hasFullAccess) return children;

  // Render the Dark Theme Access Gate
  return (
    <div className="min-h-[100dvh] bg-[#0E0E11] text-white flex flex-col font-sans relative overflow-hidden">
      
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
        <button className="text-gray-400 hover:text-white p-1">✕</button>
        <h1 className="text-[16px] font-bold tracking-wide">Share Canva Pro Free</h1>
        <div className="flex items-center gap-3">
          <button className="text-gray-400 hover:text-white"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg></button>
          <button className="text-gray-400 hover:text-white"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg></button>
        </div>
      </div>

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
          <p className="text-sm text-gray-400 mb-6">Complete all the steps below to use the app.</p>

          {/* Task List */}
          <div className="space-y-5 mb-8">
            {tasks.map((task) => {
              const isDone = completed[task.id];
              return (
                <div key={task.id} className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${isDone ? 'border-[#10B981] bg-[#10B981]/10' : 'border-gray-600'}`}>
                    {isDone && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <div>
                    <h4 className={`text-[15px] font-bold ${isDone ? 'text-[#10B981]' : 'text-white'}`}>{task.title}</h4>
                    <p className="text-xs text-gray-500">{task.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dynamic Action Buttons */}
          <div className="space-y-3">
            {tasks.map(task => {
              if (!completed[task.id]) {
                return (
                  <button 
                    key={`btn-${task.id}`}
                    onClick={() => openTelegramLink(task.url, task.id)}
                    className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white font-bold py-3.5 rounded-xl text-[14px] active:scale-[0.98] transition-all tracking-wide"
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
              className="w-full bg-[#27272A] hover:bg-[#3F3F46] text-white font-bold py-3.5 rounded-xl text-[14px] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {verifying ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              )}
              {verifying ? "VERIFYING..." : "CHECK AGAIN"}
            </button>
          </div>
        </div>

        <p className="text-center text-[#52525B] text-xs mt-6 px-4">
          After completing the steps, tap CHECK AGAIN to open the app.
        </p>
      </div>

      {/* Error Modal */}
      <AnimatePresence>
        {errorMsg && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 z-40 backdrop-blur-sm" />
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="absolute bottom-10 left-4 right-4 z-50">
              <div className="bg-[#18181B] border border-white/10 rounded-[20px] p-5 shadow-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 border border-amber-500/50">!</div>
                  <h3 className="text-white font-bold text-[16px]">Access check failed</h3>
                </div>
                <p className="text-gray-400 text-sm mb-5">{errorMsg}</p>
                <button 
                  onClick={() => setErrorMsg("")}
                  className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white font-bold py-3.5 rounded-xl text-[14px] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                  RETRY
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}