'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function EarlyAccessCTA() {
  return (
    <section className="relative py-32 ">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity:0, y:30 }}
          whileInView={{ opacity:1, y:0 }}
          transition={{ duration:.8 }}
          viewport={{ once:true }}
          className="text-4xl md:text-5xl font-bold tracking-tight text-blue-500 dark:text-gray-50"
        >
          Open Beta Is Live
        </motion.h2>
        <p className="mt-6 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Dive in now. Your feedback shapes launch velocity. No gates—create a channel, post, explore Spaces.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/register"
            className="rounded-xl bg-button-bg px-8 py-3 text-sm font-semibold text-white shadow hover:brightness-110 transition"
          >
            Create Your Account
          </Link>
          <a
            href="#mobile"
            className="rounded-xl border border-gray-300 dark:border-white/15 px-8 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition"
          >
            Mobile Coming Soon
          </a>
        </div>
      </div>
    </section>
  );
}