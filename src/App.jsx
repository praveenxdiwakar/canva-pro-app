import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TelegramProvider } from './contexts/TelegramContext';
import AppLayout from './components/layout/AppLayout';

import Tasks from './pages/Tasks';
import Redeem from './pages/Redeem';
import ProUsers from './pages/ProUsers';
import Profile from './pages/Profile';
import RewardHistory from './pages/RewardHistory';
import Admin from './pages/Admin';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TelegramProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Tasks />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/redeem" element={<Redeem />} />
              <Route path="/pro-users" element={<ProUsers />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/reward-history" element={<RewardHistory />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </TelegramProvider>
    </QueryClientProvider>
  );
}