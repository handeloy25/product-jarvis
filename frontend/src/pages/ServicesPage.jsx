import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LoadingPage } from '../components/Spinner'
import ErrorState from '../components/ErrorState'
import { useToast } from '../components/Toast'
import ScrollableTable from '../components/ScrollableTable'
import { useRole } from '../contexts/RoleContext'

const API_BASE = 'http://localhost:8001/api'

const STATUS_COLORS = {
  'Active': 'bg-green-100 text-green-800',
  'Paused': 'bg-yellow-100 text-yellow-800',
  'Completed': 'bg-blue-100 text-blue-800',
  'Cancelled': 'bg-red-100 text-red-800'
}

const HOURS_STATUS_COLORS = {
  not_started: 'bg-gray-100 text-gray-600',
  under: 'bg-blue-100 text-blue-700',
  on_track: 'bg-green-100 text-green-700',
  over: 'bg-red-100 text-red-700'
}

function SummaryCard({ title, value, subtitle, icon, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500'
  }
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`${colors[color]} rounded-lg p-3 text-white`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}

function ProgressBadge({ progress, status }) {
  if (status === 'not_started' || progress === 0) {
    return <span className="text-xs text-gray-400">-</span>
  }
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-gray-200 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full ${status === 'over' ? 'bg-red-500' : status === 'on_track' ? 'bg-green-500' : 'bg-blue-500'}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <span className={`text-xs font-medium ${HOURS_STATUS_COLORS[status]?.split(' ')[1] || 'text-gray-600'}`}>
        {progress}%
      </span>
    </div>
  )
}

