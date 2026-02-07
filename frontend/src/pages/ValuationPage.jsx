import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { LoadingPage } from '../components/Spinner'
import ErrorState from '../components/ErrorState'
import { useToast } from '../components/Toast'

const API_BASE = 'http://localhost:8001/api'

const CONFIDENCE_LEVELS = ['High', 'Medium', 'Low', 'Speculative']
const PRICING_MODELS = ['One-time', 'Monthly', 'Annual', 'Usage-based', 'Per-seat']
const ALTERNATIVE_PERIODS = ['Monthly', 'Annually', 'One-time']

const CONFIDENCE_DESCRIPTIONS = {
  'High': '80-100% confidence - Data-backed, validated assumptions',
  'Medium': '50-79% confidence - Reasonable estimates, some data',
  'Low': '20-49% confidence - Early stage, mostly assumptions',
  'Speculative': '<20% confidence - Gut feel, no validation'
}

const QUICK_TEMPLATES = {
  Internal: {
    hours_saved_per_user_per_week: 2,
    number_of_affected_users: 10,
    average_hourly_cost: 50,
    expected_adoption_rate_percent: 75,
    training_cost_per_user: 200,
    time_to_full_productivity_weeks: 4,
    reach_score: 3,
    impact_score: 1,
    strategic_alignment_score: 3,
    differentiation_score: 3,
    urgency_score: 3,
    confidence_level: 'Low'
  },
  External: {
    total_potential_customers: 10000,
    serviceable_percent: 20,
    achievable_market_share_percent: 5,
    average_deal_size: 1000,
    gross_margin_percent: 70,
    expected_customer_lifetime_months: 24,
    monthly_churn_rate_percent: 3,
    customer_acquisition_cost: 500,
    annual_marketing_spend: 50000,
    annual_sales_team_cost: 100000,
    year_1_customers: 50,
    year_2_customers: 150,
    year_3_customers: 300,
    reach_score: 3,
    impact_score: 1,
    strategic_alignment_score: 3,
    differentiation_score: 3,
    urgency_score: 3,
    confidence_level: 'Low'
  },
  Both: {
    hours_saved_per_user_per_week: 2,
    number_of_affected_users: 10,
    average_hourly_cost: 50,
    expected_adoption_rate_percent: 75,
    training_cost_per_user: 200,
    time_to_full_productivity_weeks: 4,
    total_potential_customers: 5000,
    serviceable_percent: 20,
    achievable_market_share_percent: 5,
    average_deal_size: 500,
    gross_margin_percent: 70,
    expected_customer_lifetime_months: 24,
    monthly_churn_rate_percent: 3,
    customer_acquisition_cost: 300,
    annual_marketing_spend: 30000,
    annual_sales_team_cost: 50000,
    year_1_customers: 30,
    year_2_customers: 80,
    year_3_customers: 150,
    internal_value_weight: 50,
    external_value_weight: 50,
    reach_score: 3,
    impact_score: 1,
    strategic_alignment_score: 3,
    differentiation_score: 3,
    urgency_score: 3,
    confidence_level: 'Low'
  }
}

const FIELD_HELP = {
  hours_saved_per_user_per_week: 'How many hours per week will each user save? Think about manual tasks eliminated.',
  number_of_affected_users: 'How many employees will use this product regularly?',
  average_hourly_cost: 'Fully-loaded hourly cost (salary + benefits + overhead, typically 1.3-1.5x base hourly rate)',
  current_errors_per_month: 'How many errors/mistakes occur monthly in the process this product addresses?',
  cost_per_error: 'Average cost to fix each error. Include rework time, customer impact, compliance issues.',
  expected_error_reduction_percent: 'What percentage of errors will be eliminated? Be realistic - 100% is rarely achievable.',
  alternative_solution_cost: 'If you didn\'t build this, what would you pay for an alternative? (Vendor software, outsourcing)',
  risk_description: 'What risk does this mitigate? (Security breach, compliance failure, system outage)',
  risk_probability_percent: 'Without this product, what\'s the annual probability this risk occurs?',
  risk_cost_if_occurs: 'If the risk happens, what\'s the estimated cost? (Fines, lost revenue, remediation)',
  risk_reduction_percent: 'How much does this product reduce the probability or impact?',
  expected_adoption_rate_percent: 'What % of target users will actually use this? Be realistic - 60-80% is typical for internal tools.',
  training_cost_per_user: 'Cost to train each user (trainer time, lost productivity, materials). Typically $100-500/user.',
  rollout_months: 'How many months to fully roll out? Longer rollouts delay value realization.',
  time_to_full_productivity_weeks: 'Weeks until users are fully productive. 4-12 weeks is common for complex tools.',
  process_standardization_annual_value: 'Annual value from standardizing processes (consistency, compliance, knowledge transfer).',
  target_customer_segment: 'Who is your ideal customer? Be specific (e.g., "Mid-size e-commerce companies with 10-100 employees")',
  total_potential_customers: 'How many companies/people fit your target segment? This is your TAM in customer count.',
  serviceable_percent: 'What percentage can you realistically reach? This gives your SAM.',
  achievable_market_share_percent: 'What market share can you capture in 3 years? Most startups capture <5% of SAM.',
  price_per_unit: 'What will you charge per unit/user/month?',
  average_deal_size: 'For B2B: expected average contract value. For B2C: average customer spend.',
  sales_cycle_months: 'How long from first contact to closed deal?',
  conversion_rate_percent: 'Of qualified leads, what percentage become paying customers? Cold: 2-5%, Warm: 20-30%.',
  gross_margin_percent: 'Revenue minus direct costs (hosting, support, COGS). SaaS typically 70-85%.',
  expected_customer_lifetime_months: 'How long will the average customer stay? Calculate as: 1 / monthly churn rate.',
  monthly_churn_rate_percent: 'What % of customers cancel per month? 2-5% is typical. Auto-calculates lifetime if set.',
  customer_acquisition_cost: 'How much to acquire one customer? (Marketing + sales costs / new customers)',
  annual_marketing_spend: 'Annual marketing budget for this product (ads, content, events, etc.)',
  annual_sales_team_cost: 'Annual cost of sales team dedicated to this product (salaries, commissions, tools)',
  year_1_customers: 'Expected number of customers at end of Year 1',
  year_2_customers: 'Expected number of customers at end of Year 2',
  year_3_customers: 'Expected number of customers at end of Year 3',
  competitor_name: 'Who is your closest competitor or alternative solution?',
  competitor_pricing: 'What do they charge for a comparable offering?',
  differentiation_summary: 'Why would customers choose you over them?',
  reach_score: '1=Few individuals, 3=One department/segment, 5=Entire company or large market',
  impact_score: '0.25=Minimal, 0.5=Low, 1=Medium, 2=High, 3=Massive/Transformative',
  strategic_alignment_score: '1=Nice-to-have, 3=Supports key initiative, 5=Critical to strategy',
  differentiation_score: '1=Commodity/everyone has it, 3=Somewhat unique, 5=True differentiator',
  urgency_score: '1=No rush, 3=Should do this year, 5=Critical/blocking other work'
}

