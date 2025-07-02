import { useQuery } from '@tanstack/react-query'
import { gql, request } from 'graphql-request'
import React from 'react';

const query = gql`{
  blockEvents(first: 5) {
    id
    number
    hash
    timestampNanosec
  }
}`
const url = 'https://api.studio.thegraph.com/query/114864/test-near/v0.0.1'
const headers = { Authorization: 'Bearer 75d6658c459507bd305e663b3e706f45' }

export default function App() {
  const { data, status } = useQuery({
    queryKey: ['data'], // It's good practice to have a more descriptive query key
    async queryFn() {
      return await request(url, query, {}, headers)
    }
  })

  return (
    <main>
      <h1>NEAR Blockchain Events</h1>
      {status === 'pending' && <div>Loading...</div>}
      {status === 'error' && <div>Error occurred querying the Subgraph</div>}
      {status === 'success' && (
        <div>
          <h2>Data:</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre> {/* Pretty print JSON */}
        </div>
      )}
    </main>
  )
}