import { UserProfile } from "@clerk/nextjs";
 
export default function ProfilePage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      <div className="bg-card rounded-lg border border-border p-4">
        <UserProfile
          appearance={{
            elements: {
              card: "bg-transparent shadow-none border-none",
              navbar: "bg-transparent",
              navbarButton: "text-foreground hover:text-primary",
              pageScrollBox: "bg-transparent",
              formButtonPrimary: 
                "bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              formFieldLabel: "text-sm font-medium text-foreground",
              formFieldInput: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              profileSectionTitle: "text-lg font-semibold text-foreground",
              profileSectionPrimaryButton: "bg-primary text-primary-foreground hover:bg-primary/90",
              profileSectionSecondaryButton: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            },
          }}
        />
      </div>
    </div>
  );
}
