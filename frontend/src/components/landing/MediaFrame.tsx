'use client'

/**
 * MediaFrame: Minimalistic, rounded frame for screenshots.
 * - Clean, modern design with subtle borders
 * - Dark-ready with slight transparency
 * - Proper responsive sizing that maintains full image quality
 * - Images display at optimal size without artificial scaling
 */

interface MediaFrameProps {
	src?: string
	alt: string
	priority?: boolean
	className?: string
}

export function MediaFrame({ src, alt, priority, className = '' }: MediaFrameProps) {
	return (
		<div className={`rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:bg-gray-900 dark:border-gray-700 ${className}`}>
			{src ? (
				<div className="relative flex justify-center">
					<img 
						src={src} 
						alt={alt} 
						className="max-w-full h-auto object-contain"
						style={{ 
							display: 'block',
							maxWidth: '100%',
							height: 'auto'
						}}
						loading={priority ? 'eager' : 'lazy'}
					/>
				</div>
			) : (
				<div className="aspect-[16/10] w-full bg-gray-100 dark:bg-gray-800" aria-label={alt} />
			)}
		</div>
	)
}


