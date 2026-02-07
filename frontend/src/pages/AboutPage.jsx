import { Link } from 'react-router-dom'

const CORE_PAGES = [
  {
    name: 'Dashboard',
    path: '/',
    description: 'Portfolio-level view of all products with filters, ROI recommendations, and key metrics.',
    features: [
      'Filter by Requested By (Business Unit or Department), Lead Department, Status, Product Type',
      'Product cards showing lead department, supporting departments, costs, and value',
      'ROI-based recommendations (BUILD/CONSIDER/DEFER/KILL)',
      'Portfolio totals: product count, total cost, total value'
    ]
  },
  {
    name: 'Positions',
    path: '/positions',
    description: 'Manage team positions and their hourly cost ranges for accurate labor cost calculations.',
    features: [
      'Add positions with title, department (dropdown), and hourly rate range (min/max)',
      'Department selection from existing Service Departments ensures data consistency',
      'Hourly rates enable cost confidence ranges in calculations',
      'Bulk import via CSV upload (columns: Title, Department, Hourly Cost Min, Hourly Cost Max)',
      'Positions are assigned to tasks on products and synced to Task Flow'
    ]
  },
  {
    name: 'Software',
    path: '/software',
    description: 'Track software subscriptions and allocate costs to products that use them.',
    features: [
      'Add software tools with monthly cost',
      'Bulk import via CSV upload (columns: Name, Monthly Cost; Description optional)',
      'Allocate percentage of each tool to products',
      'Software costs roll up into total product cost'
    ]
  },
  {
    name: 'Departments',
    path: '/service-departments',
    description: 'Manage service departments that build products (Technical, SEO, BI, etc.).',
    features: [
      'Add/edit/delete service departments',
      'Departments are assigned to products as Lead or Supporting',
      'Each department assignment includes RACI designation',
      'Cost allocation % determines how costs are split across departments',
      'Departments sync to Task Flow via webhook (includes positions on update)'
    ]
  },
  {
    name: 'Products',
    path: '/products',
    description: 'Central registry of all products with 4-step creation wizard, department assignments, and product documents.',
    features: [
      '4-step creation wizard: Basic Info → Choose Method → Valuation → Raw Output',
      'Quick Estimate (~2 min) or Full Valuation (~15 min) options',
      'Product documents: Raw valuation output, Specifications, User Flow, Persona Feedback',
      'Service Depts column shows Lead department + supporting count',
      'Assign service departments as Lead (who builds) or Supporting with RACI'
    ]
  },
  {
    name: 'Services',
    path: '/services',
    description: 'Track services provided by departments to business units (SEO, content creation, etc.).',
    features: [
      'Create services with department, business unit, and service type',
      'Service types can be marked as recurring or one-time',
      'Tasks can have recurrence (weekly, monthly, quarterly, annually)',
      'Assign software allocations to services',
      'Set fee % on top of overhead to charge business units'
    ]
  },
  {
    name: 'Calculator',
    path: '/calculator',
    description: 'Calculate total product cost with overhead, fees, and progress tracking.',
    features: [
      'View labor cost breakdown by position (min/max range)',
      'Track actual hours vs estimated with progress indicators',
      'See overhead (labor + software) and fee calculations',
      'Cost breakdown by service department based on allocation %',
      'ROI calculation and BUILD/CONSIDER/DEFER/KILL recommendation'
    ]
  },
  {
    name: 'Reports',
    path: '/reports',
    description: 'Generate reports showing progress against estimated hours for products and services.',
    features: [
      'Products Report - Active products with hours progress',
      'Services Report - Active services with hours progress',
      'Last 7 days or Last 30 days period selection',
      'Expandable sections with task-level detail',
      'Hours by Position summary',
      'PDF export via print dialog'
    ]
  },
  {
    name: 'Valuation',
    path: '/products',
    description: 'Comprehensive product value estimation using economic and strategic drivers. Access via the "Value" button on any product.',
    features: [
      'Full Wizard: 5-step guided valuation with all value drivers',
      'Quick Estimate: Simplified valuation using templates',
      'Internal: time savings, error reduction, cost avoidance, risk mitigation, adoption rates, training costs',
      'External: TAM/SAM/SOM, LTV:CAC ratio, customer payback, churn analysis, GTM costs, 3-year revenue breakdown',
      'Strategic scoring: Reach, Impact, Alignment, Differentiation, Urgency',
      'Confidence-weighted value ranges'
    ]
  }
]

