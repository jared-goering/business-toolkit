import React, { ReactNode } from 'react';
import { CitationLink } from './CitationLink';

// Component for processing paragraph text with citations
export const ProcessedParagraph = ({ children, ...props }: { children: ReactNode } & React.HTMLAttributes<HTMLParagraphElement>) => {
  if (typeof children !== 'string') {
    return <p className="my-2 text-[#EFEFEF]" {...props}>{children}</p>;
  }
  
  const text = children.toString();
  
  // Check for citations [1], [2], etc.
  if (text.includes('[') && /\[\d+\]/.test(text)) {
    const parts = text.split(/\[(\d+)\](?!\()/);
    
    return (
      <p className="my-2 text-[#EFEFEF]" {...props}>
        {parts.map((part, i) => {
          // Even indices are text, odd indices are citation numbers
          if (i % 2 === 0) return part;
          return <CitationLink key={i} num={part} />;
        })}
      </p>
    );
  }
  
  // Table title
  if (text.includes('Competitor Comparison Table')) {
    return <p className="text-lg font-semibold text-[#64B5F6] mt-4 mb-2" {...props}>{text}</p>;
  }
  
  return <p className="my-2 text-[#EFEFEF]" {...props}>{children}</p>;
}; 