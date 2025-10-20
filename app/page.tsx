'use client';

import { useAuth } from '@/contexts/AuthContext';
import Home from '@/components/home/Index';
import Landing from '@/components/Landing/index';
import Loading from './watch/[v]/loading';

export default function LandingPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  // Show landing page for non-logged in users
  if (!user) {
    return <Landing />;
  }

  // Show home page for logged in users
  return <Home />;
}
