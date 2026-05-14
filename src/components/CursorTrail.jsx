import React, { useEffect, useRef } from 'react';

const CursorTrail = ({ isDayMode }) => {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 4;
        this.speedY = (Math.random() - 0.5) * 4;
        this.color = isDayMode ? '#d35400' : (Math.random() > 0.5 ? '#00ffff' : '#ff00ff');
        this.opacity = 1;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.01;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
        this.opacity = this.life;
        this.size *= 0.98; // Shrink
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        // Pixel art style: square particles
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
      }
    }

    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      // Spawn particles on move
      for (let i = 0; i < 2; i++) {
        particles.current.push(new Particle(e.clientX, e.clientY));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.current.length; i++) {
        particles.current[i].update();
        particles.current[i].draw();

        if (particles.current[i].life <= 0) {
          particles.current.splice(i, 1);
          i--;
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDayMode]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 99999, // On top of everything
      }}
    />
  );
};

export default CursorTrail;
