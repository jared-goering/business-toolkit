import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Components } from 'react-markdown';
import { markdownComponents } from '@/app/utils/markdownComponents'; // <‑‑ see update ④

export default function SectionAccordion({
  sections,
}: {
  sections: { heading: string; content: string }[];
}) {
  return (
    <Accordion.Root type="single" collapsible defaultValue={sections[0]?.heading} className="w-full">
      {sections.map(sec => (
        <Accordion.Item
          key={sec.heading}
          value={sec.heading}
          id={sec.heading}
          className="mt-2 rounded-md bg-zinc-800"
        >
          <Accordion.Header className="flex">
            <Accordion.Trigger className="flex w-full items-center justify-between py-3 px-4 text-base font-semibold hover:bg-zinc-700 hover:rounded-md">
              {sec.heading}
              <ChevronDown className="h-5 w-5 transition-transform data-[state=open]:rotate-180" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="px-4 pb-4 prose prose-invert prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents as Components}>
              {sec.content}
            </ReactMarkdown>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
