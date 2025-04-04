"use client";

import React, { FC } from "react";
import Header from "@/components/home/header";
import Sidebar from "@/components/home/sidebar";
import MainContent from "@/components/home/MainContent";
import TweetFeed from "@/components/home/TweetFeed";
import Footer from "@/components/home/Footer";

const HomePage: FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <Sidebar isOpen={false} onClose={() => {}} />
      {/* Hide TweetFeed on screens smaller than lg breakpoint */}
      <div className="hidden lg:block">
        <TweetFeed />
      </div>
      {/* Adjust main content margins responsively */}
      <main className="ml-0 mr-0 pt-16 
        sm:ml-60 
        lg:mr-80 
        transition-all duration-300">
        <MainContent />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;