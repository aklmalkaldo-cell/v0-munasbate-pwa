'use client'

import { Upload, Music, AlertCircle } from 'lucide-react'
import { useState, useRef } from 'react'
import { Card } from '@/components/ui/card'

interface AudioUploadProps {
  onFileSelect: (file: File, duration: number, size: string) => void
  disabled: boolean
  language: 'en' | 'ar'
}

const translations = {
  en: {
    'upload.title': 'Upload Your Song',
    'upload.subtitle': 'Drag and drop your MP3 or WAV file',
    'upload.dragText': 'Drop your audio file here',
    'upload.browseText': 'or browse your files',
    'upload.supportedFormats': 'Supported formats: MP3, WAV',
    'errors.invalidFile': 'Invalid file type. Please upload MP3 or WAV',
  },
  ar: {
    'upload.title': 'رفع أغنيتك',
    'upload.subtitle': 'اسحب وأفلت ملف MP3 أو WAV الخاص بك',
    'upload.dragText': 'أفلت ملف الصوت هنا',
    'upload.browseText': 'أو استعرض ملفاتك',
    'upload.supportedFormats': 'الصيغ المدعومة: MP3، WAV',
    'errors.invalidFile': 'نوع ملف غير صحيح. يرجى رفع MP3 أو WAV',
  }
}

export function AudioUpload({ onFileSelect, disabled, language }: AudioUploadProps) {
  const t = (key: string) => translations[language][key as keyof typeof translations['en']] || key
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): boolean => {
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/x-wav']
    if (!validTypes.includes(file.type)) {
      setError(t('errors.invalidFile'))
      return false
    }
    if (file.size > 100 * 1024 * 1024) {
      setError('File size must be less than 100MB')
      return false
    }
    return true
  }

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio()
      audio.addEventListener('loadedmetadata', () => {
        resolve(audio.duration)
      })
      audio.src = URL.createObjectURL(file)
    })
  }

  const handleFile = async (file: File) => {
    setError(null)

    if (!validateFile(file)) {
      return
    }

    try {
      const duration = await getAudioDuration(file)
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
      onFileSelect(file, duration, `${sizeMB} MB`)
    } catch (err) {
      setError('Error reading audio file')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0])
    }
  }

  return (
    <Card className="p-8 border-2 border-dashed border-border hover:border-primary/50 transition-colors">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-4 py-8 cursor-pointer ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <div className="p-4 rounded-full bg-primary/10">
          <Music className="h-8 w-8 text-primary" />
        </div>

        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {t('upload.title')}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('upload.subtitle')}
          </p>
        </div>

        <button
          onClick={() => !disabled && fileInputRef.current?.click()}
          disabled={disabled}
          className="flex flex-col items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
        >
          <Upload className="h-5 w-5" />
          <span>{t('upload.dragText')}</span>
        </button>

        <p className="text-xs text-muted-foreground">
          {t('upload.browseText')}
        </p>

        <p className="text-xs text-muted-foreground mt-2">
          {t('upload.supportedFormats')}
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
          aria-label="Upload audio file"
        />
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </Card>
  )
}
