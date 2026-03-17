import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = body?.prompt?.trim();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Please enter a question first.' },
        { status: 400 }
      );
    }

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system:
        'You are Wingman, a helpful airport assistant. Give short, clear, practical airport guidance.',
      prompt,
    });

    return NextResponse.json({ answer: text });
  } catch (error) {
    console.error('Groq API error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while contacting the AI.' },
      { status: 500 }
    );
  }
}