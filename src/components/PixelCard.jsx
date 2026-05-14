import React from 'react';
import Tilt from 'react-parallax-tilt';
import './PixelCard.css';

const PixelCard = ({ title, children, subtitle, onClick }) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  return (
    <Tilt
      perspective={1000}
      glareEnable={!isMobile}
      glareMaxOpacity={0.1}
      scale={isMobile ? 1 : 1.02}
      tiltEnable={!isMobile}
      className={`pixel-card-wrapper ${onClick ? 'clickable' : ''}`}
    >
      <div className="pixel-card" onClick={onClick}>
        <div className="pixel-card-header">
          <h3>{title}</h3>
          {subtitle && <span className="pixel-card-subtitle">{subtitle}</span>}
        </div>
        <div className="pixel-card-content">
          {children}
        </div>
        <div className="pixel-card-decoration">
          <div className="corner tl"></div>
          <div className="corner tr"></div>
          <div className="corner bl"></div>
          <div className="corner br"></div>
        </div>
      </div>
    </Tilt>
  );
};

export default PixelCard;
