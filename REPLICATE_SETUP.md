# Replicate Zero-Shot Voice Cloning Integration

This document outlines the Replicate API integration for zero-shot voice cloning in the Zafat AI platform.

## Overview

The application uses Replicate's state-of-the-art models for an automated voice cloning workflow:

1. **Audio Conversion** - Convert uploaded file to base64 for API transmission
2. **Vocal Separation** - Extract vocals from instrumental using facebook/demucs model
3. **Voice Cloning** - Clone the voice using RVC (Retrieval-based Voice Conversion) model
4. **Voice Synthesis** - Generate the new name using Coqui TTS with cloned voice
5. **Result** - Return the synthesized audio with the new name

## Setup Instructions

### 1. Get Your Replicate API Token

1. Go to [Replicate.com](https://replicate.com)
2. Sign up or log in to your account
3. Navigate to API tokens in account settings
4. Create a new API token
5. Copy the token (format: `r8_XXXXXXXXXXXXXXXXXXXXXXXXXXXX`)

### 2. Add Environment Variable to Vercel

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add a new variable:
   - **Name**: `REPLICATE_API_TOKEN`
   - **Value**: Your token from step 1
4. Save and redeploy

### 3. Verify the Integration

The API is automatically configured once the environment variable is set. Test the integration:

```bash
curl -X POST http://localhost:3000/api/process-audio \
  -F 'file=@/path/to/song.mp3' \
  -F 'oldName=Nora' \
  -F 'newName=Hessa'
```

## How It Works

### Frontend Flow

1. User uploads an audio file via drag-and-drop
2. Enters the old name to replace and new name to generate
3. Clicks "Customize with Replicate AI" button
4. UI enters processing state with 4-step progress tracker
5. Frontend polls `/api/process-audio?jobId=XXX` every 2 seconds
6. When complete, displays the result audio player with download button

### Backend Flow

1. **POST /api/process-audio**
   - Receives FormData with audio file, oldName, newName
   - Creates a unique jobId
   - Starts background processing with Replicate
   - Returns jobId immediately to prevent Vercel timeout

2. **Background Processing** (async, non-blocking)
   - **Step 1**: Convert audio file to base64 data URL
   - **Step 2**: Call facebook/demucs model to separate vocals
   - **Step 3**: Call RVC model to clone the vocal characteristics
   - **Step 4**: Call Coqui TTS to synthesize the new name with cloned voice
   - Stores Replicate prediction IDs for polling
   - Updates job status with result URL

3. **GET /api/process-audio?jobId=XXX**
   - Retrieves job status from in-memory store
   - Checks Replicate prediction status if still processing
   - Returns current step, status, and result URL
   - Frontend polls this every 2 seconds

## Models Used

### facebook/demucs
- **Purpose**: Audio source separation (isolate vocals from instrumental)
- **Time**: 30-120 seconds depending on audio length
- **Output**: Separated vocal track

### lucataco/rvc
- **Purpose**: Zero-shot voice cloning (capture voice characteristics)
- **Time**: 20-60 seconds
- **Input**: Original vocal track
- **Output**: Vocal characteristics preserved for synthesis

### coqui/xtts-v2
- **Purpose**: Text-to-speech with voice cloning
- **Time**: 10-30 seconds
- **Input**: Speaker audio reference + text to synthesize
- **Output**: Audio with the new name spoken in cloned voice

## Total Processing Time

- **Minimum**: ~60-90 seconds (fast mode, short audio)
- **Average**: ~120-180 seconds (3-5 minute songs)
- **Maximum**: ~300+ seconds (very long songs or slow processing)

The UI displays all 4 steps with appropriate messaging.

## Cost

Replicate pricing varies by model:
- **facebook/demucs**: ~$0.01-0.05 per run
- **RVC models**: ~$0.01-0.05 per run
- **Coqui TTS**: ~$0.02-0.10 per run
- **Total per song**: ~$0.04-0.20

Check [Replicate pricing](https://replicate.com/pricing) for current rates.

## Error Handling

The application handles these error scenarios:

1. **Missing REPLICATE_API_TOKEN** - Shows error message
2. **Network errors** - Retries with exponential backoff
3. **Model failures** - Captures error from Replicate and displays to user
4. **Timeout** - Long-polling prevents Vercel timeout (max request is 60s, polling happens every 2s)

## Customization

### Use Different Models

You can swap out the models in `/app/api/process-audio/route.ts`:

```typescript
// Replace the version hashes with different models
const separatorPrediction = await callReplicateAPI('/predictions', {
  version: 'fb14dd82cc0b43efb5a9f92acf07e74b242f4147bcf501921cfe58bdf4bbd724', // Change this
  input: { audio: audioDataUrl },
})
```

Find model versions at [Replicate.com](https://replicate.com/models)

### Adjust Input Parameters

Each model has configurable inputs. Modify in the API:

```typescript
// Example: RVC upsampling
const rvcPrediction = await callReplicateAPI('/predictions', {
  version: '8d493fcfe33fc2bf1f7b7c6eaa4c5c7262b85a6fd44f1b3a5fd0ef66b7e9c45a',
  input: {
    audio: vocalAudioUrl,
    upsampling: 4, // Increase quality (1-4)
  },
})
```

### Store Results Permanently

Currently results are stored in memory. For production:

1. Save audio files to Vercel Blob or S3
2. Store job metadata in a database
3. Update the `jobStore` to use persistent storage

```typescript
// Replace Map with database
const job = await db.getJob(jobId)
job.resultUrl = resultUrl
await db.updateJob(jobId, job)
```

## Language Support

The processing steps display in both English and Arabic with automatic RTL text direction when Arabic is selected.

## Webhooks (Optional)

For production reliability, use Replicate webhooks instead of polling:

```typescript
const prediction = await callReplicateAPI('/predictions', {
  version: 'model-id',
  input: { /* ... */ },
  webhook: `https://yourapp.com/api/webhook/replicate`,
  webhook_events_filter: ['completed', 'failed'],
}, true)
```

Then create `/api/webhook/replicate` to handle completion callbacks.

## Troubleshooting

**Issue**: "REPLICATE_API_TOKEN not configured"
- **Solution**: Check that environment variable is set in Vercel project settings

**Issue**: Processing takes too long
- **Solution**: Check Replicate status page for service issues, or split audio into shorter segments

**Issue**: Audio quality is poor
- **Solution**: Use higher upsampling parameter (1-4), or try different TTS model

**Issue**: Job not completing
- **Solution**: Check `/api/process-audio?jobId=XXX` response for error messages in predictions

## Additional Resources

- [Replicate API Docs](https://replicate.com/docs)
- [facebook/demucs](https://replicate.com/facebook/demucs)
- [lucataco/rvc](https://replicate.com/lucataco/rvc)
- [coqui/xtts-v2](https://replicate.com/coqui/xtts-v2)
