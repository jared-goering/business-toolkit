export interface MarkdownSection {
  heading: string;
  content: string;
}

// Function to split markdown into sections by headings
export const splitMarkdownIntoSections = (markdown: string): MarkdownSection[] => {
  const lines = markdown.split('\n');
  const sections: MarkdownSection[] = [];

  let firstSectionFound = false;
  let currentHeading = '';
  let currentContent: string[] = [];

  lines.forEach(line => {
    // Match H1 or H2 headings
    const headingMatch = line.match(/^#{1,2}\s+(.+)$/); 
    if (headingMatch) {
      // If we already have content or a heading, save the previous section
      if (currentHeading || currentContent.some(l => l.trim())) {
        sections.push({
          // Use default heading if none was found before content
          heading: currentHeading || 'Overview', 
          content: currentContent.join('\n').trim()
        });
      }
      // Start a new section
      currentHeading = headingMatch[1].trim();
      currentContent = [];
      firstSectionFound = true;
    } else {
      // Add non-empty lines to current content
      if (line.trim()) { 
          currentContent.push(line);
          // If this content appears before any heading, mark that we have a first section
          if (!firstSectionFound) {
              firstSectionFound = true; 
          }
      }
    }
  });

  // Add the last section if it has content or a heading
  if (currentHeading || currentContent.some(l => l.trim())) {
    sections.push({
      heading: currentHeading || 'Final Section', // Provide a fallback heading
      content: currentContent.join('\n').trim()
    });
  }
  
  // If no sections were parsed at all (e.g., empty input or only whitespace)
  // return an empty array or a default section as needed.
  if (sections.length === 0 && markdown.trim()) {
     return [{ heading: 'Content', content: markdown.trim() }];
  }

  return sections;
}; 