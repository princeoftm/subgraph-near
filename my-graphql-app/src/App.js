import { useQuery } from '@tanstack/react-query';
import { gql, request } from 'graphql-request';
import React, { useState } from 'react';

// The GraphQL query now accepts a variable '$first' of type Int.
const getBlockEventsQuery = gql`
  query GetBlockEvents($first: Int!) {
    blockEvents(first: $first) {
      id
      number
      hash
      timestampNanosec
    }
  }
`;

const url = 'https://api.studio.thegraph.com/query/114864/test-near/v0.0.1';
const headers = { Authorization: 'Bearer 75d6658c459507bd305e663b3e706f45' };

export default function App() {
  // State to hold the number of blocks to query. Default is 20.
  const [limit, setLimit] = useState(20);
  // State for the input field to allow for controlled updates.
  const [inputValue, setInputValue] = useState(limit.toString());

  const { data, status, isFetching } = useQuery({
    // The 'limit' state is added to the queryKey.
    // React Query automatically re-fetches when this key changes.
    queryKey: ['blockEvents', limit],
    queryFn: async () => {
      const variables = { first: limit };
      return await request(url, getBlockEventsQuery, variables, headers);
    },
    // This option keeps previous data visible while new data is loading.
    keepPreviousData: true,
  });

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevents full page reload
    const num = parseInt(inputValue, 10);
    if (!isNaN(num) && num > 0) {
      setLimit(num); // Triggers the query refetch by changing the queryKey
    }
  };

  return (
    <main>
      <h1>NEAR Blockchain Events</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <label htmlFor="block-query">Number of blocks to query: </label>
        <input
          id="block-query"
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          min="1"
          style={{ marginRight: '10px' }}
        />
        <button type="submit" disabled={isFetching}>
          {isFetching ? 'Loading...' : 'Query'}
        </button>
      </form>

      {status === 'error' && <div>Error occurred querying the Subgraph</div>}
      {status === 'success' && (
        <div>
          <h2>Data (Last {limit} Blocks):</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </main>
  );
}