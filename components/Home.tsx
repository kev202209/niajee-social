"use client";

import React, { FC, useState } from "react";
import Header from "@/components/home/header";
import Sidebar from "@/components/home/sidebar";
import MainContent from "@/components/home/MainContent";
import TweetFeed from "@/components/home/TweetFeed";
import Footer from "@/components/home/Footer";

const HomePage: FC = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      {/* Main Layout Container - Flex layout */}
      <div className="flex pt-16">
        {/* Sidebar */}
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
    </div>
  );
};

export default HomePage;