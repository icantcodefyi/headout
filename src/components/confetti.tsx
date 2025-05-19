'use client';

import { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from '~/hooks/use-window-size';

export function Confetti() {
  const { width, height } = useWindowSize();
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    // Fade out the confetti after 2 seconds
    const timeout = setTimeout(() => {
      setOpacity(0);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div 
      className="fixed inset-0 z-50 pointer-events-none"
      style={{ 
        opacity, 
        transition: 'opacity 1s ease-out' 
      }}
    >
      <ReactConfetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={200}
        gravity={0.2}
      />
    </div>
  );
} 