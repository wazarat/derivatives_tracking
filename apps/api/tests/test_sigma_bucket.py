import pytest
import numpy as np
from app.utils.statistics import sigma_bucket, sigma_bucket_with_scores

class TestSigmaBucket:
    """Test suite for the sigma_bucket function"""
    
    def test_basic_functionality(self):
        """Test basic functionality of sigma_bucket"""
        values = [1, 5, 10, 15, 20]
        result = sigma_bucket(values)
        
        # With these values, mean=10.2, std=7.66
        # 1 is about -1.2σ, 5 is about -0.68σ, 10 is about -0.03σ, 15 is about 0.63σ, 20 is about 1.28σ
        expected = ["Low", "Below Average", "Above Average", "Above Average", "High"]
        assert result == expected
    
    def test_custom_thresholds(self):
        """Test sigma_bucket with custom thresholds"""
        values = [1, 5, 10, 15, 20]
        thresholds = [-1.5, -0.5, 0.5, 1.5]
        result = sigma_bucket(values, thresholds=thresholds)
        
        expected = ["Low", "Below Average", "Above Average", "Above Average", "High"]
        assert result == expected
    
    def test_custom_labels(self):
        """Test sigma_bucket with custom labels"""
        values = [1, 5, 10, 15, 20]
        thresholds = [-1.0, 0.0, 1.0]
        labels = ["Poor", "Fair", "Good", "Excellent"]
        result = sigma_bucket(values, thresholds=thresholds, labels=labels)
        
        expected = ["Fair", "Fair", "Good", "Good", "Excellent"]
        assert result == expected
    
    def test_single_value_error(self):
        """Test that sigma_bucket raises ValueError with a single value"""
        with pytest.raises(ValueError):
            sigma_bucket([5])
    
    def test_empty_list_error(self):
        """Test that sigma_bucket raises ValueError with an empty list"""
        with pytest.raises(ValueError):
            sigma_bucket([])
    
    def test_all_same_values(self):
        """Test sigma_bucket with all same values"""
        values = [10, 10, 10, 10]
        result = sigma_bucket(values)
        
        # When all values are the same, std_dev is 0, so all should be "Average"
        expected = ["Average"] * len(values)
        assert result == expected
    
    def test_numpy_array_input(self):
        """Test sigma_bucket with numpy array input"""
        values = np.array([1, 5, 10, 15, 20])
        result = sigma_bucket(values)
        
        expected = ["Low", "Below Average", "Above Average", "Above Average", "High"]
        assert result == expected


class TestSigmaBucketWithScores:
    """Test suite for the sigma_bucket_with_scores function"""
    
    def test_basic_functionality(self):
        """Test basic functionality of sigma_bucket_with_scores"""
        values = [1, 5, 10, 15, 20]
        result = sigma_bucket_with_scores(values)
        
        # Check structure and types
        assert len(result) == len(values)
        for item in result:
            assert isinstance(item, dict)
            assert 'value' in item
            assert 'z_score' in item
            assert 'bucket' in item
            assert 'percentile' in item
        
        # Check specific values for first and last items
        assert result[0]['value'] == 1.0
        assert result[0]['bucket'] == "Low"
        assert result[-1]['value'] == 20.0
        assert result[-1]['bucket'] == "High"
    
    def test_all_same_values(self):
        """Test sigma_bucket_with_scores with all same values"""
        values = [10, 10, 10, 10]
        result = sigma_bucket_with_scores(values)
        
        # When all values are the same, z_scores should be 0 and percentiles 50
        for item in result:
            assert item['z_score'] == 0.0
            assert item['percentile'] == 50.0
    
    def test_custom_thresholds_and_labels(self):
        """Test sigma_bucket_with_scores with custom thresholds and labels"""
        values = [1, 5, 10, 15, 20]
        thresholds = [-1.0, 0.0, 1.0]
        labels = ["Poor", "Fair", "Good", "Excellent"]
        result = sigma_bucket_with_scores(values, thresholds=thresholds, labels=labels)
        
        # Check that labels are applied correctly
        buckets = [item['bucket'] for item in result]
        expected_buckets = ["Fair", "Fair", "Good", "Good", "Excellent"]
        assert buckets == expected_buckets
