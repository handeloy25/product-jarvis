import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { LoadingPage } from '../components/Spinner'
import ErrorState from '../components/ErrorState'
import { useToast } from '../components/Toast'

const API_BASE = 'http://localhost:8001/api'

const STATUS_COLORS = {
  not_started: 'bg-gray-100 text-gray-600',
  under: 'bg-blue-100 text-blue-700',
  on_track: 'bg-green-100 text-green-700',
  over: 'bg-red-100 text-red-700'
}

const STATUS_LABELS = {
  not_started: 'Not Started',
  under: 'Under Budget',
  on_track: 'On Track',
  over: 'Over Budget'
}

function ProgressBar({ progress, status }) {
  const barColor = {
    not_started: 'bg-gray-300',
    under: 'bg-blue-500',
    on_track: 'bg-green-500',
    over: 'bg-red-500'
  }
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${barColor[status]} transition-all`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <span className="text-xs text-gray-600 w-12 text-right">{progress}%</span>
    </div>
  )
}

function ActualHoursInput({ task, onUpdate }) {
  const [value, setValue] = useState(task.actual_hours || 0)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const { addToast } = useToast()
  const debounceRef = useRef(null)

  useEffect(() => {
    setValue(task.actual_hours || 0)
  }, [task.actual_hours])

  const saveHours = async (hours) => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch(`${API_BASE}/service-tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actual_hours: hours })
      })
      if (!res.ok) throw new Error('Failed to update')
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
      onUpdate()
    } catch (err) {
      addToast('Failed to update hours', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value) || 0
    setValue(newValue)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => saveHours(newValue), 500)
  }

  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        step="0.5"
        min="0"
        value={value}
        onChange={handleChange}
        className="w-16 border rounded px-2 py-1 text-sm text-right focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500"
        disabled={saving}
      />
      <span className="text-gray-500 w-4">
        {saving ? (
          <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin inline-block" />
        ) : saved ? (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : 'h'}
      </span>
    </div>
  )
}

