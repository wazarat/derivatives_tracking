'use client';

import React from 'react';
import { cn } from '../../lib/utils';

interface GaugeChartProps {
  value: number;
  size?: 'small' | 'medium' | 'large';
  showValue?: boolean;
  className?: string;
}

export function GaugeChart({
  value,
  size = 'medium',
  showValue = true,
  className,
}: GaugeChartProps) {
  // Ensure value is between 0 and 100
  const safeValue = Math.min(100, Math.max(0, value));
  
  // Calculate the rotation angle based on the value (0-180 degrees)
  const rotation = (safeValue / 100) * 180;
  
  // Determine size dimensions
  const sizeMap = {
    small: {
      width: 120,
      height: 80,
      thickness: 8,
      fontSize: 14,
    },
    medium: {
      width: 160,
      height: 100,
      thickness: 10,
      fontSize: 16,
    },
    large: {
      width: 200,
      height: 120,
      thickness: 12,
      fontSize: 18,
    },
  };
  
  const { width, height, thickness, fontSize } = sizeMap[size];
  
  // Calculate color based on value
  const getColor = (val: number) => {
    if (val < 20) return '#10b981'; // green-500
    if (val < 40) return '#059669'; // emerald-600
    if (val < 60) return '#eab308'; // yellow-500
    if (val < 80) return '#f97316'; // orange-500
    return '#ef4444'; // red-500
  };
  
  const color = getColor(safeValue);
  
  return (
    <div 
      className={cn("relative", className)}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {/* Gauge background */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="absolute top-0 left-0"
      >
        <path
          d={`M ${thickness} ${height} 
              A ${height} ${height} 0 0 1 ${width - thickness} ${height}`}
          fill="none"
          stroke="#e5e7eb" // gray-200
          strokeWidth={thickness}
          strokeLinecap="round"
        />
      </svg>
      
      {/* Gauge value */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="absolute top-0 left-0"
      >
        <path
          d={`M ${thickness} ${height} 
              A ${height} ${height} 0 0 1 ${width - thickness} ${height}`}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={`${Math.PI * height} ${Math.PI * height}`}
          strokeDashoffset={`${Math.PI * height * (1 - rotation / 180)}`}
        />
      </svg>
      
      {/* Needle */}
      <div 
        className="absolute bottom-0 left-1/2 origin-bottom transform -translate-x-1/2"
        style={{
          height: `${height - thickness / 2}px`,
          width: `${thickness / 2}px`,
          transform: `translateX(-50%) rotate(${rotation}deg)`,
          transition: 'transform 0.5s ease-out',
        }}
      >
        <div 
          className="h-full w-[2px] bg-gray-700 rounded-t-full mx-auto"
        />
        <div 
          className="h-3 w-3 rounded-full bg-gray-700 mx-auto -mt-1.5"
        />
      </div>
      
      {/* Value text */}
      {showValue && (
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-2 font-medium"
          style={{ fontSize: `${fontSize}px` }}
        >
          {Math.round(safeValue)}
        </div>
      )}
    </div>
  );
}
