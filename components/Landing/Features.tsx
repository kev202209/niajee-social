'use client';

import React from "react";
import {
  Globe,
  Zap,
  RefreshCw,
  Video,
  Users,
  LayoutGrid,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Features() {
  const features = [
    {
      icon: <Globe className="w-12 h-12 text-blue-500 dark:text-blue-400" />,
      title: "Unified Experience",
      description:
        "Access long videos, shorts, and real-time community updates in one app.",
    },
    {
      icon: <Zap className="w-12 h-12 text-green-500 dark:text-green-400" />,
      title: "Streamlined Content",
      description:
        "Enjoy a seamless experience without jumping between multiple platforms.",
    },
    {
      icon: (
        <RefreshCw className="w-12 h-12 text-purple-500 dark:text-purple-400" />
      ),
      title: "Real-Time Updates",
      description:
        "Stay informed with community-driven conversations and trending topics.",
    },
    {
      icon: <Video className="w-12 h-12 text-red-500 dark:text-red-400" />,
      title: "Diverse Content",
      description:
        "From inspiring stories to quick updates, find content that resonates with you.",
    },
    {
      icon: <Users className="w-12 h-12 text-yellow-500 dark:text-yellow-400" />,
      title: "Creative Community",
      description:
        "Join a vibrant community that shares your passion for creativity.",
    },
    {
      icon: (
        <LayoutGrid className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
      ),
      title: "Centralized Content",
      description:
        "No more hopping between apps – find everything in one centralized hub.",
    },
  ];

  // Animation variants for container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Animation variants for items
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <section id="why-join" className="py-24 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium mb-3">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Why Join Mosaic
          </h2>
          <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400 text-lg">
            Experience a new era of social media with our innovative platform designed with your needs in mind.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative group flex flex-col items-center text-center p-8 rounded-xl backdrop-blur-sm 
                         bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 
                         shadow-sm hover:shadow-xl transition-all duration-300
                         hover:border-blue-300 dark:hover:border-blue-700"
              whileHover={{ 
                y: -5,
                transition: { duration: 0.2 }
              }}
            >
              <div className="mb-6 p-3 rounded-full bg-gray-100 dark:bg-gray-700/50 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
              
              {/* Decorative gradient blur */}
              <div className="absolute -z-10 h-32 w-32 rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}