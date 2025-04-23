import { MarkdownSection } from '@/app/utils/markdownUtils';

// NEW helper – utils/splitSections.ts (if you like)
export function splitForAccordion(sections: MarkdownSection[]) {
    const [titleSection, ...accordionSections] = sections;
    return { titleSection, accordionSections };
  }
  