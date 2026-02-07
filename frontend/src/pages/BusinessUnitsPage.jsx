import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoadingPage } from '../components/Spinner'
import ErrorState from '../components/ErrorState'
import { useToast } from '../components/Toast'
import ScrollableTable from '../components/ScrollableTable'

const API_BASE = 'http://localhost:8001/api'

function BusinessUnitForm({ businessUnit, positions, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: businessUnit?.name || '',
    description: businessUnit?.description || '',
    head_position_id: businessUnit?.head_position_id || ''
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
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
      head_position_id: form.head_position_id || null
    }

    try {
      const url = businessUnit
        ? `${API_BASE}/business-units/${businessUnit.id}`
        : `${API_BASE}/business-units`
      const method = businessUnit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Failed to save')
      }

      addToast(businessUnit ? 'Business unit updated' : 'Business unit created', 'success')
      onSave()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md my-auto">
        <h2 className="text-xl font-bold mb-4">
          {businessUnit ? 'Edit Business Unit' : 'Add Business Unit'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.name ? 'border-red-500' : ''}`}
              placeholder="e.g., Lines.com, Refills.com"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Optional description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">BU Head (Position)</label>
            <select
              value={form.head_position_id}
              onChange={(e) => setForm({ ...form, head_position_id: e.target.value ? parseInt(e.target.value) : '' })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">No head assigned</option>
              {positions.map((pos) => (
                <option key={pos.id} value={pos.id}>{pos.title} ({pos.department})</option>
              ))}
            </select>
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
              {businessUnit ? 'Save Changes' : 'Add Business Unit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TeamManagementModal({ businessUnit, positions, onSave, onCancel }) {
  const [selectedPositions, setSelectedPositions] = useState(
    businessUnit.team?.map((m) => m.position_id) || []
  )
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()

  const togglePosition = (posId) => {
    if (selectedPositions.includes(posId)) {
      setSelectedPositions(selectedPositions.filter((id) => id !== posId))
    } else {
      setSelectedPositions([...selectedPositions, posId])
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/business-units/${businessUnit.id}/team`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position_ids: selectedPositions })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Failed to update team')
      }

      addToast('Team updated', 'success')
      onSave()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg my-auto">
        <h2 className="text-xl font-bold mb-2">Manage Team: {businessUnit.name}</h2>
        <p className="text-sm text-gray-500 mb-4">Select positions that belong to this business unit.</p>

        <div className="max-h-80 overflow-y-auto border rounded-lg mb-4">
          {positions.length === 0 ? (
            <p className="p-4 text-gray-500 text-center">No positions available</p>
          ) : (
            positions.map((pos) => (
              <label
                key={pos.id}
                className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
              >
                <input
                  type="checkbox"
                  checked={selectedPositions.includes(pos.id)}
                  onChange={() => togglePosition(pos.id)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <div className="ml-3">
                  <span className="font-medium text-gray-900">{pos.title}</span>
                  <span className="text-gray-500 text-sm ml-2">({pos.department})</span>
                </div>
              </label>
            ))
          )}
        </div>

        <div className="text-sm text-gray-500 mb-4">
          {selectedPositions.length} position(s) selected
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"
          >
            {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
            Save Team
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteConfirm({ businessUnit, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
        <h2 className="text-xl font-bold mb-2">Delete Business Unit</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{businessUnit.name}</strong>?
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

function BusinessUnitStatsChart({ stats }) {
  if (!stats || stats.length === 0) return null

  const totalProducts = stats.reduce((sum, s) => sum + s.products_count, 0)
  const totalServices = stats.reduce((sum, s) => sum + s.services_count, 0)
  const totalTeam = stats.reduce((sum, s) => sum + s.team_size, 0)
  const maxProducts = Math.max(...stats.map(s => s.products_count), 1)

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="text-center p-4 bg-indigo-50 rounded-lg">
          <p className="text-3xl font-bold text-indigo-600">{stats.length}</p>
          <p className="text-sm text-gray-600">Business Units</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-3xl font-bold text-green-600">{totalProducts}</p>
          <p className="text-sm text-gray-600">Total Products</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-3xl font-bold text-blue-600">{totalServices}</p>
          <p className="text-sm text-gray-600">Total Services</p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <p className="text-3xl font-bold text-purple-600">{totalTeam}</p>
          <p className="text-sm text-gray-600">Team Members</p>
        </div>
      </div>

      <h4 className="text-sm font-semibold text-gray-700 mb-3">Products by Business Unit</h4>
      <div className="space-y-3">
        {stats.map(bu => (
          <div key={bu.id} className="flex items-center gap-3">
            <span className="w-28 text-sm text-gray-700 truncate" title={bu.name}>{bu.name}</span>
            <div className="flex-1 flex gap-1">
              <div
                className="h-6 bg-green-500 rounded-l flex items-center justify-end pr-1"
                style={{ width: `${(bu.live_products / maxProducts) * 100}%`, minWidth: bu.live_products > 0 ? '20px' : '0' }}
              >
                {bu.live_products > 0 && <span className="text-xs text-white font-medium">{bu.live_products}</span>}
              </div>
              <div
                className="h-6 bg-blue-500 flex items-center justify-end pr-1"
                style={{ width: `${(bu.dev_products / maxProducts) * 100}%`, minWidth: bu.dev_products > 0 ? '20px' : '0' }}
              >
                {bu.dev_products > 0 && <span className="text-xs text-white font-medium">{bu.dev_products}</span>}
              </div>
              <div
                className="h-6 bg-gray-400 rounded-r flex items-center justify-end pr-1"
                style={{ width: `${((bu.products_count - bu.live_products - bu.dev_products) / maxProducts) * 100}%`, minWidth: (bu.products_count - bu.live_products - bu.dev_products) > 0 ? '20px' : '0' }}
              >
                {(bu.products_count - bu.live_products - bu.dev_products) > 0 && <span className="text-xs text-white font-medium">{bu.products_count - bu.live_products - bu.dev_products}</span>}
              </div>
            </div>
            <span className="w-8 text-sm text-gray-500 text-right">{bu.products_count}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-3 text-xs">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-500 rounded" />
          <span className="text-gray-600">Live</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-blue-500 rounded" />
          <span className="text-gray-600">In Development</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-gray-400 rounded" />
          <span className="text-gray-600">Other</span>
        </div>
      </div>
    </div>
  )
}

export default function BusinessUnitsPage() {
  const [businessUnits, setBusinessUnits] = useState([])
  const [positions, setPositions] = useState([])
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingBU, setEditingBU] = useState(null)
  const [managingTeamBU, setManagingTeamBU] = useState(null)
  const [deletingBU, setDeletingBU] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { addToast } = useToast()
  const navigate = useNavigate()

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [buRes, posRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/business-units`),
        fetch(`${API_BASE}/positions`),
        fetch(`${API_BASE}/business-units/stats`)
      ])
      const buData = await buRes.json()
      const posData = await posRes.json()
      const statsData = await statsRes.json()
      if (buData.success) setBusinessUnits(buData.data)
      if (posData.success) setPositions(posData.data)
      if (statsData.success) setStats(statsData.data)
    } catch (err) {
      setError('Failed to load data. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSave = () => {
    setShowForm(false)
    setEditingBU(null)
    setManagingTeamBU(null)
    fetchData()
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      const res = await fetch(`${API_BASE}/business-units/${deletingBU.id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to delete')
      addToast('Business unit deleted', 'success')
      setDeletingBU(null)
      fetchData()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) return <LoadingPage />

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Business Units</h1>
        <ErrorState message={error} onRetry={fetchData} />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Units</h1>
          <p className="text-sm text-gray-500 mt-1">Manage brands and their teams</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Business Unit
        </button>
      </div>

      {stats.length > 0 && <BusinessUnitStatsChart stats={stats} />}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">About Business Units</h3>
        <p className="text-sm text-blue-800">
          Business units represent your brands or business lines (e.g., Lines.com, Refills.com).
          Each BU can have a head (position), team members, products they've requested, and services they receive.
          Click "Dashboard" to view all details for a specific business unit.
        </p>
      </div>

      {businessUnits.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-gray-500 mb-4">No business units yet. Add your first business unit to get started.</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Add Business Unit
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <ScrollableTable>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    BU Head
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {businessUnits.map((bu) => (
                  <tr key={bu.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{bu.name}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {bu.description || <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {bu.head_position_title || <span className="text-gray-400">Not assigned</span>}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setManagingTeamBU(bu)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {bu.team?.length || 0} member(s)
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => navigate(`/bu-dashboard/${bu.id}`)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={() => setEditingBU(bu)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingBU(bu)}
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

      {(showForm || editingBU) && (
        <BusinessUnitForm
          businessUnit={editingBU}
          positions={positions}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingBU(null)
          }}
        />
      )}

      {managingTeamBU && (
        <TeamManagementModal
          businessUnit={managingTeamBU}
          positions={positions}
          onSave={handleSave}
          onCancel={() => setManagingTeamBU(null)}
        />
      )}

      {deletingBU && (
        <DeleteConfirm
          businessUnit={deletingBU}
          onConfirm={handleDelete}
          onCancel={() => setDeletingBU(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  )
}
