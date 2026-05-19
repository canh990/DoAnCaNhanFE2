import React, { useEffect, useState } from 'react';
import { playThunderSound } from '../utils/SoundManager';
import Drones from './Drones';
import './CyberpunkCity.css';

const CyberpunkCity = ({ isDayMode, isRaining, isLightningEnabled }) => {
  const [isFlashing, setIsFlashing] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [lightningPos, setLightningPos] = useState({ left: '50%', top: '0%' });

  // 1. Define building generation logic
  const generateBuildings = () => {
    const neonColors = ['#ff007f', '#00ffff', '#ffff00', '#00ff66', '#bd93f9', '#ff79c6'];
    const textSigns = ['SÀI GÒN', 'TECH', 'VOID', 'CANH.EXE', 'NEON', '2026', 'CYBER', 'PHỞ', 'CAFE'];
    return {
      far: [...Array(12)].map((_, i) => ({
        height: 150 + Math.random() * 200,
        width: 40 + Math.random() * 40,
        left: i * 8
      })),
      mid: [...Array(9)].map((_, i) => ({
        height: 250 + Math.random() * 250,
        width: 80 + Math.random() * 60,
        left: i * 11,
        hasNeon: i % 2 === 0,
        neonColor: neonColors[Math.floor(Math.random() * neonColors.length)],
        neonText: textSigns[Math.floor(Math.random() * textSigns.length)],
        neonType: Math.random() > 0.5 ? 'horizontal' : 'vertical',
        windowColor: Math.random() > 0.5 ? 'rgba(0, 255, 255, 0.35)' : 'rgba(255, 0, 127, 0.35)'
      })),
      near: [...Array(6)].map((_, i) => ({
        height: 350 + Math.random() * 300,
        width: 120 + Math.random() * 100,
        left: i * 18
      }))
    };
  };

  // 2. State for buildings
  const [buildingData, setBuildingData] = useState(generateBuildings());

  useEffect(() => {
    if (!isLightningEnabled) return;

    let activeTimeout = null;

    const triggerLightningStrike = () => {
      setLightningPos({ left: Math.random() * 80 + 10 + '%', top: Math.random() * 10 + '%' });
      setIsFlashing(true);
      setIsShaking(true);
      setIsGlitching(true);

      // 3. Update buildings on strike
      setBuildingData(generateBuildings());

      playThunderSound();

      setTimeout(() => {
        setIsGlitching(false);
      }, 300);

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
      const delay = Math.random() * 3000 + 9000; // ~10s (9-12s range)
      activeTimeout = setTimeout(() => {
        triggerLightningStrike();
        autoLightning();
      }, delay);
    };

    activeTimeout = setTimeout(autoLightning, 1000);

    return () => {
      if (activeTimeout) clearTimeout(activeTimeout);
      delete window.triggerLightningStrike;
      setIsFlashing(false);
      setIsShaking(false);
      setIsGlitching(false);
    };
  }, [isDayMode, isRaining, isLightningEnabled]);

  return (
    <div className={`city-background ${isDayMode ? 'day-mode' : ''} ${isFlashing ? 'flash' : ''} ${isShaking ? 'shake-all' : ''}`}>
      {isGlitching && <div className="glitch-overlay"></div>}
      {/* Layer 1: Sky & Grid */}
      <div className="sky-layer">
        <div className={`sun ${isDayMode ? 'visible' : ''}`}></div>
        <div className={`moon ${!isDayMode ? 'visible' : ''}`}></div>
        <div className="distant-grid"></div>
      </div>

      {/* Layer 2: Distant Buildings */}
      <div className="buildings-far">
        {buildingData.far.map((b, i) => (
          <div key={i} className="skyscraper far" style={{
            height: b.height + 'px',
            width: b.width + 'px',
            left: b.left + '%'
          }} />
        ))}
      </div>

      {/* Layer 3: Mid Buildings with Neon */}
      <div className="buildings-mid">
        {buildingData.mid.map((b, i) => (
          <div key={i} className="skyscraper mid" style={{
            height: b.height + 'px',
            width: b.width + 'px',
            left: b.left + '%'
          }}>
            <div className="windows" style={{
              backgroundImage: `radial-gradient(${b.windowColor} 1.5px, transparent 1.5px)`,
              backgroundSize: '10px 14px'
            }}></div>
            {b.hasNeon && (
              <div className={`neon-sign ${b.neonType}`} style={{
                borderColor: b.neonColor,
                color: b.neonColor,
                boxShadow: `0 0 12px ${b.neonColor}, inset 0 0 4px ${b.neonColor}`
              }}>
                {b.neonText}
              </div>
            )}
          </div>
        ))}
      </div>

      <Drones />

      {/* Layer 4: Near Silhouettes */}
      <div className="buildings-near">
        {buildingData.near.map((b, i) => (
          <div key={i} className="skyscraper near" style={{
            height: b.height + 'px',
            width: b.width + 'px',
            left: b.left + '%'
          }}>
            {i % 2 === 0 && (
              <div className="near-billboard" style={{
                borderColor: i % 4 === 0 ? '#00ffff' : '#ff007f',
                color: i % 4 === 0 ? '#00ffff' : '#ff007f',
                boxShadow: `0 0 15px ${i % 4 === 0 ? '#00ffff' : '#ff007f'}`
              }}>
                <div className="billboard-glitch-text">{i % 4 === 0 ? 'SÀI GÒN' : 'TECHSTORE'}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Atmospheric Effects */}
      <div className={`rain-layer ${isRaining ? 'active' : ''}`}>
        {[...Array(80)].map((_, i) => (
          <div key={i} className="rain-drop" style={{
            left: Math.random() * 100 + '%',
            animationDelay: Math.random() * 2 + 's',
            animationDuration: 0.5 + Math.random() * 0.5 + 's',
            opacity: isDayMode ? (0.4 + Math.random() * 0.3) : (0.1 + Math.random() * 0.2)
          }}></div>
        ))}
      </div>

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
      <Drones />
      <div className="bottom-fog"></div>
    </div>
  );
};

export default CyberpunkCity;
