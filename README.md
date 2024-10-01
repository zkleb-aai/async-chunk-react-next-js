# Async Chunk React Next.js: Near-Realtime Speech-to-Text Web App

This web application, built with Next.js and React, provides near-realtime speech-to-text transcription using chunked audio processing and AssemblyAI's async transcription API.

## Features

- Async chunking audio recording and chunking in the browser
- Asynchronous transcription using AssemblyAI API
- Ordered transcript display in real-time
- Configurable chunk size
- Support for multiple languages (based on AssemblyAI's capabilities)

## Prerequisites

- Node.js (v14 or later recommended)
- npm package manager
- AssemblyAI API key

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/zkleb-aai/async-chunk-react-next-js.git
   cd async-chunk-react-next-js
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your AssemblyAI API key:
   ```
   ASSEMBLYAI_API_KEY=your_api_key_here
   ```

## Usage

1. Start the development server:
   ```
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. Use the interface to set the chunk size, start/stop recording, and view the real-time transcription.

## Configuration

- Chunk Size: Adjustable in the web interface
- Language settings: Modify `api/transcribe/route.ts` to change language or enable detection

## Project Structure

- `src/app/page.tsx`: Main application component
- `src/app/api/transcribe/route.ts`: API route for transcription tasks

## Troubleshooting

Ensure:
- Your microphone is properly connected
- AssemblyAI API key is correctly set in `.env.local`
- You have a stable internet connection

Check the browser console for error messages if issues persist.

## Future Enhancements

- Implement Voice Activity Detection (VAD) if a suitable library is found
- Allow overlap logic to ensure context isn't lost if VAD remains unavailable

## Contributing

Contributions are welcome. Please submit a Pull Request or create an Issue to discuss potential changes/additions.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [AssemblyAI](https://www.assemblyai.com/)