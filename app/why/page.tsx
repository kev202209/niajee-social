'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Users, Shield, Globe } from 'lucide-react';
import Header from '@/components/Landing/Header';
import Footer from '@/components/Landing/Footer';

export default function WhyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      <Header /> {/* Add Landing Header */}
      <div className="max-w-4xl mx-auto px-4 py-16 pt-24"> {/* Adjusted pt-16 to pt-24 for header space */}
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight pb-2"> {/* Added leading-tight and pb-2 */}
            <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Why Niajee?
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A space where Africa tells its own story—unfiltered, unbiased, and truly ours.
          </p>
        </div>

        {/* Introduction */}
        <section className="mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              Imagine a world where your voice isn't just heard—it's celebrated. Where your culture isn't exoticized or misunderstood, but embraced as the heartbeat of innovation and creativity. Niajee isn't just another app; it's a revolution born from the soul of Africa. It's the answer to a question we've all asked: <strong>Why should we settle for spaces built by others, when we can build our own?</strong>
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              In a digital world dominated by foreign giants, Africans have been spectators in our own narrative. We've shared our stories, our struggles, and our triumphs on platforms that don't understand us. Platforms that silence our voices, amplify biases, and profit from our pain. But no more. Niajee is Africa's home on the internet—a sanctuary where we connect, create, and thrive without fear of erasure.
            </p>
          </div>
        </section>

        {/* The Problem */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <Shield className="w-8 h-8 text-red-500 mr-4" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">The Problem: Lost in the Crowd</h2>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              Think about the last time you scrolled through a foreign social media app. Did you see stories that reflected your reality? Did you feel seen, heard, or valued? For too long, Africans have navigated a digital landscape rigged against us. Algorithms that prioritize content from elsewhere, moderation policies that misunderstand our context, and cultural biases that turn our vibrant traditions into stereotypes.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              Remember the young entrepreneur in Lagos whose business idea was flagged as "spam" because it didn't fit Western norms? Or the artist in Nairobi whose cultural posts were buried under irrelevant ads? These aren't isolated incidents—they're the daily reality of being African online. We've built empires, created art that moves the world, and fostered communities that span continents. Yet, on foreign platforms, we're often reduced to hashtags or headlines.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              It's not just frustrating—it's heartbreaking. We've watched our stories be twisted, our voices be muted, and our potential be underestimated. Africa deserves better. Africa <em>demands</em> better.
            </p>
          </div>
        </section>

        {/* The Vision */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <Globe className="w-8 h-8 text-blue-500 mr-4" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">The Vision: Our Space, Our Rules</h2>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              Niajee is more than an app—it's a movement. Built by Africans, for Africans, it reclaims our digital sovereignty. Here, your stories aren't filtered through someone else's lens. Your creativity isn't censored by outdated rules. Your community isn't overshadowed by global trends that don't resonate with us.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              Picture this: A platform where Swahili memes go viral without explanation. Where Afrobeat playlists are the default, not the exception. Where entrepreneurs connect with investors who understand the African hustle. Where families share recipes passed down through generations, and artists showcase work that honors our heritage.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              This is our space to dream big, to innovate freely, and to build the future we envision. No more apologies for our accents, our cultures, or our ambitions. Niajee is where Africa leads the conversation.
            </p>
          </div>
        </section>

        {/* The Impact */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <Users className="w-8 h-8 text-green-500 mr-4" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">The Impact: A Ripple That Becomes a Wave</h2>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              When Africans have their own platform, the impact is profound. Businesses thrive without cultural barriers. Creators gain audiences that truly appreciate their work. Communities form around shared values, not algorithms designed for profit.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              Imagine the young girl in rural Kenya who discovers her voice through Niajee, inspiring millions with her poetry. Or the tech innovator in Cape Town who finds collaborators across the continent, launching the next big startup. These aren't fantasies—they're the real possibilities when we control our narrative.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              By choosing Niajee, you're not just joining an app; you're investing in Africa's future. You're saying, "Our stories matter. Our voices count. Our continent deserves its place in the digital world."
            </p>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-8 text-white shadow-lg">
            <Heart className="w-12 h-12 mx-auto mb-4 text-white" />
            <h2 className="text-3xl font-bold mb-4">Join the Movement</h2>
            <p className="text-lg mb-6">
              Niajee is Africa's call to action. It's time to build, to connect, to create—on our terms. Whether you're an entrepreneur, an artist, a dreamer, or just someone who believes in Africa's potential, this is your platform.
            </p>
            <p className="text-lg mb-8">
              Share this page. Tell your friends. Download the app. Support the vision. Together, we'll show the world what Africa can achieve when we have the space to shine.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-full hover:bg-gray-100 transition"
              >
                Join Niajee
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3 border border-white text-white font-semibold rounded-full hover:bg-white hover:text-indigo-600 transition"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer /> {/* Add Landing Footer */}
    </div>
  );
}