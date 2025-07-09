'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import Script from 'next/script';

declare global {
  interface Window {
    Canny: {
      render: (options: any) => void;
    };
  }
}

interface FeedbackWidgetProps {
  boardToken?: string;
  basePath?: string;
}

export default function FeedbackWidget({
  boardToken = 'feedback',
  basePath = '/feedback',
}: FeedbackWidgetProps) {
  const { user, isSignedIn } = useUser();
  const cannyInitialized = useRef(false);

  useEffect(() => {
    // Only initialize Canny if the user is signed in and Canny is loaded
    if (isSignedIn && user && window.Canny && !cannyInitialized.current) {
      window.Canny.render({
        boardToken: boardToken,
        basePath: basePath,
        appID: process.env.NEXT_PUBLIC_CANNY_APP_ID,
        user: {
          // Required user fields
          email: user.emailAddresses[0]?.emailAddress,
          name: user.fullName || user.username || 'Anonymous User',
          id: user.id,
          
          // Optional user fields
          avatarURL: user.imageUrl,
          created: user.createdAt,
        },
      });
      
      cannyInitialized.current = true;
    }
  }, [isSignedIn, user, boardToken, basePath]);

  return (
    <>
      {/* Load Canny SDK */}
      <Script
        id="canny-sdk"
        src="https://canny.io/sdk.js"
        strategy="lazyOnload"
        onLoad={() => {
          if (isSignedIn && user && !cannyInitialized.current) {
            window.Canny.render({
              boardToken: boardToken,
              basePath: basePath,
              appID: process.env.NEXT_PUBLIC_CANNY_APP_ID,
              user: {
                email: user.emailAddresses[0]?.emailAddress,
                name: user.fullName || user.username || 'Anonymous User',
                id: user.id,
                avatarURL: user.imageUrl,
                created: user.createdAt,
              },
            });
            
            cannyInitialized.current = true;
          }
        }}
      />
      
      {/* Canny will render in this div */}
      <div id="canny-feedback-container" className="w-full h-full min-h-[500px]" />
    </>
  );
}
