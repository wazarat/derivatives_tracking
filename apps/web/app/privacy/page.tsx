'use client';

import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        <h2>Last Updated: July 8, 2025</h2>
        
        <p className="mt-4">
          At CanHav, we take your privacy seriously. This Privacy Policy explains how we collect, 
          use, disclose, and safeguard your information when you use our platform. Please read this 
          privacy policy carefully. If you do not agree with the terms of this privacy policy, please 
          do not access the platform.
        </p>
        
        <h3 className="mt-8">1. Information We Collect</h3>
        <p>
          We may collect information about you in various ways, including:
        </p>
        <ul>
          <li>
            <strong>Personal Data:</strong> Personally identifiable information, such as your name, email 
            address, and other contact details that you voluntarily provide when registering or using our services.
          </li>
          <li>
            <strong>Usage Data:</strong> Information on how you access and use our platform, including your 
            browser type, IP address, device information, pages visited, time spent on pages, and other diagnostic data.
          </li>
          <li>
            <strong>Cookies and Tracking Technologies:</strong> We use cookies and similar tracking technologies 
            to track activity on our platform and hold certain information to improve and analyze our service.
          </li>
        </ul>
        
        <h3 className="mt-6">2. How We Use Your Information</h3>
        <p>
          We may use the information we collect about you for various purposes, including to:
        </p>
        <ul>
          <li>Provide, maintain, and improve our platform and services</li>
          <li>Process transactions and send related information</li>
          <li>Send administrative information, such as updates, security alerts, and support messages</li>
          <li>Respond to your comments, questions, and requests</li>
          <li>Monitor and analyze trends, usage, and activities in connection with our platform</li>
          <li>Detect, prevent, and address technical issues</li>
          <li>Personalize your experience on our platform</li>
        </ul>
        
        <h3 className="mt-6">3. Disclosure of Your Information</h3>
        <p>
          We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
        </p>
        <ul>
          <li>
            <strong>Third-Party Service Providers:</strong> We may share your information with third-party vendors, 
            service providers, contractors, or agents who perform services for us or on our behalf.
          </li>
          <li>
            <strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or sale of all or a 
            portion of our assets, your information may be transferred as part of that transaction.
          </li>
          <li>
            <strong>Legal Requirements:</strong> We may disclose your information where required to do so by law or 
            in response to valid requests by public authorities.
          </li>
        </ul>
        
        <h3 className="mt-6">4. Data Security</h3>
        <p>
          We have implemented appropriate technical and organizational security measures designed to protect the 
          security of any personal information we process. However, please also remember that we cannot guarantee 
          that the internet itself is 100% secure. Although we will do our best to protect your personal information, 
          transmission of personal information to and from our platform is at your own risk.
        </p>
        
        <h3 className="mt-6">5. Analytics and Third-Party Tools</h3>
        <p>
          We may use third-party Service Providers, such as PostHog, to monitor and analyze the use of our platform. 
          These third-party service providers may collect information sent by your browser as part of a web page request.
        </p>
        
        <h3 className="mt-6">6. Your Data Protection Rights</h3>
        <p>
          Depending on your location, you may have certain rights regarding your personal information, such as:
        </p>
        <ul>
          <li>The right to access, update, or delete your personal information</li>
          <li>The right to rectification if your information is inaccurate or incomplete</li>
          <li>The right to object to our processing of your personal data</li>
          <li>The right to request restriction of processing your personal information</li>
          <li>The right to data portability</li>
          <li>The right to withdraw consent</li>
        </ul>
        
        <h3 className="mt-6">7. Children's Privacy</h3>
        <p>
          Our platform is not intended for use by children under the age of 18. We do not knowingly collect 
          personally identifiable information from children under 18. If you are a parent or guardian and you 
          are aware that your child has provided us with personal information, please contact us.
        </p>
        
        <h3 className="mt-6">8. Changes to This Privacy Policy</h3>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
          the new Privacy Policy on this page and updating the "Last Updated" date at the top of this page. 
          You are advised to review this Privacy Policy periodically for any changes.
        </p>
        
        <h3 className="mt-6">9. Contact Us</h3>
        <p>
          If you have any questions about this Privacy Policy, please contact us at:
          <br />
          <a href="mailto:privacy@canhav.com" className="text-blue-500 hover:text-blue-700">
            privacy@canhav.com
          </a>
        </p>
      </div>
    </div>
  );
}
