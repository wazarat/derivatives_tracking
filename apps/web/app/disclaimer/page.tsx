import { Metadata } from "next";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "CanHav legal disclaimer and terms of use",
};

export default function DisclaimerPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Disclaimer</h1>
          <p className="text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        
        <Card>
          <CardContent className="prose dark:prose-invert max-w-none pt-6">
            <h2>General Information</h2>
            <p>
              The information provided on CanHav ("we", "our", or "us") is for general informational purposes only. 
              All information on the site is provided in good faith, however, we make no representation or warranty 
              of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, 
              or completeness of any information on the site.
            </p>
            
            <h2>Not Financial Advice</h2>
            <p>
              The content on CanHav is not intended to be and does not constitute financial advice, investment advice, 
              trading advice, or any other advice. The information on this website is general in nature and is not specific 
              to you or anyone else. You should not make any decision, financial, investment, trading or otherwise, based 
              on any of the information presented on this site without undertaking independent due diligence and consultation 
              with a professional financial advisor.
            </p>
            
            <h2>Investment Risks</h2>
            <p>
              Cryptocurrency investments are subject to high market risk. Please make your investments cautiously. 
              CanHav will not be held liable for your investment losses.
            </p>
            <p>
              Trading and investing in cryptocurrencies (also called digital or virtual currencies, altcoins, etc.), 
              derivatives and other related products carries a high level of risk, and may not be suitable for all investors. 
              The value of cryptocurrencies can go up or down, and you could lose some or all of your investment. 
              Cryptocurrency trading may be subject to extreme price volatility.
            </p>
            
            <h2>Third-Party Data</h2>
            <p>
              CanHav relies on third-party data providers such as CoinMarketCap, dYdX, and Hyperliquid for market data. 
              While we strive to ensure the data displayed is accurate and up-to-date, we cannot guarantee its accuracy, 
              completeness, or timeliness. The data may be delayed or contain errors, and should not be the sole basis 
              for any investment decision.
            </p>
            
            <h2>No Endorsement</h2>
            <p>
              References to specific cryptocurrencies, tokens, projects, or companies on our platform do not constitute 
              an endorsement, recommendation, or opinion about their quality, potential value, or suitability. We do not 
              favor or promote any specific cryptocurrency or blockchain project.
            </p>
            
            <h2>External Links</h2>
            <p>
              Our website may contain links to external websites that are not provided or maintained by or in any way 
              affiliated with CanHav. Please note that we do not guarantee the accuracy, relevance, timeliness, or 
              completeness of any information on these external websites.
            </p>
            
            <h2>Technical Risks</h2>
            <p>
              Cryptocurrency transactions may be irreversible, and losses due to fraudulent or accidental transactions 
              may not be recoverable. There are risks associated with using internet-based currencies, including, but 
              not limited to, the risk of hardware, software and internet connections, the risk of malicious software 
              introduction, and the risk that third parties may obtain unauthorized access to information stored within 
              your wallet.
            </p>
            
            <h2>Regulatory Risks</h2>
            <p>
              The regulatory status of cryptocurrencies and blockchain technology is unclear or unsettled in many 
              jurisdictions. Changes in regulations may adversely affect the use, transfer, exchange, and value of 
              cryptocurrency assets. You are responsible for knowing and understanding how cryptocurrency will be 
              addressed, regulated, and taxed under applicable laws in your country of residence.
            </p>
            
            <h2>Limitation of Liability</h2>
            <p>
              In no event shall CanHav, nor its directors, employees, partners, agents, suppliers, or affiliates, 
              be liable for any indirect, incidental, special, consequential or punitive damages, including without 
              limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
            </p>
            <ol>
              <li>Your access to or use of or inability to access or use the service;</li>
              <li>Any conduct or content of any third party on the service;</li>
              <li>Any content obtained from the service; and</li>
              <li>Unauthorized access, use or alteration of your transmissions or content, whether based on warranty, 
                contract, tort (including negligence) or any other legal theory, whether or not we have been informed 
                of the possibility of such damage.</li>
            </ol>
            
            <h2>Changes to This Disclaimer</h2>
            <p>
              We may update our disclaimer from time to time. We will notify you of any changes by posting the new 
              disclaimer on this page and updating the "Last updated" date at the top of this disclaimer.
            </p>
            
            <h2>Contact Us</h2>
            <p>
              If you have any questions about this disclaimer, please contact us at:
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
