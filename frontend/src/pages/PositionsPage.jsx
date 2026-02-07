import { useState, useEffect } from 'react'
import { LoadingPage } from '../components/Spinner'
import ErrorState from '../components/ErrorState'
import { useToast } from '../components/Toast'
import ScrollableTable from '../components/ScrollableTable'

const API_BASE = 'http://localhost:8001/api'

function HelpPanel({ onClose }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-blue-900 mb-2">How Positions Work</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>- Positions represent job roles, not individual employees</li>
            <li>- Each position has an hourly cost range (min to max)</li>
            <li>- This range accounts for salary variations within the same role</li>
            <li>- When tasks are assigned, the calculator shows cost ranges</li>
            <li>- Example: "Senior Developer" might cost $60-$90/hr depending on experience</li>
          </ul>
        </div>
        <button onClick={onClose} className="text-blue-600 hover:text-blue-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function PositionForm({ position, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: position?.title || '',
    department: position?.department || '',
    hourly_cost_min: position?.hourly_cost_min || '',
    hourly_cost_max: position?.hourly_cost_max || ''
  })
  const [departments, setDepartments] = useState([])
  const [loadingDepts, setLoadingDepts] = useState(true)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch(`${API_BASE}/service-departments`)
        const data = await res.json()
        if (data.success) {
          setDepartments(data.data)
        }
      } catch (err) {
        addToast('Failed to load departments', 'error')
      } finally {
        setLoadingDepts(false)
      }
    }
    fetchDepartments()
  }, [])

  const validate = () => {
    const newErrors = {}
    if (!form.title.trim()) newErrors.title = 'Title is required'
    if (!form.department) newErrors.department = 'Department is required'
    if (!form.hourly_cost_min || parseFloat(form.hourly_cost_min) <= 0) {
      newErrors.hourly_cost_min = 'Valid minimum rate required'
    }
    if (!form.hourly_cost_max || parseFloat(form.hourly_cost_max) <= 0) {
      newErrors.hourly_cost_max = 'Valid maximum rate required'
    }
    if (parseFloat(form.hourly_cost_max) < parseFloat(form.hourly_cost_min)) {
      newErrors.hourly_cost_max = 'Max must be >= min'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    const payload = {
      ...form,
      title: form.title.trim(),
      department: form.department,
      hourly_cost_min: parseFloat(form.hourly_cost_min),
      hourly_cost_max: parseFloat(form.hourly_cost_max)
    }

    try {
      const url = position
        ? `${API_BASE}/positions/${position.id}`
        : `${API_BASE}/positions`
      const method = position ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Failed to save')
      }

      addToast(position ? 'Position updated' : 'Position added', 'success')
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
          {position ? 'Edit Position' : 'Add Position'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass('title')}
              placeholder="e.g., Senior Developer"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            {loadingDepts ? (
              <div className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-500">
                Loading departments...
              </div>
            ) : departments.length === 0 ? (
              <div className="w-full border rounded-lg px-3 py-2 bg-yellow-50 text-yellow-700 text-sm">
                No departments found. Please create a department first.
              </div>
            ) : (
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className={inputClass('department')}
              >
                <option value="">Select a department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
            )}
            {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Hourly Rate ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.hourly_cost_min}
                onChange={(e) => setForm({ ...form, hourly_cost_min: e.target.value })}
                className={inputClass('hourly_cost_min')}
                placeholder="50"
              />
              {errors.hourly_cost_min && <p className="text-red-500 text-xs mt-1">{errors.hourly_cost_min}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Hourly Rate ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.hourly_cost_max}
                onChange={(e) => setForm({ ...form, hourly_cost_max: e.target.value })}
                className={inputClass('hourly_cost_max')}
                placeholder="75"
              />
              {errors.hourly_cost_max && <p className="text-red-500 text-xs mt-1">{errors.hourly_cost_max}</p>}
            </div>
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
              disabled={saving || loadingDepts || departments.length === 0}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"
            >
              {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
              {position ? 'Save Changes' : 'Add Position'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteConfirm({ position, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
        <h2 className="text-xl font-bold mb-2">Delete Position</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{position.title}</strong>? This action cannot be undone.
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

export default function PositionsPage() {
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingPosition, setEditingPosition] = useState(null)
  const [deletingPosition, setDeletingPosition] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showCsvUpload, setShowCsvUpload] = useState(false)
  const [csvUploading, setCsvUploading] = useState(false)
  const [sortField, setSortField] = useState('title')
  const [sortDir, setSortDir] = useState('asc')
  const [showHelp, setShowHelp] = useState(false)
  const { addToast } = useToast()

  const sortedPositions = [...positions].sort((a, b) => {
    let aVal = a[sortField]
    let bVal = b[sortField]
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const SortIcon = ({ field }) => (
    <span className="ml-1 inline-block">
      {sortField === field ? (
        sortDir === 'asc' ? '▲' : '▼'
      ) : (
        <span className="text-gray-300">▲</span>
      )}
    </span>
  )

  const fetchPositions = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/positions`)
      const data = await res.json()
      if (data.success) {
        setPositions(data.data)
      }
    } catch (err) {
      setError('Failed to load positions. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPositions()
  }, [])

  const handleSave = () => {
    setShowForm(false)
    setEditingPosition(null)
    fetchPositions()
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      const res = await fetch(`${API_BASE}/positions/${deletingPosition.id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete')
      addToast('Position deleted', 'success')
      setDeletingPosition(null)
      fetchPositions()
    } catch (err) {
      addToast('Failed to delete position', 'error')
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
      const res = await fetch(`${API_BASE}/positions/upload-csv`, {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.detail || 'Upload failed')
      }
      
      if (data.success) {
        addToast(`Added ${data.data.created_count} positions`, 'success')
        if (data.data.error_count > 0) {
          addToast(`${data.data.error_count} rows had errors`, 'error')
        }
        setShowCsvUpload(false)
        fetchPositions()
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Positions</h1>
        <ErrorState message={error} onRetry={fetchPositions} />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Positions</h1>
          <p className="text-sm text-gray-500 mt-1">Define job roles with hourly rate ranges for cost estimates</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Help
          </button>
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
            Add Position
          </button>
        </div>
      </div>

      {showHelp && <HelpPanel onClose={() => setShowHelp(false)} />}

      {positions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 mb-4">No positions yet. Add your first position to get started.</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Add Position
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <ScrollableTable>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th onClick={() => handleSort('title')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none">
                    Title <SortIcon field="title" />
                </th>
                  <th onClick={() => handleSort('department')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none">
                    Department <SortIcon field="department" />
                  </th>
                  <th onClick={() => handleSort('hourly_cost_min')} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none">
                    Hourly Rate Range <SortIcon field="hourly_cost_min" />
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedPositions.map((pos) => (
                  <tr key={pos.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{pos.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {pos.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      <span className="font-medium">{formatCurrency(pos.hourly_cost_min)}</span>
                      <span className="text-gray-400 mx-1">-</span>
                      <span className="font-medium">{formatCurrency(pos.hourly_cost_max)}</span>
                      <span className="text-gray-500 text-sm">/hr</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => setEditingPosition(pos)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingPosition(pos)}
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

      {(showForm || editingPosition) && (
        <PositionForm
          position={editingPosition}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingPosition(null)
          }}
        />
      )}

      {deletingPosition && (
        <DeleteConfirm
          position={deletingPosition}
          onConfirm={handleDelete}
          onCancel={() => setDeletingPosition(null)}
          loading={deleteLoading}
        />
      )}

      {showCsvUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Import Positions from CSV</h2>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">CSV must have these columns:</p>
              <code className="text-xs bg-gray-200 px-2 py-1 rounded">Title, Department, Hourly Cost Min, Hourly Cost Max</code>
              <p className="text-xs text-gray-500 mt-2">First row should be headers. Costs can include $ and commas.</p>
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
