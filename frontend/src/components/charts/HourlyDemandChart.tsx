import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid
} from 'recharts';

interface HourlyDemandChartProps {
  data: {
    hour: string;
    occupancy?: number;
    predicted_occupancy?: number;
    percentage?: number;
    confidence_lower?: number;
    confidence_upper?: number;
  }[];
  isForecast?: boolean;
}

export const HourlyDemandChart: React.FC<HourlyDemandChartProps> = ({ data, isForecast = false }) => {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#00E5FF" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="violetGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8765FF" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8765FF" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#0D1428" vertical={false} />
          <XAxis
            dataKey="hour"
            stroke="#8290A8"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#0D1428' }}
          />
          <YAxis
            domain={[0, 120]}
            stroke="#8290A8"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#0D1428' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#070B18',
              borderColor: 'rgba(0, 229, 255, 0.3)',
              borderRadius: '12px',
              fontFamily: 'monospace',
              fontSize: '12px',
              boxShadow: '0 0 20px rgba(0, 229, 255, 0.2)',
            }}
            labelStyle={{ color: '#EAF4FF', fontWeight: 'bold' }}
          />

          {isForecast ? (
            <>
              <Area
                type="monotone"
                dataKey="predicted_occupancy"
                name="AI Predicted Occupancy"
                stroke="#00E5FF"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#cyanGradient)"
              />
              <Area
                type="monotone"
                dataKey="confidence_upper"
                name="Confidence Bound (Upper)"
                stroke="#80F0FF"
                strokeDasharray="3 3"
                strokeWidth={1}
                fill="none"
              />
            </>
          ) : (
            <Area
              type="monotone"
              dataKey="occupancy"
              name="Occupied Seats"
              stroke="#00E5FF"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#cyanGradient)"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
