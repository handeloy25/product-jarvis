import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import { RoleProvider, useRole, ROLES, ROLE_LABELS } from './contexts/RoleContext'
import PositionsPage from './pages/PositionsPage'
import ProductsPage from './pages/ProductsPage'
import CalculatorPage from './pages/CalculatorPage'
import DashboardPage from './pages/DashboardPage'
import LearnPage from './pages/LearnPage'
import AssistantPage from './pages/AssistantPage'
import KnowledgePage from './pages/KnowledgePage'
import ValuationPage from './pages/ValuationPage'
import ToolsPage from './pages/ToolsPage'
import ValuationAssistantPage from './pages/ValuationAssistantPage'
import KnowledgeBuilderPage from './pages/KnowledgeBuilderPage'
import ExternalValuationAssistantPage from './pages/ExternalValuationAssistantPage'
import AboutPage from './pages/AboutPage'
import SoftwarePage from './pages/SoftwarePage'
import ServiceDepartmentsPage from './pages/ServiceDepartmentsPage'
import ExpertReview from './pages/ExpertReview'
import ServicesPage from './pages/ServicesPage'
import ServiceCalculatorPage from './pages/ServiceCalculatorPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import ProductDocumentPage from './pages/ProductDocumentPage'
import ProductDiscoveryEnginePage from './pages/ProductDiscoveryEnginePage'
import ProductDetailPage from './pages/ProductDetailPage'
import DepartmentHeadGuidePage from './pages/DepartmentHeadGuidePage'
import ProjectManagerGuidePage from './pages/ProjectManagerGuidePage'
import LeadershipGuidePage from './pages/LeadershipGuidePage'
import BusinessUnitsPage from './pages/BusinessUnitsPage'
import BUDashboardPage from './pages/BUDashboardPage'

const API_BASE = 'http://localhost:8001/api'

