'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CaretDown, CaretUp, DotsSixVertical, Sparkle } from 'phosphor-react';

interface Persona {
  name: string;
  ageRange: string;
  interests: string[];
  description: string;
}

interface ExtraButtonsProps {
  pitch: string;
  company: string;
  problem: string;
  customers: string;
}

export default function ExtraButtons({ pitch, company, problem, customers }: ExtraButtonsProps) {
  const [personas, setPersonas] = useState<Persona[] | null>(null);
  const [loading, setLoading] = useState(false);

  // For drag-and-drop
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  // NEW: controls whether the persona list is minimized (collapsed)
  const [minimized, setMinimized] = useState(false);


  // NEW: track hover for each button’s sparkle
  const [hoverPersonaSparkle, setHoverPersonaSparkle] = useState(false);
  const [hoverPainPointsSparkle, setHoverPainPointsSparkle] = useState(false);
  const [hoverValuePropSparkle, setHoverValuePropSparkle] = useState(false);


  // Simple reorder helper
  function reorder(array: Persona[], fromIndex: number, toIndex: number) {
    const newArr = [...array];
    const [removed] = newArr.splice(fromIndex, 1);
    newArr.splice(toIndex, 0, removed);
    return newArr;
  }

 // Handle generating personas
 const handleIdeateTargetPersona = async () => {
    setLoading(true);
    setPersonas(null);
    try {
      const response = await fetch('/api/ideate-target-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitch, company, problem, customers }),
      });
      const data = await response.json();
      // data.personas should be an array of persona objects
      setPersonas(data.personas);
      // Auto-expand the list when new personas are generated:
      setMinimized(false);
    } catch (error) {
      console.error('Error generating personas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Drag event handlers
  const handleDragStart = (index: number) => {
    setDraggingIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // needed so onDrop will fire
  };

  const handleDrop = (dropIndex: number) => {
    if (draggingIndex === null || draggingIndex === dropIndex) return;
    if (!personas) return;
    const reordered = reorder(personas, draggingIndex, dropIndex);
    setPersonas(reordered);
    setDraggingIndex(null);
  };

  return (
<section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
{/* Column 1: Ideate Target Persona */}
      <div className="flex flex-col items-center">
      <Button
  onMouseEnter={() => setHoverPersonaSparkle(true)}
  onMouseLeave={() => setHoverPersonaSparkle(false)}
  onClick={handleIdeateTargetPersona}
  className="
    rounded-full
    w-5/6
    px-6
    py-2
    border
    border-[#00FFFF]
    bg-[#1C1C1C]
    text-[#00FFFF]
    hover:bg-[#00FFFF]/30
    hover:border-[#00FFFF]
    transition-colors
    duration-200
  "
>
  {loading ? (
    <span className="flex items-center">
      {/* Your spinner icon; for example, using Phosphor's Spinner or a custom spinner */}
      <svg
        className="animate-spin mr-2"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      Loading personas...
    </span>
  ) : (
    <span className="flex items-center">
      <Sparkle
        size={32}
        weight={hoverPersonaSparkle ? 'fill' : 'bold'}
        className="mr-2"
      />
      Ideate Target Persona
    </span>
  )}
</Button>
        {personas && Array.isArray(personas) && (
  <Card className="bg-[#1C1C1C] rounded-3xl border-[#3F3F3F] py-1 px-1 mt-12 w-full mb-5">
    {/* Header: Title + caret on the same row */}
    <CardHeader className="pt-3 pb-2">
  <div className="flex items-center justify-center">
    <CardTitle className="text-[17px] text-[#EFEFEF] leading-tight m-0 inline-block mr-2">
      Potential Personas
    </CardTitle>
    <button onClick={() => setMinimized(!minimized)} className="focus:outline-none">
      {minimized ? (
        <CaretDown size={24} className="text-gray-400" />
      ) : (
        <CaretUp size={24} className="text-gray-400" />
      )}
    </button>
  </div>
</CardHeader>

    {/* Expandable content: subtitle + persona sub-cards */}
    {!minimized && (
      <CardContent className="p-2 pt-0 space-y-4">
        <p className="text-sm text-gray-400 text-center">
          Drag to Rank these in order of most relevant
        </p>
        {personas.map((persona, i) => (
          <div
            key={i}
            className="cursor-move relative"
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(i)}
          >
            <Card className="bg-[#2F2F2F] border border-[#3F3F3F] rounded-2xl shadow-md">
              {/* Circle number */}
              <span
                className="
                  absolute
                  top-3
                  left-4
                  w-6
                  h-6
                  flex
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-gray-300
                  text-gray-300
                  text-sm
                  font-bold
                "
              >
                {i + 1}
              </span>
              {/* Draggable icon (DotsSixVertical) in the top-right corner */}
              <span className="absolute top-3 right-4 text-sm text-gray-300 font-bold">
                <DotsSixVertical size={24} />
              </span>
              <CardContent className="px-4 py-4 space-y-2">
                <h3 className="text-lg font-bold text-[#EFEFEF]">
                  {persona.name}
                </h3>
                <p className="text-sm text-[#EFEFEF]">
                  <strong>Age Range:</strong> {persona.ageRange}
                </p>
                <div className="text-sm text-[#EFEFEF]">
                  <strong>Interests:</strong>
                  <ul className="list-disc list-inside ml-4">
                    {persona.interests.map((interest, idx) => (
                      <li key={idx}>{interest}</li>
                    ))}
                  </ul>
                </div>
                <p className="text-sm text-[#EFEFEF]">
                  {persona.description}
                </p>
              </CardContent>
            </Card>
          </div>
        ))}
      </CardContent>
    )}
  </Card>
)}

      </div>

      {/* Column 2: Ideate Customers’ Pain Points */}
      <div className="flex justify-center">
        <Button onMouseEnter={() => setHoverPainPointsSparkle(true)}
        onMouseLeave={() => setHoverPainPointsSparkle(false)}
          onClick={handleIdeateTargetPersona}
          className="
          rounded-full
          w-5/6
          px-6
          py-2
          border
          border-[#00FFFF]
          bg-[#1C1C1C]
          text-[#00FFFF]
          hover:bg-[#00FFFF]/30
          hover:border-[#00FFFF]
          transition-colors
          duration-200
        "
      >
        <Sparkle
          size={32}
          weight={hoverPainPointsSparkle ? 'fill' : 'bold'} // fill on hover, bold otherwise
          className="mr-2"
        />Ideate Customers’ Pain Points
        </Button>
      </div>

      {/* Column 3: Value Proposition Mapping */}
      <div className="flex justify-center">
        <Button onMouseEnter={() => setHoverValuePropSparkle(true)}
        onMouseLeave={() => setHoverValuePropSparkle(false)}
          onClick={handleIdeateTargetPersona}
          className="
          rounded-full
          w-5/6
          px-6
          py-2
          border
          border-[#00FFFF]
          bg-[#1C1C1C]
          text-[#00FFFF]
          hover:bg-[#00FFFF]/30
          hover:border-[#00FFFF]
          transition-colors
          duration-200
        "
      >
        <Sparkle
          size={32}
          weight={hoverValuePropSparkle ? 'fill' : 'bold'} // fill on hover, bold otherwise
          className="mr-2"
        /> Value Proposition Mapping
        </Button>
      </div>
    </section>
  );
}
