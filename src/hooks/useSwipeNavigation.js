import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export function useSwipeNavigation(prevPath, nextPath) {
  const navigate = useNavigate();
  
  // 🔥 useRef is INSTANT. It captures lightning-fast swipes without waiting for React to re-render.
  const startX = useRef(null);
  const startY = useRef(null);

  const minSwipeDistance = 50; // pixels

  // --- MOBILE TOUCH SUPPORT ---
  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e) => {
    if (!startX.current || !startY.current) return;
    
    // Grab the exact pixel where the finger left the screen
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    
    handleSwipe(startX.current, startY.current, endX, endY, e.target);
  };

  // --- DESKTOP MOUSE SUPPORT (For testing on PC) ---
  const onMouseDown = (e) => {
    startX.current = e.clientX;
    startY.current = e.clientY;
  };

  const onMouseUp = (e) => {
    if (!startX.current || !startY.current) return;
    
    const endX = e.clientX;
    const endY = e.clientY;
    
    handleSwipe(startX.current, startY.current, endX, endY, e.target);
  };

  // --- THE BRAIN OF THE ENGINE ---
  const handleSwipe = (sx, sy, ex, ey, target) => {
    const distanceX = sx - ex;
    const distanceY = sy - ey;
    
    // Check if the swipe was mostly left/right instead of up/down
    const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontal && Math.abs(distanceX) > minSwipeDistance) {
      
      // 🛡️ CRITICAL: Ignore the page swipe if the user is scrolling our internal sliders!
      if (target.closest('.no-page-swipe')) {
        startX.current = null;
        startY.current = null;
        return;
      }

      if (distanceX > minSwipeDistance && nextPath) {
        navigate(nextPath); // Swiped Left -> Next Page
      } else if (distanceX < -minSwipeDistance && prevPath) {
        navigate(prevPath); // Swiped Right -> Previous Page
      }
    }
    
    // Reset memory for the next swipe
    startX.current = null;
    startY.current = null;
  };

  return {
    onTouchStart,
    onTouchEnd,
    onMouseDown,
    onMouseUp,
    onMouseLeave: onMouseUp // Failsafe if mouse gets dragged off screen
  };
}