const NAV_GROUPS = [
  {
    name: 'Core',
    items: [
      { to: '/', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    ]
  },
  {
    name: 'Data',
    fullAccessOnly: true,
    items: [
      { to: '/positions', label: 'Positions', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
      { to: '/software', label: 'Software', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
      { to: '/service-departments', label: 'Departments', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
      { to: '/business-units', label: 'Business Units', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    ]
  },
  {
    name: 'Products',
    items: [
      { to: '/products', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
      { to: '/services', label: 'Services', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
      { to: '/calculator', label: 'Calculator', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z', fullAccessOnly: true },
    ]
  },
  {
    name: 'Insights',
    fullAccessOnly: true,
    items: [
      { to: '/reports', label: 'Reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
      { to: '/knowledge', label: 'Knowledge', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    ]
  },
  {
    name: 'AI Tools',
    fullAccessOnly: true,
    items: [
      { to: '/assistant', label: 'Assistant', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
      { to: '/learn', label: 'Learn', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
      { to: '/tools', label: 'Tools', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    ]
  },
  {
    name: 'System',
    items: [
      { to: '/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', fullAccessOnly: true },
      { to: '/about', label: 'About', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    ]
  },
]

function NavIcon({ path }) {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
    </svg>
  )
}

function RoleSelector({ collapsed }) {
  const {
    role, setRole,
    selectedDepartmentId, setSelectedDepartmentId,
    selectedBusinessUnitId, setSelectedBusinessUnitId,
    isDepartmentHead, isBUHead
  } = useRole()

  const [departments, setDepartments] = useState([])
  const [businessUnits, setBusinessUnits] = useState([])
  const [showSelector, setShowSelector] = useState(false)

  useEffect(() => {
    if (isDepartmentHead) {
      fetch(`${API_BASE}/service-departments`)
        .then(r => r.json())
        .then(data => {
          if (data.success) setDepartments(data.data)
        })
        .catch(() => {})
    }
    if (isBUHead) {
      fetch(`${API_BASE}/business-units`)
        .then(r => r.json())
        .then(data => {
          if (data.success) setBusinessUnits(data.data)
        })
        .catch(() => {})
    }
  }, [isDepartmentHead, isBUHead])

  const handleRoleChange = (newRole) => {
    setRole(newRole)
    if (newRole !== ROLES.DEPARTMENT_HEAD) {
      setSelectedDepartmentId(null)
    }
    if (newRole !== ROLES.BU_HEAD) {
      setSelectedBusinessUnitId(null)
    }
    setShowSelector(false)
  }

  const selectedDeptName = departments.find(d => d.id === selectedDepartmentId)?.name
  const selectedBUName = businessUnits.find(b => b.id === selectedBusinessUnitId)?.name

  const getRoleColor = () => {
    switch (role) {
      case ROLES.EXECUTIVE: return 'bg-purple-100 text-purple-800 border-purple-200'
      case ROLES.PROJECT_MANAGER: return 'bg-blue-100 text-blue-800 border-blue-200'
      case ROLES.DEPARTMENT_HEAD: return 'bg-green-100 text-green-800 border-green-200'
      case ROLES.BU_HEAD: return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (collapsed) {
    return (
      <button
        onClick={() => setShowSelector(!showSelector)}
        className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-xs font-bold border ${getRoleColor()}`}
        title={`${ROLE_LABELS[role]}${isDepartmentHead && selectedDeptName ? `: ${selectedDeptName}` : ''}${isBUHead && selectedBUName ? `: ${selectedBUName}` : ''}`}
      >
        {role === ROLES.EXECUTIVE ? 'EX' : role === ROLES.PROJECT_MANAGER ? 'PM' : role === ROLES.DEPARTMENT_HEAD ? 'DH' : 'BU'}
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowSelector(!showSelector)}
        className={`w-full px-3 py-2 rounded-lg border text-left text-sm font-medium ${getRoleColor()}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div>{ROLE_LABELS[role]}</div>
            {isDepartmentHead && selectedDeptName && (
              <div className="text-xs opacity-75">{selectedDeptName}</div>
            )}
            {isBUHead && selectedBUName && (
              <div className="text-xs opacity-75">{selectedBUName}</div>
            )}
          </div>
          <svg className={`w-4 h-4 transition-transform ${showSelector ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {showSelector && (
        <div className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-2 border-b bg-gray-50">
            <span className="text-xs font-semibold text-gray-500 uppercase">Select Role</span>
          </div>
          {Object.entries(ROLE_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => handleRoleChange(key)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${role === key ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'}`}
            >
              {label}
            </button>
          ))}

          {isDepartmentHead && departments.length > 0 && (
            <>
              <div className="p-2 border-t bg-gray-50">
                <span className="text-xs font-semibold text-gray-500 uppercase">Select Department</span>
              </div>
              {departments.map(dept => (
                <button
                  key={dept.id}
                  onClick={() => { setSelectedDepartmentId(dept.id); setShowSelector(false) }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${selectedDepartmentId === dept.id ? 'bg-green-50 text-green-700' : 'text-gray-700'}`}
                >
                  {dept.name}
                </button>
              ))}
            </>
          )}

          {isBUHead && businessUnits.length > 0 && (
            <>
              <div className="p-2 border-t bg-gray-50">
                <span className="text-xs font-semibold text-gray-500 uppercase">Select Business Unit</span>
              </div>
              {businessUnits.map(bu => (
                <button
                  key={bu.id}
                  onClick={() => { setSelectedBusinessUnitId(bu.id); setShowSelector(false) }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${selectedBusinessUnitId === bu.id ? 'bg-orange-50 text-orange-700' : 'text-gray-700'}`}
                >
                  {bu.name}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation()
  const { hasFullAccess } = useRole()
  const [collapsedGroups, setCollapsedGroups] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsedGroups')
    return saved ? JSON.parse(saved) : {}
  })

  useEffect(() => {
    localStorage.setItem('sidebarCollapsedGroups', JSON.stringify(collapsedGroups))
  }, [collapsedGroups])

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed))
  }, [collapsed])

  const toggleGroup = (groupName) => {
    setCollapsedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }))
  }

  const isActiveRoute = (to) => {
    if (to === '/') return location.pathname === '/'
    return location.pathname.startsWith(to)
  }

  const filteredGroups = NAV_GROUPS
    .filter(group => hasFullAccess || !group.fullAccessOnly)
    .map(group => ({
      ...group,
      items: group.items.filter(item => hasFullAccess || !item.fullAccessOnly)
    }))
    .filter(group => group.items.length > 0)

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white border-r shadow-sm z-40 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b">
        {!collapsed && (
          <NavLink to="/" className="text-lg font-bold text-indigo-600 truncate">
            Product Jarvis
          </NavLink>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-2 rounded-lg hover:bg-gray-100 text-gray-600 ${collapsed ? 'mx-auto' : ''}`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {collapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>

      <div className={`p-2 border-b ${collapsed ? 'flex justify-center' : ''}`}>
        <RoleSelector collapsed={collapsed} />
      </div>

      <nav className="p-2 overflow-y-auto flex-1">
        {filteredGroups.map((group) => (
          <div key={group.name} className="mb-2">
            {!collapsed && (
              <button
                onClick={() => toggleGroup(group.name)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:bg-gray-50 rounded"
              >
                <span>{group.name}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${collapsedGroups[group.name] ? '' : 'rotate-180'}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            )}
            {(!collapsedGroups[group.name] || collapsed) && (
              <div className={collapsed ? 'space-y-1' : 'mt-1 space-y-1'}>
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive || isActiveRoute(item.to)
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      } ${collapsed ? 'justify-center' : ''}`
                    }
                  >
                    <NavIcon path={item.icon} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}

function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    return saved ? JSON.parse(saved) : false
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main
        className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-60'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <RoleProvider>
        <ToastProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/positions" element={<PositionsPage />} />
              <Route path="/software" element={<SoftwarePage />} />
              <Route path="/service-departments" element={<ServiceDepartmentsPage />} />
              <Route path="/business-units" element={<BusinessUnitsPage />} />
              <Route path="/bu-dashboard/:id" element={<BUDashboardPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/calculator" element={<CalculatorPage />} />
              <Route path="/learn" element={<LearnPage />} />
              <Route path="/assistant" element={<AssistantPage />} />
              <Route path="/knowledge" element={<KnowledgePage />} />
              <Route path="/valuation" element={<ValuationPage />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/tools/valuation-assistant" element={<ValuationAssistantPage />} />
              <Route path="/tools/knowledge-builder" element={<KnowledgeBuilderPage />} />
              <Route path="/tools/external-valuation-assistant" element={<ExternalValuationAssistantPage />} />
              <Route path="/tools/product-discovery-engine" element={<ProductDiscoveryEnginePage />} />
              <Route path="/products/:id/:docType" element={<ProductDocumentPage />} />
              <Route path="/expert-review" element={<ExpertReview />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/service-calculator" element={<ServiceCalculatorPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/guides/department-head" element={<DepartmentHeadGuidePage />} />
              <Route path="/guides/project-manager" element={<ProjectManagerGuidePage />} />
              <Route path="/guides/leadership" element={<LeadershipGuidePage />} />
            </Routes>
          </Layout>
        </ToastProvider>
      </RoleProvider>
    </BrowserRouter>
  )
}

export default App
