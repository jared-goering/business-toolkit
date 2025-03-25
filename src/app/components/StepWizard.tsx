'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Sparkle, Spinner } from 'phosphor-react';

interface StepWizardProps {
  company: string;
  setCompany: (val: string) => void;
  problem: string;
  setProblem: (val: string) => void;
  customers: string;
  setCustomers: (val: string) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  loading: boolean;
  handleGenerate: () => void;
}

export default function StepWizard({
  company,
  setCompany,
  problem,
  setProblem,
  customers,
  setCustomers,
  currentStep,
  setCurrentStep,
  loading,
  handleGenerate,
}: StepWizardProps) {
  const [buttonHover, setButtonHover] = useState(false);

  const notEmpty = (val: string) => val.trim().length > 0;

  const arrowButtonBase = `
    flex
    items-center
    justify-center
    rounded-full
    border
    transition-colors
    duration-200
  `;

  function NextArrowButton({ canProceed, onClick }: { canProceed: boolean; onClick: () => void }) {
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
    
    <div className="relative flex flex-col items-center w-full">

{currentStep >= 4 && (
  <>
    {/* Left bracket */}
    <div className="absolute w-[523px] h-[101px] left-0 right-[325px] mx-auto top-[215px] pointer-events-none">
      <svg
        width="423"
        height="145"
        viewBox="0 0 523 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 0V0C3 35.3462 31.6538 64 67 64H483C503.435 64 520 80.5655 520 101V101"
          stroke="#3F3F3F"
          strokeWidth="5"
        />
      </svg>
    </div>

    {/* Right bracket (flipped) */}
    <div
      className="absolute w-[523px] h-[101px] left-[325px] right-0 mx-auto top-[215px] pointer-events-none"
      style={{
        transform: 'scaleX(-1)',
        transformOrigin: 'center',
      }}
    >
      <svg
        width="423"
        height="145"
        viewBox="0 0 523 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 0V0C3 35.3462 31.6538 64 67 64H483C503.435 64 520 80.5655 520 101V101"
          stroke="#3F3F3F"
          strokeWidth="5"
        />
      </svg>
    </div>
  </>
)}


      
      {/* Horizontal line behind the 3 cards (only on md+) */}
      {currentStep >= 4 && (
        <div
            className="
            md:block
            absolute
            top-[145px]
            left-[10%]
            right-[10%]
            h-[5px]
            bg-[#3F3F3F]
            "
        />
        )}
      <section className="relative grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 mb-16 w-full">
        {/* Card 1 */}
        {currentStep >= 1 && (
          <Card className="bg-[#1C1C1C] rounded-3xl border-[#3F3F3F] py-1 px-1">
            <CardHeader className="pt-8 pb-1">
              <CardTitle className="text-[17px] text-[#EFEFEF] text-center leading-tight m-0">
                What is your company going to make?
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <Textarea
                className="bg-[#2F2F2F] border-[#3F3F3F] text-[#EFEFEF] placeholder:text-gray-400 h-[100px] rounded-2xl"
                placeholder="e.g. AI-powered fitness app"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && notEmpty(company)) {
                    e.preventDefault();
                    setCurrentStep(2);
                  }
                }}
              />
              {currentStep === 1 && (
                <div className="flex justify-end mt-4">
                  <NextArrowButton
                    canProceed={notEmpty(company)}
                    onClick={() => notEmpty(company) && setCurrentStep(2)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Card 2 */}
        {currentStep >= 2 && (
          <Card className="bg-[#1C1C1C] rounded-3xl border-[#3F3F3F] py-1 px-1">
            <CardHeader className="pt-8 pb-1">
            <CardTitle className="text-[17px] text-[#EFEFEF] text-center leading-tight m-0">
                What problem does it solve?
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <Textarea
                className="bg-[#2F2F2F] border-[#3F3F3F] text-[#EFEFEF] placeholder:text-gray-400 h-[100px] rounded-2xl"
                placeholder="e.g. Personalized workout plans"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && notEmpty(problem)) {
                    e.preventDefault();
                    setCurrentStep(3);
                  }
                }}
              />
              {currentStep === 2 && (
                <div className="flex justify-between mt-4">
                  <BackArrowButton onClick={() => setCurrentStep(1)} />
                  <NextArrowButton
                    canProceed={notEmpty(problem)}
                    onClick={() => notEmpty(problem) && setCurrentStep(3)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Card 3 */}
        {currentStep >= 3 && (
          <Card className="bg-[#1C1C1C] rounded-3xl border-[#3F3F3F] py-1 px-1">
            <CardHeader className="pt-8 pb-1">
            <CardTitle className="text-[17px] text-[#EFEFEF] text-center leading-tight m-0">
                Who are your target customers?
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <Textarea
                className="bg-[#2F2F2F] border-[#3F3F3F] text-[#EFEFEF] placeholder:text-gray-400 h-[100px] rounded-2xl"
                placeholder="e.g. Health-conscious individuals"
                value={customers}
                onChange={(e) => setCustomers(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && notEmpty(customers)) {
                    e.preventDefault();
                    setCurrentStep(4);
                  }
                }}
              />
              {currentStep === 3 && (
                <div className="flex justify-between mt-4">
                  <BackArrowButton onClick={() => setCurrentStep(2)} />
                  <NextArrowButton
                    canProceed={notEmpty(customers)}
                    onClick={() => notEmpty(customers) && setCurrentStep(4)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </section>

      {/* The vertical line from the middle card to the button (only on md+) */}
      {currentStep >= 4 && (
        <div className="relative w-full flex justify-center">
          {/* <div
            className="
              hidden md:block
              absolute
              w-[2px]
              bg-[#FDE03B]
              h-16
              top-[-2rem]
              left-1/2
              transform -translate-x-1/2
            "
          /> */}
          <Button
            onMouseEnter={() => setButtonHover(true)}
            onMouseLeave={() => setButtonHover(false)}
            onClick={handleGenerate}
            className="
              flex
              items-center
              justify-center
              mt-4
              px-20
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
              zIndex: 900
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
    </div>
  );
}