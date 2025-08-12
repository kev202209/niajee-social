'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const steps = [
	{
		heading: '1. Post. React. Ripple.',
		body: 'Micro-posts trigger contextual expansions: threads evolve into media objects.',
		clip: '/videos/1a.mp4',
	},
	{
		heading: '2. Elevate to Channel.',
		body: 'Long form publishing & shorts live in one channel identity.',
		clip: '/videos/1b.mp4',
	},
	{
		heading: '3. Ignite Conversation.',
		body: 'Chat spaces bind topic, people, and media into evolving rooms.',
		clip: '/videos/d.mp4',
	},
	{
		heading: '4. Discovery Loops.',
		body: 'Algorithm surfaces cross-format relevance – shorts can preview long episodes.',
		clip: '/videos/f.mp4',
	},
];

export default function ScrollStoryboard() {
	const ref = useRef<HTMLDivElement | null>(null);
	const { scrollYProgress } = useScroll({ target: ref, offset: ['start center', 'end end'] });
	const progressScale = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

	return (
		<section ref={ref} className="relative overflow-hidden ">
			<div className="relative pt-24">
				<div className="absolute left-1/2 top-24 bottom-0 w-px bg-neutral-800">
					<motion.div
						style={{ height: progressScale }}
						className="w-px bg-gradient-to-b from-indigo-500 via-fuchsia-500 to-amber-400"
					/>
				</div>
				<div className="mx-auto max-w-5xl px-6 space-y-52">
					{steps.map((s, i) => (
						<motion.div
							key={i}
							initial={{ opacity: 0, y: 80 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.9, ease: 'easeOut' }}
							viewport={{ once: true, amount: 0.5 }}
							className="relative grid gap-10 md:grid-cols-2"
						>
							<div className="order-2 md:order-1">
								<h3 className="text-2xl md:text-3xl font-semibold mb-4">{s.heading}</h3>
								<p className="text-gray-400 leading-relaxed">{s.body}</p>
							</div>
							<div className="order-1 md:order-2 relative rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-700">
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
					))}
				</div>
			</div>
		</section>
	);
}