// components/MarkdownTOC.tsx
import { useEffect, useState } from 'react';
import type { MarkdownSection } from '@/app/utils/markdownUtils';   // ← add this line

export default function MarkdownTOC({ sections }: { sections: MarkdownSection[] }) {
  const [active, setActive] = useState<string>('');

  // highlight the section currently in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries =>
        entries.forEach(e => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-40% 0px -50% 0px' } // middle of viewport
    );
    sections.forEach(s => {
      const el = document.getElementById(s.heading);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav className="sticky top-4 hidden lg:block w-56 text-sm">
      <ul className="space-y-2 border-l border-gray-700 pl-3">
        {sections.map(sec => (
          <li key={sec.heading}>
            <button
              onClick={() =>
                document.getElementById(sec.heading)?.scrollIntoView({ behavior: 'smooth' })
              }
              className={`hover:text-primary transition-colors ${
                active === sec.heading ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {sec.heading}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
