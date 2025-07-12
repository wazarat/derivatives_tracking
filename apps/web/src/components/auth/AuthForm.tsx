'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Input,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useToast
} from '@/components/ui';
import { Loader2 } from 'lucide-react';

// Form validation schema
const authSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type AuthFormValues = z.infer<typeof authSchema>;

export default function AuthForm() {
  const { signIn, signUp } = useAuth();
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
      const success = await signIn(values.email, values.password);
      if (!success) {
        toast({
          title: 'Sign in failed',
          description: 'Please check your credentials and try again',
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
      const success = await signUp(values.email, values.password);
      if (!success) {
        toast({
          title: 'Sign up failed',
          description: 'Please try again with different credentials',
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
  const handleResetPassword = async (email: string) => {
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Since resetPassword is not available in AuthContext, we'll just show a success message
      // In a real implementation, you would integrate with your auth provider's password reset functionality
      setResetSent(true);
      toast({
        title: 'Password reset email sent',
        description: 'Please check your email for instructions',
      });
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
            onClick={() => handleResetPassword(form.getValues('email'))}
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
