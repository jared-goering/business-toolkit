'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import PitchCard from './components/PitchCard';
import { Spinner, Sparkle, ArrowRight, ArrowLeft } from 'phosphor-react';

export default function HomePage() {
  // Form fields
  const [company, setCompany] = useState('');
  const [problem, setProblem] = useState('');
  const [customers, setCustomers] = useState('');
  const [pitch, setPitch] = useState('');

  // UI states
  const [loading, setLoading] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [buttonHover, setButtonHover] = useState(false);

  /**
   * currentStep logic:
   *   1 => Only Card1 in the middle column
   *   2 => Card1 moves to column 1, Card2 in column 2
   *   3 => Card1 in col 1, Card2 in col 2, Card3 in col 3
   *   4 => All three + Generate button
   */
  const [currentStep, setCurrentStep] = useState(1);

  // Ensure non-empty input
  const notEmpty = (val: string) => val.trim().length > 0;

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

  const handleClose = () => {
    setShowCard(false);
  };

  // Common classes for the arrow buttons
  const arrowButtonBase = `
    flex
    items-center
    justify-center
    rounded-full
    border
    transition-colors
    duration-200
  `;

  // Conditionally styled “Next” button (ArrowRight)
  function NextArrowButton({
    canProceed,
    onClick,
  }: {
    canProceed: boolean;
    onClick: () => void;
  }) {
    return (
      <Button
        onClick={onClick}
        disabled={!canProceed}
        className={`
          ${arrowButtonBase}
          ${
            canProceed
              ? 'bg-[#1C1C1C] border-[#FDE03B] text-[#FDE03B] hover:bg-[#FDE03B]/10'
              : 'bg-[#2F2F2F] border-gray-600 text-gray-600 cursor-not-allowed'
          }
        `}
      >
        <ArrowRight size={32} />
      </Button>
    );
  }

  // Conditionally styled “Back” button (ArrowLeft) - always enabled
  function BackArrowButton({ onClick }: { onClick: () => void }) {
    return (
      <Button
        onClick={onClick}
        className={`
          ${arrowButtonBase}
          bg-[#1C1C1C]
          border-[#FDE03B]
          text-[#FDE03B]
          hover:bg-[#FDE03B]/10
        `}
      >
        <ArrowLeft size={32} />
      </Button>
    );
  }

  return (
    <div className="bg-dot-pattern min-h-screen text-[#EFEFEF]">
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col space-y-16">
        <header className="py-3">
          <h1 className="text-[46px] text-[#3F3F3F] leading-[40px]">
            NEW BUSINESS <br />
            TOOLKIT
          </h1>
        </header>

        {/* 3-column grid */}
        <section className="relative grid grid-cols-3 gap-8">
          {/* Card 1 */}
          {currentStep >= 1 && (
            <Card
              key={`card1-step${currentStep}`}
              style={{ gridColumn: currentStep === 1 ? '2' : '1' }}
              className="bg-[#1C1C1C] rounded-3xl border-[#3F3F3F] py-1 px-1"
            >
              <CardHeader className="pt-5 pb-4">
                <CardTitle className="text-[15px] text-[#EFEFEF] text-center leading-tight m-0">
                  What is your company going to make?
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <Textarea
                  className="bg-[#2F2F2F] border-[#3F3F3F] text-[#EFEFEF] placeholder:text-gray-400 h-[100px] rounded-2xl"
                  placeholder="e.g. AI-powered fitness app"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
                {currentStep === 1 && (
                  <div className="flex justify-end mt-4">
                    <NextArrowButton
                      canProceed={notEmpty(company)}
                      onClick={() => {
                        if (notEmpty(company)) {
                          setCurrentStep(2);
                        }
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Card 2 */}
          {currentStep >= 2 && (
            <Card
              key={`card2-step${currentStep}`}
              style={{ gridColumn: '2' }}
              className="bg-[#1C1C1C] rounded-3xl border-[#3F3F3F] py-1 px-1"
            >
              <CardHeader className="pt-5 pb-4">
                <CardTitle className="text-[15px] text-[#EFEFEF] text-center leading-tight m-0">
                  What problem does it solve?
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <Textarea
                  className="bg-[#2F2F2F] border-[#3F3F3F] text-[#EFEFEF] placeholder:text-gray-400 h-[100px] rounded-2xl"
                  placeholder="e.g. Personalized workout plans"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                />
                {currentStep === 2 && (
                  <div className="flex justify-between mt-4">
                    <BackArrowButton onClick={() => setCurrentStep(1)} />
                    <NextArrowButton
                      canProceed={notEmpty(problem)}
                      onClick={() => {
                        if (notEmpty(problem)) {
                          setCurrentStep(3);
                        }
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Card 3 */}
          {currentStep >= 3 && (
            <Card
              key={`card3-step${currentStep}`}
              style={{ gridColumn: '3' }}
              className="bg-[#1C1C1C] rounded-3xl border-[#3F3F3F] py-1 px-1"
            >
              <CardHeader className="pt-5 pb-4">
                <CardTitle className="text-[15px] text-[#EFEFEF] text-center leading-tight m-0">
                  Who are your target customers?
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <Textarea
                  className="bg-[#2F2F2F] border-[#3F3F3F] text-[#EFEFEF] placeholder:text-gray-400 h-[100px] rounded-2xl"
                  placeholder="e.g. Health-conscious individuals"
                  value={customers}
                  onChange={(e) => setCustomers(e.target.value)}
                />
                {currentStep === 3 && (
                  <div className="flex justify-between mt-4">
                    <BackArrowButton onClick={() => setCurrentStep(2)} />
                    <NextArrowButton
                      canProceed={notEmpty(customers)}
                      onClick={() => {
                        if (notEmpty(customers)) {
                          setCurrentStep(4);
                        }
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </section>

        {/* Generate Button (Step 4) */}
        {currentStep >= 4 && (
          <div className="flex justify-center">
            <Button
              onMouseEnter={() => setButtonHover(true)}
              onMouseLeave={() => setButtonHover(false)}
              onClick={() => handleGenerate()}
              className="
                flex
                items-center
                justify-center
                mt-4
                px-14
                py-2
                rounded-full
                border
                border-[#FDE03B]
                bg-[#1C1C1C]
                text-[#FDE03B]
                font-semibold
                hover:bg-[#FDE03B]/30
                transition-colors
                duration-200
              "
            >
              {loading ? (
                <span className="flex items-center">
                  <Spinner size={20} className="mr-2 animate-spin" />
                  Generating...
                </span>
              ) : (
                <span className="flex items-center">
                  <Sparkle
                    size={20}
                    weight={buttonHover ? 'fill' : 'regular'}
                    className="mr-2"
                  />
                  Generate Summary
                </span>
              )}
            </Button>
          </div>
        )}

        {/* PitchCard after generation */}
        {showCard && (
          <PitchCard
            pitch={pitch}
            onRegenerate={handleRegenerate}
            onClose={handleClose}
          />
        )}
      </div>
    </div>
  );
}
