import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { playCrowSound } from '../utils/SoundManager';
import './Crows.css';

const Crow = ({ id, onComplete, delay = 0, depth = 1 }) => {
  const [side] = useState(Math.random() > 0.5 ? 'left' : 'right');
  const [yStart] = useState(Math.random() * 50 + 10);
  const [yEnd] = useState(yStart + (Math.random() * 30 - 15));
  const [duration] = useState((Math.random() * 4 + 6) * depth); // Farther birds move slower
  const [size] = useState((Math.random() * 0.4 + 0.6) / depth);
  const [opacity] = useState(1.1 - depth * 0.3);
  const [blur] = useState((depth - 1) * 2);

  return (
    <motion.div
      className={`crow-container ${side}`}
      initial={{ 
        x: side === 'left' ? '-200px' : 'calc(100vw + 200px)',
        y: `${yStart}vh`,
        scale: size * (side === 'left' ? 1 : -1),
        opacity: 0,
        filter: `blur(${blur}px)`
      }}
      animate={{ 
        x: side === 'left' ? 'calc(100vw + 400px)' : '-400px',
        y: [`${yStart}vh`, `${yEnd - 10}vh`, `${yEnd}vh`], // Slight curve
        opacity: [0, opacity, opacity, 0],
      }}
      transition={{ 
        duration: duration,
        delay: delay,
        ease: "easeInOut",
        times: [0, 0.1, 0.9, 1]
      }}
      onAnimationComplete={() => onComplete(id)}
    >
      <div className="crow-shadow"></div>
      <div className="crow">
        <div className="wing wing-left"></div>
        <div className="body"></div>
        <div className="wing wing-right"></div>
      </div>
    </motion.div>
  );
};

const Crows = ({ density = 5 }) => {
  const [flocks, setFlocks] = useState([]);

  const spawnFlock = useCallback(() => {
    if (density === 0) return;
    
    const flockId = Date.now();
    const birdCount = Math.floor(Math.random() * 3) + 2; // Fewer birds per flock for better performance
    const depth = Math.random() * 1.5 + 0.5;
    
    const newBirds = Array.from({ length: birdCount }).map((_, i) => ({
      id: `${flockId}-${i}`,
      delay: i * (Math.random() * 0.5 + 0.2),
      depth: depth + (Math.random() * 0.2 - 0.1)
    }));

    setFlocks(prev => [...prev, ...newBirds]);
    
    if (Math.random() > 0.4) {
        setTimeout(playCrowSound, Math.random() * 2000);
    }
  }, [density]);

  useEffect(() => {
    if (density === 0) {
      setFlocks([]);
      return;
    }

    // Interval scaled by density (10 is fast, 1 is slow)
    const baseInterval = 12000;
    const currentInterval = baseInterval / (density * 0.5 + 0.5);

    const interval = setInterval(() => {
      if (Math.random() > 0.3) spawnFlock();
    }, currentInterval);

    // Initial spawn
    spawnFlock();

    return () => clearInterval(interval);
  }, [spawnFlock, density]);

  const removeBird = (id) => {
    setFlocks(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="crows-layer">
      <div className="dust-overlay"></div>
      {flocks.map(bird => (
        <Crow 
          key={bird.id} 
          id={bird.id} 
          depth={bird.depth} 
          delay={bird.delay} 
          onComplete={removeBird} 
        />
      ))}
    </div>
  );
};

export default Crows;
