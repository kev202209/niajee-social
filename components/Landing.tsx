'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { FiArrowRight } from "react-icons/fi";
import DarkModeToggle from "@/components/DarkModeToggle";
import { useTheme } from "next-themes";
import {
  Globe,
  Zap,
  RefreshCw,
  Video,
  Users,
  LayoutGrid,
  Menu,
  X,
} from "lucide-react";
import {
  useMotionTemplate,
  useMotionValue,
  motion,
  animate,
} from "framer-motion";

// Colors for the animated gradient
const COLORS_TOP = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"];

export default function Landing() {
  const { theme } = useTheme();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Animated color value for gradient
  const color = useMotionValue(COLORS_TOP[0]);

  useEffect(() => {
    animate(color, COLORS_TOP, {
      ease: "easeInOut",
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, [color]);

  // Dynamic styles using Framer Motion's template function
  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, ${theme === "light" ? "#ffffff" : "#020617"} 50%, ${color})`;
  const border = useMotionTemplate`1px solid ${color}`;
  const boxShadow = useMotionTemplate`0px 4px 24px ${color}`;

  // Stars color based on theme: black for light, white for dark
  // const starsColor = theme === "light" ? 0 : 1;

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

  return (
    <div className="bg-gradient-animation dark:bg-gradient-animation-dark min-h-screen">
      {/* Header */}
      <header className="w-full fixed top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="text-5xl font-bold gradient-text">
              <Link href="/" className=" font-extrabold bg-clip-text text-transparent bg-[linear-gradient(to_right,theme(colors.indigo.400),theme(colors.indigo.100),theme(colors.sky.400),theme(colors.fuchsia.400),theme(colors.sky.400),theme(colors.indigo.100),theme(colors.indigo.400))] bg-[length:200%_auto] animate-gradient">MOSAIC</Link>
            </div>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link
                href="#why-join"
                className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
              >
                Why Join
              </Link>
              <Link
                href="#download"
                className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
              >
                Download
              </Link>
              <Link
                href="#parallax"
                className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
              >
                Discover
              </Link>
            </nav>
            {/* Desktop Auth & Toggle */}
            <div className="hidden md:flex items-center space-x-4">
              <DarkModeToggle />
              <Link
                href="/auth/login"
                className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-full hover:bg-blue-600 dark:hover:bg-blue-700 transition"
              >
                Register
              </Link>
            </div>
            {/* Mobile Hamburger Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-gray-800 p-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex flex-col space-y-4 mt-2">
                <Link
                  href="#why-join"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
                >
                  Why Join
                </Link>
                <Link
                  href="#download"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
                >
                  Download
                </Link>
                <Link
                  href="#parallax"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
                >
                  Discover
                </Link>
              </nav>
              <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center justify-between">
                  <DarkModeToggle />
                </div>
                <div className="mt-2 flex flex-col space-y-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-full hover:bg-blue-600 dark:hover:bg-blue-700 transition text-center"
                  >
                    Register
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <motion.section
        style={{ backgroundImage }}
        className="relative grid min-h-screen place-content-center overflow-hidden bg-gray-50 dark:bg-gray-950 px-4 py-24 text-center text-gray-800 dark:text-gray-200"
      >
        <div className="relative z-10 flex flex-col items-center">
          <span className="mb-1.5 inline-block rounded-full bg-blue-200 dark:bg-gray-600/50 px-3 py-1.5 text-sm">
            Beta Now Live!
          </span>
          <h1 className="max-w-3xl bg-gradient-to-br from-gray-200 to-gray-700 dark:from-white dark:to-gray-400 bg-clip-text text-3xl font-medium leading-tight text-transparent sm:text-5xl md:text-7xl">
            Experience Social Media Like Never Before.
          </h1>
          <p className="my-6 max-w-xl text-base leading-relaxed md:text-lg">
            Mosaic centralizes video streaming, shorts, and community-driven content
            into one seamless experience.
          </p>
          <Link href="/auth/register">
            <motion.button
              style={{ border, boxShadow }}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              className="group relative flex w-fit items-center gap-1.5 rounded-full bg-gray-950/10 px-4 py-2 transition-colors hover:bg-gray-950/50"
            >
              Get Started.
              <FiArrowRight className="transition-transform group-hover:-rotate-45 group-active:-rotate-12" />
            </motion.button>
          </Link>
        </div>
        {/* Stars Background */}
        <div className="absolute inset-0 z-0">
          <Canvas className='hidden dark:contents'>
            <Stars 
              radius={50}
              count={2500}
              factor={4}
              fade
              speed={2}
            />
          </Canvas>
        </div>
      </motion.section>

      <main className="">
        {/* Why Join Section */}
        <section id="why-join" className="py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-12">
              Why Join Mosaic
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-lg transition"
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Download Section */}
        <section id="download" className="py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center">
            {/* Left: Details and Buttons */}
            <div className="w-full md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                Download Our App
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Experience Mosaic on your mobile device. Enjoy a unified social media
                experience at your fingertips.
              </p>
              <div className="flex space-x-4">
                <Link
                  href="https://play.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-green-500 dark:bg-green-600 text-white rounded-full hover:bg-green-600 dark:hover:bg-green-700 transition"
                >
                  Android
                </Link>
                <Link
                  href="https://www.apple.com/app-store/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-blue-500 dark:bg-blue-600 text-white rounded-full hover:bg-blue-600 dark:hover:bg-blue-700 transition"
                >
                  iOS
                </Link>
              </div>
            </div>
            {/* Right: App Screenshot */}
            <div className="w-full md:w-1/2 flex justify-center">
              <Image
                src="/app-screenshot.jpg"
                alt="App Screenshot"
                width={400}
                height={800}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* Parallax Section */}
        <section
          id="parallax"
          className="relative h-screen flex items-center justify-center text-center text-white"
        >
          <div
            className="absolute inset-0 bg-fixed bg-center bg-cover"
            style={{ backgroundImage: "url('/parallax-bg.jpg')" }}
          >
            <div className="absolute inset-0 bg-black opacity-50"></div>
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join the Revolution in Social Media
            </h2>
            <p className="mb-6 max-w-xl mx-auto">
              Step into a world where all your social media needs are met seamlessly.
              Be part of a community that thrives on creativity and connection.
            </p>
            <Link
              href="/auth/register"
              className="px-6 py-3 bg-red-500 dark:bg-red-600 text-white rounded-full hover:bg-red-600 dark:hover:bg-red-700 transition"
            >
              Get Started
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-800 text-gray-300 dark:text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-2xl font-bold gradient-text">
              <Link href="/">MOSAIC</Link>
            </div>
            <div className="flex space-x-6">
              <Link
                href="/about"
                className="hover:text-white dark:hover:text-gray-200"
              >
                About
              </Link>
              <Link
                href="/blog"
                className="hover:text-white dark:hover:text-gray-200"
              >
                Blog
              </Link>
              <Link
                href="/contact"
                className="hover:text-white dark:hover:text-gray-200"
              >
                Contact
              </Link>
              <Link
                href="/privacy"
                className="hover:text-white dark:hover:text-gray-200"
              >
                Privacy
              </Link>
            </div>
          </div>
          <div className="mt-4 text-center text-sm">
            © {new Date().getFullYear()} Mosaic. All rights reserved.
          </div>
        </div>
      </footer>

      {/*Global Animated Gradients*/}
      {/* 
      <style jsx global>{`
        @keyframes gradientAnimation {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .gradient-text {
          background: linear-gradient(270deg, #1e3a8a, #10b981);
          background-size: 400% 400%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientAnimation 8s ease infinite;
        }
        .bg-gradient-animation {
          background: linear-gradient(270deg, #ffffff, #f3f4f6);
          background-size: 400% 400%;
          animation: gradientAnimation 15s ease infinite;
        }
        .dark .bg-gradient-animation {
          background: linear-gradient(270deg, #1f2937, #111827);
          background-size: 400% 400%;
          animation: gradientAnimation 15s ease infinite;
        }
      `}</style> */}
    </div>
  );
}
