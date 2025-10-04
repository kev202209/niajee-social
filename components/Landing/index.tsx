'use client';

import React from "react";
import Header from "../Header";
import Hero from "./Hero";
import StackedFeatureDeck from "./cinematic/StackedFeatureDeck";
import RoadmapTeaser from "./cinematic/RoadmapTeaser";
import MobileComingSoon from "./MobileComingSoon";
import EarlyAccessCTA from "./cinematic/EarlyAccessCTA";
import Footer from "./Footer";
import ScrollStoryboard from "./cinematic/ScrollStoryboard";

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 overflow-x-hidden">
      <Header />
      <Hero />
      <main>
        <StackedFeatureDeck />
        <ScrollStoryboard />
        <RoadmapTeaser />
        <MobileComingSoon />
        <EarlyAccessCTA />
      </main>
      <Footer />
    </div>
  );
}