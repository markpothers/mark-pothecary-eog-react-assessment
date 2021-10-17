import React, { useState, useEffect } from 'react';
import {
  ApolloClient,
  ApolloProvider,
  useQuery,
  InMemoryCache,
} from '@apollo/client';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Typography } from '@material-ui/core';
// import Chip from '../../components/Chip';
import ChartCard from '../../components/ChartCard';
import {
  metricsQuery,
  measurementHistoryQuery,
  generateLatestMeasurementQuery,
} from './queryStrings';

const client = new ApolloClient({ uri: 'https://react.eogresources.com/graphql', cache: new InMemoryCache() });

const WellData = () => {
  const [metrics, setMetrics] = useState([]);
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [measurementHistory, setMeasurementHistory] = useState([]);

  // set up graphQl useQuery using a dynamic query based on the selected metrics and call it
  const latestMeasurementQueryVariables = {};
  selectedMetrics.forEach((metric, index) => { latestMeasurementQueryVariables[`metric${index}`] = metric; });
  const { loading, error, data } = useQuery(generateLatestMeasurementQuery(selectedMetrics.length > 0 ? selectedMetrics : ['placeholderMetricName']), {
    variables: latestMeasurementQueryVariables,
    pollInterval: 1200,
    skip: selectedMetrics.length === 0,
  });

  const getData = async (queryDetails) => {
    const queryData = await client.query(queryDetails);
    return queryData;
  };

  const updateMetrics = async () => {
    const newMetrics = await getData(metricsQuery);
    if (newMetrics.data) setMetrics(newMetrics.data.getMetrics);
  };

  const getHistoricalMeasurements = async (metric, endTime) => {
    const newMeasurementHistoryQuery = measurementHistoryQuery(
      metric,
      endTime,
    );
    const measurementHistoryData = await getData(newMeasurementHistoryQuery);
    return measurementHistoryData;
  };

  const mergeHistoricalAndCurrentData = (metric, measurementHistoryData, newMeasurementHistory) => {
    if (measurementHistoryData.data) {
      const result = measurementHistoryData.data.getMultipleMeasurements[0];
      const resultFormattedForChart = result.measurements.map(measurement => ({
        time: measurement.at,
        [metric]: measurement.value,
      }));
      // go through the new data looking if each timepoint in the newly fetch history
      // is already in the main measurement history
      resultFormattedForChart.forEach(historicalTimePoint => {
        const indexOfMatchingTimePoint = newMeasurementHistory.findIndex(timePoint => (
          timePoint.time === historicalTimePoint.time
        ));
        // if the timepoint is present in the measurement history, merge this new one in
        if (indexOfMatchingTimePoint > -1) {
          newMeasurementHistory[indexOfMatchingTimePoint] = {
            ...newMeasurementHistory[indexOfMatchingTimePoint],
            ...historicalTimePoint,
          };
        } else { // else add it to the end of the measurement history array
          newMeasurementHistory.push(historicalTimePoint);
        }
      });
      // sort the final array since pushed timepoints are likely out of order
      newMeasurementHistory.sort((a, b) => {
        if (a.time > b.time) {
          return 1;
        }
        return -1;
      });
      return newMeasurementHistory;
    }
    return newMeasurementHistory;
  };

  const onSelectedMetricsChange = async (newSelectedMetrics) => {
    setSelectedMetrics(newSelectedMetrics);
  };

  const addLatestMeasurementToHistory = () => {
    if (data) {
      const newHistoryTimePoint = {};
      Object.keys(data).forEach(metric => {
        newHistoryTimePoint[metric] = data[metric].value;
        newHistoryTimePoint.time = data[metric].at;
      });
      let newMeasurementHistory = [...measurementHistory, newHistoryTimePoint];
      if (newMeasurementHistory.length > 0) {
        selectedMetrics.forEach(async (metric) => {
          const timePointsForThisMetric = newMeasurementHistory.filter(timePoint => (
            Object.keys(timePoint).includes(metric)
          )).length;
          // if there's less than nearly 30 minutes worth of points for this metric,
          //  get the longer history one time
          if (timePointsForThisMetric < 1450) {
            const firstTimePointToIncludeThisMetric = newMeasurementHistory.find(timePoint => (
              Object.keys(timePoint).includes(metric)
            ));
            const measurementHistoryData = await getHistoricalMeasurements(
              metric,
              firstTimePointToIncludeThisMetric.time,
            );
            newMeasurementHistory = mergeHistoricalAndCurrentData(
              metric,
              measurementHistoryData,
              newMeasurementHistory,
            );
          }
        });
      }
      setMeasurementHistory(newMeasurementHistory);
    }
  };

  // update metrics only when the page is loaded
  useEffect(() => {
    updateMetrics();
  }, []);

  // update measurementHistory when graphQl polling gets new data
  useEffect(() => {
    addLatestMeasurementToHistory();
  }, [data]);

  if (loading) return <LinearProgress />;

  if (error) return <Typography color="error">{error}</Typography>;

  // if (!data) return <Chip label="Weather not found" />;

  return (
    <ChartCard
      data={measurementHistory}
      options={metrics}
      selectedMetrics={selectedMetrics}
      onSelectedMetricsChange={onSelectedMetricsChange}
    />
  );
};

export default () => (
  <ApolloProvider client={client}>
    <WellData />
  </ApolloProvider>
);