function ServiceForm({ departments, serviceTypes, businessUnits, onSave, onCancel, initial }) {
  const [form, setForm] = useState(initial || {
    name: '',
    description: '',
    service_department_id: '',
    business_unit: '',
    business_unit_id: '',
    service_type_id: '',
    status: 'Active',
    fee_percent: '0'
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()

  const filteredServiceTypes = serviceTypes.filter(
    st => st.department_id === parseInt(form.service_department_id)
  )

  const handleDepartmentChange = (e) => {
    const newDeptId = e.target.value
    setForm({ ...form, service_department_id: newDeptId, service_type_id: '' })
  }

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Name required'
    if (!form.business_unit_id) newErrors.business_unit_id = 'Select a business unit'
    if (!form.service_department_id) newErrors.service_department_id = 'Select a department'
    if (!form.service_type_id) newErrors.service_type_id = 'Select a service type'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      const url = initial ? `${API_BASE}/services/${initial.id}` : `${API_BASE}/services`
      const method = initial ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          service_department_id: parseInt(form.service_department_id),
          business_unit: businessUnits.find(bu => bu.id === parseInt(form.business_unit_id))?.name || '',
          business_unit_id: parseInt(form.business_unit_id),
          service_type_id: parseInt(form.service_type_id),
          status: form.status,
          fee_percent: parseFloat(form.fee_percent) || 0
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Failed to save')
      }

      addToast(initial ? 'Service updated' : 'Service created', 'success')
      onSave()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">{initial ? 'Edit Service' : 'New Service'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2 ${errors.name ? 'border-red-500' : ''}`}
              placeholder="e.g., SEO Content Creation"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Unit</label>
            <select
              value={form.business_unit_id}
              onChange={(e) => setForm({ ...form, business_unit_id: e.target.value, business_unit: businessUnits.find(bu => bu.id === parseInt(e.target.value))?.name || '' })}
              className={`w-full border rounded-lg px-3 py-2 ${errors.business_unit_id ? 'border-red-500' : ''}`}
            >
              <option value="">Select business unit...</option>
              {businessUnits.map(bu => (
                <option key={bu.id} value={bu.id}>{bu.name}</option>
              ))}
            </select>
            {errors.business_unit_id && <p className="text-red-500 text-xs mt-1">{errors.business_unit_id}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Department</label>
            <select
              value={form.service_department_id}
              onChange={handleDepartmentChange}
              className={`w-full border rounded-lg px-3 py-2 ${errors.service_department_id ? 'border-red-500' : ''}`}
            >
              <option value="">Select department...</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
            <select
              value={form.service_type_id}
              onChange={(e) => setForm({ ...form, service_type_id: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2 ${errors.service_type_id ? 'border-red-500' : ''}`}
              disabled={!form.service_department_id}
            >
              <option value="">{form.service_department_id ? 'Select type...' : 'Select department first...'}</option>
              {filteredServiceTypes.map(st => (
                <option key={st.id} value={st.id}>{st.name} {st.is_recurring ? '(Recurring)' : '(One-time)'}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="Active">Active</option>
              <option value="Paused">Paused</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fee % (on top of overhead)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={form.fee_percent}
              onChange={(e) => setForm({ ...form, fee_percent: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="0"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
            rows="2"
            placeholder="Optional description..."
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : (initial ? 'Update' : 'Create')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

function ServiceTypeForm({ departments, onSave, onCancel }) {
  const [form, setForm] = useState({ name: '', description: '', is_recurring: false, department_id: departments[0]?.id || '' })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const { addToast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Name required'
    if (!form.department_id) newErrors.department_id = 'Department required'
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/service-types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          is_recurring: form.is_recurring,
          department_id: parseInt(form.department_id)
        })
      })

      if (!res.ok) throw new Error('Failed to create')
      addToast('Service type created', 'success')
      onSave()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-4">
      <h3 className="font-medium mb-3">Add Service Type</h3>
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm text-gray-600 mb-1">Department</label>
          <select
            value={form.department_id}
            onChange={(e) => setForm({ ...form, department_id: e.target.value })}
            className={`w-full border rounded px-3 py-2 text-sm ${errors.department_id ? 'border-red-500' : ''}`}
          >
            <option value="">Select department...</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm text-gray-600 mb-1">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={`w-full border rounded px-3 py-2 text-sm ${errors.name ? 'border-red-500' : ''}`}
            placeholder="e.g., Link Building"
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm text-gray-600 mb-1">Description</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Optional"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_recurring"
            checked={form.is_recurring}
            onChange={(e) => setForm({ ...form, is_recurring: e.target.checked })}
            className="rounded"
          />
          <label htmlFor="is_recurring" className="text-sm text-gray-600">Recurring</label>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            Add
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default function ServicesPage() {
  const [dashboard, setDashboard] = useState(null)
  const [departments, setDepartments] = useState([])
  const [serviceTypes, setServiceTypes] = useState([])
  const [businessUnits, setBusinessUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showTypeForm, setShowTypeForm] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [deptFilter, setDeptFilter] = useState('')
  const [buFilter, setBuFilter] = useState('')
  const { addToast } = useToast()
  const { hasFullAccess, isDepartmentHead, isBUHead, selectedDepartmentId, selectedBusinessUnitId } = useRole()

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [dashRes, deptRes, typesRes, buRes] = await Promise.all([
        fetch(`${API_BASE}/services-dashboard`),
        fetch(`${API_BASE}/service-departments`),
        fetch(`${API_BASE}/service-types`),
        fetch(`${API_BASE}/business-units`)
      ])
      const [dashData, deptData, typesData, buData] = await Promise.all([
        dashRes.json(),
        deptRes.json(),
        typesRes.json(),
        buRes.json()
      ])
      if (dashData.success) setDashboard(dashData.data)
      if (deptData.success) setDepartments(deptData.data)
      if (typesData.success) setServiceTypes(typesData.data)
      if (buData.success) setBusinessUnits(buData.data)
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this service?')) return
    try {
      const res = await fetch(`${API_BASE}/services/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      addToast('Service deleted', 'success')
      fetchData()
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
  }

  const formatCurrencyRange = (min, max) => {
    if (min === max) return formatCurrency(min)
    return `${formatCurrency(min)} - ${formatCurrency(max)}`
  }

  const getPageTitle = () => {
    if (isDepartmentHead && selectedDepartmentId) {
      const dept = departments.find(d => d.id === selectedDepartmentId)
      return dept ? `${dept.name} Services` : 'Services'
    }
    if (isBUHead && selectedBusinessUnitId) {
      const bu = businessUnits.find(b => b.id === selectedBusinessUnitId)
      return bu ? `${bu.name} Services` : 'Services'
    }
    return 'Services'
  }

  const showSelectPrompt = (isDepartmentHead && !selectedDepartmentId) || (isBUHead && !selectedBusinessUnitId)

  if (loading) return <LoadingPage />
  if (error) return <ErrorState message={error} onRetry={fetchData} />

  if (showSelectPrompt) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Services</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 text-center">
          <svg className="w-16 h-16 text-amber-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {isDepartmentHead ? 'Select Your Department' : 'Select Your Business Unit'}
          </h2>
          <p className="text-gray-600">
            Use the role selector in the sidebar to choose your {isDepartmentHead ? 'department' : 'business unit'}.
          </p>
        </div>
      </div>
    )
  }

  let filteredServices = dashboard?.services.filter(s => {
    if (deptFilter && s.department_name !== deptFilter) return false
    if (buFilter && s.business_unit !== buFilter) return false
    return true
  }) || []

  if (isDepartmentHead && selectedDepartmentId) {
    const dept = departments.find(d => d.id === selectedDepartmentId)
    if (dept) {
      filteredServices = filteredServices.filter(s => s.department_name === dept.name)
    }
  }

  if (isBUHead && selectedBusinessUnitId) {
    filteredServices = filteredServices.filter(s => s.business_unit_id === selectedBusinessUnitId)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
          <p className="text-sm text-gray-500 mt-1">Track services provided to business units</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTypeForm(!showTypeForm)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            + Service Type
          </button>
          <button
            onClick={() => { setShowForm(true); setEditingService(null); }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            + New Service
          </button>
        </div>
      </div>

      {showTypeForm && (
        <ServiceTypeForm
          departments={departments}
          onSave={() => { setShowTypeForm(false); fetchData(); }}
          onCancel={() => setShowTypeForm(false)}
        />
      )}

      {(showForm || editingService) && (
        <ServiceForm
          departments={departments}
          serviceTypes={serviceTypes}
          businessUnits={businessUnits}
          initial={editingService}
          onSave={() => { setShowForm(false); setEditingService(null); fetchData(); }}
          onCancel={() => { setShowForm(false); setEditingService(null); }}
        />
      )}

      {dashboard && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <SummaryCard
              title="Total Services"
              value={dashboard.summary.total_services}
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
              color="indigo"
            />
            <SummaryCard
              title="Total Overhead"
              value={formatCurrencyRange(dashboard.summary.total_overhead_min, dashboard.summary.total_overhead_max)}
              subtitle="Labor + Software"
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
              color="blue"
            />
            <SummaryCard
              title="Total with Fees"
              value={formatCurrencyRange(dashboard.summary.total_with_fees_min, dashboard.summary.total_with_fees_max)}
              subtitle="Overhead + Fees"
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              color="green"
            />
            <SummaryCard
              title="Service Types"
              value={serviceTypes.length}
              subtitle={`${serviceTypes.filter(t => t.is_recurring).length} recurring`}
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
              color="purple"
            />
          </div>

          {(dashboard.service_departments?.length > 0 || dashboard.business_units?.length > 0) && (
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex flex-wrap items-center gap-4">
                {dashboard.service_departments?.length > 0 && (
                  <>
                    <span className="text-sm font-medium text-gray-700">Department:</span>
                    <select
                      value={deptFilter}
                      onChange={(e) => setDeptFilter(e.target.value)}
                      className="border rounded-lg px-3 py-1.5 text-sm"
                    >
                      <option value="">All</option>
                      {dashboard.service_departments.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </>
                )}
                {dashboard.business_units?.length > 0 && (
                  <>
                    <span className="text-sm font-medium text-gray-700">Business Unit:</span>
                    <select
                      value={buFilter}
                      onChange={(e) => setBuFilter(e.target.value)}
                      className="border rounded-lg px-3 py-1.5 text-sm"
                    >
                      <option value="">All</option>
                      {dashboard.business_units.map(bu => (
                        <option key={bu} value={bu}>{bu}</option>
                      ))}
                    </select>
                  </>
                )}
                {(deptFilter || buFilter) && (
                  <button
                    onClick={() => { setDeptFilter(''); setBuFilter(''); }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow">
            <ScrollableTable>
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Progress</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Overhead</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total (w/Fee)</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                      No services found. Create one to get started.
                    </td>
                  </tr>
                ) : (
                  filteredServices.map(svc => (
                    <tr key={svc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link to={`/service-calculator?id=${svc.id}`} className="font-medium text-gray-900 hover:text-indigo-600">
                          {svc.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{svc.department_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{svc.business_unit}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs ${svc.type_is_recurring ? 'text-purple-600' : 'text-gray-600'}`}>
                          {svc.service_type_name}
                          {svc.type_is_recurring && (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[svc.status]}`}>
                          {svc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ProgressBadge progress={svc.hours_progress} status={svc.hours_status} />
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-600">
                        {formatCurrencyRange(svc.overhead_min, svc.overhead_max)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                        {formatCurrencyRange(svc.total_min, svc.total_max)}
                        {svc.fee_percent > 0 && (
                          <span className="text-xs text-gray-500 ml-1">({svc.fee_percent}%)</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <Link
                            to={`/service-calculator?id=${svc.id}`}
                            className="text-indigo-600 hover:text-indigo-800 text-sm"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => setEditingService(svc)}
                            className="text-gray-600 hover:text-gray-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(svc.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              </table>
            </ScrollableTable>
          </div>
        </>
      )}
    </div>
  )
}
