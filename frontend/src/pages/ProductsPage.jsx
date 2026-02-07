import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LoadingPage } from '../components/Spinner'
import ErrorState from '../components/ErrorState'
import { useToast } from '../components/Toast'
import ScrollableTable from '../components/ScrollableTable'
import ProductCreationWizard from '../components/ProductCreationWizard'
import { useRole } from '../contexts/RoleContext'

const API_BASE = 'http://localhost:8001/api'

const STATUS_OPTIONS = ['Draft', 'Ideation', 'Approved', 'Backlog', 'Kill', 'In Development', 'Live', 'Deprecated']
const TYPE_OPTIONS = ['Internal', 'External']
const ROLE_OPTIONS = ['lead', 'supporting']
const RACI_OPTIONS = ['Responsible', 'Accountable', 'Consulted', 'Informed']

const STATUS_COLORS = {
  'Draft': 'bg-gray-100 text-gray-600',
  'Ideation': 'bg-gray-100 text-gray-800',
  'Approved': 'bg-emerald-100 text-emerald-800',
  'Backlog': 'bg-amber-100 text-amber-800',
  'Kill': 'bg-red-200 text-red-900',
  'In Development': 'bg-blue-100 text-blue-800',
  'Live': 'bg-green-100 text-green-800',
  'Deprecated': 'bg-red-100 text-red-800'
}

const VALUATION_TYPE_COLORS = {
  'quick': 'bg-yellow-100 text-yellow-800',
  'full': 'bg-green-100 text-green-800'
}

const TYPE_COLORS = {
  'Internal': 'bg-purple-100 text-purple-800',
  'External': 'bg-orange-100 text-orange-800'
}

const ROLE_COLORS = {
  'lead': 'bg-indigo-100 text-indigo-800',
  'supporting': 'bg-gray-100 text-gray-700'
}

const RACI_COLORS = {
  'Responsible': 'bg-blue-100 text-blue-800',
  'Accountable': 'bg-green-100 text-green-800',
  'Consulted': 'bg-yellow-100 text-yellow-800',
  'Informed': 'bg-gray-100 text-gray-700'
}

function StatusBadge({ status }) {
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[status]}`}>
      {status}
    </span>
  )
}

function TypeBadge({ type }) {
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${TYPE_COLORS[type]}`}>
      {type}
    </span>
  )
}

