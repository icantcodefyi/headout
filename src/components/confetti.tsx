'use client';

import { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from '~/hooks/use-window-size';
import { motion } from 'motion/react';

export function Confetti() {
  const { width, height } = useWindowSize();
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    // Fade out the confetti after 2.5 seconds
    const timeout = setTimeout(() => {
      setOpacity(0);
    }, 2500);

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
      <div className="flex items-center justify-center h-full">
        <motion.div
          initial={{ scale: 0, rotate: 0 }}
          animate={{ 
            scale: [0, 1.3, 1],
            rotate: [0, 15, -15, 0]
          }}
          transition={{ 
            duration: 0.7,
            times: [0, 0.5, 0.8, 1],
            ease: "easeOut" 
          }}
          className="bg-green-100 dark:bg-green-900/30 rounded-full p-8 shadow-lg z-10"
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
            className="text-green-500"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <path d="M20 6L9 17l-5-5"></path>
          </motion.svg>
        </motion.div>
      </div>
      <ReactConfetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={300}
        gravity={0.25}
        colors={['#FFC107', '#FF5722', '#4CAF50', '#2196F3', '#9C27B0', '#E91E63']}
        confettiSource={{
          x: width / 2,
          y: height / 3,
          w: 0,
          h: 0
        }}
      />
    </div>
  );
} 