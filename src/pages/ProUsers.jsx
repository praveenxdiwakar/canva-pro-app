import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTelegram } from '../contexts/TelegramContext';
import { motion } from 'framer-motion';

const TABS = [
  { key: "active", label: "Active" },
  { key: "expiring", label: "Expiring Soon" },
  { key: "expired", label: "Expired" },
  { key: "all", label: "All" }
];

const colors = ["#f472b6", "#818cf8", "#34d399", "#60a5fa", "#f97316", "#a78bfa", "#f59e0b", "#10b981", "#ec4899", "#38bdf8"];

function Avatar({ name, color, size = 40 }) {
  const initial = name ? name.split(" ").map(l => l[0]).join("").slice(0, 2).toUpperCase() : "??";
  return (
    <div className="rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-sm"
         style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.35 }}>
      {initial}
    </div>
  );
}

function DaysLeftBadge({ daysLeft }) {
  if (daysLeft === 0) {
    return <span className="text-xs font-bold text-gray-400">Expired</span>;
  } else if (daysLeft <= 3) {
    return <span className="text-xs font-bold text-red-500">{daysLeft}d left</span>;
  } else if (daysLeft <= 7) {
    return <span className="text-xs font-bold text-orange-500">{daysLeft}d left</span>;
  } else {
    return <span className="text-xs font-bold text-green-500">{daysLeft}d left</span>;
  }
}

export default function ProUsers() {
  const { initData } = useTelegram();
  const [filter, setFilter] = useState("active");
  const [search, setSearch] = useState("");

  // Fetch the list of users who redeemed Canva Pro
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["pro-users"],
    queryFn: async () => {
      const res = await fetch("/api/users/pro-list", { headers: { "x-init-data": initData } });
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    enabled: !!initData,
    staleTime: 30000
  });

  // Calculate the counts for the tabs
  const counts = useMemo(() => ({
    active: users.filter(u => u.daysLeft > 3).length,
    expiring: users.filter(u => u.daysLeft > 0 && u.daysLeft <= 3).length,
    expired: users.filter(u => u.daysLeft === 0).length,
    all: users.length
  }), [users]);

  // Apply the filters and search to the list
  const filteredUsers = useMemo(() => {
    let list = users;
    
    if (filter === "active") list = list.filter(u => u.daysLeft > 3);
    if (filter === "expiring") list = list.filter(u => u.daysLeft > 0 && u.daysLeft <= 3);
    if (filter === "expired") list = list.filter(u => u.daysLeft === 0);
    
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(u => 
        (u.displayName && u.displayName.toLowerCase().includes(q)) || 
        (u.username && u.username.toLowerCase().includes(q))
      );
    }
    
    return list;
  }, [users, filter, search]);

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[80vh] items-center justify-center bg-[#f5f5f5]">
        <div className="w-8 h-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100dvh-5rem)] pb-24">
      
      {/* Sticky Header with Search and Tabs */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100 shadow-sm relative z-10">
        <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">⭐ Pro Users</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {counts.active} active · {counts.expiring} expiring · {counts.expired} expired
        </p>
        
        {/* Search Bar */}
        <div className="relative mt-4 mb-2">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or username..." 
            className="w-full bg-gray-100 rounded-xl pl-9 pr-9 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-purple-300 transition-all"
          />
          {search && (
            <button 
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 bg-gray-200 rounded-full"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map(tab => {
            const isActive = filter === tab.key;
            return (
              <button 
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isActive 
                    ? "bg-[#9333ea] text-white shadow-sm" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                  isActive ? "bg-white/20" : "bg-gray-200"
                }`}>
                  {counts[tab.key]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Filtered User List */}
      <div className="px-4 pt-4 space-y-2">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-4xl mb-2">🔍</div>
            <div className="text-gray-500 font-bold text-sm">No users found</div>
          </div>
        ) : (
          filteredUsers.map((user, idx) => (
            <motion.div 
              key={user.id || idx}
              initial={{ opacity: 0, y: 5 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ delay: (idx % 10) * 0.03 }}
              className="bg-white rounded-2xl p-3 flex items-center justify-between border border-gray-100 shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={user.displayName} color={colors[idx % colors.length]} />
                <div className="min-w-0">
                  <div className="font-black text-gray-900 text-sm truncate">{user.displayName}</div>
                  <div className="text-[10px] font-bold bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full inline-flex items-center mt-0.5 border border-purple-100">
                    {user.durationDays || 7}d · {user.pointsSpent || 20}pts
                  </div>
                </div>
              </div>
              <div className="shrink-0 ml-3">
                <DaysLeftBadge daysLeft={user.daysLeft} />
              </div>
            </motion.div>
          ))
        )}
        
        {filteredUsers.length > 0 && (
          <div className="text-center pt-4 pb-2 text-[11px] font-medium text-gray-400">
            {filteredUsers.length} members shown
          </div>
        )}
      </div>
    </div>
  );
}