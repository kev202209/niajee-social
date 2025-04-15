'use client';

import { useAuth } from '@/contexts/AuthContext';
import Home from '@/components/Home';
import Landing from '@/components/Landing';

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // Show landing page for non-logged in users
  if (!user) {
    return <Landing />;
  }

  // Show home page for logged in users
  return <Home />;
}
