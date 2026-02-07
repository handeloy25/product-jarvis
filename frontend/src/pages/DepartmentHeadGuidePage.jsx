import { Link } from 'react-router-dom'

export default function DepartmentHeadGuidePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link to="/tools" className="text-indigo-600 hover:text-indigo-800 text-sm">
          &larr; Back to Tools
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Department Head Guide</h1>
            <p className="text-gray-600">For Business Unit Heads and Service Department Heads</p>
          </div>
        </div>

        <div className="prose prose-indigo max-w-none">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h3 className="text-blue-900 mt-0">Your Role in Product Jarvis</h3>
            <p className="text-blue-800 mb-0">
              As a Department or Business Unit Head, you are the <strong>product requester</strong>.
              You identify needs within your department or brand, create product requests, and complete
              the initial valuation to justify the investment.
            </p>
          </div>

          <h2>When to Use Product Jarvis</h2>
          <p>Create a product request when you need:</p>
          <ul>
            <li><strong>Internal Tool:</strong> A system to improve your team's efficiency (automation, dashboards, workflows)</li>
            <li><strong>Customer-Facing Product:</strong> A new product or feature for your brand's customers</li>
          </ul>

          <hr className="my-8" />

          <h2>Step-by-Step Guide</h2>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="mt-0 flex items-center gap-2">
              <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
              Navigate to Products
            </h3>
            <p className="mb-0">Click <strong>Products</strong> in the top navigation bar to see all products in the system.</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="mt-0 flex items-center gap-2">
              <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
              Create a New Product
            </h3>
            <p>Click the <strong>"+ New Product"</strong> button in the top right corner.</p>
            <p>You'll be guided through a wizard with these steps:</p>
            <ol>
              <li><strong>Basic Info:</strong> Name your product, add a description, select the type (Internal/External)</li>
              <li><strong>Department Assignment:</strong> Select the department you believe should lead the project (the PM will verify this)</li>
            </ol>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="mt-0 flex items-center gap-2">
              <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
              Complete the Valuation
            </h3>
            <p>After creating the product, you need to complete the valuation. This is critical - it's how leadership decides what to build.</p>

            <p><strong>For Internal Products, you'll estimate:</strong></p>
            <ul>
              <li><strong>Time Savings:</strong> Hours saved per user per week, number of affected users</li>
              <li><strong>Error Reduction:</strong> Current errors, cost per error, expected reduction</li>
              <li><strong>Cost Avoidance:</strong> What would an off-the-shelf alternative cost?</li>
              <li><strong>Risk Mitigation:</strong> What risks does this address?</li>
            </ul>

            <p><strong>For External Products, you'll estimate:</strong></p>
            <ul>
              <li><strong>Market Size:</strong> Total Addressable Market (TAM), Serviceable Addressable Market (SAM), Serviceable Obtainable Market (SOM)</li>
              <li><strong>Revenue Projections:</strong> Pricing model, expected customers per year, 3-year revenue forecast</li>
              <li><strong>Unit Economics:</strong> Customer Acquisition Cost (CAC), Customer Lifetime Value (LTV), target LTV:CAC ratio (aim for 3:1 or higher)</li>
              <li><strong>Customer Payback Period:</strong> How long until a customer becomes profitable</li>
              <li><strong>Churn Rate:</strong> Expected annual customer turnover</li>
            </ul>

            <p className="mt-4"><strong>Set Your Confidence Level:</strong></p>
            <p>At the end of the valuation, you'll be asked how confident you are in your estimates:</p>
            <ul>
              <li><strong>High:</strong> Based on real data, quotes, or proven results</li>
              <li><strong>Medium:</strong> Based on reasonable assumptions and research</li>
              <li><strong>Low:</strong> Best guess, limited data available</li>
              <li><strong>Speculative:</strong> Very uncertain, exploratory idea</li>
            </ul>
            <p className="mb-0">The confidence level affects the final value range shown to leadership.</p>

            <div className="bg-red-50 border border-red-200 rounded p-3 mt-4">
              <p className="text-red-800 mb-0 text-sm">
                <strong>Required:</strong> Use the <strong>Internal Valuation Assistant</strong> or <strong>External Valuation Assistant</strong>
                in the Tools section to complete the valuation. This generates the Raw Valuation Output needed for the next step.
              </p>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-lg p-6 mb-6 border border-indigo-200">
            <h3 className="mt-0 flex items-center gap-2">
              <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
              Save the Raw Valuation Output
            </h3>
            <p>After completing confidence, the final step of the wizard shows the <strong>Raw Valuation Output</strong> field.</p>
            <p>This step is <strong>required</strong> for the Project Manager to continue the enrichment process:</p>
            <ol>
              <li>Open the <strong>Internal Valuation Assistant</strong> or <strong>External Valuation Assistant</strong> (in Tools)</li>
              <li>Complete the guided conversation to generate your valuation details</li>
              <li>Copy the entire output from the assistant</li>
              <li>Paste it into the <strong>Raw Valuation Output</strong> field in the wizard</li>
              <li>Complete the wizard to save your product</li>
            </ol>
            <div className="bg-white border border-indigo-200 rounded p-3 mt-4">
              <p className="text-indigo-800 mb-0 text-sm">
                <strong>Why is this important?</strong> The Project Manager uses this raw output as input for the
                Product Discovery Engine, which generates specifications, user flows, and persona feedback.
                Without it, the PM cannot proceed.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="mt-0 flex items-center gap-2">
              <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</span>
              Submit for Review
            </h3>
            <p className="mb-0">
              Once your valuation is complete, save it. The product will now appear in the system
              for Project Managers to enrich with additional documentation and for Leadership to review.
            </p>
          </div>

          <hr className="my-8" />

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-green-900 mt-0">You're Done When...</h2>
            <ul className="mb-0 text-green-800">
              <li>Your product is created with a clear name and description</li>
              <li>The product type (Internal/External) is set correctly</li>
              <li>Your department is assigned as the lead department</li>
              <li>The valuation is completed via the Valuation Assistant</li>
              <li>The Raw Valuation Output is saved</li>
            </ul>
          </div>

          <hr className="my-8" />

          <h2>What Happens Next?</h2>
          <div className="bg-gray-100 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <span className="font-bold">You</span>
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
                <div className="bg-amber-100 text-amber-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <span className="font-bold">Lead</span>
                </div>
                <span className="text-xs text-gray-600">Decide</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4 mb-0">
              After you submit, a Project Manager will enrich your product with specifications, user flows,
              and persona feedback. Leadership will then review the complete package and make a Build/Backlog/Kill decision.
            </p>
          </div>

          <hr className="my-8" />

          <h2>Quick Links</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/products" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors no-underline">
              <div className="font-semibold text-gray-900">Products</div>
              <div className="text-sm text-gray-600">View and create products</div>
            </Link>
            <Link to="/tools/valuation-assistant" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors no-underline">
              <div className="font-semibold text-gray-900">Internal Valuation Assistant</div>
              <div className="text-sm text-gray-600">Get help with internal valuations</div>
            </Link>
            <Link to="/tools/external-valuation-assistant" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors no-underline">
              <div className="font-semibold text-gray-900">External Valuation Assistant</div>
              <div className="text-sm text-gray-600">Get help with external valuations</div>
            </Link>
            <Link to="/service-departments" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors no-underline">
              <div className="font-semibold text-gray-900">Departments</div>
              <div className="text-sm text-gray-600">View department information</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
