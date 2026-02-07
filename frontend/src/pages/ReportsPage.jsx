import { useState, useEffect, useRef } from 'react'
import { LoadingPage } from '../components/Spinner'
import ErrorState from '../components/ErrorState'

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
      <span className="text-xs text-gray-600 w-10 text-right">{progress}%</span>
    </div>
  )
}

function SummaryCard({ title, value, subtitle }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
    </div>
  )
}

function ProductReportSection({ report, expanded, onToggle }) {
  return (
    <div className="bg-white rounded-lg shadow mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
      >
        <div className="flex items-center gap-4">
          <span className="font-semibold">{report.name}</span>
          <span className="text-sm text-gray-500">{report.requestor}</span>
          <span className={`px-2 py-0.5 text-xs rounded ${report.status === 'In Development' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
            {report.status}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-32">
            <ProgressBar progress={report.progress} status={report.hours_status} />
          </div>
          <span className={`px-2 py-0.5 text-xs rounded ${STATUS_COLORS[report.hours_status]}`}>
            {STATUS_LABELS[report.hours_status]}
          </span>
          <svg className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {expanded && (
        <div className="border-t p-4">
          <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
            <div>
              <span className="text-gray-500">Estimated:</span>
              <span className="ml-2 font-medium">{report.estimated_hours}h</span>
            </div>
            <div>
              <span className="text-gray-500">Actual:</span>
              <span className="ml-2 font-medium">{report.actual_hours}h</span>
            </div>
            <div>
              <span className="text-gray-500">Overhead:</span>
              <span className="ml-2 font-medium">${report.overhead_min.toLocaleString()} - ${report.overhead_max.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-500">Progress:</span>
              <span className="ml-2 font-medium">{report.progress}%</span>
            </div>
          </div>
          {report.tasks.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium text-gray-600">Task</th>
                  <th className="text-left py-2 font-medium text-gray-600">Position</th>
                  <th className="text-right py-2 font-medium text-gray-600">Est.</th>
                  <th className="text-right py-2 font-medium text-gray-600">Actual</th>
                  <th className="w-32 py-2 font-medium text-gray-600">Progress</th>
                </tr>
              </thead>
              <tbody>
                {report.tasks.map((task, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2">{task.name}</td>
                    <td className="py-2 text-gray-600">{task.position_title}</td>
                    <td className="py-2 text-right">{task.estimated_hours}h</td>
                    <td className="py-2 text-right">{task.actual_hours}h</td>
                    <td className="py-2">
                      <ProgressBar progress={task.progress} status={task.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

function ServiceReportSection({ report, expanded, onToggle }) {
  return (
    <div className="bg-white rounded-lg shadow mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
      >
        <div className="flex items-center gap-4">
          <span className="font-semibold">{report.name}</span>
          <span className="text-sm text-gray-500">{report.department_name} → {report.business_unit}</span>
          <span className="text-xs text-purple-600">{report.service_type_name}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-32">
            <ProgressBar progress={report.progress} status={report.hours_status} />
          </div>
          <span className={`px-2 py-0.5 text-xs rounded ${STATUS_COLORS[report.hours_status]}`}>
            {STATUS_LABELS[report.hours_status]}
          </span>
          <svg className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {expanded && (
        <div className="border-t p-4">
          <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
            <div>
              <span className="text-gray-500">Estimated:</span>
              <span className="ml-2 font-medium">{report.estimated_hours}h</span>
            </div>
            <div>
              <span className="text-gray-500">Actual:</span>
              <span className="ml-2 font-medium">{report.actual_hours}h</span>
            </div>
            <div>
              <span className="text-gray-500">Total (w/Fee):</span>
              <span className="ml-2 font-medium">${report.total_min.toLocaleString()} - ${report.total_max.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-500">Fee:</span>
              <span className="ml-2 font-medium">{report.fee_percent}%</span>
            </div>
          </div>
          {report.tasks.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium text-gray-600">Task</th>
                  <th className="text-left py-2 font-medium text-gray-600">Position</th>
                  <th className="text-center py-2 font-medium text-gray-600">Type</th>
                  <th className="text-right py-2 font-medium text-gray-600">Est.</th>
                  <th className="text-right py-2 font-medium text-gray-600">Actual</th>
                  <th className="w-32 py-2 font-medium text-gray-600">Progress</th>
                </tr>
              </thead>
              <tbody>
                {report.tasks.map((task, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2">{task.name}</td>
                    <td className="py-2 text-gray-600">{task.position_title}</td>
                    <td className="py-2 text-center">
                      {task.is_recurring ? (
                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">{task.recurrence_type}</span>
                      ) : (
                        <span className="text-xs text-gray-400">one-time</span>
                      )}
                    </td>
                    <td className="py-2 text-right">{task.estimated_hours}h</td>
                    <td className="py-2 text-right">{task.actual_hours}h</td>
                    <td className="py-2">
                      <ProgressBar progress={task.progress} status={task.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

function PositionSummary({ positions }) {
  if (!positions || positions.length === 0) return null
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Hours by Position</h3>
      <div className="space-y-3">
        {positions.map((pos, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <div className="w-40 text-sm font-medium text-gray-700">{pos.position_title}</div>
            <div className="flex-1">
              <ProgressBar progress={pos.progress} status={pos.status} />
            </div>
            <div className="w-32 text-right text-sm text-gray-600">
              {pos.actual_hours}h / {pos.estimated_hours}h
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('products')
  const [period, setPeriod] = useState('30')
  const [productsReport, setProductsReport] = useState(null)
  const [servicesReport, setServicesReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedProducts, setExpandedProducts] = useState({})
  const [expandedServices, setExpandedServices] = useState({})
  const [businessUnits, setBusinessUnits] = useState([])
  const [buFilter, setBuFilter] = useState('')
  const printRef = useRef()

  const fetchReports = async () => {
    setLoading(true)
    setError(null)
    try {
      const [prodRes, svcRes, buRes] = await Promise.all([
        fetch(`${API_BASE}/reports/products?period=${period}`),
        fetch(`${API_BASE}/reports/services?period=${period}`),
        fetch(`${API_BASE}/business-units`)
      ])
      const [prodData, svcData, buData] = await Promise.all([prodRes.json(), svcRes.json(), buRes.json()])
      if (prodData.success) setProductsReport(prodData.data)
      if (svcData.success) setServicesReport(svcData.data)
      if (buData.success) setBusinessUnits(buData.data)
    } catch (err) {
      setError('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [period])

  const handlePrint = () => {
    const printContent = printRef.current
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Product Jarvis - ${activeTab === 'products' ? 'Products' : 'Services'} Report</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 20px; }
            h1 { font-size: 24px; margin-bottom: 20px; }
            .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
            .summary-card { background: #f3f4f6; padding: 12px; border-radius: 8px; }
            .summary-card .label { font-size: 12px; color: #6b7280; }
            .summary-card .value { font-size: 20px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            th { background: #f9fafb; font-weight: 500; color: #6b7280; font-size: 12px; }
            .progress { display: inline-block; width: 80px; height: 8px; background: #e5e7eb; border-radius: 4px; }
            .progress-bar { height: 100%; border-radius: 4px; }
            .status-under { background: #3b82f6; }
            .status-on_track { background: #22c55e; }
            .status-over { background: #ef4444; }
            .status-not_started { background: #9ca3af; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <h1>${activeTab === 'products' ? 'Products' : 'Services'} Report - Last ${period} Days</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          ${generatePrintHTML()}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const generatePrintHTML = () => {
    const report = activeTab === 'products' ? productsReport : servicesReport
    if (!report) return ''
    
    const items = activeTab === 'products' ? report.products : report.services
    
    let html = `
      <div class="summary">
        <div class="summary-card">
          <div class="label">Total ${activeTab === 'products' ? 'Products' : 'Services'}</div>
          <div class="value">${activeTab === 'products' ? report.summary.total_products : report.summary.total_services}</div>
        </div>
        <div class="summary-card">
          <div class="label">Est. Hours</div>
          <div class="value">${report.summary.total_estimated_hours}h</div>
        </div>
        <div class="summary-card">
          <div class="label">Actual Hours</div>
          <div class="value">${report.summary.total_actual_hours}h</div>
        </div>
        <div class="summary-card">
          <div class="label">Overall Progress</div>
          <div class="value">${report.summary.overall_progress}%</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>${activeTab === 'products' ? 'Requestor' : 'Dept → BU'}</th>
            <th>Est. Hours</th>
            <th>Actual</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
    `
    
    items.forEach(item => {
      html += `
        <tr>
          <td>${item.name}</td>
          <td>${activeTab === 'products' ? (item.requestor || '-') : `${item.department_name} → ${item.business_unit}`}</td>
          <td>${item.estimated_hours}h</td>
          <td>${item.actual_hours}h</td>
          <td>
            <div class="progress">
              <div class="progress-bar status-${item.hours_status}" style="width: ${Math.min(item.progress, 100)}%"></div>
            </div>
            ${item.progress}%
          </td>
        </tr>
      `
    })
    
    html += '</tbody></table>'
    return html
  }

  if (loading) return <LoadingPage />
  if (error) return <ErrorState message={error} onRetry={fetchReports} />

  const report = activeTab === 'products' ? productsReport : servicesReport

  return (
    <div ref={printRef}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Track hours progress vs estimates</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
          </select>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'products' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
        >
          Products Report
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'services' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
        >
          Services Report
        </button>
      </div>

      {report && (
        <>
          {businessUnits.length > 0 && (
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Business Unit:</span>
                <select
                  value={buFilter}
                  onChange={(e) => setBuFilter(e.target.value)}
                  className="border rounded-lg px-3 py-1.5 text-sm"
                >
                  <option value="">All</option>
                  {businessUnits.map(bu => (
                    <option key={bu.id} value={bu.name}>{bu.name}</option>
                  ))}
                </select>
                {buFilter && (
                  <button
                    onClick={() => setBuFilter('')}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <SummaryCard
              title={activeTab === 'products' ? 'Total Products' : 'Total Services'}
              value={activeTab === 'products' ? report.summary.total_products : report.summary.total_services}
              subtitle={`Active in last ${period} days`}
            />
            <SummaryCard
              title="Estimated Hours"
              value={`${report.summary.total_estimated_hours}h`}
              subtitle="Total target"
            />
            <SummaryCard
              title="Actual Hours"
              value={`${report.summary.total_actual_hours}h`}
              subtitle="Hours logged"
            />
            <SummaryCard
              title="Overall Progress"
              value={`${report.summary.overall_progress}%`}
              subtitle={STATUS_LABELS[report.summary.overall_status]}
            />
          </div>

          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Overall Status:</span>
              <div className="flex-1 max-w-md">
                <ProgressBar progress={report.summary.overall_progress} status={report.summary.overall_status} />
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[report.summary.overall_status]}`}>
                {STATUS_LABELS[report.summary.overall_status]}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">
              {activeTab === 'products' ? 'Products' : 'Services'} Detail
            </h2>
            {activeTab === 'products' ? (
              (() => {
                const filteredProducts = buFilter
                  ? productsReport?.products.filter(p => p.business_unit === buFilter) || []
                  : productsReport?.products || []
                return filteredProducts.length === 0 ? (
                  <p className="text-gray-500">No active products found.</p>
                ) : (
                  filteredProducts.map(prod => (
                    <ProductReportSection
                      key={prod.id}
                      report={prod}
                      expanded={expandedProducts[prod.id]}
                      onToggle={() => setExpandedProducts(prev => ({ ...prev, [prod.id]: !prev[prod.id] }))}
                    />
                  ))
                )
              })()
            ) : (
              (() => {
                const filteredServices = buFilter
                  ? servicesReport?.services.filter(s => s.business_unit === buFilter) || []
                  : servicesReport?.services || []
                return filteredServices.length === 0 ? (
                  <p className="text-gray-500">No active services found.</p>
                ) : (
                  filteredServices.map(svc => (
                    <ServiceReportSection
                      key={svc.id}
                      report={svc}
                      expanded={expandedServices[svc.id]}
                      onToggle={() => setExpandedServices(prev => ({ ...prev, [svc.id]: !prev[svc.id] }))}
                    />
                  ))
                )
              })()
            )}
          </div>

          <PositionSummary positions={report.by_position} />
        </>
      )}
    </div>
  )
}
