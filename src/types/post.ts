export interface Post {
  id: string;
  title: string;
  date: string; // Store date as ISO string for simplicity with localStorage
  categories: string[];
  excerpt: string;
  content: string;
  status: 'draft' | 'published';
  imageUrl?: string; // Optional: URL or Data URI for the post's featured image
  userId: string; // Identifier for the user who created the post
  pinned?: boolean; // Added for pinning posts
}
