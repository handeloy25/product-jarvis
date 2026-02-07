import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { LoadingPage } from '../components/Spinner'
import ErrorState from '../components/ErrorState'
import { useToast } from '../components/Toast'

const API_BASE = 'http://localhost:8001/api'

const RECOMMENDATION_COLORS = {
  green: 'bg-green-100 text-green-800 border-green-300',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  orange: 'bg-orange-100 text-orange-800 border-orange-300',
  red: 'bg-red-100 text-red-800 border-red-300'
}

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

function HelpPanel({ onClose }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-blue-900 mb-2">How the Calculator Works</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>1. <strong>Select a product</strong> from the dropdown</li>
            <li>2. <strong>Add tasks</strong> with positions and estimated hours</li>
            <li>3. <strong>Add software costs</strong> if the project uses paid tools</li>
            <li>4. <strong>Review the cost range</strong> - min uses lowest rates, max uses highest</li>
            <li>5. <strong>Check the recommendation</strong> based on ROI vs estimated value</li>
          </ul>
          <p className="text-sm text-blue-700 mt-3">
            <strong>Tip:</strong> Costs show as ranges because position rates vary. Use the midpoint for planning.
          </p>
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
      const res = await fetch(`${API_BASE}/tasks/${task.id}`, {
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

function TaskForm({ productId, positions, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    position_id: positions[0]?.id || '',
    estimated_hours: ''
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Task name is required'
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
      const res = await fetch(`${API_BASE}/products/${productId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          position_id: parseInt(form.position_id),
          estimated_hours: parseFloat(form.estimated_hours)
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

  const selectedPosition = positions.find(p => p.id === parseInt(form.position_id))

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
            placeholder="e.g., Backend API Development"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        <div className="w-64">
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
        <div className="w-32">
          <label className="block text-sm text-gray-600 mb-1">Hours</label>
          <input
            type="number"
            step="0.5"
            min="0.5"
            value={form.estimated_hours}
            onChange={(e) => setForm({ ...form, estimated_hours: e.target.value })}
            className={`w-full border rounded px-3 py-2 text-sm ${errors.estimated_hours ? 'border-red-500' : ''}`}
            placeholder="10"
          />
          {errors.estimated_hours && <p className="text-red-500 text-xs mt-1">{errors.estimated_hours}</p>}
        </div>
        <div className="flex gap-2 pt-6">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center"
          >
            {saving && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
            Add
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

function SoftwareAllocationForm({ productId, software, existingAllocations, onSave, onCancel }) {
  const availableSoftware = software.filter(s => !existingAllocations.find(a => a.software_id === s.id))
  const [form, setForm] = useState({
    software_id: availableSoftware[0]?.id || '',
    allocation_percent: '100'
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()

  const validate = () => {
    const newErrors = {}
    if (!form.software_id) newErrors.software_id = 'Select software'
    const percent = parseFloat(form.allocation_percent)
    if (isNaN(percent) || percent < 0 || percent > 100) {
      newErrors.allocation_percent = 'Must be 0-100%'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/software/product/${productId}/allocations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          software_id: parseInt(form.software_id),
          allocation_percent: parseFloat(form.allocation_percent)
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Failed to add software')
      }

      addToast('Software cost added', 'success')
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
        <p className="text-sm text-gray-600">All available software has been allocated to this product.</p>
        <button onClick={onCancel} className="text-indigo-600 text-sm hover:underline mt-2">Close</button>
      </div>
    )
  }

  const selectedSoftware = software.find(s => s.id === parseInt(form.software_id))

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-4">
      <h3 className="font-medium mb-3">Add Software Cost</h3>
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-start">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm text-gray-600 mb-1">Software</label>
          <select
            value={form.software_id}
            onChange={(e) => setForm({ ...form, software_id: e.target.value })}
            className={`w-full border rounded px-3 py-2 text-sm ${errors.software_id ? 'border-red-500' : ''}`}
          >
            {availableSoftware.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} (${s.monthly_cost}/mo)
              </option>
            ))}
          </select>
        </div>
        <div className="w-40">
          <label className="block text-sm text-gray-600 mb-1">Allocation %</label>
          <input
            type="number"
            step="1"
            min="0"
            max="100"
            value={form.allocation_percent}
            onChange={(e) => setForm({ ...form, allocation_percent: e.target.value })}
            className={`w-full border rounded px-3 py-2 text-sm ${errors.allocation_percent ? 'border-red-500' : ''}`}
            placeholder="100"
          />
          {errors.allocation_percent && <p className="text-red-500 text-xs mt-1">{errors.allocation_percent}</p>}
          <p className="text-xs text-gray-500 mt-1">
            {selectedSoftware && form.allocation_percent && 
              `= $${((selectedSoftware.monthly_cost * parseFloat(form.allocation_percent || 0)) / 100).toFixed(2)}/mo`
            }
          </p>
        </div>
        <div className="flex gap-2 pt-6">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center"
          >
            {saving && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
            Add
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
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
    yellow: 'bg-yellow-50 border-yellow-200',
    red: 'bg-red-50 border-red-200',
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

export default function CalculatorPage() {
  const [products, setProducts] = useState([])
  const [positions, setPositions] = useState([])
  const [software, setSoftware] = useState([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [calculation, setCalculation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showSoftwareForm, setShowSoftwareForm] = useState(false)
  const [calcLoading, setCalcLoading] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const { addToast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [prodRes, posRes, softRes] = await Promise.all([
        fetch(`${API_BASE}/products`),
        fetch(`${API_BASE}/positions`),
        fetch(`${API_BASE}/software`)
      ])
      const [prodData, posData, softData] = await Promise.all([
        prodRes.json(),
        posRes.json(),
        softRes.json()
      ])
      setProducts(prodData.data || [])
      setPositions(posData.data || [])
      setSoftware(softData.data || [])
    } catch (err) {
      setError('Failed to load data. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const loadCalculation = async (productId) => {
    if (!productId) {
      setCalculation(null)
      return
    }
    setCalcLoading(true)
    try {
      const res = await fetch(`${API_BASE}/calculator/${productId}`)
      const data = await res.json()
      if (data.success) {
        setCalculation(data.data)
      }
    } catch (err) {
      addToast('Failed to load calculation', 'error')
    } finally {
      setCalcLoading(false)
    }
  }

  const handleProductChange = (e) => {
    const id = e.target.value
    setSelectedProductId(id)
    loadCalculation(id)
    setShowTaskForm(false)
    setShowSoftwareForm(false)
  }

  const handleTaskAdded = () => {
    setShowTaskForm(false)
    loadCalculation(selectedProductId)
  }

  const handleSoftwareAdded = () => {
    setShowSoftwareForm(false)
    loadCalculation(selectedProductId)
  }

  const handleDeleteTask = async (taskId) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      addToast('Task removed', 'success')
      loadCalculation(selectedProductId)
    } catch (err) {
      addToast('Failed to remove task', 'error')
    }
  }

  const handleDeleteAllocation = async (allocationId) => {
    try {
      const res = await fetch(`${API_BASE}/software/allocations/${allocationId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      addToast('Software cost removed', 'success')
      loadCalculation(selectedProductId)
    } catch (err) {
      addToast('Failed to remove software cost', 'error')
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatCurrencyRange = (min, max) => {
    if (min === max) return formatCurrency(min)
    return `${formatCurrency(min)} - ${formatCurrency(max)}`
  }

  if (loading) return <LoadingPage />

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Cost Calculator</h1>
        <ErrorState message={error} onRetry={fetchData} />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Cost Calculator</h1>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-gray-500 mb-4">No products yet. Create a product first to use the calculator.</p>
          <Link to="/products" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Add Product
          </Link>
        </div>
      </div>
    )
  }

  if (positions.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Cost Calculator</h1>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 mb-4">No positions yet. Add positions first to assign tasks.</p>
          <Link to="/positions" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Add Position
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cost Calculator</h1>
          <p className="text-sm text-gray-500 mt-1">Estimate labor and software costs for your products</p>
        </div>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Help
        </button>
      </div>

      {showHelp && <HelpPanel onClose={() => setShowHelp(false)} />}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Product to Analyze</label>
        <select
          value={selectedProductId}
          onChange={handleProductChange}
          className="w-full max-w-md border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">-- Select a product --</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} {(p.requestor_name || p.business_unit) && `[${p.requestor_name || p.business_unit}]`}
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Tasks & Labor Costs</h2>
              {!showTaskForm && (
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
                productId={selectedProductId}
                positions={positions}
                onSave={handleTaskAdded}
                onCancel={() => setShowTaskForm(false)}
              />
            )}

            {calculation.tasks.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500">No tasks assigned yet. Add tasks to calculate labor costs.</p>
              </div>
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
                      <th className="text-right py-2 font-medium text-gray-600">Est. Hours</th>
                      <th className="text-right py-2 font-medium text-gray-600">Actual Hours</th>
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
                        <td className="py-2 text-right">{task.estimated_hours}h</td>
                        <td className="py-2 text-right">
                          <ActualHoursInput task={task} onUpdate={() => loadCalculation(selectedProductId)} />
                        </td>
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-2">
                            <ProgressBar progress={task.hours_progress} status={task.hours_status} />
                            <span className={`px-1.5 py-0.5 rounded text-xs ${STATUS_COLORS[task.hours_status]}`}>
                              {task.hours_status === 'over' ? '+' + (task.hours_progress - 100).toFixed(0) + '%' : ''}
                            </span>
                          </div>
                        </td>
                        <td className="py-2 text-right text-gray-600">
                          {formatCurrencyRange(task.task_cost_min, task.task_cost_max)}
                        </td>
                        <td className="py-2 text-right font-medium">
                          {formatCurrencyRange(task.actual_cost_min || 0, task.actual_cost_max || 0)}
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

            {software.length === 0 && (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">No software costs defined yet.</p>
                <Link to="/software" className="text-indigo-600 text-sm hover:underline">
                  Manage Software Costs
                </Link>
              </div>
            )}

            {showSoftwareForm && (
              <SoftwareAllocationForm
                productId={selectedProductId}
                software={software}
                existingAllocations={calculation.software_allocations}
                onSave={handleSoftwareAdded}
                onCancel={() => setShowSoftwareForm(false)}
              />
            )}

            {calculation.software_allocations.length > 0 && (
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
                          onClick={() => handleDeleteAllocation(alloc.id)}
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
            )}
          </div>

          {calculation.department_cost_breakdown?.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Cost by Service Department</h2>
              <div className="space-y-3">
                {calculation.department_cost_breakdown.map((dept, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-36">
                      <span className={`px-2 py-0.5 text-xs rounded ${dept.role === 'lead' ? 'bg-indigo-100 text-indigo-800 font-medium' : 'bg-gray-100 text-gray-700'}`}>
                        {dept.department_name}
                      </span>
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${Math.max(dept.allocation_percent, 5)}%` }}
                      >
                        <span className="text-xs text-white font-medium">
                          {dept.allocation_percent.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-48 text-right text-sm text-gray-700">
                      {formatCurrencyRange(dept.cost_min, dept.cost_max)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Cost Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-500">Overhead (Labor + Software)</div>
                <div className="text-lg font-semibold">{formatCurrencyRange(calculation.summary.overhead_min, calculation.summary.overhead_max)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Fee ({calculation.summary.fee_percent}%)</div>
                <div className="text-lg font-semibold">{formatCurrencyRange(calculation.summary.fee_amount_min, calculation.summary.fee_amount_max)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Total with Fee</div>
                <div className="text-lg font-semibold text-indigo-600">{formatCurrencyRange(calculation.summary.total_cost_min, calculation.summary.total_cost_max)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Est. Value</div>
                <div className="text-lg font-semibold text-green-600">{formatCurrency(calculation.summary.estimated_monthly_value)}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <ResultsCard
              title="Overhead"
              value={formatCurrencyRange(calculation.summary.overhead_min, calculation.summary.overhead_max)}
              subtitle="Labor + Software"
            />
            <ResultsCard
              title="Total with Fee"
              value={formatCurrencyRange(calculation.summary.total_cost_min, calculation.summary.total_cost_max)}
              subtitle={`+${calculation.summary.fee_percent}% fee`}
              color="blue"
            />
            <ResultsCard
              title="ROI Range"
              value={
                calculation.summary.roi_percent_low !== null 
                  ? `${calculation.summary.roi_percent_low.toFixed(0)}% - ${calculation.summary.roi_percent_high?.toFixed(0) || calculation.summary.roi_percent_low.toFixed(0)}%`
                  : 'N/A'
              }
              subtitle="(Value - Cost) / Cost"
              color={
                calculation.summary.roi_percent_low >= 100 ? 'green' : 
                calculation.summary.roi_percent_low >= 50 ? 'yellow' : 
                calculation.summary.roi_percent_low !== null ? 'red' : 'gray'
              }
            />
            <ResultsCard
              title="Gain/Pain Ratio"
              value={
                calculation.summary.gain_pain_ratio_low !== null 
                  ? `${calculation.summary.gain_pain_ratio_low.toFixed(1)}x - ${calculation.summary.gain_pain_ratio_high?.toFixed(1) || calculation.summary.gain_pain_ratio_low.toFixed(1)}x`
                  : 'N/A'
              }
              subtitle="Value / Cost"
              color={
                calculation.summary.gain_pain_ratio_low >= 2 ? 'green' : 
                calculation.summary.gain_pain_ratio_low >= 1 ? 'yellow' : 
                calculation.summary.gain_pain_ratio_low !== null ? 'red' : 'gray'
              }
            />
          </div>

          <div className={`rounded-lg border-2 p-6 ${RECOMMENDATION_COLORS[calculation.recommendation.color]}`}>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">{calculation.recommendation.action}</div>
              <div className="flex-1 text-sm">{calculation.recommendation.reasoning}</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
