import React from 'react';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export default ({ data, selectedMetrics }) => (
  <LineChart
    width={1800}
    height={400}
    data={data}
    margin={
      {
        top: 5,
        right: 20,
        bottom: 5,
        left: 0,
      }
    }
  >
    {selectedMetrics.map(metric => <Line type="monotone" dataKey={metric} yAxisId={metric} stroke="#8884d8" key={metric} />)}
    {selectedMetrics.map(metric => <YAxis orientation='left' yAxisId={metric} key={metric} />)}
    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
    <XAxis dataKey="time" />
    <Tooltip />
  </LineChart>
);
