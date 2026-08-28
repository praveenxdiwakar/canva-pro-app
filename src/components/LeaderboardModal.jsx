import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useTelegram } from '../contexts/TelegramContext';

const colors = ["#f472b6", "#818cf8", "#34d399", "#60a5fa", "#f97316", "#a78bfa", "#f59e0b", "#10b981"];
const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };

function Avatar({ name, color, size = 40 }) {
  const initial = name ? name.split(" ").map(l => l[0]).join("").slice(0, 2).toUpperCase() : "??";
  return (
    <div className="rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-sm"
         style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.35 }}>
      {initial}
    </div>
  );
}

export default function LeaderboardModal({ onClose }) {
  const { initData } = useTelegram();
  
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const res = await fetch("/api/users/leaderboard", { headers: { "x-init-data": initData } });
      if (!res.ok) throw new Error("Failed to load leaderboard");
      return res.json();
    },
    enabled: !!initData,
    staleTime: 60000
  });

  // The podium order visually displays 2nd place, 1st place, then 3rd place
  const podiumOrder = [1, 0, 2];
  const podiumHeights = ["h-20", "h-28", "h-16"];
  const podiumSizes = [52, 64, 48];

  return (
    <motion.div
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/50 flex flex-col justify-end"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 48px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: "100%" }} 
        animate={{ y: 0 }} 
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="w-full bg-[#f5f5f5] rounded-t-3xl max-h-[85dvh] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100 rounded-t-3xl flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-black text-gray-900">🏆 Leaderboard</h2>
            <p className="text-sm text-gray-400 mt-0.5 font-medium">Top earners ranked by points</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        {/* Scrollable List */}
        <div className="overflow-y-auto flex-1 px-4 pt-4 space-y-2 no-scrollbar" style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom, 0px))" }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
            </div>
          ) : !leaderboard || leaderboard.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100">
              <div className="text-5xl mb-3">🏆</div>
              <div className="font-bold text-gray-700 text-lg">No entries yet</div>
              <div className="text-sm text-gray-400 mt-1">Complete tasks to appear here!</div>
            </div>
          ) : (
            <>
              {/* Podium Section */}
              {leaderboard.length > 0 && (
                <div className="flex items-end justify-center gap-3 py-4 mb-3">
                  {podiumOrder.map((index, i) => {
                    const user = leaderboard[index];
                    if (!user || user.rank > 3) return null;
                    const rank = user.rank;
                    const color = colors[(rank - 1) % colors.length];
                    return (
                      <div key={user.id || rank} className="flex flex-col items-center gap-1">
                        <Avatar name={user.displayName} color={color} size={podiumSizes[i]} />
                        <div className="text-[11px] font-bold text-gray-700 max-w-[70px] truncate text-center mt-1">{user.displayName}</div>
                        <div className="text-[11px] text-purple-600 font-bold">⭐ {user.points}</div>
                        <div
                          className={`${podiumHeights[i]} w-16 rounded-t-2xl flex items-start justify-center pt-2 font-black text-white text-xl shadow-inner`}
                          style={{ backgroundColor: color }}
                        >
                          {medals[rank]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Leaderboard Rows */}
              {leaderboard.map((user, index) => (
                <motion.div
                  key={user.id || index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 border shadow-sm ${user.isCurrentUser ? "border-purple-300 bg-purple-50" : "border-gray-100"}`}
                >
                  <div className="w-8 text-center font-black text-gray-400 shrink-0 text-sm">
                    {medals[user.rank] ?? `#${user.rank}`}
                  </div>
                  <Avatar name={user.displayName} color={colors[(user.rank - 1) % colors.length]} />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-sm truncate flex items-center gap-1.5">
                      {user.displayName}
                      {user.isCurrentUser && (
                        <span className="text-[10px] bg-purple-200 text-purple-700 font-black px-2 py-0.5 rounded-full">YOU</span>
                      )}
                    </div>
                    {user.username && <div className="text-[11px] text-gray-400 font-medium truncate">@{user.username}</div>}
                  </div>
                  <div className="text-sm font-black text-amber-500 shrink-0">
                    ⭐ {user.points}
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}