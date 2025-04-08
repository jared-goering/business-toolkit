'use client';

import { useEffect } from 'react';

export function DialogLinkFixer() {
  useEffect(() => {
    console.log("DialogLinkFixer mounted");
    
    // Simple function to handle document clicks
    const handleDocumentClick = (e: MouseEvent) => {
      // Find target link (if any)
      let target = e.target as HTMLElement;
      
      // Navigate up the DOM tree looking for an anchor
      while (target && target.tagName !== 'A' && target !== document.body) {
        target = target.parentElement as HTMLElement;
      }
      
      // If we found an anchor in dialog
      if (target && target.tagName === 'A' && target.closest('.dialog-content')) {
        const link = target as HTMLAnchorElement;
        const href = link.getAttribute('href');
        
        // Process if we have a valid href
        if (href) {
          console.log(`Link clicked: ${href}`);
          
          // Handle based on link type
          if (href.startsWith('#')) {
            e.preventDefault();
            // Internal link - scroll to element
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
              targetElement.scrollIntoView({ behavior: 'smooth' });
            }
          } else if (href.startsWith('http://') || href.startsWith('https://')) {
            e.preventDefault();
            // External link - open in new tab
            window.open(href, '_blank', 'noopener,noreferrer');
          }
        }
      }
    };
    
    // Add the global click handler with capture
    document.addEventListener('click', handleDocumentClick, true);
    
    // Clean up
    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
    };
  }, []);

  return null;
} 