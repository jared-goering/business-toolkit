import React from 'react';

// Component for processing and displaying URLs in source citations
export const SourceLink = ({ text }: { text: string }) => {
  // Enhanced regex to find URLs in various formats, including URLs at the end of lines
  // and URLs followed by parentheses or brackets
  const urlRegex = /(https?:\/\/[^\s)]+)(?:\)?|\s|$)/g;
  const matches = Array.from(text.matchAll(urlRegex));
  
  if (!matches || matches.length === 0) {
    return <>{text}</>;
  }
  
  let lastIndex = 0;
  const parts = [];
  
  matches.forEach((match, i) => {
    const url = match[1];
    const fullMatchStart = match.index!;
    const fullMatchEnd = match.index! + match[0].length;
    
    // Add text before the URL
    if (fullMatchStart > lastIndex) {
      parts.push(text.substring(lastIndex, fullMatchStart));
    }
    
    // Check if URL is wrapped in parentheses
    const isWrappedInParentheses =
      text.charAt(fullMatchStart - 1) === '(' &&
      text.charAt(fullMatchEnd - 1) === ')';
    
    // Use the actual URL as the link text
    const linkText = url;
    
    parts.push(
      <a 
        key={i}
        href={url} 
        data-href={url}
        className="text-[#64B5F6] hover:text-[#9EE7FF] underline px-1 py-0.5 rounded hover:bg-[#333] cursor-pointer break-all z-[1] inline-block relative" 
        target="_blank" 
        rel="noopener noreferrer"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          window.open(url, '_blank', 'noopener,noreferrer');
          return false;
        }}
      >
        {linkText}
      </a>
    );
    
    // Skip the closing parenthesis if the URL was wrapped in parentheses
    lastIndex = fullMatchEnd - (isWrappedInParentheses ? 1 : 0);
  });
  
  // Add any remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return <>{parts}</>;
}; 