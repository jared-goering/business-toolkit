'use client';

import { Button } from '@/components/ui/button';

export default function GTMStrategyButton() {
  return (
    <Button
      className="rounded-full w-5/6 px-6 py-2 border border-[#39FF14] bg-[#1C1C1C] text-[#39FF14] hover:bg-[#39FF14]/30 hover:border-[#39FF14] transition-colors duration-200"
    >
      Generate Detailed GTM Strategy
    </Button>
  );
}