'use client';

import TargetPersonaColumn from './buttons/TargetPersonaColumn';
import CustomerPainPointsColumn from './buttons/CustomerPainPointsColumn';
import ValuePropositionMappingColumn from './buttons/ValuePropositionMappingColumn';

import CompetitorReportButton from './buttons/CompetitorReportButton';
import GTMStrategyButton from './buttons/GTMStrategyButton';
import NextStepsButton from './buttons/NextStepsButton';

interface ExtraButtonsProps {
  pitch: string;
  company: string;
  problem: string;
  customers: string;
}

export default function ExtraButtons({
  pitch,
  company,
  problem,
  customers,
}: ExtraButtonsProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 w-full">
      {/* Column 1 */}

     
      <div className="w-full flex flex-col items-center space-y-4">
        <ValuePropositionMappingColumn
          pitch={pitch}
          company={company}
          problem={problem}
          customers={customers}
        />
        <NextStepsButton />
      </div>

      {/* Column 2 */}
      <div className="w-full flex flex-col items-center space-y-4">
        <CustomerPainPointsColumn
          pitch={pitch}
          company={company}
          problem={problem}
          customers={customers}
        />
        <GTMStrategyButton />
      </div>

 {/* Column 3 */}
      <div className="w-full flex flex-col items-center space-y-4">
        <TargetPersonaColumn
          pitch={pitch}
          company={company}
          problem={problem}
          customers={customers}
        />
        <CompetitorReportButton />
      </div>

    </section>
  );
}
