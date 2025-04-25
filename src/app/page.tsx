// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import StepWizard from './components/StepWizard';
import PitchCard from './components/PitchCard';
import ExtraButtons from './components/ExtraButtons';
import { motion } from 'framer-motion';
import { useReport } from '@/context/ReportContext';
import ExportReportButton from './components/buttons/ExportReportButton';
import ProfileButton from './components/ProfileButton';
import SignInModal from './components/SignInModal';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default function HomePage() {
  // Access report context
  const { setField, setMultiple, setCurrentDoc, reset: resetReport } = useReport();
  const { user } = useAuth();

  // Form fields
  const [company, setCompany] = useState('');
  const [problem, setProblem] = useState('');
  const [customers, setCustomers] = useState('');
  const [pitch, setPitch] = useState('');
  const [valueProposition, setValueProposition] = useState('');
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [personas, setPersonas] = useState<any[]>([]);
  const [nextSteps, setNextSteps] = useState('');
  const [gtmStrategy, setGtmStrategy] = useState('');
  const [competitorReport, setCompetitorReport] = useState('');

  // Wizard logic
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pendingGenerate, setPendingGenerate] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Pitch card logic
  const [showCard, setShowCard] = useState(false);

  // Show or hide the 3 new buttons under the pitch card
  const [showExtraButtons, setShowExtraButtons] = useState(false);

  // Load a previously saved business into the UI
  const loadBusiness = (d: any) => {
    const {
      company: comp = '',
      problem: prob = '',
      customers: cust = '',
      pitch: savedPitch = '',
      valueProposition: vp = '',
      customerPainPoints = [],
      personas: ps = [],
      nextSteps: ns = '',
      gtmStrategy: gts = '',
      competitorReport: cr = '',
      _docId,
    } = d || {};

    setCompany(comp);
    setProblem(prob);
    setCustomers(cust);
    setPitch(savedPitch);
    setValueProposition(vp || '');
    setPainPoints((customerPainPoints as any) || []);
    setPersonas(ps || []);
    setNextSteps(ns || '');
    setGtmStrategy(gts || '');
    setCompetitorReport(cr || '');

    // Set current doc immediately to avoid creating duplicate doc before persist
    if (_docId) {
      setCurrentDoc(_docId);
    }

    // Reveal card & extra buttons if pitch present
    setShowCard(!!savedPitch);
    if (savedPitch) {
      setShowExtraButtons(true);
    }

    const updateData = {
      company: comp,
      problem: prob,
      customers: cust,
      pitch: savedPitch,
      valueProposition: vp,
      customerPainPoints,
      personas: ps,
      nextSteps: ns,
      gtmStrategy: gts,
      competitorReport: cr,
    };

    if (_docId) {
      // delay to next tick so setCurrentDoc state applies first
      setTimeout(() => setMultiple(updateData), 0);
    } else {
      setMultiple(updateData);
    }

    // if we have a pitch, jump straight to step-4
    if (savedPitch) {
      setCurrentStep(4);
    } else if (comp && prob && cust) {
      setCurrentStep(4);
    }
  };

  // Called when user clicks "Looks Good" in the PitchCard
  const handleLooksGood = () => {
    setShowExtraButtons(true); 
    // keep showCard = true if you want the pitch card to remain
  };

  // Generate the pitch
  const handleGenerate = async () => {
    // Require sign-in before first AI call
    if (!user) {
      setShowAuthModal(true);
      setPendingGenerate(true);
      return;
    }
    setPendingGenerate(false);

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
        setField('pitch', data.pitch);
        setShowCard(true);

        // Set loading false before persisting to Firestore so UI updates promptly
        setLoading(false);

        // No manual addDoc here; ReportContext persistence handles create/update
      }
    } catch (error) {
      console.error('Error generating pitch:', error);
    } finally {
      // loading already reset above; keep safeguard in case of early error
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  // If we were waiting for auth and now have a user, automatically generate
  useEffect(() => {
    if (pendingGenerate && user) {
      handleGenerate();
    }
  }, [pendingGenerate, user]);

  // Keep context in sync with basic fields
  useEffect(() => {
    setField('company', company);
  }, [company, setField]);

  useEffect(() => {
    setField('problem', problem);
  }, [problem, setField]);

  useEffect(() => {
    setField('customers', customers);
  }, [customers, setField]);

  useEffect(() => {
    setField('pitch', pitch);
  }, [pitch, setField]);

  // Reset everything to start a new business session
  const handleNew = () => {
    // Clear local component states
    setCompany('');
    setProblem('');
    setCustomers('');
    setPitch('');
    setValueProposition('');
    setPainPoints([]);
    setPersonas([]);
    setNextSteps('');
    setGtmStrategy('');
    setCompetitorReport('');

    // Reset wizard & UI states
    setCurrentStep(1);
    setShowCard(false);
    setShowExtraButtons(false);
    setLoading(false);
    setPendingGenerate(false);

    // Clear current doc / context state
    setCurrentDoc(null);
    resetReport();
  };

  return (
    <div className="bg-dot-pattern min-h-screen text-[#EFEFEF]">
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col space-y-16">
        {/* Header */}
        <header className="py-3 flex flex-col md:flex-row items-start md:items-center md:justify-between gap-2">
          <h1 className="text-[46px] text-[#3F3F3F] leading-[40px]">
            VENTURE FORGE: <br />
            NEW BUSINESS 
            TOOLKIT
          </h1>
          <div className="ml-auto hidden md:flex items-center gap-2">
            <ProfileButton
              onNeedAuth={() => setShowAuthModal(true)}
              onSelectBusiness={loadBusiness}
              onNew={handleNew}
            />
            <ExportReportButton />
          </div>
          <div className="w-full flex justify-end items-center gap-2 md:hidden mt-4">
            <ProfileButton
              onNeedAuth={() => setShowAuthModal(true)}
              onSelectBusiness={loadBusiness}
              onNew={handleNew}
            />
            <ExportReportButton />
          </div>
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
            {/* The decorative line with animation */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute pointer-events-none hidden md:block" 
              style={{
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
                <motion.path
                  d="M 100 0 C 100 50, 100 50, 100 150"
                  stroke="#3F3F3F"
                  strokeWidth="4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              </svg>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <PitchCard
                pitch={pitch}
                onRegenerate={handleRegenerate}
                onClose={handleLooksGood} 
                // "Looks Good" => show extra buttons
              />
            </motion.div>

            {/* Show extra buttons below the pitch card */}
            {showExtraButtons && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <ExtraButtons
                  pitch={pitch}
                  company={company}
                  problem={problem}
                  customers={customers}
                  valueProposition={valueProposition}
                  painPoints={painPoints}
                  personas={personas}
                  nextSteps={nextSteps}
                  gtmStrategy={gtmStrategy}
                  competitorReport={competitorReport}
                />
              </motion.div>
            )}
          </>
        )}

        {/* Sign-in modal */}
        <SignInModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      </div>
    </div>
  );
}

