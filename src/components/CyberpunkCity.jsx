import React, { useEffect, useState } from 'react';
import { playThunderSound } from '../utils/SoundManager';
import './CyberpunkCity.css';

const CyberpunkCity = ({ isDayMode, isRaining, isLightningEnabled }) => {
  const [isFlashing, setIsFlashing] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [lightningPos, setLightningPos] = useState({ left: '50%', top: '0%' });

  useEffect(() => {
    // Sấm sét chỉ xuất hiện khi được bật, trời mưa và u ám
    if (isDayMode || !isRaining || !isLightningEnabled) return; 

    let activeTimeout = null;
    
    const triggerLightningStrike = () => {
      setLightningPos({ left: Math.random() * 80 + 10 + '%', top: Math.random() * 10 + '%' });
      setIsFlashing(true);
      setIsShaking(true);
      playThunderSound();
      
      setTimeout(() => {
        if (!isLightningEnabled) return;
        setIsFlashing(false);
        const extraStrikes = Math.random() > 0.5 ? 2 : 1;
        for (let i = 1; i <= extraStrikes; i++) {
          setTimeout(() => {
            if (!isLightningEnabled) return;
            setIsFlashing(true);
            setTimeout(() => setIsFlashing(false), 50);
          }, i * 150);
        }
        setTimeout(() => setIsShaking(false), 1000);
      }, 100);
    };

    window.triggerLightningStrike = triggerLightningStrike;

    const autoLightning = () => {
      const delay = Math.random() * 8000 + 4000;
      activeTimeout = setTimeout(() => {
        triggerLightningStrike();
        autoLightning();
      }, delay);
    };

    activeTimeout = setTimeout(autoLightning, 5000);
    
    return () => {
      if (activeTimeout) clearTimeout(activeTimeout);
      delete window.triggerLightningStrike;
      // Reset states immediately
      setIsFlashing(false);
      setIsShaking(false);
    };
  }, [isDayMode, isRaining, isLightningEnabled]);

  return (
    <div className={`city-background ${isDayMode ? 'day-mode' : ''} ${isFlashing ? 'flash' : ''} ${isShaking ? 'shake-all' : ''}`}>
      {/* Layer 1: Sky & Grid */}
      <div className="sky-layer">
        {isDayMode ? <div className="sun"></div> : <div className="moon"></div>}
        <div className="distant-grid"></div>
      </div>

      {/* Layer 2: Distant Buildings */}
      <div className="buildings-far">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="skyscraper far" style={{ 
            height: 150 + Math.random() * 200 + 'px',
            width: 40 + Math.random() * 40 + 'px',
            left: i * 8 + '%'
          }}></div>
        ))}
      </div>

      {/* Layer 3: Mid Buildings with Neon */}
      <div className="buildings-mid">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="skyscraper mid" style={{ 
            height: 250 + Math.random() * 250 + 'px',
            width: 80 + Math.random() * 60 + 'px',
            left: i * 12 + '%'
          }}>
            <div className="windows"></div>
            {i % 2 === 0 && <div className="neon-sign"></div>}
          </div>
        ))}
      </div>

      {/* Layer 4: Near Silhouettes */}
      <div className="buildings-near">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skyscraper near" style={{ 
            height: 350 + Math.random() * 300 + 'px',
            width: 120 + Math.random() * 100 + 'px',
            left: i * 18 + '%'
          }}></div>
        ))}
      </div>

      {/* Atmospheric Effects */}
      {isRaining && (
        <div className="rain-layer">
          {[...Array(80)].map((_, i) => (
            <div key={i} className="rain-drop" style={{
              left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 2 + 's',
              animationDuration: 0.5 + Math.random() * 0.5 + 's',
              opacity: isDayMode ? (0.4 + Math.random() * 0.3) : (0.1 + Math.random() * 0.2)
            }}></div>
          ))}
        </div>
      )}

      {/* Lightning Overlay */}
      {isFlashing && (
        <div className="lightning-bolt-container" style={{ left: lightningPos.left, top: lightningPos.top }}>
          <div className="bolt-main">
            <svg width="80" height="240" viewBox="0 0 80 240">
              <path d="M40 0 L15 100 L50 90 L20 240 L70 120 L35 130 Z" fill="#fff" />
            </svg>
          </div>
          <div className="bolt-glow"></div>
        </div>
      )}

      <div className="city-mist"></div>
      <div className="bottom-fog"></div>
    </div>
  );
};

export default CyberpunkCity;
