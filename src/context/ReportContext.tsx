'use client';
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

// Types describing the shape of data we will collect for the report
export interface ReportData {
  company: string;
  problem: string;
  customers: string;
  pitch: string;
  valueProposition?: string;
  customerPainPoints?: string | string[];
  personas?: any[];
  nextSteps?: string;
  gtmStrategy?: string;
  competitorReport?: string;
}

interface ReportContextValue extends ReportData {
  setField: (field: keyof ReportData, value: any) => void;
  setMultiple: (data: Partial<ReportData>) => void;
  reset: () => void;
}

const ReportContext = createContext<ReportContextValue | undefined>(undefined);

export const ReportProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<ReportData>({
    company: '',
    problem: '',
    customers: '',
    pitch: '',
  });

  // Stable callbacks to avoid recreating on every render
  const setField = useCallback<ReportContextValue['setField']>((field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setMultiple = useCallback<ReportContextValue['setMultiple']>((updates) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const reset = useCallback(() => {
    setData({ company: '', problem: '', customers: '', pitch: '' });
  }, []);

  // Memoize context value so that consumers only re-render when data changes
  const contextValue = useMemo<ReportContextValue>(
    () => ({ ...data, setField, setMultiple, reset }),
    [data, setField, setMultiple, reset]
  );

  return (
    <ReportContext.Provider value={contextValue}>{children}</ReportContext.Provider>
  );
};

export const useReport = () => {
  const ctx = useContext(ReportContext);
  if (!ctx) {
    throw new Error('useReport must be used within a ReportProvider');
  }
  return ctx;
}; 