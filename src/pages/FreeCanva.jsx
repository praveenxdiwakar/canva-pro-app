import React from 'react';
import { motion } from 'framer-motion';

export default function FreeCanva() {
  const steps = [
    { id: 1, completed: false }, 
    { id: 2, completed: false },
    { id: 3, completed: false }, 
    { id: 4, completed: false }
  ];

  return (
    <div className="flex flex-col min-h-[calc(100dvh-5rem)] bg-[#f5f5f5] pb-24">
      <div className="relative w-full h-44 overflow-hidden bg-gray-900">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gradient-to-br from-[#7c3aed] to-[#06b6d4]">
          <h1 className="text-4xl font-black italic tracking-tighter" style={{ fontFamily: 'Georgia, serif' }}>Canva</h1>
        </div>
      </div>

      <div className="px-4 pt-4 pb-4 space-y-3">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl px-4 py-6 border border-gray-100 shadow-sm space-y-6">
          
          <div className="relative w-full max-w-[260px] mx-auto mt-2 mb-2">
            <div className="absolute top-[18px] left-[12%] right-[12%] h-[3px] bg-gray-200 z-0 rounded-full"></div>

            <div className="relative z-10 flex justify-between items-start w-full">
              {steps.map((step, index) => {
                const isActive = index === 0;
                return (
                  <div key={index} className="flex flex-col items-center w-14">
                    <div className="bg-white p-1 rounded-full mb-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition-all ${isActive ? "bg-white border-[2.5px] border-[#6200EA] text-[#6200EA]" : "bg-gray-100 border-[2.5px] border-gray-200 text-gray-400"}`}>
                        {step.id}
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold text-center ${isActive ? "text-gray-700" : "text-gray-400"}`}>Step {step.id}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <button className="w-full bg-[#6200EA] active:scale-[0.98] text-white font-black text-[17px] py-4 rounded-xl shadow-md transition-all">
            Watch Ads to Unlock Canva Pro
          </button>
        </motion.div>
      </div>
    </div>
  );
}