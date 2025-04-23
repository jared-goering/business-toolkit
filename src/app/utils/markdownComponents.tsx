import type { Components } from 'react-markdown';
import { PropsWithChildren } from 'react';
import remarkGfm from 'remark-gfm';

// Helper to replace citation numbers like [3] with clickable links
const renderWithCitations = (text: string) => {
  const parts = text.split(/(\[\d+\])/g);
  return parts.map((part, idx) => {
    const match = part.match(/^\[(\d+)\]$/);
    if (match) {
      const num = match[1];
      return (
        <a
          key={idx}
          href={`#sources-cited-${num}`}
          className="text-primary underline hover:opacity-80 cursor-pointer"
          onClick={e => {
            e.preventDefault();
            const el = document.getElementById(`sources-cited-${num}`);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          [{num}]
        </a>
      );
    }
    return part;
  });
};

export const markdownComponents: Partial<Components> = {
  h1: props => <h1 {...props} className="mt-6 mb-3 text-2xl font-semibold text-zinc-50" />,
  h2: props => (
    <h2
      {...props}
      className="mt-5 mb-2 text-lg font-semibold border-b border-zinc-700 pb-1 text-zinc-50"
    />
  ),
  h3: props => <h3 {...props} className="mt-4 mb-1 text-base font-semibold text-zinc-100" />,
  p: ({ children, ...props }) => {
    if (typeof children === 'string') {
      return (
        <p {...props} className="my-2 leading-[1.65] text-zinc-200">
          {renderWithCitations(children)}
        </p>
      );
    }
    return <p {...props} className="my-2 leading-[1.65] text-zinc-200">{children}</p>;
  },
  li: ({ children, ...props }) => {
    if (typeof children === 'string') {
      return (
        <li {...props} className="my-1 leading-[1.65] text-zinc-200">
          {renderWithCitations(children)}
        </li>
      );
    }
    return <li {...props} className="my-1 leading-[1.65] text-zinc-200">{children}</li>;
  },
  ol: props => <ol {...props} className="list-decimal pl-6 my-2" />,
  ul: props => <ul {...props} className="list-disc pl-6 my-2" />,
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full text-sm border-collapse rounded-md">
        {children}
      </table>
    </div>
  ),
  thead: props => <thead {...props} className="bg-zinc-800 text-zinc-200" />,
  tr: props => <tr {...props} className="odd:bg-zinc-900 even:bg-zinc-800" />,
  th: props => <th {...props} className="px-4 py-3 text-left font-medium" />,
  td: props => <td {...props} className="px-4 py-3" />,
  a: props => (
    <a
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline hover:opacity-80"
    />
  ),
};
