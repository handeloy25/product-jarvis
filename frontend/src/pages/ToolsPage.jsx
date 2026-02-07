import { useState } from 'react'
import { Link } from 'react-router-dom'

const USER_GUIDES = [
  {
    id: 'department-head',
    name: 'Department & BU Head Guide',
    description: 'For those who create product requests and complete initial valuations',
    href: '/guides/department-head'
  },
  {
    id: 'project-manager',
    name: 'Project Manager Guide',
    description: 'For PMs who enrich products with documentation and manage RACI',
    href: '/guides/project-manager'
  },
  {
    id: 'leadership',
    name: 'Leadership Guide',
    description: 'For executives who review portfolios and make Build/Backlog/Kill decisions',
    href: '/guides/leadership'
  }
]

const TOOLS = [
  {
    id: 'valuation-assistant',
    name: 'Internal Valuation Assistant',
    description: 'An AI-powered Claude Project that guides department heads through the internal product valuation process. Get help estimating time savings, error reduction, and strategic scores.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    href: '/tools/valuation-assistant',
    badge: null
  },
  {
    id: 'external-valuation-assistant',
    name: 'External Valuation Assistant',
    description: 'An AI-powered Claude Project that guides product managers through external product valuations. Get help with market sizing, unit economics, and go-to-market costs.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    href: '/tools/external-valuation-assistant',
    badge: 'New'
  },
  {
    id: 'product-discovery-engine',
    name: 'Product Discovery Engine',
    description: 'Transform product valuations into development-ready documentation including user flows, specifications, personas, and validation feedback.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    href: '/tools/product-discovery-engine',
    badge: 'New'
  },
  {
    id: 'knowledge-builder',
    name: 'Knowledge Builder',
    description: 'Convert transcripts, articles, and URLs into structured knowledge base documents and executive courses. Discover industry experts and get product news summaries.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    href: '/tools/knowledge-builder',
    badge: null
  }
]

export default function ToolsPage() {
  const [guidesExpanded, setGuidesExpanded] = useState(false)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tools</h1>
        <p className="text-gray-600 mt-1">
          External tools and assistants to help with product management tasks
        </p>
      </div>

      <div className="mb-8">
        <button
          onClick={() => setGuidesExpanded(!guidesExpanded)}
          className="w-full bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-lg hover:border-indigo-300 transition-all text-left"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-50 rounded-lg text-green-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">User Guides</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Step-by-step guides for each role: Department Heads, Project Managers, and Leadership
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                New
              </span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${guidesExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </button>

        {guidesExpanded && (
          <div className="mt-2 bg-gray-50 rounded-lg border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {USER_GUIDES.map(guide => (
                <Link
                  key={guide.id}
                  to={guide.href}
                  className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-indigo-300 hover:shadow transition-all"
                >
                  <h4 className="font-semibold text-gray-900">{guide.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{guide.description}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TOOLS.map(tool => (
          <Link
            key={tool.id}
            to={tool.href}
            className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-lg hover:border-indigo-300 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                {tool.icon}
              </div>
              {tool.badge && (
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                  {tool.badge}
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
              {tool.name}
            </h3>
            <p className="text-sm text-gray-600">
              {tool.description}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-12 bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">About External Tools</h2>
        <p className="text-sm text-gray-600">
          These tools are designed to work alongside Product Jarvis. They run externally (e.g., in Claude Projects) 
          and help streamline specific workflows. Each tool includes setup instructions and any required 
          configuration files.
        </p>
      </div>
    </div>
  )
}
