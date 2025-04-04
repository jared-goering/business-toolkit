import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

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

Provide a comprehensive competitor analysis report. Include:

1. Direct Competitors: Identify 3-5 main direct competitors who solve the same problem.
   - For each competitor, analyze their:
     - Business model
     - Target audience
     - Pricing strategy
     - Key features
     - Strengths and weaknesses
     - Market share (if available)

2. Indirect Competitors: Identify 2-3 indirect competitors who solve adjacent problems.

3. Competitive Landscape:
   - Market positioning map
   - Key differentiators in the market
   - Barriers to entry
   - Recent market trends

4. Competitive Advantage:
   - Identify potential unique selling propositions for ${company}
   - Gaps in competitor offerings that ${company} could exploit
   - Recommendations for differentiation

Format your response with clear headings (use ## for main sections), bullet points, and tables where appropriate. 
For tables, use proper markdown table format with headers.
For the market positioning map, create a simple text-based visualization.
Highlight key metrics like market share with percentages.
Cite specific sources for market data with numbered references at the end.
End your report with a "## Sources Cited" section with a numbered list of references.
Format in-text citations as [1], [2], etc. that correspond to the numbered references.`;

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
    let competitorReport = data.choices[0]?.message?.content || '';
    
    // Remove <think> tags and their content
    competitorReport = competitorReport.replace(/<think>[\s\S]*?<\/think>/g, '');
    competitorReport = competitorReport.replace(/<\/?think>/g, '');
    competitorReport = competitorReport.trim();
    
    if (!competitorReport) {
      competitorReport = "# Competitor Analysis Report\n\nUnable to generate a complete report. Please try again.";
    }

    return NextResponse.json({ competitorReport });
  } catch (error) {
    console.error('Error generating competitor report:', error);
    return NextResponse.json(
      { error: 'Error generating competitor report.' },
      { status: 500 }
    );
  }
} 