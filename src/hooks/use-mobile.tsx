
import { useEffect, useState } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window is defined (for SSR compatibility)
    if (typeof window !== 'undefined') {
      const checkSize = () => {
        setIsMobile(window.innerWidth < 768);
      };

      // Initial check
      checkSize();

      // Add event listener
      window.addEventListener('resize', checkSize);

      // Cleanup
      return () => window.removeEventListener('resize', checkSize);
    }
  }, []);

  return isMobile;
}
