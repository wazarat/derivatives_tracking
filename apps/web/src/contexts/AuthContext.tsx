'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  useAuth as useClerkAuth, 
  useUser, 
  SignIn, 
  SignUp, 
  SignInButton, 
  SignUpButton,
  UserButton,
  UserProfile
} from '@clerk/nextjs';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  sessionId: string | null;
  userClerk: any | null;
  signInClerk: typeof SignIn;
  signUpClerk: typeof SignUp;
  signInButtonClerk: typeof SignInButton;
  signUpButtonClerk: typeof SignUpButton;
  userButtonClerk: typeof UserButton;
  userProfileClerk: typeof UserProfile;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { isLoaded, isSignedIn, userId, sessionId } = useClerkAuth();
  const { user: userClerk } = useUser();

  useEffect(() => {
    // Stub implementation to simulate checking auth state
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    // Stub implementation
    setUser({ id: '123', email });
    return true;
  };

  const signUp = async (email: string, password: string, name?: string): Promise<boolean> => {
    // Stub implementation
    setUser({ id: '123', email, name });
    return true;
  };

  const signOut = async (): Promise<void> => {
    // Stub implementation
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    isLoaded: isLoaded !== undefined ? isLoaded : false,
    isSignedIn: isSignedIn !== undefined ? isSignedIn : false,
    userId: userId !== undefined ? userId : null,
    sessionId: sessionId !== undefined ? sessionId : null,
    userClerk: userClerk !== undefined ? userClerk : null,
    signInClerk: SignIn,
    signUpClerk: SignUp,
    signInButtonClerk: SignInButton,
    signUpButtonClerk: SignUpButton,
    userButtonClerk: UserButton,
    userProfileClerk: UserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
