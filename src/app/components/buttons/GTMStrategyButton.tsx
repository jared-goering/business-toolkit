'use client';

import React, { useState, useEffect, PropsWithChildren } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkle, Spinner, Eye } from 'phosphor-react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ReactMarkdown, { Components } from 'react-markdown';
import { Card } from '@/components/ui/card';
import remarkGfm from 'remark-gfm';
import type { Element } from 'hast';
import { splitMarkdownIntoSections, MarkdownSection } from '@/app/utils/markdownUtils';
import { useReport } from '@/context/ReportContext';
import SectionAccordion from '@/app/components/buttons/gtm-strategy/SectionAccordion';
import { splitForAccordion } from '@/app/utils/splitSections';


interface GTMStrategyButtonProps {
  pitch: string;
  company: string;
  problem: string;
  customers: string;
  valueProposition: string;
  painPoints: string[];
  personas: any[];
}

export default function GTMStrategyButton({
  pitch,
  company,
  problem,
  customers,
  valueProposition,
  painPoints,
  personas
}: GTMStrategyButtonProps) {
  const { setField } = useReport();
  const [loading, setLoading] = useState(false);
  const [hoverSparkle, setHoverSparkle] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [hoverViewResults, setHoverViewResults] = useState(false);
  const [gtmStrategy, setGtmStrategy] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [sections, setSections] = useState<MarkdownSection[]>([]);
  const [loadingText, setLoadingText] = useState<string>("Thinking...");
  const [nextLoadingText, setNextLoadingText] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState(false);

  const { titleSection, accordionSections } = splitForAccordion(sections);


  // Rotating loading text with rolodex animation
  useEffect(() => {
    if (!loading) return;
    
    const loadingTexts = [
      "Thinking...",
      "Scanning sources...",
      "This could take some time...",
      "Analyzing market data...",
      "Crafting your strategy..."
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
      setField('gtmStrategy', data.gtmStrategy);
      setSections(splitMarkdownIntoSections(data.gtmStrategy || ''));
      setGenerated(true);
      setModalOpen(true);
    } catch (error) {
      console.error('Error generating GTM strategy:', error);
    } finally {
      setLoading(false);
    }
  };

  // The custom components for ReactMarkdown
  const markdownComponents: Partial<Components> = {
    table: ({ children, ...props }: PropsWithChildren<React.TableHTMLAttributes<HTMLTableElement>>) => (
        <div className="overflow-x-auto my-4">
          <table className="min-w-full border-collapse text-sm rounded-md border border-[#4F4F4F]">
            {children}
          </table>
        </div>
      ),
      thead: ({ children, ...props }: PropsWithChildren<React.HTMLAttributes<HTMLTableSectionElement>>) => (
        <thead className="bg-[#2A2A2A] text-[#EFEFEF] font-medium">
          {children}
        </thead>
      ),
      tr: ({ children, ...props }: PropsWithChildren<React.HTMLAttributes<HTMLTableRowElement>>) => (
        <tr
          {...props}
          className="odd:bg-[#2D2D2D] even:bg-[#262626] border-b border-[#3F3F3F] last:border-b-0"
        >
          {children}
        </tr>
      ),
      th: ({ children, ...props }: PropsWithChildren<React.TdHTMLAttributes<HTMLTableCellElement>>) => (
        <th className="px-4 py-3 text-left">{children}</th>
      ),
      td: ({ children, ...props }: PropsWithChildren<React.TdHTMLAttributes<HTMLTableCellElement>>) => (
        <td className="px-4 py-3">{children}</td>
      ),
    h1: ({ children, ...props }: PropsWithChildren<React.HTMLAttributes<HTMLHeadingElement>>) => (
      <h1 className="text-[24px] mt-5 mb-3 text-[#EFEFEF] font-semibold">{children}</h1>
    ),
    h2: ({ children, ...props }: PropsWithChildren<React.HTMLAttributes<HTMLHeadingElement>>) => {
      const id = typeof children === 'string' ? children.toLowerCase().replace(/\s+/g, '-') : undefined;
      
      // Special handling for Sources Cited section
      if (typeof children === 'string' && children.includes('Sources Cited')) {
        return (
          <h2 id="sources-cited" className="text-[19px] mt-4 mb-2 text-[#EFEFEF] font-semibold border-b border-[#3F3F3F] pb-1">
            {children}
          </h2>
        );
      }
      
      return (
        <h2 id={id} className="text-[19px] mt-4 mb-2 text-[#EFEFEF] font-semibold border-b border-[#3F3F3F] pb-1">{children}</h2>
      );
    },
    h3: ({ children, ...props }: PropsWithChildren<React.HTMLAttributes<HTMLHeadingElement>>) => (
      <h3 className="text-[16px] mt-3 mb-1 text-[#EFEFEF] font-semibold">{children}</h3>
    ),
    p: ({ children, ...props }: PropsWithChildren<React.HTMLAttributes<HTMLParagraphElement>>) => {
      // Special handling for source citations that look like [1] https://example.com 
      if (typeof children === 'string') {
        const text = children.toString();
        // This regex looks for numbered citations with URLs
        const urlMatch = text.match(/^\[(\d+)\]\s+(https?:\/\/\S+)/);
        
        if (urlMatch) {
          const num = urlMatch[1];
          const url = urlMatch[2];
          return (
            <p id={`sources-cited-${num}`} className="text-[#EFEFEF] my-2 text-[15px] leading-relaxed">
              <span className="text-[#64B5F6]">[{num}]</span> 
              <a 
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-[#64B5F6] underline hover:text-[#9EE7FF] cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(url, '_blank', 'noopener,noreferrer');
                }}
              >
                {url}
              </a>
            </p>
          );
        }
        
        // Check if it might be a source citation with more context 
        // Like [1] Title of paper (https://example.com)
        const contextUrlMatch = text.match(/^\[(\d+)\]\s+(.*?)\s+(https?:\/\/\S+)/);
        if (contextUrlMatch) {
          const num = contextUrlMatch[1];
          const context = contextUrlMatch[2];
          const url = contextUrlMatch[3];
          
          return (
            <p id={`sources-cited-${num}`} className="text-[#EFEFEF] my-2 text-[15px] leading-relaxed">
              <span className="text-[#64B5F6]">[{num}]</span> {context} 
              <a 
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-[#64B5F6] underline hover:text-[#9EE7FF] cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(url, '_blank', 'noopener,noreferrer');
                }}
              >
                {url}
              </a>
            </p>
          );
        }
      }
      
      return <p className="text-[#EFEFEF] my-2 text-[15px] leading-relaxed" {...props}>{children}</p>;
    },
    ul: ({ children, ...props }: PropsWithChildren<React.HTMLAttributes<HTMLUListElement>>) => {
      return <ul className="list-disc pl-6 my-2 text-[#EFEFEF]" {...props}>{children}</ul>;
    },
    ol: ({ children, ...props }: PropsWithChildren<React.HTMLAttributes<HTMLOListElement>>) => {
      return <ol className="list-decimal pl-6 my-2 text-[#EFEFEF]" {...props}>{children}</ol>;
    },
    li: ({ children, index, node, ...props }: PropsWithChildren<{ index?: number; node?: Element } & React.LiHTMLAttributes<HTMLLIElement>>) => {
      // Special handling for source citations in list items
      if (typeof children === 'string') {
        const text = children.toString();
        const urlMatch = text.match(/^\[(\d+)\]\s+(https?:\/\/\S+)/);
        
        if (urlMatch) {
          const num = urlMatch[1];
          const url = urlMatch[2];
          return (
            <li id={`sources-cited-${num}`} className="my-1 text-[#EFEFEF]" {...props}>
              <span className="text-[#64B5F6]">[{num}]</span> 
              <a 
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-[#64B5F6] underline hover:text-[#9EE7FF] cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(url, '_blank', 'noopener,noreferrer');
                }}
              >
                {url}
              </a>
            </li>
          );
        }
      }
      
      return <li className="my-1 text-[#EFEFEF]" {...props}>{children}</li>;
    },
    a: ({ href, children, node, ...props }: PropsWithChildren<{ href?: string; node?: Element } & React.AnchorHTMLAttributes<HTMLAnchorElement>>) => {
      // Check if this is a citation link (like [1], [2], etc.)
      const isCitation = 
        typeof children === 'string' && 
        /^\[\d+\]$/.test(children as string);
      
      if (isCitation) {
        const citationNumber = (children as string).replace(/[\[\]]/g, '');
        
        return (
          <a
            id={`citation-link-${citationNumber}`}
            href={`#sources-cited-${citationNumber}`}
            className="text-[#64B5F6] hover:underline cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById(`sources-cited-${citationNumber}`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            {children}
          </a>
        );
      }
      
      // For regular links (typically http/https URLs)
      if (href?.startsWith('http')) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#64B5F6] underline hover:text-[#9EE7FF] cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              window.open(href, '_blank', 'noopener,noreferrer');
            }}
          >
            {children}
          </a>
        );
      }
      
      // Default case
      return (
        <a
          href={href}
          className="text-[#64B5F6] hover:underline cursor-pointer"
        >
          {children}
        </a>
      );
    }
  };

  // Effect to ensure links in the modal are clickable
  useEffect(() => {
    if (modalOpen && gtmStrategy) {
      // Wait for DOM to be updated with dialog content
      setTimeout(() => {
        // Get all links in the dialog
        const links = document.querySelectorAll('.dialog-content a[href]');
        console.log(`Found ${links.length} links in GTM Strategy dialog`);
        
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
  }, [modalOpen, gtmStrategy]);

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
          onClick={handleGenerateGTMStrategy}
          className={`
            w-full
            rounded-full
            px-6
            py-3
            h-[52px]
            border
            ${generated ? 'border-[#39FF14]/70' : 'border-[#39FF14]'}
            bg-[#151515]
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
        <DialogContent className="dialog-content bg-[#151515] border-[#3F3F3F] text-[#EFEFEF] p-4 rounded-lg sm:max-w-lg md:max-w-3xl lg:max-w-5xl max-h-[80vh] overflow-y-auto pointer-events-auto">
          <DialogHeader>
            <div className="flex items-center justify-center">
              <DialogTitle className="text-xl font-bold text-[#EFEFEF]">
                Go-To-Market Strategy
              </DialogTitle>
            </div>
          </DialogHeader>

            {/* START NEW LAYOUT */}
          <div className="lg:flex gap-6 max-h-[70vh]">
            {/* ── TOC ─────────────────────────── */}

            {/* ── CONTENT ─────────────────────── */}
            <div className="flex-1 overflow-y-auto pr-1">
              {gtmStrategy ? (
      <>
        {titleSection?.heading && (
          <div className="mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-[#64B5F6]">
              {titleSection.heading}
            </h2>
          </div>
        )}
        <SectionAccordion sections={accordionSections} />
      </>
    ) : (
                <div className="flex justify-center items-center p-8">
                  <Spinner size={32} className="animate-spin text-primary" />
                </div>
              )}
            </div>
          </div>
  {/* END NEW LAYOUT */}
          
         
          
          <div className="flex justify-center gap-2 sm:gap-4 mt-2 sm:mt-4">
            <Button 
              onClick={() => setModalOpen(false)}
              className="rounded-full px-2 sm:px-3 md:px-6 py-1 sm:py-2 border border-[#3F3F3F] bg-[#151515] text-[#EFEFEF] hover:bg-[#252525] text-xs sm:text-sm md:text-base"
            >
              Close
    </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}