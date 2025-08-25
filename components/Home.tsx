"use client";

import React, { FC, useState } from "react";
import Header from "@/components/home/Header";
import Sidebar from "@/components/home/Sidebar";
import MobileBottomNav from "@/components/home/MobileBottomNav";
import MainContent from "@/components/home/MainContent";
import TweetFeed from "@/components/home/TweetFeed";
import Footer from "@/components/home/Footer";

const HomePage: FC = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 lg:pb-0"> {/* reserve space for mobile nav */}
      <Header />
      
      {/* Main Layout Container - Flex layout */}
      <div className="flex pt-16">
        {/* Sidebar (desktop only) */}
        <Sidebar 
          isExpanded={isSidebarExpanded} 
          setIsExpanded={setIsSidebarExpanded} 
        />
        
        {/* Main Content Area - Takes remaining space */}
        <main className="flex-1 min-w-0">
          <div className="max-w-none">
            <MainContent />
          </div>
        </main>

        {/* TweetFeed - Hidden on mobile, visible on lg+ */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <TweetFeed />
        </div>
      </div>
      
      <Footer />

      {/* Mobile bottom navigation (fixed) */}
      <MobileBottomNav />
    </div>
  );
};

export default HomePage;