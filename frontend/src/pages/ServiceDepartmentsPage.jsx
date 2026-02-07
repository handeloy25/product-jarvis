import { useState, useEffect } from 'react'
import { LoadingPage } from '../components/Spinner'
import ErrorState from '../components/ErrorState'
import { useToast } from '../components/Toast'
import ScrollableTable from '../components/ScrollableTable'

const API_BASE = 'http://localhost:8001/api'

function DepartmentForm({ department, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: department?.name || '',
    description: department?.description || ''
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
      description: form.description.trim() || null
    }

    try {
      const url = department 
        ? `${API_BASE}/service-departments/${department.id}`
        : `${API_BASE}/service-departments`
      const method = department ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Failed to save')
      }
      
      addToast(department ? 'Department updated' : 'Department created', 'success')
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
          {department ? 'Edit Department' : 'Add Department'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.name ? 'border-red-500' : ''}`}
              placeholder="e.g., SEO, Technical, BI"
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
              {department ? 'Save Changes' : 'Add Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteConfirm({ department, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
        <h2 className="text-xl font-bold mb-2">Delete Department</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{department.name}</strong>?
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

function DepartmentStatsChart({ stats }) {
  if (!stats || stats.length === 0) return null

  const maxProducts = Math.max(...stats.map(s => s.total_products), 1)
  const maxTeam = Math.max(...stats.map(s => s.team_size), 1)
  const totalProducts = stats.reduce((sum, s) => sum + s.total_products, 0)
  const totalTeam = stats.reduce((sum, s) => sum + s.team_size, 0)
  const avgProducts = stats.length > 0 ? (totalProducts / stats.length).toFixed(1) : 0

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="text-center p-4 bg-indigo-50 rounded-lg">
          <p className="text-3xl font-bold text-indigo-600">{stats.length}</p>
          <p className="text-sm text-gray-600">Departments</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-3xl font-bold text-green-600">{totalProducts}</p>
          <p className="text-sm text-gray-600">Product Assignments</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-3xl font-bold text-blue-600">{totalTeam}</p>
          <p className="text-sm text-gray-600">Total Team Members</p>
        </div>
      </div>

      <h4 className="text-sm font-semibold text-gray-700 mb-3">Products by Department</h4>
      <div className="space-y-3">
        {stats.map(dept => (
          <div key={dept.id} className="flex items-center gap-3">
            <span className="w-24 text-sm text-gray-700 truncate" title={dept.name}>{dept.name}</span>
            <div className="flex-1 flex gap-1">
              <div
                className="h-6 bg-indigo-500 rounded-l flex items-center justify-end pr-1"
                style={{ width: `${(dept.lead_products / maxProducts) * 100}%`, minWidth: dept.lead_products > 0 ? '20px' : '0' }}
              >
                {dept.lead_products > 0 && <span className="text-xs text-white font-medium">{dept.lead_products}</span>}
              </div>
              <div
                className="h-6 bg-indigo-300 rounded-r flex items-center justify-end pr-1"
                style={{ width: `${(dept.supporting_products / maxProducts) * 100}%`, minWidth: dept.supporting_products > 0 ? '20px' : '0' }}
              >
                {dept.supporting_products > 0 && <span className="text-xs text-white font-medium">{dept.supporting_products}</span>}
              </div>
            </div>
            <span className="w-8 text-sm text-gray-500 text-right">{dept.total_products}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-3 text-xs">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-indigo-500 rounded" />
          <span className="text-gray-600">Lead</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-indigo-300 rounded" />
          <span className="text-gray-600">Supporting</span>
        </div>
      </div>
    </div>
  )
}

export default function ServiceDepartmentsPage() {
  const [departments, setDepartments] = useState([])
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingDept, setEditingDept] = useState(null)
  const [deletingDept, setDeletingDept] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { addToast } = useToast()

  const fetchDepartments = async () => {
    setLoading(true)
    setError(null)
    try {
      const [deptRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/service-departments`),
        fetch(`${API_BASE}/service-departments/stats`)
      ])
      const deptData = await deptRes.json()
      const statsData = await statsRes.json()
      if (deptData.success) {
        setDepartments(deptData.data)
      }
      if (statsData.success) {
        setStats(statsData.data)
      }
    } catch (err) {
      setError('Failed to load departments. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [])

  const handleSave = () => {
    setShowForm(false)
    setEditingDept(null)
    fetchDepartments()
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      const res = await fetch(`${API_BASE}/service-departments/${deletingDept.id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to delete')
      addToast('Department deleted', 'success')
      setDeletingDept(null)
      fetchDepartments()
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Service Departments</h1>
        <ErrorState message={error} onRetry={fetchDepartments} />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Departments</h1>
          <p className="text-sm text-gray-500 mt-1">Manage the service layer teams that build products</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Department
        </button>
      </div>

      {stats.length > 0 && <DepartmentStatsChart stats={stats} />}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">About Service Departments</h3>
        <p className="text-sm text-blue-800">
          Service departments are the teams that build products for business units (brands).
          Examples: SEO, Technical, Performance Media, BI, AI. When creating a product,
          you can assign one or more service departments with roles (Lead/Supporting) and RACI responsibilities.
        </p>
      </div>

      {departments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-gray-500 mb-4">No service departments yet. Add your first department to get started.</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Add Department
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <ScrollableTable>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{dept.name}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {dept.description || <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => setEditingDept(dept)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingDept(dept)}
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

      {(showForm || editingDept) && (
        <DepartmentForm
          department={editingDept}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingDept(null)
          }}
        />
      )}

      {deletingDept && (
        <DeleteConfirm
          department={deletingDept}
          onConfirm={handleDelete}
          onCancel={() => setDeletingDept(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  )
}
