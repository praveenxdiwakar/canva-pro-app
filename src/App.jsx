import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TelegramProvider } from './contexts/TelegramContext';
import AppLayout from './components/layout/AppLayout';

import FreeCanva from './pages/FreeCanva';
import Tasks from './pages/Tasks';
import Redeem from './pages/Redeem';
import ProUsers from './pages/ProUsers';
import RewardHistory from './pages/RewardHistory';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TelegramProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<FreeCanva />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/redeem" element={<Redeem />} />
              <Route path="/pro-users" element={<ProUsers />} />
              <Route path="/reward-history" element={<RewardHistory />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TelegramProvider>
    </QueryClientProvider>
  );
}