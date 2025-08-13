'use client'

interface ScreenshotFrameProps {
  src: string
  alt?: string
}

export function ScreenshotFrame({ src, alt = '' }: ScreenshotFrameProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:bg-[#141820] dark:border-[#232a36]">
      <div className="flex items-center gap-1 border-b border-gray-200 bg-gray-50 px-3 py-2 dark:border-[#232a36] dark:bg-[#0f1115]">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400" aria-hidden />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="block w-full" />
    </div>
  )
}


