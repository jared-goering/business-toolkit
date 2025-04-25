// NextStepsButton.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkle, Spinner, Eye } from 'phosphor-react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ReactMarkdown from 'react-markdown';
import { Card } from '@/components/ui/card';
import { useReport } from '@/context/ReportContext';

interface NextStepsButtonProps {
  pitch: string;
  company: string;
  problem: string;
  customers: string;
  valueProposition: string;
  painPoints: string[];
  personas: any[];
  initialNextSteps?: string; // pre-loaded steps if already saved
}

interface NextStep {
  number: string;
  title: string;
  description: string;
  timeframe: string;
  outcome: string;
}

// Helper function to parse next steps from markdown
const parseNextSteps = (markdown: string): NextStep[] => {
  const steps: NextStep[] = [];
  
  // Remove any title or introduction text before the numbered steps
  const contentWithoutIntro = markdown.replace(/^(#[^#]+|\n)*/, '').trim();

  // Regular expressions to identify sections with more flexible patterns
  const sectionRegex = /\s*(\d+)[\.:\)]\s+([^\n]+)(?:\n|$)([\s\S]*?)(?=\s*\d+[\.:\)]\s+|\s*$)/g;
  
  // More flexible regex patterns for section content
  const descRegex = /(?:^|\n)(?:Description|Details?|About|Step details?)[:\s-]*\s*([\s\S]*?)(?=\s*(?:Timeframe|Timeline|Duration|Time|When|Period)|$)/i;
  const timeframeRegex = /(?:^|\n)(?:Timeframe|Timeline|Duration|Time|When|Period)[:\s-]*\s*([\s\S]*?)(?=\s*(?:Expected Outcome|Outcome|Result|Deliverables?|Output)|$)/i;
  const outcomeRegex = /(?:^|\n)(?:Expected Outcome|Outcome|Result|Deliverables?|Output)[:\s-]*\s*([\s\S]*?)(?=$)/i;

  // If no numbered sections are found, try to identify sections by headers
  if (!sectionRegex.test(contentWithoutIntro)) {
    // Try to find sections by markdown headers (##, ###)
    const headerSectionRegex = /(?:^|\n)(#+)\s+([^\n]+)(?:\n)([\s\S]*?)(?=\n#+\s+|\s*$)/g;
    let headerMatch;
    let sectionCounter = 1;
    
    while ((headerMatch = headerSectionRegex.exec(markdown)) !== null) {
      const title = headerMatch[2].trim();
      const content = headerMatch[3].trim();
      
      // Try to extract description, timeframe, and outcome
      const descMatch = content.match(descRegex);
      const timeframeMatch = content.match(timeframeRegex);
      const outcomeMatch = content.match(outcomeRegex);
      
      steps.push({
        number: String(sectionCounter++),
        title,
        description: descMatch ? descMatch[1].trim() : content, // Use full content if no specific sections found
        timeframe: timeframeMatch ? timeframeMatch[1].trim() : '',
        outcome: outcomeMatch ? outcomeMatch[1].trim() : ''
      });
    }
    
    // If steps were found using headers, return them
    if (steps.length > 0) {
      return steps;
    }
  }

  // Reset sectionRegex lastIndex to start from the beginning
  sectionRegex.lastIndex = 0;
  
  let match;
  while ((match = sectionRegex.exec(contentWithoutIntro)) !== null) {
    const number = match[1];
    const title = match[2].trim();
    const content = match[3].trim();
    
    // Try to extract description, timeframe, and outcome from content
    const descMatch = content.match(descRegex);
    const timeframeMatch = content.match(timeframeRegex);
    const outcomeMatch = content.match(outcomeRegex);
    
    // If we can't find structured content, try to identify bullet points or paragraphs
    let description = '';
    let timeframe = '';
    let outcome = '';
    
    if (descMatch) {
      description = descMatch[1].trim();
    } else if (content.includes('•') || content.includes('-') || content.includes('*')) {
      // Try to extract content from bullet points
      description = content;
    } else {
      // Just use the whole content as description
      description = content;
    }
    
    if (timeframeMatch) {
      timeframe = timeframeMatch[1].trim();
    } else {
      // Try to find timeframe using regex for common patterns like "Week 1-2"
      const timePatterns = /((?:Week|Month|Day)s?\s+\d+(?:-\d+)?)/gi;
      const foundTime = content.match(timePatterns);
      if (foundTime) {
        timeframe = foundTime[0];
      }
    }
    
    if (outcomeMatch) {
      outcome = outcomeMatch[1].trim();
    }
    
    steps.push({
      number,
      title,
      description,
      timeframe,
      outcome
    });
  }
  
  // If no steps found with the sectionRegex, try to find any structured content
  if (steps.length === 0) {
    // Look for any content with bullet points
    const bulletSections = contentWithoutIntro.split(/\n\s*[\*\-•]\s+/).filter(Boolean);
    
    if (bulletSections.length > 0) {
      bulletSections.forEach((section, index) => {
        const firstLine = section.split('\n')[0].trim();
        const restContent = section.split('\n').slice(1).join('\n').trim();
        
        steps.push({
          number: String(index + 1),
          title: firstLine,
          description: restContent || firstLine,
          timeframe: '',
          outcome: ''
        });
      });
    } else {
      // As a last resort, just display the entire content
      steps.push({
        number: "1",
        title: "Next Steps",
        description: markdown.trim(),
        timeframe: '',
        outcome: ''
      });
    }
  }
  
  return steps;
};

// Component for handling source links specifically
const SourceLink = ({ text }: { text: string }) => {
  // Enhanced regex to find URLs in various formats
  const urlRegex = /(https?:\/\/[^\s)]+)(?:\)?|\s|$)/g;
  const matches = Array.from(text.matchAll(urlRegex));
  
  if (!matches || matches.length === 0) {
    return <>{text}</>;
  }
  
  let lastIndex = 0;
  const parts = [];
  
  matches.forEach((match, i) => {
    const url = match[1];
    const fullMatchStart = match.index!;
    const fullMatchEnd = match.index! + match[0].length;
    
    // Add text before the URL
    if (fullMatchStart > lastIndex) {
      parts.push(text.substring(lastIndex, fullMatchStart));
    }
    
    // Use the actual URL as the link text
    parts.push(
      <a 
        key={i}
        href={url} 
        data-href={url}
        className="text-[#64B5F6] hover:text-[#9EE7FF] underline px-1 py-0.5 rounded hover:bg-[#333] cursor-pointer break-all z-[1] inline-block relative" 
        target="_blank" 
        rel="noopener noreferrer"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          window.open(url, '_blank', 'noopener,noreferrer');
          return false;
        }}
      >
        {url}
      </a>
    );
    
    // Skip the closing parenthesis if the URL was wrapped in parentheses
    lastIndex = fullMatchEnd - (text.charAt(fullMatchEnd - 1) === ')' ? 1 : 0);
  });
  
  // Add any remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return <>{parts}</>;
};

