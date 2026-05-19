'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { AudioUpload } from '@/components/AudioUpload'
import { TextInputs } from '@/components/TextInputs'
import { ReviewLyrics } from '@/components/ReviewLyrics'
import { LyricsEditor } from '@/components/LyricsEditor'
import { ProcessingStatus } from '@/components/ProcessingStatus'
import { AudioPlayer } from '@/components/AudioPlayer'
import { LanguageProvider } from '@/components/LanguageProvider'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

const translations = {
  en: {
    'main.title': 'Zero-Shot Voice Cloning',
    'main.subtitle': 'Upload your song and replace any name with AI-powered voice cloning powered by Replicate',
    'form.submit': 'Review & Continue',
    'errors.fileRequired': 'Please upload an audio file',
    'errors.nameRequired': 'Please enter both old and new names',
    'customizeAnother': 'Customize Another Song',
  },
  ar: {
    'main.title': 'استنساخ الصوت بدون نموذج',
    'main.subtitle': 'قم برفع أغنيتك واستبدل أي اسم باستخدام استنساخ الصوت الذي يعتمد على الذكاء الاصطناعي من Replicate',
    'form.submit': 'مراجعة والمتابعة',
    'errors.fileRequired': 'يرجى رفع ملف صوتي',
    'errors.nameRequired': 'يرجى إدخال الاسم القديم والجديد',
    'customizeAnother': 'خصص أغنية أخرى',
  }
}

