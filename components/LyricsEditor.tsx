'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

const translations = {
  en: {
    'editor.title': 'Edit Your Lyrics',
    'editor.subtitle': 'Your song has been transcribed. Edit the lyrics below to customize them.',
    'editor.originalLyrics': 'Original Lyrics (Auto-Transcribed)',
    'editor.editedLyrics': 'Edit Lyrics Below',
    'editor.hints': 'Hints:',
    'editor.hint1': 'You can edit any word or phrase',
    'editor.hint2': 'The edited lyrics will be "sung" using your original voice',
    'editor.hint3': 'Keep it natural for best results',
    'editor.back': 'Back to Names',
    'editor.continue': 'Continue to Generation →',
    'editor.loading': 'Transcribing...',
    'editor.error': 'Failed to transcribe audio',
    'editor.retrying': 'Retrying...',
  },
  ar: {
    'editor.title': 'تحرير الكلمات',
    'editor.subtitle': 'تم نسخ أغنيتك. قم بتحرير الكلمات أدناه لتخصيصها.',
    'editor.originalLyrics': 'الكلمات الأصلية (تم نسخها تلقائياً)',
    'editor.editedLyrics': 'قم بتحرير الكلمات أدناه',
    'editor.hints': 'ملاحظات:',
    'editor.hint1': 'يمكنك تحرير أي كلمة أو عبارة',
    'editor.hint2': 'سيتم "غناء" الكلمات المحررة باستخدام صوتك الأصلي',
    'editor.hint3': 'اجعلها طبيعية للحصول على أفضل النتائج',
    'editor.back': 'العودة للأسماء',
    'editor.continue': 'المتابعة إلى الإنشاء →',
    'editor.loading': 'جاري النسخ...',
    'editor.error': 'فشل في نسخ الصوت',
    'editor.retrying': 'إعادة المحاولة...',
  }
}

interface LyricsEditorProps {
  originalLyrics: string
  isLoading?: boolean
  onBack: () => void
  onContinue: (editedLyrics: string) => void
  language: 'en' | 'ar'
  error?: string | null
}

export function LyricsEditor({
  originalLyrics,
  isLoading = false,
  onBack,
  onContinue,
  language,
  error = null,
}: LyricsEditorProps) {
  const t = (key: string) => translations[language][key as keyof typeof translations['en']] || key
  const isRTL = language === 'ar'
  const [editedLyrics, setEditedLyrics] = useState(originalLyrics)

  const handleContinue = () => {
    if (editedLyrics.trim()) {
      onContinue(editedLyrics)
    }
  }

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
          </div>
        </div>
        <div className="h-1 w-12 bg-border"></div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-sm">
          ✓
        </div>
        <div className="h-1 w-12 bg-border"></div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
          3
        </div>
        <div className="h-1 w-12 bg-border"></div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground font-bold text-sm">
          4
        </div>
      </div>

      {/* Editor Card */}
      <Card className="bg-card border-border p-8">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{t('editor.title')}</h2>
            <p className="text-muted-foreground">{t('editor.subtitle')}</p>
          </div>

          {/* Error State */}
          {error && (
            <div className="flex gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-destructive">{t('editor.error')}</p>
                <p className="text-sm text-destructive/80 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex gap-3 p-4 rounded-lg bg-primary/10 border border-primary/30">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent flex-shrink-0 mt-0.5"></div>
              <div>
                <p className="font-semibold text-primary">{t('editor.loading')}</p>
                <p className="text-sm text-primary/80 mt-1">{t('editor.retrying')}</p>
              </div>
            </div>
          )}

          {/* Lyrics Editing Section */}
          {!isLoading && !error && (
            <div className="space-y-6">
              {/* Original Lyrics Display (Read-only) */}
              <div>
                <Label className="text-sm font-semibold mb-3 block text-muted-foreground">
                  {t('editor.originalLyrics')}
                </Label>
                <div className="p-4 rounded-lg bg-muted/50 border border-border max-h-40 overflow-y-auto">
                  <p className="text-sm whitespace-pre-wrap text-foreground font-mono leading-relaxed">
                    {originalLyrics}
                  </p>
                </div>
              </div>

              {/* Edited Lyrics Textarea */}
              <div>
                <Label className="text-sm font-semibold mb-3 block text-muted-foreground">
                  {t('editor.editedLyrics')}
                </Label>
                <Textarea
                  value={editedLyrics}
                  onChange={(e) => setEditedLyrics(e.target.value)}
                  placeholder="Edit your lyrics here..."
                  className="min-h-64 resize-none bg-background border-border focus:ring-accent focus:border-accent font-mono text-sm leading-relaxed"
                />
              </div>

              {/* Hints Section */}
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 space-y-2">
                <p className="font-semibold text-sm text-accent">{t('editor.hints')}</p>
                <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                  <li>{t('editor.hint1')}</li>
                  <li>{t('editor.hint2')}</li>
                  <li>{t('editor.hint3')}</li>
                </ul>
              </div>

              {/* Success State - Transcription Complete */}
              <div className="flex gap-3 p-4 rounded-lg bg-accent/10 border border-accent/30">
                <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-accent text-sm">
                    {language === 'ar' ? 'تم النسخ بنجاح' : 'Transcription Complete'}
                  </p>
                  <p className="text-sm text-accent/80 mt-1">
                    {language === 'ar'
                      ? 'يمكنك الآن تحرير الكلمات وبدء الإنشاء'
                      : 'You can now edit the lyrics and start generation'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6">
            <Button
              variant="outline"
              size="lg"
              onClick={onBack}
              disabled={isLoading}
              className="flex-1 border-border hover:bg-muted"
            >
              {t('editor.back')}
            </Button>
            <Button
              size="lg"
              onClick={handleContinue}
              disabled={isLoading || !editedLyrics.trim()}
              className="flex-1 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground"
            >
              {t('editor.continue')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
