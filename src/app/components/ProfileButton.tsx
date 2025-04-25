'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { UserCircle, SignOut } from 'phosphor-react';
import Image from 'next/image';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';

interface BusinessItem {
  id: string;
  company: string;
  createdAt?: Timestamp;
  data: any;
}

interface ProfileButtonProps {
  onNeedAuth?: () => void;
  onSelectBusiness?: (data: any) => void;
}

export default function ProfileButton({ onNeedAuth, onSelectBusiness }: ProfileButtonProps) {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [businesses, setBusinesses] = useState<BusinessItem[] | null>(null);
  const [bizLoading, setBizLoading] = useState(false);

  // Fetch user's past businesses when dropdown opens the first time
  useEffect(() => {
    if (open && user && businesses === null && !bizLoading) {
      (async () => {
        setBizLoading(true);
        try {
          const q = query(
            collection(db, 'users', user.uid, 'businesses'),
            orderBy('createdAt', 'desc')
          );
          const snapshot = await getDocs(q);
          const list: BusinessItem[] = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              company: data.company ?? '',
              createdAt: data.createdAt as Timestamp | undefined,
              data,
            };
          });
          setBusinesses(list);
        } catch (err) {
          console.error('Error fetching businesses', err);
        } finally {
          setBizLoading(false);
        }
      })();
    }
  }, [open, user, businesses, bizLoading]);

  if (loading) return null;

  // When not signed in – simple button that triggers Google sign-in.
  if (!user) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full border border-[#3F3F3F] text-[#EFEFEF] hover:bg-[#2F2F2F]"
        onClick={() => {
          if (onNeedAuth) onNeedAuth();
          else signInWithGoogle();
        }}
        title="Sign in"
      >
        <UserCircle size={24} weight="bold" />
      </Button>
    );
  }

  // Signed-in: show avatar & dropdown.
  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          className="rounded-full focus:outline-none border border-[#3F3F3F] overflow-hidden w-8 h-8 flex items-center justify-center bg-[#1C1C1C]"
          title={user.email || 'Profile'}
        >
          {user.photoURL ? (
            <Image src={user.photoURL} alt="avatar" width={32} height={32} />
          ) : (
            <UserCircle size={24} weight="fill" className="text-[#EFEFEF]" />
          )}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={4}
          className="z-50 min-w-[220px] rounded-md bg-[#1C1C1C] border border-[#3F3F3F] p-1 shadow-md max-h-[70vh] overflow-y-auto"
        >
          <div className="px-3 py-2 text-xs text-gray-400 border-b border-[#3F3F3F]">
            {user.email}
          </div>

          {/* Previous businesses */}
          {user && (
            <>
              <DropdownMenu.Separator className="h-px my-1 bg-[#3F3F3F]" />
              <div className="px-3 py-1 text-[10px] uppercase tracking-wide text-gray-500">Past businesses</div>
              {bizLoading && (
                <div className="px-3 py-2 text-xs text-gray-400">Loading...</div>
              )}
              {!bizLoading && businesses?.length === 0 && (
                <div className="px-3 py-2 text-xs text-gray-500">None yet</div>
              )}
              {businesses?.map((biz) => (
                <DropdownMenu.Item
                  key={biz.id}
                  onSelect={(e) => {
                    e.preventDefault();
                    if (onSelectBusiness) {
                      onSelectBusiness({ ...biz.data, _docId: biz.id });
                    }
                    setOpen(false);
                  }}
                  className="text-sm cursor-pointer select-none px-3 py-2 rounded hover:bg-[#2F2F2F] focus:outline-none text-[#EFEFEF]"
                >
                  {biz.company || 'Untitled'}
                </DropdownMenu.Item>
              ))}
            </>
          )}

          <DropdownMenu.Separator className="h-px my-1 bg-[#3F3F3F]" />
          <DropdownMenu.Item
            onSelect={(e) => {
              e.preventDefault();
              signOut();
            }}
            className="flex items-center gap-2 text-sm text-red-500 cursor-pointer select-none px-3 py-2 rounded hover:bg-[#2F2F2F] focus:outline-none"
          >
            <SignOut size={16} /> Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
} 