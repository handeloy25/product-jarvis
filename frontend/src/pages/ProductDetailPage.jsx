import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { LoadingPage } from '../components/Spinner'
import ErrorState from '../components/ErrorState'
import { useToast } from '../components/Toast'

const API_BASE = 'http://localhost:8001/api'

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

const TYPE_COLORS = {
  'Internal': 'bg-purple-100 text-purple-800',
  'External': 'bg-orange-100 text-orange-800'
}

const VALUATION_TYPE_COLORS = {
  'quick': 'bg-yellow-100 text-yellow-800',
  'full': 'bg-green-100 text-green-800'
}

const ROLE_COLORS = {
  'lead': 'bg-indigo-100 text-indigo-800',
  'supporting': 'bg-gray-100 text-gray-700'
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount)
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        active 
          ? 'border-indigo-600 text-indigo-600' 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  )
}

function OverviewTab({ product, departments }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
        <p className="text-gray-900">{product.description || 'No description provided.'}</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Requested By</h3>
          <p className="text-gray-900">
            {product.requestor_name || product.business_unit || '-'}
            {product.requestor_type && (
              <span className="text-sm text-gray-500 ml-2">
                ({product.requestor_type === 'business_unit' ? 'Business Unit' : 'Department'})
              </span>
            )}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Created</h3>
          <p className="text-gray-900">{formatDate(product.created_at)}</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">Service Departments</h3>
        {departments.length === 0 ? (
          <p className="text-gray-500">No departments assigned</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {departments.map(dept => (
              <span key={dept.id} className={`px-3 py-1 rounded-full text-sm ${ROLE_COLORS[dept.role]}`}>
                {dept.department_name}
                <span className="text-xs ml-1 opacity-75">({dept.role})</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DocumentsTab({ product }) {
  const DOC_TYPES = [
    { key: 'raw-valuation-output', label: 'Raw Valuation Output', field: 'raw_valuation_output', updatedField: 'raw_valuation_output_updated_at' },
    { key: 'user-flow', label: 'User Flow', field: 'user_flow', updatedField: 'user_flow_updated_at' },
    { key: 'specifications', label: 'Specifications', field: 'specifications', updatedField: 'specifications_updated_at' },
    { key: 'persona-feedback', label: 'Persona Feedback', field: 'persona_feedback', updatedField: 'persona_feedback_updated_at' },
  ]

  const valuationComplete = product?.valuation_complete

  return (
    <div className="space-y-4">
      {DOC_TYPES.map(doc => {
        const hasContent = product?.[doc.field]
        const updatedAt = product?.[doc.updatedField]
        const isLocked = doc.key !== 'raw-valuation-output' && !valuationComplete

        return (
          <div key={doc.key} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {hasContent ? (
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : isLocked ? (
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              <div>
                <div className="font-medium text-gray-900">{doc.label}</div>
                {hasContent && updatedAt && (
                  <div className="text-xs text-gray-500">Updated {formatDate(updatedAt)}</div>
                )}
                {isLocked && (
                  <div className="text-xs text-gray-400">Complete Raw Valuation Output first</div>
                )}
              </div>
            </div>
            {!isLocked && (
              <Link
                to={`/products/${product.id}/${doc.key}`}
                className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded"
              >
                {hasContent ? 'View' : 'Add'}
              </Link>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ValuationTab({ product }) {
  const quickInputs = product.quick_estimate_inputs ? JSON.parse(product.quick_estimate_inputs) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <span className="text-sm text-gray-500">Valuation Type:</span>
          {product.valuation_type ? (
            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${VALUATION_TYPE_COLORS[product.valuation_type]}`}>
              {product.valuation_type === 'quick' ? 'Quick Estimate' : 'Full Valuation'}
            </span>
          ) : (
            <span className="ml-2 text-gray-400">Not set</span>
          )}
        </div>
        <div>
          <span className="text-sm text-gray-500">Confidence:</span>
          <span className="ml-2 text-gray-900">{product.valuation_confidence || 'Low'}</span>
        </div>
      </div>

      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="text-sm text-gray-600">Estimated Monthly Value</div>
        <div className="text-3xl font-bold text-green-700">{formatCurrency(product.estimated_value)}</div>
        <div className="text-sm text-gray-500">{formatCurrency(product.estimated_value * 12)} annually</div>
      </div>

      {product.valuation_type === 'quick' && quickInputs && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Estimate Inputs</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            {product.product_type === 'Internal' ? (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Hours Saved/User/Week</div>
                  <div className="font-medium">{quickInputs.hours_saved_per_user_per_week}</div>
                </div>
                <div>
                  <div className="text-gray-500">Number of Users</div>
                  <div className="font-medium">{quickInputs.number_of_users}</div>
                </div>
                <div>
                  <div className="text-gray-500">Avg Hourly Cost</div>
                  <div className="font-medium">${quickInputs.average_hourly_cost}</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Total Potential Customers</div>
                  <div className="font-medium">{parseInt(quickInputs.total_potential_customers).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-500">Serviceable %</div>
                  <div className="font-medium">{quickInputs.serviceable_percent}%</div>
                </div>
                <div>
                  <div className="text-gray-500">Market Share %</div>
                  <div className="font-medium">{quickInputs.market_share_percent}%</div>
                </div>
                <div>
                  <div className="text-gray-500">Avg Deal Size</div>
                  <div className="font-medium">${parseFloat(quickInputs.average_deal_size).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-500">Gross Margin %</div>
                  <div className="font-medium">{quickInputs.gross_margin_percent}%</div>
                </div>
                <div>
                  <div className="text-gray-500">Customer Lifetime</div>
                  <div className="font-medium">{quickInputs.customer_lifetime_months} months</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {product.valuation_type === 'full' && product.raw_valuation_output && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">Full Valuation Output</h3>
          <Link
            to={`/products/${product.id}/raw-valuation-output`}
            className="text-indigo-600 hover:text-indigo-800 text-sm"
          >
            View Raw Valuation Output →
          </Link>
        </div>
      )}
    </div>
  )
}

function TasksTab({ productId }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/calculator/${productId}`)
      .then(res => res.json())
      .then(data => {
        setTasks(data.data?.tasks || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [productId])

  if (loading) {
    return <div className="text-gray-500">Loading tasks...</div>
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-gray-500 mb-2">No tasks assigned to this product</p>
        <Link to="/calculator" className="text-indigo-600 hover:text-indigo-800 text-sm">
          Go to Calculator to add tasks →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 font-medium text-gray-600">Task</th>
            <th className="text-left py-2 font-medium text-gray-600">Position</th>
            <th className="text-right py-2 font-medium text-gray-600">Est. Hours</th>
            <th className="text-right py-2 font-medium text-gray-600">Actual Hours</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id} className="border-b">
              <td className="py-2">{task.name}</td>
              <td className="py-2 text-gray-600">{task.position_title}</td>
              <td className="py-2 text-right">{task.estimated_hours}h</td>
              <td className="py-2 text-right">{task.actual_hours || 0}h</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link to="/calculator" className="text-indigo-600 hover:text-indigo-800 text-sm">
        View in Calculator →
      </Link>
    </div>
  )
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const { addToast } = useToast()

  const fetchProduct = async () => {
    setLoading(true)
    setError(null)
    try {
      const [prodRes, deptRes] = await Promise.all([
        fetch(`${API_BASE}/products/${id}`),
        fetch(`${API_BASE}/products/${id}/departments`)
      ])
      
      if (!prodRes.ok) {
        throw new Error('Product not found')
      }
      
      const [prodData, deptData] = await Promise.all([prodRes.json(), deptRes.json()])
      setProduct(prodData.data)
      setDepartments(deptData.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProduct()
  }, [id])

  if (loading) return <LoadingPage />

  if (error) {
    return (
      <div>
        <button onClick={() => navigate('/products')} className="mb-4 text-indigo-600 hover:text-indigo-800 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Products
        </button>
        <ErrorState message={error} onRetry={fetchProduct} />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <button onClick={() => navigate('/products')} className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm mb-2">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Products
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[product.status]}`}>
                {product.status}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${TYPE_COLORS[product.product_type]}`}>
                {product.product_type}
              </span>
              {product.valuation_type && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${VALUATION_TYPE_COLORS[product.valuation_type]}`}>
                  {product.valuation_type === 'quick' ? 'Quick' : 'Full'}
                </span>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500">Est. Value/Mo</div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(product.estimated_value)}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex px-4">
            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
              Overview
            </TabButton>
            <TabButton active={activeTab === 'documents'} onClick={() => setActiveTab('documents')}>
              Documents
            </TabButton>
            <TabButton active={activeTab === 'valuation'} onClick={() => setActiveTab('valuation')}>
              Valuation
            </TabButton>
            <TabButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')}>
              Tasks
            </TabButton>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && <OverviewTab product={product} departments={departments} />}
          {activeTab === 'documents' && <DocumentsTab product={product} />}
          {activeTab === 'valuation' && <ValuationTab product={product} />}
          {activeTab === 'tasks' && <TasksTab productId={product.id} />}
        </div>
      </div>
    </div>
  )
}
