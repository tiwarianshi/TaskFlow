import { useState } from 'react'
import axiosClient from '../api/axiosClient'

const ApiTestPage = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState(null)

  const runApiTest = async () => {
    setLoading(true)
    setError('')

    try {
      const [authRes, boardsRes, tasksRes] = await Promise.all([
        axiosClient.get('/auth/test'),
        axiosClient.get('/boards/test'),
        axiosClient.get('/tasks/test'),
      ])

      setResults({
        auth: authRes.data.message,
        boards: boardsRes.data.message,
        tasks: tasksRes.data.message,
      })
    } catch (err) {
      setResults(null)
      setError(err?.response?.data?.message || err.message || 'API test failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className='min-h-screen p-6'>
      <h1 className='text-2xl font-semibold'>TaskFlow API Connectivity Test</h1>
      <p className='mt-2 text-gray-600'>Click the button to test all backend endpoints.</p>

      <button
        type='button'
        onClick={runApiTest}
        disabled={loading}
        className='mt-6 rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-60'
      >
        {loading ? 'Testing...' : 'Run API Test'}
      </button>

      {error && (
        <p className='mt-4 rounded bg-red-100 p-3 text-red-700'>
          {error}
        </p>
      )}

      {results && (
        <div className='mt-4 space-y-2 rounded bg-green-50 p-4 text-green-800'>
          <p><strong>Auth:</strong> {results.auth}</p>
          <p><strong>Boards:</strong> {results.boards}</p>
          <p><strong>Tasks:</strong> {results.tasks}</p>
        </div>
      )}
    </main>
  )
}

export default ApiTestPage
