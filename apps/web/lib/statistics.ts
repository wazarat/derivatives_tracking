/**
 * Categorize values into buckets based on their distance from the mean in terms of standard deviations (σ).
 * 
 * @param values - Array of numerical values to categorize
 * @param thresholds - Optional array of threshold values in terms of standard deviations
 * @param labels - Optional array of labels for the buckets
 * @returns Array of bucket labels corresponding to each input value
 */
export function sigmaBucket(
  values: number[],
  thresholds: number[] = [-2.0, -1.0, 0.0, 1.0, 2.0],
  labels: string[] = ["Very Low", "Low", "Below Average", "Above Average", "High", "Very High"]
): string[] {
  if (!values || values.length < 2) {
    throw new Error("At least two values are required to calculate standard deviation");
  }

  // Calculate mean
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;

  // Calculate standard deviation
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // If std_dev is zero, all values are the same
  if (stdDev === 0) {
    return Array(values.length).fill("Average");
  }

  // Ensure we have the correct number of labels
  if (labels.length !== thresholds.length + 1) {
    throw new Error(`Number of labels (${labels.length}) must be one more than number of thresholds (${thresholds.length})`);
  }

  // Calculate z-scores and assign bucket labels
  return values.map(value => {
    const zScore = (value - mean) / stdDev;
    
    // Find the appropriate bucket
    let bucketIndex = 0;
    for (let i = 0; i < thresholds.length; i++) {
      if (zScore > thresholds[i]) {
        bucketIndex = i + 1;
      }
    }
    
    return labels[bucketIndex];
  });
}

/**
 * Similar to sigmaBucket, but returns more detailed information including the z-score.
 * 
 * @param values - Array of numerical values to categorize
 * @param thresholds - Optional array of threshold values in terms of standard deviations
 * @param labels - Optional array of labels for the buckets
 * @returns Array of objects with value, z-score, bucket, and percentile information
 */
export function sigmaBucketWithScores(
  values: number[],
  thresholds: number[] = [-2.0, -1.0, 0.0, 1.0, 2.0],
  labels: string[] = ["Very Low", "Low", "Below Average", "Above Average", "High", "Very High"]
): Array<{value: number, zScore: number, bucket: string, percentile: number}> {
  if (!values || values.length < 2) {
    throw new Error("At least two values are required to calculate standard deviation");
  }

  // Calculate mean
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;

  // Calculate standard deviation
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Ensure we have the correct number of labels
  if (labels.length !== thresholds.length + 1) {
    throw new Error(`Number of labels (${labels.length}) must be one more than number of thresholds (${thresholds.length})`);
  }

  // Calculate z-scores and assign bucket labels
  return values.map(value => {
    const zScore = stdDev > 0 ? (value - mean) / stdDev : 0;
    
    // Calculate percentile using normal distribution approximation
    // This is an approximation of the cumulative distribution function (CDF)
    const percentile = stdDev > 0 
      ? normalCDF(zScore) * 100 
      : 50.0;
    
    // Find the appropriate bucket
    let bucketIndex = 0;
    for (let i = 0; i < thresholds.length; i++) {
      if (zScore > thresholds[i]) {
        bucketIndex = i + 1;
      }
    }
    
    return {
      value,
      zScore: Number(zScore.toFixed(2)),
      bucket: labels[bucketIndex],
      percentile: Number(percentile.toFixed(2))
    };
  });
}

/**
 * Approximation of the cumulative distribution function (CDF) for the standard normal distribution
 * This is used to convert z-scores to percentiles
 * 
 * @param z - Z-score to convert to percentile
 * @returns Probability (0-1) corresponding to the z-score
 */
function normalCDF(z: number): number {
  // Constants for the approximation
  const b1 = 0.31938153;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const p = 0.2316419;
  const c = 0.39894228;

  if (z >= 0) {
    const t = 1.0 / (1.0 + p * z);
    return 1.0 - c * Math.exp(-z * z / 2.0) * t * (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1);
  } else {
    const t = 1.0 / (1.0 - p * z);
    return c * Math.exp(-z * z / 2.0) * t * (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1);
  }
}
