import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { company, problem, customers, additionalContext } = await request.json();

    // Build the prompt, including additional context if provided.
    const prompt = `
      You are a helpful assistant generating a concise business pitch.
      The user has the following idea:
      - Company will make: ${company}
      - Problem it solves: ${problem}
      - Target customers: ${customers}
      ${additionalContext ? `Additional context: ${additionalContext}` : ''}

      Please generate a short, insightful pitch summary in 2-3 sentences.
    `;

    // Call the OpenAI chat completion endpoint.
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant generating a concise business pitch.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    const generatedText = response.choices[0]?.message?.content?.trim() || '';

    return NextResponse.json({ pitch: generatedText });
  } catch (error) {
    console.error('Error generating pitch:', error);
    return NextResponse.json(
      { error: 'Error generating pitch summary.' },
      { status: 500 }
    );
  }
}
