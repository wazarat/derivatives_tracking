import { sigmaBucket, sigmaBucketWithScores } from '../lib/statistics';

describe('sigmaBucket', () => {
  test('basic functionality', () => {
    const values = [1, 5, 10, 15, 20];
    const result = sigmaBucket(values);
    
    // With these values, mean=10.2, std=7.66
    // 1 is about -1.2σ, 5 is about -0.68σ, 10 is about -0.03σ, 15 is about 0.63σ, 20 is about 1.28σ
    const expected = ["Low", "Below Average", "Above Average", "Above Average", "High"];
    expect(result).toEqual(expected);
  });

  test('custom thresholds', () => {
    const values = [1, 5, 10, 15, 20];
    const thresholds = [-1.5, -0.5, 0.5, 1.5];
    const result = sigmaBucket(values, thresholds);
    
    const expected = ["Low", "Below Average", "Above Average", "Above Average", "High"];
    expect(result).toEqual(expected);
  });

  test('custom labels', () => {
    const values = [1, 5, 10, 15, 20];
    const thresholds = [-1.0, 0.0, 1.0];
    const labels = ["Poor", "Fair", "Good", "Excellent"];
    const result = sigmaBucket(values, thresholds, labels);
    
    const expected = ["Fair", "Fair", "Good", "Good", "Excellent"];
    expect(result).toEqual(expected);
  });

  test('throws error with single value', () => {
    expect(() => {
      sigmaBucket([5]);
    }).toThrow("At least two values are required");
  });

  test('throws error with empty array', () => {
    expect(() => {
      sigmaBucket([]);
    }).toThrow("At least two values are required");
  });

  test('all same values', () => {
    const values = [10, 10, 10, 10];
    const result = sigmaBucket(values);
    
    // When all values are the same, std_dev is 0, so all should be "Average"
    const expected = ["Average", "Average", "Average", "Average"];
    expect(result).toEqual(expected);
  });

  test('throws error when labels and thresholds mismatch', () => {
    const values = [1, 5, 10, 15, 20];
    const thresholds = [-1.0, 0.0, 1.0];
    const labels = ["Poor", "Fair", "Good"]; // Should be 4 labels for 3 thresholds
    
    expect(() => {
      sigmaBucket(values, thresholds, labels);
    }).toThrow("Number of labels");
  });
});

describe('sigmaBucketWithScores', () => {
  test('basic functionality', () => {
    const values = [1, 5, 10, 15, 20];
    const result = sigmaBucketWithScores(values);
    
    // Check structure and types
    expect(result.length).toBe(values.length);
    result.forEach(item => {
      expect(item).toHaveProperty('value');
      expect(item).toHaveProperty('zScore');
      expect(item).toHaveProperty('bucket');
      expect(item).toHaveProperty('percentile');
    });
    
    // Check specific values for first and last items
    expect(result[0].value).toBe(1);
    expect(result[0].bucket).toBe("Low");
    expect(result[4].value).toBe(20);
    expect(result[4].bucket).toBe("High");
  });

  test('all same values', () => {
    const values = [10, 10, 10, 10];
    const result = sigmaBucketWithScores(values);
    
    // When all values are the same, z_scores should be 0 and percentiles 50
    result.forEach(item => {
      expect(item.zScore).toBe(0);
      expect(item.percentile).toBe(50);
    });
  });

  test('custom thresholds and labels', () => {
    const values = [1, 5, 10, 15, 20];
    const thresholds = [-1.0, 0.0, 1.0];
    const labels = ["Poor", "Fair", "Good", "Excellent"];
    const result = sigmaBucketWithScores(values, thresholds, labels);
    
    // Check that labels are applied correctly
    const buckets = result.map(item => item.bucket);
    const expected = ["Fair", "Fair", "Good", "Good", "Excellent"];
    expect(buckets).toEqual(expected);
  });

  test('percentiles are in valid range', () => {
    const values = [1, 5, 10, 15, 20];
    const result = sigmaBucketWithScores(values);
    
    // All percentiles should be between 0 and 100
    result.forEach(item => {
      expect(item.percentile).toBeGreaterThanOrEqual(0);
      expect(item.percentile).toBeLessThanOrEqual(100);
    });
  });
});
