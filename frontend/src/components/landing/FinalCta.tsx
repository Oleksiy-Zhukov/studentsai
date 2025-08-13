'use client'

/**
 * FinalCta: Centered call-to-action block near the end.
 */
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface FinalCtaProps {
	title: string
	subtext?: string
}

export function FinalCta({ title, subtext }: FinalCtaProps) {
	return (
		<section className="mx-auto max-w-5xl px-6 py-16" data-reveal>
			<div className="rounded-md border border-gray-200 bg-white p-6 text-center dark:border-[#232a36] dark:bg-[#141820]">
				<h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
				{subtext && <p className="mt-2 text-gray-600 dark:text-gray-300">{subtext}</p>}
				<div className="mt-6 flex justify-center gap-3">
					<Link href="/auth">
						<Button className="bg-orange-500 hover:bg-orange-600 focus-visible:ring-orange-500">Start Free</Button>
					</Link>
					<Link href="/">
						<Button variant="outline" className="dark:border-[#232a36]">Open App</Button>
					</Link>
				</div>
			</div>
		</section>
	)
}


