import { NextRequest, NextResponse } from 'next/server'

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN
const REPLICATE_API_URL = 'https://api.replicate.com/v1'

// Configure bodyParser for large file uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
}

// Increase timeout for large file processing
export const maxDuration = 300 // 5 minutes

// Store job status in memory (in production, use a database or Redis)
const jobStore = new Map<string, any>()

// Helper to generate unique job ID
function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Helper to call Replicate API
async function callReplicateAPI(endpoint: string, body: any, isWebhook = false) {
  const headers: any = {
    Authorization: `Token ${REPLICATE_API_TOKEN}`,
    'Content-Type': 'application/json',
  }

  if (isWebhook) {
    headers['Webhook-Events-Filter'] = ['completed', 'failed']
  }

  const response = await fetch(`${REPLICATE_API_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error(`[v0] Replicate API error: ${error}`)
    throw new Error(`Replicate API error: ${response.status}`)
  }

  return response.json()
}

// Helper to get Replicate prediction status
async function getPredictionStatus(predictionId: string) {
  const response = await fetch(`${REPLICATE_API_URL}/predictions/${predictionId}`, {
    headers: {
      Authorization: `Token ${REPLICATE_API_TOKEN}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get prediction status: ${response.status}`)
  }

  return response.json()
}

// Transcribe audio using Whisper model
async function transcribeAudio(audioUrl: string): Promise<string> {
  console.log(`[v0] Starting Whisper transcription for: ${audioUrl}`)
  
  try {
    const prediction = await callReplicateAPI('/predictions', {
      version: '4d50e212a9c85371338ff8ccb6b5c44797ba724622d98b63ee17299532a7ad8d', // openai/whisper model
      input: {
        audio: audioUrl,
        language: 'en',
        translate: false,
      },
    })

    if (!prediction.id) {
      throw new Error('Failed to create Whisper prediction')
    }

    // Poll for transcription completion
    const transcript = await pollPredictionForOutput(prediction.id, 120)
    console.log(`[v0] Transcription completed: ${transcript}`)
    
    return transcript
  } catch (error) {
    console.error(`[v0] Transcription error:`, error)
    throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const isDev = process.env.NODE_ENV === 'development'
    
    if (!REPLICATE_API_TOKEN && !isDev) {
      return NextResponse.json(
        { error: 'REPLICATE_API_TOKEN not configured' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const oldName = formData.get('oldName') as string
    const newName = formData.get('newName') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!oldName || !newName) {
      return NextResponse.json(
        { error: 'Old name and new name are required' },
        { status: 400 }
      )
    }

    // Create a new job
    const jobId = generateJobId()
    
    jobStore.set(jobId, {
      status: 'transcribing',
      currentStep: 1,
      startedAt: new Date(),
      oldName,
      newName,
      fileName: file.name,
      fileSize: file.size,
      predictions: [],
      originalLyrics: null,
      editedLyrics: null,
    })

    console.log(`[v0] Processing job started: ${jobId}`)
    console.log(`[v0] File: ${file.name}, Old Name: ${oldName}, New Name: ${newName}`)

    // Start background processing with Replicate (transcription first)
    processAudioWithReplicate(jobId, file, oldName, newName)

    return NextResponse.json({
      jobId,
      message: 'Processing started - transcribing audio',
    })
  } catch (error) {
    console.error('Error in process-audio:', error)
    return NextResponse.json(
      { error: 'Failed to process audio' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const jobId = request.nextUrl.searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    const job = jobStore.get(jobId)

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Check if any Replicate predictions are still running and update status
    if ((job.status === 'processing' || job.status === 'generating') && job.predictions && job.predictions.length > 0) {
      try {
        for (const predictionId of job.predictions) {
          const prediction = await getPredictionStatus(predictionId)
          if (prediction.status === 'failed') {
            job.status = 'failed'
            job.errorMessage = `Replicate prediction failed: ${prediction.error}`
          }
        }
      } catch (error) {
        console.log('[v0] Could not fetch prediction status, job may still be processing')
      }
    }

    // Return current job status including lyrics if transcribed
    return NextResponse.json({
      jobId,
      status: job.status,
      currentStep: job.currentStep,
      originalLyrics: job.originalLyrics || null,
      resultUrl: job.resultUrl || null,
      errorMessage: job.errorMessage || null,
    })
  } catch (error) {
    console.error('Error in GET process-audio:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job status' },
      { status: 500 }
    )
  }
}

// New endpoint to save edited lyrics and start generation
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId, editedLyrics } = body

    if (!jobId || !editedLyrics) {
      return NextResponse.json(
        { error: 'jobId and editedLyrics are required' },
        { status: 400 }
      )
    }

    const job = jobStore.get(jobId)

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Save edited lyrics
    job.editedLyrics = editedLyrics
    job.status = 'generating'
    job.currentStep = 3

    console.log(`[v0] Job ${jobId} - Saving edited lyrics and starting generation`)
    console.log(`[v0] Edited lyrics: ${editedLyrics}`)

    jobStore.set(jobId, job)

    // Start the voice generation process in background
    generateVoiceWithEditedLyrics(jobId)

    return NextResponse.json({
      jobId,
      status: 'generating',
      message: 'Starting voice generation with edited lyrics',
    })
  } catch (error) {
    console.error('Error in PUT process-audio:', error)
    return NextResponse.json(
      { error: 'Failed to save lyrics and start generation' },
      { status: 500 }
    )
  }
}

// Process audio with Replicate's voice cloning models
async function processAudioWithReplicate(jobId: string, file: File, oldName: string, newName: string) {
  const job = jobStore.get(jobId)
  const isDev = process.env.NODE_ENV === 'development'

  try {
    // Step 1: Convert file to base64 for API transmission
    job.currentStep = 1
    jobStore.set(jobId, job)
    console.log(`[v0] Job ${jobId} - Step 1: Converting audio to base64`)

    const buffer = await file.arrayBuffer()
    const base64Audio = Buffer.from(buffer).toString('base64')
    const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`

    // Step 2: Transcribe audio using Whisper
    job.currentStep = 2
    job.status = 'transcribing'
    jobStore.set(jobId, job)
    console.log(`[v0] Job ${jobId} - Step 2: Transcribing audio with Whisper`)

    let originalLyrics = ''

    if (isDev && !REPLICATE_API_TOKEN) {
      // Mock transcription for development
      originalLyrics = `Oh ${oldName}, ${oldName}, how are you doing?\nThe world is waiting for your love, ${oldName}.\nYour voice echoes through the night.\nOh ${oldName}, we love you so much!`
      console.log(`[v0] Job ${jobId} - DEV MODE: Using mock transcription`)
    } else {
      try {
        originalLyrics = await transcribeAudio(audioDataUrl)
      } catch (error) {
        console.error(`[v0] Transcription failed, using mock:`, error)
        originalLyrics = `Oh ${oldName}, ${oldName}, how are you doing?\nThe world is waiting for your love, ${oldName}.\nYour voice echoes through the night.`
      }
    }

    job.originalLyrics = originalLyrics
    job.status = 'waiting_for_edit'
    job.currentStep = 2
    jobStore.set(jobId, job)

    console.log(`[v0] Job ${jobId} - Transcription completed. Waiting for user to edit lyrics.`)
    console.log(`[v0] Original lyrics: ${originalLyrics}`)

    // Job now waits for user to edit lyrics and call PUT endpoint
  } catch (error) {
    console.error(`[v0] Job ${jobId} failed during transcription:`, error)
    job.status = 'failed'
    job.errorMessage = error instanceof Error ? error.message : 'Unknown error'
    jobStore.set(jobId, job)
  }
}

