import React from "react";
import {
  Globe,
  Zap,
  RefreshCw,
  Video,
  Users,
  LayoutGrid,
} from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <Globe className="w-12 h-12 text-blue-500 dark:text-blue-400" />,
      title: "Unified Experience",
      description:
        "Access long videos, shorts, and real-time community updates in one app.",
    },
    {
      icon: <Zap className="w-12 h-12 text-green-500 dark:text-green-400" />,
      title: "Streamlined Content",
      description:
        "Enjoy a seamless experience without jumping between multiple platforms.",
    },
    {
      icon: (
        <RefreshCw className="w-12 h-12 text-purple-500 dark:text-purple-400" />
      ),
      title: "Real-Time Updates",
      description:
        "Stay informed with community-driven conversations and trending topics.",
    },
    {
      icon: <Video className="w-12 h-12 text-red-500 dark:text-red-400" />,
      title: "Diverse Content",
      description:
        "From inspiring stories to quick updates, find content that resonates with you.",
    },
    {
      icon: <Users className="w-12 h-12 text-yellow-500 dark:text-yellow-400" />,
      title: "Creative Community",
      description:
        "Join a vibrant community that shares your passion for creativity.",
    },
    {
      icon: (
        <LayoutGrid className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
      ),
      title: "Centralized Content",
      description:
        "No more hopping between apps – find everything in one centralized hub.",
    },
  ];

  return (
    <section id="why-join" className="py-16 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-12">
          Why Join Mosaic
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-lg transition"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}