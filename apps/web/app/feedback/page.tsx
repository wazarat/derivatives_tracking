'use client';

import React from 'react';
import FeedbackWidget from '../components/FeedbackWidget';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

export default function FeedbackPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Feedback & Feature Requests</h1>
      
      <div className="mb-6">
        <p className="text-gray-700 mb-4">
          We value your feedback! Use this page to report bugs, suggest new features, or share your thoughts on how we can improve CanHav.
        </p>
        
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <p className="text-blue-700">
            <strong>Note:</strong> Your feedback helps us prioritize our roadmap and build a better product for you.
            Feel free to vote on existing ideas or submit new ones.
          </p>
        </div>
      </div>
      
      <SignedIn>
        <div className="bg-white rounded-lg shadow-md p-4">
          <FeedbackWidget boardToken="feedback" basePath="/feedback" />
        </div>
      </SignedIn>
      
      <SignedOut>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Sign In to Submit Feedback</h2>
          <p className="text-gray-600 mb-6">
            You need to be signed in to submit feedback or vote on feature requests.
          </p>
          <SignInButton>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg">
              Sign In
            </button>
          </SignInButton>
        </div>
      </SignedOut>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Sign in to your account</li>
          <li>Browse existing feedback and feature requests</li>
          <li>Vote on ideas you'd like to see implemented</li>
          <li>Submit your own suggestions or bug reports</li>
          <li>Our team will review and respond to your feedback</li>
        </ol>
      </div>
    </div>
  );
}