function HelpTooltip({ text }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-block ml-1">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="text-gray-400 hover:text-gray-600"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      {show && (
        <div className="absolute z-50 w-64 p-2 text-xs text-white bg-gray-800 rounded shadow-lg -left-28 bottom-6">
          {text}
        </div>
      )}
    </span>
  )
}

function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, idx) => (
        <div key={idx} className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            idx < currentStep ? 'bg-indigo-600 text-white' :
            idx === currentStep ? 'bg-indigo-600 text-white ring-4 ring-indigo-200' :
            'bg-gray-200 text-gray-500'
          }`}>
            {idx < currentStep ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : idx + 1}
          </div>
          <span className={`mx-2 text-sm ${idx === currentStep ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
            {step}
          </span>
          {idx < steps.length - 1 && (
            <div className={`w-12 h-0.5 mx-2 ${idx < currentStep ? 'bg-indigo-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function NumberInput({ label, name, value, onChange, help, min, max, step, prefix }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {help && <HelpTooltip text={help} />}
      </label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-2 text-gray-500">{prefix}</span>}
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(name, e.target.value ? parseFloat(e.target.value) : null)}
          min={min}
          max={max}
          step={step || 1}
          className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${prefix ? 'pl-7' : ''}`}
        />
      </div>
    </div>
  )
}

function TextInput({ label, name, value, onChange, help, multiline }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {help && <HelpTooltip text={help} />}
      </label>
      {multiline ? (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(name, e.target.value)}
          rows={3}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      ) : (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(name, e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      )}
    </div>
  )
}

function SelectInput({ label, name, value, onChange, options, help }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {help && <HelpTooltip text={help} />}
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="">Select...</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}

function ScoreInput({ label, name, value, onChange, help, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {help && <HelpTooltip text={help} />}
      </label>
      <div className="flex gap-2">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(name, opt)}
            className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
              value === opt
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function Step1ProductInfo({ product }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Product Information</h2>
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-500">Product Name</span>
            <p className="font-medium">{product.name}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Type</span>
            <p className="font-medium">{product.product_type}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Status</span>
            <p className="font-medium">{product.status}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Description</span>
            <p className="font-medium">{product.description || 'No description'}</p>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600">
        Based on the product type <strong>({product.product_type})</strong>, we'll collect the relevant value drivers in the next step.
      </p>
    </div>
  )
}

