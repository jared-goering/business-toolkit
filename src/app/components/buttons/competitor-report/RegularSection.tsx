import React, { PropsWithChildren } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Element } from 'hast';
import { ProcessedParagraph } from './ProcessedParagraph'; // Import the extracted component

// Define types for custom component props - Use standard HTML attributes where possible
type HeadingProps = PropsWithChildren<React.HTMLAttributes<HTMLHeadingElement>>;
type ListProps = PropsWithChildren<React.HTMLAttributes<HTMLUListElement | HTMLOListElement>>;
type ListItemProps = PropsWithChildren<{ node?: Element; index?: number } & React.LiHTMLAttributes<HTMLLIElement>>; 
type LinkProps = PropsWithChildren<{ href?: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>>;
type TableCellProps = PropsWithChildren<{ isHeader?: boolean; style?: React.CSSProperties; node?: Element } & React.TdHTMLAttributes<HTMLTableCellElement>>;
type TableRowProps = PropsWithChildren<React.HTMLAttributes<HTMLTableRowElement>>;
type TableSectionProps = PropsWithChildren<React.HTMLAttributes<HTMLTableSectionElement>>;
type TableProps = PropsWithChildren<React.TableHTMLAttributes<HTMLTableElement>>;
type ParagraphProps = PropsWithChildren<React.HTMLAttributes<HTMLParagraphElement>>;
type EmphasisProps = PropsWithChildren<React.HTMLAttributes<HTMLElement>>;
type StrongProps = PropsWithChildren<React.HTMLAttributes<HTMLElement>>;

interface RegularSectionProps {
  content: string;
  company: string;
}

// Render markdown within a regular section
export const RegularSection = ({ content, company }: RegularSectionProps) => {
  // Components with more specific types
  const markdownComponents: Partial<Components> = {
    table: ({ children, ...props }: TableProps) => (
        <div className="overflow-x-auto my-4">
          <table {...props} className="min-w-full border-collapse text-sm rounded-md border border-[#4F4F4F]">
            {children}
          </table>
        </div>
      ),
      
      thead: ({ children, ...props }: TableSectionProps) => (
        <thead {...props} className="bg-[#2A2A2A] text-[#EFEFEF] font-medium">
          {children}
        </thead>
      ),
      
      tr: ({ children, ...props }: TableRowProps) => (
        <tr {...props} className="odd:bg-[#2D2D2D] even:bg-[#262626] border-b border-[#3F3F3F] last:border-b-0">
          {children}
        </tr>
      ),
      
      th: ({ children, ...props }: TableCellProps) => (
        <th {...props} className="px-4 py-3 text-left">{children}</th>
      ),
      
      // Use the simpler td component from GTMStrategyButton for consistency
      td: ({ children, ...props }: TableCellProps) => (
        <td {...props} className="px-4 py-3">{children}</td>
      ),
      
    h1: ({ children, ...props }: HeadingProps) => (
      <h1 {...props} className="text-xl sm:text-2xl font-bold text-[#EFEFEF] mt-4 mb-2">{children}</h1>
    ),
    
    h2: ({ children, ...props }: HeadingProps) => {
      if (typeof children === 'string' && children.toString().includes('Sources Cited')) {
        return (
          <h2 id="sources-cited" {...props} className="text-lg sm:text-xl font-semibold text-[#64B5F6] mt-6 mb-3 pb-2 border-b border-[#3F3F3F]">
            {children}
          </h2>
        );
      }
      return (
        <h2 {...props} className="text-lg sm:text-xl font-semibold text-[#64B5F6] mt-6 mb-3 pb-2 border-b border-[#3F3F3F]">
          {children}
        </h2>
      );
    },
    
    h3: ({ children, ...props }: HeadingProps) => (
      <h3 {...props} className="text-base sm:text-lg font-medium text-[#81C784] mt-3 mb-1">{children}</h3>
    ),
    
    p: ({ children, ...props }: ParagraphProps) => (
      // Use the imported component
      <ProcessedParagraph {...props}>{children}</ProcessedParagraph>
    ),
    
    ul: ({ children, ...props }: ListProps) => (
      <ul {...props} className="list-disc list-outside ml-4 text-[#EFEFEF] my-2">{children}</ul>
    ),
    
    ol: ({ children, ...props }: ListProps) => (
      <ol {...props} className="list-decimal list-outside ml-4 text-[#EFEFEF] my-2">{children}</ol>
    ),
    
    li: ({ node, children, index, ...props }: ListItemProps) => {
      const seemsLikeSourceItem = (node as any)?.parent?.type === 'element' && 
                                (node as any)?.parent?.tagName === 'ol' && 
                                (node as any)?.parent?.children?.[0]?.type === 'text' && 
                                (node as any).parent.children[0]?.value?.includes('Sources Cited');

      if (seemsLikeSourceItem) { 
        const content = typeof children === 'string' ? children : 
                       (Array.isArray(children) ? children.join('') : '');
        
        if (content && (content.includes('http') || content.includes('www.'))) {
          const urlRegex = /(https?:\/\/[^\s]+)/g;
          const matches = content.match(urlRegex);
          
          if (matches && matches.length > 0) {
            const url = matches[0];
            const parts = content.split(url);
            
            return (
              <li id={`sources-cited-${index ?? Math.random()}`} className="text-sm sm:text-base text-[#EFEFEF] my-0.5" {...props}>
                {parts[0]}
                <a
                  href={url}
                  className="text-[#64B5F6] hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {url}
                </a>
                {parts[1] || ''}
              </li>
            );
          }
        }
        
        return (
          <li id={`sources-cited-${index ?? Math.random()}`} className="text-sm sm:text-base text-[#EFEFEF] my-0.5" {...props}>
            {children}
          </li>
        );
      }
      
      return <li key={index ?? Math.random()} className="text-sm sm:text-base text-[#EFEFEF] my-0.5" {...props}>{children}</li>;
    },
    
    strong: ({ children, ...props }: StrongProps) => {
      if (!children) return null;
      
      if (typeof children !== 'string') {
        return <strong {...props} className="font-semibold text-[#EFEFEF]">{children}</strong>;
      }
      
      const text = children.toString().replace(/^#{1,4}\s*/, '');
      
      if (
        /\b(?:Inc|LLC|Ltd|GmbH|Corp|SA|SL|Company|Technologies)\b/i.test(text) || 
        text.includes(company)
      ) {
        return <strong {...props} className="text-[#81C784] font-semibold">{text}</strong>;
      }
      
      return <strong {...props} className="font-semibold text-[#EFEFEF]">{text}</strong>;
    },
    
    em: ({ children, ...props }: EmphasisProps) => {
      if (!children) return null;
      
      if (typeof children === 'string' && children.includes('%')) {
        return <em {...props} className="text-[#FFC107] not-italic font-medium">{children}</em>;
      }
      return <em {...props} className="italic text-[#EFEFEF]">{children}</em>;
    },
  };
  
  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}; 