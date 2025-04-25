'use client';

import TargetPersonaColumn from './buttons/TargetPersonaColumn';
import CustomerPainPointsColumn from './buttons/CustomerPainPointsColumn';
import ValuePropositionMappingColumn from './buttons/ValuePropositionMappingColumn';
import ExportReportButton from './buttons/ExportReportButton';

import CompetitorReportButton from './buttons/CompetitorReportButton';
import GTMStrategyButton from './buttons/GTMStrategyButton';
import NextStepsButton from './buttons/NextStepsButton';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkle, Spinner, Eye } from 'phosphor-react';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import React from 'react';

interface ExtraButtonsProps {
  pitch: string;
  company: string;
  problem: string;
  customers: string;
  valueProposition: string;
  painPoints: string[];
  personas: string[];
  nextSteps: string;
  gtmStrategy: string;
  competitorReport: string;
}

export default function ExtraButtons({
  pitch,
  company,
  problem,
  customers,
  valueProposition,
  painPoints,
  personas,
  nextSteps,
  gtmStrategy,
  competitorReport,
}: ExtraButtonsProps) {
  // Refs for container components
  const valuePropContainerRef = useRef<HTMLDivElement | null>(null);
  const nextStepsContainerRef = useRef<HTMLDivElement | null>(null);
  const painPointsContainerRef = useRef<HTMLDivElement | null>(null);
  const gtmStrategyContainerRef = useRef<HTMLDivElement | null>(null);
  const targetPersonaContainerRef = useRef<HTMLDivElement | null>(null);
  const competitorReportContainerRef = useRef<HTMLDivElement | null>(null);
  
  // Refs for the buttons themselves
  const valuePropRef = useRef<HTMLButtonElement | null>(null);
  const nextStepsRef = useRef<HTMLButtonElement | null>(null);
  const painPointsRef = useRef<HTMLButtonElement | null>(null);
  const gtmStrategyRef = useRef<HTMLButtonElement | null>(null);
  const targetPersonaRef = useRef<HTMLButtonElement | null>(null);
  const competitorReportRef = useRef<HTMLButtonElement | null>(null);
  
  // Define buttonRef type
  type ButtonRefKey = 'valueProp' | 'nextSteps' | 'painPoints' | 'targetPersona' | 'gtmStrategy' | 'competitorReport';
  type ButtonRefObject = Record<ButtonRefKey, React.RefObject<HTMLButtonElement | null>>;
  
  // Group all button refs in a single object for easier management
  const buttonRefs = useMemo<ButtonRefObject>(() => ({
    valueProp: valuePropRef,
    nextSteps: nextStepsRef,
    painPoints: painPointsRef,
    targetPersona: targetPersonaRef,
    gtmStrategy: gtmStrategyRef,
    competitorReport: competitorReportRef
  }), []);
  
  // Refs to store previous states to prevent unnecessary state updates
  const prevLoadingStates = useRef<Record<string, boolean>>({});
  const prevGeneratedStates = useRef<Record<string, boolean>>({});
  
  // State for hover, loading, and generated states
  const [hoverStates, setHoverStates] = useState<Record<string, boolean>>({
    valueProp: false,
    nextSteps: false,
    painPoints: false,
    targetPersona: false,
    gtmStrategy: false,
    competitorReport: false
  });
  
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({
    valueProp: false,
    nextSteps: false,
    painPoints: false,
    targetPersona: false,
    gtmStrategy: false,
    competitorReport: false
  });
  
  const [generatedStates, setGeneratedStates] = useState<Record<string, boolean>>({
    valueProp: false,
    nextSteps: false,
    painPoints: false,
    targetPersona: false,
    gtmStrategy: false,
    competitorReport: false
  });
  
  // Track the last time we updated states to avoid too frequent updates
  const lastUpdateTime = useRef<number>(Date.now());
  
  // Timeout ref to clear if component unmounts
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle button hover state
  const handleButtonHover = useCallback((buttonType: string, isHovered: boolean) => {
    setHoverStates(prev => ({
      ...prev,
      [buttonType]: isHovered
    }));
  }, []);

  // Function to check loading states
  const checkButtonStates = useCallback(() => {
    const newLoadingStates = { ...prevLoadingStates.current };
    const newGeneratedStates = { ...prevGeneratedStates.current };
    let changed = false;

    // For each button type...
    // Use type assertion to ensure keys are valid ButtonRefKey values
    (Object.keys(buttonRefs) as ButtonRefKey[]).forEach(type => {
      const ref = buttonRefs[type].current;
      
      // First check if any dialog is present in the document
      // This helps with mobile where dialogs might be attached to body
      const anyDialogOpen = document.querySelectorAll('[role="dialog"]').length > 0;
      
      // Only one button can have triggered a dialog, so if there's a dialog open
      // and this button is in loading state, it's likely this button triggered it
      if (anyDialogOpen && newLoadingStates[type]) {
        newLoadingStates[type] = false;
        newGeneratedStates[type] = true;
        changed = true;
      }
      
      // Now check container-specific content
      const container = ref?.closest('div[ref]');
      if (container) {
        // Check multiple indicators that content has been generated
        const hasDialog = container.querySelector('[role="dialog"]') !== null;
        const hasContentAttr = container.getAttribute('data-has-content') === 'true';
        const hasMarkdown = container.querySelector('.markdown-body') !== null;
        const hasProse = container.querySelector('.prose') !== null;
        
        // Check if content has been generated through any indicator
        if (hasDialog || hasContentAttr || hasMarkdown || hasProse) {
          if (!newGeneratedStates[type]) {
            newGeneratedStates[type] = true;
            changed = true;
          }
          
          // If we have generated content but still showing loading, turn it off
          if (newLoadingStates[type]) {
            newLoadingStates[type] = false;
            changed = true;
          }
        }
        
        // Check if button is disabled or has loading class or contains loading indicator
        const isLoading = ref?.getAttribute('aria-disabled') === 'true' || 
                          ref?.classList?.contains('loading') || 
                          ref?.querySelector('.loading') !== null ||
                          ref?.querySelector('.animate-spin') !== null;

        // If loading state has changed
        if (newLoadingStates[type] !== isLoading) {
          newLoadingStates[type] = isLoading;
          changed = true;
        }
      }
    });

    // Only update state if something changed
    if (changed) {
      setLoadingStates(newLoadingStates);
      setGeneratedStates(newGeneratedStates);
      prevLoadingStates.current = newLoadingStates;
      prevGeneratedStates.current = newGeneratedStates;
    }
  }, [buttonRefs]);

  // Function to trigger a click on the original button
  const triggerButtonClick = useCallback((ref: React.RefObject<HTMLButtonElement | null>, buttonType: string) => {
    // Only allow click if not already loading
    if (loadingStates[buttonType]) {
      return;
    }
    
    // Set loading state immediately for better UX feedback
    setLoadingStates(prev => {
      const newState = { ...prev, [buttonType]: true };
      // Update the ref too to prevent duplicate clicks
      prevLoadingStates.current = { ...prevLoadingStates.current, [buttonType]: true };
      return newState;
    });
    
    // Click the button
    if (ref.current) {
      // Create a reusable function to update states when dialog is found
      const handleDialogFound = () => {
        // Update loading and generated states
        setLoadingStates(prev => ({ ...prev, [buttonType]: false }));
        setGeneratedStates(prev => ({ ...prev, [buttonType]: true }));
        
        // Update refs for consistency
        prevLoadingStates.current = { 
          ...prevLoadingStates.current, 
          [buttonType]: false 
        };
        prevGeneratedStates.current = { 
          ...prevGeneratedStates.current, 
          [buttonType]: true 
        };
        
        // Set data attribute on container if it exists
        const container = ref.current?.closest('div[ref]');
        if (container) {
          container.setAttribute('data-has-content', 'true');
        }
      };
      
      // Create two observers - one for the container and one for the document
      // This ensures we catch modals regardless of where they appear
      
      // 1. Container observer - look for dialog in the direct container
      const container = ref.current.closest('div[ref]');
      if (container) {
        const containerObserver = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (mutation.type === 'childList') {
              const dialog = container.querySelector('[role="dialog"]');
              if (dialog) {
                handleDialogFound();
                containerObserver.disconnect();
              }
            }
          }
        });
        
        containerObserver.observe(container, { childList: true, subtree: true });
        
        // Safety cleanup
        setTimeout(() => containerObserver.disconnect(), 10000);
      }
      
      // 2. Document observer - look for ANY dialog that appears after click
      // This is especially important for mobile where dialogs might be appended to the body
      const documentObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            const addedNodes = Array.from(mutation.addedNodes);
            for (const node of addedNodes) {
              if (node instanceof HTMLElement) {
                // Check if the node itself is a dialog or contains a dialog
                if (node.getAttribute('role') === 'dialog' || node.querySelector('[role="dialog"]')) {
                  handleDialogFound();
                  documentObserver.disconnect();
                  break;
                }
              }
            }
          }
        }
      });
      
      documentObserver.observe(document.body, { childList: true, subtree: true });
      
      // Safety cleanup for document observer
      setTimeout(() => documentObserver.disconnect(), 10000);
      
      // Trigger the underlying button's click
      ref.current.click();
      
      // Multiple checks to catch the state change
      // Immediate check
      setTimeout(() => checkButtonStates(), 300);
      // Secondary check after a slightly longer delay
      setTimeout(() => checkButtonStates(), 1000);
      // Final check to catch any late-appearing modals
      setTimeout(() => checkButtonStates(), 3000);
    }      
  }, [loadingStates, checkButtonStates, setGeneratedStates]);

  // Find and store references to the original buttons after components mount
  useEffect(() => {
    // Helper to find button within a container
    const findButton = (containerRef: React.RefObject<HTMLDivElement | null>): HTMLButtonElement | null => {
      if (!containerRef.current) return null;
      return containerRef.current.querySelector('button');
    };

    // Find all buttons
    const findAllButtons = () => {
      valuePropRef.current = findButton(valuePropContainerRef);
      nextStepsRef.current = findButton(nextStepsContainerRef);
      painPointsRef.current = findButton(painPointsContainerRef);
      gtmStrategyRef.current = findButton(gtmStrategyContainerRef);
      targetPersonaRef.current = findButton(targetPersonaContainerRef);
      competitorReportRef.current = findButton(competitorReportContainerRef);

      // Check initial states of buttons
      checkButtonStates();
    };

    // Initial find
    findAllButtons();
    
    // Try again after a short delay to ensure components are fully rendered
    const timeoutId = setTimeout(findAllButtons, 500);
    
    return () => clearTimeout(timeoutId);
  }, [checkButtonStates]);

  // Start checking button states when the component mounts and handle cleanup
  useEffect(() => {
    // Initial check
    checkButtonStates();
    
    // Set up polling interval to regularly check states
    const intervalId = setInterval(() => {
      checkButtonStates();
    }, 2000); // Check every 2 seconds
    
    // Clean up on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      clearInterval(intervalId);
    };
  }, [checkButtonStates]);

  // Animation variants for staggered children
  const containerVariants = {
    hidden: { 
      opacity: 0
    },
    show: { 
      opacity: 1, 
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.9
    },
    show: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  // Function to manually force update states for a specific button
  const forceUpdateButtonState = useCallback((buttonType: ButtonRefKey, isLoading: boolean, isGenerated: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [buttonType]: isLoading
    }));
    
    setGeneratedStates(prev => ({
      ...prev,
      [buttonType]: isGenerated
    }));
    
    prevLoadingStates.current = { 
      ...prevLoadingStates.current, 
      [buttonType]: isLoading 
    };
    
    prevGeneratedStates.current = { 
      ...prevGeneratedStates.current, 
      [buttonType]: isGenerated 
    };
    
    // Also update container attributes
    const container = buttonRefs[buttonType].current?.closest('div[ref]');
    if (container && isGenerated) {
      container.setAttribute('data-has-content', 'true');
    }
  }, [buttonRefs]);

  // Keep generatedStates perfectly in sync with props
  useEffect(() => {
    setGeneratedStates({
      valueProp: !!valueProposition?.trim(),
      painPoints: Array.isArray(painPoints) && painPoints.length > 0,
      targetPersona: Array.isArray(personas) && personas.length > 0,
      nextSteps: !!nextSteps?.trim(),
      gtmStrategy: !!gtmStrategy?.trim(),
      competitorReport: !!competitorReport?.trim(),
    } as Record<ButtonRefKey, boolean>);
  }, [valueProposition, painPoints, personas, nextSteps, gtmStrategy, competitorReport]);

  // Mobile button component to isolate state changes
  const MobileButton = React.memo(({ 
    type, 
    color, 
    buttonRef,
    isLoading,
    isGenerated,
    isHovered
  }: { 
    type: string; 
    color: string;
    buttonRef: React.RefObject<HTMLButtonElement | null>;
    isLoading: boolean;
    isGenerated: boolean;
    isHovered: boolean;
  }) => {
    // Determine current state for data attribute
    const buttonState = isLoading ? 'loading' : isGenerated ? 'generated' : 'default';
    
    // Use effect to add additional checks for mobile
    React.useEffect(() => {
      if (isLoading) {
        // Set up a check to detect if this button should exit loading state
        const checkInterval = setInterval(() => {
          // If any dialog is present and this button is loading, it likely triggered it
          if (document.querySelectorAll('[role="dialog"]').length > 0) {
            // This is a type assertion because we know type is a valid ButtonRefKey
            forceUpdateButtonState(type as ButtonRefKey, false, true);
            clearInterval(checkInterval);
          }
        }, 500);
        
        // Fail safe: after 10 seconds of loading, force check button states again
        const failSafeTimeout = setTimeout(() => {
          checkButtonStates();
          clearInterval(checkInterval);
        }, 10000);
        
        // Clean up interval and timeout
        return () => {
          clearInterval(checkInterval);
          clearTimeout(failSafeTimeout);
        };
      }
    }, [isLoading, type, forceUpdateButtonState, checkButtonStates]);

  return (
      <motion.div 
        variants={itemVariants} 
        className="aspect-square w-full" 
        whileTap={{ scale: 0.95 }}
        layout="position"
        layoutId={`${type}-container`}
        style={{ aspectRatio: "1/1" }}
        data-button-type={type}
        data-button-state={buttonState}
      >
        <Button
          onClick={() => triggerButtonClick(buttonRef, type)}
          onMouseEnter={() => handleButtonHover(type, true)}
          onMouseLeave={() => handleButtonHover(type, false)}
          disabled={isLoading}
          className="w-full h-full rounded-xl p-2 bg-[#1C1C1C] transition-colors duration-200 flex flex-col items-center justify-center"
          style={{
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: color,
            color: color,
            height: '100%', // Ensure full height
          }}
          // Use custom hover effect
          onMouseOver={(e) => {
            if (!isLoading) {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${color}20`; // 20 is hex for 12% opacity
            }
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1C1C1C';
          }}
          data-state={buttonState}
        >
          <div className="flex flex-col items-center justify-center h-full">
            {isLoading ? (
              <div key={`loading-${type}`} className="flex flex-col items-center justify-center">
                <Spinner size={24} className="mb-1 animate-spin" />
                <span className="text-xs text-center leading-tight">Loading...</span>
              </div>
            ) : isGenerated ? (
              <div key={`generated-${type}`} className="flex flex-col items-center justify-center">
                <Eye
                  size={24}
                  weight={isHovered ? 'fill' : 'bold'}
                  className="mb-1"
                />
                <span className="text-xs text-center leading-tight">
                  {type === 'valueProp' && 'View Value Prop'}
                  {type === 'painPoints' && 'View Pain Points'}
                  {type === 'targetPersona' && 'View Personas'}
                  {type === 'nextSteps' && 'View Steps'}
                  {type === 'gtmStrategy' && 'View Strategy'}
                  {type === 'competitorReport' && 'View Competitors'}
            </span>
              </div>
          ) : (
              <div key={`default-${type}`} className="flex flex-col items-center justify-center">
              <Sparkle
                  size={24}
                  weight={isHovered ? 'fill' : 'bold'}
                  className="mb-1"
                />
                <span className="text-xs text-center leading-tight">
                  {type === 'valueProp' && 'Value Prop'}
                  {type === 'painPoints' && 'Pain Points'}
                  {type === 'targetPersona' && 'Target Persona'}
                  {type === 'nextSteps' && 'Next Steps'}
                  {type === 'gtmStrategy' && 'GTM Strategy'}
                  {type === 'competitorReport' && 'Competitor Report'}
            </span>
              </div>
        )}
      </div>
        </Button>
      </motion.div>
    );
  });
  MobileButton.displayName = 'MobileButton';
  
  // Mobile grid of square buttons (only visible on small screens)
  const MobileButtonGrid = React.memo(() => (
    // Use a stable container that doesn't animate on state changes
    <div 
      className="grid grid-cols-3 gap-4 w-full h-auto max-w-[600px] mx-auto px-2 sm:hidden mobile-buttons-grid"
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Row 1 */}
      <MobileButton 
        type="valueProp"
        color="#00FFFF"
        buttonRef={valuePropRef}
        isLoading={loadingStates.valueProp}
        isGenerated={generatedStates.valueProp}
        isHovered={hoverStates.valueProp}
      />
      
      <MobileButton 
        type="painPoints"
        color="#00FFFF"
        buttonRef={painPointsRef}
        isLoading={loadingStates.painPoints}
        isGenerated={generatedStates.painPoints}
        isHovered={hoverStates.painPoints}
      />
      
      <MobileButton 
        type="targetPersona"
        color="#00FFFF"
        buttonRef={targetPersonaRef}
        isLoading={loadingStates.targetPersona}
        isGenerated={generatedStates.targetPersona}
        isHovered={hoverStates.targetPersona}
      />
      
      {/* Row 2 */}
      <MobileButton 
        type="nextSteps"
        color="#39FF14"
        buttonRef={nextStepsRef}
        isLoading={loadingStates.nextSteps}
        isGenerated={generatedStates.nextSteps}
        isHovered={hoverStates.nextSteps}
      />
      
      <MobileButton 
        type="gtmStrategy"
        color="#39FF14"
        buttonRef={gtmStrategyRef}
        isLoading={loadingStates.gtmStrategy}
        isGenerated={generatedStates.gtmStrategy}
        isHovered={hoverStates.gtmStrategy}
      />
      
      <MobileButton 
        type="competitorReport"
        color="#39FF14"
        buttonRef={competitorReportRef}
        isLoading={loadingStates.competitorReport}
        isGenerated={generatedStates.competitorReport}
        isHovered={hoverStates.competitorReport}
      />
    </div>
  ));

  // Mobile export button (full width) below grid
  const MobileExportButton = () => (
    <div className="w-full px-2 sm:hidden mt-4">
      <ExportReportButton />
    </div>
  );

  return (
    <motion.section 
      className="w-full pt-10"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      layoutRoot
      layout
    >
      {/* Mobile grid layout with LayoutGroup to maintain stability */}
      <motion.div layout="preserve-aspect" className="w-full" style={{ aspectRatio: "auto" }}>
        <MobileButtonGrid />
        <MobileExportButton />
      </motion.div>

      {/* Desktop layout - hidden on mobile */}
      <div className="hidden sm:block w-full max-w-[1200px] mx-auto">
        <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Column 1 */}
          <motion.div 
            className="w-full flex flex-col items-center space-y-6"
            variants={itemVariants}
          >
            <div ref={valuePropContainerRef} className="w-full">
              <ValuePropositionMappingColumn
                pitch={pitch}
                company={company}
                problem={problem}
                customers={customers}
                valueProposition={valueProposition}
              />
        </div>
            <div ref={nextStepsContainerRef} className="w-full">
              <NextStepsButton 
                pitch={pitch}
                company={company}
                problem={problem}
                customers={customers}
                valueProposition={valueProposition}
                painPoints={painPoints}
                personas={personas}
                initialNextSteps={nextSteps}
              />
</div>
          </motion.div>

          {/* Column 2 */}
          <motion.div 
            className="w-full flex flex-col items-center space-y-6"
            variants={itemVariants}
          >
            <div ref={painPointsContainerRef} className="w-full">
              <CustomerPainPointsColumn
                pitch={pitch}
                company={company}
                problem={problem}
                customers={customers}
                initialPainPoints={painPoints}
              />
            </div>
            <div ref={gtmStrategyContainerRef} className="w-full">
              <GTMStrategyButton 
                pitch={pitch}
                company={company}
                problem={problem}
                customers={customers}
                valueProposition={valueProposition}
                painPoints={painPoints}
                personas={personas}
                initialGtmStrategy={gtmStrategy}
              />
            </div>
          </motion.div>

          {/* Column 3 */}
          <motion.div 
            className="w-full flex flex-col items-center space-y-6"
            variants={itemVariants}
          >
            <div ref={targetPersonaContainerRef} className="w-full">
              <TargetPersonaColumn
                pitch={pitch}
                company={company}
                problem={problem}
                customers={customers}
                initialPersonas={personas as any}
              />
            </div>
            <div ref={competitorReportContainerRef} className="w-full">
              <CompetitorReportButton 
                pitch={pitch}
                company={company}
                problem={problem}
                customers={customers}
                valueProposition={valueProposition}
                initialCompetitorReport={competitorReport}
              />
            </div>
          </motion.div>
        </div>
</div>
    </motion.section>
  );
}
