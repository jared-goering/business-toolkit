'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { UserCircle, SignOut } from 'phosphor-react';
import Image from 'next/image';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface ProfileButtonProps {
  onNeedAuth?: () => void;
}

export default function ProfileButton({ onNeedAuth }: ProfileButtonProps) {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [open, setOpen] = useState(false);

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
          className="z-50 min-w-[180px] rounded-md bg-[#1C1C1C] border border-[#3F3F3F] p-1 shadow-md"
        >
          <div className="px-3 py-2 text-xs text-gray-400 border-b border-[#3F3F3F]">
            {user.email}
          </div>
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