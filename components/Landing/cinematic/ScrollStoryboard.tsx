'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const steps = [
	{
		heading: '1. Post. React. Ripple.',
		body: 'Share a quick post and people can react. Each reply can grow into richer stuff—images, short clips, or a longer note. A tiny spark becomes a living thread without you planning it.',
		clip: '/videos/1a.mp4',
	},
	{
		heading: '2. Elevate to Channel.',
		body: 'When an idea needs more room you turn it into a Channel. Your shorts, long videos, and written updates sit in one clean place so people always know where to find the next thing.',
		clip: '/videos/1b.mp4',
	},
	{
		heading: '3. Ignite Conversation.',
		body: 'Start a Space for real‑time talk. Voice or fast chat keeps energy high while any media you drop stays pinned for context. New people can join and “get it” in seconds.',
		clip: '/videos/d.mp4',
	},
	{
		heading: '4. Discovery Loops.',
		body: 'Discovery links everything. A short can tease a full episode. A post can point to a live Space. You see what fits your interests, not random noise—so exploring feels natural, not tiring.',
		clip: '/videos/f.mp4',
	},
];

export default function ScrollStoryboard() {
	const ref = useRef<HTMLDivElement | null>(null);
	const { scrollYProgress } = useScroll({ target: ref, offset: ['start center', 'end end'] });
	const progressScale = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

	return (
		<section ref={ref} className="relative overflow-hidden">
			<div className="relative pt-24">
				<div className="absolute left-1/2 top-24 bottom-0 w-px bg-neutral-800">
					<motion.div
						style={{ height: progressScale }}
						className="w-px bg-gradient-to-b from-indigo-500 via-fuchsia-500 to-amber-400"
					/>
				</div>
				<div className="mx-auto max-w-5xl px-6 space-y-52">
					{steps.map((s, i) => {
						const invert = i % 2 === 1; // alternate
						return (
							<motion.div
								key={i}
								initial={{ opacity: 0, y: 80 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.9, ease: 'easeOut' }}
								viewport={{ once: true, amount: 0.5 }}
								className={`relative grid gap-10 md:grid-cols-2 md:items-center ${
									invert ? 'md:[&>*:first-child]:order-2' : ''
								}`}
							>
								{/* Text Block */}
								<div
									className={`flex flex-col justify-center ${
										invert ? 'md:pl-8' : 'md:pr-8'
									}`}
								>
									<h3 className="text-2xl md:text-3xl font-semibold mb-4 bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-amber-400 bg-clip-text text-transparent">
										{s.heading}
									</h3>
									<p className="text-gray-600 dark:text-gray-400 leading-relaxed">
										{s.body}
									</p>
								</div>

								{/* Video Block */}
								<div className="relative rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-700 shadow-lg">
									<video
										className="w-full h-full object-cover"
										src={s.clip}
										autoPlay
										muted
										loop
										playsInline
									/>
									<div className="absolute inset-0 ring-1 ring-white/5 rounded-3xl pointer-events-none" />
								</div>
							</motion.div>
						);
					})}
				</div>
			</div>
		</section>
	);
}