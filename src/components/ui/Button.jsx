import React from 'react';

export default function Button({ 
  children, 
  onClick, 
  disabled, 
  variant = 'primary',
  className = '' 
}) {
  const baseStyle = "w-full font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100";
  
  const variants = {
    primary: "bg-[#6200EA] hover:bg-[#4A00B4] text-white shadow-md shadow-purple-100",
    secondary: "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50",
    success: "bg-green-500 hover:bg-green-600 text-white shadow-sm",
    gradient: "bg-gradient-to-r from-[#6704E3] to-[#8B22AF] text-white shadow-md shadow-purple-100 hover:opacity-90",
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}