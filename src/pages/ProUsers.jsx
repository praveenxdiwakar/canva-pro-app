import React from 'react';
import { motion } from 'framer-motion';

export default function ProUsers() {
  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24">
      <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100 shadow-sm relative z-10">
        <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">⭐ Pro Users</h1>
        <p className="text-xs text-gray-500 mt-1 font-medium">6 active · 4 expiring · 8 expired</p>
        
        {/* Search Bar */}
        <div className="relative mt-4 mb-2">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input 
            type="text" 
            placeholder="Search by name or username..." 
            className="w-full bg-gray-100 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          <button className="bg-[#9333ea] text-white text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap shadow-sm">
            Active <span className="bg-white/20 px-1.5 py-0.5 rounded-full ml-1">6</span>
          </button>
          <button className="bg-gray-100 text-gray-600 text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
            Expiring Soon <span className="bg-gray-200 px-1.5 py-0.5 rounded-full ml-1">4</span>
          </button>
          <button className="bg-gray-100 text-gray-600 text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
            Expired <span className="bg-gray-200 px-1.5 py-0.5 rounded-full ml-1">8</span>
          </button>
          <button className="bg-gray-100 text-gray-600 text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
            All <span className="bg-gray-200 px-1.5 py-0.5 rounded-full ml-1">18</span>
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-2">
        <UserRow initial="MS" name="Md. Sahid Hasan" days="7d left" color="bg-pink-500" points="20" />
        <UserRow initial="HY" name="Huian Y." days="7d left" color="bg-green-500" points="20" />
        <UserRow initial="R" name="Riyad" days="6d left" color="bg-orange-500" points="20" />
        <UserRow initial="MS" name="MD SHM Chowdhury T." days="28d left" color="bg-purple-500" points="80" />
        <UserRow initial="MP" name="Meet P." days="13d left" color="bg-orange-500" points="45" />
        <UserRow initial="B" name="Badong" days="4d left" color="bg-blue-500" points="20" />
        
        <div className="text-center pt-4 text-[11px] font-medium text-gray-400">
          6 members shown
        </div>
      </div>
    </div>
  );
}

function UserRow({ initial, name, days, color, points }) {
  return (
    <motion.div initial={{ opacity: 0, y: 5 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-2xl p-3 flex items-center justify-between border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${color}`}>
          {initial}
        </div>
        <div>
          <div className="font-black text-gray-900 text-sm">{name}</div>
          <div className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-purple-100">
            {days.split(' ')[0]} · {points}pts
          </div>
        </div>
      </div>
      <div className="text-xs font-bold text-orange-500">
        {days}
      </div>
    </motion.div>
  );
}