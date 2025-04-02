'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CaretDown, CaretUp, DotsSixVertical, Sparkle, Spinner, Eye } from 'phosphor-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Masonry from 'react-masonry-css';
import { cn } from "@/lib/utils";

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
  const [loading, setLoading] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchStartIndex, setTouchStartIndex] = useState<number | null>(null);
  const [minimized, setMinimized] = useState(false);
  const [hoverSparkle, setHoverSparkle] = useState(false);
  const [hoverViewResults, setHoverViewResults] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Breakpoint for masonry layout
  const breakpointColumnsObj = {
    default: 3,
    1100: 2,
    700: 1
  };

  const handleIdeateTargetPersona = async () => {
    if (personas) {
      setModalOpen(true);
      return;
    }
    
    setLoading(true);
    setPersonas(null);
    try {
      const response = await fetch('/api/ideate-target-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitch, company, problem, customers }),
      });
      const data = await response.json();
      setPersonas(data.personas);
      setModalOpen(true);
    } catch (error) {
      console.error('Error generating target personas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegeneratePersonas = () => {
    setPersonas(null);
    handleIdeateTargetPersona();
  };

  const handleDragStart = (index: number) => {
    setDraggingIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggingIndex !== null && draggingIndex !== index) {
      // Add visual indication for drop target
      e.currentTarget.style.boxShadow = "0 0 0 2px #00FFFF";
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.boxShadow = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    e.currentTarget.style.boxShadow = "";
    
    if (draggingIndex === null || draggingIndex === dropIndex) return;
    if (!personas) return;
    
    const reordered = reorder(personas, draggingIndex, dropIndex);
    setPersonas(reordered);
    setDraggingIndex(null);
  };

  // Mobile touch event handlers
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    setTouchStartY(e.touches[0].clientY);
    setTouchStartIndex(index);
    // Visual feedback that element is being dragged
    (e.currentTarget as HTMLElement).style.opacity = "0.5";
  };
  
  const handleTouchMove = (e: React.TouchEvent, index: number) => {
    if (touchStartIndex === null || touchStartY === null) return;
    
    const currentY = e.touches[0].clientY;
    const cards = document.querySelectorAll('.persona-card');
    
    // Check if we've moved over another card
    cards.forEach((card, i) => {
      if (i !== touchStartIndex) {
        const rect = card.getBoundingClientRect();
        if (currentY > rect.top && currentY < rect.bottom) {
          // Visual indication of drop target
          card.classList.add('drop-target');
        } else {
          card.classList.remove('drop-target');
        }
      }
    });
  };
  
  const handleTouchEnd = (e: React.TouchEvent, index: number) => {
    if (touchStartIndex === null) return;
    
    // Reset opacity
    (e.currentTarget as HTMLElement).style.opacity = "1";
    
    const currentY = e.changedTouches[0].clientY;
    const cards = document.querySelectorAll('.persona-card');
    
    // Find which card we're dropping onto
    let dropIndex = touchStartIndex;
    cards.forEach((card, i) => {
      card.classList.remove('drop-target');
      const rect = card.getBoundingClientRect();
      if (i !== touchStartIndex && currentY > rect.top && currentY < rect.bottom) {
        dropIndex = i;
      }
    });
    
    // Reorder if needed
    if (dropIndex !== touchStartIndex && personas) {
      const reordered = reorder(personas, touchStartIndex, dropIndex);
      setPersonas(reordered);
    }
    
    setTouchStartY(null);
    setTouchStartIndex(null);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <motion.div className="w-full" whileTap={{ scale: 0.95 }}>
        <Button
          onMouseEnter={() => personas ? setHoverViewResults(true) : setHoverSparkle(true)}
          onMouseLeave={() => personas ? setHoverViewResults(false) : setHoverSparkle(false)}
          onClick={handleIdeateTargetPersona}
          className={`
            w-full
            rounded-full
            px-6
            py-2
            border
            ${personas ? 'border-[#00FFFF]/70' : 'border-[#00FFFF]'}
            bg-[#1C1C1C]
            ${personas ? 'text-[#00FFFF]/80' : 'text-[#00FFFF]'}
            ${personas ? 'hover:bg-[#00FFFF]/20' : 'hover:bg-[#00FFFF]/30'}
            hover:border-[#00FFFF]
            transition-colors duration-200
            flex
            items-center
            justify-center
            mb-5
          `}
        >
          {loading ? (
            <span className="flex items-center">
              <Spinner size={20} className="mr-2 animate-spin" />
              Loading personas...
            </span>
          ) : personas ? (
            <span className="flex items-center">
              <Eye
                size={28}
                weight={hoverViewResults ? 'fill' : 'bold'}
                className="mr-2"
              />
              View Target Personas
            </span>
          ) : (
            <span className="flex items-center">
              <Sparkle
                size={32}
                weight={hoverSparkle ? 'fill' : 'bold'}
                className="mr-2"
              />
              Ideate Target Persona
            </span>
          )}
        </Button>
      </motion.div>

      {/* Modal Dialog for Target Personas */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent 
          className="bg-[#1C1C1C] border-[#3F3F3F] text-[#EFEFEF] p-4 rounded-lg sm:max-w-lg md:max-w-2xl lg:max-w-4xl"
        >
          <DialogHeader>
            <div className="flex items-center justify-center">
              <DialogTitle className="text-xl font-bold text-[#EFEFEF]">
                Target Personas
              </DialogTitle>
            </div>
          </DialogHeader>
          
          <div className="pt-2 pb-2 max-h-[70vh] overflow-y-auto">
            <p className="text-sm text-gray-400 text-center mb-4">
              Tap and hold to reorder personas
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {personas?.map((persona, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`
                    cursor-move
                    persona-card
                    ${draggingIndex === i ? 'opacity-50' : ''}
                  `}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={(e) => handleDragOver(e, i)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, i)}
                  onTouchStart={(e) => handleTouchStart(e, i)}
                  onTouchMove={(e) => handleTouchMove(e, i)}
                  onTouchEnd={(e) => handleTouchEnd(e, i)}
                  style={{
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                >
                  <Card className="border border-[#3F3F3F] bg-[#2F2F2F] rounded-xl p-1 sm:p-3 md:p-4 relative h-full overflow-hidden">
                    <span
                      className="
                        absolute
                        top-2
                        left-2
                        sm:top-3
                        sm:left-3
                        w-5
                        h-5
                        sm:w-6
                        sm:h-6
                        flex
                        items-center
                        justify-center
                        rounded-full
                        border border-gray-300
                        text-gray-300 text-xs sm:text-sm font-bold
                      "
                    >
                      {i + 1}
                    </span>
                    <span className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-300 font-bold">
                      <DotsSixVertical size={20} />
                    </span>
                    <div className="flex flex-col space-y-1 sm:space-y-0 mt-8 sm:mt-10 px-2 sm:px-2">
                      <h2 className="text-lg sm:text-xl font-bold text-[#EFEFEF] p-0 m-0 leading-none">
                        {persona.name}
                      </h2>
                      <div className="prose prose-invert prose-sm max-w-full break-words h-auto space-y-1">
                        <p className="text-sm sm:text-base text-[#EFEFEF] mt-2">
                          <strong>Age Range:</strong> {persona.ageRange}
                        </p>
                        <div className="text-sm sm:text-base text-[#EFEFEF] mt-1">
                          <strong>Interests:</strong>
                          <ul className="list-disc list-inside ml-0 sm:ml-1 md:ml-2">
                            {persona.interests.map((interest, idx) => (
                              <li key={idx} className="break-words">{interest}</li>
                            ))}
                          </ul>
                        </div>
                        <p className="text-sm sm:text-base text-[#EFEFEF] break-words mt-2">
                          {persona.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-center gap-2 sm:gap-4 mt-2 sm:mt-4">
            <Button 
              onClick={handleRegeneratePersonas}
              className="rounded-full px-2 sm:px-3 md:px-6 py-1 sm:py-2 border border-[#00FFFF] bg-[#1C1C1C] text-[#00FFFF] hover:bg-[#00FFFF]/30 text-xs sm:text-sm md:text-base"
            >
              <Sparkle size={16} className="mr-1 sm:mr-2" />
              Regenerate
            </Button>
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
