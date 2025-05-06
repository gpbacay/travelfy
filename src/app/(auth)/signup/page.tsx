
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
import { UserPlus } from 'lucide-react';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { signup, loading } = useAuth(); // Add loading state
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      toast({
        title: 'Signup Failed',
        description: 'Passwords do not match. Please check and try again.',
        variant: 'destructive',
      });
      return;
    }

    if (!username || !password) {
       setError('Username and password are required');
       toast({
         title: 'Signup Failed',
         description: 'Please enter both username and password.',
         variant: 'destructive',
       });
       return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      toast({
        title: 'Signup Failed',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }


    const success = await signup(username, password);
    if (success) {
      toast({ title: 'Signup Successful', description: 'Your Travelfy account has been created. Please log in.' });
      router.push('/login'); 
    } else {
      setError('Signup failed. Username might be taken or another error occurred.');
      toast({
        title: 'Signup Failed',
        description: 'Could not create account. The username might already be in use.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md shadow-2xl bg-card border-border">
        <CardHeader className="space-y-2 text-center pt-8">
          <div className="inline-block p-3 bg-primary rounded-full mx-auto">
            <UserPlus className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Join Travelfy</CardTitle>
          <CardDescription className="text-muted-foreground">Create your account to start your travel story</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 p-8">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-muted-foreground">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
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
                placeholder="Create a password (min. 6 characters)"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label="Password"
                disabled={loading}
                className="bg-input border-border focus:ring-primary focus:border-primary text-lg"
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-muted-foreground">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                aria-label="Confirm Password"
                disabled={loading}
                className="bg-input border-border focus:ring-primary focus:border-primary text-lg"
              />
            </div>
            {error && <p className="text-sm text-destructive text-center pt-2">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 p-8 pt-0">
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6 rounded-full font-semibold" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </Button>
             <p className="text-center text-sm text-muted-foreground">
               Already have an account?{' '}
               <Link href="/login" className="underline hover:text-primary font-medium">
                 Log in
               </Link>
             </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
