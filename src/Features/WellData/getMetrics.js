import {
  ApolloClient,
  gql,
  InMemoryCache,
} from '@apollo/client';

const client = new ApolloClient({ uri: 'https://react.eogresources.com/graphql', cache: new InMemoryCache() });

export const getMetrics = () => (
  client
    .query({
      query: gql`
      query {
        getMetrics
      }
    `,
    })
);
