import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, HelpCircle, Calendar, ChevronDown, Settings, Sparkles, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { AnimatedButton, AnimatedIconButton } from './animated/AnimatedButton'
import { EnhancedCard, CardContent } from './ui/enhanced-card'
import { RecaptchaWrapper } from './RecaptchaWrapper'
import { useRecaptchaContext } from './RecaptchaProvider'
import { useStaggeredAnimation, useReducedMotion } from '@/hooks/useAnimations'
import { staggerContainer, staggerItem, slideVariants } from '@/animations/variants'
import { getActionColor, createStaggerAnimation } from '@/lib/design-system'

const actions = [
  {
    id: 'summarize',
    title: 'Summarize',
    description: 'Create a clear, concise summary of your content',
    icon: FileText,
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    iconColor: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    id: 'generate_questions',
    title: 'Generate Questions',
    description: 'Create study questions to test your understanding',
    icon: HelpCircle,
    color: 'bg-green-50 border-green-200 hover:bg-green-100',
    iconColor: 'text-green-600',
    gradient: 'from-green-500 to-green-600'
  },
  {
    id: 'plan_study',
    title: 'Plan Study',
    description: 'Get a structured study plan for this content',
    icon: Calendar,
    color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    iconColor: 'text-purple-600',
    gradient: 'from-purple-500 to-purple-600'
  },
  {
    id: 'flashcards',
    title: 'Generate Flashcards',
    description: 'Create flashcards for active recall learning',
    icon: CreditCard,
    color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
    iconColor: 'text-orange-600',
    gradient: 'from-orange-500 to-orange-600'
  }
]

