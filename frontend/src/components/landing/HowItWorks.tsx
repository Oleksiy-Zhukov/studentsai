'use client'

import { useState, useEffect } from 'react'

interface Step {
  id: number
  title: string
  description: string
}

const steps: Step[] = [
  {
    id: 1,
    title: 'Create Notes',
    description: 'Write or import your study materials with AI assistance'
  },
  {
    id: 2,
    title: 'AI Generates Flashcards',
    description: 'Automatically create contextual flashcards from your notes'
  },
  {
    id: 3,
    title: 'Study & Get Feedback',
    description: 'Practice with spaced repetition and receive AI-powered feedback'
  }
]

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev % 3) + 1)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-16">
        <h2 className="text-5xl font-semibold text-gray-900 dark:text-white mb-6">
          How It Works
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          From notes to mastery in three simple steps. Our AI-powered system does the heavy lifting while you focus on learning.
        </p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`relative transition-all duration-500 ${
              activeStep === step.id ? 'scale-105' : 'scale-100'
            }`}
          >
            {/* Step Card */}
            <div className={`relative bg-white dark:bg-[#141820] rounded-2xl border transition-all duration-500 ${
              activeStep === step.id 
                ? 'border-orange-500 shadow-lg' 
                : 'border-gray-200 dark:border-[#232a36]'
            } overflow-hidden p-8`}>
              
              {/* Step Number */}
              <div className="text-6xl font-light text-gray-200 dark:text-gray-700 mb-6">
                {step.id}
              </div>

              {/* Content */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Active Indicator */}
              {activeStep === step.id && (
                <div className="absolute top-4 right-4 w-2 h-2 bg-orange-500 rounded-full" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Connection Lines */}
      <div className="hidden md:block relative mb-20">
        <div className="absolute top-1/2 left-1/4 w-1/2 h-px bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 transform -translate-y-1/2" />
        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-orange-500 rounded-full transform -translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-orange-500 rounded-full transform -translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-3/4 w-2 h-2 bg-orange-500 rounded-full transform -translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Demo Section */}
      <div className="bg-gray-50 dark:bg-[#0f1115] rounded-2xl p-12">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            See the Magic Happen
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Watch how your notes transform into intelligent study materials
          </p>
        </div>

        {/* Demo Display */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-[#141820] rounded-2xl border border-gray-200 dark:border-[#232a36] p-8 shadow-sm">
            <div className="flex items-center justify-center space-x-6 mb-8">
              <div className={`w-3 h-3 rounded-full transition-all duration-500 ${
                activeStep >= 1 ? 'bg-orange-500' : 'bg-gray-300'
              }`} />
              <div className={`w-3 h-3 rounded-full transition-all duration-500 ${
                activeStep >= 2 ? 'bg-orange-500' : 'bg-gray-300'
              }`} />
              <div className={`w-3 h-3 rounded-full transition-all duration-500 ${
                activeStep >= 3 ? 'bg-orange-500' : 'bg-gray-300'
              }`} />
            </div>

            <div className="text-center">
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {steps[activeStep - 1].title}
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                {steps[activeStep - 1].description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
