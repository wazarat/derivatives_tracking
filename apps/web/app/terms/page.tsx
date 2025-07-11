import { Metadata } from "next";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "CanHav terms of service and user agreement",
};

export default function TermsOfServicePage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        
        <Card>
          <CardContent className="prose dark:prose-invert max-w-none pt-6">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using the CanHav platform ("Service"), you agree to be bound by these Terms of Service 
              ("Terms"). If you disagree with any part of the terms, you may not access the Service.
            </p>
            
            <h2>2. Description of Service</h2>
            <p>
              CanHav provides a cryptocurrency research and analytics platform that allows users to access market data, 
              track assets, create watchlists, and analyze cryptocurrency markets. The Service may include features such 
              as portfolio tracking, risk assessment, market data visualization, and AI-powered research assistance.
            </p>
            
            <h2>3. Registration and Account Security</h2>
            <p>
              To access certain features of the Service, you may be required to register for an account. You agree to 
              provide accurate, current, and complete information during the registration process and to update such 
              information to keep it accurate, current, and complete.
            </p>
            <p>
              You are responsible for safeguarding the password that you use to access the Service and for any activities 
              or actions under your password. You agree not to disclose your password to any third party. You must notify 
              us immediately upon becoming aware of any breach of security or unauthorized use of your account.
            </p>
            
            <h2>4. User Content</h2>
            <p>
              Our Service allows you to post, link, store, share and otherwise make available certain information, text, 
              graphics, or other material ("User Content"). You are responsible for the User Content that you post to the 
              Service, including its legality, reliability, and appropriateness.
            </p>
            <p>
              By posting User Content to the Service, you grant us the right and license to use, modify, publicly perform, 
              publicly display, reproduce, and distribute such content on and through the Service. You retain any and all 
              of your rights to any User Content you submit, post, or display on or through the Service and you are 
              responsible for protecting those rights.
            </p>
            
            <h2>5. Intellectual Property</h2>
            <p>
              The Service and its original content (excluding User Content), features, and functionality are and will remain 
              the exclusive property of CanHav and its licensors. The Service is protected by copyright, trademark, and other 
              laws of both the United States and foreign countries. Our trademarks and trade dress may not be used in 
              connection with any product or service without the prior written consent of CanHav.
            </p>
            
            <h2>6. Data Usage and Privacy</h2>
            <p>
              Your use of the Service is also governed by our Privacy Policy, which can be found at{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                https://canhav.com/privacy
              </Link>
              . By using the Service, you consent to the collection and use of information as detailed in our Privacy Policy.
            </p>
            
            <h2>7. Third-Party Data and Services</h2>
            <p>
              The Service may display data and information from third-party sources, including but not limited to 
              CoinMarketCap, dYdX, and Hyperliquid. This data is provided for informational purposes only and may be 
              subject to delays, inaccuracies, or errors. CanHav does not guarantee the accuracy, completeness, or 
              timeliness of any third-party data.
            </p>
            <p>
              The Service may contain links to third-party websites or services that are not owned or controlled by CanHav. 
              We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any 
              third-party websites or services.
            </p>
            
            <h2>8. Disclaimer of Warranties</h2>
            <p>
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis. CanHav expressly disclaims all warranties of 
              any kind, whether express or implied, including but not limited to the implied warranties of merchantability, 
              fitness for a particular purpose, and non-infringement.
            </p>
            <p>
              CanHav makes no warranty that (i) the Service will meet your requirements, (ii) the Service will be 
              uninterrupted, timely, secure, or error-free, (iii) the results that may be obtained from the use of the 
              Service will be accurate or reliable, or (iv) the quality of any products, services, information, or other 
              material purchased or obtained by you through the Service will meet your expectations.
            </p>
            
            <h2>9. Limitation of Liability</h2>
            <p>
              In no event shall CanHav, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable 
              for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss 
              of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or 
              inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) 
              any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions 
              or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, 
              whether or not we have been informed of the possibility of such damage.
            </p>
            
            <h2>10. Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason 
              whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the 
              Service will immediately cease.
            </p>
            
            <h2>11. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of the United States, without regard 
              to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be 
              considered a waiver of those rights.
            </p>
            
            <h2>12. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is 
              material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes 
              a material change will be determined at our sole discretion.
            </p>
            <p>
              By continuing to access or use our Service after those revisions become effective, you agree to be bound by the 
              revised terms. If you do not agree to the new terms, please stop using the Service.
            </p>
            
            <h2>13. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> legal@canhav.com<br />
              <strong>Address:</strong> CanHav Inc., 123 Crypto Street, San Francisco, CA 94105, USA
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
