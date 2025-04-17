import React from 'react';

interface SourcesSectionProps {
  content: string;
}

// Custom SourcesSection component to handle the references section
export const SourcesSection = ({ content }: SourcesSectionProps) => {
  const lines = content.split('\n').filter(line => line.trim());
  return (
    <div className="mt-4">
      {lines.map((line, index) => {
        // Look for patterns like: [1] http://example.com
        const urlMatch = line.match(/^\[(\d+)\]\s+(https?:\/\/\S+)(.*)$/);
        if (urlMatch) {
          const num = urlMatch[1];
          const url = urlMatch[2];
          const rest = urlMatch[3] || '';
          return (
            <div key={index} id={`sources-cited-${num}`} className="flex mb-2 text-[15px]">
              <span className="text-[#64B5F6] mr-2 min-w-[30px]">[{num}]</span>
              <a 
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#64B5F6] underline hover:text-[#9EE7FF] cursor-pointer break-all"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(url, '_blank', 'noopener,noreferrer');
                }}
              >
                {url}
              </a>
              {rest && <span className="ml-1">{rest}</span>}
            </div>
          );
        }
        
        // Look for patterns with more description: [1] Title (http://example.com)
        const complexMatch = line.match(/^\[(\d+)\]\s+(.*?)\s+(https?:\/\/\S+)(.*)$/);
        if (complexMatch) {
          const num = complexMatch[1];
          const prefix = complexMatch[2];
          const url = complexMatch[3];
          const suffix = complexMatch[4] || '';
          return (
            <div key={index} id={`sources-cited-${num}`} className="flex mb-2 text-[15px]">
              <span className="text-[#64B5F6] mr-2 min-w-[30px]">[{num}]</span>
              <span>
                {prefix}
                <a 
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#64B5F6] underline hover:text-[#9EE7FF] cursor-pointer break-all"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                >
                  {url}
                </a>
                {suffix}
              </span>
            </div>
          );
        }
        
        // Fallback for other formats
        const numMatch = line.match(/^\[(\d+)\]/);
        if (numMatch) {
          const num = numMatch[1];
          return (
            <div key={index} id={`sources-cited-${num}`} className="flex mb-2 text-[15px]">
              <span className="text-[#64B5F6] mr-2 min-w-[30px]">[{num}]</span>
              <span className="text-[#EFEFEF]">{line.replace(/^\[\d+\]\s*/, '')}</span>
            </div>
          );
        }
        
        // For other lines that don't match our patterns
        return (
          <div key={index} className="mb-2 text-[15px] text-[#EFEFEF]">
            {line}
          </div>
        );
      })}
    </div>
  );
}; 