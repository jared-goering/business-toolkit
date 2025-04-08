import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { pitch, company, problem, customers, valueProposition, painPoints, personas } = await request.json();

    // Construct a comprehensive prompt using all the available data
    const prompt = `
Based on the following information about a startup:

COMPANY: ${company}
PROBLEM: ${problem}
TARGET CUSTOMERS: ${customers}
PITCH: ${pitch}
VALUE PROPOSITION: ${valueProposition || "Not provided"}
CUSTOMER PAIN POINTS: ${painPoints ? JSON.stringify(painPoints) : "Not provided"}
TARGET PERSONAS: ${personas ? JSON.stringify(personas) : "Not provided"}

Provide a prioritized list of 5-7 concrete next steps for this startup to execute in the next 30-90 days.

For each next step:
1. Provide a clear, actionable title
2. Include a brief description of what needs to be done and why it's important
3. Suggest a rough timeframe (e.g., "Week 1-2", "Month 1", etc.)
4. Indicate the expected outcome or deliverable

Format the response as markdown with a clear structure. Use bullet points and clear headings.
Make the next steps specific, measurable, achievable, relevant, and time-bound (SMART).
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a strategic business advisor specializing in early-stage startups. Your advice is practical, actionable, and tailored to the specific context of each business.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const nextSteps = response.choices[0]?.message?.content?.trim() || '';

    return NextResponse.json({ nextSteps });
  } catch (error) {
    console.error('Error generating next steps:', error);
    return NextResponse.json(
      { error: 'Error generating next steps.' },
      { status: 500 }
    );
  }
} 