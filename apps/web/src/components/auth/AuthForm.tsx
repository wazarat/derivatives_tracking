'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

// Form validation schema
const authSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type AuthFormValues = z.infer<typeof authSchema>;

export default function AuthForm() {
  const { signIn, signUp, resetPassword } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [resetSent, setResetSent] = useState(false);

  // Initialize form
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Handle sign in
  const handleSignIn = async (values: AuthFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(values.email, values.password);
      if (error) {
        toast({
          title: 'Sign in failed',
          description: error.message || 'Please check your credentials and try again',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Signed in successfully',
          description: 'Welcome back!',
        });
        router.push('/portfolios');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sign up
  const handleSignUp = async (values: AuthFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(values.email, values.password);
      if (error) {
        toast({
          title: 'Sign up failed',
          description: error.message || 'Please try again with different credentials',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Sign up successful',
          description: 'Please check your email to confirm your account',
        });
        // Switch to sign in tab
        setActiveTab('signin');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password reset
  const handleResetPassword = async () => {
    const email = form.getValues('email');
    if (!email || !z.string().email().safeParse(email).success) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await resetPassword(email);
      if (error) {
        toast({
          title: 'Password reset failed',
          description: error.message || 'Please try again later',
          variant: 'destructive',
        });
      } else {
        setResetSent(true);
        toast({
          title: 'Password reset email sent',
          description: 'Please check your email for instructions',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission based on active tab
  const onSubmit = (values: AuthFormValues) => {
    if (activeTab === 'signin') {
      handleSignIn(values);
    } else {
      handleSignUp(values);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {activeTab === 'signin' ? 'Sign In' : 'Create Account'}
        </CardTitle>
        <CardDescription className="text-center">
          {activeTab === 'signin'
            ? 'Enter your credentials to access your portfolios'
            : 'Sign up to start creating and saving portfolios'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {activeTab === 'signin' ? 'Signing in...' : 'Signing up...'}
                  </>
                ) : activeTab === 'signin' ? (
                  'Sign In'
                ) : (
                  'Sign Up'
                )}
              </Button>
            </form>
          </Form>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col">
        {activeTab === 'signin' && !resetSent && (
          <Button
            variant="link"
            className="px-0 text-sm"
            onClick={handleResetPassword}
            disabled={isLoading}
          >
            Forgot password?
          </Button>
        )}
        {resetSent && (
          <p className="text-sm text-center text-muted-foreground">
            Password reset email sent. Please check your inbox.
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
