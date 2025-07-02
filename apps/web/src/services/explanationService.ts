import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Allow client-side usage
});

// Cache for explanations to avoid redundant API calls
const explanationCache: Record<string, string> = {};

/**
 * Generate an explanation for a financial metric or term using OpenAI
 * @param term The financial term or metric to explain
 * @param context Additional context about the term (optional)
 * @returns A promise that resolves to the explanation text
 */
export async function generateExplanation(term: string, context?: string): Promise<string> {
  const cacheKey = `${term}:${context || ''}`;
  
  // Check cache first
  if (explanationCache[cacheKey]) {
    return explanationCache[cacheKey];
  }
  
  try {
    // Prepare the prompt
    const prompt = context 
      ? `Explain the financial metric or term "${term}" in the context of "${context}" in 1-2 sentences. Keep it simple and concise, targeting a finance professional who is new to crypto.`
      : `Explain the financial metric or term "${term}" in 1-2 sentences. Keep it simple and concise, targeting a finance professional who is new to crypto.`;
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that explains financial and crypto terms concisely and accurately.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent responses
      max_tokens: 100, // Limit response length
    });
    
    // Extract and clean the explanation
    const explanation = response.choices[0]?.message?.content?.trim() || 
      `Sorry, I couldn't generate an explanation for "${term}" at this time.`;
    
    // Cache the result
    explanationCache[cacheKey] = explanation;
    
    return explanation;
  } catch (error) {
    console.error('Error generating explanation:', error);
    return `Sorry, I couldn't generate an explanation for "${term}" at this time.`;
  }
}

/**
 * Get a predefined explanation for common financial terms
 * This helps reduce API calls for common terms
 * @param term The financial term to look up
 * @returns The explanation if found in predefined list, null otherwise
 */
export function getPredefinedExplanation(term: string): string | null {
  const normalizedTerm = term.toLowerCase().trim();
  
  const predefinedExplanations: Record<string, string> = {
    'apy': 'Annual Percentage Yield represents the real rate of return earned on an investment, taking into account the effect of compounding interest.',
    'volatility': 'A statistical measure of the dispersion of returns for a given security or market index, indicating how much the price fluctuates over time.',
    'max drawdown': 'The maximum observed loss from a peak to a trough of a portfolio or asset, before a new peak is attained, measuring downside risk.',
    'sharpe ratio': 'A measure of risk-adjusted return that indicates the excess return per unit of risk, helping investors understand the return of an investment compared to its risk.',
    'market cap': 'The total market value of a cryptocurrency, calculated by multiplying the current price by the circulating supply.',
    'liquidity': 'The degree to which an asset can be quickly bought or sold without affecting its price, with higher liquidity generally indicating lower risk.',
    'risk tier': 'A classification system that categorizes assets based on their risk profile, with lower tiers representing lower risk and higher tiers representing higher risk.',
    'stablecoin': 'A type of cryptocurrency designed to maintain a stable value by pegging to a reserve asset like the US dollar or gold.',
    'tokenized rwa': 'Real-World Assets that have been tokenized on a blockchain, representing ownership or rights to physical assets like real estate, commodities, or securities.',
    'composite risk score': 'A comprehensive measure that combines multiple risk factors (volatility, drawdown, liquidity) into a single score to assess an asset\'s overall risk profile.'
  };
  
  return predefinedExplanations[normalizedTerm] || null;
}

/**
 * Get an explanation for a financial term, using predefined explanations when available
 * and falling back to OpenAI API when necessary
 * @param term The financial term to explain
 * @param context Additional context about the term (optional)
 * @returns A promise that resolves to the explanation text
 */
export async function getExplanation(term: string, context?: string): Promise<string> {
  // Try to get a predefined explanation first
  const predefinedExplanation = getPredefinedExplanation(term);
  
  if (predefinedExplanation) {
    return predefinedExplanation;
  }
  
  // Fall back to OpenAI if no predefined explanation exists
  return generateExplanation(term, context);
}
