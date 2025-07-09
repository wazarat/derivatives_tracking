'use client';

import React from 'react';
import ChatbotComponent from '../components/ChatbotComponent';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

export default function ResearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Crypto Research Assistant</h1>
      
      <div className="mb-6">
        <p className="text-gray-700 mb-4">
          Our AI-powered research assistant can help you understand cryptocurrencies, blockchain technology, 
          market trends, and trading concepts. Ask questions about any crypto topic to get educational information.
        </p>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-700">
            <strong>Note:</strong> This assistant provides educational information only, not financial advice.
            Always do your own research before making investment decisions.
          </p>
        </div>
      </div>
      
      <SignedIn>
        <ChatbotComponent />
      </SignedIn>
      
      <SignedOut>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Sign In to Access the Research Assistant</h2>
          <p className="text-gray-600 mb-6">
            You need to be signed in to use our AI-powered crypto research assistant.
          </p>
          <SignInButton>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg">
              Sign In
            </button>
          </SignInButton>
        </div>
      </SignedOut>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Example Questions</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>What is the difference between proof of work and proof of stake?</li>
          <li>How do funding rates work in perpetual futures?</li>
          <li>What factors affect cryptocurrency volatility?</li>
          <li>Can you explain what a liquidity pool is?</li>
          <li>What are the risks of yield farming?</li>
        </ul>
      </div>
    </div>
  );
}
