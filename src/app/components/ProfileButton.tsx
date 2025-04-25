'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { UserCircle, SignOut, Plus, Trash } from 'phosphor-react';
import Image from 'next/image';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, Timestamp, deleteDoc, doc } from 'firebase/firestore';

interface BusinessItem {
  id: string;
  company: string;
  createdAt?: Timestamp;
  data: any;
}

interface ProfileButtonProps {
  onNeedAuth?: () => void;
  onSelectBusiness?: (data: any) => void;
  onNew?: () => void;
}

export default function ProfileButton({ onNeedAuth, onSelectBusiness, onNew }: ProfileButtonProps) {
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

  // Delete a business document by ID
  const handleDeleteBusiness = async (biz: BusinessItem) => {
    if (!user) return;

    const confirmed = window.confirm(`Delete "${biz.company || 'Untitled'}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'businesses', biz.id));
      // Remove from local state list
      setBusinesses((prev) => prev?.filter((b) => b.id !== biz.id) || []);
    } catch (err) {
      console.error('Error deleting business:', err);
      alert('Failed to delete. Please try again.');
    }
  };

  if (loading) return null;

  // When not signed in – simple button that triggers Google sign-in.
  if (!user) {
    return (
      <Button
        className="rounded-full px-5 py-3 h-[52px] min-w-[140px] flex items-center justify-center transition-colors duration-200 border border-[#3F3F3F] bg-[#1C1C1C] text-[#EFEFEF] hover:bg-[#2F2F2F]"
        onClick={() => {
          if (onNeedAuth) onNeedAuth();
          else signInWithGoogle();
        }}
        title="Sign in"
      >
        <UserCircle size={24} weight="bold" className="mr-2" />
        Sign in
      </Button>
    );
  }

  // Signed-in: show avatar & dropdown.
  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          className="rounded-full focus:outline-none border border-[#3F3F3F] h-[52px] min-w-[52px] flex items-center justify-center gap-2 bg-[#1C1C1C] hover:bg-[#2F2F2F] transition-colors duration-200"
          title={user.email || 'Profile'}
        >
          {user.photoURL ? (
            <Image src={user.photoURL} alt="avatar" width={32} height={32} className="rounded-full" />
          ) : (
            <UserCircle size={24} weight="fill" className="text-[#EFEFEF]" />
          )}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={4}
          className="z-50 min-w-[240px] rounded-md bg-[#1C1C1C] border border-[#3F3F3F] p-1 shadow-md max-h-[70vh] overflow-y-auto"
        >
          <div className="px-3 py-2 text-xs text-gray-400 border-b border-[#3F3F3F]">
            {user.email}
          </div>

          {/* New button */}
          <DropdownMenu.Item
            onSelect={(e) => {
              e.preventDefault();
              if (onNew) {
                onNew();
              }
              setOpen(false);
            }}
            className="flex items-center gap-2 text-sm cursor-pointer select-none px-3 py-2 rounded hover:bg-[#2F2F2F] focus:outline-none text-[#EFEFEF]"
          >
            <Plus size={18} weight="bold" /> New
          </DropdownMenu.Item>
          
          <DropdownMenu.Separator className="h-px my-1 bg-[#3F3F3F]" />

          {/* Previous businesses */}
          {user && (
            <>
              <div className="px-3 py-1 text-[10px] uppercase tracking-wide text-gray-500 font-medium">Past businesses</div>
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
                  className="text-sm cursor-pointer select-none px-3 py-2 rounded hover:bg-[#2F2F2F] focus:outline-none text-[#EFEFEF] flex items-center justify-between gap-2"
                >
                  <span className="flex-1 truncate pr-1">{biz.company || 'Untitled'}</span>
                  <button
                    onClick={(ev) => {
                      ev.stopPropagation();
                      handleDeleteBusiness(biz);
                    }}
                    className="text-red-400 hover:text-red-300 flex-shrink-0"
                    title="Delete"
                  >
                    <Trash size={14} />
                  </button>
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
            className="flex items-center gap-2 text-sm text-red-400 cursor-pointer select-none px-3 py-2 rounded hover:bg-[#2F2F2F] focus:outline-none"
          >
            <SignOut size={18} /> Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
} 