import React from 'react';
import { SourceLink } from './SourceLink'; // Import SourceLink

interface SourcesSectionProps {
  content: string;
}

// Component for rendering sources section
export const SourcesSection = ({ content }: SourcesSectionProps) => {
  const sourceLines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  return (
    <div id="sources-cited" className="mt-2 space-y-2">
      {sourceLines.map((line, i) => {
        // Look for numbered citation patterns like [1], [2], etc.
        const citationMatch = line.match(/^\s*\[(\d+)\]\s*(.*)$/);
        
        if (citationMatch) {
          const num = citationMatch[1];
          const citationText = citationMatch[2];
          
          return (
            <div 
              key={i}
              id={`sources-cited-${num}`} 
              className="flex mb-2 text-[15px]"
            >
              <span className="text-[#64B5F6] mr-2 min-w-[30px]">[{num}]</span>
              <span className="text-[#EFEFEF]">
                <SourceLink text={citationText} />
              </span>
            </div>
          );
        }
        
        // Fallback for other formats
        return (
          <div key={i} className="mb-2 text-[15px] text-[#EFEFEF]">
            <SourceLink text={line} />
          </div>
        );
      })}
    </div>
  );
}; 