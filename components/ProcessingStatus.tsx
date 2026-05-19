'use client'

import { Card } from '@/components/ui/card'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

const translations = {
  en: {
    'processing.title': 'Processing with Replicate AI',
    'processing.step1': 'Converting Audio to Base64...',
    'processing.step2': 'Separating Vocals with Demucs...',
    'processing.step3': 'Cloning Voice with RVC...',
    'processing.step4': 'Generating New Name with TTS...',
  },
  ar: {
    'processing.title': 'المعالجة باستخدام Replicate AI',
    'processing.step1': 'تحويل الصوت إلى Base64...',
    'processing.step2': 'فصل الأصوات باستخدام Demucs...',
    'processing.step3': 'استنساخ الصوت باستخدام RVC...',
    'processing.step4': 'توليد الاسم الجديد باستخدام TTS...',
  }
}

interface ProcessingStep {
  id: number
  label: string
}

interface ProcessingStatusProps {
  currentStep: number
  isProcessing: boolean
  language: 'en' | 'ar'
}

export function ProcessingStatus({ currentStep, isProcessing, language }: ProcessingStatusProps) {
  const t = (key: string) => translations[language][key as keyof typeof translations['en']] || key
  const [animatedStep, setAnimatedStep] = useState(0)

  useEffect(() => {
    if (isProcessing) {
      const timer = setInterval(() => {
        setAnimatedStep((prev) => (prev < 4 ? prev + 1 : 4))
      }, 2500)
      return () => clearInterval(timer)
    }
    setAnimatedStep(currentStep)
  }, [isProcessing, currentStep])

  const steps: ProcessingStep[] = [
    { id: 1, label: t('processing.step1') },
    { id: 2, label: t('processing.step2') },
    { id: 3, label: t('processing.step3') },
    { id: 4, label: t('processing.step4') },
  ]

  return (
    <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <h3 className="text-lg font-semibold mb-8 text-foreground">
        {t('processing.title')}
      </h3>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = index < animatedStep
          const isActive = index === animatedStep

          return (
            <div key={step.id} className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                {isCompleted ? (
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-accent-foreground" />
                  </div>
                ) : isActive ? (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center animate-pulse">
                    <Loader2 className="h-5 w-5 text-primary-foreground animate-spin" />
                  </div>
                ) : (
                  <Circle className="h-8 w-8 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1">
                <p
                  className={`text-sm font-medium transition-colors ${
                    isCompleted || isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </p>
              </div>

              {isActive && isProcessing && (
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-100" />
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-200" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-8 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
          style={{ width: `${(animatedStep / steps.length) * 100}%` }}
        />
      </div>

      {isProcessing && (
        <p className="mt-4 text-xs text-muted-foreground text-center">
          Processing your song... This may take a few moments.
        </p>
      )}
    </Card>
  )
}
