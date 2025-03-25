// app/api/ideate-customer-pain-points/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { pitch, company, problem, customers } = await request.json();

    const prompt = `
Based on the following details:
- Company: ${company}
- Problem: ${problem}
- Target Customers: ${customers}
- Pitch: ${pitch}

Generate 4 distinct customer pain points in bullet form. For each pain point, provide a brief, concise statement.
Return the result as a valid JSON object with a key "painPoints" whose value is an array of 4 strings.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // or 'gpt-3.5-turbo' if needed
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant generating customer insights.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    let completion = response.choices[0]?.message?.content || '';
    let cleaned = completion.trim();

    // Remove markdown code fences if present
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/, '');
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.replace(/\s*```$/, '');
    }

    // Optional: extract only the JSON object using regex
    const jsonMatch = cleaned.match(/(\{.*\})/s);
    if (jsonMatch) {
      cleaned = jsonMatch[1];
    }

    let result;
    try {
      result = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Cleaned output:", cleaned);
      return NextResponse.json(
        { error: 'Error parsing AI response. Output: ' + cleaned },
        { status: 500 }
      );
    }

    // Return the generated pain points
    return NextResponse.json({ painPoints: result.painPoints });
  } catch (error) {
    console.error('Error generating customer pain points:', error);
    return NextResponse.json({ error: 'Error generating customer pain points.' }, { status: 500 });
  }
}
