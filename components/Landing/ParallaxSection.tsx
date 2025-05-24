import React from "react";
import Link from "next/link";

export default function ParallaxSection() {
  return (
    <section
      id="parallax"
      className="relative h-screen flex items-center justify-center text-center text-white"
    >
      <div
        className="absolute inset-0 bg-fixed bg-center bg-cover"
        style={{ backgroundImage: "url('/parallax-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>
      <div className="relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Join the Revolution in Social Media
        </h2>
        <p className="mb-6 max-w-xl mx-auto">
          Step into a world where all your social media needs are met seamlessly.
          Be part of a community that thrives on creativity and connection.
        </p>
        <Link
          href="/auth/register"
          className="px-6 py-3 bg-red-500 dark:bg-red-600 text-white rounded-full hover:bg-red-600 dark:hover:bg-red-700 transition"
        >
          Get Started
        </Link>
      </div>
    </section>
  );
}