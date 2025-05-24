'use client';

import React, { useEffect, useRef } from "react";

type ParticleBackgroundProps = {
  className?: string;
  density?: number;
  speed?: number;
  color?: string;
  connectionOpacity?: number;
  particleOpacity?: number;
};

export default function ParticleBackground({
  className = "",
  density = 50,
  speed = 1,
  color = "#6366f1",
  connectionOpacity = 0.1,
  particleOpacity = 0.2,
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Create canvas for particles
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    const setCanvasSize = () => {
      const devicePixelRatio = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    // Parse color
    const parseColor = (colorString: string) => {
      const div = document.createElement('div');
      div.style.color = colorString;
      document.body.appendChild(div);
      const computedColor = getComputedStyle(div).color;
      document.body.removeChild(div);
      
      const match = computedColor.match(/rgba?\((\d+), (\d+), (\d+)(?:, [\d.]+)?\)/);
      if (match) {
        return {
          r: parseInt(match[1]),
          g: parseInt(match[2]),
          b: parseInt(match[3])
        };
      }
      return { r: 100, g: 100, b: 255 };
    };
    
    const parsedColor = parseColor(color);
    
    // Particle class
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas!.offsetWidth;
        this.y = Math.random() * canvas!.offsetHeight;
        this.size = Math.random() * 5 + 1;
        this.speedX = (Math.random() * 2 - 1) * speed;
        this.speedY = (Math.random() * 2 - 1) * speed;
        this.color = `rgba(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b}, ${Math.random() * particleOpacity + 0.05})`;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Bounce off edges
        if (this.x < 0 || this.x > canvas!.offsetWidth) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas!.offsetHeight) this.speedY *= -1;
        
        // Keep particles in bounds
        this.x = Math.max(0, Math.min(this.x, canvas!.offsetWidth));
        this.y = Math.max(0, Math.min(this.y, canvas!.offsetHeight));
      }
      
      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Create particle array
    let particles: Particle[] = [];
    const init = () => {
      particles = [];
      const particleCount = Math.min(canvas.offsetWidth, 1200) / (200 - density);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };
    
    init();
    
    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        // Connect particles with lines
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          const maxDistance = 100;
          if (distance < maxDistance) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b}, ${connectionOpacity * (1 - distance / maxDistance)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, [density, speed, color, connectionOpacity, particleOpacity]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`absolute inset-0 w-full h-full ${className}`}
    />
  );
}