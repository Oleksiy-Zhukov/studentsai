'use client'

/**
 * Section: Generic section wrapper with two type variants.
 * - variant="default" → standard landing typography
 * - variant="alt" → smaller-caps label, tighter leading, subtle vertical keyline
 */
import { ReactNode } from 'react'

interface SectionProps {
	label?: string
	title?: string
	body?: string
	children?: ReactNode
	variant?: 'default' | 'alt'
	className?: string
}

export function Section({ label, title, body, children, variant = 'default', className = '' }: SectionProps) {
	return (
		<section className={`mx-auto max-w-7xl px-6 py-16 ${className}`} data-reveal>
			<div className={variant === 'alt' ? 'grid gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-start' : 'grid gap-10 md:grid-cols-2 items-start'}>
				<div>
					{label && (
						<div className="text-[11px] tracking-[0.14em] uppercase text-gray-500 dark:text-gray-400 mb-3">{label}</div>
					)}
					{title && (
						<h2 className={`font-semibold text-gray-900 dark:text-gray-100 ${variant === 'alt' ? 'text-2xl leading-tight' : 'text-3xl'}`}>{title}</h2>
					)}
					{body && (
						<p className={`mt-3 text-gray-600 dark:text-gray-300 ${variant === 'alt' ? 'text-[15px] leading-snug' : 'text-lg'}`}>{body}</p>
					)}
				</div>
				<div className={variant === 'alt' ? 'md:border-l md:pl-8 md:border-gray-200 md:dark:border-[#232a36]' : ''}>
					{children}
				</div>
			</div>
		</section>
	)
}


