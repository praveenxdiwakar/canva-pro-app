import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useSwipeNavigation(prevPath, nextPath) {
  const navigate = useNavigate();
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);

  const onTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const onTouchEnd = (e) => {
    if (!touchStartX || !touchStartY) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const distanceX = touchStartX - touchEndX;
    const distanceY = touchStartY - touchEndY;
    
    // Check if it's a horizontal swipe (and long enough to be intentional)
    if (Math.abs(distanceX) > Math.abs(distanceY) && Math.abs(distanceX) > 60) {
      
      // 🛡️ CRITICAL: Ignore the page swipe if the user is swiping inside a horizontal carousel!
      if (e.target.closest('.no-page-swipe')) return;

      if (distanceX > 60 && nextPath) {
        navigate(nextPath); // Swiped Left -> Go Next Page
      } else if (distanceX < -60 && prevPath) {
        navigate(prevPath); // Swiped Right -> Go Previous Page
      }
    }
  };

  return { onTouchStart, onTouchEnd };
}