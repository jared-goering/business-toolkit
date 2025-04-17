'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CaretDown, CaretUp, Sparkle, Spinner, Eye } from 'phosphor-react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useReport } from '@/context/ReportContext';

interface CustomerPainPointsProps {
  pitch: string;
  company: string;
  problem: string;
  customers: string;
}

export default function CustomerPainPointsColumn({
  pitch,
  company,
  problem,
  customers,
}: CustomerPainPointsProps) {
  const { setField } = useReport();
  const [customerPainPoints, setCustomerPainPoints] = useState<string | null>(null);
  const [loadingPainPoints, setLoadingPainPoints] = useState(false);
  const [minimizedPain, setMinimizedPain] = useState(false);
  const [hoverPainPointsSparkle, setHoverPainPointsSparkle] = useState(false);
  const [hoverViewResults, setHoverViewResults] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleIdeateCustomerPainPoints = async () => {
    if (customerPainPoints) {
      setModalOpen(true);
      return;
    }
    
    setLoadingPainPoints(true);
    setCustomerPainPoints(null);
    try {
      const response = await fetch('/api/ideate-customer-pain-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitch, company, problem, customers }),
      });
      const data = await response.json();
      console.log('Pain points received:', data.painPoints);
      setCustomerPainPoints(data.painPoints);
      setField('customerPainPoints', data.painPoints);
      setModalOpen(true);
    } catch (error) {
      console.error('Error generating customer pain points:', error);
    } finally {
      setLoadingPainPoints(false);
    }
  };

  const handleRegeneratePainPoints = () => {
    setCustomerPainPoints(null);
    handleIdeateCustomerPainPoints();
  };

  // Convert your `customerPainPoints` into an array of bullet items
  let bulletPoints: string[] = [];
  if (customerPainPoints) {
    if (Array.isArray(customerPainPoints)) {
      bulletPoints = customerPainPoints;
    } else {
      bulletPoints = customerPainPoints
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
    }
    console.log('Bullet points after processing:', bulletPoints);
    console.log('Number of bullet points:', bulletPoints.length);
  }

  return (
    <div className="w-full flex flex-col items-center">
      <motion.div className="w-full" whileTap={{ scale: 0.95 }}>
        <Button
          onMouseEnter={() => customerPainPoints ? setHoverViewResults(true) : setHoverPainPointsSparkle(true)}
          onMouseLeave={() => customerPainPoints ? setHoverViewResults(false) : setHoverPainPointsSparkle(false)}
          onClick={handleIdeateCustomerPainPoints}
          className={`
            w-full
            rounded-full
            px-6
            py-3
            h-[52px]
            border
            ${customerPainPoints ? 'border-[#00FFFF]/70' : 'border-[#00FFFF]'}
            bg-[#1C1C1C]
            ${customerPainPoints ? 'text-[#00FFFF]/80' : 'text-[#00FFFF]'}
            ${customerPainPoints ? 'hover:bg-[#00FFFF]/20' : 'hover:bg-[#00FFFF]/30'}
            hover:border-[#00FFFF]
            transition-colors
            duration-200
            flex
            items-center
            justify-center
          `}
        >
          {loadingPainPoints ? (
            <span className="flex items-center">
              <Spinner size={20} className="mr-2 animate-spin" />
              Loading pain points...
            </span>
          ) : customerPainPoints ? (
            <span className="flex items-center">
              <Eye
                size={28}
                weight={hoverViewResults ? 'fill' : 'bold'}
                className="mr-2"
              />
              View Customer Pain Points
            </span>
          ) : (
            <span className="flex items-center">
              <Sparkle
                size={32}
                weight={hoverPainPointsSparkle ? 'fill' : 'bold'}
                className="mr-2"
              />
              Ideate Customers' Pain Points
            </span>
          )}
        </Button>
      </motion.div>

      {/* Modal Dialog for Customer Pain Points */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#1C1C1C] border-[#3F3F3F] text-[#EFEFEF] p-4 rounded-lg sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
          <DialogHeader>
            <div className="flex items-center justify-center">
              <DialogTitle className="text-xl font-bold text-[#EFEFEF]">
                Customer Pain Points
              </DialogTitle>
            </div>
          </DialogHeader>
          
          <div className="pt-2 pb-2 max-h-[70vh] overflow-y-auto">
            {bulletPoints.map((point, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border border-[#3F3F3F] bg-[#2F2F2F] rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 relative">
                  <span
                    className="
                      absolute
                      top-3
                      left-3
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
                    {idx + 1}
                  </span>
                  <div className="ml-7 sm:ml-8">
                    <p className="text-sm sm:text-base text-[#EFEFEF] break-words">{point}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <div className="flex justify-center gap-2 sm:gap-4 mt-2 sm:mt-4">
            <Button 
              onClick={handleRegeneratePainPoints}
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
