'use client';

import React, { useRef, useEffect } from "react";
import {
  Globe,
  Zap,
  RefreshCw,
  Video,
  Users,
  LayoutGrid,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import ParticleBackground from "./ParticleBackground";

export default function Features() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, margin: "-100px" });
  
  type FeatureColor = 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'indigo';

  interface Feature {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: FeatureColor;
  }

  const features: Feature[] = [
    {
      icon: <Globe className="w-12 h-12 text-blue-500 dark:text-blue-400" />,
      title: "Unified Experience",
      description:
        "Access long videos, shorts, and real-time community updates in one app.",
      color: "blue",
    },
    {
      icon: <Zap className="w-12 h-12 text-green-500 dark:text-green-400" />,
      title: "Streamlined Content",
      description:
        "Enjoy a seamless experience without jumping between multiple platforms.",
      color: "green",
    },
    {
      icon: (
        <RefreshCw className="w-12 h-12 text-purple-500 dark:text-purple-400" />
      ),
      title: "Real-Time Updates",
      description:
        "Stay informed with community-driven conversations and trending topics.",
      color: "purple",
    },
    {
      icon: <Video className="w-12 h-12 text-red-500 dark:text-red-400" />,
      title: "Diverse Content",
      description:
        "From inspiring stories to quick updates, find content that resonates with you.",
      color: "red",
    },
    {
      icon: <Users className="w-12 h-12 text-yellow-500 dark:text-yellow-400" />,
      title: "Creative Community",
      description:
        "Join a vibrant community that shares your passion for creativity.",
      color: "yellow",
    },
    {
      icon: (
        <LayoutGrid className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
      ),
      title: "Centralized Content",
      description:
        "No more hopping between apps – find everything in one centralized hub.",
      color: "indigo",
    },
  ];

  // Animation variants for container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      }
    }
  };

  // Animation variants for items
  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 12
      }
    }
  };

  // Particle animation background
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Create canvas for particles
    const canvas = document.getElementById('particles-canvas') as HTMLCanvasElement | null;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    // Particle class
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;

      constructor() {
        if (!canvas) {
          this.x = 0;
          this.y = 0;
        } else {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
        }
        this.size = Math.random() * 5 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = `rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, ${Math.random() * 255}, ${Math.random() * 0.2 + 0.1})`;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.size > 0.2) this.size -= 0.01;
        
        if (canvas) {
          if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
          if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
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
      for (let i = 0; i < Math.min(canvas.width, 800) / 10; i++) {
        particles.push(new Particle());
      }
    };
    
    init();
    
    // Animation loop
    const animate = () => {
      if (!document.getElementById('particles-canvas')) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        // Connect particles with lines
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(150, 150, 255, ${0.1 * (1 - distance / 100)})`;
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
  }, []);

  // Function to get the card background style based on color
  const getCardStyle = (color: FeatureColor) => {
    const colorMap = {
      blue: 'from-blue-500/5 to-transparent dark:from-blue-600/10',
      green: 'from-green-500/5 to-transparent dark:from-green-600/10',
      purple: 'from-purple-500/5 to-transparent dark:from-purple-600/10',
      red: 'from-red-500/5 to-transparent dark:from-red-600/10',
      yellow: 'from-yellow-500/5 to-transparent dark:from-yellow-600/10',
      indigo: 'from-indigo-500/5 to-transparent dark:from-indigo-600/10',
    };
    
    return colorMap[color] || colorMap.blue;
  };

  // Function to get the card border style based on color
  const getCardBorderStyle = (color: FeatureColor) => {
    const colorMap = {
      blue: 'group-hover:border-blue-400 dark:group-hover:border-blue-600',
      green: 'group-hover:border-green-400 dark:group-hover:border-green-600',
      purple: 'group-hover:border-purple-400 dark:group-hover:border-purple-600',
      red: 'group-hover:border-red-400 dark:group-hover:border-red-600',
      yellow: 'group-hover:border-yellow-400 dark:group-hover:border-yellow-600',
      indigo: 'group-hover:border-indigo-400 dark:group-hover:border-indigo-600',
    };
    
    return colorMap[color] || colorMap.blue;
  };

  // Function to get the icon background style based on color
  const getIconBgStyle = (color: FeatureColor) => {
    const colorMap = {
      blue: 'group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20',
      green: 'group-hover:bg-green-100 dark:group-hover:bg-green-900/20',
      purple: 'group-hover:bg-purple-100 dark:group-hover:bg-purple-900/20',
      red: 'group-hover:bg-red-100 dark:group-hover:bg-red-900/20',
      yellow: 'group-hover:bg-yellow-100 dark:group-hover:bg-yellow-900/20',
      indigo: 'group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/20',
    };
    
    return colorMap[color] || colorMap.blue;
  };

  // Function to get the gradient blur background style based on color
  const getGradientBlurStyle = (color: FeatureColor) => {
    const colorMap = {
      blue: 'bg-blue-400/10 dark:bg-blue-600/10',
      green: 'bg-green-400/10 dark:bg-green-600/10',
      purple: 'bg-purple-400/10 dark:bg-purple-600/10',
      red: 'bg-red-400/10 dark:bg-red-600/10',
      yellow: 'bg-yellow-400/10 dark:bg-yellow-600/10',
      indigo: 'bg-indigo-400/10 dark:bg-indigo-600/10',
    };
    
    return colorMap[color] || colorMap.blue;
  };

  // Function to get the accent line style based on color
  const getAccentLineStyle = (color: FeatureColor) => {
    const colorMap = {
      blue: 'bg-blue-500 dark:bg-blue-400',
      green: 'bg-green-500 dark:bg-green-400',
      purple: 'bg-purple-500 dark:bg-purple-400',
      red: 'bg-red-500 dark:bg-red-400',
      yellow: 'bg-yellow-500 dark:bg-yellow-400',
      indigo: 'bg-indigo-500 dark:bg-indigo-400',
    };
    
    return colorMap[color] || colorMap.blue;
  };

  // Function to get the corner accent style based on color
  const getCornerAccentStyle = (color: FeatureColor) => {
    const colorMap = {
      blue: 'from-blue-300/20 dark:from-blue-600/20',
      green: 'from-green-300/20 dark:from-green-600/20',
      purple: 'from-purple-300/20 dark:from-purple-600/20',
      red: 'from-red-300/20 dark:from-red-600/20',
      yellow: 'from-yellow-300/20 dark:from-yellow-600/20',
      indigo: 'from-indigo-300/20 dark:from-indigo-600/20',
    };
    
    return colorMap[color] || colorMap.blue;
  };

  return (
    <section 
      id="why-join" 
      ref={sectionRef}
      className="relative py-32 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 overflow-hidden"
    >
      {/* Particle animation background */}
      <ParticleBackground 
        className="z-0" 
        color="#3b82f6" 
        density={60} 
        connectionOpacity={0.07}
        particleOpacity={0.2}
      />
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            Why Join Mosaic
          </h2>
          <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400 text-lg md:text-xl">
            Experience a new era of social media with our innovative platform designed with your needs in mind.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`relative group flex flex-col items-center text-center p-8 rounded-2xl 
                         bg-gradient-to-b ${getCardStyle(feature.color)}
                         backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 ${getCardBorderStyle(feature.color)}
                         shadow-lg hover:shadow-2xl transition-all duration-500
                         hover:-translate-y-2`}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
            >
              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
                <div className={`absolute top-0 right-0 bg-gradient-to-bl ${getCornerAccentStyle(feature.color)} to-transparent w-14 h-14 transform rotate-45 translate-x-7 -translate-y-7`}></div>
              </div>
              
              {/* Icon container with glowing effect */}
              <div className={`relative mb-8 p-4 rounded-2xl ${getIconBgStyle(feature.color)} bg-gray-100 dark:bg-gray-800/50 transition-colors duration-300`}>
                {feature.icon}
                <div className={`absolute inset-0 rounded-2xl bg-${feature.color}-500/10 dark:bg-${feature.color}-600/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500`}></div>
              </div>
              
              <h3 className={`text-2xl font-bold mb-3 text-gray-800 dark:text-gray-100 group-hover:text-${feature.color}-600 dark:group-hover:text-${feature.color}-400 transition-colors duration-300`}>
                {feature.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>
              
              {/* Decorative gradient blur */}
              <div className={`absolute -z-10 h-40 w-40 rounded-full ${getGradientBlurStyle(feature.color)} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              {/* Bottom accent line */}
              <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 ${getAccentLineStyle(feature.color)} group-hover:w-1/2 transition-all duration-500 rounded-t-full`}></div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Optional decorative elements */}
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-blue-300/10 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-300/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
}