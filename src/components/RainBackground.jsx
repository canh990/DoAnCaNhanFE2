import React, { useEffect, useState } from 'react';
import { playThunderSound } from '../utils/SoundManager';
import './RainBackground.css';

const RainBackground = () => {
  const [drops, setDrops] = useState([]);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [lightningPos, setLightningPos] = useState({ left: '0%', top: '0%' });

  useEffect(() => {
    const dropCount = 100;
    const newDrops = Array.from({ length: dropCount }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + '%',
      animationDelay: Math.random() * 2 + 's',
      animationDuration: 0.5 + Math.random() * 0.5 + 's',
      opacity: 0.1 + Math.random() * 0.3
    }));
    setDrops(newDrops);
  }, []);

  useEffect(() => {
    const triggerLightningStrike = () => {
      setLightningPos({ left: Math.random() * 80 + 10 + '%', top: Math.random() * 10 + '%' });
      setIsFlashing(true);
      setIsShaking(true);
      playThunderSound();
      
      setTimeout(() => {
        setIsFlashing(false);
        const extraStrikes = Math.random() > 0.5 ? 2 : 1;
        for (let i = 1; i <= extraStrikes; i++) {
          setTimeout(() => {
            setIsFlashing(true);
            setTimeout(() => setIsFlashing(false), 50);
          }, i * 150);
        }
        setTimeout(() => setIsShaking(false), 1000);
      }, 100);
    };

    // Expose to global window for external triggers (like opening the letter)
    window.triggerLightningStrike = triggerLightningStrike;

    const autoLightning = () => {
      const delay = Math.random() * 4000 + 2000;
      const timeout = setTimeout(() => {
        triggerLightningStrike();
        autoLightning();
      }, delay);
    };

    const timeout = setTimeout(autoLightning, 3000);
    return () => {
      clearTimeout(timeout);
      delete window.triggerLightningStrike;
    };
  }, []);

  return (
    <div className={`rain-container ${isFlashing ? 'flash' : ''} ${isShaking ? 'shake-all' : ''}`}>
      {isFlashing && (
        <div 
          className="lightning-bolt-container" 
          style={{ left: lightningPos.left, top: lightningPos.top }}
        >
          {/* Multiple bolts for intensity */}
          <div className="bolt-main">
            <svg width="80" height="200" viewBox="0 0 80 200">
              <path d="M40 0 L15 80 L50 70 L20 200 L70 100 L35 110 Z" fill="#fff" />
            </svg>
          </div>
          <div className="bolt-glow"></div>
        </div>
      )}
      {drops.map(drop => (
        <div
          key={drop.id}
          className="rain-drop"
          style={{
            left: drop.left,
            animationDelay: drop.animationDelay,
            animationDuration: drop.animationDuration,
            opacity: drop.opacity
          }}
        />
      ))}
      <div className="rain-mist"></div>
    </div>
  );
};

export default RainBackground;
