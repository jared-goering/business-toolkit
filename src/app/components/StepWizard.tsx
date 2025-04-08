'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Sparkle, Spinner } from 'phosphor-react';
import { motion } from 'framer-motion';

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
          {/* Left bracket with animation */}
          <motion.div 
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: 1, pathLength: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="hidden md:block absolute w-[523px] h-[101px] left-0 right-[325px] mx-auto top-[215px] pointer-events-none"
          >
            <svg
              width="423"
              height="145"
              viewBox="0 0 523 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path
                d="M3 0V0C3 35.3462 31.6538 64 67 64H483C503.435 64 520 80.5655 520 101V101"
                stroke="#3F3F3F"
                strokeWidth="5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </svg>
          </motion.div>

          {/* Right bracket (similar changes) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="hidden md:block absolute w-[523px] h-[101px] left-[325px] right-0 mx-auto top-[215px] pointer-events-none"
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
              <motion.path
                d="M3 0V0C3 35.3462 31.6538 64 67 64H483C503.435 64 520 80.5655 520 101V101"
                stroke="#3F3F3F"
                strokeWidth="5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </svg>
          </motion.div>
        </>
      )}

      {/* Horizontal line with animation */}
      {currentStep >= 4 && (
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="hidden md:block absolute top-[145px] left-[10%] right-[10%] h-[5px] bg-[#3F3F3F]"
          style={{ transformOrigin: "center" }}
        />
      )}

      {/* Horizontal connecting line (visible when 2+ cards are shown) */}
      {currentStep >= 2 && currentStep < 4 && (
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="hidden md:block absolute top-[145px] left-[25%] right-[25%] h-[3px] bg-[#3F3F3F]"
          style={{ transformOrigin: "center", zIndex: 5 }}
        />
      )}

      <section className="relative flex flex-col md:flex-row justify-center pt-5 md:pt-10 mb-10 md:mb-16 w-full">
        {/* Card 1 */}
        {currentStep >= 1 && (
          <motion.div
            className="w-full md:w-[32%] px-2 mx-auto md:mx-0 mb-4 md:mb-0 relative"
            initial={{ 
              opacity: 0,
              scale: 0.9
            }}
            animate={{ 
              x: 0,
              opacity: 1,
              scale: 1
            }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 30,
              duration: 0.5
            }}
            style={{
              position: 'relative',
              zIndex: 10
            }}
          >
            <Card className="bg-[#1C1C1C] rounded-3xl border-[#3F3F3F] py-1 px-1">
              <CardHeader className="pt-6 sm:pt-8 pb-1">
                <CardTitle className="text-[18px] sm:text-[17px] text-[#EFEFEF] text-center leading-tight m-0">
                  What is your company going to make?
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <Textarea
                  className="bg-[#2F2F2F] border-[#3F3F3F] text-[#EFEFEF] placeholder:text-gray-400 h-[120px] sm:h-[100px] rounded-2xl"
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
          </motion.div>
        )}

        {/* Card 2 */}
        {currentStep >= 2 && (
          <motion.div
            className="w-full md:w-[32%] px-2 mx-auto md:mx-5 mb-4 md:mb-0"
            initial={{ 
              y: 20,
              opacity: 0,
              scale: 0.9
            }}
            animate={{ 
              y: 0,
              opacity: 1,
              scale: 1
            }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              duration: 0.5
            }}
            style={{
              zIndex: 20
            }}
          >
            <Card className="bg-[#1C1C1C] rounded-3xl border-[#3F3F3F] py-1 px-1">
              <CardHeader className="pt-6 sm:pt-8 pb-1">
                <CardTitle className="text-[18px] sm:text-[17px] text-[#EFEFEF] text-center leading-tight m-0">
                  What problem does it solve?
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <Textarea
                  className="bg-[#2F2F2F] border-[#3F3F3F] text-[#EFEFEF] placeholder:text-gray-400 h-[120px] sm:h-[100px] rounded-2xl"
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
          </motion.div>
        )}

        {/* Card 3 */}
        {currentStep >= 3 && (
          <motion.div
            className="w-full md:w-[32%] px-2 mx-auto md:mx-1 mb-4 md:mb-0"
            initial={{ 
              y: 20,
              opacity: 0,
              scale: 0.9
            }}
            animate={{ 
              y: 0,
              opacity: 1,
              scale: 1
            }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 30,
              duration: 0.5
            }}
            style={{
              zIndex: 30
            }}
          >
            <Card className="bg-[#1C1C1C] rounded-3xl border-[#3F3F3F] py-1 px-1">
              <CardHeader className="pt-6 sm:pt-8 pb-1">
                <CardTitle className="text-[18px] sm:text-[17px] text-[#EFEFEF] text-center leading-tight m-0">
                  Who are your target customers?
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <Textarea
                  className="bg-[#2F2F2F] border-[#3F3F3F] text-[#EFEFEF] placeholder:text-gray-400 h-[120px] sm:h-[100px] rounded-2xl"
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
          </motion.div>
        )}
      </section>

      {/* Generate button with animation */}
      {currentStep >= 4 && (
        <div className="relative w-full flex justify-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
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
          </motion.div>
        </div>
      )}
    </div>
  );
}