const INTEGRATIONS = [
  {
    name: 'Task Flow Integration',
    path: '/calculator',
    description: 'Bi-directional sync with Task Flow for time tracking, project management, and organizational structure.',
    features: [
      'Products moved to "In Development" auto-create Task Flow Projects via webhook (with product_type and is_internal)',
      'Services created in Product Jarvis auto-create Task Flow Projects via webhook',
      'Departments created/updated in Product Jarvis sync to Task Flow (includes positions array)',
      'Positions created/updated in Product Jarvis sync to Task Flow (with department_id)',
      'Task Flow creates tasks in Product Jarvis when tickets are assigned (with position_id)',
      'Task Flow updates actual_hours in Product Jarvis when time is logged',
      'Product Jarvis calculates costs; Task Flow never sees hourly rates (security boundary)',
      'Position department dropdown ensures positions are only created in valid departments'
    ]
  }
]

const SUPPORT_PAGES = [
  {
    name: 'Learn',
    path: '/learn',
    description: 'Product strategy frameworks and methodologies to inform better decision-making.',
    features: [
      '8 framework lessons (MVS, BACK, 4 U\'s, Gain/Pain, RICE, etc.)',
      'Categorized by use case: Discovery, Prioritization, Validation',
      'Practical examples and application guidance'
    ]
  },
  {
    name: 'Assistant',
    path: '/assistant',
    description: 'AI-powered product strategy advisor with full portfolio and document context.',
    features: [
      'Chat interface with Claude AI',
      'Full context: products, positions, software, departments, costs, valuations',
      'Access to product documents: raw output, specs, user flow, persona feedback',
      'Problem-Solving Mode for structured analysis',
      'Option to include knowledge base for company-specific guidance'
    ]
  },
  {
    name: 'Knowledge',
    path: '/knowledge',
    description: 'Custom knowledge base entries that provide context to the AI Assistant.',
    features: [
      'Add company-specific guidelines, processes, and context',
      'Categorize entries (Product Strategy, Internal Guidelines, etc.)',
      'AI Assistant references these when "Include knowledge base" is checked',
      'Build institutional knowledge over time'
    ]
  }
]

const TOOLS = [
  {
    name: 'Internal Valuation Assistant',
    path: '/tools/valuation-assistant',
    description: 'External Claude Project that guides department heads through internal product valuations conversationally.',
    features: [
      'Setup guide for creating the Claude Project',
      'System prompt with valuation coaching logic',
      'Field reference guide for internal value drivers (time savings, error reduction, etc.)',
      'Industry benchmarks for sanity-checking estimates'
    ]
  },
  {
    name: 'External Valuation Assistant',
    path: '/tools/external-valuation-assistant',
    description: 'External Claude Project that guides product managers through external product valuations with market sizing and unit economics.',
    features: [
      'Market sizing guidance (TAM/SAM/SOM) with reality checks on market share claims',
      'Unit economics coaching (LTV, CAC, payback period, churn)',
      'Business model-specific benchmarks (B2B SaaS, B2C, Marketplace, Usage-based)',
      'Challenges overly optimistic assumptions and produces formatted output'
    ]
  },
  {
    name: 'Product Discovery Engine',
    path: '/tools/product-discovery-engine',
    description: 'External Claude Project that transforms completed valuations into development-ready documentation.',
    features: [
      'Auto-detects Internal vs External product type',
      'Generates User Flow with Mermaid diagrams',
      'Creates lean PRD with task breakdown by role',
      'Builds user persona from valuation data',
      'Pre-mortem analysis and prioritized feedback'
    ]
  },
  {
    name: 'Knowledge Builder',
    path: '/tools/knowledge-builder',
    description: 'External Claude Project for converting content into knowledge base documents and courses.',
    features: [
      'Convert transcripts, articles, URLs into structured knowledge entries',
      'Generate 10-15 minute executive courses from content',
      'Discover industry experts and thought leaders',
      'Get daily/weekly/monthly product news summaries'
    ]
  }
]

