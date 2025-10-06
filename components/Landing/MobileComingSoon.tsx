'use client';
import { motion } from 'framer-motion';
// This is the culprit of the width issue on home page so before uncommenting, fix the width problem
export default function MobileComingSoon() {
  return (
    <section id="mobile" className="relative py-32 dark:bg-gray-950 bg-gray-50 ">
      <div className=" mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity:0, x:-40 }}
          whileInView={{ opacity:1, x:0 }}
          transition={{ duration:.7 }}
          viewport={{ once:true, amount:.5 }}
        >
          <span className="inline-block bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white text-xs font-semibold px-3 py-1 rounded-full tracking-wide">
            Mobile Coming Soon
          </span>
          <h2 className="mt-5 text-3xl md:text-4xl font-bold tracking-tight text-blue-500 dark:text-gray-50">
            Native. Fast. Creator‑first.
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed max-w-prose">
            We are finalizing the mobile layer: performant feed virtualization, offline channel queues, and real‑time Spaces.
            Join the early mobile access list to help test builds before wider release.
          </p>
          <form
            onSubmit={(e)=>{ e.preventDefault(); /* capture email */ }}
            className="mt-8 flex flex-col sm:flex-row gap-4 max-w-md"
          >
            <input
              type="email"
              required
              placeholder="you@domain.com"
              className="flex-1 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/40"
            />
            <motion.button
              whileHover={{ scale:1.03 }}
              whileTap={{ scale:.97 }}
              className="rounded-xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-400 px-6 py-3 text-sm font-semibold text-white shadow"
            >
              Join Mobile List
            </motion.button>
          </form>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            You’ll receive periodic build & feature updates. Opt out anytime.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity:0, x:40 }}
          whileInView={{ opacity:1, x:0 }}
          transition={{ duration:.7, delay:.1 }}
          viewport={{ once:true, amount:.4 }}
          className="relative flex justify-center"
        >
          {/* Device placeholder */}
          <div className="relative h-[520px] rounded-[2.5rem] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 shadow-2xl border border-white/40 dark:border-white/10 overflow-hidden" style={{ width: 'min(100%, 15rem)' }}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.6),transparent_60%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_60%)] pointer-events-none" />
            {/* Screen mock */}
            <div className="absolute inset-[14px] rounded-[2rem] bg-gray-100/90 dark:bg-black/80 flex items-center justify-center">
              <div className="text-center px-4">
                <div className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">Preview</div>
                <div className="text-xl font-semibold bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Mobile Alpha
                </div>
                <div className="mt-3 text-[11px] text-gray-500 leading-snug">
                  Optimized feed scroll prototype. Shorts player. Spaces scaffold.
                </div>
              </div>
            </div>
            {/* Side buttons (decorative) - repositioned inside bounds */}
            <div className="absolute left-0 top-28 w-1 h-12 rounded-l bg-gray-400/70 dark:bg-gray-600" />
            <div className="absolute right-0 top-36 w-1 h-20 rounded-r bg-gray-400/70 dark:bg-gray-600" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}