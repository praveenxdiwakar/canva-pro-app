import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useSwipeNavigation(prevPath, nextPath) {
  const navigate = useNavigate();
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Minimum distance (in pixels) required to trigger a swipe
  const minSwipeDistance = 50;

  // --- MOBILE TOUCH SUPPORT ---
  const onTouchStart = (e) => {
    setTouchEnd(null); // Reset the end position
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      target: e.target, // Save the exact element the user touched
    });
  };

  const onTouchMove = (e) => {
    // Actively track the finger as it moves across the screen
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    
    // Check if the swipe is mostly horizontal
    const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontal && Math.abs(distanceX) > minSwipeDistance) {
      
      // 🛡️ CRITICAL: Check if the original touch started inside our sliders
      // We use optional chaining (?.) to be incredibly safe against text nodes
      if (touchStart.target?.closest?.('.no-page-swipe')) {
        // Reset states so they can just casually scroll the carousel
        setTouchStart(null);
        setTouchEnd(null);
        return;
      }

      if (distanceX > minSwipeDistance && nextPath) {
        navigate(nextPath); // Swiped Left -> Next Page
      } else if (distanceX < -minSwipeDistance && prevPath) {
        navigate(prevPath); // Swiped Right -> Previous Page
      }
    }
    
    // Reset states after evaluating the swipe
    setTouchStart(null);
    setTouchEnd(null);
  };

  // --- DESKTOP MOUSE SUPPORT (For testing on PC) ---
  const onMouseDown = (e) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.clientX,
      y: e.clientY,
      target: e.target,
    });
  };

  const onMouseMove = (e) => {
    // Only track movement if the mouse button is actively being held down
    if (touchStart) {
      setTouchEnd({
        x: e.clientX,
        y: e.clientY,
      });
    }
  };

  const onMouseUp = () => {
    onTouchEnd(); // Re-use the exact same logic from the Mobile Touch End!
  };

  // Return all handlers so the <div> can catch every type of movement
  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave: onMouseUp, // Failsafe: Triggers if the mouse gets dragged off the screen
  };
}