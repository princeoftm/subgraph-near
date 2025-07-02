import { useQuery } from '@tanstack/react-query';
import { gql, request } from 'graphql-request';
import React, { useState } from 'react';

const getBlockEventsQuery = gql`
  query GetBlockEvents($first: Int!) {
    blockEvents(first: $first, orderBy: number, orderDirection: desc) {
      id
      number
      hash
      timestampNanosec
    }
  }
`;

const url = 'https://api.studio.thegraph.com/query/114864/test-near/v0.0.1';
const headers = { Authorization: 'Bearer 75d6658c459507bd305e663b3e706f45' };

const TableCell = ({ children, isHeader = false, style = {} }) => {
  const cellStyle = {
    padding: '12px 15px',
    border: '1px solid #ddd',
    textAlign: 'left',
    ...style,
  };
  return isHeader ? <th style={cellStyle}>{children}</th> : <td style={cellStyle}>{children}</td>;
};

export default function App() {
  const [limit, setLimit] = useState(20);
  const [inputValue, setInputValue] = useState(limit.toString());

  const { data, status, isFetching, error } = useQuery({
    queryKey: ['blockEvents', limit],
    queryFn: async () => {
      const variables = { first: limit };
      return await request(url, getBlockEventsQuery, variables, headers);
    },
    keepPreviousData: true,
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const num = parseInt(inputValue, 10);
    if (!isNaN(num) && num > 0) {
      setLimit(num);
    }
  };
  
  // Converts nanosecond string to a readable local date string
  const formatTimestamp = (nsString) => {
    // Add this comment to tell the linter to ignore the 'no-undef' error for the next line
    // eslint-disable-next-line no-undef
    const milliseconds = BigInt(nsString) / 1000000n;
    return new Date(Number(milliseconds)).toLocaleString();
  };

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '20px' }}>
      <h1>NEAR Blockchain Events ⛓️</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <label htmlFor="block-query">Number of blocks to query: </label>
        <input
          id="block-query"
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          min="1"
          style={{ marginRight: '10px', padding: '8px' }}
        />
        <button type="submit" disabled={isFetching} style={{ padding: '8px 12px' }}>
          {isFetching ? 'Loading...' : 'Query'}
        </button>
      </form>

      {status === 'error' && <div style={{ color: 'red' }}>Error: {error.message}</div>}

      {status === 'success' && data?.blockEvents && (
        <>
          <h2>Showing {data.blockEvents.length} Most Recent Blocks</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9em' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <TableCell isHeader>Block Number</TableCell>
                <TableCell isHeader>Timestamp</TableCell>
                <TableCell isHeader>Hash</TableCell>
              </tr>
            </thead>
            <tbody>
              {data.blockEvents.map((event) => (
                <tr key={event.id} style={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                  <TableCell>{event.number}</TableCell>
                  <TableCell>{formatTimestamp(event.timestampNanosec)}</TableCell>
                  <TableCell style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {event.hash}
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </main>
  );
}