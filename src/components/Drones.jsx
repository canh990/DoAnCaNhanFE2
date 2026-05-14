import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './Drones.css';

const Drone = ({ id, onComplete, delay = 0 }) => {
  const [side] = useState(Math.random() > 0.5 ? 'left' : 'right');
  const [yPos] = useState(Math.random() * 40 + 20); // 20% to 60% height
  const [duration] = useState(Math.random() * 8 + 12); // Slower than crows
  const [scale] = useState(Math.random() * 0.3 + 0.7);

  return (
    <motion.div
      className={`drone-container ${side}`}
      initial={{ 
        x: side === 'left' ? '-150px' : 'calc(100vw + 150px)',
        y: `${yPos}vh`,
        scale: scale
      }}
      animate={{ 
        x: side === 'left' ? 'calc(100vw + 150px)' : '-150px',
        y: [`${yPos}vh`, `${yPos + 5}vh`, `${yPos}vh`]
      }}
      transition={{ 
        duration: duration,
        delay: delay,
        ease: "linear",
        y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
      }}
      onAnimationComplete={() => onComplete(id)}
    >
      <div className="drone">
        <div className="drone-body">
          <div className="drone-light red"></div>
          <div className="drone-light blue"></div>
        </div>
        <div className="searchlight"></div>
      </div>
    </motion.div>
  );
};

const Drones = () => {
  const [drones, setDrones] = useState([]);

  const spawnSquad = () => {
    const squadId = Date.now();
    const newDrones = [0, 1, 2].map(i => ({
      id: `${squadId}-${i}`,
      delay: i * 2 // Staggered entry
    }));
    
    setDrones(prev => [...prev, ...newDrones]);
    
    const nextSpawn = Math.random() * 20000 + 15000; // 15-35s between squads
    return setTimeout(spawnSquad, nextSpawn);
  };

  useEffect(() => {
    const timeout = setTimeout(spawnSquad, 3000);
    return () => clearTimeout(timeout);
  }, []);

  const removeDrone = (id) => {
    setDrones(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="drones-layer">
      {drones.map(drone => (
        <Drone 
          key={drone.id} 
          id={drone.id} 
          delay={drone.delay}
          onComplete={removeDrone}
        />
      ))}
    </div>
  );
};

export default Drones;
