import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { LoadingPage } from '../components/Spinner'
import ErrorState from '../components/ErrorState'
import { useToast } from '../components/Toast'
import ScrollableTable from '../components/ScrollableTable'

const API_BASE = 'http://localhost:8001/api'

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

function SummaryCard({ title, value, subtitle, color = 'indigo' }) {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className={`text-2xl font-bold mt-1 ${colorClasses[color]?.split(' ')[1] || 'text-gray-900'}`}>
        {value}
      </p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  )
}

function ApprovalModal({ product, onApprove, onReject, onCancel }) {
  const [approverName, setApproverName] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [isRejecting, setIsRejecting] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAction = async (action) => {
    if (!approverName.trim()) return
    setLoading(true)
    if (action === 'approve') {
      await onApprove(approverName)
    } else {
      await onReject(approverName, rejectionReason)
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-2">
          {isRejecting ? 'Reject' : 'Approve'} Product
        </h2>
        <p className="text-gray-600 mb-4">
          <strong>{product.name}</strong>
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input
              type="text"
              value={approverName}
              onChange={(e) => setApproverName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your name"
            />
          </div>

          {isRejecting && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={2}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                placeholder="Why are you rejecting this product?"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            Cancel
          </button>
          {!isRejecting ? (
            <>
              <button
                onClick={() => setIsRejecting(true)}
                disabled={loading}
                className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50"
              >
                Reject Instead
              </button>
              <button
                onClick={() => handleAction('approve')}
                disabled={loading || !approverName.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
                Approve
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsRejecting(false)}
                disabled={loading}
                className="px-4 py-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 disabled:opacity-50"
              >
                Approve Instead
              </button>
              <button
                onClick={() => handleAction('reject')}
                disabled={loading || !approverName.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
                Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BUDashboardPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [approvingProduct, setApprovingProduct] = useState(null)
  const { addToast } = useToast()

  const fetchDashboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/business-units/${id}/dashboard`)
      const result = await res.json()
      if (!res.ok) throw new Error(result.detail || 'Failed to load dashboard')
      if (result.success) setData(result.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [id])

  const handleApprove = async (approverName) => {
    try {
      const res = await fetch(`${API_BASE}/products/${approvingProduct.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved_by: approverName })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Failed to approve')
      }
      addToast('Product approved', 'success')
      setApprovingProduct(null)
      fetchDashboard()
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const handleReject = async (rejectedBy, reason) => {
    try {
      const res = await fetch(`${API_BASE}/products/${approvingProduct.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejected_by: rejectedBy, reason })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Failed to reject')
      }
      addToast('Product rejected', 'success')
      setApprovingProduct(null)
      fetchDashboard()
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  if (loading) return <LoadingPage />

  if (error) {
    return (
      <div>
        <button onClick={() => navigate('/business-units')} className="text-indigo-600 hover:text-indigo-800 mb-4">
          &larr; Back to Business Units
        </button>
        <ErrorState message={error} onRetry={fetchDashboard} />
      </div>
    )
  }

  if (!data) return null

  const { business_unit, summary, products, services, pending_approvals } = data

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={() => navigate('/business-units')} className="text-indigo-600 hover:text-indigo-800 text-sm mb-2">
            &larr; Back to Business Units
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{business_unit.name} Dashboard</h1>
          {business_unit.description && (
            <p className="text-gray-500 mt-1">{business_unit.description}</p>
          )}
        </div>
        {business_unit.head_position_title && (
          <div className="text-right">
            <p className="text-sm text-gray-500">BU Head</p>
            <p className="font-medium">{business_unit.head_position_title}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          title="Products"
          value={summary.products_count}
          subtitle={`${summary.products_in_development} in development`}
          color="indigo"
        />
        <SummaryCard
          title="Services"
          value={summary.services_count}
          color="blue"
        />
        <SummaryCard
          title="Total Cost Range"
          value={`${formatCurrency(summary.total_cost_min)} - ${formatCurrency(summary.total_cost_max)}`}
          color="green"
        />
        <SummaryCard
          title="Pending Approvals"
          value={summary.pending_approvals}
          color={summary.pending_approvals > 0 ? 'amber' : 'green'}
        />
      </div>

      {pending_approvals.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Approvals</h2>
          <div className="bg-amber-50 border border-amber-200 rounded-lg overflow-hidden">
            <ScrollableTable>
              <table className="min-w-full divide-y divide-amber-200">
                <thead className="bg-amber-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase">Est. Cost</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-amber-800 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-amber-50 divide-y divide-amber-200">
                  {pending_approvals.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4">
                        <Link to={`/products/${product.id}`} className="font-medium text-amber-900 hover:text-amber-700">
                          {product.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-amber-800">{product.status}</td>
                      <td className="px-6 py-4 text-amber-800">{product.product_type}</td>
                      <td className="px-6 py-4 text-amber-800">
                        {formatCurrency(product.cost_min)} - {formatCurrency(product.cost_max)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setApprovingProduct(product)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 mr-2"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setApprovingProduct(product)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollableTable>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Products Requested</h2>
        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No products requested by this business unit yet.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <ScrollableTable>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">BU Approval</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. Cost</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link to={`/products/${product.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                          {product.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          product.status === 'In Development' ? 'bg-blue-100 text-blue-800' :
                          product.status === 'Ideation' ? 'bg-gray-100 text-gray-800' :
                          product.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                          product.status === 'Backlog' ? 'bg-amber-100 text-amber-800' :
                          product.status === 'Kill' ? 'bg-red-200 text-red-900' :
                          product.status === 'Live' ? 'bg-green-100 text-green-800' :
                          product.status === 'Deprecated' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{product.product_type}</td>
                      <td className="px-6 py-4">
                        {product.bu_approval_status ? (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            product.bu_approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                            product.bu_approval_status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {product.bu_approval_status}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatCurrency(product.cost_min)} - {formatCurrency(product.cost_max)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollableTable>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Services Received</h2>
        {services.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No services provided to this business unit yet.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <ScrollableTable>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost (incl. fees)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {services.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{service.name}</td>
                      <td className="px-6 py-4 text-gray-600">{service.department_name}</td>
                      <td className="px-6 py-4 text-gray-600">{service.service_type_name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          service.status === 'Active' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {service.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatCurrency(service.cost_min)} - {formatCurrency(service.cost_max)}
                        {service.fee_percent > 0 && (
                          <span className="text-xs text-gray-400 ml-1">({service.fee_percent}% fee)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollableTable>
          </div>
        )}
      </div>

      {approvingProduct && (
        <ApprovalModal
          product={approvingProduct}
          onApprove={handleApprove}
          onReject={handleReject}
          onCancel={() => setApprovingProduct(null)}
        />
      )}
    </div>
  )
}
