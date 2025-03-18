// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { company, problem, customers } = await request.json();

    // Construct a prompt or system message for GPT
    const prompt = `
      You are a helpful assistant generating a concise business pitch. 
      The user has the following idea:
      - Company will make: ${company}
      - Problem it solves: ${problem}
      - Target customers: ${customers}

      Please generate a short, insightful pitch summary in 2-3 sentences.
    `;

    const response = await openai.completions.create({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 100,
      temperature: 0.7,
    });

    const generatedText = response.choices[0]?.text?.trim() || '';

    return NextResponse.json({ pitch: generatedText });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error generating pitch summary.' },
      { status: 500 }
    );
  }
}