import React, { useState, useEffect } from 'react';
import { playKeySound } from '../utils/SoundManager';

const Typewriter = ({ text, speed = 30, delay = 0 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStarted(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;

    if (displayedText.length < text.length) {
      const timeout = setTimeout(() => {
        const nextChar = text[displayedText.length];
        if (nextChar !== ' ') {
          playKeySound();
        }
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [displayedText, text, speed, started]);

  return <span>{displayedText}<span className="cursor">|</span></span>;
};

export default Typewriter;
