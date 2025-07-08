import numpy as np
from scipy.stats import norm
from typing import List, Union, Tuple, Dict, Any, Optional

def sigma_bucket(
    values: Union[List[float], np.ndarray], 
    thresholds: Optional[List[float]] = None,
    labels: Optional[List[str]] = None
) -> List[str]:
    """
    Categorize values into buckets based on their distance from the mean in terms of standard deviations (σ).
    
    This function takes a list of numerical values and assigns each value to a bucket based on how many
    standard deviations it is from the mean. This is useful for risk analysis, anomaly detection,
    and statistical categorization.
    
    Args:
        values: List or array of numerical values to categorize
        thresholds: Optional list of threshold values in terms of standard deviations.
                    Default is [-2.0, -1.0, 0.0, 1.0, 2.0] which creates 6 buckets.
        labels: Optional list of labels for the buckets. Must be len(thresholds) + 1.
                Default labels are ["Very Low", "Low", "Below Average", "Above Average", "High", "Very High"]
    
    Returns:
        List of bucket labels corresponding to each input value
    
    Example:
        >>> sigma_bucket([1, 5, 10, 15, 20])
        ['Very Low', 'Low', 'Above Average', 'High', 'Very High']
    """
    if not values or len(values) < 2:
        raise ValueError("At least two values are required to calculate standard deviation")
    
    # Convert to numpy array if needed
    values_array = np.array(values, dtype=float)
    
    # Calculate mean and standard deviation
    mean = np.mean(values_array)
    std_dev = np.std(values_array)
    
    # If std_dev is zero, all values are the same
    if std_dev == 0:
        return ["Average"] * len(values)
    
    # Default thresholds if not provided
    if thresholds is None:
        thresholds = [-2.0, -1.0, 0.0, 1.0, 2.0]
    
    # Default labels if not provided
    if labels is None:
        labels = ["Very Low", "Low", "Below Average", "Above Average", "High", "Very High"]
    
    # Ensure we have the correct number of labels
    if len(labels) != len(thresholds) + 1:
        raise ValueError(f"Number of labels ({len(labels)}) must be one more than number of thresholds ({len(thresholds)})")
    
    # Calculate z-scores (number of standard deviations from mean)
    z_scores = (values_array - mean) / std_dev
    
    # Assign bucket labels based on z-scores
    result = []
    for z in z_scores:
        # Find the appropriate bucket
        bucket_index = 0
        for i, threshold in enumerate(thresholds):
            if z > threshold:
                bucket_index = i + 1
        
        result.append(labels[bucket_index])
    
    return result

def sigma_bucket_with_scores(
    values: Union[List[float], np.ndarray], 
    thresholds: Optional[List[float]] = None,
    labels: Optional[List[str]] = None
) -> List[Dict[str, Any]]:
    """
    Similar to sigma_bucket, but returns more detailed information including the z-score.
    
    Args:
        values: List or array of numerical values to categorize
        thresholds: Optional list of threshold values in terms of standard deviations
        labels: Optional list of labels for the buckets
    
    Returns:
        List of dictionaries with keys: 'value', 'z_score', 'bucket', 'percentile'
    
    Example:
        >>> sigma_bucket_with_scores([1, 5, 10, 15, 20])
        [{'value': 1, 'z_score': -1.26, 'bucket': 'Low', 'percentile': 10.56}, ...]
    """
    if not values or len(values) < 2:
        raise ValueError("At least two values are required to calculate standard deviation")
    
    # Convert to numpy array if needed
    values_array = np.array(values, dtype=float)
    
    # Calculate mean and standard deviation
    mean = np.mean(values_array)
    std_dev = np.std(values_array)
    
    # Default thresholds if not provided
    if thresholds is None:
        thresholds = [-2.0, -1.0, 0.0, 1.0, 2.0]
    
    # Default labels if not provided
    if labels is None:
        labels = ["Very Low", "Low", "Below Average", "Above Average", "High", "Very High"]
    
    # Ensure we have the correct number of labels
    if len(labels) != len(thresholds) + 1:
        raise ValueError(f"Number of labels ({len(labels)}) must be one more than number of thresholds ({len(thresholds)})")
    
    # Calculate z-scores (number of standard deviations from mean)
    z_scores = (values_array - mean) / std_dev if std_dev > 0 else np.zeros_like(values_array)
    
    # Calculate percentiles
    percentiles = np.zeros_like(values_array)
    if std_dev > 0:
        percentiles = norm.cdf(z_scores) * 100
    else:
        percentiles = np.full_like(values_array, 50.0)
    
    # Assign bucket labels based on z-scores
    result = []
    for i, (value, z) in enumerate(zip(values_array, z_scores)):
        # Find the appropriate bucket
        bucket_index = 0
        for j, threshold in enumerate(thresholds):
            if z > threshold:
                bucket_index = j + 1
        
        result.append({
            'value': float(value),
            'z_score': round(float(z), 2),
            'bucket': labels[bucket_index],
            'percentile': round(float(percentiles[i]), 2)
        })
    
    return result
