
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit3, Trash2, PlusCircle, FileText, CalendarDays, Tag, ImageIcon, Compass, Pin, PinOff } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Post } from '@/types/post';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const MAX_PINNED_POSTS = 1; // Changed to 1

export default function PostsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const postsStorageKey = user ? `posts_${user}` : 'posts_GUEST_TEMP';
  const [allPosts, setAllPosts] = useLocalStorage<Post[]>(postsStorageKey, []);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!authLoading && !user) {
      toast({ title: "Authentication Error", description: "Please log in to view your posts.", variant: "destructive" });
      router.push('/login');
    }
  }, [authLoading, user, router, toast]);

  const handleDelete = (postId: string, postTitle: string) => {
    setAllPosts(allPosts.filter((p) => p.id !== postId));
    toast({
      title: "Post Deleted",
      description: `The post "${postTitle}" has been successfully deleted.`,
      variant: 'destructive'
    });
  };

  const handlePinToggle = (postIdToToggle: string) => {
    const postToToggle = allPosts.find(p => p.id === postIdToToggle);
    if (!postToToggle) return;

    let updatedPosts = [...allPosts];
    let toastMessage = "";

    if (postToToggle.pinned) {
      // Unpinning the currently pinned post
      updatedPosts = updatedPosts.map(p => 
        p.id === postIdToToggle ? { ...p, pinned: false } : p
      );
      toastMessage = `"${postToToggle.title}" has been unpinned.`;
    } else {
      // Pinning a new post
      // Unpin any other post first
      updatedPosts = updatedPosts.map(p => {
        if (p.id === postIdToToggle) {
          return { ...p, pinned: true }; // Pin the selected post
        } else if (p.pinned) {
          return { ...p, pinned: false }; // Unpin any other currently pinned post
        }
        return p;
      });
      toastMessage = `"${postToToggle.title}" has been pinned.`;
    }

    setAllPosts(updatedPosts);
    toast({
      title: postToToggle.pinned ? "Post Unpinned" : "Post Pinned",
      description: toastMessage,
    });
  };

  const userPosts = mounted && user ? allPosts.filter(p => p.userId === user) : [];
  const sortedPosts = userPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (authLoading || !mounted) {
    return <div className="flex items-center justify-center min-h-screen">Loading posts...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <FileText className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold text-primary">My Travel Posts</h1>
        </div>
        <Link href="/editor" passHref>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-6 rounded-full text-md font-semibold flex items-center gap-2">
            <PlusCircle className="h-5 w-5" /> Create New Post
          </Button>
        </Link>
      </div>

      {sortedPosts.length === 0 ? (
        <Card className="bg-card border-border shadow-lg text-center py-12">
          <CardContent>
            <CompassIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">No Posts Yet!</h2>
            <p className="text-muted-foreground mb-6">It looks like your travel journal is empty. Start documenting your adventures!</p>
            <Link href="/editor" passHref>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-6 rounded-full text-md font-semibold">
                <PlusCircle className="mr-2 h-5 w-5" /> Create Your First Post
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedPosts.map((post) => (
            <Card key={post.id} className="bg-card border-border flex flex-col justify-between hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 overflow-hidden">
              {post.imageUrl && (
                <Link href={`/editor?id=${post.id}`} className="block relative w-full h-48 group">
                  <Image 
                    src={post.imageUrl} 
                    alt={post.title || 'Post image'} 
                    layout="fill" 
                    objectFit="cover" 
                    className="transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint="travel landscape"
                  />
                </Link>
              )}
               {!post.imageUrl && (
                <div className="w-full h-48 bg-muted flex flex-col items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mb-2" />
                  <p className="text-sm">No image</p>
                </div>
              )}
              <CardHeader className="pb-3 pt-4">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl font-semibold text-foreground hover:text-primary transition-colors">
                     <Link href={`/editor?id=${post.id}`}>
                       {post.title || 'Untitled Post'}
                     </Link>
                  </CardTitle>
                  <Badge 
                    variant={post.status === 'published' ? 'default' : 'secondary'} 
                    className={`${post.status === 'published' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'} text-xs px-2.5 py-1 rounded-full`}
                  >
                    {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                  </Badge>
                </div>
                <CardDescription className="flex items-center text-sm text-muted-foreground">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {post.date ? format(new Date(post.date), 'MMMM dd, yyyy') : 'No Date'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow pt-0 pb-3">
                 <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{post.excerpt || 'No excerpt available.'}</p>
                 {post.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 items-center">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      {post.categories.slice(0, 3).map(cat => ( 
                        <Badge key={cat} variant="outline" className="text-xs border-primary/50 text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full">
                          {cat}
                        </Badge>
                      ))}
                      {post.categories.length > 3 && <Badge variant="outline" className="text-xs">...</Badge>}
                    </div>
                 )}
              </CardContent>
              <CardFooter className="flex justify-end space-x-2 pt-0 pb-4 px-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`px-3 py-2 rounded-md ${post.pinned ? 'text-amber-500 hover:bg-amber-500/10 hover:text-amber-600' : 'text-muted-foreground hover:bg-muted/20 hover:text-foreground'}`}
                  onClick={() => handlePinToggle(post.id)}
                >
                  {post.pinned ? <PinOff className="mr-1.5 h-4 w-4" /> : <Pin className="mr-1.5 h-4 w-4" />}
                  {post.pinned ? 'Unpin' : 'Pin'}
                </Button>
                <Link href={`/editor?id=${post.id}`} passHref>
                  <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 hover:text-primary px-3 py-2 rounded-md">
                    <Edit3 className="mr-1.5 h-4 w-4" /> Edit
                  </Button>
                </Link>
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive px-3 py-2 rounded-md">
                      <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-foreground">Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        This action cannot be undone. This will permanently delete the post:
                        <strong className="text-foreground"> "{post.title || 'Untitled Post'}"</strong>.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="hover:bg-muted/20">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(post.id, post.title)}
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      >
                        Yes, delete post
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// A simple compass icon for the empty state
function CompassIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}
