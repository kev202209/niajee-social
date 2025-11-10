"use client";

export const dynamic = 'force-dynamic';

import Header from '@/components/home/Header';
import Sidebar from '@/components/home/Sidebar';
import HistoryClient from '@/components/history/HistoryClient';
import { useState } from 'react';

export default function HistoryPage() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex pt-16">
        <Sidebar 
          isExpanded={isSidebarExpanded} 
          setIsExpanded={setIsSidebarExpanded} 
          pushContent={true}
          interaction="hover"
        />
        {/* Add proper margin based on sidebar state - matching HomePage */}
        <main className={`flex-1 min-w-0 transition-all duration-300 ${
          isSidebarExpanded ? 'lg:ml-40' : 'lg:ml-20'
        }`}>
          <div className="p-4 sm:p-6 lg:p-8">
            <HistoryClient />
          </div>
        </main>
      </div>
    </div>
  );
}