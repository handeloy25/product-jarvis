import { useState, useEffect } from 'react'
import { LoadingPage } from '../components/Spinner'
import ErrorState from '../components/ErrorState'
import { useToast } from '../components/Toast'
import ScrollableTable from '../components/ScrollableTable'

const API_BASE = 'http://localhost:8001/api'

function SoftwareForm({ software, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: software?.name || '',
    description: software?.description || '',
    monthly_cost: software?.monthly_cost || ''
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.monthly_cost || parseFloat(form.monthly_cost) <= 0) {
      newErrors.monthly_cost = 'Valid monthly cost required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      monthly_cost: parseFloat(form.monthly_cost)
    }

    try {
      const url = software 
        ? `${API_BASE}/software/${software.id}`
        : `${API_BASE}/software`
      const method = software ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Failed to save')
      }
      
      addToast(software ? 'Software updated' : 'Software added', 'success')
      onSave()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = (field) => `w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors[field] ? 'border-red-500' : ''}`

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md my-auto">
        <h2 className="text-xl font-bold mb-4">
          {software ? 'Edit Software' : 'Add Software'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass('name')}
              placeholder="e.g., AWS, Figma, Slack"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Brief description"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Cost ($)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={form.monthly_cost}
              onChange={(e) => setForm({ ...form, monthly_cost: e.target.value })}
              className={inputClass('monthly_cost')}
              placeholder="99.00"
            />
            {errors.monthly_cost && <p className="text-red-500 text-xs mt-1">{errors.monthly_cost}</p>}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"
            >
              {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
              {software ? 'Save Changes' : 'Add Software'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteConfirm({ software, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
        <h2 className="text-xl font-bold mb-2">Delete Software</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{software.name}</strong>? This will remove it from all product allocations.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
          >
            {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SoftwarePage() {
  const [softwareList, setSoftwareList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingSoftware, setEditingSoftware] = useState(null)
  const [deletingSoftware, setDeletingSoftware] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showCsvUpload, setShowCsvUpload] = useState(false)
  const [csvUploading, setCsvUploading] = useState(false)
  const { addToast } = useToast()

  const fetchSoftware = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/software`)
      const data = await res.json()
      if (data.success) {
        setSoftwareList(data.data)
      }
    } catch (err) {
      setError('Failed to load software. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSoftware()
  }, [])

  const handleSave = () => {
    setShowForm(false)
    setEditingSoftware(null)
    fetchSoftware()
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      const res = await fetch(`${API_BASE}/software/${deletingSoftware.id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete')
      addToast('Software deleted', 'success')
      setDeletingSoftware(null)
      fetchSoftware()
    } catch (err) {
      addToast('Failed to delete software', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const handleCsvUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setCsvUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`${API_BASE}/software/upload-csv`, {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.detail || 'Upload failed')
      }
      
      if (data.success) {
        addToast(`Added ${data.data.created_count} software items`, 'success')
        if (data.data.error_count > 0) {
          addToast(`${data.data.error_count} rows had errors`, 'error')
        }
        setShowCsvUpload(false)
        fetchSoftware()
      }
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setCsvUploading(false)
      e.target.value = ''
    }
  }

  if (loading) return <LoadingPage />

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Software Costs</h1>
        <ErrorState message={error} onRetry={fetchSoftware} />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Software Costs</h1>
          <p className="text-sm text-gray-500 mt-1">Manage software subscriptions that can be allocated to products</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCsvUpload(true)}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import CSV
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Software
          </button>
        </div>
      </div>

      {softwareList.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          <p className="text-gray-500 mb-4">No software costs defined yet. Add software to track subscription costs.</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Add Software
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <ScrollableTable>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Software
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Cost
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {softwareList.map((soft) => (
                  <tr key={soft.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{soft.name}</div>
                      {soft.description && (
                        <div className="text-sm text-gray-500">{soft.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 font-medium">
                      {formatCurrency(soft.monthly_cost)}/mo
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => setEditingSoftware(soft)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingSoftware(soft)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollableTable>
        </div>
      )}

      {(showForm || editingSoftware) && (
        <SoftwareForm
          software={editingSoftware}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingSoftware(null)
          }}
        />
      )}

      {deletingSoftware && (
        <DeleteConfirm
          software={deletingSoftware}
          onConfirm={handleDelete}
          onCancel={() => setDeletingSoftware(null)}
          loading={deleteLoading}
        />
      )}

      {showCsvUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Import Software from CSV</h2>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">CSV must have these columns:</p>
              <code className="text-xs bg-gray-200 px-2 py-1 rounded">Name, Monthly Cost</code>
              <p className="text-xs text-gray-500 mt-2">Description column is optional. Costs can include $ and commas.</p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {csvUploading ? (
                <div className="flex flex-col items-center">
                  <span className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
                  <p className="text-gray-600">Uploading...</p>
                </div>
              ) : (
                <>
                  <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <label className="cursor-pointer">
                    <span className="text-indigo-600 hover:text-indigo-800 font-medium">Choose CSV file</span>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCsvUpload}
                      className="hidden"
                    />
                  </label>
                </>
              )}
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowCsvUpload(false)}
                disabled={csvUploading}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