function DashboardContent() {
  const [language, setLanguageState] = useState<'en' | 'ar'>('en')
  const [mounted, setMounted] = useState(false)

  const setLanguage = (lang: 'en' | 'ar') => {
    setLanguageState(lang)
  }

  // State Management
  const [file, setFile] = useState<File | null>(null)
  const [duration, setDuration] = useState<number>(0)
  const [fileSize, setFileSize] = useState<string>('')
  const [oldName, setOldName] = useState('')
  const [newName, setNewName] = useState('')
  const [isReviewing, setIsReviewing] = useState(false)
  const [isEditingLyrics, setIsEditingLyrics] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState(0)
  const [originalLyrics, setOriginalLyrics] = useState<string | null>(null)
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)

  useEffect(() => {
    const savedLanguage = (localStorage?.getItem('language') as 'en' | 'ar') || 'en'
    setLanguageState(savedLanguage)
    setMounted(true)
  }, [])

  // Poll for job status
  useEffect(() => {
    if (!jobId) return

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/process-audio?jobId=${jobId}`)
        const data = await response.json()

        console.log('[v0] Job status:', data)

        // Handle transcription completion
        if (data.status === 'waiting_for_edit' && data.originalLyrics && !isEditingLyrics) {
          setOriginalLyrics(data.originalLyrics)
          setIsEditingLyrics(true)
          setProcessingStep(2)
          clearInterval(pollInterval)
        } else if (data.status === 'completed') {
          setIsProcessing(false)
          setProcessingStep(4)
          setResultUrl(data.resultUrl)
          clearInterval(pollInterval)
        } else if (data.status === 'failed') {
          setIsProcessing(false)
          setError(data.errorMessage || 'Processing failed')
          setTranscriptionError(data.errorMessage)
          clearInterval(pollInterval)
        } else if (data.status === 'generating') {
          setProcessingStep(3)
        } else if (data.status === 'transcribing') {
          setProcessingStep(2)
        }
      } catch (err) {
        console.error('[v0] Polling error:', err)
      }
    }, 500)

    return () => clearInterval(pollInterval)
  }, [jobId, isEditingLyrics])

  if (!mounted) return null

  const isRTL = language === 'ar'
  const t = (key: string) => translations[language][key as keyof typeof translations['en']] || key

  const handleFileSelect = (selectedFile: File, fileDuration: number, size: string) => {
    setFile(selectedFile)
    setDuration(fileDuration)
    setFileSize(size)
    setError(null)
  }

  const handleReviewSubmit = () => {
    if (!file) {
      setError(t('errors.fileRequired'))
      return
    }

    if (!oldName.trim() || !newName.trim()) {
      setError(t('errors.nameRequired'))
      return
    }

    setError(null)
    setIsReviewing(true)
  }

  const handleConfirmProcessing = async () => {
    if (!file) {
      setError(t('errors.fileRequired'))
      return
    }

    setError(null)
    setIsProcessing(true)
    setProcessingStep(0)
    setResultUrl(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('oldName', oldName)
      formData.append('newName', newName)

      console.log('[v0] Starting processing with:', { fileName: file.name, oldName, newName })

      const response = await fetch('/api/process-audio', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process audio')
      }

      console.log('[v0] Job created:', data.jobId)
      setJobId(data.jobId)
      setIsReviewing(false)
    } catch (err) {
      console.error('[v0] Submission error:', err)
      setIsProcessing(false)
      setError(err instanceof Error ? err.message : 'Failed to process audio')
    }
  }

  const handleBackToEdit = () => {
    setIsReviewing(false)
  }

  const handleBackFromLyrics = () => {
    setIsEditingLyrics(false)
    setOriginalLyrics(null)
    setTranscriptionError(null)
  }

  const handleEditLyricsSubmit = async (editedLyrics: string) => {
    if (!jobId) {
      setError('Job ID not found')
      return
    }

    try {
      setIsProcessing(true)
      setProcessingStep(3)
      setError(null)

      console.log('[v0] Submitting edited lyrics:', editedLyrics)

      const response = await fetch('/api/process-audio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          editedLyrics,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save lyrics')
      }

      console.log('[v0] Lyrics submitted, starting generation')
      setIsEditingLyrics(false)
    } catch (err) {
      console.error('[v0] Error submitting lyrics:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit lyrics')
    }
  }

  const handleReset = () => {
    setFile(null)
    setOldName('')
    setNewName('')
    setIsReviewing(false)
    setIsEditingLyrics(false)
    setIsProcessing(false)
    setProcessingStep(0)
    setOriginalLyrics(null)
    setTranscriptionError(null)
    setResultUrl(null)
    setError(null)
    setJobId(null)
    setDuration(0)
    setFileSize('')
  }

  return (
    <LanguageProvider>
      <div className={`min-h-screen bg-background text-foreground ${isRTL ? 'dir-rtl' : ''}`}>
        <Header language={language || 'en'} onLanguageChange={(lang) => {
          setLanguageState(lang)
          localStorage.setItem('language', lang)
        }} />

        <main className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-purple-400 to-accent bg-clip-text text-transparent mb-4">
              {t('main.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('main.subtitle')}
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Results Section */}
          {resultUrl && !isProcessing && (
            <div className="mb-8">
              <AudioPlayer audioUrl={resultUrl} fileName={file?.name || 'customized'} language={language || 'en'} />
              <Button
                onClick={handleReset}
                size="lg"
                variant="outline"
                className="w-full mt-6 border-border hover:bg-muted"
              >
                {t('customizeAnother')}
              </Button>
            </div>
          )}

          {/* Processing Section */}
          {isProcessing && !isEditingLyrics && (
            <div className="mb-8">
              <ProcessingStatus currentStep={processingStep} isProcessing={isProcessing} language={language || 'en'} />
            </div>
          )}

          {/* Lyrics Editor Section */}
          {isEditingLyrics && !isProcessing && !resultUrl && originalLyrics && (
            <div className="max-w-4xl mx-auto">
              <LyricsEditor
                originalLyrics={originalLyrics}
                isLoading={false}
                onBack={handleBackFromLyrics}
                onContinue={handleEditLyricsSubmit}
                language={language || 'en'}
                error={transcriptionError}
              />
            </div>
          )}

          {/* Review Section */}
          {isReviewing && !isEditingLyrics && !isProcessing && !resultUrl && (
            <div className="max-w-4xl mx-auto">
              <ReviewLyrics
                oldName={oldName}
                newName={newName}
                fileName={file?.name || ''}
                onConfirm={handleConfirmProcessing}
                onEdit={handleBackToEdit}
                language={language || 'en'}
                isLoading={isProcessing}
              />
            </div>
          )}

          {/* Main Form Section */}
          {!isReviewing && !isEditingLyrics && !isProcessing && !resultUrl && (
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Audio Upload */}
              <div>
                <AudioUpload onFileSelect={handleFileSelect} disabled={isProcessing || isReviewing} language={language || 'en'} />
              </div>

              {/* Text Inputs */}
              {file && (
                <div>
                  <TextInputs
                    oldName={oldName}
                    newName={newName}
                    onOldNameChange={setOldName}
                    onNewNameChange={setNewName}
                    fileName={file.name}
                    duration={duration}
                    fileSize={fileSize}
                    disabled={isProcessing || isReviewing}
                    language={language || 'en'}
                  />
                </div>
              )}

              {/* Submit Button */}
              {file && (
                <Button
                  onClick={handleReviewSubmit}
                  disabled={!file || !oldName.trim() || !newName.trim()}
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground text-lg h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('form.submit')}
                </Button>
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-border mt-16 py-8 px-4">
          <div className="container text-center text-sm text-muted-foreground">
            <p>Powered by AI • Premium Song Customization Platform</p>
          </div>
        </footer>
      </div>
    </LanguageProvider>
  )
}

export default function Page() {
  return <DashboardContent />
}