function TaskForm({ serviceId, positions, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    position_id: positions[0]?.id || '',
    estimated_hours: '',
    is_recurring: false,
    recurrence_type: 'monthly'
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Task name required'
    if (!form.position_id) newErrors.position_id = 'Select a position'
    if (!form.estimated_hours || parseFloat(form.estimated_hours) <= 0) {
      newErrors.estimated_hours = 'Valid hours required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/services/${serviceId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          position_id: parseInt(form.position_id),
          estimated_hours: parseFloat(form.estimated_hours),
          is_recurring: form.is_recurring,
          recurrence_type: form.is_recurring ? form.recurrence_type : null
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Failed to add task')
      }

      addToast('Task added', 'success')
      onSave()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-4">
      <h3 className="font-medium mb-3">Add Task</h3>
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-start">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm text-gray-600 mb-1">Task Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={`w-full border rounded px-3 py-2 text-sm ${errors.name ? 'border-red-500' : ''}`}
            placeholder="e.g., Write blog post"
          />
        </div>
        <div className="w-48">
          <label className="block text-sm text-gray-600 mb-1">Position</label>
          <select
            value={form.position_id}
            onChange={(e) => setForm({ ...form, position_id: e.target.value })}
            className={`w-full border rounded px-3 py-2 text-sm ${errors.position_id ? 'border-red-500' : ''}`}
          >
            {positions.map(pos => (
              <option key={pos.id} value={pos.id}>
                {pos.title} (${pos.hourly_cost_min}-${pos.hourly_cost_max}/hr)
              </option>
            ))}
          </select>
        </div>
        <div className="w-24">
          <label className="block text-sm text-gray-600 mb-1">Hours</label>
          <input
            type="number"
            step="0.5"
            min="0.5"
            value={form.estimated_hours}
            onChange={(e) => setForm({ ...form, estimated_hours: e.target.value })}
            className={`w-full border rounded px-3 py-2 text-sm ${errors.estimated_hours ? 'border-red-500' : ''}`}
          />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            id="is_recurring"
            checked={form.is_recurring}
            onChange={(e) => setForm({ ...form, is_recurring: e.target.checked })}
            className="rounded"
          />
          <label htmlFor="is_recurring" className="text-sm text-gray-600">Recurring</label>
        </div>
        {form.is_recurring && (
          <div className="w-32 pt-6">
            <select
              value={form.recurrence_type}
              onChange={(e) => setForm({ ...form, recurrence_type: e.target.value })}
              className="w-full border rounded px-2 py-2 text-sm"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
          </div>
        )}
        <div className="flex gap-2 pt-6">
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

function SoftwareAllocationForm({ serviceId, software, existingAllocations, onSave, onCancel }) {
  const availableSoftware = software.filter(s => !existingAllocations.find(a => a.software_id === s.id))
  const [form, setForm] = useState({
    software_id: availableSoftware[0]?.id || '',
    allocation_percent: '100'
  })
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.software_id) {
      addToast('Select software', 'error')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/services/${serviceId}/software`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          software_id: parseInt(form.software_id),
          allocation_percent: parseFloat(form.allocation_percent)
        })
      })

      if (!res.ok) throw new Error('Failed to add')
      addToast('Software added', 'success')
      onSave()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (availableSoftware.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-600">All available software has been allocated.</p>
        <button onClick={onCancel} className="text-indigo-600 text-sm hover:underline mt-2">Close</button>
      </div>
    )
  }

  const selectedSoftware = software.find(s => s.id === parseInt(form.software_id))

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-4">
      <h3 className="font-medium mb-3">Add Software Cost</h3>
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm text-gray-600 mb-1">Software</label>
          <select
            value={form.software_id}
            onChange={(e) => setForm({ ...form, software_id: e.target.value })}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            {availableSoftware.map(s => (
              <option key={s.id} value={s.id}>{s.name} (${s.monthly_cost}/mo)</option>
            ))}
          </select>
        </div>
        <div className="w-32">
          <label className="block text-sm text-gray-600 mb-1">Allocation %</label>
          <input
            type="number"
            min="0"
            max="100"
            value={form.allocation_percent}
            onChange={(e) => setForm({ ...form, allocation_percent: e.target.value })}
            className="w-full border rounded px-3 py-2 text-sm"
          />
          {selectedSoftware && (
            <p className="text-xs text-gray-500 mt-1">
              = ${((selectedSoftware.monthly_cost * parseFloat(form.allocation_percent || 0)) / 100).toFixed(2)}/mo
            </p>
          )}
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

function ResultsCard({ title, value, subtitle, color = 'gray' }) {
  const colors = {
    gray: 'bg-white',
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200'
  }
  return (
    <div className={`rounded-lg border p-4 ${colors[color]}`}>
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
      {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
    </div>
  )
}

export default function ServiceCalculatorPage() {
  const [searchParams] = useSearchParams()
  const serviceId = searchParams.get('id')
  
  const [services, setServices] = useState([])
  const [positions, setPositions] = useState([])
  const [software, setSoftware] = useState([])
  const [selectedServiceId, setSelectedServiceId] = useState(serviceId || '')
  const [calculation, setCalculation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [calcLoading, setCalcLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showSoftwareForm, setShowSoftwareForm] = useState(false)
  const { addToast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [svcRes, posRes, softRes] = await Promise.all([
        fetch(`${API_BASE}/services`),
        fetch(`${API_BASE}/positions`),
        fetch(`${API_BASE}/software`)
      ])
      const [svcData, posData, softData] = await Promise.all([
        svcRes.json(),
        posRes.json(),
        softRes.json()
      ])
      if (svcData.success) setServices(svcData.data)
      if (posData.success) setPositions(posData.data)
      if (softData.success) setSoftware(softData.data)
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedServiceId) {
      loadCalculation(selectedServiceId)
    }
  }, [selectedServiceId])

  const loadCalculation = async (id) => {
    if (!id) {
      setCalculation(null)
      return
    }
    setCalcLoading(true)
    try {
      const res = await fetch(`${API_BASE}/services/${id}/calculator`)
      const data = await res.json()
      if (data.success) setCalculation(data.data)
    } catch (err) {
      addToast('Failed to load calculation', 'error')
    } finally {
      setCalcLoading(false)
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      const res = await fetch(`${API_BASE}/service-tasks/${taskId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      addToast('Task removed', 'success')
      loadCalculation(selectedServiceId)
    } catch (err) {
      addToast('Failed to remove task', 'error')
    }
  }

  const handleDeleteSoftware = async (allocId) => {
    try {
      const res = await fetch(`${API_BASE}/service-software/${allocId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      addToast('Software removed', 'success')
      loadCalculation(selectedServiceId)
    } catch (err) {
      addToast('Failed to remove software', 'error')
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatCurrencyRange = (min, max) => {
    if (min === max) return formatCurrency(min)
    return `${formatCurrency(min)} - ${formatCurrency(max)}`
  }

  if (loading) return <LoadingPage />
  if (error) return <ErrorState message={error} onRetry={fetchData} />

  if (services.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Service Calculator</h1>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">No services yet. Create a service first.</p>
          <Link to="/services" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Add Service
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Calculator</h1>
          <p className="text-sm text-gray-500 mt-1">Calculate costs for services provided to business units</p>
        </div>
        <Link to="/services" className="text-indigo-600 hover:text-indigo-800 text-sm">
          Back to Services
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Service</label>
        <select
          value={selectedServiceId}
          onChange={(e) => setSelectedServiceId(e.target.value)}
          className="w-full max-w-md border rounded-lg px-3 py-2"
        >
          <option value="">-- Select a service --</option>
          {services.map(s => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.department_name} → {s.business_unit})
            </option>
          ))}
        </select>
      </div>

      {calcLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
        </div>
      )}

      {calculation && !calcLoading && (
        <>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold">{calculation.service.name}</h2>
                <p className="text-sm text-gray-500">
                  {calculation.service.department_name} → {calculation.service.business_unit}
                  {calculation.service.type_is_recurring && (
                    <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">Recurring</span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Fee: {calculation.service.fee_percent}%</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Tasks</h2>
              {!showTaskForm && positions.length > 0 && (
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                >
                  + Add Task
                </button>
              )}
            </div>

            {showTaskForm && (
              <TaskForm
                serviceId={selectedServiceId}
                positions={positions}
                onSave={() => { setShowTaskForm(false); loadCalculation(selectedServiceId); }}
                onCancel={() => setShowTaskForm(false)}
              />
            )}

            {calculation.tasks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No tasks yet. Add tasks to calculate costs.</p>
            ) : (
              <>
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[calculation.summary.overall_hours_status]}`}>
                      {STATUS_LABELS[calculation.summary.overall_hours_status]}
                    </span>
                  </div>
                  <ProgressBar progress={calculation.summary.overall_hours_progress} status={calculation.summary.overall_hours_status} />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{calculation.summary.total_actual_hours}h actual</span>
                    <span>{calculation.summary.total_hours}h estimated</span>
                  </div>
                </div>

                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium text-gray-600">Task</th>
                      <th className="text-left py-2 font-medium text-gray-600">Position</th>
                      <th className="text-center py-2 font-medium text-gray-600">Type</th>
                      <th className="text-right py-2 font-medium text-gray-600">Est. Hours</th>
                      <th className="text-right py-2 font-medium text-gray-600">Actual</th>
                      <th className="text-center py-2 font-medium text-gray-600">Progress</th>
                      <th className="text-right py-2 font-medium text-gray-600">Est. Cost</th>
                      <th className="text-right py-2 font-medium text-gray-600">Actual Cost</th>
                      <th className="text-right py-2 font-medium text-gray-600"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculation.tasks.map(task => (
                      <tr key={task.id} className="border-b hover:bg-gray-50">
                        <td className="py-2">{task.name}</td>
                        <td className="py-2 text-gray-600">{task.position_title}</td>
                        <td className="py-2 text-center">
                          {task.is_recurring ? (
                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                              {task.recurrence_type}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">one-time</span>
                          )}
                        </td>
                        <td className="py-2 text-right">{task.estimated_hours}h</td>
                        <td className="py-2 text-right">
                          <ActualHoursInput task={task} onUpdate={() => loadCalculation(selectedServiceId)} />
                        </td>
                        <td className="py-2 px-2">
                          <ProgressBar progress={task.hours_progress} status={task.hours_status} />
                        </td>
                        <td className="py-2 text-right text-gray-600">
                          {formatCurrencyRange(task.task_cost_min, task.task_cost_max)}
                        </td>
                        <td className="py-2 text-right font-medium">
                          {formatCurrencyRange(task.actual_cost_min, task.actual_cost_max)}
                        </td>
                        <td className="py-2 text-right">
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr className="font-semibold bg-gray-50">
                      <td className="py-3">Labor Total</td>
                      <td></td>
                      <td></td>
                      <td className="py-3 text-right">{calculation.summary.total_hours}h</td>
                      <td className="py-3 text-right">{calculation.summary.total_actual_hours}h</td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[calculation.summary.overall_hours_status]}`}>
                          {calculation.summary.overall_hours_progress}%
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {formatCurrencyRange(calculation.summary.total_labor_cost_min, calculation.summary.total_labor_cost_max)}
                      </td>
                      <td className="py-3 text-right">
                        {formatCurrencyRange(calculation.summary.total_actual_labor_cost_min, calculation.summary.total_actual_labor_cost_max)}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Software Costs</h2>
              {!showSoftwareForm && software.length > 0 && (
                <button
                  onClick={() => setShowSoftwareForm(true)}
                  className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                >
                  + Add Software
                </button>
              )}
            </div>

            {showSoftwareForm && (
              <SoftwareAllocationForm
                serviceId={selectedServiceId}
                software={software}
                existingAllocations={calculation.software_allocations}
                onSave={() => { setShowSoftwareForm(false); loadCalculation(selectedServiceId); }}
                onCancel={() => setShowSoftwareForm(false)}
              />
            )}

            {calculation.software_allocations.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-gray-600">Software</th>
                    <th className="text-right py-2 font-medium text-gray-600">Monthly Cost</th>
                    <th className="text-right py-2 font-medium text-gray-600">Allocation</th>
                    <th className="text-right py-2 font-medium text-gray-600">Allocated Cost</th>
                    <th className="text-right py-2 font-medium text-gray-600"></th>
                  </tr>
                </thead>
                <tbody>
                  {calculation.software_allocations.map(alloc => (
                    <tr key={alloc.id} className="border-b hover:bg-gray-50">
                      <td className="py-2">{alloc.software_name}</td>
                      <td className="py-2 text-right text-gray-600">{formatCurrency(alloc.software_monthly_cost)}</td>
                      <td className="py-2 text-right">{alloc.allocation_percent}%</td>
                      <td className="py-2 text-right font-medium">{formatCurrency(alloc.allocated_cost)}</td>
                      <td className="py-2 text-right">
                        <button
                          onClick={() => handleDeleteSoftware(alloc.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="font-semibold">
                    <td className="py-3">Software Total</td>
                    <td></td>
                    <td></td>
                    <td className="py-3 text-right">{formatCurrency(calculation.summary.total_software_cost)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500 text-sm">No software allocated.</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <ResultsCard
              title="Overhead (Labor + Software)"
              value={formatCurrencyRange(calculation.summary.overhead_min, calculation.summary.overhead_max)}
              subtitle="Our cost to deliver"
            />
            <ResultsCard
              title="Fee Amount"
              value={formatCurrencyRange(calculation.summary.fee_amount_min, calculation.summary.fee_amount_max)}
              subtitle={`${calculation.summary.fee_percent}% of overhead`}
              color="blue"
            />
            <ResultsCard
              title="Total with Fee"
              value={formatCurrencyRange(calculation.summary.total_with_fee_min, calculation.summary.total_with_fee_max)}
              subtitle="Amount to charge business unit"
              color="green"
            />
            <ResultsCard
              title="Hours Progress"
              value={`${calculation.summary.overall_hours_progress}%`}
              subtitle={`${calculation.summary.total_actual_hours}h / ${calculation.summary.total_hours}h`}
            />
          </div>
        </>
      )}
    </div>
  )
}