function ValuationTypeBadge({ valuationType }) {
  if (!valuationType) return <span className="text-gray-400">-</span>
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${VALUATION_TYPE_COLORS[valuationType]}`}>
      {valuationType === 'quick' ? 'Quick' : 'Full'}
    </span>
  )
}

function DocStatusIcon({ product, docType, label }) {
  const contentMap = {
    'raw-valuation-output': product.raw_valuation_output,
    'user-flow': product.user_flow,
    'specifications': product.specifications,
    'persona-feedback': product.persona_feedback
  }
  const hasContent = contentMap[docType]
  const isLocked = !product.valuation_complete && docType !== 'raw-valuation-output'
  
  if (isLocked) {
    return (
      <span className="text-gray-400" title="Complete Raw Valuation Output first">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </span>
    )
  }
  
  if (hasContent) {
    return (
      <Link to={`/products/${product.id}/${docType}`} className="text-green-600 hover:text-green-700" title={`View ${label}`}>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      </Link>
    )
  }
  
  return (
    <Link to={`/products/${product.id}/${docType}`} className="text-gray-400 hover:text-gray-600" title={`Add ${label}`}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </Link>
  )
}

function DocsCountBadge({ product }) {
  const docs = [
    product.raw_valuation_output,
    product.user_flow,
    product.specifications,
    product.persona_feedback
  ]
  const completed = docs.filter(Boolean).length
  
  if (completed === 0) return <span className="text-gray-400 text-xs">0/4</span>
  if (completed === 4) {
    return (
      <span className="px-1.5 py-0.5 text-xs rounded bg-green-100 text-green-700 font-medium" title="All documents complete">
        4/4
      </span>
    )
  }
  return (
    <span className="px-1.5 py-0.5 text-xs rounded bg-yellow-100 text-yellow-700 font-medium" title={`${completed} of 4 documents complete`}>
      {completed}/4
    </span>
  )
}

function DepartmentAssignmentRow({ assignment, departments, onUpdate, onRemove, isOnly }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    role: assignment.role,
    raci: assignment.raci,
    allocation_percent: assignment.allocation_percent || ''
  })

  const handleSave = () => {
    onUpdate(assignment.id, {
      role: form.role,
      raci: form.raci,
      allocation_percent: form.allocation_percent ? parseFloat(form.allocation_percent) : null
    })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
        <span className="font-medium text-sm w-32 truncate">{assignment.department_name}</span>
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="border rounded px-2 py-1 text-sm"
        >
          {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          value={form.raci}
          onChange={(e) => setForm({ ...form, raci: e.target.value })}
          className="border rounded px-2 py-1 text-sm"
        >
          {RACI_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <input
          type="number"
          value={form.allocation_percent}
          onChange={(e) => setForm({ ...form, allocation_percent: e.target.value })}
          className="border rounded px-2 py-1 text-sm w-16"
          placeholder="%"
          min="0"
          max="100"
        />
        <button onClick={handleSave} className="text-green-600 text-sm">Save</button>
        <button onClick={() => setEditing(false)} className="text-gray-500 text-sm">Cancel</button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 p-2 border-b last:border-b-0">
      <span className="font-medium text-sm flex-1">{assignment.department_name}</span>
      <span className={`px-2 py-0.5 text-xs rounded ${ROLE_COLORS[assignment.role]}`}>
        {assignment.role}
      </span>
      <span className={`px-2 py-0.5 text-xs rounded ${RACI_COLORS[assignment.raci]}`}>
        {assignment.raci}
      </span>
      {assignment.allocation_percent && (
        <span className="text-xs text-gray-500">{assignment.allocation_percent}%</span>
      )}
      <button onClick={() => setEditing(true)} className="text-indigo-600 text-xs">Edit</button>
      {!(assignment.role === 'lead' && !isOnly) && (
        <button onClick={() => onRemove(assignment.id)} className="text-red-600 text-xs">Remove</button>
      )}
    </div>
  )
}

function DepartmentManager({ productId, onUpdate }) {
  const [departments, setDepartments] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newDept, setNewDept] = useState({ department_id: '', role: 'supporting', raci: 'Responsible', allocation_percent: '' })
  const { addToast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    try {
      const [deptRes, assignRes] = await Promise.all([
        fetch(`${API_BASE}/service-departments`),
        fetch(`${API_BASE}/products/${productId}/departments`)
      ])
      const [deptData, assignData] = await Promise.all([deptRes.json(), assignRes.json()])
      setDepartments(deptData.data || [])
      setAssignments(assignData.data || [])
      if (onUpdate) onUpdate(assignData.data || [])
    } catch (err) {
      addToast('Failed to load departments', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (productId) fetchData()
  }, [productId])

  const handleAdd = async () => {
    if (!newDept.department_id) return
    try {
      const res = await fetch(`${API_BASE}/products/${productId}/departments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department_id: parseInt(newDept.department_id),
          role: newDept.role,
          raci: newDept.raci,
          allocation_percent: newDept.allocation_percent ? parseFloat(newDept.allocation_percent) : null
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to add')
      addToast('Department added', 'success')
      setShowAdd(false)
      setNewDept({ department_id: '', role: 'supporting', raci: 'Responsible', allocation_percent: '' })
      fetchData()
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const handleUpdate = async (assignmentId, updates) => {
    try {
      const res = await fetch(`${API_BASE}/products/${productId}/departments/${assignmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to update')
      addToast('Updated', 'success')
      fetchData()
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const handleRemove = async (assignmentId) => {
    try {
      const res = await fetch(`${API_BASE}/products/${productId}/departments/${assignmentId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to remove')
      addToast('Removed', 'success')
      fetchData()
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const availableDepts = departments.filter(d => !assignments.find(a => a.department_id === d.id))
  const hasLead = assignments.some(a => a.role === 'lead')

  if (loading) return <div className="text-sm text-gray-500">Loading...</div>

  return (
    <div className="border rounded-lg">
      <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
        <span className="font-medium text-sm">Service Departments</span>
        {availableDepts.length > 0 && (
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="text-indigo-600 text-sm hover:underline"
          >
            + Add Department
          </button>
        )}
      </div>

      {showAdd && (
        <div className="p-3 bg-blue-50 border-b">
          <div className="flex flex-wrap gap-2 items-end">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Department</label>
              <select
                value={newDept.department_id}
                onChange={(e) => setNewDept({ ...newDept, department_id: e.target.value })}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="">Select...</option>
                {availableDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Role</label>
              <select
                value={newDept.role}
                onChange={(e) => setNewDept({ ...newDept, role: e.target.value })}
                className="border rounded px-2 py-1 text-sm"
                disabled={!hasLead && assignments.length === 0}
              >
                {(!hasLead && assignments.length === 0) ? (
                  <option value="lead">lead (required first)</option>
                ) : (
                  ROLE_OPTIONS.map(r => <option key={r} value={r} disabled={r === 'lead' && hasLead}>{r}</option>)
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">RACI</label>
              <select
                value={newDept.raci}
                onChange={(e) => setNewDept({ ...newDept, raci: e.target.value })}
                className="border rounded px-2 py-1 text-sm"
              >
                {RACI_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Allocation %</label>
              <input
                type="number"
                value={newDept.allocation_percent}
                onChange={(e) => setNewDept({ ...newDept, allocation_percent: e.target.value })}
                className="border rounded px-2 py-1 text-sm w-16"
                placeholder="Auto"
                min="0"
                max="100"
              />
            </div>
            <button
              onClick={handleAdd}
              className="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
            >
              Add
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm"
            >
              Cancel
            </button>
          </div>
          {!hasLead && assignments.length === 0 && (
            <p className="text-xs text-blue-700 mt-2">First department must be the lead.</p>
          )}
        </div>
      )}

      <div className="max-h-48 overflow-y-auto">
        {assignments.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No departments assigned yet. Add a lead department first.
          </div>
        ) : (
          assignments.map(a => (
            <DepartmentAssignmentRow
              key={a.id}
              assignment={a}
              departments={departments}
              onUpdate={handleUpdate}
              onRemove={handleRemove}
              isOnly={assignments.length === 1}
            />
          ))
        )}
      </div>
    </div>
  )
}

function DocumentsManager({ product }) {
  const DOC_TYPES = [
    { key: 'raw-valuation-output', label: 'Raw Valuation Output', field: 'raw_valuation_output', required: true },
    { key: 'user-flow', label: 'User Flow', field: 'user_flow' },
    { key: 'specifications', label: 'Specifications', field: 'specifications' },
    { key: 'persona-feedback', label: 'Persona Feedback', field: 'persona_feedback' },
  ]

  const valuationComplete = product?.valuation_complete

  return (
    <div className="border rounded-lg">
      <div className="p-3 bg-gray-50 border-b">
        <span className="font-medium text-sm">Product Documents</span>
      </div>
      <div className="divide-y">
        {DOC_TYPES.map(doc => {
          const hasContent = product?.[doc.field]
          const isLocked = !doc.required && !valuationComplete
          
          return (
            <div key={doc.key} className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {hasContent ? (
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : isLocked ? (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                <span className="text-sm text-gray-700">{doc.label}</span>
                {doc.required && !hasContent && (
                  <span className="text-xs text-orange-600">(required first)</span>
                )}
              </div>
              {isLocked ? (
                <span className="text-xs text-gray-400">Complete Raw Valuation first</span>
              ) : (
                <Link
                  to={`/products/${product.id}/${doc.key}`}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  {hasContent ? 'Edit' : 'Add'}
                </Link>
              )}
            </div>
          )
        })}
      </div>
      {!valuationComplete && (
        <div className="p-3 bg-yellow-50 border-t text-xs text-yellow-700">
          Complete the Raw Valuation Output to unlock other documents
        </div>
      )}
    </div>
  )
}

function ProductForm({ product, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    business_unit: product?.business_unit || '',
    requestor_type: product?.requestor_type || 'business_unit',
    requestor_id: product?.requestor_id || '',
    status: product?.status || 'Ideation',
    product_type: product?.product_type || 'Internal',
    estimated_value: product?.estimated_value || ''
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [createdProductId, setCreatedProductId] = useState(null)
  const [serviceDepartments, setServiceDepartments] = useState([])
  const { addToast } = useToast()

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        business_unit: product.business_unit || '',
        requestor_type: product.requestor_type || 'business_unit',
        requestor_id: product.requestor_id || '',
        status: product.status || 'Ideation',
        product_type: product.product_type || 'Internal',
        estimated_value: product.estimated_value || ''
      })
    }
  }, [product])

  useEffect(() => {
    fetch(`${API_BASE}/service-departments`)
      .then(res => res.json())
      .then(data => setServiceDepartments(data.data || []))
      .catch(() => {})
  }, [])

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (form.estimated_value && parseFloat(form.estimated_value) < 0) {
      newErrors.estimated_value = 'Value cannot be negative'
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
      description: form.description.trim(),
      business_unit: form.requestor_type === 'business_unit' ? form.business_unit.trim() || null : null,
      requestor_type: form.requestor_type,
      requestor_id: form.requestor_type === 'service_department' ? parseInt(form.requestor_id) || null : null,
      status: form.status,
      product_type: form.product_type,
      estimated_value: parseFloat(form.estimated_value) || 0
    }

    try {
      const url = product 
        ? `${API_BASE}/products/${product.id}`
        : `${API_BASE}/products`
      const method = product ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Failed to save')
      }
      
      const data = await res.json()
      
      if (!product) {
        setCreatedProductId(data.data.id)
        addToast('Product created! Now assign service departments below.', 'success')
      } else {
        addToast('Product updated', 'success')
        onSave()
      }
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = (field) => `w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors[field] ? 'border-red-500' : ''}`

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto py-8">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 my-auto max-h-[calc(100vh-4rem)] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {product ? 'Edit Product' : createdProductId ? 'Assign Departments' : 'Add Product'}
        </h2>
        
        {product ? (
          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requested By</label>
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="requestor_type_edit"
                      value="business_unit"
                      checked={form.requestor_type === 'business_unit'}
                      onChange={(e) => setForm({ ...form, requestor_type: e.target.value, requestor_id: '' })}
                      className="mr-2"
                    />
                    <span className="text-sm">Business Unit</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="requestor_type_edit"
                      value="service_department"
                      checked={form.requestor_type === 'service_department'}
                      onChange={(e) => setForm({ ...form, requestor_type: e.target.value, business_unit: '' })}
                      className="mr-2"
                    />
                    <span className="text-sm">Service Department</span>
                  </label>
                </div>
                {form.requestor_type === 'business_unit' ? (
                  <input
                    type="text"
                    value={form.business_unit}
                    onChange={(e) => setForm({ ...form, business_unit: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Lines.com, HighRoller.com, Refills.com"
                  />
                ) : (
                  <select
                    value={form.requestor_id}
                    onChange={(e) => setForm({ ...form, requestor_id: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select department...</option>
                    {serviceDepartments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputClass('name')}
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
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={form.product_type}
                    onChange={(e) => setForm({ ...form, product_type: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {TYPE_OPTIONS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Est. Value/Mo</label>
                  <div className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-700">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product?.estimated_value || 0)}
                    {product?.valuation_type && (
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${product.valuation_type === 'quick' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {product.valuation_type === 'quick' ? 'Quick' : 'Full'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Value is set during product creation</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 flex items-center text-sm"
              >
                {saving && <span className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2" />}
                Update Product Info
              </button>
            </form>

            <DepartmentManager productId={product.id} />

            <DocumentsManager product={product} />

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Done
              </button>
            </div>
          </div>
        ) : createdProductId ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                <strong>{form.name}</strong> created! Now assign which service departments will work on this product.
              </p>
            </div>
            
            <DepartmentManager productId={createdProductId} />
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={onSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requested By</label>
              <div className="flex gap-4 mb-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="requestor_type"
                    value="business_unit"
                    checked={form.requestor_type === 'business_unit'}
                    onChange={(e) => setForm({ ...form, requestor_type: e.target.value, requestor_id: '' })}
                    className="mr-2"
                  />
                  <span className="text-sm">Business Unit (Brand)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="requestor_type"
                    value="service_department"
                    checked={form.requestor_type === 'service_department'}
                    onChange={(e) => setForm({ ...form, requestor_type: e.target.value, business_unit: '' })}
                    className="mr-2"
                  />
                  <span className="text-sm">Service Department</span>
                </label>
              </div>
              {form.requestor_type === 'business_unit' ? (
                <input
                  type="text"
                  value={form.business_unit}
                  onChange={(e) => setForm({ ...form, business_unit: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Lines.com, HighRoller.com, Refills.com"
                />
              ) : (
                <select
                  value={form.requestor_id}
                  onChange={(e) => setForm({ ...form, requestor_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select department...</option>
                  {serviceDepartments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {form.requestor_type === 'business_unit'
                  ? 'Which brand/business is requesting this product?'
                  : 'Which department needs this product for their work?'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass('name')}
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
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={form.product_type}
                  onChange={(e) => setForm({ ...form, product_type: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {TYPE_OPTIONS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Est. Value/Mo ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.estimated_value}
                  onChange={(e) => setForm({ ...form, estimated_value: e.target.value })}
                  className={inputClass('estimated_value')}
                  placeholder="0.00"
                />
                {errors.estimated_value && <p className="text-red-500 text-xs mt-1">{errors.estimated_value}</p>}
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
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"
              >
                {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
                Create & Continue
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function DeleteConfirm({ product, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
        <h2 className="text-xl font-bold mb-2">Delete Product</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{product.name}</strong>? This will also delete all associated tasks and department assignments.
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

function DepartmentsBadge({ productId }) {
  const [depts, setDepts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    
    fetch(`${API_BASE}/products/${productId}/departments`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        setDepts(data.data || [])
        setLoading(false)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(true)
          setLoading(false)
        }
      })
    
    return () => controller.abort()
  }, [productId])

  if (loading) return <span className="text-gray-400 text-sm">...</span>
  if (error) return <span className="text-red-400 text-xs" title="Failed to load departments">!</span>
  if (depts.length === 0) return <span className="text-gray-400">-</span>

  const lead = depts.find(d => d.role === 'lead')
  const supporting = depts.filter(d => d.role === 'supporting')

  if (!lead && supporting.length === 0) return <span className="text-gray-400">-</span>

  return (
    <div className="flex items-center gap-1">
      {lead ? (
        <span className="px-2 py-0.5 text-xs rounded bg-indigo-100 text-indigo-800 font-medium truncate max-w-[100px] sm:max-w-[120px]" title={lead.department_name}>
          {lead.department_name}
        </span>
      ) : (
        <span className="text-xs text-gray-400 italic">No lead</span>
      )}
      {supporting.length > 0 && (
        <span className="text-xs text-gray-500 whitespace-nowrap" title={supporting.map(s => s.department_name).join(', ')}>
          +{supporting.length}
        </span>
      )}
    </div>
  )
}

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deletingProduct, setDeletingProduct] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [departmentName, setDepartmentName] = useState('')
  const [buName, setBuName] = useState('')
  const { addToast } = useToast()
  const navigate = useNavigate()
  const { hasFullAccess, isDepartmentHead, isBUHead, selectedDepartmentId, selectedBusinessUnitId } = useRole()

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/products`)
      const data = await res.json()
      if (data.success) {
        setProducts(data.data)
      }

      if (isDepartmentHead && selectedDepartmentId) {
        const deptRes = await fetch(`${API_BASE}/service-departments`)
        const deptData = await deptRes.json()
        if (deptData.success) {
          const dept = deptData.data.find(d => d.id === selectedDepartmentId)
          setDepartmentName(dept?.name || '')
        }
      }

      if (isBUHead && selectedBusinessUnitId) {
        const buRes = await fetch(`${API_BASE}/business-units/${selectedBusinessUnitId}`)
        const buData = await buRes.json()
        if (buData.success) {
          setBuName(buData.data.name || '')
        }
      }
    } catch (err) {
      setError('Failed to load products. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [selectedDepartmentId, selectedBusinessUnitId, isDepartmentHead, isBUHead])

  const getFilteredProducts = () => {
    let filtered = products

    if (isDepartmentHead && selectedDepartmentId && departmentName) {
      filtered = filtered.filter(p => p.service_departments?.some(sd => sd.name === departmentName))
    }

    if (isBUHead && selectedBusinessUnitId) {
      filtered = filtered.filter(p => p.requestor_business_unit_id === selectedBusinessUnitId)
    }

    return filtered
  }

  const filteredProducts = getFilteredProducts()

  const handleSave = () => {
    setShowForm(false)
    setEditingProduct(null)
    fetchProducts()
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      const res = await fetch(`${API_BASE}/products/${deletingProduct.id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete')
      addToast('Product deleted', 'success')
      setDeletingProduct(null)
      fetchProducts()
    } catch (err) {
      addToast('Failed to delete product', 'error')
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

  const getPageTitle = () => {
    if (isDepartmentHead && departmentName) {
      return `${departmentName} Products`
    }
    if (isBUHead && buName) {
      return `${buName} Products`
    }
    return 'Products'
  }

  const showSelectPrompt = (isDepartmentHead && !selectedDepartmentId) || (isBUHead && !selectedBusinessUnitId)

  if (loading) return <LoadingPage />

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Products</h1>
        <ErrorState message={error} onRetry={fetchProducts} />
      </div>
    )
  }

  if (showSelectPrompt) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Products</h1>
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
        {hasFullAccess && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-gray-500 mb-4">No products yet. Add your first product to get started.</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Add Product
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <ScrollableTable>
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Depts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valuation
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" title="Documents: Raw Output, Flow, Specs, Persona">
                  Docs
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Est. Value/Mo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{prod.name}</div>
                    {prod.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">{prod.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    <div className="flex flex-col">
                      <span>{prod.requestor_name || prod.business_unit || <span className="text-gray-400">-</span>}</span>
                      {prod.requestor_type && (
                        <span className="text-xs text-gray-400">
                          {prod.requestor_type === 'business_unit' ? 'Business Unit' : 'Department'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <DepartmentsBadge productId={prod.id} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={prod.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <TypeBadge type={prod.product_type} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <ValuationTypeBadge valuationType={prod.valuation_type} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <DocsCountBadge product={prod} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 font-medium">
                    {formatCurrency(prod.estimated_value)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => navigate(`/valuation?product=${prod.id}`)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="View Valuation"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setEditingProduct(prod)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeletingProduct(prod)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </ScrollableTable>
        </div>
      )}

      {showForm && (
        <ProductCreationWizard
          onComplete={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingProduct && (
        <ProductForm
          product={editingProduct}
          onSave={handleSave}
          onCancel={() => setEditingProduct(null)}
        />
      )}

      {deletingProduct && (
        <DeleteConfirm
          product={deletingProduct}
          onConfirm={handleDelete}
          onCancel={() => setDeletingProduct(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  )
}
