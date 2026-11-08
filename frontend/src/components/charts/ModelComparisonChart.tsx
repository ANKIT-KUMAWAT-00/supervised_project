import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Legend, CartesianGrid
} from 'recharts';

interface ModelComparisonChartProps {
  data: {
    timestamp: string;
    actual: number;
    linear_regression: number;
    random_forest: number;
    xgboost: number;
    residual_xgb: number;
  }[];
}

export const ModelComparisonChart: React.FC<ModelComparisonChartProps> = ({ data }) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#0D1428" vertical={false} />
          <XAxis
            dataKey="timestamp"
            stroke="#8290A8"
            fontSize={10}
            tickLine={false}
            tickFormatter={(val) => val.split(' ')[1] || val}
          />
          <YAxis stroke="#8290A8" fontSize={11} tickLine={false} domain={[0, 'auto']} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#070B18',
              borderColor: 'rgba(0, 229, 255, 0.3)',
              borderRadius: '12px',
              fontFamily: 'monospace',
              fontSize: '11px',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }}
          />

          <Line
            type="monotone"
            dataKey="actual"
            name="Ground Truth (Actual)"
            stroke="#EAF4FF"
            strokeWidth={3}
            dot={{ r: 2 }}
          />
          <Line
            type="monotone"
            dataKey="xgboost"
            name="XGBoost (Champion)"
            stroke="#00E5FF"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="random_forest"
            name="Random Forest"
            stroke="#8765FF"
            strokeWidth={1.5}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="linear_regression"
            name="Linear Regression"
            stroke="#8290A8"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
