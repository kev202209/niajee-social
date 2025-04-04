"use client";

import React, { FC, useState } from "react";
import Header from "@/components/home/header";
import Sidebar from "@/components/home/sidebar";
import MainContent from "@/components/home/MainContent";
import TweetFeed from "@/components/home/TweetFeed";
import Footer from "@/components/home/Footer";

const HomePage: FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header onMenuClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <TweetFeed />
      <main className={`
        pt-16 transition-all duration-300
        ${isSidebarOpen ? 'ml-56' : 'ml-16'}
        mr-80
      `}>
        <MainContent />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
