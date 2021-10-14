import React from 'react';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

const data = [{
  name: 0,
  uv: 400,
  pv: 2400,
  amt: 2400,
}, {
  name: 1,
  uv: 200,
  pv: 2600,
  amt: 2400,
}, {
  name: 2,
  uv: 500,
  pv: 2000,
  amt: 3000,
}, {
  name: 3,
  uv: 400,
  pv: 2400,
  amt: 2400,
}, {
  name: 4,
  uv: 450,
  pv: 2250,
  amt: 2100,
},
];

export default () => (
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
    <Line type="monotone" dataKey="uv" stroke="#8884d8" />
    <Line type="monotone" dataKey="pv" stroke="#8884d8" />
    <Line type="monotone" dataKey="amt" stroke="#8884d8" />
    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
  </LineChart>
);
