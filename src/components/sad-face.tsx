'use client';

import { useEffect, useState } from 'react';
import { useWindowSize } from '~/hooks/use-window-size';
import { motion } from 'motion/react';

export function SadFace() {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    // Fade out the animation after 2 seconds
    const timeout = setTimeout(() => {
      setOpacity(0);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div 
      className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
      style={{ 
        opacity, 
        transition: 'opacity 1s ease-out' 
      }}
    >
      <motion.div
        initial={{ scale: 0.5, rotate: -10 }}
        animate={{ 
          scale: [0.5, 1.2, 1], 
          rotate: [-10, 10, 0],
          y: [0, -20, 0]
        }}
        transition={{ 
          duration: 0.8,
          times: [0, 0.6, 1],
          ease: "easeInOut" 
        }}
        className="bg-red-100 dark:bg-red-900/30 rounded-full p-6 shadow-lg"
      >
        <motion.svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="80" 
          height="80" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-red-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="8" y1="15" x2="16" y2="15" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </motion.svg>
      </motion.div>
    </div>
  );
} 