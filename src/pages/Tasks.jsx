import React from 'react';

export default function Tasks() {
  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-24">
        {/* Banner Area */}
        <div className="w-full h-40 bg-gray-900 overflow-hidden relative">
           <img src="/earn-points-banner.png" alt="Earn Points" className="w-full h-full object-cover" />
        </div>

        <div className="px-4 pt-4 space-y-4">
            
            {/* Header / Points */}
            <div className="flex justify-between items-center bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🎯</span>
                    <h1 className="font-bold text-lg">Earn Points</h1>
                </div>
                <div className="flex gap-2">
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 font-bold px-3 py-1.5 rounded-full text-xs flex items-center gap-1">
                       ⭐ 0 pts
                    </div>
                    <button className="bg-purple-50 text-purple-600 font-bold px-3 py-1.5 rounded-full text-xs">
                        History
                    </button>
                </div>
            </div>

            {/* Next Reward Progress */}
            <div className="app-card">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                        <span>🏆</span>
                        <h2 className="font-bold text-sm text-gray-800">Next Canva Reward</h2>
                    </div>
                    <span className="bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded text-xs">0 / 20 pts</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">Canva Pro • 7 Days</p>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                     <div className="bg-purple-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
                <p className="text-[10px] text-gray-400">20 more points needed</p>
            </div>

            {/* Spin & Earn */}
            <div className="app-card border-pink-200 bg-pink-50/30 flex justify-between items-center cursor-pointer">
                <div>
                    <h2 className="font-bold text-sm text-gray-800 flex items-center gap-2">🎡 Spin & Earn</h2>
                    <div className="flex gap-1 text-yellow-400 text-xs my-1">⭐⭐⭐</div>
                    <p className="text-[10px] text-gray-500">3/3 Spins</p>
                </div>
                <span className="text-blue-500 font-bold text-xs">Tap to Spin ➔</span>
            </div>

            {/* Daily Check-in */}
            <div className="app-card">
                <h2 className="font-bold text-sm text-gray-800 flex items-center gap-2 mb-3">📅 Daily Check-in</h2>
                <div className="flex justify-between gap-1 mb-4">
                    {[
                        { day: 'D1', pts: '+1', active: true },
                        { day: 'D2', pts: '+1', active: false },
                        { day: 'D3', pts: '+1', active: false },
                        { day: 'D4', pts: '+2', active: false },
                        { day: 'D5', pts: '+2', active: false },
                        { day: 'D6', pts: '+2', active: false },
                        { day: 'D7', pts: '+3', active: false, special: true }
                    ].map((d, i) => (
                        <div key={i} className={`flex flex-col items-center justify-center w-10 h-10 rounded-full border-2 
                            ${d.active ? 'border-purple-500 bg-purple-50' : 'border-gray-100 bg-white'}
                        `}>
                            <span className={`text-[10px] font-bold ${d.active ? 'text-purple-600' : 'text-gray-400'}`}>{d.day}</span>
                            <span className={`text-[9px] font-black ${d.active ? 'text-purple-600' : (d.special ? 'text-yellow-500' : 'text-gray-300')}`}>{d.pts}</span>
                        </div>
                    ))}
                </div>
                <button className="w-full bg-[#10B981] text-white font-bold py-3 rounded-xl shadow-md text-xs">
                    CHECK-IN — Today's Reward: +1 pt
                </button>
            </div>

            {/* Tasks List */}
            <div className="space-y-3">
                {/* Watch Ad Task */}
                <div className="app-card flex justify-between items-center">
                     <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">📺</div>
                         <div>
                             <h3 className="font-bold text-sm text-gray-800">Watch Ads 01</h3>
                             <p className="text-[10px] text-gray-500">+1 Point / Ad</p>
                             <div className="flex gap-1 mt-1">
                                 {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>)}
                                 <span className="text-[8px] text-gray-400 ml-1">0/5</span>
                             </div>
                         </div>
                     </div>
                     <button className="bg-[#EF4444] text-white font-bold px-4 py-2 rounded-lg text-xs">WATCH ADS</button>
                </div>
                 {/* Watch Ad Task 2 */}
                <div className="app-card flex justify-between items-center">
                     <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">📺</div>
                         <div>
                             <h3 className="font-bold text-sm text-gray-800">Watch Ads 02</h3>
                             <p className="text-[10px] text-gray-500">+1 Point / Ad</p>
                             <div className="flex gap-1 mt-1">
                                 {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>)}
                                 <span className="text-[8px] text-gray-400 ml-1">0/5</span>
                             </div>
                         </div>
                     </div>
                     <button className="bg-[#EF4444] text-white font-bold px-4 py-2 rounded-lg text-xs">WATCH ADS</button>
                </div>

                {/* Join Channel Task */}
                <div className="app-card flex justify-between items-center">
                    <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xl">📢</div>
                         <div>
                             <h3 className="font-bold text-sm text-gray-800">Join Channel 01</h3>
                             <p className="text-[10px] text-gray-500">+2 pts · One time <span className="text-gray-400 ml-1">91 / 1000</span></p>
                         </div>
                     </div>
                     <div className="flex gap-2">
                        <button className="bg-[#3B82F6] text-white font-bold px-4 py-2 rounded-lg text-xs">JOIN</button>
                        <button className="bg-gray-100 text-gray-500 font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1">✓ Verify</button>
                     </div>
                </div>

                 {/* Invite Task */}
                <div className="app-card flex justify-between items-center">
                    <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-xl">👥</div>
                         <div>
                             <h3 className="font-bold text-sm text-gray-800">Invite Friends</h3>
                             <p className="text-[10px] text-gray-500">+5 pts / referral · Unlimited</p>
                         </div>
                     </div>
                     <button className="bg-[#06B6D4] text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1">
                        <span className="text-sm">⎘</span> COPY
                     </button>
                </div>
            </div>

        </div>
    </div>
  );
}