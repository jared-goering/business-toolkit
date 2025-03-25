'use client';

import TargetPersonaColumn from './TargetPersonaColumn';
import CustomerPainPointsColumn from './CustomerPainPointsColumn';
import ValuePropositionMappingColumn from './ValuePropositionMappingColumn';

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
    <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
      <TargetPersonaColumn
        pitch={pitch}
        company={company}
        problem={problem}
        customers={customers}
      />
      <CustomerPainPointsColumn
        pitch={pitch}
        company={company}
        problem={problem}
        customers={customers}
      />
      <ValuePropositionMappingColumn
        pitch={pitch}
        company={company}
        problem={problem}
        customers={customers}
      />
    </section>
  );
}