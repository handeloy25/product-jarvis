import { useState, useEffect } from 'react'

const API_URL = 'http://localhost:8001'

export default function SettingsPage() {
  const [showClearModal, setShowClearModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [apiStatus, setApiStatus] = useState(null)
  const [checkingApi, setCheckingApi] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/api/assistant/status`)
      .then(r => r.json())
      .then(data => {
        setApiStatus(data.data)
        setCheckingApi(false)
      })
      .catch(() => {
        setApiStatus({ ready: false, sdk_available: false, api_key_configured: false })
        setCheckingApi(false)
      })
  }, [])

  const seedDemoData = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch(`${API_URL}/api/admin/seed-demo-data`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'Demo data seeded successfully!' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to seed demo data' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to connect to server' })
    }
    setLoading(false)
  }

  const clearAllData = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch(`${API_URL}/api/admin/clear-all-data`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'All data cleared successfully!' })
        setShowClearModal(false)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to clear data' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to connect to server' })
    }
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-500">Manage application settings and data</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">AI Assistant Status</h2>
          <p className="mt-1 text-sm text-gray-500">Configure the Anthropic API key to enable the AI Assistant</p>
        </div>

        {checkingApi ? (
          <div className="flex items-center gap-2 text-gray-500">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Checking API status...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {apiStatus?.ready ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-green-700 font-medium">API Connected</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-red-700 font-medium">API Not Configured</span>
                </>
              )}
            </div>

            {!apiStatus?.ready && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-800 mb-2">Setup Required</h4>
                <ol className="text-sm text-amber-700 space-y-2 list-decimal list-inside">
                  <li>Get an API key from <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-900">console.anthropic.com</a></li>
                  <li>In the <code className="bg-amber-100 px-1 rounded">backend</code> folder, copy <code className="bg-amber-100 px-1 rounded">.env.example</code> to <code className="bg-amber-100 px-1 rounded">.env</code></li>
                  <li>Edit <code className="bg-amber-100 px-1 rounded">.env</code> and replace <code className="bg-amber-100 px-1 rounded">your-api-key-here</code> with your actual key</li>
                  <li>Restart the backend server</li>
                </ol>
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Cost Estimation</h4>
              <p className="text-sm text-gray-600 mb-3">
                The AI Assistant uses Claude Sonnet 4. Costs vary based on query complexity:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="bg-white rounded border p-3">
                  <div className="font-medium text-gray-900">Simple Question</div>
                  <div className="text-gray-500">No portfolio data</div>
                  <div className="text-indigo-600 font-semibold mt-1">~$0.01</div>
                </div>
                <div className="bg-white rounded border p-3">
                  <div className="font-medium text-gray-900">With Portfolio</div>
                  <div className="text-gray-500">Products + valuations</div>
                  <div className="text-indigo-600 font-semibold mt-1">~$0.02-0.04</div>
                </div>
                <div className="bg-white rounded border p-3">
                  <div className="font-medium text-gray-900">Heavy Analysis</div>
                  <div className="text-gray-500">+ Knowledge base</div>
                  <div className="text-indigo-600 font-semibold mt-1">~$0.06-0.10</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Demo Data</h2>
          <p className="mt-1 text-sm text-gray-500">Load sample data to explore all features</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={seedDemoData}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Loading...' : 'Load Demo Data'}
          </button>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-gray-600 mb-4">
            Demo data includes: 8 positions, 6 software tools, 6 service departments, 5 products (internal & external), and 3 services with realistic tasks and progress.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-red-700">Danger Zone</h2>
          <p className="mt-1 text-sm text-gray-500">Irreversible actions that affect all data</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setShowClearModal(true)}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Clear All Data
          </button>
        </div>
      </div>

      {showClearModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Clear All Data</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              This will permanently delete <strong>ALL</strong> data including positions, software, departments, products, services, tasks, and knowledge base entries. This action cannot be undone.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={clearAllData}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Clearing...' : 'Yes, Clear Everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