function Step2ValueDrivers({ productType, form, onChange }) {
  const showInternal = productType === 'Internal' || productType === 'Both'
  const showExternal = productType === 'External' || productType === 'Both'

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">Value Drivers</h2>
      
      {productType === 'Both' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2">Value Weight Split</h3>
          <div className="grid grid-cols-2 gap-4">
            <NumberInput
              label="Internal Value Weight (%)"
              name="internal_value_weight"
              value={form.internal_value_weight}
              onChange={onChange}
              min={0}
              max={100}
            />
            <NumberInput
              label="External Value Weight (%)"
              name="external_value_weight"
              value={form.external_value_weight}
              onChange={onChange}
              min={0}
              max={100}
            />
          </div>
        </div>
      )}

      {showInternal && (
        <>
          <div className="border-b pb-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm mr-2">Internal</span>
              Time Savings
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <NumberInput
                label="Hours Saved / User / Week"
                name="hours_saved_per_user_per_week"
                value={form.hours_saved_per_user_per_week}
                onChange={onChange}
                help={FIELD_HELP.hours_saved_per_user_per_week}
                min={0}
                step={0.5}
              />
              <NumberInput
                label="Number of Users"
                name="number_of_affected_users"
                value={form.number_of_affected_users}
                onChange={onChange}
                help={FIELD_HELP.number_of_affected_users}
                min={0}
              />
              <NumberInput
                label="Avg Hourly Cost"
                name="average_hourly_cost"
                value={form.average_hourly_cost}
                onChange={onChange}
                help={FIELD_HELP.average_hourly_cost}
                min={0}
                prefix="$"
              />
            </div>
          </div>

          <div className="border-b pb-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm mr-2">Internal</span>
              Error Reduction
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <NumberInput
                label="Errors per Month"
                name="current_errors_per_month"
                value={form.current_errors_per_month}
                onChange={onChange}
                help={FIELD_HELP.current_errors_per_month}
                min={0}
              />
              <NumberInput
                label="Cost per Error"
                name="cost_per_error"
                value={form.cost_per_error}
                onChange={onChange}
                help={FIELD_HELP.cost_per_error}
                min={0}
                prefix="$"
              />
              <NumberInput
                label="Error Reduction %"
                name="expected_error_reduction_percent"
                value={form.expected_error_reduction_percent}
                onChange={onChange}
                help={FIELD_HELP.expected_error_reduction_percent}
                min={0}
                max={100}
              />
            </div>
          </div>

          <div className="border-b pb-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm mr-2">Internal</span>
              Cost Avoidance
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <NumberInput
                label="Alternative Solution Cost"
                name="alternative_solution_cost"
                value={form.alternative_solution_cost}
                onChange={onChange}
                help={FIELD_HELP.alternative_solution_cost}
                min={0}
                prefix="$"
              />
              <SelectInput
                label="Cost Period"
                name="alternative_solution_period"
                value={form.alternative_solution_period}
                onChange={onChange}
                options={ALTERNATIVE_PERIODS}
              />
            </div>
          </div>

          <div className="border-b pb-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm mr-2">Internal</span>
              Risk Mitigation
            </h3>
            <TextInput
              label="Risk Description"
              name="risk_description"
              value={form.risk_description}
              onChange={onChange}
              help={FIELD_HELP.risk_description}
              multiline
            />
            <div className="grid grid-cols-3 gap-4 mt-4">
              <NumberInput
                label="Risk Probability %"
                name="risk_probability_percent"
                value={form.risk_probability_percent}
                onChange={onChange}
                help={FIELD_HELP.risk_probability_percent}
                min={0}
                max={100}
              />
              <NumberInput
                label="Cost if Occurs"
                name="risk_cost_if_occurs"
                value={form.risk_cost_if_occurs}
                onChange={onChange}
                help={FIELD_HELP.risk_cost_if_occurs}
                min={0}
                prefix="$"
              />
              <NumberInput
                label="Risk Reduction %"
                name="risk_reduction_percent"
                value={form.risk_reduction_percent}
                onChange={onChange}
                help={FIELD_HELP.risk_reduction_percent}
                min={0}
                max={100}
              />
            </div>
          </div>

          <div className="border-b pb-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm mr-2">Internal</span>
              Adoption & Rollout
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <NumberInput
                label="Expected Adoption Rate %"
                name="expected_adoption_rate_percent"
                value={form.expected_adoption_rate_percent}
                onChange={onChange}
                help={FIELD_HELP.expected_adoption_rate_percent}
                min={0}
                max={100}
              />
              <NumberInput
                label="Training Cost per User"
                name="training_cost_per_user"
                value={form.training_cost_per_user}
                onChange={onChange}
                help={FIELD_HELP.training_cost_per_user}
                min={0}
                prefix="$"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <NumberInput
                label="Rollout Months"
                name="rollout_months"
                value={form.rollout_months}
                onChange={onChange}
                help={FIELD_HELP.rollout_months}
                min={0}
              />
              <NumberInput
                label="Time to Full Productivity (weeks)"
                name="time_to_full_productivity_weeks"
                value={form.time_to_full_productivity_weeks}
                onChange={onChange}
                help={FIELD_HELP.time_to_full_productivity_weeks}
                min={0}
              />
            </div>
          </div>

          <div className="border-b pb-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm mr-2">Internal</span>
              Process Standardization
            </h3>
            <NumberInput
              label="Annual Value from Process Standardization"
              name="process_standardization_annual_value"
              value={form.process_standardization_annual_value}
              onChange={onChange}
              help={FIELD_HELP.process_standardization_annual_value}
              min={0}
              prefix="$"
            />
          </div>
        </>
      )}

      {showExternal && (
        <>
          <div className="border-b pb-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm mr-2">External</span>
              Market Sizing
            </h3>
            <TextInput
              label="Target Customer Segment"
              name="target_customer_segment"
              value={form.target_customer_segment}
              onChange={onChange}
              help={FIELD_HELP.target_customer_segment}
            />
            <div className="grid grid-cols-3 gap-4 mt-4">
              <NumberInput
                label="Total Potential Customers (TAM)"
                name="total_potential_customers"
                value={form.total_potential_customers}
                onChange={onChange}
                help={FIELD_HELP.total_potential_customers}
                min={0}
              />
              <NumberInput
                label="Serviceable % (SAM)"
                name="serviceable_percent"
                value={form.serviceable_percent}
                onChange={onChange}
                help={FIELD_HELP.serviceable_percent}
                min={0}
                max={100}
              />
              <NumberInput
                label="Achievable Market Share % (SOM)"
                name="achievable_market_share_percent"
                value={form.achievable_market_share_percent}
                onChange={onChange}
                help={FIELD_HELP.achievable_market_share_percent}
                min={0}
                max={100}
              />
            </div>
          </div>

          <div className="border-b pb-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm mr-2">External</span>
              Revenue Projection
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <NumberInput
                label="Price per Unit"
                name="price_per_unit"
                value={form.price_per_unit}
                onChange={onChange}
                help={FIELD_HELP.price_per_unit}
                min={0}
                prefix="$"
              />
              <SelectInput
                label="Pricing Model"
                name="pricing_model"
                value={form.pricing_model}
                onChange={onChange}
                options={PRICING_MODELS}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <NumberInput
                label="Average Deal Size"
                name="average_deal_size"
                value={form.average_deal_size}
                onChange={onChange}
                help={FIELD_HELP.average_deal_size}
                min={0}
                prefix="$"
              />
              <NumberInput
                label="Sales Cycle (Months)"
                name="sales_cycle_months"
                value={form.sales_cycle_months}
                onChange={onChange}
                help={FIELD_HELP.sales_cycle_months}
                min={0}
              />
              <NumberInput
                label="Conversion Rate %"
                name="conversion_rate_percent"
                value={form.conversion_rate_percent}
                onChange={onChange}
                help={FIELD_HELP.conversion_rate_percent}
                min={0}
                max={100}
              />
            </div>
          </div>

          <div className="border-b pb-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm mr-2">External</span>
              Customer Economics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <NumberInput
                label="Gross Margin %"
                name="gross_margin_percent"
                value={form.gross_margin_percent}
                onChange={onChange}
                help={FIELD_HELP.gross_margin_percent}
                min={0}
                max={100}
              />
              <NumberInput
                label="Monthly Churn Rate %"
                name="monthly_churn_rate_percent"
                value={form.monthly_churn_rate_percent}
                onChange={onChange}
                help={FIELD_HELP.monthly_churn_rate_percent}
                min={0}
                max={100}
                step={0.1}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <NumberInput
                label="Customer Lifetime (Months)"
                name="expected_customer_lifetime_months"
                value={form.expected_customer_lifetime_months}
                onChange={onChange}
                help={FIELD_HELP.expected_customer_lifetime_months}
                min={0}
              />
              <NumberInput
                label="Customer Acquisition Cost (CAC)"
                name="customer_acquisition_cost"
                value={form.customer_acquisition_cost}
                onChange={onChange}
                help={FIELD_HELP.customer_acquisition_cost}
                min={0}
                prefix="$"
              />
            </div>
          </div>

          <div className="border-b pb-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm mr-2">External</span>
              Go-to-Market Costs
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <NumberInput
                label="Annual Marketing Spend"
                name="annual_marketing_spend"
                value={form.annual_marketing_spend}
                onChange={onChange}
                help={FIELD_HELP.annual_marketing_spend}
                min={0}
                prefix="$"
              />
              <NumberInput
                label="Annual Sales Team Cost"
                name="annual_sales_team_cost"
                value={form.annual_sales_team_cost}
                onChange={onChange}
                help={FIELD_HELP.annual_sales_team_cost}
                min={0}
                prefix="$"
              />
            </div>
          </div>

          <div className="border-b pb-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm mr-2">External</span>
              Customer Growth (3-Year)
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <NumberInput
                label="Year 1 Customers"
                name="year_1_customers"
                value={form.year_1_customers}
                onChange={onChange}
                help={FIELD_HELP.year_1_customers}
                min={0}
              />
              <NumberInput
                label="Year 2 Customers"
                name="year_2_customers"
                value={form.year_2_customers}
                onChange={onChange}
                help={FIELD_HELP.year_2_customers}
                min={0}
              />
              <NumberInput
                label="Year 3 Customers"
                name="year_3_customers"
                value={form.year_3_customers}
                onChange={onChange}
                help={FIELD_HELP.year_3_customers}
                min={0}
              />
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm mr-2">External</span>
              Competitive Reference
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <TextInput
                label="Competitor Name"
                name="competitor_name"
                value={form.competitor_name}
                onChange={onChange}
                help={FIELD_HELP.competitor_name}
              />
              <NumberInput
                label="Competitor Pricing"
                name="competitor_pricing"
                value={form.competitor_pricing}
                onChange={onChange}
                help={FIELD_HELP.competitor_pricing}
                min={0}
                prefix="$"
              />
            </div>
            <div className="mt-4">
              <TextInput
                label="Differentiation Summary"
                name="differentiation_summary"
                value={form.differentiation_summary}
                onChange={onChange}
                help={FIELD_HELP.differentiation_summary}
                multiline
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Step3StrategicAssessment({ form, onChange }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Strategic Assessment</h2>
      <p className="text-sm text-gray-600">
        Rate each dimension to calculate a strategic multiplier for your valuation.
      </p>

      <div className="space-y-6">
        <ScoreInput
          label="Reach - How many people are affected?"
          name="reach_score"
          value={form.reach_score}
          onChange={onChange}
          help={FIELD_HELP.reach_score}
          options={[1, 2, 3, 4, 5]}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Impact - How significant is the improvement?
            <HelpTooltip text={FIELD_HELP.impact_score} />
          </label>
          <div className="flex gap-2 flex-wrap">
            {[0.25, 0.5, 1, 2, 3].map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange('impact_score', opt)}
                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  form.impact_score === opt
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                }`}
              >
                {opt === 0.25 ? 'Minimal' : opt === 0.5 ? 'Low' : opt === 1 ? 'Medium' : opt === 2 ? 'High' : 'Massive'}
              </button>
            ))}
          </div>
        </div>

        <ScoreInput
          label="Strategic Alignment - How core to company strategy?"
          name="strategic_alignment_score"
          value={form.strategic_alignment_score}
          onChange={onChange}
          help={FIELD_HELP.strategic_alignment_score}
          options={[1, 2, 3, 4, 5]}
        />

        <ScoreInput
          label="Differentiation - Does this create competitive advantage?"
          name="differentiation_score"
          value={form.differentiation_score}
          onChange={onChange}
          help={FIELD_HELP.differentiation_score}
          options={[1, 2, 3, 4, 5]}
        />

        <ScoreInput
          label="Urgency - What's the cost of not doing this?"
          name="urgency_score"
          value={form.urgency_score}
          onChange={onChange}
          help={FIELD_HELP.urgency_score}
          options={[1, 2, 3, 4, 5]}
        />
      </div>
    </div>
  )
}

function Step4Confidence({ form, onChange }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Confidence Assessment</h2>
      <p className="text-sm text-gray-600">
        How confident are you in the estimates provided? This affects the final value range.
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Confidence Level</label>
        <div className="space-y-2">
          {CONFIDENCE_LEVELS.map(level => (
            <label
              key={level}
              className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                form.confidence_level === level
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              <input
                type="radio"
                name="confidence_level"
                value={level}
                checked={form.confidence_level === level}
                onChange={() => onChange('confidence_level', level)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                form.confidence_level === level ? 'border-indigo-600' : 'border-gray-300'
              }`}>
                {form.confidence_level === level && (
                  <div className="w-2 h-2 rounded-full bg-indigo-600" />
                )}
              </div>
              <div>
                <span className="font-medium">{level}</span>
                <p className="text-sm text-gray-500">{CONFIDENCE_DESCRIPTIONS[level]}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <TextInput
        label="Confidence Notes"
        name="confidence_notes"
        value={form.confidence_notes}
        onChange={onChange}
        help="What data or assumptions is this estimate based on? What would increase your confidence?"
        multiline
      />
    </div>
  )
}

