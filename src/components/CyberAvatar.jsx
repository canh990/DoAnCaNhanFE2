import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import avatar1 from '../assets/avatar1.png';
import avatar2 from '../assets/avatar2.png';
import avatar3 from '../assets/avatar3.png';
import './CyberAvatar.css';

const avatars = [avatar1, avatar2, avatar3];

const CyberAvatar = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      // Small chance to glitch and change avatar
      if (Math.random() > 0.8) {
        setIsGlitching(true);
        setTimeout(() => {
          setCurrentIndex(prev => (prev + 1) % avatars.length);
          setIsGlitching(false);
        }, 150 + Math.random() * 200);
      }
    }, 5000);

    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <div className={`avatar-container ${isGlitching ? 'glitch-active' : ''}`}>
      <div className="avatar-frame">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={avatars[currentIndex]}
            alt="Cyber Avatar"
            className="avatar-image"
            initial={{ opacity: 0, filter: 'hue-rotate(90deg) brightness(2)' }}
            animate={{ opacity: 1, filter: 'hue-rotate(0deg) brightness(1)' }}
            exit={{ opacity: 0, filter: 'hue-rotate(-90deg) brightness(0.5)' }}
            transition={{ duration: 0.2 }}
          />
        </AnimatePresence>
        <div className="avatar-overlay"></div>
        <div className="scanline-tiny"></div>
      </div>
      <div className="status-indicator">
        <div className="status-dot"></div>
        <span>SYSTEM_ACTIVE</span>
      </div>
    </div>
  );
};

export default CyberAvatar;
