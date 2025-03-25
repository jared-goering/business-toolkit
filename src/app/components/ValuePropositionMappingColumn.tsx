'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CaretDown, CaretUp, Sparkle, Spinner } from 'phosphor-react';
import ReactMarkdown from 'react-markdown';

interface ValuePropMappingProps {
  pitch: string;
  company: string;
  problem: string;
  customers: string;
}

// (Optional) remove "# Value Proposition Mapping" at top
function removeFirstHeading(markdown: string): string {
  const lines = markdown.split('\n');
  if (lines.length && lines[0].match(/^#\s+Value Proposition Mapping/i)) {
    lines.shift();
  }
  return lines.join('\n').trim();
}

// Our parser for splitting on each "## Some Heading"
function parseSections(markdown: string) {
  const lines = markdown.split('\n');
  const sections: { heading: string; content: string[] }[] = [];

  let currentHeading = '';
  let currentContent: string[] = [];

  for (const line of lines) {
    const match = line.match(/^##\s+(.*)/);
    if (match) {
      // push old
      if (currentHeading || currentContent.length > 0) {
        sections.push({ heading: currentHeading, content: currentContent });
      }
      // start new
      currentHeading = match[1].trim();
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }
  // push last
  if (currentHeading || currentContent.length > 0) {
    sections.push({ heading: currentHeading, content: currentContent });
  }

  return sections;
}

function removeEmptyLines(raw: string): string {
    return raw
      .split('\n')
      .filter(line => line.trim() !== '') // keep only non-empty lines
      .join('\n'); // rejoin with single line breaks
  }

export default function ValuePropositionMappingColumn({
  pitch,
  company,
  problem,
  customers,
}: ValuePropMappingProps) {
  const [valueMapping, setValueMapping] = useState<string | null>(null);
  const [loadingValueMapping, setLoadingValueMapping] = useState(false);
  const [minimizedValue, setMinimizedValue] = useState(false);
  const [hoverValuePropSparkle, setHoverValuePropSparkle] = useState(false);

  async function handleIdeateValuePropMapping() {
    setLoadingValueMapping(true);
    setValueMapping(null);

    try {
      const response = await fetch('/api/ideate-value-proposition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitch, company, problem, customers }),
      });
      const data = await response.json();

      // Remove top heading if it exists
    //   const cleaned = removeFirstHeading(data.valueMapping || '');
      let cleaned = removeFirstHeading(data.valueMapping || '');
      cleaned = removeEmptyLines(cleaned);


      setValueMapping(cleaned);
      console.log('Cleaned GPT output:', cleaned);
    } catch (error) {
      console.error('Error generating value proposition mapping:', error);
    } finally {
      setLoadingValueMapping(false);
    }
  }

  // If we have markdown, split it into sections
  let sections: { heading: string; content: string[] }[] = [];
  if (valueMapping) {
    sections = parseSections(valueMapping);
    console.log('Parsed sections:', sections);
  }

  return (
    <div className="flex flex-col items-center">
      <Button
        onMouseEnter={() => setHoverValuePropSparkle(true)}
        onMouseLeave={() => setHoverValuePropSparkle(false)}
        onClick={handleIdeateValuePropMapping}
        className="
          rounded-full
          w-5/6
          px-6
          py-2
          border
          border-[#00FFFF]
          bg-[#1C1C1C]
          text-[#00FFFF]
          hover:bg-[#00FFFF]/30
          hover:border-[#00FFFF]
          transition-colors
          duration-200
        "
      >
        {loadingValueMapping ? (
          <span className="flex items-center">
            <Spinner size={20} className="mr-2 animate-spin" />
            Loading value prop...
          </span>
        ) : (
          <span className="flex items-center">
            <Sparkle
              size={32}
              weight={hoverValuePropSparkle ? 'fill' : 'bold'}
              className="mr-2"
            />
            Value Proposition Mapping
          </span>
        )}
      </Button>

      {valueMapping && (
        <Card className="bg-[#1C1C1C] rounded-3xl border-[#3F3F3F] py-1 px-1 mt-12 w-full mb-5">
          <CardHeader className="pt-3 pb-2">
            <div className="flex items-center justify-center">
              <CardTitle className="text-[17px] text-[#EFEFEF] leading-tight m-0 inline-block mr-2 text-center">
                Value Proposition
              </CardTitle>
              <button
                onClick={() => setMinimizedValue(!minimizedValue)}
                className="focus:outline-none"
              >
                {minimizedValue ? (
                  <CaretDown size={24} className="text-gray-400" />
                ) : (
                  <CaretUp size={24} className="text-gray-400" />
                )}
              </button>
            </div>
          </CardHeader>

          {!minimizedValue && (
            <CardContent className="p-2 space-y-6 ">
              {/* For each "## Heading" section, render a sub-card or box */}
              {sections.map((section, idx) => (
                <Card
                  key={idx}
                  className="border border-[#3F3F3F] bg-[#2F2F2F] rounded-xl p-3"
                >
                  {/* The heading from GPT (like "Customer Segment", "Problem", etc.) */}
                  <h2 className="text-xl font-bold text-[#EFEFEF] p-0 m-0">
                    {section.heading}
                  </h2>

                  {/* Render the lines under that heading as Markdown */}
                  <ReactMarkdown
  components={{
    // Hide or override nested h2 if you want
    h2: () => null,
    // Now override h3:
    h3: ({ children }) => (
      <h3 className="text-l p-0 m-0 text-[#EFEFEF] font-semibold mb-1">
        {children}
      </h3>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside ml-2 text-sm text-[#EFEFEF]">
        {children}
      </ul>
    ),
    li: ({ children }) => (
        <li className="m-0 p-0 leading-normal">{children}</li>
      ),
    p: ({ children }) => (
        <p className="m-0 p-0 text-sm text-[#EFEFEF] leading-normal">
          {children}
        </p>
    ),
  }}
>
  {section.content.join('\n')}
</ReactMarkdown>
                </Card>
              ))}
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}