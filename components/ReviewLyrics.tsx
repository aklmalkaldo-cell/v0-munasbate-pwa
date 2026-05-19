'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Edit2, Check, X } from 'lucide-react'
import { useState } from 'react'

const translations = {
  en: {
    'review.title': 'Review Your Lyrics',
    'review.subtitle': 'Preview how the new name will replace the old one',
    'review.oldName': 'Original Name:',
    'review.newName': 'New Name:',
    'review.preview': 'Lyric Preview:',
    'review.edit': 'Edit Names',
    'review.startMagic': 'Start Magic ✨',
    'review.cancel': 'Cancel',
    'review.sampleLyric': 'Sample lyric with [NAME] placeholder',
  },
  ar: {
    'review.title': 'مراجعة الكلمات',
    'review.subtitle': 'معاينة كيفية استبدال الاسم الجديد بالقديم',
    'review.oldName': 'الاسم القديم:',
    'review.newName': 'الاسم الجديد:',
    'review.preview': 'معاينة الكلمات:',
    'review.edit': 'تعديل الأسماء',
    'review.startMagic': 'ابدأ السحر ✨',
    'review.cancel': 'إلغاء',
    'review.sampleLyric': 'مثال على الكلمات مع [الاسم] كمؤشر',
  }
}

interface ReviewLyricsProps {
  oldName: string
  newName: string
  fileName: string
  onConfirm: () => void
  onEdit: () => void
  language: 'en' | 'ar'
  isLoading?: boolean
}

export function ReviewLyrics({
  oldName,
  newName,
  fileName,
  onConfirm,
  onEdit,
  language,
  isLoading = false,
}: ReviewLyricsProps) {
  const t = (key: string) => translations[language][key as keyof typeof translations['en']] || key
  const isRTL = language === 'ar'

  // Generate sample lyric preview
  const sampleLyric = language === 'ar' 
    ? `يا ${newName} يا ${newName}، كيف حالك اليوم؟`
    : `Oh ${newName}, ${newName}, how are you today?`

  return (
    <div className={`space-y-6 ${isRTL ? 'dir-rtl' : ''}`}>
      {/* Progress Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-sm">
            ✓
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Step 1: Upload</p>
            <p className="text-xs text-muted-foreground">{fileName}</p>
          </div>
        </div>
        <div className="h-1 w-12 bg-border"></div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
          2
        </div>
        <div className="h-1 w-12 bg-border"></div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground font-bold text-sm">
          3
        </div>
      </div>

      {/* Review Card */}
      <Card className="bg-card border-border p-8">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{t('review.title')}</h2>
            <p className="text-muted-foreground">{t('review.subtitle')}</p>
          </div>

          {/* Names Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Old Name */}
            <div>
              <Label className="text-sm font-semibold mb-2 block text-muted-foreground">
                {t('review.oldName')}
              </Label>
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-lg font-semibold text-foreground">{oldName}</p>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center">
              <div className="text-2xl font-bold text-primary">→</div>
            </div>

            {/* New Name */}
            <div className="md:col-start-2">
              <Label className="text-sm font-semibold mb-2 block text-muted-foreground">
                {t('review.newName')}
              </Label>
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
                <p className="text-lg font-semibold text-accent">{newName}</p>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="pt-4 border-t border-border">
            <Label className="text-sm font-semibold mb-3 block text-muted-foreground">
              {t('review.preview')}
            </Label>
            <div className="p-4 rounded-lg bg-muted/30 border border-border italic text-foreground">
              {sampleLyric}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {language === 'ar' 
                ? 'سيتم استبدال الاسم القديم بالاسم الجديد في الأغنية'
                : 'The old name will be replaced with the new name throughout the song'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6">
            <Button
              variant="outline"
              size="lg"
              onClick={onEdit}
              disabled={isLoading}
              className="flex-1 border-border hover:bg-muted gap-2"
            >
              <Edit2 className="h-4 w-4" />
              {t('review.edit')}
            </Button>
            <Button
              size="lg"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground gap-2"
            >
              {isLoading ? 'Starting...' : t('review.startMagic')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
