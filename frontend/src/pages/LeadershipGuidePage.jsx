import { Link } from 'react-router-dom'

export default function LeadershipGuidePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link to="/tools" className="text-indigo-600 hover:text-indigo-800 text-sm">
          &larr; Back to Tools
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-100 rounded-lg">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leadership Guide</h1>
            <p className="text-gray-600">For executives and decision-makers</p>
          </div>
        </div>

        <div className="prose prose-indigo max-w-none">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
            <h3 className="text-amber-900 mt-0">Your Role in Product Jarvis</h3>
            <p className="text-amber-800 mb-0">
              As Leadership, you are the <strong>decision-maker</strong>.
              You review the product portfolio, evaluate the data and documentation,
              and make Build/Backlog/Kill decisions that align with strategic priorities.
            </p>
          </div>

          <h2>The Decision Framework</h2>
          <p>Product Jarvis uses ROI-based recommendations, but the final decision is yours:</p>

          <div className="grid grid-cols-2 gap-4 my-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="font-bold text-green-800 text-lg">BUILD</div>
              <div className="text-sm text-green-700">ROI ≥ 100%</div>
              <p className="text-sm text-green-600 mt-2 mb-0">Strong business case. Approve for development.</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="font-bold text-yellow-800 text-lg">CONSIDER</div>
              <div className="text-sm text-yellow-700">ROI 50-99%</div>
              <p className="text-sm text-yellow-600 mt-2 mb-0">Decent potential. May need refinement or timing adjustment.</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="font-bold text-orange-800 text-lg">DEFER</div>
              <div className="text-sm text-orange-700">ROI 0-49%</div>
              <p className="text-sm text-orange-600 mt-2 mb-0">Low priority. Add to backlog for future consideration.</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="font-bold text-red-800 text-lg">KILL</div>
              <div className="text-sm text-red-700">ROI &lt; 0%</div>
              <p className="text-sm text-red-600 mt-2 mb-0">Negative value. Do not pursue.</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-6">
            <p className="text-blue-800 mb-0 text-sm">
              <strong>Note:</strong> ROI thresholds are guidelines. Strategic products may be approved despite lower ROI.
              The system provides data; you provide judgment.
            </p>
          </div>

          <hr className="my-8" />

          <h2>Your Primary Views</h2>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="mt-0 flex items-center gap-2">
              <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
              Dashboard - Portfolio Overview
            </h3>
            <p>The <strong>Dashboard</strong> is your command center. At a glance, see:</p>
            <ul className="mb-0">
              <li>Total products in the pipeline</li>
              <li>Products by status (Active, Backlog, Completed, Killed)</li>
              <li>Value distribution across the portfolio</li>
              <li>Recent activity and updates</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="mt-0 flex items-center gap-2">
              <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
              Products - Detailed Review
            </h3>
            <p>The <strong>Products</strong> page shows all products with key metrics:</p>
            <ul>
              <li><strong>Name & Description:</strong> What is this product?</li>
              <li><strong>Type:</strong> Internal (efficiency), External (revenue), or Hybrid</li>
              <li><strong>Lead Department:</strong> Who requested this?</li>
              <li><strong>Docs:</strong> Documentation completeness (0/4 to 4/4)</li>
              <li><strong>Priority:</strong> Current priority level</li>
            </ul>
            <p className="mb-0">Click any product to see full details including valuation breakdown and all documentation.</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="mt-0 flex items-center gap-2">
              <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
              Services - Ongoing Work
            </h3>
            <p>The <strong>Services</strong> page shows work provided by service departments to business units:</p>
            <ul>
              <li><strong>Service Name:</strong> What work is being done</li>
              <li><strong>Department:</strong> Which service department provides it</li>
              <li><strong>Business Unit:</strong> Which BU receives the service</li>
              <li><strong>Progress:</strong> Hours used vs. estimated (under/on-track/over budget)</li>
              <li><strong>Overhead & Fees:</strong> Total cost including labor, software, and markup</li>
            </ul>
            <p className="mb-0">Click any service to see detailed task breakdown, software allocations, and hour tracking.</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="mt-0 flex items-center gap-2">
              <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
              Reports - Analysis & Trends
            </h3>
            <p className="mb-0">
              The <strong>Reports</strong> page provides analytical views of the portfolio.
              Use this for quarterly reviews, board presentations, and trend analysis.
            </p>
          </div>

          <hr className="my-8" />

          <h2>Reviewing a Product</h2>

          <p>When evaluating a product for decision, review these elements:</p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</div>
              <div>
                <div className="font-semibold">Problem Statement</div>
                <div className="text-sm text-gray-600">Is the problem clear and worth solving? <span className="text-indigo-600">(Found in the Specifications document)</span></div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</div>
              <div>
                <div className="font-semibold">Valuation & ROI</div>
                <div className="text-sm text-gray-600">Are the numbers reasonable? Check confidence level - High confidence means real data, Speculative means guesswork.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</div>
              <div>
                <div className="font-semibold">Documentation Completeness</div>
                <div className="text-sm text-gray-600">Has the PM completed all documents? Products with 4/4 docs are ready for decision.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</div>
              <div>
                <div className="font-semibold">Strategic Alignment</div>
                <div className="text-sm text-gray-600">Does this support company priorities? Check the strategic alignment score.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">5</div>
              <div>
                <div className="font-semibold">Effort vs. Value</div>
                <div className="text-sm text-gray-600">Is the estimated effort reasonable for the expected return?</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">6</div>
              <div>
                <div className="font-semibold">Persona Feedback</div>
                <div className="text-sm text-gray-600">What did the UX, Architecture, and Product experts say? Are there red flags?</div>
              </div>
            </div>
          </div>

          <hr className="my-8" />

          <h2>Key Metrics to Watch</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border rounded-lg p-4">
              <div className="text-sm text-gray-500">For Internal Products</div>
              <ul className="text-sm mt-2 mb-0">
                <li>Annual Time Savings Value</li>
                <li>Error Reduction Value</li>
                <li>Cost Avoidance (vs. buying)</li>
                <li>Adoption Rate Impact</li>
              </ul>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <div className="text-sm text-gray-500">For External Products</div>
              <ul className="text-sm mt-2 mb-0">
                <li>3-Year Revenue Projection</li>
                <li>LTV:CAC Ratio (target: 3:1+)</li>
                <li>Customer Payback Period</li>
                <li>Market Size (TAM/SAM/SOM)</li>
              </ul>
            </div>
          </div>

          <hr className="my-8" />

          <h2>Making Decisions</h2>

          <p>When you're ready to make a decision on a product:</p>

          <ol>
            <li>Navigate to the product detail page</li>
            <li>Review all documentation and valuation data</li>
            <li>Update the product status to reflect your decision:
              <ul>
                <li><strong>Active</strong> - Approved for development (BUILD)</li>
                <li><strong>Backlog</strong> - Good idea, not now (DEFER/CONSIDER)</li>
                <li><strong>Killed</strong> - Do not pursue (KILL)</li>
              </ul>
            </li>
            <li>Optionally adjust priority level</li>
          </ol>

          <hr className="my-8" />

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-green-900 mt-0">Your Ongoing Responsibilities</h2>
            <ul className="mb-0 text-green-800">
              <li>Review the Dashboard weekly for portfolio health</li>
              <li>Make decisions on products with complete documentation</li>
              <li>Monitor Services for budget and progress issues</li>
              <li>Reassess backlogged items quarterly</li>
              <li>Provide strategic guidance on product priorities</li>
              <li>Use Reports for executive presentations and trend analysis</li>
            </ul>
          </div>

          <hr className="my-8" />

          <h2>The Product Lifecycle</h2>
          <div className="bg-gray-100 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <span className="font-bold">BU</span>
                </div>
                <span className="text-xs text-gray-600">Create & Value</span>
              </div>
              <div className="text-gray-400">&rarr;</div>
              <div className="text-center">
                <div className="bg-purple-100 text-purple-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <span className="font-bold">PM</span>
                </div>
                <span className="text-xs text-gray-600">Enrich Docs</span>
              </div>
              <div className="text-gray-400">&rarr;</div>
              <div className="text-center">
                <div className="bg-amber-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <span className="font-bold">You</span>
                </div>
                <span className="text-xs text-gray-600">Decide</span>
              </div>
              <div className="text-gray-400">&rarr;</div>
              <div className="text-center">
                <div className="bg-green-100 text-green-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <span className="font-bold">Dev</span>
                </div>
                <span className="text-xs text-gray-600">Build</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4 mb-0">
              Products flow from request → enrichment → decision → development.
              Your decisions are the gateway between ideation and execution.
            </p>
          </div>

          <hr className="my-8" />

          <h2>Quick Links</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors no-underline">
              <div className="font-semibold text-gray-900">Dashboard</div>
              <div className="text-sm text-gray-600">Portfolio overview and health</div>
            </Link>
            <Link to="/products" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors no-underline">
              <div className="font-semibold text-gray-900">Products</div>
              <div className="text-sm text-gray-600">All products and details</div>
            </Link>
            <Link to="/services" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors no-underline">
              <div className="font-semibold text-gray-900">Services</div>
              <div className="text-sm text-gray-600">Ongoing work and costs</div>
            </Link>
            <Link to="/reports" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors no-underline">
              <div className="font-semibold text-gray-900">Reports</div>
              <div className="text-sm text-gray-600">Analysis and trends</div>
            </Link>
            <Link to="/assistant" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors no-underline">
              <div className="font-semibold text-gray-900">Assistant</div>
              <div className="text-sm text-gray-600">AI help for product questions</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
