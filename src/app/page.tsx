'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function HomePage() {
  const [company, setCompany] = useState('');
  const [problem, setProblem] = useState('');
  const [customers, setCustomers] = useState('');
  const [pitch, setPitch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setPitch('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, problem, customers }),
      });

      const data = await response.json();
      if (data.pitch) {
        setPitch(data.pitch);
        setShowDialog(true);
      }
    } catch (error) {
      console.error('Error generating pitch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  return (
    <div className="bg-dot-pattern min-h-screen text-[#EFEFEF]">
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col space-y-16">
        <header className="py-3">
          <h1 className="text-[46px] text-[#3F3F3F] leading-[40px]">
            NEW BUSINESS <br />
            TOOLKIT
          </h1>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-16 mt-10">
          <Card className="bg-[#1C1C1C] rounded-3xl border-[#3F3F3F] py-1 px-1 gap-1">
            <CardHeader className="pt-5 pb-4">
              <CardTitle className="text-[15px] text-[#EFEFEF] text-center leading-tight m-0">
                What is your company going to make?
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <Textarea
                className="bg-[#2F2F2F] border-[#3F3F3F] text-[#EFEFEF] placeholder:text-gray-400 h-[100px] rounded-2xl"
                placeholder="e.g. AI-powered fitness app"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card className="bg-[#1C1C1C] rounded-3xl border-[#3F3F3F] py-1 px-1 gap-1">
            <CardHeader className="pt-5 pb-4">
              <CardTitle className="text-[15px] text-[#EFEFEF] text-center leading-tight m-0">
                What problem does it solve?
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <Textarea
                className="bg-[#2F2F2F] border-[#3F3F3F] text-[#EFEFEF] placeholder:text-gray-400 h-[100px] rounded-2xl"
                placeholder="e.g. Personalized workout plans"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card className="bg-[#1C1C1C] rounded-3xl border-[#3F3F3F] py-1 px-1 gap-1">
            <CardHeader className="pt-5 pb-4">
              <CardTitle className="text-[15px] text-[#EFEFEF] text-center leading-tight m-0">
                Who are your target customers?
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <Textarea
                className="bg-[#2F2F2F] border-[#3F3F3F] text-[#EFEFEF] placeholder:text-gray-400 h-[100px] rounded-2xl"
                placeholder="e.g. Health-conscious individuals"
                value={customers}
                onChange={(e) => setCustomers(e.target.value)}
              />
            </CardContent>
          </Card>
        </section>

        <div className="flex justify-center">
        <Button
  className="
    flex
    items-center
    justify-center
    px-6
    py-3
    rounded-full
    border
    border-[#FDE03B]
    bg-[#1C1C1C]
    text-[#FDE03B]
    font-semibold
    hover:bg-[#FDE03B]/40
    transition-colors
    duration-200
  "
>
  ✨ Generate Summary
</Button>

        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="bg-neutral-900 text-white">
            <DialogHeader>
              <DialogTitle>Does this pitch sound right?</DialogTitle>
            </DialogHeader>
            <div className="mb-4">
              {pitch || 'Your AI-generated pitch will appear here...'}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="bg-neutral-700 text-white"
                onClick={handleRegenerate}
              >
                🔄 Regenerate
              </Button>
              <Button
                variant="outline"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setShowDialog(false)}
              >
                👍 Looks Good
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