// Component for rendering sources section
const SourcesSection = ({ content }: { content: string }) => {
  const sourceLines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  return (
    <div id="sources-cited" className="mt-2 space-y-2">
      {sourceLines.map((line, i) => {
        // Look for numbered citation patterns like [1], [2], etc.
        const citationMatch = line.match(/^\s*\[(\d+)\]\s*(.*)$/);
        
        if (citationMatch) {
          const num = citationMatch[1];
          const citationText = citationMatch[2];
          
          return (
            <div 
              key={i}
              id={`sources-cited-${num}`} 
              className="flex mb-2 text-[15px]"
            >
              <span className="text-[#64B5F6] mr-2 min-w-[30px]">[{num}]</span>
              <span className="text-[#EFEFEF]">
                <SourceLink text={citationText} />
              </span>
            </div>
          );
        }
        
        // Fallback for other formats
        return (
          <div key={i} className="mb-2 text-[15px] text-[#EFEFEF]">
            <SourceLink text={line} />
          </div>
        );
      })}
    </div>
  );
};

export default function NextStepsButton({
  pitch,
  company,
  problem,
  customers,
  valueProposition,
  painPoints,
  personas,
  initialNextSteps,
}: NextStepsButtonProps) {
  const { setField } = useReport();
  const [loading, setLoading] = useState(false);
  const [hoverSparkle, setHoverSparkle] = useState(false);
  const [nextSteps, setNextSteps] = useState<string>(initialNextSteps || '');
  const [generated, setGenerated] = useState<boolean>(!!initialNextSteps);
  const [hoverViewResults, setHoverViewResults] = useState(false);
  const [parsedSteps, setParsedSteps] = useState<NextStep[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingText, setLoadingText] = useState<string>("Thinking...");
  const [nextLoadingText, setNextLoadingText] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState(false);

  // Process next steps content when it changes
  useEffect(() => {
    if (nextSteps) {
      const steps = parseNextSteps(nextSteps);
      setParsedSteps(steps);
    }
  }, [nextSteps]);

  // Rotating loading text with rolodex animation
  useEffect(() => {
    if (!loading) return;
    
    const loadingTexts = [
      "Thinking...",
      "Brainstorming...",
      "This could take some time...",
      "Prioritizing tasks...",
      "Planning your roadmap..."
    ];
    
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      // Set the next text but don't update current text yet
      currentIndex = (currentIndex + 1) % loadingTexts.length;
      setNextLoadingText(loadingTexts[currentIndex]);
      
      // Trigger animation
      setIsAnimating(true);
      
      // After animation completes, update the current text and reset position without animation
      setTimeout(() => {
        setLoadingText(loadingTexts[currentIndex]);
        setIsAnimating(false);
      }, 400); // Animation duration
    }, 2500);
    
    return () => clearInterval(intervalId);
  }, [loading]);

  const handleIdeateNextSteps = async () => {
    if (generated) {
      setModalOpen(true);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/ideate-next-steps', {
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
        throw new Error('Failed to generate next steps');
      }
      
      const data = await response.json();
      setNextSteps(data.nextSteps);
      setField('nextSteps', data.nextSteps);
      setGenerated(true);
      setModalOpen(true);
    } catch (error) {
      console.error('Error generating next steps:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to render the content with highlighted timeframes
  const renderWithHighlightedTimeframes = (text: string) => {
    if (!text) return null;
    
    const timeFrameRegex = /(Week \d+(-\d+)?|Month \d+(-\d+)?|Day \d+(-\d+)?)/g;
    const parts = text.split(timeFrameRegex);
    
    return parts.map((part, i) => {
      if (timeFrameRegex.test(part)) {
        return <span key={i} className="text-[#FFA500] font-medium">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  // Helper function to render markdown content
  const renderMarkdown = (content: string) => {
    return (
      <ReactMarkdown
        components={{
          p: ({ children }: any) => <span className="block mb-2">{children}</span>,
          strong: ({ children }: any) => <span className="font-semibold">{children}</span>,
          em: ({ children }: any) => <span className="text-[#B39DDB] not-italic font-medium">{children}</span>,
          ul: ({ children }: any) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
          ol: ({ children }: any) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
          li: ({ node, children, ...props }: any) => {
            // Content of list item as string for analysis
            const content = typeof children === 'string' ? children : 
                           (Array.isArray(children) ? children.join('') : '');
            
            // Special handling for list items containing URLs
            if (content && (content.includes('http://') || content.includes('https://'))) {
              return (
                <li className="text-sm sm:text-base text-[#EFEFEF] my-0.5" {...props}>
                  <SourceLink text={content} />
                </li>
              );
            }
            
            // Default rendering for other list items
            return <li className="text-sm sm:text-base text-[#EFEFEF] my-0.5" {...props}>{children}</li>;
          },
          h1: ({ children }: any) => <h1 className="text-xl font-bold mb-3 text-[#64B5F6]">{children}</h1>,
          h2: ({ children }: any) => {
            if (typeof children === 'string' && (children as string).includes('Sources Cited')) {
              return (
                <h2 id="sources-cited" className="text-lg font-bold mb-2 text-[#64B5F6]">{children}</h2>
              );
            }
            return <h2 className="text-lg font-bold mb-2 text-[#64B5F6]">{children}</h2>;
          },
          h3: ({ children }: any) => <h3 className="text-md font-bold mb-2 text-[#64B5F6]">{children}</h3>,
          a: ({ href, children, ...props }: any) => {
            // Check if it's a citation link (typically formatted as [1], [2], etc.)
            const isCitation = typeof children === 'string' && /^\[\d+\]$/.test(children as string);
            
            if (isCitation) {
              const citationNumber = (children as string).replace(/[\[\]]/g, '');
              return (
                <a
                  href={`#sources-cited-${citationNumber}`}
                  className="text-[#64B5F6] hover:text-[#9EE7FF] underline px-1 py-0.5 rounded hover:bg-[#333] cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const element = document.getElementById(`sources-cited-${citationNumber}`);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  {...props}
                >
                  {children}
                </a>
              );
            }
            
            // For regular links
            if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
              return (
                <a
                  href={href}
                  className="text-[#64B5F6] hover:text-[#9EE7FF] underline px-1 py-0.5 rounded hover:bg-[#333] cursor-pointer"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(href, '_blank', 'noopener,noreferrer');
                    return false;
                  }}
                  {...props}
                >
                  {children}
                </a>
              );
            }
            
            // Default link rendering
            return (
              <a
                href={href}
                className="text-[#64B5F6] hover:text-[#9EE7FF] underline px-1 py-0.5 rounded hover:bg-[#333] cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (href?.startsWith('#')) {
                    const elementId = href.substring(1);
                    const element = document.getElementById(elementId);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
                {...props}
              >
                {children}
              </a>
            );
          },
          blockquote: ({ children }: any) => (
            <blockquote className="border-l-4 border-[#39FF14]/50 pl-4 py-1 my-2 bg-black/20 rounded-r">
              {children}
            </blockquote>
          ),
          code: ({ children }: any) => (
            <code className="bg-black/30 px-1 py-0.5 rounded text-[#FF5722] font-mono text-sm">
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  return (
    <div className="w-full flex flex-col items-center">
      <motion.div className="w-full" whileTap={{ scale: 0.95 }}>
    <Button
          onMouseEnter={() => generated ? setHoverViewResults(true) : setHoverSparkle(true)}
          onMouseLeave={() => generated ? setHoverViewResults(false) : setHoverSparkle(false)}
          onClick={handleIdeateNextSteps}
          className={`
            w-full
            rounded-full
            px-6
            py-3
            h-[52px]
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
          `}
        >
          {loading ? (
            <span className="flex items-center">
              <Spinner size={20} className="mr-2 animate-spin" />
              <div className="min-w-[180px] h-6 overflow-hidden relative">
                <div 
                  className={`flex flex-col ${
                    isAnimating 
                      ? "transform -translate-y-6 transition-transform duration-[400ms] ease-in-out" 
                      : "transform translate-y-0 transition-none"
                  }`}
                >
                  <span className="text-center h-6 flex items-center justify-center">{loadingText}</span>
                  <span className="text-center h-6 flex items-center justify-center">{nextLoadingText}</span>
                </div>
              </div>
            </span>
          ) : generated ? (
            <span className="flex items-center">
              <Eye
                size={28}
                weight={hoverViewResults ? 'fill' : 'bold'}
                className="mr-2"
              />
              View Next Steps
            </span>
          ) : (
            <span className="flex items-center">
              <Sparkle
                size={32}
                weight={hoverSparkle ? 'fill' : 'bold'}
                className="mr-2"
              />
              Ideate Next Steps
            </span>
          )}
        </Button>
      </motion.div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="dialog-content bg-[#1C1C1C] border-[#3F3F3F] text-[#EFEFEF] p-4 rounded-lg sm:max-w-lg md:max-w-3xl lg:max-w-5xl max-h-[80vh] overflow-y-auto pointer-events-auto"
          onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <div className="flex items-center justify-center">
              <DialogTitle className="text-xl font-bold text-[#EFEFEF]">
                Next Steps
              </DialogTitle>
            </div>
          </DialogHeader>
          
          <div className="pt-2 pb-2">
            {nextSteps ? (
              <>
                {/* Display full title if any */}
                {nextSteps.startsWith('#') && (
                  <h1 className="text-xl sm:text-2xl font-bold text-[#EFEFEF] mt-2 mb-4 text-center">
                    {nextSteps.split('\n')[0].replace(/^#\s+/, '')}
                  </h1>
                )}
                
                {/* Display each step as a separate card if steps exist */}
                {parsedSteps.length > 0 ? (
                  <div className="space-y-4">
                    {parsedSteps.map((step, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className="border border-[#3F3F3F] bg-[#2F2F2F] rounded-xl p-3 sm:p-4 overflow-hidden relative">
                          {/* Step number badge */}
                          <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-[#39FF14]/20 border border-[#39FF14]/40 flex items-center justify-center">
                            <span className="text-[#39FF14] font-semibold">{step.number}</span>
                          </div>
                          
                          {/* Content with left padding for the badge */}
                          <div className="ml-10">
                            {/* Title */}
                            <h3 className="text-lg sm:text-xl font-semibold text-[#64B5F6] mb-3">
                              {step.title}
                            </h3>
                            
                            {/* Description */}
                            <div className="mb-3">
                              <p className="text-sm font-medium text-[#81C784] mb-1">Description:</p>
                              <div className="text-sm sm:text-base text-[#EFEFEF]">
                                {renderMarkdown(step.description)}
                              </div>
                            </div>
                            
                            {/* Timeframe - only show if timeframe exists */}
                            {step.timeframe && (
                              <div className="mb-3">
                                <p className="text-sm font-medium text-[#81C784] mb-1">Timeframe:</p>
                                <div className="text-sm sm:text-base text-[#EFEFEF]">
                                  {step.timeframe && step.timeframe.includes('**') 
                                    ? renderMarkdown(step.timeframe)
                                    : renderWithHighlightedTimeframes(step.timeframe)}
                                </div>
                              </div>
                            )}
                            
                            {/* Expected Outcome - only show if outcome exists */}
                            {step.outcome && (
                              <div>
                                <p className="text-sm font-medium text-[#81C784] mb-1">Expected Outcome:</p>
                                <div className="text-sm sm:text-base text-[#EFEFEF]">
                                  {renderMarkdown(step.outcome)}
                                </div>
                              </div>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  // Fallback: Display full markdown content directly if no structured steps were detected
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border border-[#3F3F3F] bg-[#2F2F2F] rounded-xl p-4 overflow-hidden">
                      <div className="text-[#EFEFEF] next-steps-content">
                        {nextSteps.includes('Sources Cited') ? (
                          <>
                            {/* Split the content at Sources Cited and render differently */}
                            {nextSteps.split(/## Sources Cited/i).map((section, idx) => (
                              <div key={idx}>
                                {idx === 0 ? (
                                  renderMarkdown(section) // Regular content
                                ) : (
                                  <>
                                    <h2 id="sources-cited" className="text-lg font-bold mb-2 text-[#64B5F6]">Sources Cited</h2>
                                    <SourcesSection content={section} />
                                  </>
                                )}
                              </div>
                            ))}
                          </>
                        ) : (
                          renderMarkdown(nextSteps)
                        )}
                      </div>
                    </Card>
                  </motion.div>
                )}
              </>
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