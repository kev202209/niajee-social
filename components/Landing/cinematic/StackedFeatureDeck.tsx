'use client';
import { useEffect, useRef, useState } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import { FiActivity, FiVideo, FiMessageSquare } from 'react-icons/fi';

const layers = [
	{
		id: 'feed',
		icon: <FiActivity className="w-6 h-6" />,
		title: 'Unified Feed',
		headline: 'One stream. Multi‑format.',
		body: 'Short posts, threaded media, and reactive expansions coexist without forcing users into separate product silos.',
		accent: 'from-indigo-500 to-fuchsia-500',
		loop: '/videos/1a.mp4'
	},
	{
		id: 'channels',
		icon: <FiVideo className="w-6 h-6" />,
		title: 'Channels & Shorts',
		headline: 'Deep + quick in one identity.',
		body: 'Creators publish long form and shorts in a single channel surface—shorts become discovery gateways into full episodes.',
		accent: 'from-fuchsia-500 to-amber-400',
		loop: '/videos/1b.mp4'
	},
	{
		id: 'spaces',
		icon: <FiMessageSquare className="w-6 h-6" />,
		title: 'Conversational Spaces',
		headline: 'Chat that amplifies content.',
		body: 'Topic rooms replace isolated DMs. Conversations are context-aware: media objects stay linked to origin threads.',
		accent: 'from-emerald-400 to-cyan-400',
		loop: '/videos/d.mp4'
	}
];

const RIM = 28;            // Visible rim offset between stacked cards
const TOP_OFFSET = 112;    // Sticky top offset (match header height)
const ENTER_SHIFT = 0.70;  // % of viewport height below start the card begins
const MAX_WIDTH = '1400px';

function clamp(n: number, a: number, b: number) {
	return n < a ? a : n > b ? b : n;
}

export default function StackedFeatureDeck() {
	const sectionRef = useRef<HTMLElement | null>(null);
	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ['start start', 'end end']
	});

	// rawProgress scaled to [0, layers.length + 1]
	const [raw, setRaw] = useState(0);
	useMotionValueEvent(scrollYProgress, 'change', v => {
		setRaw(v * (layers.length + 1));
	});

	// Track viewport height for precise entering Y
	const [vh, setVh] = useState(0);
	useEffect(() => {
		const update = () => setVh(window.innerHeight);
		update();
		window.addEventListener('resize', update);
		return () => window.removeEventListener('resize', update);
	}, []);

	return (
		<section
			ref={sectionRef}
			className="relative"
			style={{
				// Height = one viewport per card + one extra to exit
				height: `calc(${layers.length + 1} * 100vh)`
			}}
		>
			{/* Bridge + ambient (optional) */}
			<div className="absolute -top-32 inset-x-0 h-48 pointer-events-none bg-gradient-to-b from-gray-50 dark:from-gray-950 to-transparent" />

			<div className="sticky" style={{ top: TOP_OFFSET }}>
				<div className="relative h-[calc(100vh-var(--stack-top))]" style={{ ['--stack-top' as any]: `${TOP_OFFSET}px` }}>
					<h2 className="absolute left-1/2 -translate-x-1/2 top-2 md:top-4 text-3xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100 z-[500] pointer-events-none">
						The Core Stack
					</h2>

					{/* Card stack container */}
					<div className="absolute inset-0 mt-20 md:mt-24">
						{layers.map((layer, i) => {
							// Segment: card i active while raw in [i, i+1]
							const local = clamp(raw - i, 0, 1); // 0→1 per card
							// Start fully hidden below; end at stacked offset
							const startY = vh * ENTER_SHIFT + (layers.length - i - 1) * (RIM * 1.2);
							const endY = i * RIM;
							const translateY = startY + (endY - startY) * local;

							// Opacity fade on enter for polish
							const opacity = local < 0.15 ? local / 0.15 : 1;

							// zIndex: later cards must sit above earlier once entered
							const zIndex = 100 + i;

							const borderRadius = 32 - i * 4;

							return (
								<div
									key={layer.id}
									className="absolute  -translate-x-1/2 will-change-transform"
                                    style={{
                                        width: '96vw',  // Remove clamp and MAX_WIDTH constraint
                                        height: 'min(96vh, 820px)',
                                        transform: `translateY(${translateY}px)`,
                                        zIndex,
                                        opacity,
                                        borderRadius
                                        }}
								>
									<div
										className="absolute inset-0 bg-white dark:bg-gray-900 border border-black/5 dark:border-white/10 shadow-[0_28px_68px_-22px_rgba(0,0,0,0.45)] overflow-hidden"
										style={{ borderRadius }}
									/>
									{layer.loop && (
										<div className="absolute inset-0 overflow-hidden" style={{ borderRadius }}>
											<video
												className="w-full h-full object-cover opacity-25 dark:opacity-30"
												src={layer.loop}
												autoPlay
												muted
												loop
												playsInline
												preload="metadata"
											/>
											<div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/15 to-white/70 dark:from-black/65 dark:via-black/35 dark:to-black/60" />
										</div>
									)}
									<div
										className="relative flex flex-col h-full px-8 md:px-16 py-12 md:py-16"
										style={{ borderRadius }}
									>
										<div
											className={`inline-flex items-center gap-2 rounded-xl px-6 py-2 text-xs md:text-sm font-medium tracking-wide text-white bg-gradient-to-r ${layer.accent} shadow-lg shadow-black/30`}
										>
											{layer.icon}
											{layer.title}
										</div>
										<div className="mt-auto mb-2 max-w-4xl">
											<h3 className="text-3xl md:text-5xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
												{layer.headline}
											</h3>
											<p className="mt-5 text-base md:text-lg leading-relaxed text-gray-700 dark:text-gray-300 max-w-prose">
												{layer.body}
											</p>
										</div>
									</div>
									<div
										className="pointer-events-none absolute inset-0 rounded-[inherit]"
										style={{
											boxShadow:
												'0 0 0 1px rgba(0,0,0,0.06), 0 4px 18px -6px rgba(0,0,0,0.35)'
										}}
									/>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			{/* Optional fade to next content (sits after stack) */}
			<div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none bg-gradient-to-b from-transparent to-gray-50 dark:to-gray-950" />
		</section>
	);
}