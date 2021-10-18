import React from 'react';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

const colors = [
  'red',
  'orange',
  'green',
  'blue',
  'purple',
];

const CustomizedTick = ({
  x, y, payload, lastTimePoint,
}) => {
  const formatTime = tick => {
    // if (data.length > 0) {
    // const now = data[data.length - 1].time;
    const ago = lastTimePoint - tick;
    return (ago / (1000 * 60)).toFixed(2);
    // }
    // return 0;
  };

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-35)">
        {formatTime(payload.value)}
      </text>
    </g>
  );
};

export default ({ data, selectedMetrics }) => {
  const chartWidth = window.innerWidth * 0.79;

  const getUnit = (metric) => {
    if (data.length > 0 && Object.keys(data[data.length - 1]).includes(metric)) {
      return data[data.length - 1][`${metric}-unit`].toString();
    }
    return '';
  };

  const formatTooltipTime = time => {
    if (data.length > 0) {
      const now = data[data.length - 1].time;
      const ago = now - time;
      return `${(ago / (1000 * 60)).toFixed(2)} minutes ago`;
    }
    return 0;
  };

  return (
    <LineChart
      width={chartWidth}
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
      {selectedMetrics.map((metric, i) => (
        <Line
          type="monotone"
          dataKey={metric}
          yAxisId={metric}
          stroke={colors[i % 5]}
          key={metric}
        />
      ))}
      {selectedMetrics.map(metric => (
        <YAxis
          orientation='left'
          yAxisId={metric}
          key={metric}
          label={{ value: `${metric} (${getUnit(metric)})`, angle: -90, position: 'insideLeft' }}
        />
      ))}
      <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
      <XAxis
        dataKey="time"
        label="Time (minutes ago)"
        angle={-45}
        padding={{ left: 10, right: 10 }}
        tick={<CustomizedTick lastTimePoint={data.length > 0 ? data[data.length - 1].time : 0} />}
        height={100}
      />
      <Tooltip
        formatter={(v, n) => `${v} ${getUnit(n)}`}
        labelFormatter={formatTooltipTime}
      />
      <Legend />
    </LineChart>
  );
};
