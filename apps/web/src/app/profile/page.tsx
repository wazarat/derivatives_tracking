'use client';

import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      <div className="bg-card rounded-lg border border-border p-4">
        <UserProfile />
      </div>
    </div>
  );
}
