import { Link } from 'react-router-dom'

export default function ProjectManagerGuidePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link to="/tools" className="text-indigo-600 hover:text-indigo-800 text-sm">
          &larr; Back to Tools
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-100 rounded-lg">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Manager Guide</h1>
            <p className="text-gray-600">For PMs responsible for product enrichment and tracking</p>
          </div>
        </div>

        <div className="prose prose-indigo max-w-none">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-8">
            <h3 className="text-purple-900 mt-0">Your Role in Product Jarvis</h3>
            <p className="text-purple-800 mb-0">
              As a Project Manager, you are the <strong>product enricher</strong>.
              After a Department Head creates and values a product, you add the detailed documentation
              needed for development - specifications, user flows, persona feedback - and manage the RACI assignments.
            </p>
          </div>

          <h2>When to Take Action</h2>
          <p>You should work on a product when:</p>
          <ul>
            <li>A new product has been created by a Department/BU Head with a completed valuation</li>
            <li>The product needs documentation before Leadership review</li>
            <li>You've been assigned as the PM for that product</li>
          </ul>

          <hr className="my-8" />

          <h2>Step-by-Step Guide</h2>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="mt-0 flex items-center gap-2">
              <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
              Review Assigned Products
            </h3>
            <p>Navigate to <strong>Products</strong> in the top navigation.</p>
            <p>Look for products that need documentation. The <strong>"Docs"</strong> column shows progress:</p>
            <ul className="mb-0">
              <li><strong>0/4</strong> - No documents created yet</li>
              <li><strong>1/4 to 3/4</strong> - In progress</li>
              <li><strong>4/4</strong> - All documents complete</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="mt-0 flex items-center gap-2">
              <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
              Review the Valuation
            </h3>
            <p>Click on the product to open its detail page. Review the valuation the Department Head submitted:</p>
            <ul>
              <li>Is the product description clear?</li>
              <li>Are the value estimates reasonable?</li>
              <li>Is there enough context to proceed with documentation?</li>
            </ul>
            <p className="mb-0">If anything is unclear, reach out to the product requester before proceeding.</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-6 mb-6 border border-purple-200">
            <h3 className="mt-0 flex items-center gap-2">
              <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
              Run the Product Discovery Engine
            </h3>
            <p>This is your <strong>core workflow</strong>. Follow these steps exactly:</p>
            <ol>
              <li><strong>Get the Raw Valuation Output:</strong> Go to the product's Documents tab and copy the Raw Valuation Output (saved by the Department Head)</li>
              <li><strong>Open the Product Discovery Engine:</strong> Navigate to Tools → Product Discovery Engine</li>
              <li><strong>Paste and Generate:</strong> Paste the raw valuation output and let the AI generate documentation</li>
              <li><strong>Review the Output:</strong> The engine will generate Specifications, User Flow, and Persona Feedback</li>
              <li><strong>Save to Product:</strong> Copy each generated document back to the product's Documents tab</li>
            </ol>

            <div className="grid grid-cols-3 gap-4 my-4">
              <div className="bg-white border rounded p-3">
                <div className="font-semibold text-gray-900">Specifications</div>
                <div className="text-sm text-gray-600">Problem statement, solution overview, user stories, task breakdown</div>
              </div>
              <div className="bg-white border rounded p-3">
                <div className="font-semibold text-gray-900">User Flow</div>
                <div className="text-sm text-gray-600">Mermaid diagrams showing user journey and decision points</div>
              </div>
              <div className="bg-white border rounded p-3">
                <div className="font-semibold text-gray-900">Persona Feedback</div>
                <div className="text-sm text-gray-600">UX, Architecture, and Product expert reviews</div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded p-3">
              <p className="text-amber-800 mb-0 text-sm">
                <strong>Important:</strong> Always review and edit the AI-generated output before saving.
                The AI provides a starting point, but you may need to adjust based on your knowledge of the project.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="mt-0 flex items-center gap-2">
              <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
              Assign RACI
            </h3>
            <p>Set up the RACI matrix for the product to clarify responsibilities:</p>
            <ul>
              <li><strong>R - Responsible:</strong> Who does the work (usually Engineering)</li>
              <li><strong>A - Accountable:</strong> Who owns the outcome (usually PM or Department Head)</li>
              <li><strong>C - Consulted:</strong> Who provides input (stakeholders, subject matter experts)</li>
              <li><strong>I - Informed:</strong> Who needs to know about progress (Leadership, other teams)</li>
            </ul>
            <p className="mb-0">This is done on the product detail page in the RACI section.</p>
          </div>

          <div className="bg-indigo-50 rounded-lg p-6 mb-6 border border-indigo-200">
            <h3 className="mt-0 flex items-center gap-2">
              <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</span>
              Add Task Estimates and Software Allocation
            </h3>
            <p><strong>This step is required before Leadership review.</strong> Leadership needs effort estimates to make informed decisions.</p>

            <p><strong>For Products:</strong></p>
            <ol>
              <li>Go to <strong>Calculator</strong> and select the product</li>
              <li>Add tasks with position assignments and estimated hours</li>
              <li>Add any software allocations (tools, licenses) with percentage allocations</li>
              <li>The system will calculate total overhead costs</li>
            </ol>

            <p><strong>Software Allocation:</strong> Work with the Department Head or Business Unit Head to determine what software tools are needed and their allocation percentages for this product.</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="mt-0 flex items-center gap-2">
              <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">6</span>
              Track Hours (During Development)
            </h3>
            <p>Once the product is approved and in development:</p>
            <ul>
              <li>Track actual hours spent against estimates in the Calculator</li>
              <li>Update the product status as it moves through development</li>
              <li>Monitor progress to keep the project on track</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="mt-0 flex items-center gap-2">
              <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">7</span>
              Prepare for Leadership Review
            </h3>
            <p className="mb-0">
              Once all documentation is complete (4/4 docs) <strong>and task estimates are added</strong>, the product is ready for Leadership review.
              Make sure everything is polished and the valuation reflects any new information discovered
              during the enrichment process.
            </p>
          </div>

          <hr className="my-8" />

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-green-900 mt-0">You're Done When...</h2>
            <ul className="mb-0 text-green-800">
              <li>All 4 documents are generated and saved (Docs shows 4/4)</li>
              <li>Documents have been reviewed and edited for accuracy</li>
              <li>Task estimates are added in the Calculator</li>
              <li>Software allocations are assigned (if applicable)</li>
              <li>RACI assignments are complete</li>
              <li>The valuation has been updated if you discovered new information</li>
              <li>The product is ready for Leadership to make a Build/Backlog/Kill decision</li>
            </ul>
          </div>

          <hr className="my-8" />

          <h2>What Happens Next?</h2>
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
                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <span className="font-bold">You</span>
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
              After you complete the documentation, Leadership reviews the full package and decides:
              <strong> BUILD</strong> (approve for development),
              <strong> BACKLOG</strong> (good idea, defer for now), or
              <strong> KILL</strong> (don't pursue).
            </p>
          </div>

          <hr className="my-8" />

          <h2>Your Key Tools</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/products" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors no-underline">
              <div className="font-semibold text-gray-900">Products</div>
              <div className="text-sm text-gray-600">View all products and their doc status</div>
            </Link>
            <Link to="/tools/product-discovery-engine" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors no-underline">
              <div className="font-semibold text-gray-900">Product Discovery Engine</div>
              <div className="text-sm text-gray-600">Generate specs, user flows, persona feedback</div>
            </Link>
            <Link to="/calculator" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors no-underline">
              <div className="font-semibold text-gray-900">Calculator</div>
              <div className="text-sm text-gray-600">Estimate effort and track hours for products</div>
            </Link>
            <Link to="/services" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors no-underline">
              <div className="font-semibold text-gray-900">Services</div>
              <div className="text-sm text-gray-600">Manage services for business units</div>
            </Link>
            <Link to="/service-calculator" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors no-underline">
              <div className="font-semibold text-gray-900">Service Calculator</div>
              <div className="text-sm text-gray-600">Estimate effort and track hours for services</div>
            </Link>
            <Link to="/assistant" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors no-underline">
              <div className="font-semibold text-gray-900">Assistant</div>
              <div className="text-sm text-gray-600">AI help for product questions</div>
            </Link>
          </div>

          <hr className="my-8" />

          <h2>Document Quality Checklist</h2>
          <p>Before marking a product as ready for Leadership, verify:</p>
          <div className="bg-white border rounded-lg p-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" />
                <span>Specifications clearly define what needs to be built</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" />
                <span>User flow covers the primary use case end-to-end</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" />
                <span>Persona feedback addresses potential concerns</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" />
                <span>Task estimates are complete with hours and positions</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" />
                <span>Software allocations are assigned</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" />
                <span>Valuation numbers are current and defensible</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" />
                <span>RACI assignments make sense for this project</span>
              </label>
            </div>
          </div>

          <hr className="my-8" />

          <h2>Services Management</h2>
          <p>In addition to products, you may also manage <strong>Services</strong> - ongoing work provided by service departments to business units.</p>

          <div className="bg-indigo-50 rounded-lg p-6 mb-6 border border-indigo-200">
            <h3 className="mt-0">Creating Service Types</h3>
            <p>Before creating a service, you may need to create a <strong>Service Type</strong> if the right category doesn't exist.</p>
            <ol>
              <li>Navigate to <strong>Services</strong> in the top navigation</li>
              <li>Click <strong>"+ Service Type"</strong></li>
              <li>Fill in the service type details:
                <ul>
                  <li><strong>Department:</strong> Which service department offers this type of service</li>
                  <li><strong>Name:</strong> The category name (e.g., "Link Building", "Content Creation", "SEO Audit")</li>
                  <li><strong>Description:</strong> Optional description of what this service type includes</li>
                  <li><strong>Recurring:</strong> Check if this is typically an ongoing service (monthly/weekly) vs. one-time</li>
                </ul>
              </li>
            </ol>
            <div className="bg-white border border-indigo-200 rounded p-3 mt-4">
              <p className="text-indigo-800 mb-0 text-sm">
                <strong>When to create a new Service Type:</strong> Only create a new type if the existing options don't fit.
                Service Types are shared across all services for that department, so use existing types when possible.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="mt-0">Creating a Service</h3>
            <ol>
              <li>Navigate to <strong>Services</strong> in the top navigation</li>
              <li>Click <strong>"+ New Service"</strong></li>
              <li>Fill in the service details:
                <ul>
                  <li><strong>Service Name:</strong> What the service is called</li>
                  <li><strong>Service Department:</strong> Which department provides this service</li>
                  <li><strong>Business Unit:</strong> Which BU receives this service</li>
                  <li><strong>Service Type:</strong> Category of service (e.g., Link Building, Content Creation)</li>
                  <li><strong>Fee %:</strong> Markup percentage on top of overhead costs</li>
                </ul>
              </li>
            </ol>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="mt-0">Adding Task Estimates for Services</h3>
            <ol>
              <li>Click on a service to open the <strong>Service Calculator</strong></li>
              <li>Add tasks with:
                <ul>
                  <li><strong>Task Name:</strong> What work needs to be done</li>
                  <li><strong>Position:</strong> Which role performs this task</li>
                  <li><strong>Estimated Hours:</strong> How long it should take</li>
                  <li><strong>Recurring:</strong> Whether this is a one-time or recurring task (monthly/weekly)</li>
                </ul>
              </li>
              <li>The system calculates labor costs based on position hourly rates</li>
            </ol>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="mt-0">Software Allocation for Services</h3>
            <p>Work with the Service Department Head to determine software needs:</p>
            <ol>
              <li>In the Service Calculator, scroll to the <strong>Software Allocation</strong> section</li>
              <li>Add software items with allocation percentages</li>
              <li>The percentage represents how much of that software's cost is attributed to this service</li>
              <li>The system adds software costs to the overhead calculation</li>
            </ol>
            <div className="bg-amber-50 border border-amber-200 rounded p-3 mt-4">
              <p className="text-amber-800 mb-0 text-sm">
                <strong>Note:</strong> The Department Head or Business Unit Head will tell you what software to allocate and what percentage. They have visibility into the tools used for their services.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="mt-0">Tracking Service Hours</h3>
            <p>For active services:</p>
            <ul>
              <li>Update <strong>Actual Hours</strong> as work is completed</li>
              <li>The progress bar shows estimated vs. actual hours</li>
              <li>Status indicators show if the service is under budget, on track, or over budget</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
