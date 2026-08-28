import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TelegramProvider } from './contexts/TelegramContext';
import AppLayout from './components/layout/AppLayout';

// Import all your pages
import FreeCanva from './pages/FreeCanva';
import Tasks from './pages/Tasks';
import Redeem from './pages/Redeem';
import ProUsers from './pages/ProUsers';
import Profile from './pages/Profile';
import RewardHistory from './pages/RewardHistory';
import Admin from './pages/Admin';

const queryClient = new QueryClient();

const BottomNav = () => {
  const location = useLocation();
  
  // Optional: Hide the bottom nav on the Admin dashboard to give it full screen space
  if (location.pathname === '/admin') return null;

  const navItems = [
    { path: '/', emoji: '🎁', label: 'Free Canva', activeBg: '#ede9fe', activeColor: '#7c3aed' },
    { path: '/tasks', emoji: '🎯', label: 'Earn Points', activeBg: '#fee2e2', activeColor: '#ef4444' },
    { path: '/redeem', emoji: '🛍️', label: 'Redeem', activeBg: '#d1fae5', activeColor: '#059669' },
    { path: '/pro-users', emoji: '🌟', label: 'Pro Users', activeBg: '#fef3c7', activeColor: '#d97706' },
    { path: '/profile', emoji: '👤', label: 'Profile', activeBg: '#e0f2fe', activeColor: '#0284c7' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-safe shadow-[0_-1px_8px_rgba(0,0,0,0.06)]">
      <nav className="flex items-center justify-around h-16 px-1 max-w-md mx-auto">
        {navItems.map(({ path, emoji, label, activeBg, activeColor }) => {
          const isActive = location.pathname === path;
          return (
            <Link key={path} to={path} className="relative flex flex-col items-center justify-center flex-1 h-full gap-0.5">
              {isActive && (
                <div 
                  className="absolute inset-x-0.5 top-1 bottom-1 rounded-xl"
                  style={{ backgroundColor: activeBg }}
                />
              )}
              <span className="z-10 leading-none select-none text-2xl" style={{ filter: isActive ? 'none' : 'grayscale(1)' }}>{emoji}</span>
              <span className="z-10 text-[10px] font-bold leading-none" style={{ color: isActive ? activeColor : '#9ca3af' }}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TelegramProvider>
        <BrowserRouter>
          {/* AppLayout now wraps the Routes AND the BottomNav */}
          <AppLayout>
            <Routes>
              <Route path="/" element={<FreeCanva />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/redeem" element={<Redeem />} />
              <Route path="/pro-users" element={<ProUsers />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/reward-history" element={<RewardHistory />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
            <BottomNav />
          </AppLayout>
        </BrowserRouter>
      </TelegramProvider>
    </QueryClientProvider>
  );
}