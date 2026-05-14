import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { initAudio, startRain, playThunderSound, playOpenSound } from '../utils/SoundManager';
import './LetterIntro.css';

const LetterIntro = ({ onComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleOpen = () => {
    initAudio(); 
    startRain(); 
    playOpenSound(); // New realistic paper sound
    
    // Trigger visual lightning and thunder strike immediately
    if (window.triggerLightningStrike) {
      window.triggerLightningStrike();
    } else {
      playThunderSound();
    }

    setIsOpen(true);
    setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 1200);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div 
          className="letter-overlay"
          exit={{ opacity: 0, scale: 2, filter: 'blur(10px)' }}
          transition={{ duration: 0.8 }}
        >
          <div className={`envelope-wrapper ${isOpen ? 'open' : ''}`} onClick={!isOpen ? handleOpen : undefined}>
            <div className="envelope">
              <div className="flap"></div>
              <div className="pocket"></div>
              <div className="letter">
                <div className="letter-content">
                  <div className="pixel-text">DEV_PIXEL.EXE</div>
                  <div className="pixel-text small">ACCESSING_SECURE_DATA...</div>
                </div>
              </div>
            </div>
            {!isOpen && <div className="click-hint">BẤM ĐỂ MỞ THƯ</div>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LetterIntro;
