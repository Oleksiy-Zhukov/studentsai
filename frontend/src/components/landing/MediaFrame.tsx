'use client'

/**
 * MediaFrame: Simple browser-like frame for screenshots.
 * - Reuses project tokens: rounded-xl, thin border, subtle header dots
 * - Dark-ready with #141820 bg and #232a36 border
 */
import Image from 'next/image'

interface MediaFrameProps {
	src?: string
	alt: string
	priority?: boolean
	width?: number
	height?: number
	sizes?: string
	className?: string
}

export function MediaFrame({ src, alt, priority, width = 1200, height = 750, sizes = '100vw', className = '' }: MediaFrameProps) {
	return (
		<div className={`rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:bg-[#141820] dark:border-[#232a36] ${className}`}>
			<div className="flex items-center gap-1 border-b border-gray-200 bg-gray-50 px-3 py-2 dark:border-[#232a36] dark:bg-[#0f1115]" aria-hidden>
				<span className="h-2.5 w-2.5 rounded-full bg-red-400" />
				<span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
				<span className="h-2.5 w-2.5 rounded-full bg-green-400" />
			</div>
			{src ? (
				<Image src={src} alt={alt} width={width} height={height} sizes={sizes} priority={priority} className="w-full h-auto" />
			) : (
				<div className="aspect-[16/10] w-full bg-gray-100 dark:bg-[#0f1115]" aria-label={alt} />
				// TODO: Replace placeholder with real image at /public/landing/*.png
			)}
		</div>
	)
}


