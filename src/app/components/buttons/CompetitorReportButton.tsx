'use client';

import React, { useState, ReactNode, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkle, Spinner, Eye, CaretDown, CaretUp } from 'phosphor-react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ReactMarkdown from 'react-markdown';
import { Card } from '@/components/ui/card';
import remarkGfm from 'remark-gfm';

interface CompetitorReportButtonProps {
  pitch: string;
  company: string;
  problem: string;
  customers: string;
  valueProposition: string;
}

// Function to split markdown into sections by headings
const splitMarkdownIntoSections = (markdown: string) => {
  const lines = markdown.split('\n');
  const sections: { heading: string; content: string }[] = [];

  let firstSectionFound = false;
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
      firstSectionFound = true;
    } else {
      // If we haven't found any heading yet, create a default first section
      if (!firstSectionFound && line.trim()) {
        if (!currentHeading) {
          currentHeading = 'Competitor Analysis Report';
        }
      }
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

// Helper component for rendering the Market Positioning Map
const MarketPositioningMap = ({ content, company = "" }: { content: string, company?: string }) => {
  // This component is no longer used - we're showing raw ASCII instead
  return (
    <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-5 rounded-lg my-6 border border-[#4B5563] shadow-inner">
      <h4 className="text-[#64B5F6] font-medium mb-6 text-center text-xl">
        Market Positioning Map
      </h4>
      <pre className="font-mono text-[#EFEFEF] whitespace-pre overflow-x-auto text-center p-4 leading-6">
        {content}
      </pre>
    </div>
  );
};

// Citation link component
const CitationLink = ({ num, children }: { num: string, children?: React.ReactNode }) => {
  return (
    <a 
      href={`#sources-cited-${num}`}
      className="text-[#64B5F6] hover:underline cursor-pointer inline-block mx-0.5 pointer-events-auto"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const element = document.getElementById(`sources-cited-${num}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }}
    >
      {children || `[${num}]`}
    </a>
  );
};

// Component for processing and displaying URLs in source citations
const SourceLink = ({ text }: { text: string }) => {
  // Enhanced regex to find URLs in various formats, including URLs at the end of lines
  // and URLs followed by parentheses or brackets
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
    
    // Check if URL is wrapped in parentheses
    const isWrappedInParentheses =
      text.charAt(fullMatchStart - 1) === '(' &&
      text.charAt(fullMatchEnd - 1) === ')';
    
    // Use the actual URL as the link text
    const linkText = url;
    
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
        {linkText}
      </a>
    );
    
    // Skip the closing parenthesis if the URL was wrapped in parentheses
    lastIndex = fullMatchEnd - (isWrappedInParentheses ? 1 : 0);
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

// Component for processing paragraph text with citations
const ProcessedParagraph = ({ children }: { children: React.ReactNode }) => {
  if (typeof children !== 'string') {
    return <p className="my-2 text-[#EFEFEF]">{children}</p>;
  }
  
  const text = children.toString();
  
  // Check for citations [1], [2], etc.
  if (text.includes('[') && /\[\d+\]/.test(text)) {
    const parts = text.split(/\[(\d+)\](?!\()/);
    
    return (
      <p className="my-2 text-[#EFEFEF]">
        {parts.map((part, i) => {
          // Even indices are text, odd indices are citation numbers
          if (i % 2 === 0) return part;
          return <CitationLink key={i} num={part} />;
        })}
      </p>
    );
  }
  
  // Table title
  if (text.includes('Competitor Comparison Table')) {
    return <p className="text-lg font-semibold text-[#64B5F6] mt-4 mb-2">{text}</p>;
  }
  
  return <p className="my-2 text-[#EFEFEF]">{text}</p>;
};

// Render markdown within a regular section
const RegularSection = ({ content, company }: { content: string, company: string }) => {
  // Cast the components to any to avoid TypeScript errors with ReactMarkdown's component types
  const markdownComponents: any = {
    h1: ({ children }: any) => (
      <h1 className="text-xl sm:text-2xl font-bold text-[#EFEFEF] mt-4 mb-2">{children}</h1>
    ),
    
    h2: ({ children }: any) => {
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
    
    h3: ({ children }: any) => (
      <h3 className="text-base sm:text-lg font-medium text-[#81C784] mt-3 mb-1">{children}</h3>
    ),
    
    p: ({ children }: any) => (
      <ProcessedParagraph>{children}</ProcessedParagraph>
    ),
    
    ul: ({ children }: any) => (
      <ul className="list-disc list-outside ml-4 text-[#EFEFEF] my-2">{children}</ul>
    ),
    
    ol: ({ children }: any) => (
      <ol className="list-decimal list-outside ml-4 text-[#EFEFEF] my-2">{children}</ol>
    ),
    
    li: ({ node, children, ...props }: any) => {
      // Special handling for source citations in the sources list
      if (
        props.node?.parent?.children?.[0]?.value?.includes('Sources Cited')
      ) {
        // This is likely a reference item in the sources list
        const content = typeof children === 'string' ? children : 
                       (Array.isArray(children) ? children.join('') : '');
        
        if (content && (content.includes('http') || content.includes('www.'))) {
          // Extract URL from the content
          const urlRegex = /(https?:\/\/[^\s]+)/g;
          const matches = content.match(urlRegex);
          
          if (matches && matches.length > 0) {
            const url = matches[0];
            // Split content into parts before and after URL
            const parts = content.split(url);
            
            return (
              <li id={`sources-cited-${props.index + 1}`} className="text-sm sm:text-base text-[#EFEFEF] my-0.5" {...props}>
                {parts[0]}
                <a
                  href={url}
                  className="text-[#64B5F6] hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {url}
                </a>
                {parts[1] || ''}
              </li>
            );
          }
        }
        
        // For source items without URLs or where URL extraction failed
        return (
          <li id={`sources-cited-${props.index + 1}`} className="text-sm sm:text-base text-[#EFEFEF] my-0.5" {...props}>
            {children}
          </li>
        );
      }
      
      // Default rendering for non-source list items
      return <li className="text-sm sm:text-base text-[#EFEFEF] my-0.5" {...props}>{children}</li>;
    },
    
    strong: ({ children }: any) => {
      if (!children) return null;
      
      if (typeof children !== 'string') {
        return <strong className="font-semibold text-[#EFEFEF]">{children}</strong>;
      }
      
      const text = children.toString().replace(/^#{1,4}\s*/, '');
      
      // Improved detection for company/competitor names
      // No more hardcoded checking for specific industries
      if (
        /\b(?:Inc|LLC|Ltd|GmbH|Corp|SA|SL|Company|Technologies)\b/i.test(text) || 
        text.includes(company)
      ) {
        return <strong className="text-[#81C784] font-semibold">{text}</strong>;
      }
      
      return <strong className="font-semibold text-[#EFEFEF]">{text}</strong>;
    },
    
    em: ({ children }: any) => {
      if (!children) return null;
      
      if (typeof children === 'string' && children.includes('%')) {
        return <em className="text-[#FFC107] not-italic font-medium">{children}</em>;
      }
      return <em className="italic text-[#EFEFEF]">{children}</em>;
    },
    
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border-collapse border border-[#3F3F3F]">
          {children}
        </table>
      </div>
    ),
    
    thead: ({ children }: any) => (
      <thead className="bg-[#2A2A2A]">{children}</thead>
    ),
    
    tbody: ({ children }: any) => <tbody>{children}</tbody>,
    
    tr: ({ children }: any) => (
      <tr className="border-b border-[#3F3F3F]">{children}</tr>
    ),
    
    th: ({ children }: any) => (
      <th className="px-4 py-2 text-left text-sm font-semibold text-[#EFEFEF] border-r border-[#3F3F3F] last:border-r-0">
        {children}
      </th>
    ),
    
    td: ({ children }: any) => (
      <td className="px-4 py-2 text-sm text-[#EFEFEF] border-r border-[#3F3F3F] last:border-r-0">
        {children}
      </td>
    ),
    
    code: ({ children, className }: any) => {
      if (!children) return null;
      
      const content = children.toString();
      const lines = content.split('\n').filter((line: string) => line.trim());
      
      // Improved detection for positioning maps vs tables
      const hasVerticalBars = content.includes('|');
      const hasMultipleLines = lines.length > 3;
      
      // Detect market positioning map using more precise criteria
      const isPositioningMap = 
        hasVerticalBars && 
        hasMultipleLines && 
        (content.toLowerCase().includes('market positioning map') || 
         (content.includes('High') && content.includes('Low') && content.includes('|')));
      
      // Check if this is specifically a market share analysis table
      const isMarketShareTable = 
        content.toLowerCase().includes('market share analysis') || 
        (content.toLowerCase().includes('competitor') && 
         content.toLowerCase().includes('market share') && 
         content.toLowerCase().includes('geography'));
      
      // If it's a positioning map, render it as a pre-formatted code block
      if (isPositioningMap) {
        return (
          <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-5 rounded-lg my-6 border border-[#4B5563] shadow-inner">
            <h4 className="text-[#64B5F6] font-medium mb-6 text-center text-xl">
              Market Positioning Map
            </h4>
            <pre className="font-mono text-[#EFEFEF] whitespace-pre overflow-x-auto text-center p-4 leading-6">
              {content}
            </pre>
          </div>
        );
      }
      
      // Handle tables - render these with proper HTML formatting
      if (hasVerticalBars && !isPositioningMap && (isMarketShareTable || isWellFormedTable(lines))) {
        return renderFormattedTable(lines);
      }
      
      // Fallback for other code blocks or non-well-formed tables
      if (hasVerticalBars && hasMultipleLines) {
        return (
          <pre className="bg-[#2A2A2A] p-3 rounded border border-[#3F3F3F] font-mono text-sm text-[#EFEFEF] whitespace-pre overflow-x-auto p-4 leading-5">
            {content}
          </pre>
        );
      }
      
      return <code className={className}>{children}</code>;
    },
    
    a: ({ href, children, ...props }: any) => {
      // Check if it's a citation link (typically formatted as [1], [2], etc.)
      const isCitation = typeof children === 'string' && /^\[\d+\]$/.test(children as string);
      
      if (isCitation) {
        const citationNumber = (children as string).replace(/[\[\]]/g, '');
        return (
          <a
            href={`#sources-cited-${citationNumber}`}
            data-href={`#sources-cited-${citationNumber}`}
            className="text-[#64B5F6] hover:underline cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const element = document.getElementById(`sources-cited-${citationNumber}`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
              return false;
            }}
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
            data-href={href}
            className="text-[#64B5F6] hover:underline inline-block"
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(href, '_blank');
              return false;
            }}
          >
            {children}
          </a>
        );
      }
      
      // Default link rendering
      return (
        <a
          href={href}
          data-href={href}
          className="text-[#64B5F6] hover:underline"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (href && href.startsWith('#')) {
              const targetId = href.substring(1);
              const element = document.getElementById(targetId);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }
            return false;
          }}
        >
          {children}
        </a>
      );
    }
  };
  
  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

