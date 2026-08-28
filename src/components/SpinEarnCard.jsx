import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { useTelegram } from '../contexts/TelegramContext';

const wheelSlices = [
  { label: "0", points: 0, color: "#e5e7eb", textColor: "#9ca3af" },
  { label: "+1", points: 1, color: "#86efac", textColor: "#166534" },
  { label: "0", points: 0, color: "#d1d5db", textColor: "#9ca3af" },
  { label: "+2", points: 2, color: "#93c5fd", textColor: "#1e3a8a" },
  { label: "0", points: 0, color: "#fda4af", textColor: "#be185d" },
  { label: "+5", points: 5, color: "#fdba74", textColor: "#7c2d12" },
  { label: "+1", points: 1, color: "#c4b5fd", textColor: "#4c1d95" },
  { label: "+20", points: 20, color: "#fcd34d", textColor: "#92400e" }
];
const sliceCount = wheelSlices.length;

export default function SpinEarnCard({ onWin }) {
  const { initData } = useTelegram();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinsLeft, setSpinsLeft] = useState(3);

  const handleSpin = async () => {
    if (isSpinning || spinsLeft <= 0) return;
    setIsSpinning(true);

    try {
      const res = await fetch('/api/tasks/spin', {
        method: 'POST',
        headers: { 'x-init-data': initData }
      });
      const data = res.ok ? await res.json() : { pointsWon: 1 };
      
      // Calculate target rotation to land on the won points slice
      const targetSliceIdx = wheelSlices.findIndex(s => s.points === data.pointsWon);
      const degreesPerSlice = 360 / sliceCount;
      const targetDeg = 360 - (targetSliceIdx * degreesPerSlice + degreesPerSlice / 2);
      const totalTurns = 360 * 5; // 5 full rotations

      setRotation(prev => prev + totalTurns + targetDeg);

      setTimeout(() => {
        setIsSpinning(false);
        setSpinsLeft(prev => Math.max(0, prev - 1));
        if (onWin) onWin();
      }, 4000);
    } catch {
      setIsSpinning(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-pink-100 shadow-sm ring-1 ring-pink-50 overflow-hidden">
      <button 
        onClick={() => setIsOpen(prev => !prev)} 
        className="w-full p-4 flex justify-between items-center text-left hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl drop-shadow-sm mt-0.5">🎡</span>
          <div>
            <div className="font-bold text-gray-900 text-sm">Spin & Earn</div>
            <div className="text-[10px] text-yellow-400 mt-0.5">⭐⭐⭐</div>
            <div className="text-[10px] text-gray-400 font-medium mt-0.5">{spinsLeft}/3 Spins</div>
          </div>
        </div>
        <div className="text-sm font-bold text-blue-500 flex items-center gap-1">
          {isOpen ? "Close ▲" : "Tap to Spin →"}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            transition={{ duration: 0.3 }}
            className="px-4 pb-4 border-t border-gray-100 pt-3"
          >
            <div className="flex flex-col items-center justify-center py-2">
              <div className="relative w-48 h-48 flex items-center justify-center mb-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10 w-0 h-0 border-l-[9px] border-r-[9px] border-b-[20px] border-l-transparent border-r-transparent border-b-gray-900 drop-shadow" />
                <svg 
                  width="200" 
                  height="200" 
                  viewBox="0 0 200 200" 
                  style={{ 
                    transform: `rotate(${rotation}deg)`, 
                    transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))'
                  }}
                >
                  {wheelSlices.map((slice, idx) => {
                    const startAngle = idx * 2 * Math.PI / sliceCount - Math.PI / 2;
                    const endAngle = startAngle + 2 * Math.PI / sliceCount;
                    const x1 = 100 + 85 * Math.cos(startAngle);
                    const y1 = 100 + 85 * Math.sin(startAngle);
                    const x2 = 100 + 85 * Math.cos(endAngle);
                    const y2 = 100 + 85 * Math.sin(endAngle);
                    const midAngle = startAngle + Math.PI / sliceCount;
                    const tx = 100 + 62 * Math.cos(midAngle);
                    const ty = 100 + 62 * Math.sin(midAngle);
                    const rotDeg = (idx + 0.5) * (360 / sliceCount);
                    const pathD = `M 100 100 L ${x1.toFixed(2)} ${y1.toFixed(2)} A 85 85 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;

                    return (
                      <g key={idx}>
                        <path d={pathD} fill={slice.color} stroke="white" strokeWidth="2" />
                        <text 
                          x={tx.toFixed(2)} 
                          y={ty.toFixed(2)} 
                          fill={slice.textColor} 
                          fontSize="10" 
                          fontWeight="900" 
                          textAnchor="middle" 
                          dominantBaseline="middle" 
                          transform={`rotate(${rotDeg}, ${tx.toFixed(2)}, ${ty.toFixed(2)})`}
                        >
                          {slice.label}
                        </text>
                      </g>
                    );
                  })}
                  <circle cx="100" cy="100" r="13" fill="white" stroke="#e5e7eb" strokeWidth="2" />
                  <circle cx="100" cy="100" r="7" fill="#7c3aed" />
                </svg>
              </div>

              <button 
                onClick={handleSpin}
                disabled={isSpinning || spinsLeft <= 0}
                className="w-full bg-gray-900 hover:bg-black disabled:bg-gray-300 text-white font-black text-sm py-3.5 rounded-xl shadow-md active:scale-[0.98] transition-all"
              >
                {isSpinning ? "Spinning..." : spinsLeft === 0 ? "No Spins Left" : "SPIN"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}