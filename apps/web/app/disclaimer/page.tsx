'use client';

import React from 'react';

export default function DisclaimerPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Disclaimer</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        <h2>Last Updated: July 8, 2025</h2>
        
        <h3 className="mt-8">1. No Investment Advice</h3>
        <p>
          The information provided on CanHav ("the Platform") is for general informational purposes only. 
          The content on our platform is not intended to be and does not constitute financial advice, 
          investment advice, trading advice, or any other type of advice. All information on this 
          platform is presented for educational and informational purposes only, without warranty of any kind.
        </p>
        
        <h3 className="mt-6">2. No Guarantee of Accuracy</h3>
        <p>
          While we strive to provide accurate and up-to-date information, we make no representations 
          or warranties of any kind, express or implied, about the completeness, accuracy, reliability, 
          suitability, or availability of the information, products, services, or related graphics 
          contained on the platform. The data presented may be delayed, incorrect, or incomplete.
        </p>
        
        <h3 className="mt-6">3. Risk Warning</h3>
        <p>
          Cryptocurrency trading involves significant risk and is not suitable for all investors. 
          The high degree of leverage can work against you as well as for you. Before deciding to 
          trade cryptocurrencies, you should carefully consider your investment objectives, level 
          of experience, and risk appetite. The possibility exists that you could sustain a loss of 
          some or all of your initial investment and therefore you should not invest money that you 
          cannot afford to lose.
        </p>
        
        <h3 className="mt-6">4. Third-Party Content</h3>
        <p>
          Our platform may include content from third-party sources, including but not limited to 
          CoinGecko, dYdX, Hyperliquid, and other data providers. We do not endorse, guarantee, or 
          warrant the accuracy or reliability of any third-party content. The use of third-party 
          content is at your own risk.
        </p>
        
        <h3 className="mt-6">5. AI-Generated Content</h3>
        <p>
          Some content on this platform, including research insights and market analysis, may be 
          generated using artificial intelligence tools. While we strive to ensure the quality and 
          accuracy of this content, AI-generated content may contain errors, biases, or outdated 
          information. Users should verify any critical information from multiple sources before 
          making investment decisions.
        </p>
        
        <h3 className="mt-6">6. No Liability</h3>
        <p>
          In no event will CanHav, its owners, employees, partners, or agents be liable for any loss 
          or damage including without limitation, indirect or consequential loss or damage, or any 
          loss or damage whatsoever arising from loss of data or profits arising out of, or in 
          connection with, the use of this platform.
        </p>
        
        <h3 className="mt-6">7. Use at Your Own Risk</h3>
        <p>
          Your use of any information or materials on this platform is entirely at your own risk, 
          for which we shall not be liable. It shall be your own responsibility to ensure that any 
          products, services, or information available through this platform meet your specific 
          requirements.
        </p>
        
        <h3 className="mt-6">8. Changes to Disclaimer</h3>
        <p>
          We reserve the right to modify this disclaimer at any time without notice. By using our 
          platform, you agree to be bound by the current version of this disclaimer.
        </p>
        
        <h3 className="mt-6">9. Contact Information</h3>
        <p>
          If you have any questions about this disclaimer, please contact us at:
          <br />
          <a href="mailto:legal@canhav.com" className="text-blue-500 hover:text-blue-700">
            legal@canhav.com
          </a>
        </p>
      </div>
    </div>
  );
}