// Main section card component
const SectionCard = ({ heading, content, company, isSources = false }: { 
  heading: string, 
  content: string, 
  company: string,
  isSources?: boolean 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="pointer-events-auto"
    >
      <Card className="border border-[#3F3F3F] bg-[#2F2F2F] rounded-xl p-3 sm:p-4 overflow-hidden pointer-events-auto">
        <h2 
          id={isSources ? "sources-cited" : undefined}
          className="text-lg sm:text-xl font-semibold text-[#64B5F6] mb-3 pb-2 border-b border-[#3F3F3F]"
        >
          {heading}
        </h2>
        
        {isSources ? (
          <div className="prose prose-invert prose-sm max-w-none text-[#AFAFAF] pointer-events-auto">
            <SourcesSection content={content} />
          </div>
        ) : (
          <div className="pointer-events-auto">
            <RegularSection content={content} company={company} />
          </div>
        )}
      </Card>
    </motion.div>
  );
};

// Loading animation component
const LoadingAnimation = ({ loadingText, nextLoadingText, isAnimating }: { 
  loadingText: string, 
  nextLoadingText: string, 
  isAnimating: boolean 
}) => {
  return (
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
  );
};

// Helper function to check if lines represent a well-formed table
const isWellFormedTable = (lines: string[]): boolean => {
  if (lines.length < 2) return false;
  
  // Check if first row looks like a header row
  const firstLine = lines[0];
  if (!firstLine.includes('|') || !firstLine.trim().startsWith('|') || !firstLine.trim().endsWith('|')) {
    return false;
  }
  
  // Check if we have a separator row and at least one data row
  return lines.length >= 3;
};

