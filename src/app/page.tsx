// app/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import StepWizard from './components/StepWizard';
import PitchCard from './components/PitchCard';
import ExtraButtons from './components/ExtraButtons';

export default function HomePage() {
  // Form fields
  const [company, setCompany] = useState('');
  const [problem, setProblem] = useState('');
  const [customers, setCustomers] = useState('');
  const [pitch, setPitch] = useState('');

  // Wizard logic
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Pitch card logic
  const [showCard, setShowCard] = useState(false);

  // Show or hide the 3 new buttons under the pitch card
  const [showExtraButtons, setShowExtraButtons] = useState(false);

  // Called when user clicks "Looks Good" in the PitchCard
  const handleLooksGood = () => {
    setShowExtraButtons(true); 
    // keep showCard = true if you want the pitch card to remain
  };

  // Generate the pitch
  const handleGenerate = async () => {
    setLoading(true);
    setPitch('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, problem, customers }),
      });
      const data = await response.json();
      if (data.pitch) {
        setPitch(data.pitch);
        setShowCard(true);
      }
    } catch (error) {
      console.error('Error generating pitch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  return (
    <div className="bg-dot-pattern min-h-screen text-[#EFEFEF]">
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col space-y-16">
        {/* Header */}
        <header className="py-3">
          <h1 className="text-[46px] text-[#3F3F3F] leading-[40px]">
            NEW BUSINESS <br />
            TOOLKIT
          </h1>
        </header>

        {/* The Step Wizard (3 cards + generate button) */}
        <StepWizard
          company={company}
          setCompany={setCompany}
          problem={problem}
          setProblem={setProblem}
          customers={customers}
          setCustomers={setCustomers}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          loading={loading}
          handleGenerate={handleGenerate}
        />

        {/* The PitchCard (appears after pitch is generated) */}
        {showCard && (
    <>
      {/* The decorative line */}
      <div 
        className="absolute pointer-events-none" 
        style={{
          // Adjust these to position the line
          top: '612px', 
          left: '50%',
          transform: 'translateX(-50%)',
          width: '200px',
          height: '150px',
          zIndex: 1
        }}
      >
        <svg
          width="200"
          height="64"
          viewBox="0 0 200 65"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Example cubic Bézier curve from top center -> bottom center */}
          <path
            d="M 100 0 C 100 50, 100 50, 100 150"
            stroke="#3F3F3F"
            strokeWidth="4"
          />
        </svg>
      </div>
            <PitchCard
              pitch={pitch}
              onRegenerate={handleRegenerate}
              onClose={handleLooksGood} 
              // "Looks Good" => show extra buttons
            />

            {/* Show extra buttons below the pitch card */}
            {showExtraButtons && (
              <ExtraButtons
                pitch={pitch}
                company={company}
                problem={problem}
                customers={customers}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