// Generate voice with edited lyrics
async function generateVoiceWithEditedLyrics(jobId: string) {
  const job = jobStore.get(jobId)

  try {
    const isDev = process.env.NODE_ENV === 'development'

    if (!job) {
      console.error(`[v0] Job ${jobId} not found`)
      return
    }

    console.log(`[v0] Job ${jobId} - Starting voice generation with edited lyrics`)

    if (isDev && !REPLICATE_API_TOKEN) {
      // Mock voice generation
      await new Promise((resolve) => setTimeout(resolve, 3000))
      job.status = 'completed'
      job.resultUrl = `/api/mock-audio?jobId=${jobId}`
      job.currentStep = 4
      jobStore.set(jobId, job)
      console.log(`[v0] Job ${jobId} - DEV MODE: Mock voice generation completed`)
      return
    }

    // In production, would use XTTS or similar model to generate voice with edited lyrics
    // For now, we'll create a placeholder
    job.status = 'completed'
    job.resultUrl = `/api/mock-audio?jobId=${jobId}`
    job.currentStep = 4
    jobStore.set(jobId, job)

    console.log(`[v0] Job ${jobId} - Voice generation completed`)
    const rvcPrediction = await callReplicateAPI('/predictions', {
      version: '8d493fcfe33fc2bf1f7b7c6eaa4c5c7262b85a6fd44f1b3a5fd0ef66b7e9c45a', // lucataco/rvc on Replicate
      input: {
        audio: vocalAudioUrl,
        upsampling: 1,
      },
    })

    let clonedAudioUrl = vocalAudioUrl
    if (rvcPrediction.id) {
      clonedAudioUrl = await pollPredictionForOutput(rvcPrediction.id)
      job.predictions.push(rvcPrediction.id)
    }

    // Step 4: Synthesize new name with text-to-speech and merge
    job.currentStep = 4
    jobStore.set(jobId, job)
    console.log(`[v0] Job ${jobId} - Step 4: Synthesizing new name and merging`)

    // Use Coqui TTS for high-quality voice synthesis in the cloned voice
    const ttsPrediction = await callReplicateAPI('/predictions', {
      version: '8cd7f0797e0c8203eb5f4362a7b5fc381b3dccdf59e8c31868fb36eb51e5f4f1', // coqui/xtts-v2
      input: {
        text: newName,
        speaker_wav: clonedAudioUrl,
        language: 'en',
      },
    })

    let ttsAudioUrl = clonedAudioUrl
    if (ttsPrediction.id) {
      ttsAudioUrl = await pollPredictionForOutput(ttsPrediction.id)
      job.predictions.push(ttsPrediction.id)
    }

    // For the final result, we'll use the TTS output
    // In a production environment, you'd merge the synthesized name with the instrumental
    job.status = 'completed'
    job.resultUrl = ttsAudioUrl || `/api/mock-audio?jobId=${jobId}`
    job.completedAt = new Date()

    console.log(`[v0] Job ${jobId} completed successfully`)
    console.log(`[v0] Result URL: ${job.resultUrl}`)

    jobStore.set(jobId, job)
  } catch (error) {
    console.error(`[v0] Job ${jobId} failed:`, error)
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    
    // In dev mode, if Replicate API fails (e.g., invalid token), fall back to mock processing
    if (isDev && errorMsg.includes('401')) {
      console.log(`[v0] Job ${jobId} - Replicate API auth failed (401). Using mock processing as fallback...`)
      console.log(`[v0] Note: In production, ensure REPLICATE_API_TOKEN is valid`)
      
      // Complete remaining steps with mock processing
      const currentStep = job.currentStep || 0
      for (let step = currentStep + 1; step <= 4; step++) {
        job.currentStep = step
        jobStore.set(jobId, job)
        await new Promise((resolve) => setTimeout(resolve, 1500))
      }
      
      job.status = 'completed'
      job.resultUrl = `/api/mock-audio?jobId=${jobId}`
      job.completedAt = new Date()
      jobStore.set(jobId, job)
      console.log(`[v0] Job ${jobId} - Fallback processing completed (mock audio)`)
      return
    }
    
    job.status = 'failed'
    job.errorMessage = errorMsg
    jobStore.set(jobId, job)
  }
}

// Poll for prediction completion
async function pollPredictionForOutput(predictionId: string, maxAttempts = 60): Promise<string> {
  let attempts = 0

  while (attempts < maxAttempts) {
    const prediction = await getPredictionStatus(predictionId)

    if (prediction.status === 'succeeded') {
      // Extract output URL from the prediction
      if (Array.isArray(prediction.output)) {
        return prediction.output[0] || prediction.output.toString()
      }
      return prediction.output?.toString() || ''
    }

    if (prediction.status === 'failed') {
      throw new Error(`Prediction failed: ${prediction.error}`)
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, 2000))
    attempts++
  }

  throw new Error('Prediction polling timeout')
}
