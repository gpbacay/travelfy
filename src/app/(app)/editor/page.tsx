
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Save, Send, XCircle, FileText, Edit3, ImageIcon, Trash2, UploadCloud } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';
import type { Post } from '@/types/post';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';


export default function EditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get('id');
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const postsStorageKey = user ? `posts_${user}` : 'posts_GUEST_TEMP';
  const [posts, setPosts] = useLocalStorage<Post[]>(postsStorageKey, []);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [categories, setCategories] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrlToSave, setImageUrlToSave] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Post | null>(null);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to resolve

    if (!user) {
        toast({ title: 'Authentication Error', description: 'Please log in to manage posts.', variant: 'destructive' });
        router.push('/login');
        return;
    }
    // If user changes, reset posts to the new user's posts.
    // This ensures the correct posts are loaded if the user logs out and logs in as someone else.
    // useLocalStorage hook should handle this if `postsStorageKey` changes.
    // We might need an explicit reload if `useLocalStorage` doesn't re-fetch on key change automatically or fast enough.
    // For now, we assume `useLocalStorage` handles the key change.
    if (postId) {
      const postToEdit = posts.find((p) => p.id === postId && p.userId === user);
      if (postToEdit) {
        setIsEditing(true);
        setCurrentPost(postToEdit);
        setTitle(postToEdit.title);
        setDate(postToEdit.date ? new Date(postToEdit.date) : undefined);
        setCategories(postToEdit.categories.join(', '));
        setExcerpt(postToEdit.excerpt);
        if (contentRef.current) {
          contentRef.current.innerHTML = postToEdit.content;
        }
        if (postToEdit.imageUrl) {
          setImagePreview(postToEdit.imageUrl);
          setImageUrlToSave(postToEdit.imageUrl);
        } else {
          setImagePreview(null);
          setImageUrlToSave(undefined);
        }
      } else {
        toast({ title: 'Error', description: 'Post not found or you do not have permission to edit it. Redirecting...', variant: 'destructive' });
        router.push('/posts');
      }
    } else {
        setIsEditing(false);
        setCurrentPost(null);
        setTitle('');
        setDate(new Date());
        setCategories('');
        setExcerpt('');
        if (contentRef.current) {
            contentRef.current.innerHTML = '';
        }
        setImagePreview(null);
        setImageUrlToSave(undefined);
    }
  }, [postId, posts, router, toast, user, authLoading]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ title: 'Image Too Large', description: 'Please select an image smaller than 5MB.', variant: 'destructive' });
        if(fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImageUrlToSave(result);
        toast({ title: 'Image Selected', description: 'New featured image ready for saving.'});
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageUrlToSave(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
    toast({ title: 'Image Removed', description: 'The featured image has been cleared.'});
  }

  const handleSave = (status: 'draft' | 'published') => {
    if (!user) {
        toast({ title: 'Authentication Error', description: 'You must be logged in to save posts.', variant: 'destructive' });
        return;
    }
    const content = contentRef.current?.innerHTML || '';

    if (!title.trim() || !date || !content.trim()) {
       toast({ title: 'Missing Fields', description: 'Title, date, and content are required to save.', variant: 'destructive'});
       return;
    }

    const postData: Post = {
      id: isEditing && currentPost ? currentPost.id : uuidv4(),
      userId: user, // Associate post with current user
      title: title.trim(),
      date: date.toISOString(),
      categories: categories.split(',').map((cat) => cat.trim()).filter(Boolean),
      excerpt: excerpt.trim(),
      content,
      status,
      imageUrl: imageUrlToSave,
    };

    let updatedPosts;
    if (isEditing) {
      updatedPosts = posts.map((p) => (p.id === postData.id ? postData : p));
      toast({ title: 'Post Updated Successfully', description: `Your post "${title}" has been saved as ${status}.` });
    } else {
      updatedPosts = [...posts, postData];
      toast({ title: 'Post Saved Successfully', description: `Your post "${title}" has been saved as ${status}.` });
    }
    setPosts(updatedPosts);
    router.push('/posts');
  };

  const handleCancel = () => {
    router.push(isEditing && currentPost ? `/posts` : '/dashboard');
  };

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading editor...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      <div className="flex items-center gap-4 pt-2">
        {isEditing ? <Edit3 className="h-10 w-10 text-primary flex-shrink-0" /> : <FileText className="h-10 w-10 text-primary flex-shrink-0" />}
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary">{isEditing ? 'Edit Your Travel Story' : 'Craft a New Travel Story'}</h1>
            <p className="text-muted-foreground mt-1">{isEditing ? 'Refine your existing post or make quick updates.' : 'Fill in the details below to share your adventure.'}</p>
        </div>
      </div>
      
      <Card className="bg-card border-border shadow-xl overflow-hidden">
        <CardContent className="p-6 md:p-8 space-y-8">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-lg font-semibold text-muted-foreground">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., My Unforgettable Trip to the Alps"
              required
              className="text-xl p-4 bg-input border-border focus:ring-primary focus:border-primary h-14"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-lg font-semibold text-muted-foreground">Date of Travel</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal text-lg p-4 bg-input border-border hover:bg-input/80 h-14',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border-border shadow-lg">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="[&_button]:text-base [&_caption]:text-lg"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categories" className="text-lg font-semibold text-muted-foreground">Categories</Label>
              <Input
                id="categories"
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
                placeholder="Adventure, Culture (comma-separated)"
                className="text-lg p-4 bg-input border-border focus:ring-primary focus:border-primary h-14"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="featured-image" className="text-lg font-semibold text-muted-foreground">Featured Image</Label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Input
                id="featured-image"
                type="file"
                accept="image/png, image/jpeg, image/gif"
                onChange={handleImageChange}
                ref={fileInputRef}
                className="flex-grow text-base p-3 bg-input border-border focus:ring-primary focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer h-14"
              />
              {imagePreview && (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={removeImage}
                    className="flex-shrink-0 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive h-14 w-14"
                    aria-label="Remove image"
                  >
                    <Trash2 className="h-6 w-6" />
                  </Button>
              )}
            </div>
            {imagePreview ? (
              <div className="mt-4 relative group w-full max-w-xl aspect-[16/9] rounded-lg overflow-hidden border-2 border-primary shadow-md">
                <Image src={imagePreview} alt="Featured image preview" layout="fill" objectFit="cover" data-ai-hint="travel post image" />
              </div>
            ) : (
              <div className="mt-4 flex flex-col items-center justify-center w-full max-w-xl aspect-[16/9] bg-input/50 border-2 border-dashed border-border rounded-lg text-muted-foreground p-6">
                  <UploadCloud className="h-16 w-16 mb-3 text-primary/70" />
                  <p className="text-lg font-medium">No image selected.</p>
                  <p className="text-sm text-center">Upload an image (PNG, JPG, GIF - max 5MB)</p>
              </div>
            )}
          </div>


          <div className="space-y-2">
            <Label htmlFor="excerpt" className="text-lg font-semibold text-muted-foreground">Excerpt (Short Summary)</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A brief teaser of your amazing journey..."
              rows={3}
              className="text-lg p-4 bg-input border-border focus:ring-primary focus:border-primary min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-lg font-semibold text-muted-foreground">Your Story</Label>
            <div
              id="content"
              ref={contentRef}
              contentEditable
              className="mt-1 block w-full rounded-md border border-input bg-input px-4 py-3 text-lg ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary min-h-[300px] prose prose-invert max-w-none prose-p:text-lg prose-headings:text-primary prose-headings:font-semibold prose-strong:text-foreground prose-em:text-muted-foreground"
              aria-label="Post content area"
            />
             <p className="text-xs text-muted-foreground/70">Tip: You can use basic HTML for formatting like &lt;b&gt;bold&lt;/b&gt;, &lt;i&gt;italic&lt;/i&gt;, or &lt;p&gt;paragraphs&lt;/p&gt;.</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-end items-center gap-3 sm:gap-4 sticky bottom-0 bg-background/90 backdrop-blur-md py-4 px-4 -mx-4 md:-mx-0 rounded-t-lg border-t border-border shadow-top">
         <Button variant="outline" onClick={handleCancel} className="text-lg py-3 px-6 sm:py-6 sm:px-8 rounded-full border-muted-foreground text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground w-full sm:w-auto">
             <XCircle className="mr-2 h-5 w-5" /> Cancel
         </Button>
        <Button variant="secondary" onClick={() => handleSave('draft')} className="text-lg py-3 px-6 sm:py-6 sm:px-8 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 w-full sm:w-auto">
          <Save className="mr-2 h-5 w-5" /> Save Draft
        </Button>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3 px-6 sm:py-6 sm:px-8 rounded-full w-full sm:w-auto" onClick={() => handleSave('published')}>
          <Send className="mr-2 h-5 w-5" /> {isEditing ? 'Update & Publish' : 'Publish Story'}
        </Button>
      </div>
    </div>
  );
}
