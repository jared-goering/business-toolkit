'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CaretDown, CaretUp, DotsSixVertical, Sparkle, Spinner } from 'phosphor-react';

interface Persona {
  name: string;
  ageRange: string;
  interests: string[];
  description: string;
}

interface TargetPersonaProps {
  pitch: string;
  company: string;
  problem: string;
  customers: string;
}

function reorder(array: Persona[], fromIndex: number, toIndex: number) {
  const newArr = [...array];
  const [removed] = newArr.splice(fromIndex, 1);
  newArr.splice(toIndex, 0, removed);
  return newArr;
}

export default function TargetPersonaColumn({
  pitch,
  company,
  problem,
  customers,
}: TargetPersonaProps) {
  const [personas, setPersonas] = useState<Persona[] | null>(null);
  const [loadingTarget, setLoadingTarget] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [minimized, setMinimized] = useState(false);

  // For the sparkle icon hover
  const [hoverPersonaSparkle, setHoverPersonaSparkle] = useState(false);

  const handleIdeateTargetPersona = async () => {
    setLoadingTarget(true);
    setPersonas(null);
    try {
      const response = await fetch('/api/ideate-target-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitch, company, problem, customers }),
      });
      const data = await response.json();
      setPersonas(data.personas);
      setMinimized(false); // expand card on load
    } catch (error) {
      console.error('Error generating target personas:', error);
    } finally {
      setLoadingTarget(false);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggingIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex: number) => {
    if (draggingIndex === null || draggingIndex === dropIndex) return;
    if (!personas) return;
    const reordered = reorder(personas, draggingIndex, dropIndex);
    setPersonas(reordered);
    setDraggingIndex(null);
  };

  return (
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
        {loadingTarget ? (
          <span className="flex items-center">
            <Spinner size={20} className="mr-2 animate-spin" />
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
          <CardHeader className="pt-3 pb-2">
            <div className="flex items-center justify-center">
              <CardTitle className="text-[17px] text-[#EFEFEF] leading-tight m-0 inline-block mr-2">
                Potential Personas
              </CardTitle>
              <button
                onClick={() => setMinimized(!minimized)}
                className="focus:outline-none"
              >
                {minimized ? (
                  <CaretDown size={24} className="text-gray-400" />
                ) : (
                  <CaretUp size={24} className="text-gray-400" />
                )}
              </button>
            </div>
          </CardHeader>
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
  );
}