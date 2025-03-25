// app/api/ideate-value-proposition/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const { pitch, company, problem, customers } = await request.json();

    const prompt = `
Given the following details:
- Company: ${company}
- Problem: ${problem}
- Target Customers: ${customers}
- Pitch: ${pitch}

- Generate a concise Value Proposition mapping in bullet points, 
- Use actual Markdown lists and headings. `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // or 'gpt-3.5-turbo'
      messages: [
        { role: 'system', content: 'You are a helpful assistant generating a value proposition mapping.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    // This should be the raw markdown text from GPT
    const completion = response.choices[0]?.message?.content?.trim() || '';

    // Return it directly in the JSON response
    return NextResponse.json({ valueMapping: completion });
  } catch (error) {
    console.error('Error generating value proposition mapping:', error);
    return NextResponse.json(
      { error: 'Error generating value proposition mapping.' },
      { status: 500 }
    );
  }
}