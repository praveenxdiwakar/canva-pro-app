import React from 'react';

export default function Redeem() {
  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-24">
        {/* Header / Balance */}
        <div className="bg-white px-4 py-6 shadow-sm border-b border-gray-100 text-center">
            <h1 className="text-xs font-bold text-gray-400 tracking-wider mb-4 uppercase">Redeem Canva Pro</h1>
            <div className="flex justify-center items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                    🪙
                </div>
                <div className="text-left">
                    <p className="text-xs text-gray-500 font-medium">Your Balance</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-gray-900 leading-none">0</span>
                        <span className="text-xs font-bold text-gray-400">points</span>
                    </div>
                </div>
                <button className="ml-4 border border-purple-200 text-purple-600 bg-purple-50 font-bold px-4 py-1.5 rounded-full text-xs flex items-center gap-1">
                    ↗️ Earn
                </button>
            </div>

            {/* Progress to first reward */}
            <div className="flex justify-between items-end mb-1">
                <span className="text-[10px] text-gray-500">20 pts to first reward</span>
                <span className="text-[10px] font-bold text-purple-600">0%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '0%' }}></div>
            </div>
        </div>

        <div className="px-4 pt-6 space-y-4">
            
            {/* 7 Day Tier */}
            <div className="app-card p-5">
                 <div className="flex justify-between items-start mb-4">
                     <div className="flex gap-3">
                         <div className="w-12 h-12 rounded-xl border-2 border-gray-100 flex flex-col items-center justify-center text-gray-400">
                             <span className="text-lg font-black leading-none">7</span>
                             <span className="text-[8px] font-bold uppercase tracking-wider">Days</span>
                         </div>
                         <div>
                             <h3 className="font-bold text-gray-900 text-base leading-tight">Canva Pro</h3>
                             <p className="text-[10px] text-gray-500 mb-1">7 Days Full Access</p>
                             <div className="flex items-baseline gap-1">
                                 <span className="text-lg font-black text-gray-900">20</span>
                                 <span className="text-[10px] text-gray-500">points</span>
                             </div>
                         </div>
                     </div>
                     <span className="text-[10px] text-gray-400 font-medium">Starter</span>
                 </div>
                 
                 <div className="flex justify-between items-center mb-1">
                     <span className="text-[10px] font-bold text-gray-700">0 / 20 pts</span>
                     <span className="text-[10px] text-gray-400">Need 20 more</span>
                 </div>
                 <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
                     <div className="bg-gray-300 h-1.5 rounded-full" style={{ width: '0%' }}></div>
                 </div>

                 <button className="w-full border-2 border-gray-100 text-gray-400 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1 bg-gray-50/50" disabled>
                     🔒 Need 20 more points
                 </button>
            </div>

            {/* 15 Day Tier */}
            <div className="app-card p-5">
                 <div className="flex justify-between items-start mb-4">
                     <div className="flex gap-3">
                         <div className="w-12 h-12 rounded-xl border-2 border-gray-100 flex flex-col items-center justify-center text-gray-400">
                             <span className="text-lg font-black leading-none">15</span>
                             <span className="text-[8px] font-bold uppercase tracking-wider">Days</span>
                         </div>
                         <div>
                             <h3 className="font-bold text-gray-900 text-base leading-tight">Canva Pro</h3>
                             <p className="text-[10px] text-gray-500 mb-1">15 Days Full Access</p>
                             <div className="flex items-baseline gap-1">
                                 <span className="text-lg font-black text-gray-900">45</span>
                                 <span className="text-[10px] text-gray-500">points</span>
                             </div>
                         </div>
                     </div>
                     <span className="text-[10px] text-gray-400 font-medium">Quick Access</span>
                 </div>
                 
                 <div className="flex justify-between items-center mb-1">
                     <span className="text-[10px] font-bold text-gray-700">0 / 45 pts</span>
                     <span className="text-[10px] text-gray-400">Need 45 more</span>
                 </div>
                 <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
                     <div className="bg-gray-300 h-1.5 rounded-full" style={{ width: '0%' }}></div>
                 </div>

                 <button className="w-full border-2 border-gray-100 text-gray-400 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1 bg-gray-50/50" disabled>
                     🔒 Need 45 more points
                 </button>
            </div>

            {/* 30 Day Tier */}
            <div className="app-card p-5 relative overflow-hidden">
                 {/* Best Value Badge */}
                 <div className="absolute top-4 right-4 bg-orange-100 text-orange-600 font-bold text-[8px] px-2 py-1 rounded uppercase flex items-center gap-1">
                     🔥 Best Value
                 </div>

                 <div className="flex justify-between items-start mb-4">
                     <div className="flex gap-3">
                         <div className="w-12 h-12 rounded-xl border-2 border-gray-100 flex flex-col items-center justify-center text-gray-400">
                             <span className="text-lg font-black leading-none">30</span>
                             <span className="text-[8px] font-bold uppercase tracking-wider">Days</span>
                         </div>
                         <div>
                             <h3 className="font-bold text-gray-900 text-base leading-tight mt-1">Canva Pro</h3>
                             <p className="text-[10px] text-gray-500 mb-1">30 Days Full Access</p>
                             <div className="flex items-baseline gap-1">
                                 <span className="text-lg font-black text-gray-900">80</span>
                                 <span className="text-[10px] text-gray-500">points</span>
                             </div>
                         </div>
                     </div>
                 </div>
                 
                 <div className="flex justify-between items-center mb-1">
                     <span className="text-[10px] font-bold text-gray-700">0 / 80 pts</span>
                     <span className="text-[10px] text-gray-400">Need 80 more</span>
                 </div>
                 <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
                     <div className="bg-gray-300 h-1.5 rounded-full" style={{ width: '0%' }}></div>
                 </div>

                 <button className="w-full border-2 border-gray-100 text-gray-400 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1 bg-gray-50/50" disabled>
                     🔒 Need 80 more points
                 </button>
            </div>

            {/* Keep Earning CTA */}
            <div className="app-card p-5 bg-white text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-xl">🎯</span>
                    <h3 className="font-bold text-gray-900">Keep earning!</h3>
                </div>
                <p className="text-[10px] text-gray-500 mb-4">Watch ads · Complete tasks</p>
                <button className="w-full bg-[#9333EA] hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-md text-sm transition-colors">
                    Earn More Points &gt;
                </button>
            </div>

            <p className="text-center text-[10px] text-gray-400 mt-6">Need help? 🎧 Contact Support</p>

        </div>
    </div>
  );
}