import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useSwipeNavigation(prevPath, nextPath) {
  const navigate = useNavigate();
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);

  const onTouchStart = (e) => {
    // Record the exact X and Y coordinates where the user's finger touches the screen
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const onTouchEnd = (e) => {
    if (!touchStartX || !touchStartY) return;
    
    // Record the exact X and Y coordinates where the user's finger lifts off the screen
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    // Calculate how far the finger moved horizontally and vertically
    const distanceX = touchStartX - touchEndX;
    const distanceY = touchStartY - touchEndY;
    
    // Check if it's a horizontal swipe (X distance > Y distance) AND long enough to be intentional (> 60px)
    if (Math.abs(distanceX) > Math.abs(distanceY) && Math.abs(distanceX) > 60) {
      
      // 🛡️ CRITICAL: Ignore the page swipe if the user is swiping inside a horizontal carousel!
      if (e.target.closest('.no-page-swipe')) return;

      if (distanceX > 60 && nextPath) {
        // Swiped Left -> Go to the Next Page
        navigate(nextPath); 
      } else if (distanceX < -60 && prevPath) {
        // Swiped Right -> Go to the Previous Page
        navigate(prevPath); 
      }
    }
  };

  // Return the event handlers to be spread onto your page containers
  return { onTouchStart, onTouchEnd };
}