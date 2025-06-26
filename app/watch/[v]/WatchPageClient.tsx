"use client";

import { useState } from "react";
import Sidebar from "@/components/watch/Sidebar";
import Header from "@/components/watch/Header";

interface WatchPageClientProps {
  children: React.ReactNode;
}

export default function WatchPageClient({ children }: WatchPageClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Header />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {children}
    </>
  );
}