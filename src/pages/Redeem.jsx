export default function Redeem() {
  return (
    <div className="bg-white px-5 pt-5 pb-5 border-b border-gray-100">
      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Redeem Canva Pro</div>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-200 flex-shrink-0">
          <span className="text-2xl">🪙</span>
        </div>
        <div>
          <div className="text-xs text-gray-400 font-medium">Your Balance</div>
          <div className="text-4xl font-black text-gray-900 leading-none">0</div>
        </div>
      </div>
    </div>
  );
}