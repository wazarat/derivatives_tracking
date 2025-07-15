"use client";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface CorrelationChartProps {
  data: Array<{
    date: string;
    [key: string]: any;
  }>;
  instruments: Array<{
    id: string;
    symbol: string;
    color: string;
  }>;
  correlationScore?: number;
}

export function CorrelationChart({
  data,
  instruments,
  correlationScore,
}: CorrelationChartProps) {
  // No data state
  if (!data.length || !instruments.length) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-md bg-muted/20">
        <p className="text-muted-foreground">
          Select instruments to view correlation chart
        </p>
      </div>
    );
  }

  const formatCorrelation = (value: number | undefined) => {
    if (value === undefined) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="space-y-2">
      {correlationScore !== undefined && instruments.length === 2 && (
        <div className="flex justify-between items-center px-4 py-2 bg-muted/20 rounded-md">
          <div className="text-sm font-medium">
            Correlation between {instruments[0].symbol} and {instruments[1].symbol}:
          </div>
          <div className="text-sm font-bold">{formatCorrelation(correlationScore)}</div>
        </div>
      )}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
              domain={['auto', 'auto']}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
              domain={['auto', 'auto']}
            />
            <Tooltip 
              formatter={(value: number) => [`$${value.toFixed(2)}`, ""]}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleDateString();
              }}
            />
            <Legend />
            {instruments.map((instrument, index) => (
              <Line
                key={instrument.id}
                type="monotone"
                dataKey={instrument.id}
                name={instrument.symbol}
                stroke={instrument.color}
                yAxisId={index === 0 ? "left" : "right"}
                dot={false}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
