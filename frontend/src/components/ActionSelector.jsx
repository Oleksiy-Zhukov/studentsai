import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, HelpCircle, Calendar, ChevronDown, Settings, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { AnimatedButton, AnimatedIconButton } from './animated/AnimatedButton'
import { AnimatedCard } from './animated/AnimatedCard'
import { useStaggeredAnimation, useReducedMotion } from '@/hooks/useAnimations'
import { staggerContainer, staggerItem, slideVariants } from '@/animations/variants'

const actions = [
  {
    id: 'summarize',
    title: 'Summarize',
    description: 'Create a clear, concise summary of your content',
    icon: FileText,
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    id: 'generate_questions',
    title: 'Generate Questions',
    description: 'Create study questions to test your understanding',
    icon: HelpCircle,
    color: 'bg-green-50 border-green-200 hover:bg-green-100',
    iconColor: 'text-green-600'
  },
  {
    id: 'plan_study',
    title: 'Plan Study',
    description: 'Get a structured study plan for this content',
    icon: Calendar,
    color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    iconColor: 'text-purple-600'
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

  const handleActionClick = (actionId) => {
    onActionSelect(actionId)
  }

  const handleProcess = () => {
    if (selectedAction && textContent) {
      onProcess(textContent, selectedAction, additionalInstructions)
    }
  }

  const containerProps = prefersReducedMotion ? {} : {
    variants: staggerContainer,
    initial: "initial",
    animate: "animate"
  }

  return (
    <div className="space-y-6">
      {/* Action Cards */}
      <motion.div 
        {...containerProps}
        className="grid gap-4 md:grid-cols-3"
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
              <AnimatedCard
                className={`cursor-pointer transition-all duration-300 ${
                  isSelected 
                    ? 'ring-2 ring-primary ring-offset-2 bg-primary/5' 
                    : action.color
                }`}
                onClick={() => handleActionClick(action.id)}
                enableHover={!isSelected}
                delay={index * 0.1}
              >
                <div className="p-6 text-center space-y-4">
                  <motion.div
                    className="flex justify-center"
                    whileHover={prefersReducedMotion ? {} : { 
                      scale: 1.1, 
                      rotate: 5,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <div className={`p-3 rounded-full ${isSelected ? 'bg-primary/10' : 'bg-white'}`}>
                      <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : action.iconColor}`} />
                    </div>
                  </motion.div>
                  
                  <div>
                    <h3 className={`font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {action.description}
                    </p>
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex justify-center"
                    >
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    </motion.div>
                  )}
                </div>
              </AnimatedCard>
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
            className="space-y-4"
          >
            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <CollapsibleTrigger asChild>
                <AnimatedButton
                  variant="outline"
                  className="w-full justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>Advanced Options</span>
                  </div>
                  <motion.div
                    animate={{ rotate: showAdvanced ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </AnimatedButton>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="pt-4"
                >
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">
                      Additional Instructions (Optional)
                    </label>
                    <Textarea
                      placeholder="Add specific requirements or preferences..."
                      value={additionalInstructions}
                      onChange={(e) => setAdditionalInstructions(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      Provide specific instructions to customize the AI output
                    </p>
                  </div>
                </motion.div>
              </CollapsibleContent>
            </Collapsible>

            {/* Content Preview */}
            <div className="bg-muted/30 rounded-lg p-4 border">
              <h4 className="text-sm font-medium text-foreground mb-2">Content Preview</h4>
              <div className="text-sm text-muted-foreground">
                <p className="line-clamp-3">
                  {textContent.length > 200 
                    ? `${textContent.substring(0, 200)}...` 
                    : textContent
                  }
                </p>
                <p className="mt-2 text-xs">
                  {textContent.length} characters
                </p>
              </div>
            </div>

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
                className="px-8 py-3 text-lg font-medium"
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
            className="text-center p-4 bg-primary/5 border border-primary/20 rounded-lg"
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
            >
              <Sparkles className="w-5 h-5 text-primary mx-auto mb-2" />
            </motion.div>
            <p className="text-sm text-primary font-medium">
              Choose an action above to process your content
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

