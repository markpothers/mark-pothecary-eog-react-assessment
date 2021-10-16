import React, { useState, useEffect } from 'react';
import {
  ApolloClient,
  // ApolloProvider,
  // useQuery,
  gql,
  InMemoryCache,
} from '@apollo/client';
// import { useGeolocation } from 'react-use';
// import LinearProgress from '@material-ui/core/LinearProgress';
// import { Typography } from '@material-ui/core';
// import Chip from '../../components/Chip';
import ChartCard from '../../components/ChartCard';
// import { getMetrics } from './getMetrics';
// import { getRecentMeasurements } from './getRecentMeasurements';

const metricsQuery = {
  query: gql`
  query {
    getMetrics
  }
`,
};

const heartbeatQuery = {
  query: gql`
  query {
    heartBeat
  }
`,
};

const measurementHistoryQuery = (metric, after) => (
  // console.log(metrics);
  // const inputString = `[${metrics.map(metric =>
  // `"{"metricName: "${metric}", after: ${after}},`)}]`;
  // console.log('input string');
  // console.log(inputString);

  {
    query: gql`
    query {
      getMultipleMeasurements(input: {
        metricName: "${metric}",
        after: ${after}
      }) {
        measurements {
          metric
          at
          value
          unit
        }
      }
    }
    `,
  });
// };

// const query = gql`
//   query ($latLong: WeatherQuery!) {
//     getWeatherForLocation(latLong: $latLong) {
//       description
//       locationName
//       temperatureinCelsius
//     }
//   }
// `;

// const lastThirtyMinutesQuery = {
//   query: gql`
//   query {
//     getMetrics
//   }
// `,
// };

const client = new ApolloClient({ uri: 'https://react.eogresources.com/graphql', cache: new InMemoryCache() });

// const toF = (c) => (c * 9) / 5 + 32;

// const query = gql`
//   query ($latLong: WeatherQuery!) {
//     getWeatherForLocation(latLong: $latLong) {
//       description
//       locationName
//       temperatureinCelsius
//     }
//   }
// `;

// type WeatherData = {
//   temperatureinCelsius: number,
//   description: string,
//   locationName: string,
// };
// type WeatherDataResponse = {
//   getWeatherForLocation: WeatherData,
// };

const WellData = () => {
  const [metrics, setMetrics] = useState([]);
  const [heartBeat, setHeartBeat] = useState();
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [measurementHistory, setMeasurementHistory] = useState([]);

  const getData = async (queryDetails) => {
    const data = await client.query(queryDetails);
    return data;
  };

  const updateMetrics = async () => {
    const newMetrics = await getData(metricsQuery);
    if (newMetrics.data) setMetrics(newMetrics.data.getMetrics);
  };

  const updateHeartBeat = async () => {
    const newHeartBeat = await getData(heartbeatQuery);
    setHeartBeat(newHeartBeat.data.heartBeat - 1800000);
  };

  const getMeasurementHistory = async (metric) => {
    const newMeasurementHistoryQuery = measurementHistoryQuery(metric, heartBeat);
    const measurementHistoryData = await getData(newMeasurementHistoryQuery);
    if (measurementHistoryData.data) {
      const result = measurementHistoryData.data.getMultipleMeasurements[0];
      const resultFormattedForChart = result.measurements.map(measurement => ({
        time: measurement.at,
        [metric]: measurement.value,
      }));
      // console.log('measurement hisotry');
      // console.log(measurementHistory);
      const dataForCharting = resultFormattedForChart.map((item, i) => (
        { ...item, ...measurementHistory[i] }
      ));
      // console.log('data for charting');
      // console.log(dataForCharting);
      setMeasurementHistory(dataForCharting);
    }
  };

  const onSelectedMetricsChange = async (newSelectedMetrics) => {
    // if a metric has been added, then get the data for it
    const missingMetrics = newSelectedMetrics.filter(metric => !selectedMetrics.includes(metric));
    missingMetrics.forEach(metric => getMeasurementHistory(metric));
    // if a metric has been removed, remove its data
    const excessMetrics = selectedMetrics.filter(metric => !newSelectedMetrics.includes(metric));
    const updatedChartData = measurementHistory.map(timePoint => {
      excessMetrics.forEach(metric => delete timePoint[metric]);
      return timePoint;
    });
    setMeasurementHistory(updatedChartData);
    // console.log('selectedMetrics');
    // console.log(selectedMetrics);
    // console.log('excess metric');
    // console.log(excessMetrics);
    // set the visible metrics
    setSelectedMetrics(newSelectedMetrics);
  };

  useEffect(() => {
    updateMetrics();
    updateHeartBeat();
    // const callGetMetrics = (async () => {
    //   const newMetrics = await client.query(metricsQuery);
    // });
    // const callGetRecentMeasurements = (async () => {
    //   const newMeasurements = await getRecentMeasurements();
    //   console.log('new Measurements');
    //   console.log(newMeasurements);
    //   if (recentMeasurements.data) setRecentMeasurements(newMeasurements.data);
    // });
    // callGetMetrics();
    // // if (selectedMetrics.length > 0) {
    // // console.log(selectedMetrics);
    // callGetRecentMeasurements();
    // // }
  }, [selectedMetrics]);

  // const getLocation = useGeolocation();
  // // Default to houston
  // const latLong = {
  //   latitude: getLocation.latitude || 29.7604,
  //   longitude: getLocation.longitude || -95.3698,
  // };
  // const { loading, error, data } = useQuery(query, {
  //   variables: {
  //     latLong,
  //   },
  // });

  // if (loading) return <LinearProgress />;

  // if (error) return <Typography color="error">{error}</Typography>;

  // if (!data) return <Chip label="Weather not found" />;

  // const { locationName, description, temperatureinCelsius } = data.getWeatherForLocation;

  // console.log('selected metrics');
  // console.log(selectedMetrics);
  // console.log('measurement history');
  // console.log(measurementHistory);
  return (
    <ChartCard
      data={measurementHistory}
      options={metrics}
      selectedMetrics={selectedMetrics}
      // setSelectedMetrics={setSelectedMetrics}
      onSelectedMetricsChange={onSelectedMetricsChange}
    />
  );
};

export default () => (
  // <ApolloProvider client={client}>
  <WellData />
  // </ApolloProvider>
);
