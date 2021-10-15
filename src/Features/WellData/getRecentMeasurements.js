import {
  ApolloClient,
  gql,
  InMemoryCache,
} from '@apollo/client';

const client = new ApolloClient({ uri: 'https://react.eogresources.com/graphql', cache: new InMemoryCache() });

export const getRecentMeasurements = () => {
  client
    .query({
      query: gql`
      query {
        heartbeat
      }
      `,
    });

  return client
    .query({
      query: gql`
      query {
        getMetrics
      }
    `,
    });
};
