import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { SourcesSection } from './SourcesSection'; // Assuming SourcesSection is also extracted
import { RegularSection } from './RegularSection'; // Import RegularSection

interface SectionCardProps {
  heading: string;
  content: string;
  company: string;
  isSources?: boolean;
}

// Main section card component
export const SectionCard = ({ heading, content, company, isSources = false }: SectionCardProps) => {
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
            {/* Ensure SourcesSection is correctly imported or defined */}
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