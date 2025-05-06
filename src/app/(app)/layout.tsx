
'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User, Home } from 'lucide-react'; 
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && !loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = () => {
    logout();
    toast({ title: 'Logged Out', description: 'You have been logged out.' });
    router.push('/login');
  };

  if (typeof window === 'undefined' || loading) {
    return <div className="flex items-center justify-center min-h-screen bg-background text-foreground">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const isActive = (route: string) => pathname === route;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-sidebar-background/80 backdrop-blur-lg border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-primary hover:text-primary/90 transition-colors">
            Travelfy
          </Link>
          <nav className="flex items-center space-x-2">
            <Link href="/dashboard" passHref>
               <Button 
                 variant="ghost" 
                 className={cn(
                   "text-sidebar-foreground hover:text-primary hover:bg-sidebar-accent",
                   isActive('/dashboard') && "text-primary bg-sidebar-accent"
                 )}
               >
                 <Home className="mr-2 h-5 w-5" /> Dashboard
               </Button>
            </Link>
            <Link href="/profile" passHref>
               <Button 
                 variant="ghost" 
                 className={cn(
                  "text-sidebar-foreground hover:text-primary hover:bg-sidebar-accent",
                  isActive('/profile') && "text-primary bg-sidebar-accent"
                 )}
               >
                 <User className="mr-2 h-5 w-5" /> Profile
               </Button>
            </Link>
            <Button variant="ghost" onClick={handleLogout} className="text-sidebar-foreground hover:text-primary hover:bg-sidebar-accent">
               <LogOut className="mr-2 h-5 w-5" /> Log Out
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 md:px-[50px] py-8">
        {children}
      </main>
    </div>
  );
}
