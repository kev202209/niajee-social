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
      <Sidebar />
      <TweetFeed />
      <main className="ml-60 mr-80 pt-16">
        <MainContent />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
