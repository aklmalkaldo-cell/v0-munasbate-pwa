'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileAudio } from 'lucide-react'
import { Card } from '@/components/ui/card'

const translations = {
  en: {
    'form.oldName': 'Original Name to Replace',
    'form.oldNamePlaceholder': 'e.g., Nora',
    'form.newName': 'New Name',
    'form.newNamePlaceholder': 'e.g., Hessa',
    'form.fileInfo': 'File:',
    'form.duration': 'Duration:',
    'form.size': 'Size:',
  },
  ar: {
    'form.oldName': 'الاسم القديم المراد استبداله',
    'form.oldNamePlaceholder': 'مثل: نورة',
    'form.newName': 'الاسم الجديد',
    'form.newNamePlaceholder': 'مثل: حصة',
    'form.fileInfo': 'الملف:',
    'form.duration': 'المدة:',
    'form.size': 'الحجم:',
  }
}

interface TextInputsProps {
  oldName: string
  newName: string
  onOldNameChange: (value: string) => void
  onNewNameChange: (value: string) => void
  fileName?: string
  duration?: number
  fileSize?: string
  disabled: boolean
  language: 'en' | 'ar'
}

export function TextInputs({
  oldName,
  newName,
  onOldNameChange,
  onNewNameChange,
  fileName,
  duration,
  fileSize,
  disabled,
  language,
}: TextInputsProps) {
  const isRTL = language === 'ar'
  const t = (key: string) => translations[language][key as keyof typeof translations['en']] || key

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* File Info */}
      {fileName && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <FileAudio className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {t('form.fileInfo')} {fileName}
              </p>
              <div className="flex gap-4 text-xs text-muted-foreground">
                {duration && (
                  <span>{t('form.duration')} {formatDuration(duration)}</span>
                )}
                {fileSize && <span>{t('form.size')} {fileSize}</span>}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Input Fields */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${isRTL ? 'dir-rtl' : ''}`}>
        <div className="space-y-2">
          <Label htmlFor="oldName" className="text-sm font-medium">
            {t('form.oldName')}
          </Label>
          <Input
            id="oldName"
            type="text"
            placeholder={t('form.oldNamePlaceholder')}
            value={oldName}
            onChange={(e) => onOldNameChange(e.target.value)}
            disabled={disabled}
            className="bg-card border-border focus-visible:ring-primary disabled:opacity-50"
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newName" className="text-sm font-medium">
            {t('form.newName')}
          </Label>
          <Input
            id="newName"
            type="text"
            placeholder={t('form.newNamePlaceholder')}
            value={newName}
            onChange={(e) => onNewNameChange(e.target.value)}
            disabled={disabled}
            className="bg-card border-border focus-visible:ring-primary disabled:opacity-50"
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        </div>
      </div>
    </div>
  )
}
