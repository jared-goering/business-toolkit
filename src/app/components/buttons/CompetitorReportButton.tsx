'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkle, Spinner, Eye } from 'phosphor-react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { splitMarkdownIntoSections, MarkdownSection } from '@/app/utils/markdownUtils';
import SectionAccordion from '@/app/components/buttons/gtm-strategy/SectionAccordion';
import { LoadingAnimation } from './competitor-report/LoadingAnimation';
import { useReport } from '@/context/ReportContext';
import { splitForAccordion } from '@/app/utils/splitSections';

interface CompetitorReportButtonProps {
  pitch: string;
  company: string;
  problem: string;
  customers: string;
  valueProposition: string;
  initialCompetitorReport?: string;
}

export default function CompetitorReportButton({
  pitch,
  company,
  problem,
  customers,
  valueProposition,
  initialCompetitorReport,
}: CompetitorReportButtonProps) {
  const { setField } = useReport();
  const [loading, setLoading] = useState(false);
  const [hoverSparkle, setHoverSparkle] = useState(false);
  const [generated, setGenerated] = useState<boolean>(!!initialCompetitorReport);
  const [hoverViewResults, setHoverViewResults] = useState(false);
  const [competitorReport, setCompetitorReport] = useState<string>(initialCompetitorReport || '');
  const [modalOpen, setModalOpen] = useState(false);
  const [sections, setSections] = useState<MarkdownSection[]>([]);
  const [loadingText, setLoadingText] = useState<string>("Thinking...");
  const [nextLoadingText, setNextLoadingText] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const { titleSection, accordionSections } = splitForAccordion(sections);

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

  // Extracted generation logic
  const doGenerateCompetitorReport = async () => {
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
      setField('competitorReport', data.competitorReport);
      setGenerated(true);
      setModalOpen(true);
    } catch (error) {
      console.error('Error generating competitor report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCompetitorReport = () => {
    if (generated) {
      setModalOpen(true);
      return;
    }
    setInfoModalOpen(true);
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

      {/* ── INFO / CONFIRMATION MODAL ───────────────────────────── */}
      <Dialog open={infoModalOpen} onOpenChange={setInfoModalOpen}>
        <DialogContent className="bg-[#1C1C1C] border-[#3F3F3F] text-[#EFEFEF] p-6 rounded-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-center text-[#EFEFEF]">
              Generate Competitor Report?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#CCCCCC] mt-2 mb-4">
            Our AI agent will analyze competitors using public data. This process can take <span className="font-semibold text-[#39FF14]">2-3&nbsp;minutes</span> to complete.
          </p>
          <div className="flex justify-center gap-3 mt-4">
            <Button
              onClick={() => setInfoModalOpen(false)}
              className="rounded-full px-4 py-2 border border-[#3F3F3F] bg-[#252525] text-[#EFEFEF] hover:bg-[#303030] text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setInfoModalOpen(false);
                doGenerateCompetitorReport();
              }}
              className="rounded-full px-4 py-2 bg-[#39FF14] text-black hover:bg-[#39FF14]/90 text-sm font-semibold"
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
