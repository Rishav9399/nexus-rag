import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // We send a direct ping to Google's fastest model (gemini-2.5-flash)
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: 'You are the AI core of Nexus RAG. Write a short, single-sentence greeting for the lead architect, Rishav, who just successfully activated your neural bridge.',
    });

    // We return the AI's exact words back to the browser
    return NextResponse.json({ 
      status: "Neural Bridge Online", 
      ai_response: text 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ 
      status: "Connection Failed", 
      error: "The brain did not respond." 
    }, { status: 500 });
  }
}