'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface QueueItem {
  chunkNumber: number;
  audioBlob: Blob;
}

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [chunkSize, setChunkSize] = useState(15);
  const [overlap, setOverlap] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const chunkNumberRef = useRef<number>(0);
  const transcriptionQueueRef = useRef<QueueItem[]>([]);
  const isProcessingRef = useRef<boolean>(false);

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [isRecording]);

  useEffect(() => {
    const intervalId = setInterval(processQueue, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      startTimeRef.current = Date.now();
      chunkNumberRef.current = 0;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        enqueueChunk();
      };

      const chunkInterval = setInterval(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current.start();
        }
      }, chunkSize * 1000);

      mediaRecorder.start();
      console.log("Recording started");

      return () => clearInterval(chunkInterval);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    console.log("Recording stopped");
  };

  const enqueueChunk = () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    transcriptionQueueRef.current.push({
      chunkNumber: chunkNumberRef.current,
      audioBlob: audioBlob
    });
    console.log(`Chunk ${chunkNumberRef.current} enqueued for transcription`);

    // Reset for next chunk
    audioChunksRef.current = [];
    chunkNumberRef.current += 1;
  };

  const processQueue = async () => {
    if (isProcessingRef.current || transcriptionQueueRef.current.length === 0) {
      return;
    }

    isProcessingRef.current = true;
    const item = transcriptionQueueRef.current.shift()!;
    await processChunk(item);
    isProcessingRef.current = false;
  };

  const processChunk = async (item: QueueItem) => {
    const formData = new FormData();
    formData.append('audio', item.audioBlob, 'audio.webm');

    console.log(`Chunk ${item.chunkNumber} sent for transcription`);
    const sendTime = Date.now();

    try {
      const response = await axios.post('/api/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const receiveTime = Date.now();
      const turnaroundTime = (receiveTime - sendTime) / 1000;
      console.log(`Chunk ${item.chunkNumber} transcription received. Turnaround time: ${turnaroundTime.toFixed(2)} seconds`);

      setTranscript((prevTranscript) => prevTranscript + ' ' + response.data.text);
    } catch (error) {
      console.error('Error sending audio chunk:', error);
    }
  };

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Audio Transcription App</h1>
      <div className="mb-4">
        <label className="block mb-2">
          Chunk Size (seconds):
          <input
            type="number"
            value={chunkSize}
            onChange={(e) => setChunkSize(Number(e.target.value))}
            className="ml-2 p-1 border rounded"
          />
        </label>
      </div>
      <div className="mb-4">
        <label className="block mb-2">
          Overlap (seconds):
          <input
            type="number"
            value={overlap}
            onChange={(e) => setOverlap(Number(e.target.value))}
            className="ml-2 p-1 border rounded"
          />
        </label>
        <p className="text-sm text-gray-600">
          The overlap input indicates how many seconds before the end of the last chunk the new chunk begins
        </p>
      </div>
      <button
        onClick={handleToggleRecording}
        className={`px-4 py-2 rounded ${
          isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
        } text-white`}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Transcript:</h2>
        <p className="p-2 border rounded bg-gray-100 min-h-[100px]">{transcript}</p>
      </div>
    </div>
  );
}