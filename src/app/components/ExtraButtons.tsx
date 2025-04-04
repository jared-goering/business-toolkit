'use client';

import TargetPersonaColumn from './buttons/TargetPersonaColumn';
import CustomerPainPointsColumn from './buttons/CustomerPainPointsColumn';
import ValuePropositionMappingColumn from './buttons/ValuePropositionMappingColumn';

import CompetitorReportButton from './buttons/CompetitorReportButton';
import GTMStrategyButton from './buttons/GTMStrategyButton';
import NextStepsButton from './buttons/NextStepsButton';
import { motion } from 'framer-motion';

interface ExtraButtonsProps {
  pitch: string;
  company: string;
  problem: string;
  customers: string;
  valueProposition: string;
  painPoints: string[];
  personas: string[];
}

export default function ExtraButtons({
  pitch,
  company,
  problem,
  customers,
  valueProposition,
  painPoints,
  personas
}: ExtraButtonsProps) {
  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  return (
    <motion.section 
      className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 w-full"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Column 1 */}
      <motion.div 
        className="w-full flex flex-col items-center space-y-4"
        variants={itemVariants}
      >
        <ValuePropositionMappingColumn
          pitch={pitch}
          company={company}
          problem={problem}
          customers={customers}
        />
        <NextStepsButton />
      </motion.div>

      {/* Column 2 */}
      <motion.div 
        className="w-full flex flex-col items-center space-y-4"
        variants={itemVariants}
      >
        <CustomerPainPointsColumn
          pitch={pitch}
          company={company}
          problem={problem}
          customers={customers}
        />
        <GTMStrategyButton 
          pitch={pitch}
          company={company}
          problem={problem}
          customers={customers}
          valueProposition={valueProposition}
          painPoints={painPoints}
          personas={personas}
        />
      </motion.div>

      {/* Column 3 */}
      <motion.div 
        className="w-full flex flex-col items-center space-y-4"
        variants={itemVariants}
      >
        <TargetPersonaColumn
          pitch={pitch}
          company={company}
          problem={problem}
          customers={customers}
        />
        <CompetitorReportButton 
          pitch={pitch}
          company={company}
          problem={problem}
          customers={customers}
          valueProposition={valueProposition}
        />
      </motion.div>

    </motion.section>
  );
}
