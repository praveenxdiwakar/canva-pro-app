import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const navItems = [
  { href: "/tasks", emoji: "🎯", label: "Earn Points", activeBg: "#fee2e2", activeColor: "#ef4444" },
  { href: "/redeem", emoji: "🛍️", label: "Redeem", activeBg: "#d1fae5", activeColor: "#059669" },
  { href: "/pro-users", emoji: "🌟", label: "Pro Users", activeBg: "#fef3c7", activeColor: "#d97706" },
  { href: "/profile", emoji: "👤", label: "Profile", activeBg: "#e0f2fe", activeColor: "#0284c7" }
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-safe shadow-[0_-1px_8px_rgba(0,0,0,0.06)]">
      <nav className="flex items-center justify-around h-16 px-1 max-w-md mx-auto">
        {navItems.map(({ href, emoji, label, activeBg, activeColor }) => {
          // Check if current route matches (or if we are on the root path defaulting to tasks)
          const isActive = location.pathname === href || (location.pathname === '/' && href === '/tasks');

          return (
            <Link key={href} to={href} className="relative flex flex-col items-center justify-center flex-1 h-full gap-0.5">
              {isActive && (
                <motion.div 
                  layoutId="bottom-nav-indicator" 
                  className="absolute inset-x-0.5 top-1 bottom-1 rounded-xl"
                  style={{ backgroundColor: activeBg }}
                  initial={false}
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                />
              )}
              <span 
                className="z-10 leading-none select-none text-2xl" 
                style={{ filter: isActive ? "none" : "grayscale(0.1) opacity(0.7)" }}
              >
                {emoji}
              </span>
              <span 
                className="z-10 text-[10px] font-bold leading-none"
                style={{ color: isActive ? activeColor : "#9ca3af" }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}