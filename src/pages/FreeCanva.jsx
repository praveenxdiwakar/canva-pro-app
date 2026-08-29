import React, { useState } from 'react';

export default function FreeCanva() {
  // Simplified state for demonstration
  const [steps] = useState([
    { id: 1, text: "Step 1" },
    { id: 2, text: "Step 2" },
    { id: 3, text: "Step 3" },
    { id: 4, text: "Step 4" }
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] pb-24">
      {/* Banner Area (Replace with your actual image path) */}
      <div className="w-full h-48 bg-blue-500 overflow-hidden relative">
          <img src="/banner.jpg" alt="Canva Pro Banner" className="w-full h-full object-cover" />
      </div>

      <div className="px-4 pt-4 space-y-4 -mt-6 relative z-10">
        
        {/* Instruction Alert */}
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-start gap-3 shadow-sm">
           <span className="text-xl">📢</span>
           <p className="text-xs text-gray-600 font-medium pt-1">
             Complete 4 Step, the Canva Pro button will be unlocked. Then click again to open Canva Pro.
           </p>
        </div>

        {/* Steps Card */}
        <div className="app-card space-y-6">
           {/* Step Progress Visual (Simplified) */}
           <div className="flex justify-between items-center w-full px-2">
              {steps.map((step) => (
                 <div key={step.id} className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold
                                  ${step.id === 1 ? 'border-red-500 text-red-500' : 'border-gray-200 text-gray-400'}`}>
                        {step.id}
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold">{step.text}</span>
                 </div>
              ))}
           </div>
           
           <button className="w-full bg-[#6200EA] text-white font-bold py-4 rounded-xl shadow-md text-sm">
             Watch Ads to Unlock Canva Pro
           </button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
            <button className="w-full bg-gradient-to-r from-[#6200EA] to-[#9D4EDD] text-white font-bold py-4 rounded-xl shadow-md flex items-center justify-center gap-2 text-sm">
                <span className="text-lg">↗️</span> Join Channel
            </button>
            <button className="w-full bg-gradient-to-r from-[#6200EA] to-[#9D4EDD] text-white font-bold py-4 rounded-xl shadow-md flex items-center justify-center gap-2 text-sm">
                 <span className="text-lg">👥</span> Join Group
            </button>
            <button className="w-full bg-white border border-gray-200 text-gray-800 font-bold py-4 rounded-xl shadow-sm text-sm">
                How to join Canva Pro 🌿
            </button>
        </div>

        {/* Features Card */}
        <div className="app-card text-center">
            <h3 className="text-xs font-bold text-gray-500 tracking-wider mb-4">WHAT YOU GET</h3>
            <div className="grid grid-cols-3 gap-2">
                <div className="bg-purple-50 rounded-lg p-3 flex flex-col items-center gap-1 border border-purple-100">
                    <span className="text-xl">🎨</span>
                    <span className="text-[9px] font-bold text-purple-700 text-center">Premium Templates</span>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3 flex flex-col items-center gap-1 border border-yellow-100">
                    <span className="text-xl">✨</span>
                    <span className="text-[9px] font-bold text-yellow-700 text-center">Magic AI Tools</span>
                </div>
                <div className="bg-green-50 rounded-lg p-3 flex flex-col items-center gap-1 border border-green-100">
                    <span className="text-xl">🆓</span>
                    <span className="text-[9px] font-bold text-green-700 text-center">100% Free</span>
                </div>
            </div>
            <div className="mt-4 text-[10px] text-gray-400 font-medium flex items-center justify-center gap-1">
                🔒 No payment required
            </div>
        </div>

        <div className="text-center pb-6">
            <p className="text-[11px] font-bold text-[#6200EA]">by H2N</p>
            <p className="text-[10px] text-gray-400">@ShareCanvaProFree_Bot</p>
        </div>

      </div>
    </div>
  );
}