function SectionCard({ item }) {
  return (
    <div className="bg-white rounded-lg shadow border p-6">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
        <Link
          to={item.path}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Go to page →
        </Link>
      </div>
      <p className="text-gray-600 mb-4">{item.description}</p>
      <ul className="space-y-2">
        {item.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4 mt-0.5 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">About Product Jarvis</h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          A portfolio cost calculator that helps product leaders make data-driven build/buy/defer decisions 
          by calculating true costs (labor + software), assigning clear department ownership via RACI, 
          and providing ROI-based recommendations.
        </p>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-6 mb-10">
        <h2 className="text-lg font-semibold text-indigo-900 mb-3">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-white rounded-lg p-4 border border-indigo-100">
            <div className="font-semibold text-indigo-700 mb-1">1. Setup</div>
            <p className="text-gray-600">Add positions with hourly rates, software with monthly costs, and service departments.</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-indigo-100">
            <div className="font-semibold text-indigo-700 mb-1">2. Define</div>
            <p className="text-gray-600">Create products, assign departments (Lead/Supporting with RACI), add tasks and software allocations.</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-indigo-100">
            <div className="font-semibold text-indigo-700 mb-1">3. Value</div>
            <p className="text-gray-600">Estimate product value using economic drivers (time savings, risk mitigation) and strategic scoring.</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-indigo-100">
            <div className="font-semibold text-indigo-700 mb-1">4. Decide</div>
            <p className="text-gray-600">Calculator shows total cost, cost by department, and ROI-based recommendation.</p>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Core Pages</h2>
        <p className="text-gray-600 mb-6">
          The primary workflow for managing your product portfolio.
        </p>
        <div className="grid grid-cols-1 gap-6">
          {CORE_PAGES.map(page => (
            <SectionCard key={page.name} item={page} />
          ))}
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Integrations</h2>
        <p className="text-gray-600 mb-6">
          External system integrations for time tracking and project management.
        </p>
        <div className="grid grid-cols-1 gap-6">
          {INTEGRATIONS.map(item => (
            <SectionCard key={item.name} item={item} />
          ))}
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Support Pages</h2>
        <p className="text-gray-600 mb-6">
          Learning resources, AI assistance, and custom knowledge to inform decisions.
        </p>
        <div className="grid grid-cols-1 gap-6">
          {SUPPORT_PAGES.map(page => (
            <SectionCard key={page.name} item={page} />
          ))}
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">External Tools</h2>
        <p className="text-gray-600 mb-6">
          Standalone Claude Projects that extend Product Jarvis capabilities. These run externally 
          and include setup instructions for creating your own instances.
        </p>
        <div className="grid grid-cols-1 gap-6">
          {TOOLS.map(tool => (
            <SectionCard key={tool.name} item={tool} />
          ))}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-10">
        <h2 className="text-lg font-semibold text-yellow-900 mb-3">CSV Import Reference</h2>
        <p className="text-sm text-yellow-800 mb-4">Both Positions and Software support bulk import via CSV files. First row must be headers.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4 border border-yellow-200">
            <h3 className="font-medium text-gray-800 mb-2">Positions CSV</h3>
            <p className="text-xs text-gray-500 mb-2">Required columns:</p>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded block mb-2">Title, Department, Hourly Cost Min, Hourly Cost Max</code>
            <p className="text-xs text-gray-500 mb-1">Example:</p>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
{`Title,Department,Hourly Cost Min,Hourly Cost Max
Senior Developer,Engineering,$75,$95
Product Manager,Product,$65,$85
Data Analyst,BI,$50,$70`}
            </pre>
          </div>
          <div className="bg-white rounded-lg p-4 border border-yellow-200">
            <h3 className="font-medium text-gray-800 mb-2">Software CSV</h3>
            <p className="text-xs text-gray-500 mb-2">Required: Name, Monthly Cost. Optional: Description</p>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded block mb-2">Name, Monthly Cost, Description</code>
            <p className="text-xs text-gray-500 mb-1">Example:</p>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
{`Name,Monthly Cost,Description
AWS,$2500,Cloud infrastructure
Figma,$45,Design tool
Slack,$12.50,Team communication`}
            </pre>
          </div>
        </div>
        <p className="text-xs text-yellow-700 mt-4">Tip: Costs can include $ signs and commas (e.g., "$1,500" works). Column headers are case-insensitive.</p>
      </div>

      <div className="bg-purple-50 border border-purple-100 rounded-lg p-6 mb-10">
        <h2 className="text-lg font-semibold text-purple-900 mb-3">User Roles & Responsibilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-6">
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <h3 className="font-semibold text-purple-800 mb-2">Business Unit Head</h3>
            <p className="text-gray-600">Request products for their brand and complete initial valuation using the 4-step wizard.</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <h3 className="font-semibold text-purple-800 mb-2">Department Head</h3>
            <p className="text-gray-600">Request products/internal tools for their department and complete initial valuation using the 4-step wizard.</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <h3 className="font-semibold text-purple-800 mb-2">Project Manager (PM)</h3>
            <p className="text-gray-600">Enrich products with specs, user flows, and personas. Assign department RACI and track progress.</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <h3 className="font-semibold text-purple-800 mb-2">Leadership</h3>
            <p className="text-gray-600">Review portfolio via Dashboard, evaluate cost vs value, and make Build/Backlog/Kill decisions.</p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-purple-100">
          <h3 className="font-semibold text-purple-800 mb-2">Product Lifecycle</h3>
          <div className="flex flex-col sm:flex-row gap-4 text-xs">
            <div className="flex-1 text-center p-3 bg-purple-50 rounded-lg">
              <div className="font-semibold text-purple-700">Phase 1: Intake</div>
              <div className="text-gray-600 mt-1">BU/Dept Head creates product via wizard + valuation</div>
            </div>
            <div className="hidden sm:flex items-center text-purple-400">→</div>
            <div className="flex-1 text-center p-3 bg-purple-50 rounded-lg">
              <div className="font-semibold text-purple-700">Phase 2: Enrichment</div>
              <div className="text-gray-600 mt-1">PM adds specs, flows, personas, RACI, tracks hours</div>
            </div>
            <div className="hidden sm:flex items-center text-purple-400">→</div>
            <div className="flex-1 text-center p-3 bg-purple-50 rounded-lg">
              <div className="font-semibold text-purple-700">Phase 3: Decision</div>
              <div className="text-gray-600 mt-1">Leadership reviews and decides Build/Backlog/Kill</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border rounded-lg p-6 mb-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Key Concepts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Organizational Model</h3>
            <ul className="space-y-1 text-gray-600">
              <li><span className="font-medium">Requestor:</span> Who needs the product - either a Business Unit OR a Service Department</li>
              <li><span className="font-medium">Business Units:</span> Brands that request products (Lines.com, HighRoller.com, Refills.com)</li>
              <li><span className="font-medium">Service Departments:</span> Teams that build products AND can also request products for their own needs</li>
              <li><span className="font-medium">Lead Department:</span> Primary department that builds the product (can differ from requestor)</li>
              <li><span className="font-medium">Supporting Departments:</span> Contributing departments (zero or more)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-2">RACI Matrix</h3>
            <ul className="space-y-1 text-gray-600">
              <li><span className="font-medium">R - Responsible:</span> Does the work</li>
              <li><span className="font-medium">A - Accountable:</span> Ultimate owner, makes final decisions</li>
              <li><span className="font-medium">C - Consulted:</span> Provides input before decisions</li>
              <li><span className="font-medium">I - Informed:</span> Kept updated on progress</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-2">ROI Recommendations</h3>
            <ul className="space-y-1 text-gray-600">
              <li><span className="text-green-600 font-medium">BUILD:</span> ROI ≥ 100%</li>
              <li><span className="text-yellow-600 font-medium">CONSIDER:</span> ROI 50-99%</li>
              <li><span className="text-orange-600 font-medium">DEFER:</span> ROI 0-49%</li>
              <li><span className="text-red-600 font-medium">KILL:</span> ROI &lt; 0%</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Product Types</h3>
            <ul className="space-y-1 text-gray-600">
              <li><span className="font-medium">Feature:</span> User-facing functionality</li>
              <li><span className="font-medium">Platform:</span> Shared infrastructure/services</li>
              <li><span className="font-medium">Infrastructure:</span> DevOps, cloud, tooling</li>
              <li><span className="font-medium">Tool:</span> Internal productivity tools</li>
              <li><span className="font-medium">Integration:</span> Third-party connections</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Cost Components</h3>
            <ul className="space-y-1 text-gray-600">
              <li><span className="font-medium">Labor Cost:</span> Position hourly rate × estimated hours</li>
              <li><span className="font-medium">Software Cost:</span> Monthly cost × allocation %</li>
              <li><span className="font-medium">Department Cost:</span> Total cost × department allocation %</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Value Drivers (Internal)</h3>
            <ul className="space-y-1 text-gray-600">
              <li><span className="font-medium">Time Savings:</span> Hours saved × users × hourly cost</li>
              <li><span className="font-medium">Error Reduction:</span> Errors × cost per error × reduction %</li>
              <li><span className="font-medium">Cost Avoidance:</span> Alternative solution costs</li>
              <li><span className="font-medium">Risk Mitigation:</span> Probability × impact × reduction %</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-indigo-900 mb-3">Quick Links</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/" className="px-4 py-2 bg-white rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-sm font-medium">
            Dashboard
          </Link>
          <Link to="/positions" className="px-4 py-2 bg-white rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-sm font-medium">
            Positions
          </Link>
          <Link to="/software" className="px-4 py-2 bg-white rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-sm font-medium">
            Software
          </Link>
          <Link to="/service-departments" className="px-4 py-2 bg-white rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-sm font-medium">
            Departments
          </Link>
          <Link to="/products" className="px-4 py-2 bg-white rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-sm font-medium">
            Products
          </Link>
          <Link to="/services" className="px-4 py-2 bg-white rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-sm font-medium">
            Services
          </Link>
          <Link to="/calculator" className="px-4 py-2 bg-white rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-sm font-medium">
            Calculator
          </Link>
          <Link to="/reports" className="px-4 py-2 bg-white rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-sm font-medium">
            Reports
          </Link>
          <Link to="/assistant" className="px-4 py-2 bg-white rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-sm font-medium">
            Assistant
          </Link>
        </div>
      </div>
    </div>
  )
}
