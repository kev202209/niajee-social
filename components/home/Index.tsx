"use client";

import React, { FC, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MobileBottomNav from "./MobileBottomNav";
import MainContent from "./MainContent";
import TweetFeed from "./TweetFeed";
import Footer from "./Footer";

const HomePage: FC = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 lg:pb-0">
      <Header />
      
      {/* Main Layout Container - Flex layout */}
      <div className="flex pt-16">
        {/* Sidebar (desktop only) */}
        <Sidebar 
          isExpanded={isSidebarExpanded} 
          setIsExpanded={setIsSidebarExpanded}
          pushContent={true} // Home page should push content
        />
        
        {/* Main Content Area - Add proper margins for sidebar */}
        <main className={`flex-1 min-w-0 transition-all duration-300 ${
          isSidebarExpanded ? 'lg:ml-40' : 'lg:ml-20'
        }`}>
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