/**
 * Design rationale: Minimal, modern hero with a subtle Japanese 90s nod via thin borders and gentle motion.
 * It reuses the project's Tailwind + shadcn tokens (spacing, radius, orange #f97316 accent via Button) and typography.
 */
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MediaFrame } from '@/components/landing/MediaFrame'

interface HeroProps {
	headline?: string
	subhead?: string
}

export function Hero({
	headline = 'Turn Your Notes into a Knowledge Network',
	subhead = 'StudentsAI links ideas with backlinks, keywords, and an interactive graph—so studying feels organized and fast.'
}: HeroProps) {
	return (
		<section className="relative overflow-hidden">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 opacity-[0.06] dark:opacity-[0.08]"
				style={{
					backgroundImage:
						'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
					backgroundSize: '24px 24px'
				}}
			/>

			<div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-28">
				<div className="grid gap-8 md:grid-cols-2 items-center">
					<div>
						<h1 className="animate-in fade-in slide-in-from-bottom-2 text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50 md:text-6xl">
							{headline}
						</h1>
						<p className="animate-in fade-in slide-in-from-bottom-2 delay-100 mt-5 text-xl text-gray-600 dark:text-gray-300">
							{subhead}
						</p>
						<div className="animate-in fade-in slide-in-from-bottom-2 delay-200 mt-8 flex items-center gap-3">
							<Link href="/auth">
								<Button className="bg-orange-500 hover:bg-orange-600 focus-visible:ring-orange-500 h-11 px-6 text-base">Start Free</Button>
							</Link>
							<Link href="/">
								<Button variant="outline" className="h-11 px-6 text-base dark:border-[#232a36]">Open App</Button>
							</Link>
						</div>
					</div>
					<div className="animate-in fade-in slide-in-from-bottom-2">
						<MediaFrame src="/screens/Notes.png" alt="Notes view screenshot" priority sizes="(min-width: 768px) 50vw, 100vw" />
					</div>
				</div>
			</div>
		</section>
	)
}


