
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Post } from '@/types/post';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Edit3, Save, BookOpen, UserCircle, Edit, CheckCircle, XCircle, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton'; 
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, getUserBio, updateUserBio, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Use a user-specific key for posts
  const postsStorageKey = user ? `posts_${user}` : 'posts_GUEST_TEMP';
  const [allPosts] = useLocalStorage<Post[]>(postsStorageKey, []); 
  
  const [bio, setBio] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [publishedPosts, setPublishedPosts] = useState<Post[]>([]);
  const [mounted, setMounted] = useState(false);


  useEffect(() => {
    setMounted(true);
    if (!authLoading && !user) {
      toast({ title: "Authentication Error", description: "Please log in to view your profile.", variant: "destructive" });
      router.push('/login');
      return;
    }
    if (user) {
      const userBio = getUserBio(user);
      setBio(userBio || '');
    }
  }, [user, getUserBio, authLoading, router, toast]);

  useEffect(() => {
    if (mounted && user) { // Ensure user is defined before filtering
      const userPublishedPosts = allPosts
        .filter((p) => p.userId === user && p.status === 'published') // Filter by userId
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setPublishedPosts(userPublishedPosts);
    }
  }, [allPosts, mounted, user]); // Add user to dependency array

  const handleSaveBio = async () => {
    if (!user) return;
    const success = await updateUserBio(user, bio);
    if (success) {
      toast({ title: 'Biography Updated', description: 'Your biography has been successfully saved.', className: 'bg-primary text-primary-foreground' });
      setIsEditingBio(false);
    } else {
      toast({ title: 'Error Updating Bio', description: 'Failed to update biography. Please try again.', variant: 'destructive' });
    }
  };

  if (!mounted || authLoading) {
    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <UserCircle className="h-12 w-12 text-primary" />
              <h1 className="text-4xl font-bold text-primary">My Profile</h1>
            </div>
            <Card className="bg-card border-border shadow-xl">
                <CardHeader className="flex flex-row items-center space-x-6 p-6">
                    <Skeleton className="h-24 w-24 rounded-full bg-muted" />
                    <div className="space-y-3">
                        <Skeleton className="h-8 w-48 bg-muted" />
                        <Skeleton className="h-5 w-32 bg-muted" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-8 p-6">
                    <div>
                        <h3 className="text-xl font-semibold mb-3 flex items-center text-foreground"><UserCircle className="mr-2.5 h-6 w-6 text-primary" /> Biography</h3>
                        <Skeleton className="h-24 w-full bg-muted" />
                    </div>
                     <div>
                         <h3 className="text-xl font-semibold mb-4 flex items-center text-foreground"><BookOpen className="mr-2.5 h-6 w-6 text-primary" /> My Published Posts</h3>
                         <div className="space-y-4">
                            <Skeleton className="h-28 w-full bg-muted rounded-lg" />
                            <Skeleton className="h-28 w-full bg-muted rounded-lg" />
                         </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
  }

  if (!user) {
     // This case should ideally be handled by the useEffect redirect, but as a fallback:
    return <p className="text-center text-muted-foreground py-10 text-lg">Please log in to view your profile.</p>;
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-12">
      <div className="flex items-center gap-3">
        <UserCircle className="h-12 w-12 text-primary" />
        <h1 className="text-4xl font-bold text-primary">My Profile</h1>
      </div>

      <Card className="bg-card border-border shadow-xl overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-6 p-6 bg-card/50 border-b border-border">
          <Avatar className="h-24 w-24 border-4 border-primary">
            <AvatarImage src={`https://picsum.photos/seed/${user.replace(/\s+/g, '_')}/200`} alt={user} data-ai-hint="abstract user" className="object-cover"/>
            <AvatarFallback className="text-3xl bg-primary text-primary-foreground">{user.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="mt-4 sm:mt-0 text-center sm:text-left">
            <CardTitle className="text-3xl font-bold text-foreground">{user}</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">Travelfy Member</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 p-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-semibold flex items-center text-foreground"><UserCircle className="mr-2.5 h-6 w-6 text-primary" /> Biography</h3>
              {!isEditingBio && (
                <Button variant="ghost" size="sm" onClick={() => setIsEditingBio(true)} className="text-primary hover:bg-primary/10 hover:text-primary">
                  <Edit3 className="mr-2 h-4 w-4" /> Edit Bio
                </Button>
              )}
            </div>
            {isEditingBio ? (
              <div className="space-y-3">
                <Label htmlFor="bio" className="text-muted-foreground">Edit your biography</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a bit about your travel style, favorite destinations, or anything else you'd like others to know..."
                  rows={5}
                  className="bg-input border-border focus:ring-primary focus:border-primary text-base p-3"
                />
                <div className="flex justify-end space-x-2 pt-2">
                    <Button onClick={() => { setIsEditingBio(false); const userBio = getUserBio(user); setBio(userBio || ''); }} variant="outline" size="sm" className="text-muted-foreground border-muted-foreground/50 hover:bg-muted/20">
                        <XCircle className="mr-2 h-4 w-4"/> Cancel
                    </Button>
                    <Button onClick={handleSaveBio} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        <CheckCircle className="mr-2 h-4 w-4" /> Save Biography
                    </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground whitespace-pre-line text-base leading-relaxed bg-input/50 p-4 rounded-md border border-border">
                {bio || 'No biography set yet. Click "Edit Bio" to add one!'}
              </p>
            )}
          </div>

          <hr className="my-6 border-border/50" />

          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center text-foreground"><BookOpen className="mr-2.5 h-6 w-6 text-primary" /> My Published Posts</h3>
            {publishedPosts.length > 0 ? (
              <div className="space-y-4">
                {publishedPosts.map((post) => (
                  <Card key={post.id} className="bg-card/50 border-border hover:shadow-lg transition-shadow duration-200 ease-in-out">
                    <div className="flex">
                      {post.imageUrl && (
                        <Link href={`/editor?id=${post.id}`} className="block relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 m-4 rounded-md overflow-hidden">
                          <Image 
                            src={post.imageUrl} 
                            alt={post.title || 'Post image'} 
                            layout="fill" 
                            objectFit="cover"
                            data-ai-hint="travel city"
                          />
                        </Link>
                      )}
                       {!post.imageUrl && (
                        <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 m-4 rounded-md bg-muted flex flex-col items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-8 w-8 mb-1" />
                          <p className="text-xs">No image</p>
                        </div>
                      )}
                      <div className="flex-grow">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg font-medium text-foreground">
                              <Link href={`/editor?id=${post.id}`} className="hover:text-primary transition-colors">
                                {post.title || 'Untitled Post'}
                              </Link>
                            </CardTitle>
                            <Badge variant="default" className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0">Published</Badge>
                          </div>
                          <CardDescription className="text-xs text-muted-foreground pt-0.5">
                            {post.date ? format(new Date(post.date), 'MMMM dd, yyyy') : 'No Date'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-1">
                          <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt || 'No excerpt available.'}</p>
                        </CardContent>
                        <CardFooter className="flex justify-end p-4 pt-0">
                            <Link href={`/editor?id=${post.id}`} passHref>
                              <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 hover:text-primary">
                                <Edit className="mr-1.5 h-4 w-4" /> View/Edit
                              </Button>
                            </Link>
                        </CardFooter>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-input/30 rounded-md border border-dashed border-border">
                 <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                 <p className="text-muted-foreground text-base">You have no published posts yet.</p>
                 <p className="text-sm text-muted-foreground/70 mt-1">Time to share your adventures!</p>
                 <Link href="/editor" passHref className="mt-4 inline-block">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 py-2 text-sm">Create New Post</Button>
                 </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
