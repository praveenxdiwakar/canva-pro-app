import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export function useSwipeNavigation(prevPath, nextPath) {
  const navigate = useNavigate();
  
  const startX = useRef(null);
  const startY = useRef(null);
  const isNavigating = useRef(false); // 🛡️ Prevents double-firing and white screen crashes

  const minSwipeDistance = 50; // pixels

  const handleStart = (x, y) => {
    if (isNavigating.current) return;
    startX.current = x;
    startY.current = y;
  };

  const handleEnd = (x, y, target) => {
    if (!startX.current || !startY.current || isNavigating.current) return;
    
    const distanceX = startX.current - x;
    const distanceY = startY.current - y;
    
    startX.current = null;
    startY.current = null;
    
    const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontal && Math.abs(distanceX) > minSwipeDistance) {
      
      // 🛡️ Ignore page swipe if inside a horizontal carousel or slider
      if (target.closest('.no-page-swipe')) return;

      if (distanceX > minSwipeDistance && nextPath) {
        isNavigating.current = true;
        navigate(nextPath);
        // Release the navigation lock after 500ms
        setTimeout(() => { isNavigating.current = false; }, 500);
      } else if (distanceX < -minSwipeDistance && prevPath) {
        isNavigating.current = true;
        navigate(prevPath);
        // Release the navigation lock after 500ms
        setTimeout(() => { isNavigating.current = false; }, 500);
      }
    }
  };

  return {
    onTouchStart: (e) => handleStart(e.targetTouches[0].clientX, e.targetTouches[0].clientY),
    onTouchEnd: (e) => handleEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY, e.target),
    onMouseDown: (e) => handleStart(e.clientX, e.clientY),
    onMouseUp: (e) => handleEnd(e.clientX, e.clientY, e.target),
    onMouseLeave: () => { startX.current = null; startY.current = null; }
  };
}