'use client';

import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

export interface GlossaryTerm {
  term: string;
  definition: string;
  learnMoreUrl?: string;
}

export interface TooltipGlossaryProps {
  term: string;
  definition?: string;
  children?: React.ReactNode;
  className?: string;
}

// Crypto glossary terms
export const cryptoGlossary: Record<string, GlossaryTerm> = {
  'market_cap': {
    term: 'Market Cap',
    definition: 'The total market value of a cryptocurrency\'s circulating supply. It is calculated by multiplying the current market price by the circulating supply.',
    learnMoreUrl: 'https://www.investopedia.com/terms/m/marketcapitalization.asp'
  },
  'volume': {
    term: 'Volume',
    definition: 'The total amount of a cryptocurrency that has been traded within a specific time period, usually 24 hours.',
    learnMoreUrl: 'https://www.investopedia.com/terms/v/volume.asp'
  },
  'circulating_supply': {
    term: 'Circulating Supply',
    definition: 'The number of cryptocurrency coins or tokens that are publicly available and circulating in the market.',
    learnMoreUrl: 'https://www.investopedia.com/terms/c/circulating-supply.asp'
  },
  'max_supply': {
    term: 'Max Supply',
    definition: 'The maximum number of coins or tokens that will ever exist for a specific cryptocurrency.',
    learnMoreUrl: 'https://www.investopedia.com/terms/m/maximum-supply.asp'
  },
  'ath': {
    term: 'All-Time High (ATH)',
    definition: 'The highest price point that a cryptocurrency has reached since its inception.',
    learnMoreUrl: 'https://www.investopedia.com/terms/a/all-time-high-ath.asp'
  },
  'atl': {
    term: 'All-Time Low (ATL)',
    definition: 'The lowest price point that a cryptocurrency has reached since its inception.',
    learnMoreUrl: 'https://www.investopedia.com/terms/a/all-time-low-atl.asp'
  },
  'funding_rate': {
    term: 'Funding Rate',
    definition: 'A mechanism used in perpetual futures contracts to ensure the price of the derivative stays close to the underlying asset. Positive rates mean longs pay shorts, negative means shorts pay longs.',
    learnMoreUrl: 'https://www.bybit.com/en-US/help-center/article/What-Is-the-Funding-Rate'
  },
  'liquidation': {
    term: 'Liquidation',
    definition: 'The forced closing of a trader\'s position due to insufficient margin to maintain the position. This happens when losses exceed the maintenance margin.',
    learnMoreUrl: 'https://www.investopedia.com/terms/l/liquidation.asp'
  },
  'leverage': {
    term: 'Leverage',
    definition: 'Using borrowed funds to increase the potential return of an investment. For example, 10x leverage means controlling $10,000 worth of assets with $1,000.',
    learnMoreUrl: 'https://www.investopedia.com/terms/l/leverage.asp'
  },
  'dex': {
    term: 'DEX (Decentralized Exchange)',
    definition: 'A type of cryptocurrency exchange that operates without a central authority, allowing for direct peer-to-peer cryptocurrency transactions.',
    learnMoreUrl: 'https://www.investopedia.com/terms/d/decentralized-exchange.asp'
  },
  'cex': {
    term: 'CEX (Centralized Exchange)',
    definition: 'A cryptocurrency exchange operated by a company that oversees its transactions and takes custody of assets.',
    learnMoreUrl: 'https://www.investopedia.com/tech/what-are-centralized-cryptocurrency-exchanges/'
  },
  'perpetual_futures': {
    term: 'Perpetual Futures',
    definition: 'A special type of futures contract with no expiration date, allowing traders to hold positions indefinitely.',
    learnMoreUrl: 'https://www.binance.com/en/blog/futures/what-are-perpetual-futures-contracts-421499824684900382'
  }
};

export const TooltipGlossary: React.FC<TooltipGlossaryProps> = ({ 
  term, 
  definition,
  children,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Try to get the term from the glossary if no definition is provided
  const glossaryTerm = cryptoGlossary[term.toLowerCase()];
  const displayTerm = glossaryTerm?.term || term;
  const displayDefinition = definition || glossaryTerm?.definition || 'No definition available';
  const learnMoreUrl = glossaryTerm?.learnMoreUrl;
  
  return (
    <div className="relative inline-flex items-center group">
      {children || (
        <span className={`border-b border-dotted border-gray-400 cursor-help ${className}`}>
          {displayTerm}
        </span>
      )}
      <HelpCircle 
        className="ml-1 h-4 w-4 text-gray-400 cursor-help" 
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
      />
      
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 w-64 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg z-50 text-sm">
          <div className="font-medium mb-1">{displayTerm}</div>
          <p className="text-gray-600 dark:text-gray-300">{displayDefinition}</p>
          {learnMoreUrl && (
            <a 
              href={learnMoreUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 text-xs mt-2 block"
            >
              Learn more →
            </a>
          )}
          <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-white dark:bg-gray-800"></div>
        </div>
      )}
    </div>
  );
};

// Usage example component
export const GlossaryTerms: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Cryptocurrency Glossary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(cryptoGlossary).map(([key, { term, definition }]) => (
          <div key={key} className="p-4 border rounded-lg">
            <TooltipGlossary term={key}>
              <h3 className="font-medium">{term}</h3>
            </TooltipGlossary>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{definition}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
