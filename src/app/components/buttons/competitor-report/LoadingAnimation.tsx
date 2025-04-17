import React from 'react';
import { Spinner } from 'phosphor-react';

interface LoadingAnimationProps {
  loadingText: string;
  nextLoadingText: string;
  isAnimating: boolean;
}

// Loading animation component
export const LoadingAnimation = ({ loadingText, nextLoadingText, isAnimating }: LoadingAnimationProps) => {
  return (
    <span className="flex items-center">
      <Spinner size={20} className="mr-2 animate-spin" />
      <div className="min-w-[180px] h-6 overflow-hidden relative">
        <div 
          className={`flex flex-col ${
            isAnimating 
              ? "transform -translate-y-6 transition-transform duration-[400ms] ease-in-out" 
              : "transform translate-y-0 transition-none"
          }`}
        >
          <span className="text-center h-6 flex items-center justify-center">{loadingText}</span>
          <span className="text-center h-6 flex items-center justify-center">{nextLoadingText}</span>
        </div>
      </div>
    </span>
  );
}; 