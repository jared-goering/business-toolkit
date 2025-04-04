'use client';

import React, { useState, ReactNode, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkle, Spinner, Eye, CaretDown, CaretUp } from 'phosphor-react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ReactMarkdown from 'react-markdown';
import { Card } from '@/components/ui/card';

interface CompetitorReportButtonProps {
  pitch: string;
  company: string;
  problem: string;
  customers: string;
  valueProposition: string;
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

export default function CompetitorReportButton({
  pitch,
  company,
  problem,
  customers,
  valueProposition
}: CompetitorReportButtonProps) {
  // Helper function to process citation text
  const processCitationText = (text: string) => {
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

  const [loading, setLoading] = useState(false);
  const [hoverSparkle, setHoverSparkle] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [hoverViewResults, setHoverViewResults] = useState(false);
  const [competitorReport, setCompetitorReport] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [sections, setSections] = useState<{ heading: string; content: string }[]>([]);

  // Process the markdown when competitorReport changes
  useEffect(() => {
    if (competitorReport) {
      const processedSections = splitMarkdownIntoSections(competitorReport);
      setSections(processedSections);
    }
  }, [competitorReport]);

  const handleGenerateCompetitorReport = async () => {
    if (generated) {
      setModalOpen(true);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/generate-competitor-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pitch, 
          company, 
          problem, 
          customers,
          valueProposition
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate competitor report');
      }
      
      const data = await response.json();
      setCompetitorReport(data.competitorReport);
      setGenerated(true);
      setModalOpen(true);
    } catch (error) {
      console.error('Error generating competitor report:', error);
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
          onClick={handleGenerateCompetitorReport}
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
              Generating report...
            </span>
          ) : generated ? (
            <span className="flex items-center">
              <Eye
                size={28}
                weight={hoverViewResults ? 'fill' : 'bold'}
                className="mr-2"
              />
              View Competitor Report
            </span>
          ) : (
            <span className="flex items-center">
              <Sparkle
                size={32}
                weight={hoverSparkle ? 'fill' : 'bold'}
                className="mr-2"
              />
              Generate Competitor Report
            </span>
          )}
        </Button>
      </motion.div>
      
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#1C1C1C] border-[#3F3F3F] text-[#EFEFEF] p-4 rounded-lg sm:max-w-lg md:max-w-3xl lg:max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-center">
              <DialogTitle className="text-xl font-bold text-[#EFEFEF]">
                Competitor Analysis Report
              </DialogTitle>
            </div>
          </DialogHeader>
          
          <div className="pt-2 pb-2">
            {competitorReport ? (
              <Card className="border border-[#3F3F3F] bg-[#2F2F2F] rounded-xl p-3 sm:p-4">
                <div className="prose prose-invert prose-sm max-w-none">
                  {/* Render full content */}
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-xl sm:text-2xl font-bold text-[#EFEFEF] mt-4 mb-2">{children}</h1>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-base sm:text-lg font-medium text-[#EFEFEF] mt-3 mb-1">{children}</h3>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-outside ml-4 text-[#EFEFEF] my-2">{children}</ul>
                      ),
                      ol: ({ children }) => {
                        // Check if it's the sources list
                        const listItems = React.Children.toArray(children);
                        const isSources = listItems.some(
                          child => React.isValidElement(child) && 
                                   (child as any).props?.children &&
                                   typeof (child as any).props.children === 'string' && 
                                   ((child as any).props.children.includes('Health') || 
                                    (child as any).props.children.includes('Research') ||
                                    (child as any).props.children.includes('Launch'))
                        );
                        
                        if (isSources) {
                          return (
                            <ol id="sources-cited" className="list-decimal list-outside ml-4 text-[#AFAFAF] my-2 space-y-1.5">
                              {React.Children.map(children, (child, idx) => {
                                if (React.isValidElement(child)) {
                                  return (
                                    <li id={`sources-cited-${idx+1}`} className="text-sm sm:text-base text-[#AFAFAF] my-1">
                                      {processCitationText(String((child as any).props.children))}
                                    </li>
                                  );
                                }
                                return child;
                              })}
                            </ol>
                          );
                        }
                        return <ol className="list-decimal list-outside ml-4 text-[#EFEFEF] my-2">{children}</ol>;
                      },
                      li: ({ children }) => {
                        return <li className="text-sm sm:text-base text-[#EFEFEF] my-1">{children}</li>;
                      },
                      p: ({ children }) => {
                        if (typeof children === 'string' && 
                            (children.toString().startsWith('Sources Cited:') || 
                             children.toString().startsWith('[') && /\[\d+\]/.test(children.toString()))) {
                          // Extract citation numbers
                          const citations = Array.from(children.toString().matchAll(/\[(\d+)\](?!\()/g)).map(m => m[1]);
                          
                          if (citations.length === 0) {
                            return <p className="text-sm text-[#AFAFAF] mt-4">{children}</p>;
                          }
                          
                          // Split the text by citations and reconstruct with clickable links
                          const parts = children.toString().split(/\[(\d+)\](?!\()/);
                          
                          return (
                            <p className="text-sm text-[#AFAFAF] mt-4">
                              {parts.map((part, i) => {
                                // Even indices are text, odd indices are citation numbers
                                if (i % 2 === 0) return part;
                                
                                const num = part;
                                return (
                                  <a 
                                    key={i}
                                    href={`#sources-cited-${num}`}
                                    className="text-[#64B5F6] hover:underline cursor-pointer inline-block mx-1"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      document.getElementById(`sources-cited-${num}`)?.scrollIntoView({behavior: 'smooth'});
                                    }}
                                  >
                                    [{num}]
                                  </a>
                                );
                              })}
                            </p>
                          );
                        }
                        // Process in-text citations
                        if (typeof children === 'string' && children.toString().includes('[') && /\[\d+\]/.test(children.toString())) {
                          // Extract citation numbers
                          const citations = Array.from(children.toString().matchAll(/\[(\d+)\](?!\()/g)).map(m => m[1]);
                          
                          if (citations.length === 0) {
                            return <p className="my-2 text-[#EFEFEF]">{children}</p>;
                          }
                          
                          // Split the text by citations and reconstruct with clickable links
                          const parts = children.toString().split(/\[(\d+)\](?!\()/);
                          
                          return (
                            <p className="my-2 text-[#EFEFEF]">
                              {parts.map((part, i) => {
                                // Even indices are text, odd indices are citation numbers
                                if (i % 2 === 0) return part;
                                
                                const num = part;
                                return (
                                  <a 
                                    key={i}
                                    href={`#sources-cited-${num}`}
                                    className="text-[#64B5F6] hover:underline cursor-pointer inline-block mx-1"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      document.getElementById(`sources-cited-${num}`)?.scrollIntoView({behavior: 'smooth'});
                                    }}
                                  >
                                    [{num}]
                                  </a>
                                );
                              })}
                            </p>
                          );
                        }
                        // Handle comparison table title
                        if (typeof children === 'string' && children.toString().includes('Competitor Comparison Table')) {
                          return (
                            <p className="text-lg font-semibold text-[#64B5F6] mt-4 mb-2">{children}</p>
                          );
                        }
                        return <p className="my-2 text-[#EFEFEF]">{children}</p>;
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
                                  <thead className="bg-[#2A2A2A]">
                                    <tr>
                                      {lines[0].split('|')
                                        .filter(cell => cell.trim())
                                        .map((cell, j) => (
                                          <th key={j} className="px-4 py-2 text-left text-sm font-semibold text-[#EFEFEF] border-r border-[#3F3F3F] last:border-r-0">
                                            {cell.trim()}
                                          </th>
                                        ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {lines.slice(1).map((line, i) => (
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
                        // Special handling for market positioning maps or diagrams
                        if (typeof children === 'string' && 
                            (children.includes('Market Positioning') || 
                             children.includes('Positioning Map') ||
                             (children.includes('High') && children.includes('Low') && 
                              (children.includes('Personalization') || children.includes('Integration'))))) {
                          // Parse the map content to identify key elements
                          const lines = children.split('\n').filter(line => line.trim());
                          
                          // Find axes labels
                          const xAxisMatch = lines.find(line => 
                            (line.toLowerCase().includes('low') && 
                             line.toLowerCase().includes('high') && 
                             !line.includes('|')) ||
                            (line.toLowerCase().includes('broad') &&
                             line.toLowerCase().includes('narrow'))
                          );
                          
                          const yAxisLabel = lines[0]?.trim() || 'Value';
                          
                          return (
                            <div className="bg-gradient-to-br from-[#2F405A] to-[#1F2D40] p-4 rounded-lg my-4 border border-[#4B5563] shadow-inner">
                              <h4 className="text-[#64B5F6] font-medium mb-3">Market Positioning Map</h4>
                              <div className="text-[#EFEFEF]">
                                <div className="text-[#81C784] font-medium mb-2">{yAxisLabel}</div>
                                <div className="bg-gradient-to-br from-[#3A4B61] to-[#2C3A4D] p-3 rounded border border-[#4B5563] overflow-x-auto">
                                  {lines.map((line, i) => {
                                    // Skip the first line (already used as yAxisLabel) and axis labels
                                    if (i === 0 || (xAxisMatch && line === xAxisMatch)) return null;
                                    
                                    // Highlight the startup's position
                                    const isStartupLine = line.includes("Your Startup") || 
                                                         line.includes("AI-Powered Health Coach") ||
                                                         line.includes("*AI Health Coach");
                                    
                                    // Check if line contains asterisks (indicates competitor)
                                    const hasAsterisks = line.includes('*');
                                    
                                    // Style different parts of the map
                                    return (
                                      <div 
                                        key={i} 
                                        className={`py-1 px-2 font-mono ${
                                          line.includes('|') 
                                            ? (isStartupLine 
                                               ? "text-[#F7FAFC] bg-[#2C5282]/30 rounded my-1" 
                                               : "text-[#CBD5E0]") 
                                            : hasAsterisks
                                                ? "text-[#BCD9FF] font-medium"
                                                : "text-[#A0AEC0] font-medium"
                                        }`}
                                      >
                                        {line}
                                      </div>
                                    );
                                  })}
                                </div>
                                {xAxisMatch && (
                                  <div className="flex justify-between text-[#A0AEC0] text-sm mt-2 px-2">
                                    {xAxisMatch.includes('---')
                                      ? xAxisMatch.split('---').map((part, i) => 
                                          <span key={i} className="italic">{part.trim()}</span>
                                        )
                                      : xAxisMatch.includes('→')
                                        ? xAxisMatch.split('→').map((part, i) => 
                                            <span key={i} className="italic">{part.trim()}</span>
                                          )
                                        : (
                                          <>
                                            <span className="italic">{xAxisMatch}</span>
                                          </>
                                        )
                                    }
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                        return <code className={className}>{children}</code>;
                      },
                      h2: ({ children }) => {
                        if (typeof children === 'string' && children.toString().includes('Sources Cited')) {
                          return (
                            <h2 id="sources-cited" className="text-lg sm:text-xl font-semibold text-[#64B5F6] mt-6 mb-3 pb-2 border-b border-[#3F3F3F]">
                              {children}
                            </h2>
                          );
                        }
                        return (
                          <h2 className="text-lg sm:text-xl font-semibold text-[#64B5F6] mt-6 mb-3 pb-2 border-b border-[#3F3F3F]">
                            {children}
                          </h2>
                        );
                      },
                      strong: ({ children }) => {
                        // Check for #### competitor headings
                        if (typeof children === 'string') {
                          // Remove #### prefix if it exists
                          const text = children.toString().replace(/^#{1,4}\s*/, '');
                        
                          if (text.includes('Health') || 
                              text.includes('Care') || 
                              text.includes('Medical') ||
                              text.includes('AI') ||
                              text.includes('System')) {
                            return (
                              <strong className="text-[#81C784] font-semibold">{text}</strong>
                            );
                          }
                          
                          return <strong className="font-semibold text-[#EFEFEF]">{text}</strong>;
                        }
                        return <strong className="font-semibold text-[#EFEFEF]">{children}</strong>;
                      },
                      em: ({ children }) => {
                        if (typeof children === 'string' && children.includes('%')) {
                          return (
                            <em className="text-[#FFC107] not-italic font-medium">{children}</em>
                          );
                        }
                        return <em className="italic text-[#EFEFEF]">{children}</em>;
                      },
                      h4: ({ children }) => {
                        if (typeof children === 'string' && 
                            children.toString().includes('Sources Cited')) {
                          return (
                            <h4 className="text-base font-medium text-[#AFAFAF] mt-6 mb-2 border-t border-[#3F3F3F] pt-4">
                              {children}
                            </h4>
                          );
                        }
                        return <h4 className="text-base font-medium text-[#EFEFEF] my-2">{children}</h4>;
                      },
                      a: ({ href, children }) => {
                        // If the link text is a number in brackets like [1], [2], etc.
                        if (typeof children === 'string' && /^\[\d+\]$/.test(children.toString())) {
                          const sourceNumber = children.toString().match(/\[(\d+)\]/)?.[1];
                          return (
                            <a 
                              href={`#sources-cited-${sourceNumber}`}
                              className="text-[#64B5F6] hover:underline cursor-pointer inline-block mx-1"
                              onClick={(e) => {
                                e.preventDefault();
                                // Scroll to the references section
                                const element = document.getElementById(`sources-cited-${sourceNumber}`);
                                if (element) element.scrollIntoView({ behavior: 'smooth' });
                              }}
                            >
                              {children}
                            </a>
                          );
                        }
                        // Handle links in the sources section
                        if (href && href.startsWith('http')) {
                          return (
                            <a 
                              href={href} 
                              className="text-[#64B5F6] hover:underline" 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              {children}
                            </a>
                          );
                        }
                        return (
                          <a href={href} className="text-[#64B5F6] hover:underline" target="_blank" rel="noopener noreferrer">
                            {children}
                          </a>
                        );
                      }
                    }}
                  >
                    {competitorReport}
                  </ReactMarkdown>
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