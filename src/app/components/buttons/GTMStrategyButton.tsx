'use client';

import React, { useState, ReactNode, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkle, Spinner, Eye, CaretDown, CaretUp } from 'phosphor-react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ReactMarkdown from 'react-markdown';
import { Card } from '@/components/ui/card';

interface GTMStrategyButtonProps {
  pitch: string;
  company: string;
  problem: string;
  customers: string;
  valueProposition: string;
  painPoints: string[];
  personas: any[];
}

const CollapsibleSection = ({ title, children }: { title: string; children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-[#3F3F3F] py-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-lg sm:text-xl font-semibold text-[#EFEFEF]">{title}</span>
        {isOpen ? <CaretUp size={20} /> : <CaretDown size={20} />}
      </button>
      {isOpen && <div className="mt-2">{children}</div>}
    </div>
  );
};

// Function to split markdown into sections by h2 headings
const splitMarkdownIntoSections = (markdown: string) => {
  const lines = markdown.split('\n');
  const sections: { heading: string; content: string }[] = [];
  
  let currentHeading = '';
  let currentContent: string[] = [];
  
  lines.forEach(line => {
    const h2Match = line.match(/^#{1,2}\s+(.+)$/);
    if (h2Match) {
      // If we already have a section, save it
      if (currentHeading) {
        sections.push({
          heading: currentHeading,
          content: currentContent.join('\n')
        });
      }
      // Start a new section
      currentHeading = h2Match[1];
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  });
  
  // Add the last section
  if (currentHeading) {
    sections.push({
      heading: currentHeading,
      content: currentContent.join('\n')
    });
  }
  
  return sections;
};

// Helper function to process reference text
const processReferenceText = (text: string) => {
  const urlMatch = text.match(/\((https?:\/\/[^\s)]+)\)/);
  const sourceText = text.replace(/\((https?:\/\/[^\s)]+)\)/, '').trim();
  
  return (
    <>
      {sourceText}
      {urlMatch && (
        <a 
          href={urlMatch[1]} 
          className="ml-1 text-[#64B5F6] hover:underline" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          [Link]
        </a>
      )}
    </>
  );
};

export default function GTMStrategyButton({
  pitch,
  company,
  problem,
  customers,
  valueProposition,
  painPoints,
  personas
}: GTMStrategyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [hoverSparkle, setHoverSparkle] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [hoverViewResults, setHoverViewResults] = useState(false);
  const [gtmStrategy, setGtmStrategy] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [sections, setSections] = useState<{ heading: string; content: string }[]>([]);

  // Process the markdown when gtmStrategy changes
  useEffect(() => {
    if (gtmStrategy) {
      const processedSections = splitMarkdownIntoSections(gtmStrategy);
      console.log('Processed sections:', processedSections);
      setSections(processedSections);
    }
  }, [gtmStrategy]);

  const handleGenerateGTMStrategy = async () => {
    if (generated) {
      setModalOpen(true);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/generate-gtm-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pitch, 
          company, 
          problem, 
          customers,
          valueProposition,
          painPoints,
          personas
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate GTM strategy');
      }
      
      const data = await response.json();
      setGtmStrategy(data.gtmStrategy);
      setGenerated(true);
      setModalOpen(true);
    } catch (error) {
      console.error('Error generating GTM strategy:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <motion.div className="w-full" whileTap={{ scale: 0.95 }}>
        <Button
          onMouseEnter={() => generated ? setHoverViewResults(true) : setHoverSparkle(true)}
          onMouseLeave={() => generated ? setHoverViewResults(false) : setHoverSparkle(false)}
          onClick={handleGenerateGTMStrategy}
          className={`
            w-full
            rounded-full
            px-6
            py-2
            border
            ${generated ? 'border-[#39FF14]/70' : 'border-[#39FF14]'}
            bg-[#1C1C1C]
            ${generated ? 'text-[#39FF14]/80' : 'text-[#39FF14]'}
            ${generated ? 'hover:bg-[#39FF14]/20' : 'hover:bg-[#39FF14]/30'}
            hover:border-[#39FF14]
            transition-colors
            duration-200
            flex
            items-center
            justify-center
            mb-5
          `}
        >
          {loading ? (
            <span className="flex items-center">
              <Spinner size={20} className="mr-2 animate-spin" />
              Generating strategy...
            </span>
          ) : generated ? (
            <span className="flex items-center">
              <Eye
                size={28}
                weight={hoverViewResults ? 'fill' : 'bold'}
                className="mr-2"
              />
              View GTM Strategy
            </span>
          ) : (
            <span className="flex items-center">
              <Sparkle
                size={32}
                weight={hoverSparkle ? 'fill' : 'bold'}
                className="mr-2"
              />
              Generate Detailed GTM Strategy
            </span>
          )}
        </Button>
      </motion.div>
      
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#1C1C1C] border-[#3F3F3F] text-[#EFEFEF] p-4 rounded-lg sm:max-w-lg md:max-w-3xl lg:max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-center">
              <DialogTitle className="text-xl font-bold text-[#EFEFEF]">
                Go-To-Market Strategy
              </DialogTitle>
            </div>
          </DialogHeader>
          
          <div className="pt-2 pb-2">
            {gtmStrategy ? (
              <Card className="border border-[#3F3F3F] bg-[#2F2F2F] rounded-xl p-3 sm:p-4">
                <div className="prose prose-invert prose-sm max-w-none">
                  {/* Render full content */}
                  {gtmStrategy && (
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-xl sm:text-2xl font-bold text-[#EFEFEF] mt-4 mb-2">{children}</h1>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-base sm:text-lg font-medium text-[#EFEFEF] mt-3 mb-1">{children}</h3>
                        ),
                        h2: ({ children }) => {
                          if (typeof children === 'string') {
                            const text = children.toString();
                            if (/^\d+\.\s+[\*\"].*[\*\"]/.test(text)) {
                              return null;
                            }
                          }
                          return (
                            <h2 className="text-lg sm:text-xl font-semibold text-[#64B5F6] mt-6 mb-3 pb-2 border-b border-[#3F3F3F]">
                              {children}
                            </h2>
                          );
                        },
                        ul: ({ children }) => (
                          <ul className="list-disc list-outside ml-4 text-[#EFEFEF] my-2">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-outside ml-4 text-[#EFEFEF] my-2">{children}</ol>
                        ),
                        li: ({ children }) => (
                          <li className="text-sm sm:text-base text-[#EFEFEF] my-1">{children}</li>
                        ),
                        p: ({ children }) => {
                          // Process in-text citations like [1], [2], etc.
                          if (typeof children === 'string' && children.toString().includes('[') && /\[\d+\]/.test(children.toString())) {
                            // Extract citation numbers
                            const citations = Array.from(children.toString().matchAll(/\[(\d+)\](?!\()/g)).map(m => m[1]);
                            
                            if (citations.length === 0) {
                              return <p className="text-sm sm:text-base text-[#EFEFEF] my-2">{children}</p>;
                            }
                            
                            // Split the text by citations and reconstruct with clickable links
                            const parts = children.toString().split(/\[(\d+)\](?!\()/);
                            
                            return (
                              <p className="text-sm sm:text-base text-[#EFEFEF] my-2">
                                {parts.map((part, i) => {
                                  // Even indices are text, odd indices are citation numbers
                                  if (i % 2 === 0) return part;
                                  
                                  const num = part;
                                  return (
                                    <a 
                                      key={i}
                                      href={`#reference-${num}`}
                                      className="text-[#64B5F6] hover:underline cursor-pointer inline-block mx-1"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        // Try to find the reference in the document
                                        const referenceElement = document.getElementById(`reference-${num}`);
                                        if (referenceElement) {
                                          referenceElement.scrollIntoView({ behavior: 'smooth' });
                                        }
                                      }}
                                    >
                                      [{num}]
                                    </a>
                                  );
                                })}
                              </p>
                            );
                          }
                          
                          // Handle normal paragraphs
                          return <p className="text-sm sm:text-base text-[#EFEFEF] my-2">{children}</p>;
                        },
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-4">
                            <table className="min-w-full border-collapse border border-[#3F3F3F]">
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({ children }) => <thead className="bg-[#2A2A2A]">{children}</thead>,
                        tbody: ({ children }) => <tbody>{children}</tbody>,
                        tr: ({ children }) => <tr className="border-b border-[#3F3F3F]">{children}</tr>,
                        th: ({ children }) => (
                          <th className="px-4 py-2 text-left text-sm font-semibold text-[#EFEFEF] border-r border-[#3F3F3F] last:border-r-0">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="px-4 py-2 text-sm text-[#EFEFEF] border-r border-[#3F3F3F] last:border-r-0">
                            {children}
                          </td>
                        ),
                        code: ({ children, className }) => {
                          if (typeof children === 'string' && children.includes('|')) {
                            const lines = children.split('\n').filter(line => line.trim());
                            if (lines.length > 0 && lines[0].includes('|')) {
                              return (
                                <div className="overflow-x-auto my-4">
                                  <table className="min-w-full border-collapse border border-[#3F3F3F]">
                                    <tbody>
                                      {lines.map((line, i) => (
                                        <tr key={i} className="border-b border-[#3F3F3F]">
                                          {line.split('|')
                                            .filter(cell => cell.trim())
                                            .map((cell, j) => (
                                              <td key={j} className="px-4 py-2 text-sm text-[#EFEFEF] border-r border-[#3F3F3F] last:border-r-0">
                                                {cell.trim()}
                                              </td>
                                            ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              );
                            }
                          }
                          return <code className={className}>{children}</code>;
                        },
                      }}
                    >
                      {gtmStrategy}
                    </ReactMarkdown>
                  )}
                  
                  {/* Render each section with a collapsible header */}
                  {sections.map((section, index) => (
                    <CollapsibleSection key={index} title={section.heading}>
                      <div className="ml-2">
                        <ReactMarkdown
                          components={{
                            h3: ({ children }) => (
                              <h3 className="text-base sm:text-lg font-medium text-[#EFEFEF] mt-3 mb-1">{children}</h3>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc list-outside ml-4 text-[#EFEFEF] my-2">{children}</ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal list-outside ml-4 text-[#EFEFEF] my-2">{children}</ol>
                            ),
                            li: ({ children }) => (
                              <li className="text-sm sm:text-base text-[#EFEFEF] my-1">{children}</li>
                            ),
                            p: ({ children }) => (
                              <p className="text-sm sm:text-base text-[#EFEFEF] my-2">{children}</p>
                            ),
                          }}
                        >
                          {section.content}
                        </ReactMarkdown>
                      </div>
                    </CollapsibleSection>
                  ))}
                </div>
              </Card>
            ) : (
              <div className="flex justify-center items-center p-8">
                <Spinner size={32} className="animate-spin text-[#39FF14]" />
              </div>
            )}
          </div>
          
          <div className="flex justify-center gap-2 sm:gap-4 mt-2 sm:mt-4">
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