'use client'

/**
 * TwoUp: Responsive two-column media grid with captions.
 */
import Image from 'next/image'

interface Item {
	src?: string
	alt: string
	caption?: string
}

interface TwoUpProps {
	items: [Item, Item]
}

export function TwoUp({ items }: TwoUpProps) {
	return (
		<div className="grid gap-6 md:grid-cols-2">
			{items.map((it, idx) => (
				<div key={idx} className="space-y-2">
					<div className="rounded-xl border border-gray-200 bg-white overflow-hidden dark:bg-[#141820] dark:border-[#232a36]">
						<div className="flex items-center gap-1 border-b border-gray-200 bg-gray-50 px-3 py-2 dark:border-[#232a36] dark:bg-[#0f1115]" aria-hidden>
							<span className="h-2.5 w-2.5 rounded-full bg-red-400" />
							<span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
							<span className="h-2.5 w-2.5 rounded-full bg-green-400" />
						</div>
						{it.src ? (
							<Image src={it.src} alt={it.alt} width={1200} height={750} sizes="(min-width: 768px) 50vw, 100vw" className="w-full h-auto" />
						) : (
							<div className="aspect-[16/10] w-full bg-gray-100 dark:bg-[#0f1115]" aria-label={it.alt} />
							// TODO: Replace placeholder with real image at /public/landing/*.png
						)}
					</div>
					{it.caption && (
						<div className="text-xs text-gray-500 dark:text-gray-400">
							{it.caption}
						</div>
					)}
				</div>
			))}
		</div>
	)
}


