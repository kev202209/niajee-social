'use client';
import { motion } from 'framer-motion';

const phases = [
	{
		title: 'Early Beta',
		date: 'Now',
		desc: 'Core features live. Testing, feedback, and improvements in progress.',
		current: true,
	},
	{
		title: 'Onboard Early Users',
		date: 'Next',
		desc: 'Inviting first wave of users to shape the community and content.',
	},
	{
		title: 'Spaces',
		date: 'Soon',
		desc: 'Launch conversational spaces for real-time community interaction.',
	},
	{
		title: 'Monetization',
		date: 'Later',
		desc: 'Introduce memberships, tipping, and analytics for creators.',
	},
];

export default function RoadmapTeaser() {
	return (
		<section className="relative py-36 bg-gray-50 dark:bg-gray-950 transition-colors">
			<div className="mx-auto max-w-6xl px-6 relative">
				<h2 className="text-center text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-amber-400 bg-clip-text text-transparent">
					The Road Ahead
				</h2>
				<p className="text-center text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-20">
					Transparent roadmap. Help shape the stack. No fake hype—just deliberate
					building.
				</p>
				<div className="grid gap-8 md:grid-cols-4">
					{phases.map((p, i) => (
						<motion.div
							key={p.title}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: i * 0.05 }}
							viewport={{ once: true, amount: 0.5 }}
							className={`relative rounded-2xl border border-indigo-700/40 bg-indigo-100/80 dark:bg-indigo-900/60 p-6 backdrop-blur
                ${p.current ? 'ring-2 ring-fuchsia-400 shadow-lg' : ''}`}
						>
							<div
								className={`text-sm font-medium ${
									p.current ? 'text-fuchsia-500' : 'text-fuchsia-400'
								}`}
							>
								{p.date}
							</div>
							<h3
								className={`mt-3 text-lg font-semibold ${
									p.current
										? 'text-indigo-900 dark:text-white'
										: 'text-indigo-900 dark:text-indigo-100'
								}`}
							>
								{p.title}
							</h3>
							<p className="mt-2 text-indigo-800 dark:text-indigo-200 text-sm leading-relaxed">
								{p.desc}
							</p>
							<div className="absolute inset-px rounded-[15px] pointer-events-none ring-1 ring-white/5" />
							{p.current && (
								<div className="absolute top-4 right-4 bg-fuchsia-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow">
									Current
								</div>
							)}
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}