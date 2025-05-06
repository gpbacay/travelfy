
'use client';

import React, { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth(); 
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(username, password);
    if (success) {
      toast({ title: 'Login Successful', description: 'Welcome back! Redirecting to dashboard...' });
      router.push('/dashboard');
    } else {
      setError('Invalid username or password');
      toast({
        title: 'Login Failed',
        description: 'Invalid username or password. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md shadow-2xl bg-card border-border">
        <CardHeader className="space-y-2 text-center pt-8">
          <div className="inline-block p-3 bg-primary rounded-full mx-auto">
            <LogIn className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Travelfy</CardTitle>
          <CardDescription className="text-muted-foreground">Log in to explore and share your travel journeys</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 p-8">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-muted-foreground">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                aria-label="Username"
                disabled={loading} 
                className="bg-input border-border focus:ring-primary focus:border-primary text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-muted-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label="Password"
                disabled={loading} 
                className="bg-input border-border focus:ring-primary focus:border-primary text-lg"
              />
            </div>
            {error && <p className="text-sm text-destructive text-center pt-2">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 p-8 pt-0">
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6 rounded-full font-semibold" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
             <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
               <Link href="/signup" className="underline hover:text-primary font-medium">
                 Sign up
               </Link>
             </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
