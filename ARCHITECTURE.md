# Zafat AI - Zero-Shot Voice Cloning Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      User Browser                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React Frontend (Client-side)                            │  │
│  │  - Audio upload with drag-drop                           │  │
│  │  - Name input fields (old/new)                           │  │
│  │  - Processing status with 4-step progress                │  │
│  │  - Audio player with download                            │  │
│  │  - Language toggle (EN/AR with RTL)                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ HTTP POST /api/process-audio (FormData)
             │ HTTP GET /api/process-audio?jobId=XXX (Polling)
             │
┌────────────▼────────────────────────────────────────────────────┐
│              Next.js API Route Handler                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ POST Handler:                                            │  │
│  │ 1. Validate input (file, oldName, newName)             │  │
│  │ 2. Create unique jobId                                 │  │
│  │ 3. Initialize job in jobStore                          │  │
│  │ 4. Fire async processAudioWithReplicate()              │  │
│  │ 5. Return jobId immediately (no timeout)               │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ GET Handler:                                             │  │
│  │ 1. Look up jobId in jobStore                            │  │
│  │ 2. Check Replicate prediction status                    │  │
│  │ 3. Return { status, currentStep, resultUrl }            │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ Async background processing
             │
┌────────────▼────────────────────────────────────────────────────┐
│         Replicate API Integration (Background)                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Step 1: Convert File to Base64                          │  │
│  │ ├─ Buffer.from(audioBuffer).toString('base64')          │  │
│  │ └─ Returns data:audio/mpeg;base64,XXXXX                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Step 2: Vocal Separation (facebook/demucs)              │  │
│  │ ├─ Call Replicate: POST /v1/predictions                 │  │
│  │ ├─ Input: base64 audio data URL                         │  │
│  │ ├─ Poll for completion (60 second timeout)              │  │
│  │ └─ Output: Separated vocal track URL                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Step 3: Voice Cloning (lucataco/rvc)                    │  │
│  │ ├─ Call Replicate: POST /v1/predictions                 │  │
│  │ ├─ Input: vocal track URL, upsampling=1                 │  │
│  │ ├─ Poll for completion                                  │  │
│  │ └─ Output: Cloned voice characteristics                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Step 4: TTS Voice Synthesis (coqui/xtts-v2)             │  │
│  │ ├─ Call Replicate: POST /v1/predictions                 │  │
│  │ ├─ Input: newName text, speaker_wav (cloned voice)      │  │
│  │ ├─ Poll for completion                                  │  │
│  │ └─ Output: Synthesized new name in cloned voice          │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Job Store Update:                                        │  │
│  │ ├─ status: 'completed'                                  │  │
│  │ ├─ resultUrl: final audio output URL                    │  │
│  │ ├─ completedAt: timestamp                               │  │
│  │ └─ predictions: [demucs_id, rvc_id, tts_id]             │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

#### `Header.tsx`
- **Purpose**: Top navigation bar
- **Props**: `language`, `onLanguageChange`
- **Features**: 
  - Logo with gradient effect
  - Language toggle (EN/AR)
  - My Projects button (placeholder)
  - Sticky positioning with blur backdrop

#### `AudioUpload.tsx`
- **Purpose**: Drag-and-drop audio file upload
- **Props**: `onFileSelect`, `disabled`, `language`
- **Features**:
  - Drag-and-drop zone
  - File browser fallback
  - Format validation (MP3, WAV)
  - File info display (name, size, duration)
  - Disabled state during processing

#### `TextInputs.tsx`
- **Purpose**: Input fields for name customization
- **Props**: `oldName`, `newName`, callbacks, `fileName`, `fileSize`, `duration`, `language`
- **Features**:
  - Arabic placeholder text
  - File metadata display
  - RTL support for Arabic
  - Bilingual labels

#### `ProcessingStatus.tsx`
- **Purpose**: Multi-step progress tracker during processing
- **Props**: `currentStep`, `isProcessing`, `language`
- **Features**:
  - 4-step progress indicator
  - Animated loader on current step
  - Checkmarks for completed steps
  - Progress bar with gradient
  - Bilingual step descriptions

#### `AudioPlayer.tsx`
- **Purpose**: Custom audio player for results
- **Props**: `audioUrl`, `fileName`, `language`
- **Features**:
  - Play/pause controls
  - Progress scrubbing
  - Volume control
  - Download button
  - Current time / duration display

#### `LanguageProvider.tsx`
- **Purpose**: Provides language context and translations
- **Features**: Translation system, language persistence
- **Note**: Replaced with direct state in page.tsx for simplicity

### Page Component

#### `app/page.tsx`
- **State Management**:
  - `language`: Current language (EN/AR)
  - `file`: Uploaded audio file
  - `duration`, `fileSize`: File metadata
  - `oldName`, `newName`: Text inputs
  - `isProcessing`: Processing state flag
  - `processingStep`: Current step (0-4)
  - `resultUrl`: Final audio output URL
  - `error`: Error messages
  - `jobId`: Replicate job ID

- **Workflows**:
  - `handleFileSelect()`: Process uploaded file
  - `handleSubmit()`: Start processing with Replicate
  - `handleReset()`: Reset form after completion
  - Polling effect: Check job status every 2 seconds

### API Routes

#### `app/api/process-audio/route.ts`

**POST Handler**:
```
1. Validate inputs
2. Generate jobId
3. Create job record in jobStore
4. Fire async processAudioWithReplicate()
5. Return jobId immediately
```

**GET Handler**:
```
1. Look up jobId
2. Check Replicate predictions status
3. Return job state
```

