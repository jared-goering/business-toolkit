'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CaretDown, CaretUp, Sparkle, Spinner } from 'phosphor-react';

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
  const [customerPainPoints, setCustomerPainPoints] = useState<string | null>(null);
  const [loadingPainPoints, setLoadingPainPoints] = useState(false);
  const [minimizedPain, setMinimizedPain] = useState(false);
  const [hoverPainPointsSparkle, setHoverPainPointsSparkle] = useState(false);

  const handleIdeateCustomerPainPoints = async () => {
    setLoadingPainPoints(true);
    setCustomerPainPoints(null);
    try {
      const response = await fetch('/api/ideate-customer-pain-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitch, company, problem, customers }),
      });
      const data = await response.json();
      setCustomerPainPoints(data.painPoints);
    } catch (error) {
      console.error('Error generating customer pain points:', error);
    } finally {
      setLoadingPainPoints(false);
    }
  };

  // Convert your `customerPainPoints` into an array of bullet items
  let bulletPoints: string[] = [];
  if (customerPainPoints) {
    // If it's already an array, use it directly
    if (Array.isArray(customerPainPoints)) {
      bulletPoints = customerPainPoints;
    } else {
      // Otherwise, split on newlines and trim
      bulletPoints = customerPainPoints
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <Button
        onMouseEnter={() => setHoverPainPointsSparkle(true)}
        onMouseLeave={() => setHoverPainPointsSparkle(false)}
        onClick={handleIdeateCustomerPainPoints}
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
        {loadingPainPoints ? (
          <span className="flex items-center">
            <Spinner size={20} className="mr-2 animate-spin" />
            Loading pain points...
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

      {/* If we have results, show them in a card */}
      {customerPainPoints && (
        <Card className="bg-[#1C1C1C] rounded-3xl border-[#3F3F3F] py-1 px-1 mt-12 w-full mb-5">
          <CardHeader className="pt-3 pb-2">
            <div className="flex items-center justify-center">
              <CardTitle className="text-[17px] text-[#EFEFEF] leading-tight m-0 inline-block mr-2 text-center">
                Customer Pain Points
              </CardTitle>
              <button
                onClick={() => setMinimizedPain(!minimizedPain)}
                className="focus:outline-none"
              >
                {minimizedPain ? (
                  <CaretDown size={24} className="text-gray-400" />
                ) : (
                  <CaretUp size={24} className="text-gray-400" />
                )}
              </button>
            </div>
          </CardHeader>

          {!minimizedPain && (
            <CardContent className="p-4 space-y-3">
              {/* Render each bullet as its own sub-card */}
              {bulletPoints.map((point, idx) => (
                <Card
                  key={idx}
                  className="bg-[#2F2F2F] border border-[#3F3F3F] rounded-xl p-3"
                >
                  <p className="text-sm text-[#EFEFEF] m-0">{point}</p>
                </Card>
              ))}
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}