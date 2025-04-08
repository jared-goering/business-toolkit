'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CaretDown, CaretUp, Sparkle, Spinner, X, Eye } from 'phosphor-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import Masonry from 'react-masonry-css';

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
  const [hoverViewResults, setHoverViewResults] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  async function handleIdeateValuePropMapping() {
    if (valueMapping) {
      setModalOpen(true);
      return;
    }
    
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
      setModalOpen(true);
    } catch (error) {
      console.error('Error generating value proposition mapping:', error);
    } finally {
      setLoadingValueMapping(false);
    }
  }

  const handleRegenerateValueMapping = () => {
    setValueMapping(null);
    handleIdeateValuePropMapping();
  };

  // Parse sections if needed (for further customization)
  let sections: { heading: string; content: string[] }[] = [];
  if (valueMapping) {
    sections = parseSections(valueMapping);
    console.log('Parsed sections:', sections);
  }

  // Dynamically set column count based on number of sections
  const getColumnCount = () => {
    if (!sections.length) return 3; // Default
    if (sections.length === 1) return 1;
    if (sections.length === 2) return 2;
    return 3; // 3 or more sections
  };

  // Breakpoint for masonry layout - dynamically adjust based on number of sections
  const breakpointColumnsObj = {
    default: getColumnCount(),
    1100: Math.min(getColumnCount(), 2), 
    768: 1,
    640: 1
  };

  return (
    <div className="w-full flex flex-col items-center">
      <motion.div className="w-full" whileTap={{ scale: 0.95 }}>
        <Button
          onMouseEnter={() => valueMapping ? setHoverViewResults(true) : setHoverValuePropSparkle(true)}
          onMouseLeave={() => valueMapping ? setHoverViewResults(false) : setHoverValuePropSparkle(false)}
          onClick={handleIdeateValuePropMapping}
          className={`
            w-full
            rounded-full
            px-6
            py-3
            h-[52px]
            border
            ${valueMapping ? 'border-[#00FFFF]/70' : 'border-[#00FFFF]'}
            bg-[#1C1C1C]
            ${valueMapping ? 'text-[#00FFFF]/80' : 'text-[#00FFFF]'}
            ${valueMapping ? 'hover:bg-[#00FFFF]/20' : 'hover:bg-[#00FFFF]/30'}
            hover:border-[#00FFFF]
            transition-colors
            duration-200
            flex
            items-center
            justify-center
          `}
        >
          {loadingValueMapping ? (
            <span className="flex items-center">
              <Spinner size={20} className="mr-2 animate-spin" />
              Loading value prop...
            </span>
          ) : valueMapping ? (
            <span className="flex items-center">
              <Eye
                size={28}
                weight={hoverViewResults ? 'fill' : 'bold'}
                className="mr-2"
              />
              View Value Proposition Map
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
      </motion.div>

      {/* Modal Dialog for Value Proposition Map */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#1C1C1C] border-[#3F3F3F] text-[#EFEFEF] p-4 rounded-lg sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-center">
              <DialogTitle className="text-xl font-bold text-[#EFEFEF]">
                Value Proposition Map
              </DialogTitle>
            </div>
          </DialogHeader>
          
          <div className="pt-2 pb-2">
            {sections.length === 2 ? (
              // For exactly two sections, use a simple grid
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sections.map((section, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="mb-3 sm:mb-4"
                  >
                    <Card className="border border-[#3F3F3F] bg-[#2F2F2F] rounded-xl p-3 sm:p-4">
                      <div className="flex flex-col space-y-2">
                        <h2 className="text-lg sm:text-xl font-bold text-[#EFEFEF] p-0 m-0 leading-none">
                          {section.heading}
                        </h2>
                        <div className="prose prose-invert prose-xs sm:prose-sm max-w-none h-auto space-y-1">
                          <ReactMarkdown
                            components={{
                              h2: () => null,
                              h3: ({ children }) => (
                                <h3 className="text-base sm:text-lg p-0 m-0 text-[#EFEFEF] font-semibold leading-tight mt-2 mb-1">
                                  {children}
                                </h3>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc list-outside ml-3 sm:ml-4 text-[#EFEFEF] my-0.5 p-0">
                                  {children}
                                </ul>
                              ),
                              li: ({ children }) => (
                                <li className="m-0 py-0.5 sm:py-1 text-sm sm:text-base">{children}</li>
                              ),
                              p: ({ children }) => (
                                <p className="m-0 py-0.5 sm:py-1 text-sm sm:text-base text-[#EFEFEF]">
                                  {children}
                                </p>
                              ),
                            }}
                          >
                            {section.content.join('\n')}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              // For 1 or 3+ sections, use Masonry layout
              <Masonry
                breakpointCols={breakpointColumnsObj}
                className="flex w-auto -ml-4"
                columnClassName="pl-4 bg-clip-padding"
              >
                {sections.map((section, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="mb-3 sm:mb-4"
                  >
                    <Card className="border border-[#3F3F3F] bg-[#2F2F2F] rounded-xl p-3 sm:p-4">
                      <div className="flex flex-col space-y-2">
                        <h2 className="text-lg sm:text-xl font-bold text-[#EFEFEF] p-0 m-0 leading-none">
                          {section.heading}
                        </h2>
                        <div className="prose prose-invert prose-xs sm:prose-sm max-w-none h-auto space-y-1">
                          <ReactMarkdown
                            components={{
                              h2: () => null,
                              h3: ({ children }) => (
                                <h3 className="text-base sm:text-lg p-0 m-0 text-[#EFEFEF] font-semibold leading-tight mt-2 mb-1">
                                  {children}
                                </h3>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc list-outside ml-3 sm:ml-4 text-[#EFEFEF] my-0.5 p-0">
                                  {children}
                                </ul>
                              ),
                              li: ({ children }) => (
                                <li className="m-0 py-0.5 sm:py-1 text-sm sm:text-base">{children}</li>
                              ),
                              p: ({ children }) => (
                                <p className="m-0 py-0.5 sm:py-1 text-sm sm:text-base text-[#EFEFEF]">
                                  {children}
                                </p>
                              ),
                            }}
                          >
                            {section.content.join('\n')}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </Masonry>
            )}
          </div>
          
          <div className="flex justify-center gap-2 sm:gap-4 mt-2 sm:mt-4">
            <Button 
              onClick={handleRegenerateValueMapping}
              className="rounded-full px-2 sm:px-3 md:px-6 py-1 sm:py-2 border border-[#00FFFF] bg-[#1C1C1C] text-[#00FFFF] hover:bg-[#00FFFF]/30 text-xs sm:text-sm md:text-base"
            >
              <Sparkle size={16} className="mr-1 sm:mr-2" />
              Regenerate
            </Button>
            <Button 
              onClick={() => setModalOpen(false)}
              className="rounded-full px-2 sm:px-3 md:px-6 py-1 sm:py-2 border border-[#3F3F3F] bg-[#1C1C1C] text-[#EFEFEF] hover:bg-[#2F2F2F] text-xs sm:text-sm md:text-base"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
