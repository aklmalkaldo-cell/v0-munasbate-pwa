'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'ar'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  en: {
    'header.logo': 'Zafat AI',
    'header.projects': 'My Projects',
    'header.language': 'Language',
    'main.title': 'Customize Your Song with AI',
    'main.subtitle': 'Replace any name in your favorite songs with personalized voice cloning',
    'upload.title': 'Upload Your Song',
    'upload.subtitle': 'Drag and drop your MP3 or WAV file',
    'upload.dragText': 'Drop your audio file here',
    'upload.browseText': 'or browse your files',
    'upload.supportedFormats': 'Supported formats: MP3, WAV',
    'form.oldName': 'Original Name to Replace',
    'form.oldNamePlaceholder': 'e.g., Nora',
    'form.newName': 'New Name',
    'form.newNamePlaceholder': 'e.g., Hessa',
    'form.submit': 'Customize with AI',
    'form.fileInfo': 'File:',
    'form.duration': 'Duration:',
    'form.size': 'Size:',
    'processing.title': 'Processing Your Song',
    'processing.step1': 'Isolating Vocals...',
    'processing.step2': 'Cloning Voice...',
    'processing.step3': 'Generating New Lyric...',
    'processing.step4': 'Final Audio Mixing...',
    'results.title': 'Your Customized Song',
    'results.download': 'Download MP3',
    'results.playback': 'Play Your Customized Song',
    'errors.fileRequired': 'Please upload an audio file',
    'errors.nameRequired': 'Please enter both old and new names',
    'errors.invalidFile': 'Invalid file type. Please upload MP3 or WAV',
  },
  ar: {
    'header.logo': 'زفات إيه أي',
    'header.projects': 'مشاريعي',
    'header.language': 'اللغة',
    'main.title': 'خصص أغنيتك مع الذكاء الاصطناعي',
    'main.subtitle': 'استبدل أي اسم في أغنيتك المفضلة بصوت شخصي مستنسخ',
    'upload.title': 'رفع أغنيتك',
    'upload.subtitle': 'اسحب وأفلت ملف MP3 أو WAV الخاص بك',
    'upload.dragText': 'أفلت ملف الصوت هنا',
    'upload.browseText': 'أو استعرض ملفاتك',
    'upload.supportedFormats': 'الصيغ المدعومة: MP3، WAV',
    'form.oldName': 'الاسم القديم المراد استبداله',
    'form.oldNamePlaceholder': 'مثل: نورة',
    'form.newName': 'الاسم الجديد',
    'form.newNamePlaceholder': 'مثل: حصة',
    'form.submit': 'تعديل الأغنية بالذكاء الاصطناعي',
    'form.fileInfo': 'الملف:',
    'form.duration': 'المدة:',
    'form.size': 'الحجم:',
    'processing.title': 'معالجة أغنيتك',
    'processing.step1': 'جاري فصل الصوت عن الموسيقى...',
    'processing.step2': 'جاري استنساخ نبرة المغني...',
    'processing.step3': 'جاري توليد الاسم الجديد باللحن...',
    'processing.step4': 'جاري الدمج النهائي والميكساج...',
    'results.title': 'أغنيتك المخصصة',
    'results.download': 'تحميل MP3',
    'results.playback': 'استمع لأغنيتك المخصصة',
    'errors.fileRequired': 'يرجى رفع ملف صوتي',
    'errors.nameRequired': 'يرجى إدخال الاسم القديم والجديد',
    'errors.invalidFile': 'نوع ملف غير صحيح. يرجى رفع MP3 أو WAV',
  },
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language || 'en'
    setLanguageState(savedLanguage)
    setMounted(true)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key
  }

  if (!mounted) return <>{children}</>

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
