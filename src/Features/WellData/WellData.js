import React, { useState, useEffect } from 'react';
import {
  ApolloClient,
  ApolloProvider,
  useQuery,
  InMemoryCache,
} from '@apollo/client';
import { toast } from 'react-toastify';
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
    pollInterval: 1300,
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
        [`${metric}-unit`]: measurement.unit,
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

  const addLatestMeasurementToHistory = () => {
    if (data) {
      const newHistoryTimePoint = {};
      Object.keys(data).forEach(metric => {
        newHistoryTimePoint[metric] = data[metric].value;
        newHistoryTimePoint.time = data[metric].at;
        newHistoryTimePoint[`${metric}-unit`] = data[metric].unit;
      });
      let newMeasurementHistory = [...measurementHistory, newHistoryTimePoint];
      // if there's at least one timepoint in the history then check
      // if we need to download the last 30 minutes worth of data
      if (newMeasurementHistory.length > 0) {
        selectedMetrics.forEach(async (metric) => {
          const timePointsForThisMetric = newMeasurementHistory.filter(timePoint => (
            Object.keys(timePoint).includes(metric)
          )).length;
          // if there's less than nearly 30 minutes worth of points for this metric,
          //  get the longer history one time
          if (timePointsForThisMetric < 1300) {
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
      const lastTimePoint = newMeasurementHistory[newMeasurementHistory.length - 1].time;
      newMeasurementHistory = newMeasurementHistory.filter(timePoint => (
        timePoint.time > (lastTimePoint - 1800000)
      ));
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

  if (error) {
    toast.error(error);
  }

  return (
    <ChartCard
      data={measurementHistory}
      options={metrics}
      selectedMetrics={selectedMetrics}
      setSelectedMetrics={setSelectedMetrics}
      loading={loading}
    />
  );
};

export default () => (
  <ApolloProvider client={client}>
    <WellData />
  </ApolloProvider>
);
