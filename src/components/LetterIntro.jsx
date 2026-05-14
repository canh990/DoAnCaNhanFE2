import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playTechGlitch, playDigitalOpen, playCrowSound } from '../utils/SoundManager';
import './LetterIntro.css';

const CyberCrowParticle = ({ index }) => {
  const angle = (index / 8) * Math.PI * 2;
  const velocity = 200 + Math.random() * 300;

  return (
    <motion.div
      className="cyber-crow-particle"
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{
        x: Math.cos(angle) * velocity,
        y: Math.sin(angle) * velocity - 100,
        opacity: 0,
        scale: [1, 1.5, 0],
        rotate: Math.random() * 360
      }}
      transition={{ duration: 1.5, ease: "easeOut" }}
    >
      <div className="pixel-bird"></div>
    </motion.div>
  );
};

const LetterIntro = ({ onComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);

  const handleOpen = () => {
    setIsGlitching(true);
    playTechGlitch();

    setTimeout(() => {
      setIsGlitching(false);
      setIsOpen(true);
      playDigitalOpen();

      // Cyber crows burst sounds
      setTimeout(playCrowSound, 300);
      setTimeout(playCrowSound, 600);

      setTimeout(() => {
        setIsExiting(true);
        setTimeout(onComplete, 1500);
      }, 2500);
    }, 800);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          className="letter-intro-overlay"
          exit={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
          transition={{ duration: 1.2 }}
        >
          <div className="hologram-grid"></div>
          <div className="scanlines"></div>

          <motion.div
            className={`envelope-wrapper ${isGlitching ? 'glitch-active' : ''}`}
            initial={{ scale: 0.5, opacity: 0, rotateY: 90 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{ duration: 1, type: "spring" }}
          >
            <div className="envelope-3d">
              <div className="envelope-front">
                <div className="neon-seal">
                  <div className="seal-core"></div>
                  <div className="seal-ring"></div>
                </div>
                <div className="data-lines">
                  <span>010010101</span>
                  <span>SYSTEM_INIT</span>
                  <span>ENCRYPTED</span>
                </div>
              </div>

              <motion.div
                className="envelope-flap"
                animate={{ rotateX: isOpen ? -160 : 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              ></motion.div>

              {isOpen && (
                <div className="letter-content-burst">
                  <div className="digital-smoke"></div>
                  {[...Array(12)].map((_, i) => (
                    <CyberCrowParticle key={i} index={i} />
                  ))}
                  <motion.div
                    className="hologram-letter"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: -100, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                  >
                    <div className="letter-glitch-text">ĐÃ CẤP QUYỀN</div>
                    <div className="letter-subtext">CHÀO MỪNG BẠN ĐẾN VỚI HỆ THỐNG</div>
                  </motion.div>
                </div>
              )}
            </div>

            {!isOpen && (
              <motion.button
                className="open-msg-btn"
                onClick={handleOpen}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="btn-glitch-layers">
                  <span>MỞ THƯ</span>
                  <span>MỞ THƯ</span>
                  <span>MỞ THƯ</span>
                </div>
                <div className="btn-glow"></div>
              </motion.button>
            )}
          </motion.div>

          <div className="cinematic-bars top"></div>
          <div className="cinematic-bars bottom"></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LetterIntro;
