import { NextRequest, NextResponse } from 'next/server'

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN
const REPLICATE_API_URL = 'https://api.replicate.com/v1'

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

export async function POST(request: NextRequest) {
  try {
    if (!REPLICATE_API_TOKEN) {
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
      status: 'processing',
      currentStep: 0,
      startedAt: new Date(),
      oldName,
      newName,
      fileName: file.name,
      fileSize: file.size,
      predictions: [],
    })

    console.log(`[v0] Processing job started: ${jobId}`)
    console.log(`[v0] File: ${file.name}, Old Name: ${oldName}, New Name: ${newName}`)

    // Start background processing with Replicate
    processAudioWithReplicate(jobId, file, oldName, newName)

    return NextResponse.json({
      jobId,
      message: 'Processing started',
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
    if (job.status === 'processing' && job.predictions && job.predictions.length > 0) {
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

    // Return current job status
    return NextResponse.json({
      jobId,
      status: job.status,
      currentStep: job.currentStep,
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

// Process audio with Replicate's voice cloning models
async function processAudioWithReplicate(jobId: string, file: File, oldName: string, newName: string) {
  const job = jobStore.get(jobId)

  try {
    // Step 1: Convert file to base64 for API transmission
    job.currentStep = 1
    jobStore.set(jobId, job)
    console.log(`[v0] Job ${jobId} - Step 1: Converting audio to base64`)

    const buffer = await file.arrayBuffer()
    const base64Audio = Buffer.from(buffer).toString('base64')
    const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`

    // Step 2: Use vocal separator model (facebook/demucs) to extract vocals
    job.currentStep = 2
    jobStore.set(jobId, job)
    console.log(`[v0] Job ${jobId} - Step 2: Separating vocals from instrumental`)

    const separatorPrediction = await callReplicateAPI('/predictions', {
      version: 'fb14dd82cc0b43efb5a9f92acf07e74b242f4147bcf501921cfe58bdf4bbd724', // facebook/demucs on Replicate
      input: {
        audio: audioDataUrl,
      },
    })

    let vocalAudioUrl = audioDataUrl
    if (separatorPrediction.id) {
      // Poll for completion
      vocalAudioUrl = await pollPredictionForOutput(separatorPrediction.id)
      job.predictions.push(separatorPrediction.id)
    }

    // Step 3: Clone voice using RVC (Retrieval-based Voice Conversion)
    job.currentStep = 3
    jobStore.set(jobId, job)
    console.log(`[v0] Job ${jobId} - Step 3: Cloning voice with RVC`)

    // Use lucataco/rvc-zero-shot for zero-shot voice cloning
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
    job.status = 'failed'
    job.errorMessage = error instanceof Error ? error.message : 'Unknown error'
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
