'use client';

import React from "react";
import Header from "./Header";
import Hero from "./Hero";
import Features from "./Features";
import Testimonials from "./Testimonials";
import DownloadSection from "./DownloadSection";
import ParallaxSection from "./ParallaxSection";
import Footer from "./Footer";

export default function Landing() {
  return (
    <div className="bg-gradient-animation dark:bg-gradient-animation-dark min-h-screen">
      <Header />
      <Hero />
      
      <main>
        <Features />
        <Testimonials /> {/* Add the new testimonials section */}
        <DownloadSection />
        <ParallaxSection />
      </main>
      
      <Footer />
      
      {/*Global Animated Gradients*/}
      {/* Add your global styles if needed */}
    </div>
  );
}