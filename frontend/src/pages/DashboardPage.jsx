import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LoadingPage } from '../components/Spinner'
import ErrorState from '../components/ErrorState'
import ScrollableTable from '../components/ScrollableTable'
import { useRole } from '../contexts/RoleContext'

const API_BASE = 'http://localhost:8001/api'

const CONFIDENCE_COLORS = {
  'High': 'bg-green-100 text-green-800',
  'Medium': 'bg-yellow-100 text-yellow-800',
  'Low': 'bg-orange-100 text-orange-800',
  'Speculative': 'bg-red-100 text-red-800'
}

const HEALTH_COLORS = {
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  orange: 'bg-orange-100 text-orange-800',
  red: 'bg-red-100 text-red-800',
  gray: 'bg-gray-100 text-gray-600'
}

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

const HOURS_STATUS_COLORS = {
  not_started: 'bg-gray-100 text-gray-600',
  under: 'bg-blue-100 text-blue-700',
  on_track: 'bg-green-100 text-green-700',
  over: 'bg-red-100 text-red-700'
}

const HOURS_STATUS_LABELS = {
  not_started: 'Not Started',
  under: 'Under',
  on_track: 'On Track',
  over: 'Over'
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

function HealthBadge({ health, recommendation }) {
  return (
    <span className={`px-2 py-1 text-xs font-bold rounded ${HEALTH_COLORS[health]}`}>
      {recommendation}
    </span>
  )
}

function StatusBadge({ status }) {
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[status]}`}>
      {status}
    </span>
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

const STATUS_CHART_COLORS = {
  'Draft': '#9CA3AF',
  'Ideation': '#6B7280',
  'Approved': '#10B981',
  'Backlog': '#F59E0B',
  'Kill': '#DC2626',
  'In Development': '#3B82F6',
  'Live': '#059669',
  'Deprecated': '#EF4444'
}

function StatusDonutChart({ products }) {
  const statusCounts = products.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {})

  const total = products.length
  if (total === 0) {
    return <p className="text-gray-400 text-sm">No products</p>
  }

  const statuses = Object.keys(STATUS_CHART_COLORS)
  let cumulativePercent = 0

  const segments = statuses
    .filter(status => statusCounts[status])
    .map(status => {
      const count = statusCounts[status]
      const percent = (count / total) * 100
      const startPercent = cumulativePercent
      cumulativePercent += percent
      return { status, count, percent, startPercent }
    })

  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * (percent / 100 - 0.25))
    const y = Math.sin(2 * Math.PI * (percent / 100 - 0.25))
    return [x, y]
  }

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-32 h-32">
        {segments.map((seg, i) => {
          const [startX, startY] = getCoordinatesForPercent(seg.startPercent)
          const [endX, endY] = getCoordinatesForPercent(seg.startPercent + seg.percent)
          const largeArcFlag = seg.percent > 50 ? 1 : 0

          const pathData = [
            `M ${startX} ${startY}`,
            `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            'L 0 0'
          ].join(' ')

          return (
            <path
              key={seg.status}
              d={pathData}
              fill={STATUS_CHART_COLORS[seg.status]}
              stroke="white"
              strokeWidth="0.02"
            />
          )
        })}
        <circle cx="0" cy="0" r="0.6" fill="white" />
        <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" className="text-xs font-bold fill-gray-700" style={{ fontSize: '0.35px' }}>
          {total}
        </text>
        <text x="0" y="0.25" textAnchor="middle" dominantBaseline="middle" className="fill-gray-400" style={{ fontSize: '0.15px' }}>
          products
        </text>
      </svg>
      <div className="space-y-2">
        {statuses.filter(s => statusCounts[s]).map(status => (
          <div key={status} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_CHART_COLORS[status] }} />
            <span className="text-gray-700">{status}</span>
            <span className="text-gray-500 font-medium">{statusCounts[status]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const HEALTH_CHART_COLORS = {
  green: { bg: '#10B981', label: 'Healthy' },
  yellow: { bg: '#FBBF24', label: 'Watch' },
  orange: { bg: '#F97316', label: 'At Risk' },
  red: { bg: '#EF4444', label: 'Critical' },
  gray: { bg: '#9CA3AF', label: 'Unknown' }
}

function HealthBarChart({ products }) {
  const healthCounts = products.reduce((acc, p) => {
    acc[p.health] = (acc[p.health] || 0) + 1
    return acc
  }, {})

  const total = products.length
  if (total === 0) {
    return <p className="text-gray-400 text-sm">No products</p>
  }

  const healthKeys = ['green', 'yellow', 'orange', 'red', 'gray'].filter(h => healthCounts[h])

  return (
    <div className="space-y-4">
      <div className="flex h-8 rounded-lg overflow-hidden">
        {healthKeys.map(health => {
          const percent = (healthCounts[health] / total) * 100
          return (
            <div
              key={health}
              style={{ width: `${percent}%`, backgroundColor: HEALTH_CHART_COLORS[health].bg }}
              className="flex items-center justify-center text-white text-xs font-medium"
              title={`${HEALTH_CHART_COLORS[health].label}: ${healthCounts[health]} (${percent.toFixed(0)}%)`}
            >
              {percent >= 10 && healthCounts[health]}
            </div>
          )
        })}
      </div>
      <div className="flex flex-wrap gap-4">
        {healthKeys.map(health => (
          <div key={health} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: HEALTH_CHART_COLORS[health].bg }} />
            <span className="text-gray-600">{HEALTH_CHART_COLORS[health].label}</span>
            <span className="text-gray-500 font-medium">{healthCounts[health]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { hasFullAccess, isDepartmentHead, isBUHead, selectedDepartmentId, selectedBusinessUnitId } = useRole()
  const [dashboard, setDashboard] = useState(null)
  const [portfolio, setPortfolio] = useState([])
  const [departmentName, setDepartmentName] = useState('')
  const [buName, setBuName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortField, setSortField] = useState('roi_low')
  const [sortDir, setSortDir] = useState('desc')
  const [activeTab, setActiveTab] = useState('health')
  const [requestorFilter, setRequestorFilter] = useState('')
  const [serviceDeptFilter, setServiceDeptFilter] = useState('')

  const fetchDashboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const [dashRes, portfolioRes] = await Promise.all([
        fetch(`${API_BASE}/dashboard`),
        fetch(`${API_BASE}/valuations/portfolio`)
      ])
      const dashData = await dashRes.json()
      const portfolioData = await portfolioRes.json()
      if (dashData.success) {
        setDashboard(dashData.data)
      }
      if (portfolioData.success) {
        setPortfolio(portfolioData.data)
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
      setError('Failed to load dashboard. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [selectedDepartmentId, selectedBusinessUnitId, isDepartmentHead, isBUHead])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const exportPortfolioCSV = (data) => {
    const headers = ['Product', 'Type', 'Status', 'Value Low', 'Value High', 'RICE Score', 'Strategic Multiplier', 'Confidence', 'Valuation Date']
    const rows = data.map(p => [
      p.product_name,
      p.product_type,
      p.product_status,
      p.final_value_low || '',
      p.final_value_high || '',
      p.rice_score?.toFixed(2) || '',
      p.strategic_multiplier?.toFixed(2) || '',
      p.confidence_level || '',
      p.valuation_date || ''
    ])
    
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `portfolio-valuations-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const formatCurrencyRange = (min, max) => {
    if (min === max) return formatCurrency(min)
    return `${formatCurrency(min)} - ${formatCurrency(max)}`
  }

  const getFilteredProducts = () => {
    if (!dashboard) return []
    let filtered = dashboard.products

    if (isDepartmentHead && selectedDepartmentId && departmentName) {
      filtered = filtered.filter(p => p.service_departments?.includes(departmentName))
    }

    if (isBUHead && selectedBusinessUnitId) {
      filtered = filtered.filter(p => p.requestor_business_unit_id === selectedBusinessUnitId)
    }

    if (requestorFilter) {
      filtered = filtered.filter(p => p.requestor_name === requestorFilter || p.business_unit === requestorFilter)
    }
    if (serviceDeptFilter) {
      filtered = filtered.filter(p => p.service_departments?.includes(serviceDeptFilter))
    }
    return filtered
  }

  const getSortedProducts = () => {
    const filtered = getFilteredProducts()
    return [...filtered].sort((a, b) => {
      let aVal = a[sortField]
      let bVal = b[sortField]
      if (aVal === null) aVal = -Infinity
      if (bVal === null) bVal = -Infinity
      if (sortDir === 'asc') return aVal > bVal ? 1 : -1
      return aVal < bVal ? 1 : -1
    })
  }

  if (loading) return <LoadingPage />

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
        <ErrorState message={error} onRetry={fetchDashboard} />
      </div>
    )
  }

  if (!dashboard || dashboard.products.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Product Jarvis</h2>
          <p className="text-gray-500 mb-6">Create products and assign tasks to see your portfolio dashboard.</p>
          <div className="flex justify-center gap-4">
            <Link to="/positions" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              Add Positions
            </Link>
            <Link to="/products" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Add Products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { summary, products } = dashboard
  const filteredProducts = getFilteredProducts()
  const sortedProducts = getSortedProducts()

  const filteredProductIds = new Set(filteredProducts.map(p => p.id))
  const valuedProducts = portfolio.filter(p => p.has_valuation && (hasFullAccess || filteredProductIds.has(p.product_id)))
  const totalPortfolioValue = valuedProducts.reduce((sum, p) => sum + (p.final_value_high || 0), 0)
  const avgRiceScore = valuedProducts.length > 0
    ? valuedProducts.reduce((sum, p) => sum + (p.rice_score || 0), 0) / valuedProducts.length
    : null

  const displaySummary = hasFullAccess ? summary : {
    total_products: filteredProducts.length,
    total_investment_min: filteredProducts.reduce((sum, p) => sum + (p.cost_min || 0), 0),
    total_investment_max: filteredProducts.reduce((sum, p) => sum + (p.cost_max || 0), 0)
  }

  const getDashboardTitle = () => {
    if (isDepartmentHead && departmentName) {
      return `${departmentName} Department Dashboard`
    }
    if (isBUHead && buName) {
      return `${buName} Dashboard`
    }
    return 'Portfolio Dashboard'
  }

  const showSelectPrompt = (isDepartmentHead && !selectedDepartmentId) || (isBUHead && !selectedBusinessUnitId)

  if (showSelectPrompt) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{getDashboardTitle()}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          title="Total Products"
          value={displaySummary.total_products}
          subtitle={`${valuedProducts.length} valued`}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
          color="indigo"
        />
        <SummaryCard
          title="Total Investment"
          value={formatCurrencyRange(displaySummary.total_investment_min, displaySummary.total_investment_max)}
          subtitle="Labor + Software"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="blue"
        />
        <SummaryCard
          title="Portfolio Value"
          value={formatCurrency(totalPortfolioValue)}
          subtitle="High estimate"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
          color="green"
        />
        <SummaryCard
          title="Avg RICE Score"
          value={avgRiceScore !== null ? avgRiceScore.toFixed(1) : 'N/A'}
          subtitle="Prioritization"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
          <div className="flex items-center justify-center">
            <StatusDonutChart products={filteredProducts} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Overview</h3>
          <HealthBarChart products={filteredProducts} />
        </div>
      </div>

      {hasFullAccess && (dashboard.requestors?.length > 0 || dashboard.service_departments?.length > 0) && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {dashboard.requestors?.length > 0 && (
              <>
                <span className="text-sm font-medium text-gray-700">Requested By:</span>
                <select
                  value={requestorFilter}
                  onChange={(e) => setRequestorFilter(e.target.value)}
                  className="border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All</option>
                  {dashboard.requestors.map(r => (
                    <option key={`${r.type}-${r.name}`} value={r.name}>
                      {r.name} ({r.type === 'business_unit' ? 'BU' : 'Dept'})
                    </option>
                  ))}
                </select>
              </>
            )}
            {dashboard.service_departments?.length > 0 && (
              <>
                <span className="text-sm font-medium text-gray-700">Lead Dept:</span>
                <select
                  value={serviceDeptFilter}
                  onChange={(e) => setServiceDeptFilter(e.target.value)}
                  className="border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All</option>
                  {dashboard.service_departments.map(sd => (
                    <option key={sd} value={sd}>{sd}</option>
                  ))}
                </select>
              </>
            )}
            {(requestorFilter || serviceDeptFilter) && (
              <button
                onClick={() => { setRequestorFilter(''); setServiceDeptFilter(''); }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('health')}
              className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                activeTab === 'health' 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Product Health
            </button>
            <button
              onClick={() => setActiveTab('valuation')}
              className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                activeTab === 'valuation' 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Portfolio Valuations
            </button>
          </div>
          {activeTab === 'valuation' && valuedProducts.length > 0 && (
            <button
              onClick={() => exportPortfolioCSV(valuedProducts)}
              className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
          )}
        </div>
        {activeTab === 'health' ? (
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
                  Lead Dept
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th 
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('hours_progress')}
                >
                  Progress {sortField === 'hours_progress' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('total_cost_min')}
                >
                  Cost Range {sortField === 'total_cost_min' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('estimated_value')}
                >
                  Value/Mo {sortField === 'estimated_value' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('roi_low')}
                >
                  ROI Range {sortField === 'roi_low' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recommendation
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link to="/calculator" className="font-medium text-gray-900 hover:text-indigo-600">
                      {prod.name}
                    </Link>
                    <div className="text-xs text-gray-500">{prod.product_type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {prod.requestor_name || prod.business_unit ? (
                      <div>
                        <span className="text-gray-900">{prod.requestor_name || prod.business_unit}</span>
                        <div className="text-xs text-gray-400">
                          {prod.requestor_type === 'service_department' ? 'Department' : 'Business Unit'}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {prod.lead_department ? (
                      <div className="flex items-center gap-1">
                        <span className="px-2 py-0.5 text-xs rounded bg-indigo-100 text-indigo-800 font-medium">
                          {prod.lead_department}
                        </span>
                        {prod.service_departments?.length > 1 && (
                          <span className="text-xs text-gray-500" title={prod.service_departments.join(', ')}>
                            +{prod.service_departments.length - 1}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={prod.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <ProgressBadge progress={prod.hours_progress} status={prod.hours_status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 text-sm">
                    {formatCurrencyRange(prod.total_cost_min, prod.total_cost_max)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                    {formatCurrency(prod.estimated_value)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {prod.roi_low !== null ? (
                      <span className={prod.roi_low >= 100 ? 'text-green-600' : prod.roi_low >= 50 ? 'text-yellow-600' : prod.roi_low >= 0 ? 'text-orange-600' : 'text-red-600'}>
                        {prod.roi_low.toFixed(0)}% - {prod.roi_high?.toFixed(0) || prod.roi_low.toFixed(0)}%
                      </span>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <HealthBadge health={prod.health} recommendation={prod.recommendation} />
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </ScrollableTable>
        ) : (
          <ScrollableTable>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value Range
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RICE
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {portfolio.map((prod) => (
                  <tr key={prod.product_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{prod.product_name}</span>
                      <div className="text-xs text-gray-500">{prod.product_status}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        prod.product_type === 'Internal' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {prod.product_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {prod.has_valuation ? (
                        <div>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(prod.final_value_low)} - {formatCurrency(prod.final_value_high)}
                          </span>
                          <div className="text-xs text-gray-500">
                            {prod.strategic_multiplier ? `${prod.strategic_multiplier.toFixed(2)}x multiplier` : ''}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not valued</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {prod.rice_score != null ? (
                        <span className="font-medium text-gray-900">{prod.rice_score.toFixed(1)}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {prod.confidence_level ? (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${CONFIDENCE_COLORS[prod.confidence_level]}`}>
                          {prod.confidence_level}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => navigate(`/valuation?product=${prod.product_id}`)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        {prod.has_valuation ? 'View' : 'Value'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollableTable>
        )}
      </div>

      {activeTab === 'valuation' && valuedProducts.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Value Distribution</h3>
          <div className="space-y-3">
            {valuedProducts
              .sort((a, b) => (b.final_value_high || 0) - (a.final_value_high || 0))
              .map(prod => {
                const maxValue = Math.max(...valuedProducts.map(p => p.final_value_high || 0))
                const widthPercent = maxValue > 0 ? ((prod.final_value_high || 0) / maxValue) * 100 : 0
                return (
                  <div key={prod.product_id} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-gray-700 truncate">{prod.product_name}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${Math.max(widthPercent, 5)}%` }}
                      >
                        <span className="text-xs text-white font-medium">
                          {formatCurrency(prod.final_value_high)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
