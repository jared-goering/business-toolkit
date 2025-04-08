'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkle, Spinner, Eye } from 'phosphor-react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { Card } from '@/components/ui/card';

interface GTMStrategyButtonProps {
  pitch: string;
  company: string;
  problem: string;
  customers: string;
  valueProposition: string;
  painPoints: string[];
  personas: any[];
}

// Helper function to process reference text
const processReferenceText = (text: string) => {
  const urlMatch = text.match(/\((https?:\/\/[^\s)]+)\)/);
  const sourceText = text.replace(/\((https?:\/\/[^\s)]+)\)/, '').trim();
  
  return (
    <>
      {sourceText}
      {urlMatch && (
        <a 
          href={urlMatch[1]} 
          className="ml-1 text-[#64B5F6] hover:underline" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          [Link]
        </a>
      )}
    </>
  );
};

export default function GTMStrategyButton({
  pitch,
  company,
  problem,
  customers,
  valueProposition,
  painPoints,
  personas
}: GTMStrategyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [hoverSparkle, setHoverSparkle] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [hoverViewResults, setHoverViewResults] = useState(false);
  const [gtmStrategy, setGtmStrategy] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [sections, setSections] = useState<{ heading: string; content: string }[]>([]);
  const [loadingText, setLoadingText] = useState<string>("Thinking...");
  const [nextLoadingText, setNextLoadingText] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState(false);

  // Function to split markdown into sections by h2 headings
  const splitMarkdownIntoSections = (markdown: string) => {
    const lines = markdown.split('\n');
    const sections: { heading: string; content: string }[] = [];
    
    let currentHeading = '';
    let currentContent: string[] = [];
    
    // Handle if first section doesn't have an h2
    let foundFirstH2 = false;
    let initialContent: string[] = [];
    
    lines.forEach(line => {
      const h2Match = line.match(/^##\s+(.+)$/);
      const h1Match = line.match(/^#\s+(.+)$/);
      
      if (h1Match && !foundFirstH2) {
        initialContent.push(line);
      } else if (h2Match) {
        foundFirstH2 = true;
        // If we already have a section, save it
        if (currentHeading) {
          sections.push({
            heading: currentHeading,
            content: currentContent.join('\n')
          });
        } else if (initialContent.length > 0) {
          // Add the initial content as a section
          sections.push({
            heading: "Overview",
            content: initialContent.join('\n')
          });
          initialContent = [];
        }
        // Start a new section
        currentHeading = h2Match[1];
        currentContent = [];
      } else if (foundFirstH2) {
        currentContent.push(line);
      } else {
        initialContent.push(line);
      }
    });
    
    // Add the last section
    if (currentHeading) {
      sections.push({
        heading: currentHeading,
        content: currentContent.join('\n')
      });
    }
    // Add any remaining initial content if no h2 was found
    else if (initialContent.length > 0) {
      sections.push({
        heading: "Overview",
        content: initialContent.join('\n')
      });
    }
    
    return sections;
  };

  // Process the markdown when gtmStrategy changes
  useEffect(() => {
    if (gtmStrategy) {
      const processedSections = splitMarkdownIntoSections(gtmStrategy);
      setSections(processedSections);
    }
  }, [gtmStrategy]);

  // Rotating loading text with rolodex animation
  useEffect(() => {
    if (!loading) return;
    
    const loadingTexts = [
      "Thinking...",
      "Scanning sources...",
      "This could take some time...",
      "Analyzing market data...",
      "Crafting your strategy..."
    ];
    
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      // Set the next text but don't update current text yet
      currentIndex = (currentIndex + 1) % loadingTexts.length;
      setNextLoadingText(loadingTexts[currentIndex]);
      
      // Trigger animation
      setIsAnimating(true);
      
      // After animation completes, update the current text and reset position without animation
      setTimeout(() => {
        setLoadingText(loadingTexts[currentIndex]);
        setIsAnimating(false);
      }, 400); // Animation duration
    }, 2500);
    
    return () => clearInterval(intervalId);
  }, [loading]);

  const handleGenerateGTMStrategy = async () => {
    if (generated) {
      setModalOpen(true);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/generate-gtm-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pitch, 
          company, 
          problem, 
          customers,
          valueProposition,
          painPoints,
          personas
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate GTM strategy');
      }
      
      const data = await response.json();
      setGtmStrategy(data.gtmStrategy);
      setGenerated(true);
      setModalOpen(true);
    } catch (error) {
      console.error('Error generating GTM strategy:', error);
    } finally {
      setLoading(false);
    }
  };

  // Special handler for the exact Key Metrics format seen in the image
  const handleKeyMetricsFormat = (content: string) => {
    // This handler specifically targets the format like:
    // | KPI | Target | Source |
    // |----------|----------|---------|
    // | Patient Engagement Rate | ≥70% | App usage data[12]|
    
    if (!content.includes('Key Metrics')) return null;
    
    // Extract raw lines with pipe characters
    let lines = content
      .split('\n')
      .filter(line => line.includes('|'));
    
    // Check if we have the minimum structure needed
    if (lines.length < 3) return null;
    
    // Check for numbered heading like "9. Key Metrics" and remove it
    lines = lines.filter(line => !line.match(/^\d+\.\s*Key Metrics/));
    
    // Find header row and separator row
    const headerRowIndex = lines.findIndex(line => 
      line.includes('KPI') || 
      line.includes('Metric') || 
      line.includes('Target') || 
      line.includes('Source')
    );
    
    if (headerRowIndex === -1) return null;
    
    // Get data rows (everything after header and separator)
    let dataRows = lines.slice(headerRowIndex + 2);
    if (dataRows.length === 0) {
      dataRows = lines.slice(headerRowIndex + 1);
    }
    
    // Process into table structure
    const headerCells = lines[headerRowIndex].split('|').filter(cell => cell.trim());
    
    // Build table manually to match exact styling from the image
    return (
      <div className="overflow-x-auto my-4">
        <div className="rounded-md border border-[#4F4F4F] bg-[#262626] overflow-hidden shadow-md">
          <table className="w-full border-collapse border-spacing-0 text-sm">
            <thead className="bg-[#2A2A2A]">
              <tr>
                {headerCells.map((cell, i) => (
                  <th 
                    key={i}
                    className="px-4 py-3 text-[#EFEFEF] font-medium text-left border-b border-[#3F3F3F]"
                  >
                    {cell.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, i) => {
                const cells = row.split('|').filter(cell => cell.trim());
                return (
                  <tr 
                    key={i}
                    className={`border-b border-[#3F3F3F] last:border-b-0 ${
                      i % 2 === 0 ? 'bg-[#2D2D2D]' : 'bg-[#262626]'
                    }`}
                  >
                    {cells.map((cell, j) => {
                      const trimmedContent = cell.trim();
                      // Handle citation references like [12]
                      const hasCitation = trimmedContent.match(/\[\d+\]$/);
                      // Style based on column position
                      const isMetricName = j === 0;
                      const isTargetValue = j === 1;
                      const isSourceInfo = j === 2;
                      
                      return (
                        <td 
                          key={j}
                          className={`
                            px-4 py-3 border-b border-[#3F3F3F] last:border-b-0
                            ${isMetricName ? 'font-medium text-[#EFEFEF]' : ''}
                            ${isTargetValue ? 'text-[#64B5F6] font-medium' : ''}
                            ${isSourceInfo ? 'text-gray-400' : ''}
                          `}
                        >
                          {hasCitation ? (
                            <>
                              {trimmedContent.replace(/\[\d+\]$/, '')}
                              <span className="text-[#64B5F6]">{hasCitation[0]}</span>
                            </>
                          ) : (
                            trimmedContent
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Specialized parser for Key Metrics tables that have a specific format
  const isKeyMetricsSection = (content: string) => {
    // Check for numbered or unnumbered "Key Metrics" section
    const hasKeyMetricsTitle = /(\d+\.\s+)?Key Metrics/i.test(content);
    
    // Check if it has pipe characters for table structure
    const hasPipes = content.includes('|');
    
    // Check if it contains common table headers for metrics
    const hasTableHeaders = 
      content.includes('KPI') || 
      content.includes('Metric') || 
      content.includes('Target') || 
      content.includes('Source');
    
    // Check for common formatting patterns in Key Metrics tables
    const hasDashSeparators = content.includes('|---') || content.includes('|-') || /\|\s*-+\s*\|/.test(content);
    
    return hasKeyMetricsTitle && hasPipes && (hasTableHeaders || hasDashSeparators);
  };

  // Direct rendering of pipe-delimited table text to preserve exact formatting
  const renderRawTableWithPipes = (content: string) => {
    // Extract all lines with pipe characters, maintaining order
    const lines = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.includes('|'));
      
    if (lines.length < 2) return null;
    
    // Preserve the exact pipe structure, since Key Metrics tables often have proper formatting
    // with pipes at beginning and end of lines
    const tableRows = lines.map(line => {
      // Split by pipe but preserve empty cells
      return line.split('|');
    });
    
    // For Key Metrics tables, separator rows often consist of dash characters between pipes
    // Looking for rows that have dashes between pipes or mostly dashes
    const separatorRowIndices = tableRows.map((row, index) => {
      const isDashRow = row.some((cell: string) => {
        const trimmed = cell.trim();
        return trimmed.match(/^-+$/) || trimmed.match(/^[-=]+$/);
      });
      return isDashRow ? index : -1;
    }).filter(index => index !== -1);
    
    // Find the header row (typically before a separator row or at index 0)
    const headerRowIndex = separatorRowIndices.length > 0 ? 
                          Math.min(...separatorRowIndices) - 1 : 
                          0;
    
    // Log for debugging
    console.log('Found Key Metrics table:');
    console.log('Rows:', tableRows.length);
    console.log('Headers at:', headerRowIndex);
    console.log('Separators at:', separatorRowIndices);
    
    return (
      <div className="overflow-x-auto my-4">
        <div className="rounded-md border border-[#4F4F4F] bg-[#262626] overflow-hidden shadow-md">
          <table className="min-w-full border-collapse text-sm">
            <tbody>
              {tableRows.map((row, rowIndex) => {
                // Skip separator rows with dashes
                if (separatorRowIndices.includes(rowIndex)) return null;
                
                // Determine if this is a header row
                const isHeader = rowIndex === headerRowIndex;
                
                return (
                  <tr 
                    key={rowIndex} 
                    className={`
                      border-b border-[#3F3F3F] last:border-b-0
                      ${isHeader ? 'bg-[#2A2A2A] font-medium' : rowIndex % 2 === 0 ? 'bg-[#2D2D2D]' : 'bg-[#262626]'}
                    `}
                  >
                    {row.map((cell: string, cellIndex) => {
                      const trimmedCell = cell.trim();
                      // Skip first and last cells if empty and the line starts/ends with |
                      if ((cellIndex === 0 || cellIndex === row.length - 1) && !trimmedCell) {
                        return null;
                      }
                      
                      // Determine cell styling based on content and position
                      const isFirstColumn = cellIndex === 1; // First column after leading pipe
                      const isSecondColumn = cellIndex === 2; // Target values
                      const isThirdColumn = cellIndex === 3; // Source information
                      
                      const hasCitation = trimmedCell.match(/\[\d+\]$/);
                      
                      return (
                        <td 
                          key={cellIndex} 
                          className={`
                            px-3 py-2 border-r border-[#3F3F3F] last:border-r-0
                            ${isHeader ? 'font-semibold text-[#EFEFEF]' : ''}
                            ${isFirstColumn && !isHeader ? 'font-medium text-[#EFEFEF]' : ''}
                            ${isSecondColumn && !isHeader ? 'text-[#64B5F6] font-medium' : ''}
                            ${isThirdColumn && !isHeader ? 'text-[#A0A0A0]' : ''}
                          `}
                        >
                          {hasCitation ? (
                            <>
                              {trimmedCell.replace(/\[\d+\]$/, '')}
                              <span className="text-[#64B5F6]">{hasCitation[0]}</span>
                            </>
                          ) : (
                            trimmedCell
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Specialized table parser for plaintext tables
  const parseTableFromText = (content: string) => {
    // Extract all lines that might be part of a table
    const lines = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.includes('|'));
    
    if (lines.length < 2) return null; // Not enough lines for a table
    
    // Process lines into a structured format
    const tableRows = lines.map(line => {
      return line
        .split('|')
        .map(cell => cell.trim())
        .filter(cell => cell !== '');
    });
    
    // Check if this is a separator row (contains only dashes and whitespace)
    const isSeparatorRow = (row: string[]) => {
      return row.every(cell => cell === '' || /^[-\s]+$/.test(cell));
    };
    
    // Find header rows and separator rows
    const headerRowIndex = 0; // Typically the first row
    const separatorIndices = tableRows
      .map((row, index) => isSeparatorRow(row) ? index : -1)
      .filter(index => index !== -1);
    
    return {
      tableRows,
      headerRowIndex,
      separatorIndices,
      hasHeader: tableRows.length > 0 && tableRows[0].length > 0
    };
  };

  // Generic formatter for markdown-style tables
  const handleGenericTableFormat = (content: string) => {
    // Extract all lines with pipe characters, including the section header if present
    const allLines = content.split('\n');
    
    // Find section title (optional) - looking for patterns like "4. Pricing Strategy"
    const titleLine = allLines.find(line => /^\d+\.\s+[A-Za-z\s]+/.test(line));
    
    // Check if this might be a pricing table
    const isPricingTable = 
      content.includes("Pricing Strategy") || 
      (content.includes("$") && content.includes("/mo")) ||
      (content.match(/\|\s*Price\s*\|/) !== null);
    
    // Extract lines with pipe characters that form the table
    const tableLines = allLines.filter(line => line.includes('|'));
    
    if (tableLines.length < 2) return null; // Need at least a header and a data row
    
    // Look for structural patterns indicating a table:
    // 1. Dash separator lines
    const hasDashSeparator = tableLines.some(line => 
      line.replace(/\|/g, '').trim().match(/^[-]+$/) || 
      line.includes('|---') || 
      line.includes('|-')
    );
    
    // 2. Consistent pipe structure (column alignment)
    const pipeCounts = tableLines.map(line => (line.match(/\|/g) || []).length);
    const isConsistentStructure = new Set(pipeCounts).size <= 2; // Allow at most 2 different counts (for header separation row)
    
    // 3. Consistent cell patterns (e.g., pricing formats, descriptive text)
    const hasPricingFormat = tableLines.some(line => /\$\d+(-\$\d+)?(\/\w+)?/.test(line));
    const hasCitations = tableLines.some(line => /\[\d+\]/.test(line));
    
    // More lenient check for tables without explicit separator rows
    const looksLikeTable = 
      // Has at least 3 pipe characters per line on average (suggesting columns)
      pipeCounts.reduce((sum, count) => sum + count, 0) / pipeCounts.length >= 3 &&
      // And has consistent structure
      isConsistentStructure &&
      // And possibly has formatting indicating table data
      (hasPricingFormat || hasCitations || isPricingTable);
    
    // If it doesn't look like a well-formed table, skip this handler
    if (!hasDashSeparator && !looksLikeTable) return null;
    
    // Determine header and separator rows
    const separatorIndex = tableLines.findIndex(line => 
      line.replace(/\|/g, '').trim().match(/^[-]+$/) || 
      line.includes('|---') || 
      line.includes('|-')
    );
    
    // Header is typically the line before the separator, or the first line if no separator
    const headerIndex = separatorIndex > 0 ? separatorIndex - 1 : 0;
    
    // Process all data rows (rows that aren't header or separator)
    const dataRows = tableLines.filter((line, i) => {
      // Skip header, separator, or rows that are just dashes
      const isDashRow = line.replace(/\|/g, '').trim().match(/^[-]+$/);
      return i !== headerIndex && i !== separatorIndex && !isDashRow;
    });
    
    // Build table with appropriate styling
    return (
      <div className="overflow-x-auto my-4">
        <div className="rounded-md border border-[#4F4F4F] bg-[#262626] overflow-hidden shadow-md">
          <table className="w-full border-collapse border-spacing-0 text-sm">
            {/* Header row */}
            <thead className="bg-[#2A2A2A]">
              <tr>
                {tableLines[headerIndex].split('|')
                  .map((cell, i) => {
                    const trimmedCell = cell.trim();
                    // Skip empty cells at start/end
                    if ((i === 0 || i === tableLines[headerIndex].split('|').length - 1) && !trimmedCell) {
                      return null;
                    }
                    return (
                      <th 
                        key={i}
                        className="px-4 py-3 text-[#EFEFEF] font-medium text-left border-b border-[#3F3F3F]"
                      >
                        {trimmedCell}
                      </th>
                    );
                  })
                  .filter(Boolean) // Remove null elements
                }
              </tr>
            </thead>
            
            {/* Table body */}
            <tbody>
              {dataRows.map((row, rowIndex) => {
                // Split by pipe but preserve all cells including empty ones
                const cells = row.split('|');
                
                return (
                  <tr 
                    key={rowIndex}
                    className={`border-b border-[#3F3F3F] last:border-b-0 ${
                      rowIndex % 2 === 0 ? 'bg-[#2D2D2D]' : 'bg-[#262626]'
                    }`}
                  >
                    {cells.map((cell, cellIndex) => {
                      // Skip first and last cells if they're empty (from | at start/end of line)
                      if ((cellIndex === 0 || cellIndex === cells.length - 1) && !cell.trim()) {
                        return null;
                      }
                      
                      const trimmedContent = cell.trim();
                      
                      // Detect citations [1], [2], etc. or combined citations [12][10]
                      const hasCitation = trimmedContent.match(/\[\d+\](?!\()/);
                      const hasMultipleCitations = trimmedContent.match(/\[\d+\](\[\d+\])+/);
                      
                      // Detect pricing formats ($29-$99/mo)
                      const hasPricing = /\$\d+(-\$\d+)?(\/\w+)?/.test(trimmedContent);
                      
                      // Detect if this is a model/feature name column (usually first column)
                      const isFirstColumn = cellIndex === 1 || (cellIndex === 1 && cells[0].trim() === '');
                      
                      // Detect if this is a value/price column (usually second or third column)
                      const isValueColumn = 
                        (cellIndex === 2 || cellIndex === 3) || 
                        hasPricing;
                      
                      // Detect if this is a description/rationale column (usually last substantive column)
                      const isDescriptionColumn = 
                        (cellIndex >= 3 && cellIndex < cells.length - 1) ||
                        (trimmedContent.length > 20); // Longer text cells are likely descriptions
                      
                      // Process content with citation patterns
                      let formattedContent;
                      
                      if (hasMultipleCitations) {
                        // Handle adjacent citation patterns like [12][10]
                        formattedContent = (
                          <span dangerouslySetInnerHTML={{ 
                            __html: trimmedContent.replace(/\[(\d+)\]/g, '<span class="text-[#64B5F6]">[<span>$1</span>]</span>') 
                          }} />
                        );
                      } else if (hasCitation) {
                        // Handle single citations
                        const citMatch = trimmedContent.match(/\[\d+\](?!\()/);
                        formattedContent = (
                          <>
                            {trimmedContent.replace(/\[\d+\](?!\()/, '')}
                            <span className="text-[#64B5F6]">{citMatch ? citMatch[0] : ''}</span>
                          </>
                        );
                      } else if (hasPricing) {
                        // Highlight pricing information
                        formattedContent = (
                          <span className="text-[#64B5F6] font-medium">{trimmedContent}</span>
                        );
                      } else {
                        formattedContent = trimmedContent;
                      }
                      
                      return (
                        <td 
                          key={cellIndex}
                          className={`
                            px-4 py-3 border-r border-[#3F3F3F] last:border-r-0
                            ${isFirstColumn ? 'font-medium text-[#EFEFEF]' : ''}
                            ${isDescriptionColumn ? 'text-[#EFEFEF]' : ''}
                          `}
                        >
                          {formattedContent}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Specialized handler for pricing strategy tables
  const handlePricingStrategyTable = (content: string) => {
    // Look for pricing strategy section heading
    if (!content.includes("Pricing Strategy") && !content.match(/Model.*Target.*Price/i)) {
      return null;
    }
    
    // Extract all lines
    const lines = content.split('\n');
    
    // Find table lines (lines that contain pipe characters)
    const tableLines = lines.filter(line => line.includes('|'));
    
    if (tableLines.length < 4) return null; // Need header, separator, and at least one data row
    
    // Find the header row with column names
    const headerRowIndex = tableLines.findIndex(line => 
      line.includes('Model') && 
      line.includes('Target') && 
      (line.includes('Price') || line.includes('Rationale'))
    );
    
    if (headerRowIndex === -1) return null;
    
    // Find separator row with dashes
    const separatorRowIndex = tableLines.findIndex(line => 
      line.replace(/\|/g, '').trim().match(/^[-]+$/) || 
      line.includes('|---') || 
      line.includes('|-')
    );
    
    // Get data rows (everything after header and separator that's not another separator)
    const dataRows = tableLines.filter((line, i) => {
      const isDashRow = line.replace(/\|/g, '').trim().match(/^[-]+$/);
      return i > Math.max(headerRowIndex, separatorRowIndex || 0) && !isDashRow;
    });
    
    // Process header cells
    const headerCells = tableLines[headerRowIndex]
      .split('|')
      .map(cell => cell.trim())
      .filter(cell => cell !== '');
    
    return (
      <div className="overflow-x-auto my-4">
        <div className="rounded-md border border-[#4F4F4F] bg-[#262626] overflow-hidden shadow-md">
          <table className="w-full border-collapse border-spacing-0 text-sm">
            <thead className="bg-[#2A2A2A]">
              <tr>
                {headerCells.map((cell, i) => (
                  <th 
                    key={i}
                    className="px-4 py-3 text-[#EFEFEF] font-medium text-left border-b border-[#3F3F3F]"
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, rowIndex) => {
                // Split by pipe and clean each cell
                const cells = row
                  .split('|')
                  .map(cell => cell.trim())
                  .filter(cell => cell !== '');
                
                // Skip rows with no content
                if (cells.length === 0) return null;
                
                return (
                  <tr 
                    key={rowIndex}
                    className={`border-b border-[#3F3F3F] last:border-b-0 ${
                      rowIndex % 2 === 0 ? 'bg-[#2D2D2D]' : 'bg-[#262626]'
                    }`}
                  >
                    {cells.map((cell, cellIndex) => {
                      // Style based on column type
                      const isModelNameColumn = cellIndex === 0;
                      const isTargetSegmentColumn = cellIndex === 1;
                      const isPricePointColumn = cellIndex === 2;
                      const isRationaleColumn = cellIndex === 3;
                      
                      // Detect potential pricing model names
                      const isPricingModelName = isModelNameColumn && 
                        (cell.includes('PMPM') || 
                         cell.includes('Subscription') || 
                         cell.includes('Freemium') || 
                         cell.includes('Model'));
                      
                      // Detect pricing information
                      const hasPricing = isPricePointColumn && /\$\d+(-\$\d+)?(\/\w+)?/.test(cell);
                      
                      // Handle citations like [12][10]
                      const cellContent = cell;
                      const citationMatches = [...cellContent.matchAll(/\[(\d+)\]/g)];
                      
                      // Specialized content rendering based on cell type and content
                      const renderCellContent = () => {
                        if (citationMatches.length > 0) {
                          // Create an array of text segments and citation spans
                          let segments = [];
                          let lastIndex = 0;
                          
                          citationMatches.forEach((match, i) => {
                            // Add text before the citation
                            if (match.index > lastIndex) {
                              segments.push(cellContent.substring(lastIndex, match.index));
                            }
                            
                            // Add the citation with styling
                            segments.push(
                              <span key={`cit-${i}`} className="text-[#64B5F6]">
                                {match[0]}
                              </span>
                            );
                            
                            lastIndex = match.index + match[0].length;
                          });
                          
                          // Add any remaining text after the last citation
                          if (lastIndex < cellContent.length) {
                            segments.push(cellContent.substring(lastIndex));
                          }
                          
                          return <>{segments}</>;
                        }
                        
                        // For price points, highlight with blue
                        if (hasPricing) {
                          return <span className="text-[#64B5F6] font-medium">{cellContent}</span>;
                        }
                        
                        // For model names, make them bold
                        if (isPricingModelName) {
                          return <span className="font-bold">{cellContent}</span>;
                        }
                        
                        return cellContent;
                      };
                      
                      return (
                        <td 
                          key={cellIndex}
                          className={`
                            px-4 py-3 border-r border-[#3F3F3F] last:border-r-0
                            ${isModelNameColumn ? 'font-medium text-[#EFEFEF]' : ''}
                            ${isPricePointColumn ? 'text-[#64B5F6]' : ''}
                          `}
                        >
                          {renderCellContent()}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Custom SourcesSection component to handle the references section
  const SourcesSection = ({ content }: { content: string }) => {
    const lines = content.split('\n').filter(line => line.trim());
    return (
      <div className="mt-4">
        {lines.map((line, index) => {
          // Look for patterns like: [1] http://example.com
          const urlMatch = line.match(/^\[(\d+)\]\s+(https?:\/\/\S+)(.*)$/);
          if (urlMatch) {
            const num = urlMatch[1];
            const url = urlMatch[2];
            const rest = urlMatch[3] || '';
            return (
              <div key={index} id={`sources-cited-${num}`} className="flex mb-2 text-[15px]">
                <span className="text-[#64B5F6] mr-2 min-w-[30px]">[{num}]</span>
                <a 
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#64B5F6] underline hover:text-[#9EE7FF] cursor-pointer break-all"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                >
                  {url}
                </a>
                {rest && <span className="ml-1">{rest}</span>}
              </div>
            );
          }
          
          // Look for patterns with more description: [1] Title (http://example.com)
          const complexMatch = line.match(/^\[(\d+)\]\s+(.*?)\s+(https?:\/\/\S+)(.*)$/);
          if (complexMatch) {
            const num = complexMatch[1];
            const prefix = complexMatch[2];
            const url = complexMatch[3];
            const suffix = complexMatch[4] || '';
            return (
              <div key={index} id={`sources-cited-${num}`} className="flex mb-2 text-[15px]">
                <span className="text-[#64B5F6] mr-2 min-w-[30px]">[{num}]</span>
                <span>
                  {prefix}
                  <a 
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#64B5F6] underline hover:text-[#9EE7FF] cursor-pointer break-all"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    {url}
                  </a>
                  {suffix}
                </span>
              </div>
            );
          }
          
          // Fallback for other formats
          const numMatch = line.match(/^\[(\d+)\]/);
          if (numMatch) {
            const num = numMatch[1];
            return (
              <div key={index} id={`sources-cited-${num}`} className="flex mb-2 text-[15px]">
                <span className="text-[#64B5F6] mr-2 min-w-[30px]">[{num}]</span>
                <span className="text-[#EFEFEF]">{line.replace(/^\[\d+\]\s*/, '')}</span>
              </div>
            );
          }
          
          // For other lines that don't match our patterns
          return (
            <div key={index} className="mb-2 text-[15px] text-[#EFEFEF]">
              {line}
            </div>
          );
        })}
      </div>
    );
  };

  // The custom components for ReactMarkdown
  const markdownComponents: Components = {
    h1: ({ children }) => (
      <h1 className="text-[24px] mt-5 mb-3 text-[#EFEFEF] font-semibold">{children}</h1>
    ),
    h2: ({ children }) => {
      const id = typeof children === 'string' ? children.toLowerCase().replace(/\s+/g, '-') : undefined;
      
      // Special handling for Sources Cited section
      if (typeof children === 'string' && children.includes('Sources Cited')) {
        return (
          <h2 id="sources-cited" className="text-[19px] mt-4 mb-2 text-[#EFEFEF] font-semibold border-b border-[#3F3F3F] pb-1">
            {children}
          </h2>
        );
      }
      
      return (
        <h2 id={id} className="text-[19px] mt-4 mb-2 text-[#EFEFEF] font-semibold border-b border-[#3F3F3F] pb-1">{children}</h2>
      );
    },
    h3: ({ children }) => (
      <h3 className="text-[16px] mt-3 mb-1 text-[#EFEFEF] font-semibold">{children}</h3>
    ),
    p: ({ children }) => {
      // Special handling for source citations that look like [1] https://example.com 
      if (typeof children === 'string') {
        const text = children.toString();
        // This regex looks for numbered citations with URLs
        const urlMatch = text.match(/^\[(\d+)\]\s+(https?:\/\/\S+)/);
        
        if (urlMatch) {
          const num = urlMatch[1];
          const url = urlMatch[2];
          return (
            <p id={`sources-cited-${num}`} className="text-[#EFEFEF] my-2 text-[15px] leading-relaxed">
              <span className="text-[#64B5F6]">[{num}]</span> 
              <a 
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-[#64B5F6] underline hover:text-[#9EE7FF] cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(url, '_blank', 'noopener,noreferrer');
                }}
              >
                {url}
              </a>
            </p>
          );
        }
        
        // Check if it might be a source citation with more context 
        // Like [1] Title of paper (https://example.com)
        const contextUrlMatch = text.match(/^\[(\d+)\]\s+(.*?)\s+(https?:\/\/\S+)/);
        if (contextUrlMatch) {
          const num = contextUrlMatch[1];
          const context = contextUrlMatch[2];
          const url = contextUrlMatch[3];
          
          return (
            <p id={`sources-cited-${num}`} className="text-[#EFEFEF] my-2 text-[15px] leading-relaxed">
              <span className="text-[#64B5F6]">[{num}]</span> {context} 
              <a 
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-[#64B5F6] underline hover:text-[#9EE7FF] cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(url, '_blank', 'noopener,noreferrer');
                }}
              >
                {url}
              </a>
            </p>
          );
        }
      }
      
      return <p className="text-[#EFEFEF] my-2 text-[15px] leading-relaxed">{children}</p>;
    },
    ul: ({ children }) => {
      return <ul className="list-disc pl-6 my-2 text-[#EFEFEF]">{children}</ul>;
    },
    ol: ({ children }) => {
      return <ol className="list-decimal pl-6 my-2 text-[#EFEFEF]">{children}</ol>;
    },
    li: ({ children }) => {
      // Special handling for source citations in list items
      if (typeof children === 'string') {
        const text = children.toString();
        const urlMatch = text.match(/^\[(\d+)\]\s+(https?:\/\/\S+)/);
        
        if (urlMatch) {
          const num = urlMatch[1];
          const url = urlMatch[2];
          return (
            <li id={`sources-cited-${num}`} className="my-1 text-[#EFEFEF]">
              <span className="text-[#64B5F6]">[{num}]</span> 
              <a 
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-[#64B5F6] underline hover:text-[#9EE7FF] cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(url, '_blank', 'noopener,noreferrer');
                }}
              >
                {url}
              </a>
            </li>
          );
        }
      }
      
      return <li className="my-1 text-[#EFEFEF]">{children}</li>;
    },
    a: ({ href, children }) => {
      // Check if this is a citation link (like [1], [2], etc.)
      const isCitation = 
        typeof children === 'string' && 
        /^\[\d+\]$/.test(children as string);
      
      if (isCitation) {
        const citationNumber = (children as string).replace(/[\[\]]/g, '');
        
        return (
          <a
            id={`citation-link-${citationNumber}`}
            href={`#sources-cited-${citationNumber}`}
            className="text-[#64B5F6] hover:underline cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById(`sources-cited-${citationNumber}`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            {children}
          </a>
        );
      }
      
      // For regular links (typically http/https URLs)
      if (href?.startsWith('http')) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#64B5F6] underline hover:text-[#9EE7FF] cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              window.open(href, '_blank', 'noopener,noreferrer');
            }}
          >
            {children}
          </a>
        );
      }
      
      // Default case
      return (
        <a
          href={href}
          className="text-[#64B5F6] hover:underline cursor-pointer"
        >
          {children}
        </a>
      );
    }
  };

  // Effect to ensure links in the modal are clickable
  useEffect(() => {
    if (modalOpen && gtmStrategy) {
      // Wait for DOM to be updated with dialog content
      setTimeout(() => {
        // Get all links in the dialog
        const links = document.querySelectorAll('.dialog-content a[href]');
        console.log(`Found ${links.length} links in GTM Strategy dialog`);
        
        // Add direct click handler to each link
        links.forEach(link => {
          // Remove any existing handlers
          link.removeEventListener('click', handleLinkClick);
          
          // Add new direct handler
          link.addEventListener('click', handleLinkClick);
        });
      }, 300);
    }
    
    return () => {
      // Clean up handlers when component unmounts
      const links = document.querySelectorAll('.dialog-content a[href]');
      links.forEach(link => {
        link.removeEventListener('click', handleLinkClick);
      });
    };
  }, [modalOpen, gtmStrategy]);

  // Direct link click handler
  const handleLinkClick = (e: Event) => {
    e.stopPropagation();
    e.preventDefault();
    
    const link = e.currentTarget as HTMLAnchorElement;
    const href = link.getAttribute('href');
    
    if (href) {
      if (href.startsWith('#')) {
        // Internal link - scroll to element
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (href.startsWith('http://') || href.startsWith('https://')) {
        // External link - open in new tab
        window.open(href, '_blank', 'noopener,noreferrer');
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <motion.div className="w-full" whileTap={{ scale: 0.95 }}>
    <Button
          onMouseEnter={() => generated ? setHoverViewResults(true) : setHoverSparkle(true)}
          onMouseLeave={() => generated ? setHoverViewResults(false) : setHoverSparkle(false)}
          onClick={handleGenerateGTMStrategy}
          className={`
            w-full
            rounded-full
            px-6
            py-3
            h-[52px]
            border
            ${generated ? 'border-[#39FF14]/70' : 'border-[#39FF14]'}
            bg-[#1C1C1C]
            ${generated ? 'text-[#39FF14]/80' : 'text-[#39FF14]'}
            ${generated ? 'hover:bg-[#39FF14]/20' : 'hover:bg-[#39FF14]/30'}
            hover:border-[#39FF14]
            transition-colors
            duration-200
            flex
            items-center
            justify-center
          `}
        >
          {loading ? (
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
          ) : generated ? (
            <span className="flex items-center">
              <Eye
                size={28}
                weight={hoverViewResults ? 'fill' : 'bold'}
                className="mr-2"
              />
              View GTM Strategy
            </span>
          ) : (
            <span className="flex items-center">
              <Sparkle
                size={32}
                weight={hoverSparkle ? 'fill' : 'bold'}
                className="mr-2"
              />
      Generate Detailed GTM Strategy
            </span>
          )}
        </Button>
      </motion.div>
      
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="dialog-content bg-[#1C1C1C] border-[#3F3F3F] text-[#EFEFEF] p-4 rounded-lg sm:max-w-lg md:max-w-3xl lg:max-w-5xl max-h-[80vh] overflow-y-auto pointer-events-auto">
          <DialogHeader>
            <div className="flex items-center justify-center">
              <DialogTitle className="text-xl font-bold text-[#EFEFEF]">
                Go-To-Market Strategy
              </DialogTitle>
            </div>
          </DialogHeader>
          
          <div className="pt-2 pb-2 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
            {gtmStrategy ? (
              <div className="space-y-3 pointer-events-auto">
                {sections.map((section, index) => (
                  <Card key={index} className="border border-[#3F3F3F] bg-[#2F2F2F] rounded-xl p-2 sm:p-3 pointer-events-auto">
                    <div className="flex items-center mb-0">
                      <h2 className="text-lg sm:text-xl font-semibold text-[#64B5F6]">
                        {section.heading}
                      </h2>
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none pointer-events-auto">
                      {section.heading.includes('Sources Cited') ? (
                        <SourcesSection content={section.content} />
                      ) : (
                        <ReactMarkdown components={markdownComponents}>
                          {section.content}
                        </ReactMarkdown>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center p-8">
                <Spinner size={32} className="animate-spin text-[#39FF14]" />
              </div>
            )}
          </div>
          
          <div className="flex justify-center gap-2 sm:gap-4 mt-2 sm:mt-4">
            <Button 
              onClick={() => setModalOpen(false)}
              className="rounded-full px-2 sm:px-3 md:px-6 py-1 sm:py-2 border border-[#3F3F3F] bg-[#1C1C1C] text-[#EFEFEF] hover:bg-[#2F2F2F] text-xs sm:text-sm md:text-base"
            >
              Close
    </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}