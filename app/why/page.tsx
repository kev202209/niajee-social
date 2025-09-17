'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Users, Shield, Globe } from 'lucide-react';
import Header from '@/components/Header';
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
              Imagine a world where your voice isn&apos;t just heard—it&apos;s celebrated. Where your culture isn&apos;t exoticized or misunderstood, but embraced as the heartbeat of innovation and creativity. Niajee isn&apos;t just another app; it&apos;s a revolution born from the soul of Africa. It&apos;s the answer to a question we&apos;ve all asked: <strong>Why should we settle for spaces built by others, when we can build our own?</strong>
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              In a digital world dominated by foreign giants, Africans have been spectators in our own narrative. We&apos;ve shared our stories, our struggles, and our triumphs on platforms that don&apos;t understand us. Platforms that silence our voices, amplify biases, and profit from our pain. But no more. Niajee is Africa&apos;s home on the internet—a sanctuary where we connect, create, and thrive without fear of erasure.
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
              Remember the young entrepreneur in Lagos whose business idea was flagged as &quot;spam&quot; because it didn&apos;t fit Western norms? Or the artist in Nairobi whose cultural posts were buried under irrelevant ads? These aren&apos;t isolated incidents—they&apos;re the daily reality of being African online. We&apos;ve built empires, created art that moves the world, and fostered communities that span continents. Yet, on foreign platforms, we&apos;re often reduced to hashtags or headlines.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              It&apos;s not just frustrating—it&apos;s heartbreaking. We&apos;ve watched our stories be twisted, our voices be muted, and our potential be underestimated. Africa deserves better. Africa <em>demands</em> better.
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
              Niajee is more than an app—it&apos;s a movement. Built by Africans, for Africans, it reclaims our digital sovereignty. Here, your stories aren&apos;t filtered through someone else&apos;s lens. Your creativity isn&apos;t censored by outdated rules. Your community isn&apos;t overshadowed by global trends that don&apos;t resonate with us.
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
              Imagine the young girl in rural Kenya who discovers her voice through Niajee, inspiring millions with her poetry. Or the tech innovator in Cape Town who finds collaborators across the continent, launching the next big startup. These aren&apos;t fantasies—they&apos;re the real possibilities when we control our narrative.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              By choosing Niajee, you&apos;re not just joining an app; you&apos;re investing in Africa&apos;s future. You&apos;re saying, &quot;Our stories matter. Our voices count. Our continent deserves its place in the digital world.&quot;
            </p>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-8 text-white shadow-lg">
            <Heart className="w-12 h-12 mx-auto mb-4 text-white" />
            <h2 className="text-3xl font-bold mb-4">Join the Movement</h2>
            <p className="text-lg mb-6">
              Niajee is Africa&apos;s call to action. It&apos;s time to build, to connect, to create—on our terms. Whether you&apos;re an entrepreneur, an artist, a dreamer, or just someone who believes in Africa&apos;s potential, this is your platform.
            </p>
            <p className="text-lg mb-8">
              Share this page. Tell your friends. Download the app. Support the vision. Together, we&apos;ll show the world what Africa can achieve when we have the space to shine.
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
      <Footer />
    </div>
  );
}