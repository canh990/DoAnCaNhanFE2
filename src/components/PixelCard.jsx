import React from 'react';
import Tilt from 'react-parallax-tilt';
import './PixelCard.css';

const PixelCard = ({ title, children, subtitle, onClick }) => {
  return (
    <Tilt
      perspective={1000}
      glareEnable={true}
      glareMaxOpacity={0.1}
      scale={1.02}
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