function Step5Results({ valuation, product, history }) {
  const formatCurrency = (amount) => {
    if (amount == null) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num) => {
    if (num == null) return 'N/A'
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const showInternal = product.product_type === 'Internal' || product.product_type === 'Both'
  const showExternal = product.product_type === 'External' || product.product_type === 'Both'

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Valuation Results</h2>

      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <p className="text-indigo-100 text-sm mb-1">Final Value Estimate</p>
        <div className="text-3xl font-bold">
          {formatCurrency(valuation.final_value_low)} - {formatCurrency(valuation.final_value_high)}
        </div>
        <div className="mt-2 flex items-center gap-4 text-sm">
          <span>Strategic Multiplier: {formatNumber(valuation.strategic_multiplier)}x</span>
          <span>Confidence: {valuation.confidence_level}</span>
        </div>
      </div>

      {valuation.rice_score != null && (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">RICE Score</p>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(valuation.rice_score)}</p>
        </div>
      )}

      {showInternal && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-medium text-purple-800 mb-3">Internal Value Breakdown</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Time Savings (Annual)</p>
              <p className="font-medium">{formatCurrency(valuation.annual_time_savings_value)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Error Reduction (Annual)</p>
              <p className="font-medium">{formatCurrency(valuation.annual_error_reduction_value)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cost Avoidance (Annual)</p>
              <p className="font-medium">{formatCurrency(valuation.annual_cost_avoidance_value)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Risk Mitigation (Annual)</p>
              <p className="font-medium">{formatCurrency(valuation.annual_risk_mitigation_value)}</p>
            </div>
          </div>
          {(valuation.adoption_adjusted_annual_value || valuation.total_training_cost) && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium text-purple-700 mb-2">Adoption Adjustments</h4>
              <div className="grid grid-cols-2 gap-4">
                {valuation.adoption_adjusted_annual_value && (
                  <div>
                    <p className="text-sm text-gray-500">Adoption-Adjusted Value</p>
                    <p className="font-medium">{formatCurrency(valuation.adoption_adjusted_annual_value)}</p>
                  </div>
                )}
                {valuation.total_training_cost && (
                  <div>
                    <p className="text-sm text-gray-500">Total Training Cost</p>
                    <p className="font-medium text-red-600">-{formatCurrency(valuation.total_training_cost)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {showExternal && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-medium text-orange-800 mb-3">External Value Breakdown</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Gross 3-Year Revenue</p>
              <p className="font-medium">{formatCurrency(valuation.three_year_revenue_projection)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Net 3-Year Revenue</p>
              <p className="font-medium text-green-600">{formatCurrency(valuation.net_three_year_revenue)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Customer LTV</p>
              <p className="font-medium">{formatCurrency(valuation.customer_ltv)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">LTV:CAC Ratio</p>
              <p className={`font-medium ${valuation.ltv_cac_ratio >= 3 ? 'text-green-600' : valuation.ltv_cac_ratio >= 1 ? 'text-yellow-600' : 'text-red-600'}`}>
                {valuation.ltv_cac_ratio ? `${formatNumber(valuation.ltv_cac_ratio)}x` : 'N/A'}
                {valuation.ltv_cac_ratio && valuation.ltv_cac_ratio >= 3 && <span className="ml-1 text-xs">(Healthy)</span>}
                {valuation.ltv_cac_ratio && valuation.ltv_cac_ratio < 3 && valuation.ltv_cac_ratio >= 1 && <span className="ml-1 text-xs">(Caution)</span>}
                {valuation.ltv_cac_ratio && valuation.ltv_cac_ratio < 1 && <span className="ml-1 text-xs">(Unsustainable)</span>}
              </p>
            </div>
          </div>
          {(valuation.customer_payback_months || valuation.year_1_revenue) && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4">
                {valuation.customer_payback_months && (
                  <div>
                    <p className="text-sm text-gray-500">Customer Payback</p>
                    <p className={`font-medium ${valuation.customer_payback_months <= 12 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {formatNumber(valuation.customer_payback_months)} months
                    </p>
                  </div>
                )}
              </div>
              {valuation.year_1_revenue && valuation.year_2_revenue && valuation.year_3_revenue && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Revenue by Year</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-orange-50 rounded p-2">
                      <p className="text-xs text-gray-500">Year 1</p>
                      <p className="font-medium">{formatCurrency(valuation.year_1_revenue)}</p>
                    </div>
                    <div className="bg-orange-50 rounded p-2">
                      <p className="text-xs text-gray-500">Year 2</p>
                      <p className="font-medium">{formatCurrency(valuation.year_2_revenue)}</p>
                    </div>
                    <div className="bg-orange-50 rounded p-2">
                      <p className="text-xs text-gray-500">Year 3</p>
                      <p className="font-medium">{formatCurrency(valuation.year_3_revenue)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Total Economic Value</h3>
        <p className="text-2xl font-bold text-indigo-600">{formatCurrency(valuation.total_economic_value)}</p>
        <p className="text-sm text-gray-500 mt-1">Before strategic multiplier and confidence adjustments</p>
      </div>

      {history && history.length > 1 && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Valuation History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4">Date</th>
                  <th className="text-right py-2 px-4">Value Range</th>
                  <th className="text-right py-2 px-4">RICE</th>
                  <th className="text-center py-2 pl-4">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 5).map((h, idx) => (
                  <tr key={h.id} className={idx === 0 ? 'bg-indigo-50' : ''}>
                    <td className="py-2 pr-4 text-gray-600">
                      {formatDate(h.created_at)}
                      {idx === 0 && <span className="ml-2 text-xs text-indigo-600">(Current)</span>}
                    </td>
                    <td className="py-2 px-4 text-right font-medium">
                      {formatCurrency(h.final_value_low)} - {formatCurrency(h.final_value_high)}
                    </td>
                    <td className="py-2 px-4 text-right">
                      {h.rice_score != null ? formatNumber(h.rice_score) : '-'}
                    </td>
                    <td className="py-2 pl-4 text-center">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        h.confidence_level === 'High' ? 'bg-green-100 text-green-800' :
                        h.confidence_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        h.confidence_level === 'Low' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {h.confidence_level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {history.length > 5 && (
            <p className="text-xs text-gray-500 mt-2">Showing last 5 of {history.length} updates</p>
          )}
        </div>
      )}
    </div>
  )
}

function QuickEstimateForm({ product, form, onChange, onSave, onExpand, saving }) {
  const showInternal = product.product_type === 'Internal' || product.product_type === 'Both'
  const showExternal = product.product_type === 'External' || product.product_type === 'Both'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Quick Estimate</h2>
          <p className="text-sm text-gray-500 mt-1">Fill in just the essentials for a rough valuation</p>
        </div>
        <button
          onClick={onExpand}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          Switch to Full Wizard →
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Quick estimates use default strategic scores (all 3s) and Low confidence. 
          Use the full wizard for more accurate valuations.
        </p>
      </div>

      {showInternal && (
        <div className="border rounded-lg p-4">
          <h3 className="font-medium text-purple-800 mb-4 flex items-center">
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm mr-2">Internal</span>
            Time Savings (Primary Driver)
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <NumberInput
              label="Hours Saved / User / Week"
              name="hours_saved_per_user_per_week"
              value={form.hours_saved_per_user_per_week}
              onChange={onChange}
              help={FIELD_HELP.hours_saved_per_user_per_week}
              min={0}
              step={0.5}
            />
            <NumberInput
              label="Number of Users"
              name="number_of_affected_users"
              value={form.number_of_affected_users}
              onChange={onChange}
              help={FIELD_HELP.number_of_affected_users}
              min={0}
            />
            <NumberInput
              label="Avg Hourly Cost"
              name="average_hourly_cost"
              value={form.average_hourly_cost}
              onChange={onChange}
              help={FIELD_HELP.average_hourly_cost}
              min={0}
              prefix="$"
            />
          </div>
        </div>
      )}

      {showExternal && (
        <div className="border rounded-lg p-4">
          <h3 className="font-medium text-orange-800 mb-4 flex items-center">
            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm mr-2">External</span>
            Market & Revenue (Primary Drivers)
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <NumberInput
              label="Total Potential Customers"
              name="total_potential_customers"
              value={form.total_potential_customers}
              onChange={onChange}
              help={FIELD_HELP.total_potential_customers}
              min={0}
            />
            <NumberInput
              label="Serviceable %"
              name="serviceable_percent"
              value={form.serviceable_percent}
              onChange={onChange}
              help={FIELD_HELP.serviceable_percent}
              min={0}
              max={100}
            />
            <NumberInput
              label="Market Share %"
              name="achievable_market_share_percent"
              value={form.achievable_market_share_percent}
              onChange={onChange}
              help={FIELD_HELP.achievable_market_share_percent}
              min={0}
              max={100}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <NumberInput
              label="Average Deal Size"
              name="average_deal_size"
              value={form.average_deal_size}
              onChange={onChange}
              help={FIELD_HELP.average_deal_size}
              min={0}
              prefix="$"
            />
            <NumberInput
              label="Gross Margin %"
              name="gross_margin_percent"
              value={form.gross_margin_percent}
              onChange={onChange}
              help={FIELD_HELP.gross_margin_percent}
              min={0}
              max={100}
            />
            <NumberInput
              label="Customer Lifetime (Months)"
              name="expected_customer_lifetime_months"
              value={form.expected_customer_lifetime_months}
              onChange={onChange}
              help={FIELD_HELP.expected_customer_lifetime_months}
              min={0}
            />
          </div>
        </div>
      )}

      {product.product_type === 'Both' && (
        <div className="border rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-4">Value Weight Split</h3>
          <div className="grid grid-cols-2 gap-4">
            <NumberInput
              label="Internal Value Weight (%)"
              name="internal_value_weight"
              value={form.internal_value_weight}
              onChange={onChange}
              min={0}
              max={100}
            />
            <NumberInput
              label="External Value Weight (%)"
              name="external_value_weight"
              value={form.external_value_weight}
              onChange={onChange}
              min={0}
              max={100}
            />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          onClick={onExpand}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Full Valuation
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"
        >
          {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
          Get Quick Estimate
        </button>
      </div>
    </div>
  )
}

export default function ValuationPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { addToast } = useToast()
  
  const productId = searchParams.get('product')
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [product, setProduct] = useState(null)
  const [existingValuation, setExistingValuation] = useState(null)
  const [valuationHistory, setValuationHistory] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [mode, setMode] = useState('quick')
  const [showResults, setShowResults] = useState(false)
  
  const [form, setForm] = useState({
    confidence_level: 'Medium',
    confidence_notes: '',
    hours_saved_per_user_per_week: null,
    number_of_affected_users: null,
    average_hourly_cost: null,
    current_errors_per_month: null,
    cost_per_error: null,
    expected_error_reduction_percent: null,
    alternative_solution_cost: null,
    alternative_solution_period: null,
    risk_description: '',
    risk_probability_percent: null,
    risk_cost_if_occurs: null,
    risk_reduction_percent: null,
    expected_adoption_rate_percent: null,
    training_cost_per_user: null,
    rollout_months: null,
    time_to_full_productivity_weeks: null,
    process_standardization_annual_value: null,
    target_customer_segment: '',
    total_potential_customers: null,
    serviceable_percent: null,
    achievable_market_share_percent: null,
    price_per_unit: null,
    pricing_model: null,
    average_deal_size: null,
    sales_cycle_months: null,
    conversion_rate_percent: null,
    gross_margin_percent: null,
    expected_customer_lifetime_months: null,
    customer_acquisition_cost: null,
    monthly_churn_rate_percent: null,
    annual_marketing_spend: null,
    annual_sales_team_cost: null,
    year_1_customers: null,
    year_2_customers: null,
    year_3_customers: null,
    competitor_name: '',
    competitor_pricing: null,
    differentiation_summary: '',
    internal_value_weight: 50,
    external_value_weight: 50,
    reach_score: null,
    impact_score: null,
    strategic_alignment_score: null,
    differentiation_score: null,
    urgency_score: null,
  })

  const steps = ['Product Info', 'Value Drivers', 'Strategic Assessment', 'Confidence', 'Results']

  useEffect(() => {
    if (!productId) {
      setError('No product selected')
      setLoading(false)
      return
    }
    fetchData()
  }, [productId])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [productRes, valuationRes, historyRes] = await Promise.all([
        fetch(`${API_BASE}/products/${productId}`),
        fetch(`${API_BASE}/valuations/product/${productId}`),
        fetch(`${API_BASE}/valuations/product/${productId}/history`)
      ])
      
      const productData = await productRes.json()
      if (!productData.success) throw new Error('Product not found')
      setProduct(productData.data)
      
      const historyData = await historyRes.json()
      if (historyData.success) {
        setValuationHistory(historyData.data)
      }
      
      const valuationData = await valuationRes.json()
      if (valuationData.success && valuationData.data) {
        setExistingValuation(valuationData.data)
        setShowResults(true)
        setMode('full')
        const v = valuationData.data
        setForm({
          confidence_level: v.confidence_level || 'Medium',
          confidence_notes: v.confidence_notes || '',
          hours_saved_per_user_per_week: v.hours_saved_per_user_per_week,
          number_of_affected_users: v.number_of_affected_users,
          average_hourly_cost: v.average_hourly_cost,
          current_errors_per_month: v.current_errors_per_month,
          cost_per_error: v.cost_per_error,
          expected_error_reduction_percent: v.expected_error_reduction_percent,
          alternative_solution_cost: v.alternative_solution_cost,
          alternative_solution_period: v.alternative_solution_period,
          risk_description: v.risk_description || '',
          risk_probability_percent: v.risk_probability_percent,
          risk_cost_if_occurs: v.risk_cost_if_occurs,
          risk_reduction_percent: v.risk_reduction_percent,
          expected_adoption_rate_percent: v.expected_adoption_rate_percent,
          training_cost_per_user: v.training_cost_per_user,
          rollout_months: v.rollout_months,
          time_to_full_productivity_weeks: v.time_to_full_productivity_weeks,
          process_standardization_annual_value: v.process_standardization_annual_value,
          target_customer_segment: v.target_customer_segment || '',
          total_potential_customers: v.total_potential_customers,
          serviceable_percent: v.serviceable_percent,
          achievable_market_share_percent: v.achievable_market_share_percent,
          price_per_unit: v.price_per_unit,
          pricing_model: v.pricing_model,
          average_deal_size: v.average_deal_size,
          sales_cycle_months: v.sales_cycle_months,
          conversion_rate_percent: v.conversion_rate_percent,
          gross_margin_percent: v.gross_margin_percent,
          expected_customer_lifetime_months: v.expected_customer_lifetime_months,
          customer_acquisition_cost: v.customer_acquisition_cost,
          monthly_churn_rate_percent: v.monthly_churn_rate_percent,
          annual_marketing_spend: v.annual_marketing_spend,
          annual_sales_team_cost: v.annual_sales_team_cost,
          year_1_customers: v.year_1_customers,
          year_2_customers: v.year_2_customers,
          year_3_customers: v.year_3_customers,
          competitor_name: v.competitor_name || '',
          competitor_pricing: v.competitor_pricing,
          differentiation_summary: v.differentiation_summary || '',
          internal_value_weight: v.internal_value_weight ?? 50,
          external_value_weight: v.external_value_weight ?? 50,
          reach_score: v.reach_score,
          impact_score: v.impact_score,
          strategic_alignment_score: v.strategic_alignment_score,
          differentiation_score: v.differentiation_score,
          urgency_score: v.urgency_score,
        })
      } else {
        const template = QUICK_TEMPLATES[productData.data.product_type] || QUICK_TEMPLATES.Internal
        setForm(prev => ({ ...prev, ...template }))
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async (isQuick = false) => {
    setSaving(true)
    try {
      const payload = { ...form, product_id: parseInt(productId) }
      
      const url = existingValuation
        ? `${API_BASE}/valuations/product/${productId}`
        : `${API_BASE}/valuations`
      const method = existingValuation ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const data = await res.json()
      if (!data.success) throw new Error(data.detail || 'Failed to save')
      
      setExistingValuation(data.data)
      addToast('Valuation saved successfully', 'success')
      
      const historyRes = await fetch(`${API_BASE}/valuations/product/${productId}/history`)
      const historyData = await historyRes.json()
      if (historyData.success) {
        setValuationHistory(historyData.data)
      }
      
      if (isQuick) {
        setShowResults(true)
      } else {
        setCurrentStep(4)
      }
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleExpandToFull = () => {
    setMode('full')
    setShowResults(false)
    setCurrentStep(0)
  }

  const handleNext = () => {
    if (currentStep === 3) {
      handleSave()
    } else {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  if (loading) return <LoadingPage />

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Product Valuation</h1>
        <ErrorState message={error} onRetry={() => navigate('/products')} retryText="Back to Products" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {existingValuation ? 'Edit' : 'Create'} Valuation: {product.name}
        </h1>
        <button
          onClick={() => navigate('/products')}
          className="text-gray-600 hover:text-gray-900"
        >
          Back to Products
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {mode === 'quick' && !showResults ? (
          <QuickEstimateForm
            product={product}
            form={form}
            onChange={handleChange}
            onSave={() => handleSave(true)}
            onExpand={handleExpandToFull}
            saving={saving}
          />
        ) : showResults && existingValuation ? (
          <div>
            <Step5Results valuation={existingValuation} product={product} history={valuationHistory} />
            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                onClick={() => navigate('/products')}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Back to Products
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const template = QUICK_TEMPLATES[product.product_type] || QUICK_TEMPLATES.Internal
                    setForm(prev => ({ ...prev, ...template, confidence_level: prev.confidence_level, confidence_notes: prev.confidence_notes }))
                    setMode('quick')
                    setShowResults(false)
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Edit Quick Estimate
                </button>
                <button
                  onClick={() => {
                    setMode('full')
                    setShowResults(false)
                    setCurrentStep(0)
                  }}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Edit Full Valuation
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <StepIndicator steps={steps} currentStep={currentStep} />

            <div className="min-h-[400px]">
              {currentStep === 0 && <Step1ProductInfo product={product} />}
              {currentStep === 1 && (
                <Step2ValueDrivers
                  productType={product.product_type}
                  form={form}
                  onChange={handleChange}
                />
              )}
              {currentStep === 2 && <Step3StrategicAssessment form={form} onChange={handleChange} />}
              {currentStep === 3 && <Step4Confidence form={form} onChange={handleChange} />}
              {currentStep === 4 && existingValuation && (
                <Step5Results valuation={existingValuation} product={product} history={valuationHistory} />
              )}
            </div>

            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
              
              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  disabled={saving}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                >
                  {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
                  {currentStep === 3 ? 'Save & View Results' : 'Next'}
                </button>
              ) : (
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Edit Valuation
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
