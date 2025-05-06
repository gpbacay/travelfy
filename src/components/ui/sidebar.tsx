'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react'; // Assuming you want the icon

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  return (
    <div className={`h-full w-64 flex-col border-r bg-background p-4 ${className || ''}`} {...props}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Navigation
          </h2>
          <div className="space-y-1">
            <Link href="/posts" passHref>
              <Button variant="ghost" className="w-full justify-start">
                <BookOpen className="mr-2 h-4 w-4" />
                My Travel Posts
              </Button>
            </Link>
            {/* Add other sidebar links here if needed */}
          </div>
        </div>
      </div>
    </div>
  );
}
