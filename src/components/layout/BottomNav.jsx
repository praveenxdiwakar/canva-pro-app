import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Free Canva', icon: '🎨' },
    { path: '/tasks', label: 'Earn Points', icon: '🎯' },
    { path: '/redeem', label: 'Redeem', icon: '🎁' },
    { path: '/pro-users', label: 'Pro Users', icon: '👑' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-3 flex justify-around items-center z-50 max-w-md mx-auto shadow-lg">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              isActive ? 'text-purple-600 font-bold' : 'text-gray-400 font-medium'
            }`}
          >
            <span className="text-xl mb-0.5">{item.icon}</span>
            <span className="text-[10px]">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}