// app/api/ideate-target-persona/route.ts
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

Generate 4 distinct customer personas. For each persona, include:
- A name (fictional is fine)
- An age range
- Interests
- A brief description of their pain points and motivations

Return the result as a valid JSON array of 4 objects, each with the keys: "name", "ageRange", "interests", and "description".`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // or 'gpt-4' if available
      messages: [
        {
          role: 'system',
          content: 'You are a creative assistant generating customer personas.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1000, // increase if needed
      temperature: 0.7,
    });

    let completion = response.choices[0]?.message?.content || '';
    
    // After getting the raw completion and trimming it:
let cleaned = completion.trim();

// Remove starting/ending backticks if present:
if (cleaned.startsWith('```')) {
  cleaned = cleaned.replace(/^```(?:json)?\s*/, '');
}
if (cleaned.endsWith('```')) {
  cleaned = cleaned.replace(/\s*```$/, '');
}

// Attempt to extract the JSON array from the output using a regex:
const arrayMatch = cleaned.match(/(\[.*\])/s);
if (arrayMatch) {
  cleaned = arrayMatch[1];
} else {
  // Fallback: try to capture up to the last closing bracket.
  const lastBracket = cleaned.lastIndexOf(']');
  if (lastBracket !== -1) {
    cleaned = cleaned.substring(0, lastBracket + 1);
  }
}

let personas;
try {
  personas = JSON.parse(cleaned);
} catch (parseError) {
  console.error("JSON parse error:", parseError, "Cleaned output:", cleaned);
  return NextResponse.json(
    { error: 'Error parsing AI response. Output: ' + cleaned },
    { status: 500 }
  );
}


    return NextResponse.json({ personas });
  } catch (error) {
    console.error('Error generating personas:', error);
    return NextResponse.json({ error: 'Error generating personas.' }, { status: 500 });
  }
}
