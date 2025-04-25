'use client';
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

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
  /** The display name of the signed-in user who created the business entry */
  userName?: string;
  /** The e-mail of the signed-in user who created the business entry */
  userEmail?: string;
}

interface ReportContextValue extends ReportData {
  setField: (field: keyof ReportData, value: any) => void;
  setMultiple: (data: Partial<ReportData>) => void;
  reset: () => void;
  setCurrentDoc: (id: string | null) => void;
}

const ReportContext = createContext<ReportContextValue | undefined>(undefined);

export const ReportProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  const [data, setData] = useState<ReportData>({
    company: '',
    problem: '',
    customers: '',
    pitch: '',
  });

  // Track Firestore document ID for the current business session
  const [docId, setDocId] = useState<string | null>(null);
  // Keep a mutable ref in sync so callbacks always see the latest ID
  const docIdRef = React.useRef<string | null>(null);

  // Helper to persist updates to Firestore (non-blocking)
  const persist = useCallback(
    async (updates: Partial<ReportData>) => {
      if (!user) return; // no persistence if not signed in

      try {
        if (!docIdRef.current) {
          // First time: create a new doc under user's businesses collection
          const docRef = await addDoc(collection(db, 'users', user.uid, 'businesses'), {
            ...updates,
            // Persist basic user metadata alongside business record for easy querying
            userName: user.displayName || 'Anonymous',
            userEmail: user.email || '',
            createdAt: serverTimestamp(),
          });
          docIdRef.current = docRef.id;
          setDocId(docRef.id);
        } else {
          const docRef = doc(db, 'users', user.uid, 'businesses', docIdRef.current);
          await updateDoc(docRef, {
            ...updates,
            // Ensure user meta fields remain present / up-to-date
            userName: user.displayName || 'Anonymous',
            userEmail: user.email || '',
          });
        }
      } catch (err) {
        console.error('Error persisting report data:', err);
      }
    },
    [user]
  );

  // Stable callbacks to avoid recreating on every render
  const setField = useCallback<ReportContextValue['setField']>((field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));

    // Skip creating a new doc for empty initial values
    if (!docIdRef.current) {
      if (typeof value === 'string' && value.trim() === '') return;
      if (Array.isArray(value) && value.length === 0) return;
    }

    // Fire-and-forget persistence
    persist({ [field]: value } as Partial<ReportData>);
  }, [persist]);

  const setMultiple = useCallback<ReportContextValue['setMultiple']>((updates) => {
    setData((prev) => ({ ...prev, ...updates }));

    // Guard: avoid creating blank doc
    if (!docIdRef.current) {
      const hasData = Object.values(updates).some((v) => {
        if (typeof v === 'string') return v.trim().length > 0;
        if (Array.isArray(v)) return v.length > 0;
        return !!v;
      });
      if (!hasData) return;
    }

    persist(updates);
  }, [persist]);

  const setCurrentDoc = useCallback((id: string | null) => {
    docIdRef.current = id;
    setDocId(id);
  }, []);

  const reset = useCallback(() => {
    setData({ company: '', problem: '', customers: '', pitch: '' });
    docIdRef.current = null;
    setDocId(null);
  }, []);

  // Memoize context value so that consumers only re-render when data changes
  const contextValue = useMemo<ReportContextValue>(
    () => ({ ...data, setField, setMultiple, reset, setCurrentDoc }),
    [data, setField, setMultiple, reset, setCurrentDoc]
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