export const ActionSelector = ({ 
  onActionSelect, 
  selectedAction, 
  textContent, 
  onProcess, 
  isLoading 
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [additionalInstructions, setAdditionalInstructions] = useState('')
  const visibleActions = useStaggeredAnimation(actions.length, 0.1)
  const prefersReducedMotion = useReducedMotion()
  const recaptcha = useRecaptchaContext()

  const handleActionClick = (actionId) => {
    onActionSelect(actionId)
  }

  const handleProcess = async () => {
    if (selectedAction && textContent) {
      // Execute reCAPTCHA v3 before processing
      if (recaptcha.isEnabled && recaptcha.isReady) {
        try {
          const recaptchaToken = await recaptcha.execute('submit')
          onProcess(textContent, selectedAction, additionalInstructions, recaptchaToken)
        } catch (recaptchaError) {
          console.error('reCAPTCHA error:', recaptchaError)
          // Still proceed with empty token for now
          onProcess(textContent, selectedAction, additionalInstructions, '')
        }
      } else {
        onProcess(textContent, selectedAction, additionalInstructions, '')
      }
    }
  }

  const containerProps = prefersReducedMotion ? {} : {
    variants: staggerContainer,
    initial: "initial",
    animate: "animate"
  }

  return (
    <div className="space-y-8">
      {/* Action Cards */}
      <motion.div 
        {...containerProps}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {actions.map((action, index) => {
          const isVisible = index < visibleActions
          const isSelected = selectedAction === action.id
          const Icon = action.icon

          const itemProps = prefersReducedMotion ? {
            initial: { opacity: 1 },
            animate: { opacity: 1 }
          } : {
            variants: staggerItem,
            initial: "initial",
            animate: isVisible ? "animate" : "initial"
          }

          return (
            <motion.div key={action.id} {...itemProps}>
              <EnhancedCard
                variant="interactive"
                className={`relative overflow-hidden transition-all duration-300 ${
                  isSelected 
                    ? 'ring-2 ring-primary ring-offset-2 shadow-lg scale-105' 
                    : 'hover:shadow-lg'
                }`}
                onClick={() => handleActionClick(action.id)}
                animation="bounceIn"
                delay={index * 0.1}
              >
                {/* Gradient background for selected state */}
                {isSelected && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-5`} />
                )}
                
                <CardContent className="p-6 text-center space-y-4 relative z-10">
                  <motion.div
                    className="flex justify-center"
                    whileHover={prefersReducedMotion ? {} : { 
                      scale: 1.1, 
                      rotate: 5,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <div className={`p-4 rounded-full ${
                      isSelected 
                        ? 'bg-gradient-to-br from-primary to-primary/80 shadow-lg' 
                        : 'bg-white shadow-md'
                    }`}>
                      <Icon className={`w-8 h-8 ${
                        isSelected ? 'text-white' : action.iconColor
                      }`} />
                    </div>
                  </motion.div>
                  
                  <div className="space-y-2">
                    <h3 className={`text-lg font-semibold ${
                      isSelected ? 'text-primary' : 'text-foreground'
                    }`}>
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {action.description}
                    </p>
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex justify-center"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        <span className="text-xs text-primary font-medium">Selected</span>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </EnhancedCard>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Advanced Options */}
      <AnimatePresence>
        {selectedAction && (
          <motion.div
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <EnhancedCard variant="elevated" className="overflow-hidden">
              <CardContent className="p-6">
                <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                  <CollapsibleTrigger asChild>
                    <AnimatedButton
                      variant="outline"
                      className="w-full justify-between group"
                    >
                      <div className="flex items-center space-x-3">
                        <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        <span className="font-medium">Advanced Options</span>
                      </div>
                      <motion.div
                        animate={{ rotate: showAdvanced ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-5 h-5" />
                      </motion.div>
                    </AnimatedButton>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="pt-6 space-y-4"
                    >
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground flex items-center space-x-2">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span>Additional Instructions (Optional)</span>
                        </label>
                        <Textarea
                          placeholder="Add specific requirements or preferences for the AI output..."
                          value={additionalInstructions}
                          onChange={(e) => setAdditionalInstructions(e.target.value)}
                          className="min-h-[100px] resize-none focus:ring-2 focus:ring-primary/20"
                        />
                        <p className="text-xs text-muted-foreground flex items-start space-x-2">
                          <span className="text-primary">💡</span>
                          <span>Provide specific instructions to customize the AI output format, style, or focus areas</span>
                        </p>
                      </div>
                    </motion.div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </EnhancedCard>

            {/* Content Preview */}
            <EnhancedCard variant="default" className="border-dashed">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <FileText className="w-5 h-5 text-primary" />
                  <h4 className="text-lg font-medium text-foreground">Content Preview</h4>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 border">
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {textContent.length > 200 
                      ? `${textContent.substring(0, 200)}...` 
                      : textContent
                    }
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">
                      {textContent.length} characters
                    </span>
                    <span className="text-xs text-primary font-medium">
                      Ready to process
                    </span>
                  </div>
                </div>
              </CardContent>
            </EnhancedCard>

            {/* reCAPTCHA v3 is invisible - no UI needed */}
            <RecaptchaWrapper
              action="submit"
              onVerify={(token) => {
                // Token is automatically handled by the useRecaptcha hook
              }}
              onError={(error) => {
                console.error('reCAPTCHA error:', error)
              }}
            />

            {/* Process Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center"
            >
              <AnimatedIconButton
                icon={Sparkles}
                size="lg"
                onClick={handleProcess}
                disabled={!selectedAction || !textContent || isLoading}
                isLoading={isLoading}
                className="px-10 py-4 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? 'Processing...' : `${actions.find(a => a.id === selectedAction)?.title || 'Process'}`}
              </AnimatedIconButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection Hint */}
      <AnimatePresence>
        {!selectedAction && textContent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center p-6 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl"
          >
            <motion.div
              animate={prefersReducedMotion ? {} : {
                scale: [1, 1.05, 1],
                transition: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4"
            >
              <Sparkles className="w-6 h-6 text-primary" />
            </motion.div>
            <h3 className="text-lg font-semibold text-primary mb-2">
              Choose an Action
            </h3>
            <p className="text-sm text-muted-foreground">
              Select an action above to process your content with AI
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
