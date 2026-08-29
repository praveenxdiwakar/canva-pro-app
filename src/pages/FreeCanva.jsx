import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTelegram } from '../contexts/TelegramContext';
import { supabase } from '../api/supabase';

export default function FreeCanva() {
  const { user } = useTelegram();
  const [steps, setSteps] = useState([
    { id: 1, completed: false },
    { id: 2, completed: false },
    { id: 3, completed: false },
    { id: 4, completed: false }
  ]);
  const [canvaLink, setCanvaLink] = useState(null);

  useEffect(() => {
    supabase.from('canva_links').select('*').then(({ data }) => {
      if (data && data.length > 0) {
        // Find first link with available slots in JavaScript
        const available = data.find(l => l.used_slots < l.total_slots);
        if (available) {
          setCanvaLink(available.url);
        }
      }
    });
  }, []);

  const completedCount = steps.filter(s => s.completed).length;
  const progressPercentage = Math.min(100, Math.max(0, (completedCount / (steps.length - 1)) * 100));

  const handleOpenCanva = () => {
    if (canvaLink) {
      window.open(canvaLink, '_blank');
    } else {
      alert("All current Canva Pro slots are full! Check back soon or earn points in the Tasks tab.");
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100dvh-5rem)] bg-[#f5f5f5] pb-24">
      <div className="relative w-full h-44 overflow-hidden bg-gray-900">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] z-20">
          <h1 className="text-4xl font-black italic tracking-tighter drop-shadow-md" style={{ fontFamily: 'Georgia, serif' }}>Canva</h1>
        </div>
      </div>

      <div className="px-4 pt-4 pb-4 space-y-3">
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-start gap-2 shadow-sm">
          <span className="text-lg mt-0.5">📢</span>
          <p className="text-[13px] text-gray-600 leading-snug font-medium">
            Complete the 4 steps below to unlock your free Canva Pro access link instantly.
          </p>
        </div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl px-4 py-6 border border-gray-100 shadow-sm space-y-6">
          <div className="relative w-full max-w-[260px] mx-auto mt-2 mb-2">
            <div className="absolute top-[18px] left-[12%] right-[12%] h-[3px] bg-gray-200 z-0 rounded-full">
              <div className="h-full bg-[#6200EA] transition-all duration-500 rounded-full" style={{ width: `${progressPercentage}%` }} />
            </div>

            <div className="relative z-10 flex justify-between items-start w-full">
              {steps.map((step, index) => {
                const isActive = !step.completed && (index === 0 || steps[index - 1].completed);
                return (
                  <div key={index} className="flex flex-col items-center w-14">
                    <div className="bg-white p-1 rounded-full mb-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition-all ${step.completed ? "bg-[#6200EA] text-white" : isActive ? "bg-white border-[2.5px] border-[#6200EA] text-[#6200EA]" : "bg-gray-100 border-[2.5px] border-gray-200 text-gray-400"}`}>
                        {step.completed ? "✓" : step.id}
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold text-center ${step.completed ? "text-[#6200EA]" : isActive ? "text-gray-700" : "text-gray-400"}`}>Step {step.id}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <button onClick={handleOpenCanva} className="w-full bg-[#6200EA] hover:bg-[#4A00B4] active:scale-[0.98] text-white font-black text-[17px] py-4 rounded-xl shadow-md transition-all">
            Unlock Canva Pro Access
          </button>
        </motion.div>
      </div>
    </div>
  );
}