**Helper Functions**:
- `generateJobId()`: Create unique identifier
- `callReplicateAPI()`: Make authenticated calls to Replicate
- `getPredictionStatus()`: Check prediction completion
- `processAudioWithReplicate()`: Main async workflow
- `pollPredictionForOutput()`: Wait for prediction completion

#### `app/api/mock-audio/route.ts`
- Generates mock WAV audio for testing
- Used when Replicate is not available
- Returns binary WAV data

## Data Flow

### Upload to Processing

```
User uploads file
        ↓
AudioUpload component processes file
        ↓
Extract duration via Audio element
        ↓
handleFileSelect() updates state
        ↓
Show TextInputs component
```

### Processing Request

```
User clicks "Customize with Replicate AI"
        ↓
handleSubmit() creates FormData
        ↓
POST /api/process-audio with file + names
        ↓
API validates and creates job
        ↓
Returns jobId
        ↓
Store jobId in state
        ↓
Start polling loop
```

### Polling Loop

```
Every 2 seconds:
        ↓
GET /api/process-audio?jobId=XXX
        ↓
API returns { status, currentStep, resultUrl, errorMessage }
        ↓
Update processingStep in state
        ↓
If status === 'completed':
    ├─ Stop polling
    ├─ Store resultUrl
    ├─ Show AudioPlayer
        ↓
If status === 'failed':
    ├─ Stop polling
    ├─ Show error message
```

## Job Store Structure

```typescript
jobStore.set(jobId, {
  status: 'processing' | 'completed' | 'failed',
  currentStep: 0 | 1 | 2 | 3 | 4,
  startedAt: Date,
  completedAt?: Date,
  oldName: string,
  newName: string,
  fileName: string,
  fileSize: number,
  predictions: string[], // Replicate prediction IDs
  resultUrl?: string,
  errorMessage?: string,
})
```

## Error Handling Strategy

### Frontend Level
- Input validation before submission
- File type checking
- Error message display with AlertCircle icon
- Graceful retry mechanism

### API Level
- Validate FormData on POST
- Try-catch for async operations
- Log errors with job context
- Store error messages in job record

### Replicate Level
- Poll for failed predictions
- Capture and relay error messages
- Timeout after 60 polling attempts (~2 minutes)

## Performance Considerations

### Optimization Strategies

1. **No Blocking Operations**
   - POST returns immediately with jobId
   - Processing happens in background
   - Vercel timeout not an issue

2. **Efficient Polling**
   - 2-second intervals (not too frequent)
   - Stop polling when complete/failed
   - Clear intervals on component unmount

3. **In-Memory Storage**
   - Fast lookups for job status
   - Suitable for small number of concurrent jobs
   - For scale: use Redis or database

4. **Minimal Transfers**
   - Only send necessary data
   - Use data URLs for image/audio transmission
   - No unnecessary re-renders

### Caching

- Language preference cached in localStorage
- Job metadata cached in jobStore (memory)
- API responses not cached (real-time status)

## Security Considerations

1. **API Token Protection**
   - `REPLICATE_API_TOKEN` only in backend .env
   - Never exposed to frontend
   - Secure environment variable in Vercel

2. **Input Validation**
   - File type validation
   - File size limits (if needed)
   - Text input sanitization

3. **CORS**
   - API routes are same-origin
   - No cross-origin issues
   - Replicate API handles CORS

4. **Rate Limiting**
   - Consider implementing per-user limits
   - Monitor Replicate API usage
   - Implement job concurrency limits

## Scalability Path

### Current (Development)
- In-memory job store
- Synchronous polling
- ~10 concurrent jobs max

### Production (Small Scale)
- Move to Redis jobStore
- Keep polling mechanism
- ~100 concurrent jobs

### Production (Enterprise)
- Implement webhooks instead of polling
- Database for job persistence
- Message queue for async processing
- ~1000+ concurrent jobs

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19 | UI components |
| Framework | Next.js 16 | App router, API routes |
| Styling | Tailwind CSS v4 | Responsive design |
| Components | shadcn/ui | Pre-built UI components |
| Icons | Lucide React | SVG icons |
| AI/ML | Replicate API | Voice cloning models |
| Language | TypeScript | Type safety |

## File Structure

```
/vercel/share/v0-project/
├── app/
│   ├── page.tsx                 # Main dashboard
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Tailwind + theme
│   └── api/
│       ├── process-audio/
│       │   └── route.ts         # Replicate integration
│       └── mock-audio/
│           └── route.ts         # Test endpoint
├── components/
│   ├── Header.tsx               # Navigation
│   ├── AudioUpload.tsx          # File upload
│   ├── TextInputs.tsx           # Name inputs
│   ├── ProcessingStatus.tsx      # Progress tracker
│   ├── AudioPlayer.tsx          # Result player
│   ├── LanguageProvider.tsx      # Language context
│   └── ui/                       # shadcn/ui components
├── package.json
├── tsconfig.json
└── REPLICATE_SETUP.md           # Setup guide
```

## Future Enhancements

1. **Merge Functionality**
   - Combine synthesized name with original instrumental
   - Audio mixing and normalization

2. **Voice Models**
   - User uploads reference voice samples
   - Custom voice training

3. **Batch Processing**
   - Multiple files at once
   - Queue management

4. **File Storage**
   - Persist results to Vercel Blob or S3
   - User library of processed songs

5. **User Accounts**
   - Save job history
   - Download results later
   - Subscription tiers

6. **Quality Settings**
   - Quality/speed trade-off slider
   - Model selection dropdown
   - Advanced options panel
