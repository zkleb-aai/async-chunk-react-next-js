import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const audioBuffer = await audioFile.arrayBuffer();
    const audioData = Buffer.from(audioBuffer);

    const response = await axios.post(
      'https://api.assemblyai.com/v2/upload',
      audioData,
      {
        headers: {
          'Content-Type': 'application/octet-stream',
          Authorization: process.env.ASSEMBLYAI_API_KEY,
        },
      }
    );

    const uploadUrl = response.data.upload_url;

    const transcriptionResponse = await axios.post(
      'https://api.assemblyai.com/v2/transcript',
      {
        audio_url: uploadUrl,
      },
      {
        headers: {
          Authorization: process.env.ASSEMBLYAI_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    const transcriptId = transcriptionResponse.data.id;

    let transcriptResult;
    do {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      transcriptResult = await axios.get(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        {
          headers: {
            Authorization: process.env.ASSEMBLYAI_API_KEY,
          },
        }
      );
    } while (transcriptResult.data.status !== 'completed');

    return NextResponse.json({ text: transcriptResult.data.text });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return NextResponse.json({ error: 'Error transcribing audio' }, { status: 500 });
  }
}