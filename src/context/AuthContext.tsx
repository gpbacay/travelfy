
'use client';

import React, { createContext, useState, useContext, useEffect, type ReactNode, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface UserCredentials {
  username: string;
  passwordHash: string; // In a real app, NEVER store plain passwords. Hash them.
  bio?: string; // Optional biography field
}

interface AuthContextType {
  user: string | null;
  loading: boolean;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  signup: (username: string, pass: string) => Promise<boolean>;
  getUserBio: (username: string) => string | undefined;
  updateUserBio: (username: string, bio: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Basic "hashing" for demonstration - replace with a proper library like bcrypt in production
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
};

// Helper function to set a cookie
const setCookie = (name: string, value: string, days: number) => {
  if (typeof window === 'undefined') return;
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  // Ensure cookie is accessible site-wide
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
};

// Helper function to remove a cookie
const removeCookie = (name: string) => {
  if (typeof window === 'undefined') return;
  // Set expiry date to the past to delete the cookie
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useLocalStorage<string | null>('authUser', null);
  // Store a list of users. Add default admin user if list doesn't exist.
  const [users, setUsers] = useLocalStorage<UserCredentials[]>('userCredentials', [{ username: 'admin', passwordHash: simpleHash('password'), bio: 'Default administrator account.' }]);
  const [loading, setLoading] = useState(true);

  // Check cookie on initial load to sync state if localStorage was cleared but cookie remains
   useEffect(() => {
     // This effect should only run on the client
     if (typeof window !== 'undefined') {
       const cookieValue = document.cookie.split('; ').find(row => row.startsWith('authUser='))?.split('=')[1];
       if (cookieValue && !currentUser) {
         setCurrentUser(cookieValue);
       }
       // Always set loading to false after check
       setLoading(false);
     }
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []); // Run only once on mount

  const login = async (username: string, pass: string): Promise<boolean> => {
    setLoading(true);
    const userExists = users.find(u => u.username === username);
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 200));

    if (userExists && userExists.passwordHash === simpleHash(pass)) {
      setCurrentUser(username);
      setCookie('authUser', username, 7); // Set cookie for 7 days
      setLoading(false);
      return true;
    }
    setLoading(false);
    return false;
  };

  const signup = async (username: string, pass: string): Promise<boolean> => {
     setLoading(true);
     const userExists = users.find(u => u.username === username);
     // Simulate async operation
     await new Promise(resolve => setTimeout(resolve, 200));

     if (userExists) {
       setLoading(false);
       return false; // Username already taken
     }

     const newUser: UserCredentials = {
       username,
       passwordHash: simpleHash(pass),
       bio: '', // Initialize bio as empty string
     };
     setUsers([...users, newUser]);
     // Initialize post storage for the new user
     if (typeof window !== 'undefined') {
      window.localStorage.setItem(`posts_${username}`, JSON.stringify([]));
     }
     setLoading(false);
     return true;
   };

  const logout = () => {
    const postsKey = `posts_${currentUser}`;
    setCurrentUser(null);
    removeCookie('authUser'); // Remove the auth cookie on logout
    // It is important to keep user data, so we won't remove `postsKey` from localStorage.
    // If you want to clear user-specific data upon logout, uncomment the following:
    // if (typeof window !== 'undefined' && currentUser) {
    //   window.localStorage.removeItem(postsKey);
    // }
  };

  const getUserBio = useCallback((username: string): string | undefined => {
      const user = users.find(u => u.username === username);
      return user?.bio;
  }, [users]);

  const updateUserBio = useCallback(async (username: string, bio: string): Promise<boolean> => {
      setLoading(true);
      const userIndex = users.findIndex(u => u.username === username);
      if (userIndex === -1) {
          setLoading(false);
          return false; // User not found
      }
      const updatedUsers = [...users];
      updatedUsers[userIndex] = { ...updatedUsers[userIndex], bio };
      setUsers(updatedUsers);
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 100));
      setLoading(false);
      return true;
  }, [users, setUsers]);


  // Ensure loading state is accurate, client-side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
        if (currentUser !== undefined) { // Check if currentUser state is initialized
        setLoading(false);
        }
    }
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ user: currentUser, loading, login, logout, signup, getUserBio, updateUserBio }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
