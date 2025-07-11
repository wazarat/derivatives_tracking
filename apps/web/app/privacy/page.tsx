import { Metadata } from "next";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "CanHav privacy policy and data protection information",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1">
            <ChevronLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        
        <Card>
          <CardContent className="prose dark:prose-invert max-w-none pt-6">
            <h2>Introduction</h2>
            <p>
              At CanHav ("we", "our", or "us"), we respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you about how we look after your personal data when you visit our website 
              (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
            </p>
            
            <h2>The Data We Collect About You</h2>
            <p>
              We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
            </p>
            <ul>
              <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data</strong> includes email address and telephone numbers.</li>
              <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, 
                time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology 
                on the devices you use to access this website.</li>
              <li><strong>Profile Data</strong> includes your username and password, your interests, preferences, feedback and survey responses.</li>
              <li><strong>Usage Data</strong> includes information about how you use our website, products and services.</li>
              <li><strong>Marketing and Communications Data</strong> includes your preferences in receiving marketing from us and our 
                third parties and your communication preferences.</li>
            </ul>
            
            <h2>How We Collect Your Personal Data</h2>
            <p>We use different methods to collect data from and about you including through:</p>
            <ul>
              <li><strong>Direct interactions.</strong> You may give us your Identity and Contact Data by filling in forms or by 
                corresponding with us by post, phone, email or otherwise.</li>
              <li><strong>Automated technologies or interactions.</strong> As you interact with our website, we may automatically 
                collect Technical Data about your equipment, browsing actions and patterns.</li>
              <li><strong>Third parties or publicly available sources.</strong> We may receive personal data about you from various 
                third parties and public sources.</li>
            </ul>
            
            <h2>How We Use Your Personal Data</h2>
            <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
            <ul>
              <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
              <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental 
                rights do not override those interests.</li>
              <li>Where we need to comply with a legal obligation.</li>
            </ul>
            
            <h2>Data Security</h2>
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or 
              accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those 
              employees, agents, contractors and other third parties who have a business need to know. They will only process your 
              personal data on our instructions and they are subject to a duty of confidentiality.
            </p>
            
            <h2>Data Retention</h2>
            <p>
              We will only retain your personal data for as long as reasonably necessary to fulfill the purposes we collected it for, 
              including for the purposes of satisfying any legal, regulatory, tax, accounting or reporting requirements. We may retain 
              your personal data for a longer period in the event of a complaint or if we reasonably believe there is a prospect of 
              litigation in respect to our relationship with you.
            </p>
            
            <h2>Your Legal Rights</h2>
            <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data including:</p>
            <ul>
              <li>Request access to your personal data.</li>
              <li>Request correction of your personal data.</li>
              <li>Request erasure of your personal data.</li>
              <li>Object to processing of your personal data.</li>
              <li>Request restriction of processing your personal data.</li>
              <li>Request transfer of your personal data.</li>
              <li>Right to withdraw consent.</li>
            </ul>
            
            <h2>Cookies</h2>
            <p>
              Our website uses cookies to distinguish you from other users of our website. This helps us to provide you with a good 
              experience when you browse our website and also allows us to improve our site. By continuing to browse the site, you 
              are agreeing to our use of cookies.
            </p>
            
            <h2>Changes to the Privacy Policy</h2>
            <p>
              We may update our privacy policy from time to time. We will notify you of any changes by posting the new privacy policy 
              on this page and updating the "Last updated" date at the top of this privacy policy.
            </p>
            
            <h2>Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our privacy practices, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> privacy@canhav.com<br />
              <strong>Address:</strong> CanHav Inc., 123 Crypto Street, San Francisco, CA 94105, USA
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
