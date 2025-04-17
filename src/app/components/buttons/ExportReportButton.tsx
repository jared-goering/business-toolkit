'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DownloadSimple, Spinner } from 'phosphor-react';
import { useReport, ReportData } from '@/context/ReportContext';
import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
} from 'docx';

/**
 * Create a Paragraph with heading style.
 */
const heading = (text: string, level: HeadingLevel = HeadingLevel.HEADING_1) =>
  new Paragraph({ text, heading: level });

const textRunsWithBold = (raw: string): TextRun[] => {
  const parts = raw.split(/\*\*/);
  return parts.map((part, idx) => new TextRun({ text: part, bold: idx % 2 === 1 }));
};

const makeParagraph = (raw: string): Paragraph => {
  return new Paragraph({ children: textRunsWithBold(raw), spacing: { after: 120 } });
};

const plainPara = (text: string) => makeParagraph(text);

/**
 * Very small markdown-ish converter to Paragraphs
 */
function markdownToParagraphs(md: string): Paragraph[] {
  if (!md) return [];
  const lines = md.split(/\r?\n/);
  const paragraphs: Paragraph[] = [];

  lines.forEach((raw) => {
    const line = raw.trim();
    if (!line) {
      // blank line to add spacing
      paragraphs.push(new Paragraph({ text: '' }));
      return;
    }

    // Headings
    if (line.startsWith('#')) {
      const levelMatch = line.match(/^(#+)\s+/);
      const hashes = levelMatch ? levelMatch[1].length : 1;
      const text = line.replace(/^#+\s+/, '').replace(/\*\*/g, '');
      paragraphs.push(
        new Paragraph({ text, heading: hashes === 1 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3 })
      );
      return;
    }

    // Bullets
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const text = line.substring(2).trim();
      paragraphs.push(
        new Paragraph({ children: textRunsWithBold(text), bullet: { level: 0 } })
      );
      return;
    }

    // Numbered list (e.g., "1. text")
    const numMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      const text = `${numMatch[1]}. ${numMatch[2]}`;
      paragraphs.push(makeParagraph(text));
      return;
    }

    // default plain paragraph
    paragraphs.push(plainPara(line));
  });

  return paragraphs;
}

/**
 * Build the Word document from collected report data.
 */
function buildDocument(data: ReportData): Document {
  const children: Paragraph[] = [];

  children.push(heading('Venture Forge – Startup Report'));

  // Basic fields always present
  children.push(heading('1. Company'), plainPara(data.company || '—'));
  children.push(heading('2. Core Problem'), plainPara(data.problem || '—'));
  children.push(heading('3. Target Customers'), plainPara(data.customers || '—'));

  // Pitch
  if (data.pitch) {
    children.push(heading('4. Pitch'), ...markdownToParagraphs(data.pitch));
  }

  // Optional sections
  if (data.valueProposition) {
    children.push(heading('5. Value Proposition Mapping'), ...markdownToParagraphs(data.valueProposition));
  }
  if (data.customerPainPoints && (Array.isArray(data.customerPainPoints) ? data.customerPainPoints.length : data.customerPainPoints)) {
    children.push(heading('6. Customer Pain Points'));
    const content = Array.isArray(data.customerPainPoints)
      ? (data.customerPainPoints as string[]).map((p) => `- ${p}`).join('\n')
      : (data.customerPainPoints as string);
    children.push(...markdownToParagraphs(content));
  }
  if (data.personas && data.personas.length) {
    children.push(heading('7. Target Personas'));
    data.personas.forEach((p: any, idx: number) => {
      children.push(plainPara(`${idx + 1}. ${p.name || p.title || 'Persona'}`));
      if (p.description) children.push(plainPara(p.description));
    });
  }
  if (data.nextSteps) {
    children.push(heading('8. Next Steps'), ...markdownToParagraphs(data.nextSteps));
  }
  if (data.gtmStrategy) {
    children.push(heading('9. GTM Strategy'), ...markdownToParagraphs(data.gtmStrategy));
  }
  if (data.competitorReport) {
    children.push(heading('10. Competitor Report'), ...markdownToParagraphs(data.competitorReport));
  }

  return new Document({ sections: [{ children }] });
}

export default function ExportReportButton() {
  const report = useReport();
  const [loading, setLoading] = useState(false);
  const [hovering, setHovering] = useState(false);

  const ready = Boolean(report.pitch && report.pitch.trim().length > 0);

  const handleExport = async () => {
    if (!ready) return;
    setLoading(true);
    try {
      const doc = buildDocument(report);
      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'ventureforge_report.docx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting report:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={loading || !ready}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={`w-full rounded-full px-6 py-3 h-[52px] flex items-center justify-center transition-colors duration-200
        ${ready ? 'border-[#FDE03B] bg-[#1C1C1C] text-[#FDE03B] hover:bg-[#FDE03B]/10' : 'border-gray-600 bg-[#2F2F2F] text-gray-500 cursor-not-allowed'}`}
    >
      {loading ? (
        <span className="flex items-center">
          <Spinner size={20} className="mr-2 animate-spin" />
          Exporting...
        </span>
      ) : (
        <span className="flex items-center">
          <DownloadSimple
            size={28}
            weight={hovering ? 'fill' : 'bold'}
            className="mr-2"
          />
          Export Report
        </span>
      )}
    </Button>
  );
} 