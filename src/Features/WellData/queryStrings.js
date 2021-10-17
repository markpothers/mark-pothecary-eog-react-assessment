import { gql } from '@apollo/client';

export const metricsQuery = {
  query: gql`
    query {
      getMetrics
    }
  `,
};

export const measurementHistoryQuery = (metric, timePoint) => (
  {
    query: gql`
      query History($metric: String!, $before: Timestamp, $after: Timestamp) {
        getMultipleMeasurements(input: {
          metricName: $metric,
          before: $before,
          after: $after
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
    variables: {
      metric,
      before: timePoint,
      after: timePoint - 1800000, // starting timepoint - 30 minutes
    },
  });

export const generateLatestMeasurementQuery = (selectedMetrics) => {
  const multiQueries = selectedMetrics.map((metric, index) => (
    `${metric}: getLastKnownMeasurement(metricName: $metric${index})
      {
        metric
        at
        value
        unit
      }`
  ));
  const variableString = selectedMetrics.map((metric, index) => `$metric${index}: String!`);
  const queryString = `query (${variableString.join(', ')}) {
      ${multiQueries.join('\n')}
    }`;
  return gql`${queryString}`;
};
