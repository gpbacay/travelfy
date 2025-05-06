'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PlusCircle, Compass, Pin, CalendarDays, Tag, ImageIcon } from 'lucide-react';
import { Sidebar } from '@/components/ui/sidebar';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Post } from '@/types/post';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DashboardPage() {
  const { user } = useAuth();
  const postsStorageKey = user ? `posts_${user}` : 'posts_GUEST_TEMP';
  const [allPosts, setAllPosts] = useLocalStorage<Post[]>(postsStorageKey, []);
  const [pinnedPost, setPinnedPost] = useState<Post | null>(null);

  useEffect(() => {
    const currentPinnedPost = allPosts.find(post => post.pinned) || null;
    setPinnedPost(currentPinnedPost);
  }, [allPosts]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Fixed Sidebar */}
      <div className="flex-none h-full bg-card border-r border-border">
        <Sidebar />
      </div>

      {/* Main scrollable content via a single ScrollArea */}
      <main className="flex-1 flex flex-col overflow-hidden p-8">
        <ScrollArea className="flex-1">
          <div className="mb-12 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-primary">Welcome to Travelfy</h1>
            <p className="text-lg text-muted-foreground mt-2">Your journey starts here. Create, manage, and share your travel adventures.</p>
          </div>

          {/* Pinned Post Section */}
          <section className="mb-12">
            <h2 className="flex items-center text-3xl font-semibold text-primary mb-6">
              <Pin className="mr-3 h-7 w-7 text-primary" /> Featured
            </h2>
            {pinnedPost ? (
              <Card key={pinnedPost.id} className="group flex flex-col md:flex-row overflow-hidden bg-card border-border hover:shadow-xl transition-shadow duration-300 ease-in-out">
                {pinnedPost.imageUrl ? (
                  <div className="relative h-64 md:h-auto md:w-1/3 group-hover:opacity-90 transition-opacity duration-300">
                    <Image
                      src={pinnedPost.imageUrl}
                      alt={pinnedPost.title || 'Pinned post image'}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex h-64 md:h-auto md:w-1/3 flex-col items-center justify-center bg-muted p-4 text-muted-foreground">
                    <ImageIcon className="mb-2 h-16 w-16" />
                    <p className="text-sm text-center">No image for this post</p>
                  </div>
                )}
                <div className={`flex w-full flex-col justify-between p-6 ${pinnedPost.imageUrl ? 'md:w-2/3' : ''}`}>
                  <div>
                    <CardTitle className="mb-2 text-2xl font-bold lg:text-3xl group-hover:text-primary transition-colors">
                      {pinnedPost.title}
                    </CardTitle>
                    <CardDescription className="mb-1 flex items-center text-muted-foreground">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {pinnedPost.date ? format(new Date(pinnedPost.date), 'MMMM dd, yyyy') : 'No Date'}
                    </CardDescription>
                    {pinnedPost.categories && pinnedPost.categories.length > 0 && (
                      <div className="mb-4 flex items-center text-sm text-muted-foreground">
                        <Tag className="mr-2 h-4 w-4" />
                        {pinnedPost.categories.join(', ')}
                      </div>
                    )}
                    <p className="mb-6 line-clamp-3 text-md text-muted-foreground">
                      {pinnedPost.excerpt}
                    </p>
                  </div>
                  <Link href={`/posts/${pinnedPost.id}`} passHref>
                    <Button variant="outline" className="w-full md:w-auto py-3 px-6 text-lg font-semibold text-primary border-primary hover:bg-primary/10 group-hover:scale-105 transition-transform duration-200">
                      Read More
                    </Button>
                  </Link>
                </div>
              </Card>
            ) : (
              <Card className="bg-card border-border text-center py-12">
                <CardContent>
                  <Pin className="mx-auto mb-4 h-12 w-12 opacity-50 text-muted-foreground" />
                  <p className="text-xl italic text-muted-foreground">No post pinned yet.</p>
                  <p className="mt-2 text-sm text-muted-foreground">Pin a post to feature it here.</p>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Other Dashboard Cards */}
          <div className="grid grid-cols-1 gap-8 border-t border-border pt-8 md:grid-cols-2">
            <Card className="group bg-card border-border hover:shadow-xl transition-shadow duration-300 ease-in-out">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <PlusCircle className="h-8 w-8 text-primary" />
                  Create New Post
                </CardTitle>
                <CardDescription className="pt-1 text-muted-foreground">Craft a new travel story, add photos, and share your experiences with the world.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/editor" passHref>
                  <Button className="w-full rounded-full bg-primary py-6 text-lg font-semibold text-primary-foreground hover:bg-primary/90 group-hover:scale-105 transition-transform duration-200">
                    Start Writing
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group bg-card border-border hover:shadow-xl transition-shadow duration-300 ease-in-out">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Compass className="h-8 w-8 text-primary" />
                  Explore & Inspire
                </CardTitle>
                <CardDescription className="pt-1 text-muted-foreground">
                  Discover amazing travel stories from the Travelfy community or find inspiration for your next trip (coming soon!).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Feature currently under development. Stay tuned for exciting updates!</p>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <footer className="bg-background border-t border-border py-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Travelfy. All rights reserved. Made with 💚.
          </footer>
        </ScrollArea>
      </main>
    </div>
  );
}
