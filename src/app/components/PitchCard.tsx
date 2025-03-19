'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowsClockwise, ThumbsUp, PaperPlaneTilt } from 'phosphor-react';

interface PitchCardProps {
  pitch: string;
  onRegenerate: (context?: string) => void;
  onClose: () => void;
}

export default function PitchCard({ pitch, onRegenerate, onClose }: PitchCardProps) {
  const [showContextInput, setShowContextInput] = useState(false);
  const [additionalContext, setAdditionalContext] = useState('');
  const [thumbsHover, setThumbsHover] = useState(false);
  const [regenerateHover, setRegenerateHover] = useState(false);

  const handleRegenerateClick = () => {
    setShowContextInput(true);
  };

  const handleBackClick = () => {
    setShowContextInput(false);
    setAdditionalContext('');
  };

  const handleContextSubmit = () => {
    onRegenerate(additionalContext);
    setShowContextInput(false);
    setAdditionalContext('');
  };

  return (
    <div className="flex justify-center">
      <Card className="bg-[#1C1C1C] rounded-3xl border-[#3F3F3F] py-1 px-1 gap-1 max-w-xl w-full">
        <CardHeader className="pt-5 pb-4">
          <CardTitle className="text-[18px] text-[#EFEFEF] text-center leading-tight m-0">
            Does this pitch sound right?
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 pt-2">
          <p className="bg-[#2F2F2F] border border-[#3F3F3F] text-[#EFEFEF] rounded-2xl p-3">
            {pitch || 'Your AI-generated pitch will appear here...'}
          </p>

          {!showContextInput ? (
            <div className="flex gap-2 w-full pt-4">
              {/* Regenerate Button with local state for animation */}
              <Button
  onMouseEnter={() => setRegenerateHover(true)}
  onMouseLeave={() => setRegenerateHover(false)}
  className="
    flex-1
    flex
    items-center
    justify-center
    rounded-full
    border
    border-[#292929]
    bg-[#292929]
    text-[#FDE03B]
    font-semibold
    hover:bg-[#FDE03B]/10
    transition-colors
    duration-200
  "
  onClick={handleRegenerateClick}
>
  <ArrowsClockwise
    className="mr-2"
    style={regenerateHover ? { animation: 'spinOnce 0.5s ease-in-out forwards' } : {}}
    size={20}
  />
  Regenerate
</Button>


              {/* Looks Good Button */}
              <Button
                onMouseEnter={() => setThumbsHover(true)}
                onMouseLeave={() => setThumbsHover(false)}
                className="
                  flex-1
                  flex
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#FDE03B]
                  bg-[#1C1C1C]
                  text-[#FDE03B]
                  font-semibold
                  hover:bg-[#FDE03B]/10
                  transition-colors
                  duration-200
                "
                onClick={onClose}
              >
                <ThumbsUp
                  className="mr-2"
                  size={20}
                  weight={thumbsHover ? 'fill' : 'regular'}
                />
                Looks Good
              </Button>
            </div>
          ) : (
            <div className="mt-4">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Enter additional context for the AI..."
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  className="
                    flex-1
                    p-2
                    rounded-full
                    bg-[#2F2F2F]
                    border
                    border-[#3F3F3F]
                    text-[#EFEFEF]
                  "
                />
                <Button
                  onClick={handleContextSubmit}
                  className="
                    rounded-full
                    border
                    border-[#FDE03B]
                    bg-[#1C1C1C]
                    text-[#FDE03B]
                    font-semibold
                    hover:bg-[#FDE03B]/10
                    transition-colors
                    duration-200
                  "
                >
                  <PaperPlaneTilt size={24} />
                </Button>
              </div>
              <Button
                onClick={handleBackClick}
                className="
                  mt-4
                  w-full
                  rounded-full
                  border
                  border-gray-400
                  bg-[#1C1C1C]
                  text-gray-400
                  font-semibold
                  hover:bg-gray-600
                  transition-colors
                  duration-200
                "
              >
                Back
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
