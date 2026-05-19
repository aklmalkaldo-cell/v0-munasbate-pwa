import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Create a simple sine wave audio buffer (440 Hz for 3 seconds)
    const sampleRate = 44100
    const duration = 3
    const frequency = 440
    const amplitude = 0.3

    const samples = sampleRate * duration
    const audioBuffer = new Float32Array(samples)

    for (let i = 0; i < samples; i++) {
      audioBuffer[i] =
        amplitude * Math.sin((2 * Math.PI * frequency * i) / sampleRate)
    }

    // Convert to WAV format
    const wavBuffer = floatToWav(audioBuffer, sampleRate)

    return new NextResponse(wavBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Disposition': 'attachment; filename="customized-song.wav"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Error generating mock audio:', error)
    return NextResponse.json(
      { error: 'Failed to generate audio' },
      { status: 500 }
    )
  }
}

// Helper function to convert float32 audio to WAV format
function floatToWav(float32Array: Float32Array, sampleRate: number): ArrayBuffer {
  const length = float32Array.length
  const arrayBuffer = new ArrayBuffer(44 + length * 2)
  const view = new DataView(arrayBuffer)
  const channels = 1
  const bitDepth = 16

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  const writeInt16 = (offset: number, value: number) => {
    const s = Math.max(-1, Math.min(1, value))
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
  }

  // WAV header
  writeString(0, 'RIFF')
  view.setUint32(4, 36 + length * 2, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true) // Subchunk1Size
  view.setUint16(20, 1, true) // AudioFormat (PCM)
  view.setUint16(22, channels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2 * channels, true)
  view.setUint16(32, 2 * channels, true)
  view.setUint16(34, bitDepth, true)
  writeString(36, 'data')
  view.setUint32(40, length * 2, true)

  // Audio samples
  let offset = 44
  for (let i = 0; i < length; i++) {
    writeInt16(offset, float32Array[i])
    offset += 2
  }

  return arrayBuffer
}
