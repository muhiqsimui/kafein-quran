import { useEffect } from 'react';

export function useScrollToAyah(activeAyah: number | null) {
  useEffect(() => {
    if (activeAyah !== null) {
      const element = document.getElementById(`ayah-${activeAyah}`);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [activeAyah]);
}
