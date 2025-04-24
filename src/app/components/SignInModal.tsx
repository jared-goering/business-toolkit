'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { Spinner, GoogleLogo, Envelope, Lock } from 'phosphor-react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface SignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SignInModal({ open, onOpenChange }: SignInModalProps) {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signIn' | 'register'>('signIn');
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      onOpenChange(false); // close modal on success
    } catch (err) {
      console.error('Error during Google sign-in', err);
      setError('Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signIn') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onOpenChange(false);
    } catch (err: any) {
      console.error('Email auth error', err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dialog-content bg-[#1C1C1C] border-[#3F3F3F] text-[#EFEFEF] p-6 rounded-lg max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-[#EFEFEF]">
            Sign in to continue
          </DialogTitle>
        </DialogHeader>
        <div className="pt-4 flex flex-col gap-4 px-1">
          {/* Email/password form */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Envelope size={18} className="text-[#EFEFEF] opacity-70" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-[#2F2F2F] border-[#3F3F3F] text-[#EFEFEF] h-10 rounded-lg focus:border-[#FDE03B] focus:ring-[#FDE03B]/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <Lock size={18} className="text-[#EFEFEF] opacity-70" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 bg-[#2F2F2F] border-[#3F3F3F] text-[#EFEFEF] h-10 rounded-lg focus:border-[#FDE03B] focus:ring-[#FDE03B]/20"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    handleEmailAuth();
                  }
                }}
              />
            </div>
            {error && (
              <p className="text-red-500 text-xs px-1 py-2 bg-red-500/10 rounded border border-red-500/30">
                {error}
              </p>
            )}
            <Button
              onClick={handleEmailAuth}
              disabled={loading}
              className="w-full h-11 rounded-lg border-2 border-[#FDE03B] bg-transparent text-[#FDE03B] hover:bg-[#FDE03B]/10 flex items-center justify-center gap-2 font-medium"
            >
              {loading && mode === (mode === 'signIn' || mode === 'register' ? mode : '') ? (
                <Spinner size={18} className="animate-spin" />
              ) : null}
              {mode === 'signIn' ? 'Sign In' : 'Register'}
            </Button>
            <p className="text-xs text-center text-gray-400 mt-1">
              {mode === 'signIn' ? (
                <>
                  New here?{' '}
                  <button
                    className="text-[#FDE03B] hover:underline font-medium"
                    onClick={() => {
                      setMode('register');
                      setError('');
                    }}
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    className="text-[#FDE03B] hover:underline font-medium"
                    onClick={() => {
                      setMode('signIn');
                      setError('');
                    }}
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-4 my-3">
            <span className="flex-1 h-[1px] bg-[#3F3F3F]" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <span className="flex-1 h-[1px] bg-[#3F3F3F]" />
          </div>

          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex items-center gap-3 rounded-lg h-11 border-2 border-[#00FFFF] bg-transparent text-[#00FFFF] hover:bg-[#00FFFF]/10 px-5 py-2 w-full justify-center font-medium"
          >
            {loading ? (
              <>
                <Spinner size={18} className="animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <GoogleLogo size={18} weight="bold" />
                Sign in with Google
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 