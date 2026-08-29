import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 max-w-md mx-auto relative shadow-2xl overflow-x-hidden pb-20"> 
      <main>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}