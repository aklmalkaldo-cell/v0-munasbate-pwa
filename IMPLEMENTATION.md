# Zafat AI - Premium Song Customization Platform

## 🎵 Project Overview

Zafat AI is a modern, premium web application for AI-powered Zafat and song customization. The platform features a luxury dark theme with sleek purple, dark gray, and neon cyan accents, fully supporting both Arabic (RTL) and English (LTR) interfaces.

## ✨ Features Implemented

### Core Functionality
- **Audio Upload**: Drag-and-drop MP3/WAV file upload with validation
- **Name Customization**: Replace any name in songs with dual text inputs
- **AI Processing**: 4-step progress tracking with multi-phase processing simulation
- **Audio Playback**: Custom audio player with play/pause, progress scrubbing, and download
- **Dual Language**: Complete Arabic/English UI with RTL support and language persistence

### Design & UX
- **Premium Dark Theme**: Luxury color palette with purples (#8B5CF6), dark grays (#1A1A2E), and neon cyan (#06D6A0)
- **Responsive Design**: Mobile-first approach supporting all screen sizes
- **Smooth Animations**: Progress tracking, loading states, and UI transitions
- **Professional Components**: Custom-built header, upload zone, progress tracker, and audio player

### Technical Highlights
- **Long-Polling Architecture**: Handles job status updates without timeout errors
- **API Integration**: Backend stubs for Hugging Face Space API integration
- **Client-Side Processing**: Mock audio generation endpoint for testing
- **State Management**: React hooks with localStorage language persistence

## 📁 Project Structure

```
app/
  layout.tsx              # Root layout with metadata
  page.tsx                # Main dashboard component
  globals.css             # Theme colors and base styles
  api/
    process-audio/
      route.ts            # POST: Submit audio for processing, GET: Poll status
    mock-audio/
      route.ts            # GET: Generate mock audio response

components/
  Header.tsx              # Navigation bar with logo and language toggle
  AudioUpload.tsx         # Drag-and-drop file upload component
  TextInputs.tsx          # Name customization input fields
  ProcessingStatus.tsx    # Multi-step progress tracker
  AudioPlayer.tsx         # Custom audio player with controls
  LanguageProvider.tsx    # Language context and translations
```

## 🚀 Getting Started

### Installation
```bash
pnpm install
```

### Development
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

### Production Build
```bash
pnpm build
pnpm start
```

## 🎨 Design System

### Color Palette
- **Primary**: `#8b5cf6` (Purple) - Main accent for interactive elements
- **Secondary**: `#2d1b4e` (Dark Purple) - Card backgrounds
- **Accent**: `#06d6a0` (Neon Cyan) - Success and completion indicators
- **Background**: `#0a0a0f` (Deep Black) - Main background
- **Text**: `#f5f5f7` (Off-white) - Primary text color
- **Muted**: `#2d2d3d` (Dark Gray) - Secondary UI elements

### Typography
- **Sans Serif**: System font stack for consistent rendering
- **Headings**: Bold (700-800 weight) for visual hierarchy
- **Body**: Regular (400) weight with 1.5 line height for readability

## 🔄 Processing Workflow

### User Flow
1. **Upload**: User drags/drops or selects an MP3/WAV file
2. **Configure**: Enter old name (to replace) and new name
3. **Submit**: Click "Customize with AI" button
4. **Processing**: Watch 4-step progress tracker:
   - Isolating Vocals
   - Cloning Voice
   - Generating New Lyric
   - Final Audio Mixing
5. **Results**: Listen to customized audio and download

### API Integration
- **POST `/api/process-audio`**: Accepts FormData with file, oldName, newName
- **Response**: Returns `jobId` for tracking
- **GET `/api/process-audio?jobId=XXX`**: Polls job status
- **Long-Polling**: Frontend polls every 500ms until completion
- **Mock Endpoint**: `/api/mock-audio` generates test audio

## 🌍 Internationalization

### Supported Languages
- **English**: Left-to-right (LTR) layout
- **Arabic**: Right-to-left (RTL) layout with proper text directionality

### Language Persistence
- Language preference stored in localStorage
- Automatically loads saved language on revisit
- Language toggle in header switches between EN/AR

## 🔧 Technical Details

### Frontend Architecture
- **React 19**: Latest hooks and concurrent rendering
- **TypeScript**: Full type safety across components
- **Tailwind CSS 4**: Utility-first styling with responsive support
- **Shadcn/UI**: Pre-built accessible components
- **Lucide Icons**: Consistent icon set

### Backend (API Routes)
- **Next.js API Routes**: Serverless functions for backend logic
- **FormData Processing**: Handles multipart file uploads
- **In-Memory Job Store**: Simulated job status tracking
- **Mock Audio Generation**: WAV file generation for testing

### State Management
- **useState**: Component-level state for file, form inputs, processing status
- **useEffect**: Polling mechanism with cleanup
- **useRef**: Direct DOM access for audio player
- **localStorage**: Language persistence across sessions

## 📊 Progress Tracking

The processing status component simulates a 4-step process:
1. **Step 1**: Isolating Vocals (2 seconds)
2. **Step 2**: Cloning Voice (3 seconds)
3. **Step 3**: Generating New Lyric (2.5 seconds)
4. **Step 4**: Final Audio Mixing (2 seconds)

Each step shows:
- Visual progress indicator (circle with checkmark or spinner)
- Step label in English/Arabic
- Animated progress bar at the bottom
- Real-time step counter

## 🎯 Error Handling

- **File Validation**: Only MP3/WAV files, max 100MB
- **Form Validation**: Requires both old and new names
- **Network Error**: Graceful fallback for polling failures
- **User Feedback**: Clear error messages in user's selected language

## 🔗 Integration Points

### Hugging Face Space API
The `/api/process-audio` route includes commented placeholder code for integrating with a Hugging Face Space:

```typescript
// Example: POST to Hugging Face Space
const hfResponse = await fetch('https://your-huggingface-space-url/api/process', {
  method: 'POST',
  body: huggingFaceFormData,
})
```

### Custom Audio Processing
Replace the mock audio generation in `/api/mock-audio/route.ts` with actual audio processing logic from your AI service.

## 📱 Responsive Design

- **Mobile (< 640px)**: Single column layout, stacked form inputs
- **Tablet (640px - 1024px)**: 2-column grids, optimized spacing
- **Desktop (> 1024px)**: Full-width container with max-width constraint

## ✅ Testing Checklist

- [x] Audio file upload and validation
- [x] Language toggle and persistence
- [x] Processing progress tracking
- [x] Job status polling
- [x] Audio playback and download
- [x] Error handling and messages
- [x] Mobile responsiveness
- [x] Arabic/English text rendering
- [x] Component accessibility

## 🚀 Deployment

### Vercel
```bash
# Push to GitHub
git push

# Deploy from Vercel dashboard
# Environment variables: None required for demo
```

### Custom Server
```bash
pnpm build
pnpm start
```

## 📝 Notes

- The application is fully functional for demonstration purposes
- Mock audio generation creates a simple sine wave WAV file
- For production, integrate with actual audio processing service
- Long-polling is production-ready and handles timeouts gracefully
- All color variables are themeable via globals.css

## 🎓 Learning Resources

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [React 19 Features](https://react.dev)
- [Tailwind CSS 4](https://tailwindcss.com/docs)
- [Shadcn/UI Components](https://ui.shadcn.com)
- [Lucide Icons](https://lucide.dev)

---

Built with ❤️ using Next.js 16, React 19, and Tailwind CSS 4
