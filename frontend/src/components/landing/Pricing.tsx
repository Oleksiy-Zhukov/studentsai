'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function Pricing() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-3xl font-semibold text-gray-900 text-center dark:text-gray-100">Free Forever — Upgrade if You Want</h2>
      <p className="mt-3 text-lg text-gray-600 text-center dark:text-gray-300">All core features are free with a fair monthly AI quota. Upgrade for more requests and priority speed.</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <Card className="dark:border-[#232a36]">
          <CardContent className="p-7">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Free</div>
            <div className="mt-1 text-4xl font-semibold text-gray-900 dark:text-gray-100">$0</div>
            <ul className="mt-5 space-y-2 text-[15px] text-gray-600 dark:text-gray-300">
              <li>• Notes with Markdown and backlinks</li>
              <li>• Graph view</li>
              <li>• Flashcards</li>
              <li>• AI summaries (limited monthly calls)</li>
            </ul>
            <Link href="/auth" className="inline-block mt-7">
              <Button className="bg-orange-500 hover:bg-orange-600 focus-visible:ring-orange-500 h-11 px-6">Start Free</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="dark:border-[#232a36]">
          <CardContent className="p-7">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Paid</div>
            <div className="mt-1 text-4xl font-semibold text-gray-900 dark:text-gray-100">$5<span className="text-base font-normal text-gray-500 dark:text-gray-400">/mo</span></div>
            <ul className="mt-5 space-y-2 text-[15px] text-gray-600 dark:text-gray-300">
              <li>• Everything in Free</li>
              <li>• Higher AI monthly quota</li>
              <li>• Faster responses</li>
              <li>• Priority support</li>
            </ul>
            <Link href="/auth" className="inline-block mt-7">
              <Button variant="outline" className="h-11 px-6 dark:border-[#232a36]">Upgrade (Coming Soon)</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}


