import React, { useEffect, useRef } from 'react';

interface CloudBackgroundProps {
  theme?: 'NIGHT' | 'GOLDEN' | 'STORM' | 'HIGH_ALTITUDE';
  speed?: number;
}

export const CloudBackground: React.FC<CloudBackgroundProps> = ({
  theme = 'NIGHT',
  speed = 1.0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Procedural Cloud Puff Particles
    const numClouds = 45;
    const clouds = Array.from({ length: numClouds }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 120 + 60,
      opacity: Math.random() * 0.18 + 0.05,
      vx: (Math.random() * 0.3 + 0.1) * speed,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Theme Gradient Background
      let grad = ctx.createLinearGradient(0, 0, 0, height);
      if (theme === 'NIGHT') {
        grad.addColorStop(0, '#06090F');
        grad.addColorStop(1, '#0A0E14');
      } else if (theme === 'GOLDEN') {
        grad.addColorStop(0, '#1A1412');
        grad.addColorStop(1, '#0A0E14');
      } else if (theme === 'STORM') {
        grad.addColorStop(0, '#0F172A');
        grad.addColorStop(1, '#0A0E14');
      } else {
        grad.addColorStop(0, '#030712');
        grad.addColorStop(1, '#0A0E14');
      }

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw Procedural Volumetric Cloud Puffs
      clouds.forEach((cloud) => {
        cloud.x += cloud.vx;
        if (cloud.x - cloud.radius > width) {
          cloud.x = -cloud.radius;
          cloud.y = Math.random() * height;
        }

        const cloudGrad = ctx.createRadialGradient(
          cloud.x,
          cloud.y,
          0,
          cloud.x,
          cloud.y,
          cloud.radius
        );

        if (theme === 'GOLDEN') {
          cloudGrad.addColorStop(0, `rgba(251, 146, 60, ${cloud.opacity})`);
          cloudGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else if (theme === 'STORM') {
          cloudGrad.addColorStop(0, `rgba(148, 163, 184, ${cloud.opacity})`);
          cloudGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
          cloudGrad.addColorStop(0, `rgba(56, 189, 248, ${cloud.opacity})`);
          cloudGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        }

        ctx.fillStyle = cloudGrad;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-40 transition-opacity duration-1000"
    />
  );
};
