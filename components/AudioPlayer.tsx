'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Play, Pause, Download, Volume2 } from 'lucide-react'
import { useRef, useState } from 'react'

const translations = {
  en: {
    'results.title': 'Your Customized Song',
    'results.download': 'Download MP3',
    'results.playback': 'Play Your Customized Song',
  },
  ar: {
    'results.title': 'أغنيتك المخصصة',
    'results.download': 'تحميل MP3',
    'results.playback': 'استمع لأغنيتك المخصصة',
  }
}

interface AudioPlayerProps {
  audioUrl: string
  fileName: string
  language: 'en' | 'ar'
}

export function AudioPlayer({ audioUrl, fileName, language }: AudioPlayerProps) {
  const t = (key: string) => translations[language][key as keyof typeof translations['en']] || key
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = x / rect.width
      audioRef.current.currentTime = percentage * duration
    }
  }

  const formatTime = (time: number): string => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleDownload = async () => {
    const link = document.createElement('a')
    link.href = audioUrl
    link.download = `zafat-${fileName || 'customized'}.mp3`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="p-8 bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
      <h3 className="text-lg font-semibold mb-6 text-foreground">
        {t('results.title')}
      </h3>

      {/* Audio Player */}
      <div className="space-y-6">
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Player Controls */}
        <div className="flex items-center gap-4">
          <Button
            onClick={togglePlay}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-12 h-12 p-0 flex items-center justify-center"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-1" />
            )}
          </Button>

          <div className="flex-1">
            {/* Progress Bar */}
            <div
              onClick={handleProgressClick}
              className="h-2 bg-muted rounded-full cursor-pointer hover:h-3 transition-all group"
            >
              <div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full group-hover:shadow-lg group-hover:shadow-primary/50 transition-all"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>

            {/* Time Display */}
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <Button
          onClick={handleDownload}
          size="lg"
          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground gap-2"
        >
          <Download className="h-5 w-5" />
          {t('results.download')}
        </Button>

        {/* Info Text */}
        <p className="text-xs text-muted-foreground text-center">
          {t('results.playback')}
        </p>
      </div>
    </Card>
  )
}