// Helper function to render a formatted HTML table
const renderFormattedTable = (lines: string[]) => {
  return (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border-collapse border border-[#3F3F3F]">
        <thead className="bg-[#2A2A2A]">
          <tr>
            {lines[0].split('|')
              .filter((cell: string) => cell.trim())
              .map((cell: string, j: number) => (
                <th key={j} className="px-4 py-2 text-left text-sm font-semibold text-[#EFEFEF] border-r border-[#3F3F3F] last:border-r-0">
                  {cell.trim()}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {lines.slice(1).map((line: string, i: number) => (
            <tr key={i} className="border-b border-[#3F3F3F]">
              {line.split('|')
                .filter((cell: string) => cell.trim())
                .map((cell: string, j: number) => (
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
};

export default function CompetitorReportButton({
  pitch,
  company,
  problem,
  customers,
  valueProposition
}: CompetitorReportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [hoverSparkle, setHoverSparkle] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [hoverViewResults, setHoverViewResults] = useState(false);
  const [competitorReport, setCompetitorReport] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [sections, setSections] = useState<{ heading: string; content: string }[]>([]);
  const [loadingText, setLoadingText] = useState<string>("Thinking...");
  const [nextLoadingText, setNextLoadingText] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState(false);

  // Process the markdown when competitorReport changes
  useEffect(() => {
    if (competitorReport) {
      const processedSections = splitMarkdownIntoSections(competitorReport);
      setSections(processedSections);
    }
  }, [competitorReport]);

  // Rotating loading text with rolodex animation
  useEffect(() => {
    if (!loading) return;

    const loadingTexts = [
      "Thinking...",
      "Scanning sources...",
      "This could take some time...",
      "Researching competitors...",
      "Analyzing market positions..."
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

  // Add effect to handle links after dialog opens
  useEffect(() => {
    if (modalOpen && competitorReport) {
      // Wait for DOM to be updated with dialog content
      setTimeout(() => {
        // Get all links in the dialog
        const links = document.querySelectorAll('.dialog-content a[href]');
        
        // Add direct click handler to each link
        links.forEach(link => {
          // Remove any existing handlers
          link.removeEventListener('click', handleLinkClick);
          
          // Add new direct handler
          link.addEventListener('click', handleLinkClick);
        });
      }, 300);
    }
    
    return () => {
      // Clean up handlers when component unmounts
      const links = document.querySelectorAll('.dialog-content a[href]');
      links.forEach(link => {
        link.removeEventListener('click', handleLinkClick);
      });
    };
  }, [modalOpen, competitorReport]);
  
  // Direct link click handler
  const handleLinkClick = (e: Event) => {
    e.stopPropagation();
    e.preventDefault();
    
    const link = e.currentTarget as HTMLAnchorElement;
    const href = link.getAttribute('href');
    
    if (href) {
      if (href.startsWith('#')) {
        // Internal link - scroll to element
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (href.startsWith('http://') || href.startsWith('https://')) {
        // External link - open in new tab
        window.open(href, '_blank', 'noopener,noreferrer');
      }
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
            <LoadingAnimation 
              loadingText={loadingText} 
              nextLoadingText={nextLoadingText} 
              isAnimating={isAnimating} 
            />
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
        <DialogContent className="dialog-content bg-[#1C1C1C] border-[#3F3F3F] text-[#EFEFEF] p-4 rounded-lg sm:max-w-lg md:max-w-3xl lg:max-w-5xl max-h-[80vh] overflow-y-auto pointer-events-auto">
          <DialogHeader>
            <div className="flex items-center justify-center">
              <DialogTitle className="text-xl font-bold text-[#EFEFEF]">
                Competitor Analysis Report
              </DialogTitle>
            </div>
          </DialogHeader>
          
          <div className="pt-2 pb-2 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
            {competitorReport ? (
              <div className="space-y-3 pointer-events-auto">
                {sections.map((section, index) => (
                  <SectionCard
                    key={index}
                    heading={section.heading}
                    content={section.content}
                    company={company}
                    isSources={section.heading.toLowerCase().includes('sources')}
                  />
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center p-8">
                <Spinner size={32} className="animate-spin text-[#FDE03B]" />
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
