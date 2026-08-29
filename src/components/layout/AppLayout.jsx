import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] text-gray-900 max-w-md mx-auto relative shadow-2xl overflow-x-hidden">
      <main>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}