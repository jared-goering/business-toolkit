import React from 'react';

// Citation link component
export const CitationLink = ({ num, children }: { num: string, children?: React.ReactNode }) => {
  return (
    <a 
      href={`#sources-cited-${num}`}
      className="text-[#64B5F6] hover:underline cursor-pointer inline-block mx-0.5 pointer-events-auto"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const element = document.getElementById(`sources-cited-${num}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }}
    >
      {children || `[${num}]`}
    </a>
  );
}; 