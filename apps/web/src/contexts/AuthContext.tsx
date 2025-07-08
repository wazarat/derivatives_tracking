'use client';

import React, { createContext, useContext } from 'react';
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

type AuthContextType = {
  isLoaded: boolean;
  isSignedIn: boolean | undefined;
  userId: string | null;
  sessionId: string | null;
  user: any | null;
  signIn: typeof SignIn;
  signUp: typeof SignUp;
  signInButton: typeof SignInButton;
  signUpButton: typeof SignUpButton;
  userButton: typeof UserButton;
  userProfile: typeof UserProfile;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, userId, sessionId } = useClerkAuth();
  const { user } = useUser();

  const value = {
    isLoaded,
    isSignedIn,
    userId,
    sessionId,
    user,
    signIn: SignIn,
    signUp: SignUp,
    signInButton: SignInButton,
    signUpButton: SignUpButton,
    userButton: UserButton,
    userProfile: UserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
