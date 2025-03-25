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

// Remove top heading if it exists
function removeFirstHeading(markdown: string): string {
  const lines = markdown.split('\n');
  if (lines.length && lines[0].match(/^#\s+Value Proposition Mapping/i)) {
    lines.shift();
  }
  return lines.join('\n').trim();
}

// Split the markdown into sections at each "## Some Heading"
function parseSections(markdown: string) {
  const lines = markdown.split('\n');
  const sections: { heading: string; content: string[] }[] = [];
  let currentHeading = '';
  let currentContent: string[] = [];
  for (const line of lines) {
    const match = line.match(/^##\s+(.*)/);
    if (match) {
      if (currentHeading || currentContent.length > 0) {
        sections.push({ heading: currentHeading, content: currentContent });
      }
      currentHeading = match[1].trim();
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }
  if (currentHeading || currentContent.length > 0) {
    sections.push({ heading: currentHeading, content: currentContent });
  }
  return sections;
}

function removeEmptyLines(raw: string): string {
  return raw
    .split('\n')
    .filter(line => line.trim() !== '')
    .join('\n');
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

  // Parse sections if needed (for further customization)
  let sections: { heading: string; content: string[] }[] = [];
  if (valueMapping) {
    sections = parseSections(valueMapping);
    console.log('Parsed sections:', sections);
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Conditionally render either the button or the result box */}
      {valueMapping ? (
        // When a result exists, show a Card that acts as the expanded result box
        <Card className="bg-[#1C1C1C] rounded-3xl border-[#00FFFF] py-1 px-1 w-full mb-5">
          <CardHeader className="pt-3 pb-2">
            <div className="flex items-center justify-center">
              <CardTitle className="text-[17px] text-[#EFEFEF] leading-tight m-0 inline-block mr-2 text-center text-[#00FFFF]">
                Value Proposition Map
              </CardTitle>
              <button
                onClick={() => setMinimizedValue(!minimizedValue)}
                className="focus:outline-none"
              >
                {minimizedValue ? (
                  <CaretDown size={24} className="text-[#00FFFF]" />
                ) : (
                  <CaretUp size={24} className="text-[#00FFFF]" />
                )}
              </button>
            </div>
          </CardHeader>
          {!minimizedValue && (
            <CardContent className="p-2 space-y-3">
              {sections.map((section, idx) => (
                <Card
                  key={idx}
                  className="border border-[#3F3F3F] bg-[#2F2F2F] rounded-xl p-3"
                >
                  <h2 className="text-xl font-bold text-[#EFEFEF] p-0 m-0">
                    {section.heading}
                  </h2>
                  <ReactMarkdown
                    components={{
                      h2: () => null,
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
      ) : (
        // Otherwise, show the button that triggers the API call
        <Button
          onMouseEnter={() => setHoverValuePropSparkle(true)}
          onMouseLeave={() => setHoverValuePropSparkle(false)}
          onClick={handleIdeateValuePropMapping}
          className="
            w-full
            rounded-full
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
            flex
            items-center
            justify-center
            mb-5
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
      )}
    </div>
  );
}
