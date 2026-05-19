'use client'

import { Music, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  language: 'en' | 'ar'
  onLanguageChange: (lang: 'en' | 'ar') => void
}

export function Header({ language, onLanguageChange }: HeaderProps) {
  const translations = {
    en: {
      'header.logo': 'Zafat AI',
      'header.projects': 'My Projects',
    },
    ar: {
      'header.logo': 'زفات إيه أي',
      'header.projects': 'مشاريعي',
    }
  }

  const t = (key: string) => translations[language][key as keyof typeof translations['en']] || key

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-purple-600">
            <Music className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t('header.logo')}
          </h1>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 hidden sm:flex hover:bg-muted"
          >
            <FolderOpen className="h-4 w-4" />
            {t('header.projects')}
          </Button>

          {/* Language Toggle */}
          <div className="flex gap-2 bg-muted rounded-lg p-1">
            <Button
              variant={language === 'en' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onLanguageChange('en')}
              className={`${
                language === 'en'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted-foreground/10'
              }`}
            >
              EN
            </Button>
            <Button
              variant={language === 'ar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onLanguageChange('ar')}
              className={`${
                language === 'ar'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted-foreground/10'
              }`}
            >
              AR
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
