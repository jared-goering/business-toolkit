import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

export const runtime = 'nodejs';  // ensure serverless runtime
export const maxDuration = 60;    // seconds (requires Pro or Fluid Compute)

export async function POST(request: Request) {
  try {
    const { pitch, company, problem, customers, valueProposition, painPoints, personas } = await request.json();

    // Construct a comprehensive prompt using all the generated data
    const prompt = `
Based on the following information about a startup:

COMPANY: ${company}
PROBLEM: ${problem}
TARGET CUSTOMERS: ${customers}
PITCH: ${pitch}
VALUE PROPOSITION: ${valueProposition || "Not provided"}
CUSTOMER PAIN POINTS: ${painPoints ? JSON.stringify(painPoints) : "Not provided"}
TARGET PERSONAS: ${personas ? JSON.stringify(personas) : "Not provided"}

Provide a comprehensive, research-backed Go-To-Market (GTM) strategy for this startup. Include:

1. Market Analysis: Analyze the current market landscape, competition, and opportunities.
2. Target Market Segmentation: Define and prioritize market segments based on the personas.
3. Positioning Strategy: How the product should be positioned against competitors.
4. Pricing Strategy: Recommended pricing models and strategies.
5. Channel Strategy: Best distribution and sales channels to reach the target audience.
6. Marketing Strategy: Key marketing tactics and campaigns to generate awareness and leads.
7. Sales Strategy: Approach to converting leads into customers.
8. Customer Success: Strategies for retention and growth.
9. Key Metrics: KPIs to track success.
10. Timeline: Phased approach for the GTM rollout.

Format your response with clear headings and bullet points for each section. Present a cohesive strategy document with all content in a single continuous section.

IMPORTANT: Include numerical citations like [1], [2], etc. throughout the document when referencing data, statistics, or best practices. End your report with a "## Sources Cited" section with a numbered list of references with links.

Do not repeat the same information in a numbered list format at the end of the document.`;

    // Call Perplexity API with sonar-deep-research model
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "sonar-deep-research",
        messages: [
          { role: "user", content: prompt }
        ],
        max_tokens: 4000,
        temperature: 0.7
      })
    });

    if (!perplexityResponse.ok) {
      const errorData = await perplexityResponse.text();
      console.error('Perplexity API error:', errorData);
      throw new Error(`Perplexity API error: ${perplexityResponse.status}`);
    }

    const data = await perplexityResponse.json();
    let gtmStrategy = data.choices[0]?.message?.content || '';
    
    // Remove <think> tags and their content
    gtmStrategy = gtmStrategy.replace(/<think>[\s\S]*?<\/think>/g, '');
    
    // Clean up any remaining think tags if the regex didn't catch everything
    gtmStrategy = gtmStrategy.replace(/<\/?think>/g, '');
    
    // Trim whitespace
    gtmStrategy = gtmStrategy.trim();
    
    // If the content is empty after removing think tags, return an error message
    if (!gtmStrategy) {
      gtmStrategy = "# Go-To-Market Strategy\n\nUnable to generate a complete strategy. Please try again.";
    }

    return NextResponse.json({ gtmStrategy });
  } catch (error) {
    console.error('Error generating GTM strategy:', error);
    return NextResponse.json(
      { error: 'Error generating GTM strategy.' },
      { status: 500 }
    );
  }
} 