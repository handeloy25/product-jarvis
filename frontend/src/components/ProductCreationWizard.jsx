import { useState, useEffect } from 'react'
import { useToast } from './Toast'
import QuickEstimateCalculator from './QuickEstimateCalculator'

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

const FIELD_HELP = {
  hours_saved_per_user_per_week: 'How many hours per week will each user save?',
  number_of_affected_users: 'How many employees will use this product regularly?',
  average_hourly_cost: 'Fully-loaded hourly cost (salary + benefits + overhead)',
  current_errors_per_month: 'How many errors/mistakes occur monthly?',
  cost_per_error: 'Average cost to fix each error.',
  expected_error_reduction_percent: 'What percentage of errors will be eliminated?',
  alternative_solution_cost: 'What would you pay for an alternative solution?',
  risk_description: 'What risk does this mitigate?',
  risk_probability_percent: 'Annual probability this risk occurs without this product?',
  risk_cost_if_occurs: 'Estimated cost if the risk happens?',
  risk_reduction_percent: 'How much does this product reduce the risk?',
  expected_adoption_rate_percent: 'What % of target users will actually use this?',
  training_cost_per_user: 'Cost to train each user.',
  time_to_full_productivity_weeks: 'Weeks until users are fully productive.',
  total_potential_customers: 'How many companies/people fit your target segment (TAM)?',
  serviceable_percent: 'What percentage can you realistically reach (SAM)?',
  achievable_market_share_percent: 'What market share can you capture in 3 years?',
  average_deal_size: 'Expected average contract value.',
  gross_margin_percent: 'Revenue minus direct costs. SaaS typically 70-85%.',
  expected_customer_lifetime_months: 'How long will the average customer stay?',
  monthly_churn_rate_percent: 'What % of customers cancel per month?',
  customer_acquisition_cost: 'How much to acquire one customer?',
  reach_score: '1=Few individuals, 3=One department, 5=Entire company',
  impact_score: '0.25=Minimal, 1=Medium, 3=Massive',
  strategic_alignment_score: '1=Nice-to-have, 3=Key initiative, 5=Critical',
  differentiation_score: '1=Commodity, 3=Somewhat unique, 5=True differentiator',
  urgency_score: '1=No rush, 3=This year, 5=Critical/blocking'
}

function HelpTooltip({ text }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-flex items-center ml-1">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        aria-label="Help"
        className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 rounded-full p-1.5 -m-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      {show && (
        <div className="absolute z-50 w-64 p-2 text-xs text-white bg-gray-800 rounded shadow-lg -left-28 bottom-8" role="tooltip">
          {text}
        </div>
      )}
    </span>
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
          className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 ${prefix ? 'pl-7' : ''}`}
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
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
        />
      ) : (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(name, e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
        />
      )}
    </div>
  )
}

function SelectInput({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Select...</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
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

function StepIndicator({ currentStep, steps }) {
  return (
    <div className="flex items-center justify-center mb-6">
      {steps.map((step, idx) => (
        <div key={idx} className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            currentStep === idx + 1 
              ? 'bg-indigo-600 text-white' 
              : currentStep > idx + 1 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-600'
          }`}>
            {currentStep > idx + 1 ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : idx + 1}
          </div>
          <span className={`ml-2 text-sm ${currentStep === idx + 1 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
            {step}
          </span>
          {idx < steps.length - 1 && (
            <div className={`w-12 h-0.5 mx-3 ${currentStep > idx + 1 ? 'bg-green-500' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function Step1BasicInfo({ formData, setFormData, serviceDepartments, businessUnits, onNext, onCancel }) {
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Requested By</label>
        <div className="flex gap-4 mb-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="requestor_type"
              value="business_unit"
              checked={formData.requestor_type === 'business_unit'}
              onChange={(e) => setFormData({ ...formData, requestor_type: e.target.value, requestor_id: '' })}
              className="mr-2"
            />
            <span className="text-sm">Business Unit (Brand)</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="requestor_type"
              value="service_department"
              checked={formData.requestor_type === 'service_department'}
              onChange={(e) => setFormData({ ...formData, requestor_type: e.target.value, business_unit: '' })}
              className="mr-2"
            />
            <span className="text-sm">Service Department</span>
          </label>
        </div>
        {formData.requestor_type === 'business_unit' ? (
          <select
            value={formData.requestor_business_unit_id || ''}
            onChange={(e) => setFormData({
              ...formData,
              requestor_business_unit_id: e.target.value ? parseInt(e.target.value) : '',
              business_unit: businessUnits.find(bu => bu.id === parseInt(e.target.value))?.name || ''
            })}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select business unit...</option>
            {businessUnits.map(bu => (
              <option key={bu.id} value={bu.id}>{bu.name}</option>
            ))}
          </select>
        ) : (
          <select
            value={formData.requestor_id}
            onChange={(e) => setFormData({ ...formData, requestor_id: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select department...</option>
            {serviceDepartments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 ${errors.name ? 'border-red-500' : ''}`}
          placeholder="What is this product called?"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
          placeholder="Brief description of what this product does..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
        <div className="flex gap-4">
          {['Internal', 'External'].map(type => (
            <label key={type} className="flex items-center">
              <input
                type="radio"
                name="product_type"
                value={type}
                checked={formData.product_type === type}
                onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                className="mr-2"
              />
              <span className="text-sm">{type}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {formData.product_type === 'Internal' 
            ? 'Internal products save time or reduce costs for internal teams' 
            : 'External products generate revenue from customers'}
        </p>
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={onCancel} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
          Cancel
        </button>
        <button
          onClick={() => validate() && onNext()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Next
        </button>
      </div>
    </div>
  )
}

function Step2ValuationMethod({ onSelect, onBack, onCancel }) {
  return (
    <div className="space-y-6">
      <p className="text-gray-600 text-center">How would you like to estimate this product's value?</p>
      
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onSelect('quick')}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left"
        >
          <div className="flex items-center mb-2">
            <svg className="w-6 h-6 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold text-gray-900">Quick Estimate</span>
          </div>
          <p className="text-sm text-gray-600 mb-2">Simple calculator for fast estimates</p>
          <div className="flex items-center text-xs text-gray-500">
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded mr-2">~2 min</span>
            <span>Low confidence</span>
          </div>
        </button>

        <button
          onClick={() => onSelect('full')}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left"
        >
          <div className="flex items-center mb-2">
            <svg className="w-6 h-6 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold text-gray-900">Full Valuation</span>
          </div>
          <p className="text-sm text-gray-600 mb-2">Comprehensive valuation with all value drivers</p>
          <div className="flex items-center text-xs text-gray-500">
            <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded mr-2">~15 min</span>
            <span>Higher confidence</span>
          </div>
        </button>
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
          Back
        </button>
        <button onClick={onCancel} className="px-4 py-2 text-gray-500 hover:text-gray-700">
          Save as Draft
        </button>
      </div>
    </div>
  )
}

function Step3QuickEstimate({ productType, onComplete, onBack, onCancel }) {
  const [calculatedValue, setCalculatedValue] = useState(null)
  const [inputs, setInputs] = useState(null)

  const handleCalculate = (value, inputData) => {
    setCalculatedValue(value)
    setInputs(inputData)
  }

  return (
    <div className="space-y-4">
      <QuickEstimateCalculator productType={productType} onCalculate={handleCalculate} />

      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
          Back
        </button>
        <div className="flex gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-gray-500 hover:text-gray-700">
            Save as Draft
          </button>
          <button
            onClick={() => onComplete(calculatedValue, inputs)}
            disabled={!calculatedValue}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

function FullValuationForm({ productType, form, onChange, onNext, onBack }) {
  const [section, setSection] = useState(0)
  const showInternal = productType === 'Internal'
  const showExternal = productType === 'External'

  const internalSections = [
    { name: 'Time Savings', key: 'time' },
    { name: 'Error Reduction', key: 'error' },
    { name: 'Cost Avoidance', key: 'cost' },
    { name: 'Risk Mitigation', key: 'risk' },
    { name: 'Adoption & Rollout', key: 'adoption' },
    { name: 'Strategic Assessment', key: 'strategic' },
    { name: 'Confidence', key: 'confidence' },
  ]

  const externalSections = [
    { name: 'Market Sizing', key: 'market' },
    { name: 'Revenue Projection', key: 'revenue' },
    { name: 'Customer Economics', key: 'customer' },
    { name: 'Go-to-Market', key: 'gtm' },
    { name: 'Growth Projections', key: 'growth' },
    { name: 'Strategic Assessment', key: 'strategic' },
    { name: 'Confidence', key: 'confidence' },
  ]

  const sections = showInternal ? internalSections : externalSections

  const renderInternalSection = () => {
    switch (sections[section].key) {
      case 'time':
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-purple-800 flex items-center">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm mr-2">Internal</span>
              Time Savings
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <NumberInput label="Hours Saved / User / Week" name="hours_saved_per_user_per_week" value={form.hours_saved_per_user_per_week} onChange={onChange} help={FIELD_HELP.hours_saved_per_user_per_week} min={0} step={0.5} />
              <NumberInput label="Number of Users" name="number_of_affected_users" value={form.number_of_affected_users} onChange={onChange} help={FIELD_HELP.number_of_affected_users} min={0} />
              <NumberInput label="Avg Hourly Cost" name="average_hourly_cost" value={form.average_hourly_cost} onChange={onChange} help={FIELD_HELP.average_hourly_cost} min={0} prefix="$" />
            </div>
          </div>
        )
      case 'error':
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-purple-800 flex items-center">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm mr-2">Internal</span>
              Error Reduction
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <NumberInput label="Errors per Month" name="current_errors_per_month" value={form.current_errors_per_month} onChange={onChange} help={FIELD_HELP.current_errors_per_month} min={0} />
              <NumberInput label="Cost per Error" name="cost_per_error" value={form.cost_per_error} onChange={onChange} help={FIELD_HELP.cost_per_error} min={0} prefix="$" />
              <NumberInput label="Error Reduction %" name="expected_error_reduction_percent" value={form.expected_error_reduction_percent} onChange={onChange} help={FIELD_HELP.expected_error_reduction_percent} min={0} max={100} />
            </div>
          </div>
        )
      case 'cost':
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-purple-800 flex items-center">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm mr-2">Internal</span>
              Cost Avoidance
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <NumberInput label="Alternative Solution Cost" name="alternative_solution_cost" value={form.alternative_solution_cost} onChange={onChange} help={FIELD_HELP.alternative_solution_cost} min={0} prefix="$" />
              <SelectInput label="Cost Period" name="alternative_solution_period" value={form.alternative_solution_period} onChange={onChange} options={ALTERNATIVE_PERIODS} />
            </div>
          </div>
        )
      case 'risk':
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-purple-800 flex items-center">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm mr-2">Internal</span>
              Risk Mitigation
            </h3>
            <TextInput label="Risk Description" name="risk_description" value={form.risk_description} onChange={onChange} help={FIELD_HELP.risk_description} multiline />
            <div className="grid grid-cols-3 gap-4">
              <NumberInput label="Risk Probability %" name="risk_probability_percent" value={form.risk_probability_percent} onChange={onChange} help={FIELD_HELP.risk_probability_percent} min={0} max={100} />
              <NumberInput label="Cost if Occurs" name="risk_cost_if_occurs" value={form.risk_cost_if_occurs} onChange={onChange} help={FIELD_HELP.risk_cost_if_occurs} min={0} prefix="$" />
              <NumberInput label="Risk Reduction %" name="risk_reduction_percent" value={form.risk_reduction_percent} onChange={onChange} help={FIELD_HELP.risk_reduction_percent} min={0} max={100} />
            </div>
          </div>
        )
      case 'adoption':
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-purple-800 flex items-center">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm mr-2">Internal</span>
              Adoption & Rollout
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <NumberInput label="Expected Adoption Rate %" name="expected_adoption_rate_percent" value={form.expected_adoption_rate_percent} onChange={onChange} help={FIELD_HELP.expected_adoption_rate_percent} min={0} max={100} />
              <NumberInput label="Training Cost per User" name="training_cost_per_user" value={form.training_cost_per_user} onChange={onChange} help={FIELD_HELP.training_cost_per_user} min={0} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <NumberInput label="Rollout Months" name="rollout_months" value={form.rollout_months} onChange={onChange} min={0} />
              <NumberInput label="Time to Full Productivity (weeks)" name="time_to_full_productivity_weeks" value={form.time_to_full_productivity_weeks} onChange={onChange} help={FIELD_HELP.time_to_full_productivity_weeks} min={0} />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const renderExternalSection = () => {
    switch (sections[section].key) {
      case 'market':
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-orange-800 flex items-center">
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm mr-2">External</span>
              Market Sizing
            </h3>
            <TextInput label="Target Customer Segment" name="target_customer_segment" value={form.target_customer_segment} onChange={onChange} />
            <div className="grid grid-cols-3 gap-4">
              <NumberInput label="Total Potential Customers (TAM)" name="total_potential_customers" value={form.total_potential_customers} onChange={onChange} help={FIELD_HELP.total_potential_customers} min={0} />
              <NumberInput label="Serviceable % (SAM)" name="serviceable_percent" value={form.serviceable_percent} onChange={onChange} help={FIELD_HELP.serviceable_percent} min={0} max={100} />
              <NumberInput label="Market Share % (SOM)" name="achievable_market_share_percent" value={form.achievable_market_share_percent} onChange={onChange} help={FIELD_HELP.achievable_market_share_percent} min={0} max={100} />
            </div>
          </div>
        )
      case 'revenue':
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-orange-800 flex items-center">
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm mr-2">External</span>
              Revenue Projection
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <NumberInput label="Price per Unit" name="price_per_unit" value={form.price_per_unit} onChange={onChange} min={0} prefix="$" />
              <SelectInput label="Pricing Model" name="pricing_model" value={form.pricing_model} onChange={onChange} options={PRICING_MODELS} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <NumberInput label="Average Deal Size" name="average_deal_size" value={form.average_deal_size} onChange={onChange} help={FIELD_HELP.average_deal_size} min={0} prefix="$" />
              <NumberInput label="Sales Cycle (Months)" name="sales_cycle_months" value={form.sales_cycle_months} onChange={onChange} min={0} />
              <NumberInput label="Conversion Rate %" name="conversion_rate_percent" value={form.conversion_rate_percent} onChange={onChange} min={0} max={100} />
            </div>
          </div>
        )
      case 'customer':
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-orange-800 flex items-center">
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm mr-2">External</span>
              Customer Economics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <NumberInput label="Gross Margin %" name="gross_margin_percent" value={form.gross_margin_percent} onChange={onChange} help={FIELD_HELP.gross_margin_percent} min={0} max={100} />
              <NumberInput label="Monthly Churn Rate %" name="monthly_churn_rate_percent" value={form.monthly_churn_rate_percent} onChange={onChange} help={FIELD_HELP.monthly_churn_rate_percent} min={0} max={100} step={0.1} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <NumberInput label="Customer Lifetime (Months)" name="expected_customer_lifetime_months" value={form.expected_customer_lifetime_months} onChange={onChange} help={FIELD_HELP.expected_customer_lifetime_months} min={0} />
              <NumberInput label="Customer Acquisition Cost (CAC)" name="customer_acquisition_cost" value={form.customer_acquisition_cost} onChange={onChange} help={FIELD_HELP.customer_acquisition_cost} min={0} prefix="$" />
            </div>
          </div>
        )
      case 'gtm':
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-orange-800 flex items-center">
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm mr-2">External</span>
              Go-to-Market Costs
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <NumberInput label="Annual Marketing Spend" name="annual_marketing_spend" value={form.annual_marketing_spend} onChange={onChange} min={0} prefix="$" />
              <NumberInput label="Annual Sales Team Cost" name="annual_sales_team_cost" value={form.annual_sales_team_cost} onChange={onChange} min={0} prefix="$" />
            </div>
          </div>
        )
      case 'growth':
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-orange-800 flex items-center">
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm mr-2">External</span>
              Customer Growth (3-Year)
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <NumberInput label="Year 1 Customers" name="year_1_customers" value={form.year_1_customers} onChange={onChange} min={0} />
              <NumberInput label="Year 2 Customers" name="year_2_customers" value={form.year_2_customers} onChange={onChange} min={0} />
              <NumberInput label="Year 3 Customers" name="year_3_customers" value={form.year_3_customers} onChange={onChange} min={0} />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const renderStrategicSection = () => (
    <div className="space-y-6">
      <h3 className="font-medium text-gray-900">Strategic Assessment</h3>
      <p className="text-sm text-gray-600">Rate each dimension to calculate a strategic multiplier.</p>
      <ScoreInput label="Reach - How many people are affected?" name="reach_score" value={form.reach_score} onChange={onChange} help={FIELD_HELP.reach_score} options={[1, 2, 3, 4, 5]} />
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
                form.impact_score === opt ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
              }`}
            >
              {opt === 0.25 ? 'Minimal' : opt === 0.5 ? 'Low' : opt === 1 ? 'Medium' : opt === 2 ? 'High' : 'Massive'}
            </button>
          ))}
        </div>
      </div>
      <ScoreInput label="Strategic Alignment - How core to company strategy?" name="strategic_alignment_score" value={form.strategic_alignment_score} onChange={onChange} help={FIELD_HELP.strategic_alignment_score} options={[1, 2, 3, 4, 5]} />
      <ScoreInput label="Differentiation - Does this create competitive advantage?" name="differentiation_score" value={form.differentiation_score} onChange={onChange} help={FIELD_HELP.differentiation_score} options={[1, 2, 3, 4, 5]} />
      <ScoreInput label="Urgency - What's the cost of not doing this?" name="urgency_score" value={form.urgency_score} onChange={onChange} help={FIELD_HELP.urgency_score} options={[1, 2, 3, 4, 5]} />
    </div>
  )

  const renderConfidenceSection = () => (
    <div className="space-y-6">
      <h3 className="font-medium text-gray-900">Confidence Assessment</h3>
      <p className="text-sm text-gray-600">How confident are you in the estimates provided?</p>
      <div className="space-y-2">
        {CONFIDENCE_LEVELS.map(level => (
          <label
            key={level}
            className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
              form.confidence_level === level ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
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
              {form.confidence_level === level && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
            </div>
            <div>
              <span className="font-medium">{level}</span>
              <p className="text-sm text-gray-500">{CONFIDENCE_DESCRIPTIONS[level]}</p>
            </div>
          </label>
        ))}
      </div>
      <TextInput label="Confidence Notes" name="confidence_notes" value={form.confidence_notes} onChange={onChange} multiline />
    </div>
  )

  const renderCurrentSection = () => {
    if (sections[section].key === 'strategic') return renderStrategicSection()
    if (sections[section].key === 'confidence') return renderConfidenceSection()
    return showInternal ? renderInternalSection() : renderExternalSection()
  }

  const isLastSection = section === sections.length - 1

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sections.map((s, idx) => (
          <button
            key={s.key}
            onClick={() => setSection(idx)}
            className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
              idx === section ? 'bg-indigo-600 text-white' : idx < section ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {idx < section && '✓ '}{s.name}
          </button>
        ))}
      </div>

      <div className="min-h-[300px]">
        {renderCurrentSection()}
      </div>

      <div className="flex justify-between pt-4 border-t">
        <button
          onClick={section === 0 ? onBack : () => setSection(section - 1)}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Back
        </button>
        <button
          onClick={isLastSection ? onNext : () => setSection(section + 1)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          {isLastSection ? 'Continue to Results' : 'Next Section'}
        </button>
      </div>
    </div>
  )
}

function Step4RawOutput({ productType, calculatedValue, onComplete, onBack, saving }) {
  const [rawOutput, setRawOutput] = useState('')
  const [errors, setErrors] = useState({})

  const toolName = productType === 'Internal' ? 'Internal Valuation Assistant' : 'External Valuation Assistant'

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
  }

  const validate = () => {
    const newErrors = {}
    if (!rawOutput.trim()) newErrors.rawOutput = 'Please paste the raw valuation output'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="text-sm text-gray-600 mb-1">Calculated Monthly Value</div>
        <div className="text-3xl font-bold text-green-700">{formatCurrency(calculatedValue)}</div>
        <div className="text-sm text-gray-500">{formatCurrency(calculatedValue * 12)} annually</div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Final Step: Save Raw Output</h3>
        <p className="text-sm text-blue-800">
          Open the <strong>{toolName}</strong> and complete the guided conversation. Then paste the entire output below for record-keeping and auditing.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Raw Valuation Output</label>
        <textarea
          value={rawOutput}
          onChange={(e) => setRawOutput(e.target.value)}
          rows={10}
          className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 font-mono text-sm ${errors.rawOutput ? 'border-red-500' : ''}`}
          placeholder="Paste the entire output from the Valuation Assistant here..."
        />
        {errors.rawOutput && <p className="text-red-500 text-xs mt-1">{errors.rawOutput}</p>}
        <p className="text-xs text-gray-500 mt-1">This will be saved for reference and auditing</p>
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={onBack} disabled={saving} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50">
          Back
        </button>
        <button
          onClick={() => validate() && onComplete(rawOutput)}
          disabled={saving}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
        >
          {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
          Complete Product
        </button>
      </div>
    </div>
  )
}

export default function ProductCreationWizard({ onComplete, onCancel }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    business_unit: '',
    requestor_business_unit_id: '',
    requestor_type: 'business_unit',
    requestor_id: '',
    product_type: 'Internal'
  })
  const [valuationType, setValuationType] = useState(null)
  const [calculatedValue, setCalculatedValue] = useState(null)
  const [quickEstimateInputs, setQuickEstimateInputs] = useState(null)
  const [serviceDepartments, setServiceDepartments] = useState([])
  const [businessUnits, setBusinessUnits] = useState([])
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()

  const [valuationForm, setValuationForm] = useState({
    confidence_level: 'Medium',
    confidence_notes: '',
    hours_saved_per_user_per_week: null,
    number_of_affected_users: null,
    average_hourly_cost: 50,
    current_errors_per_month: null,
    cost_per_error: null,
    expected_error_reduction_percent: null,
    alternative_solution_cost: null,
    alternative_solution_period: null,
    risk_description: '',
    risk_probability_percent: null,
    risk_cost_if_occurs: null,
    risk_reduction_percent: null,
    expected_adoption_rate_percent: 75,
    training_cost_per_user: 200,
    rollout_months: null,
    time_to_full_productivity_weeks: 4,
    target_customer_segment: '',
    total_potential_customers: null,
    serviceable_percent: 20,
    achievable_market_share_percent: 5,
    price_per_unit: null,
    pricing_model: null,
    average_deal_size: null,
    sales_cycle_months: null,
    conversion_rate_percent: null,
    gross_margin_percent: 70,
    expected_customer_lifetime_months: 24,
    customer_acquisition_cost: null,
    monthly_churn_rate_percent: 3,
    annual_marketing_spend: null,
    annual_sales_team_cost: null,
    year_1_customers: null,
    year_2_customers: null,
    year_3_customers: null,
    reach_score: 3,
    impact_score: 1,
    strategic_alignment_score: 3,
    differentiation_score: 3,
    urgency_score: 3,
  })

  useEffect(() => {
    fetch(`${API_BASE}/service-departments`)
      .then(res => res.json())
      .then(data => setServiceDepartments(data.data || []))
    fetch(`${API_BASE}/business-units`)
      .then(res => res.json())
      .then(data => setBusinessUnits(data.data || []))
  }, [])

  const handleValuationChange = (name, value) => {
    setValuationForm(prev => ({ ...prev, [name]: value }))
  }

  const calculateFullValuationValue = () => {
    const f = valuationForm
    let totalValue = 0

    if (formData.product_type === 'Internal') {
      const timeSavings = (f.hours_saved_per_user_per_week || 0) * (f.number_of_affected_users || 0) * (f.average_hourly_cost || 0) * 52
      const errorReduction = (f.current_errors_per_month || 0) * (f.cost_per_error || 0) * (f.expected_error_reduction_percent || 0) / 100 * 12
      let costAvoidance = f.alternative_solution_cost || 0
      if (f.alternative_solution_period === 'Monthly') costAvoidance *= 12
      const riskMitigation = (f.risk_probability_percent || 0) / 100 * (f.risk_cost_if_occurs || 0) * (f.risk_reduction_percent || 0) / 100
      totalValue = (timeSavings + errorReduction + costAvoidance + riskMitigation) * (f.expected_adoption_rate_percent || 100) / 100
    } else {
      const addressableCustomers = (f.total_potential_customers || 0) * (f.serviceable_percent || 0) / 100 * (f.achievable_market_share_percent || 0) / 100
      const ltv = (f.average_deal_size || 0) * (f.gross_margin_percent || 0) / 100 * (f.expected_customer_lifetime_months || 0) / 12
      totalValue = addressableCustomers * ltv
    }

    const strategicMultiplier = ((f.reach_score || 3) * (f.impact_score || 1) * (f.strategic_alignment_score || 3) * (f.differentiation_score || 3) * (f.urgency_score || 3)) / 81
    return (totalValue * strategicMultiplier) / 12
  }

  const handleSaveAsDraft = async () => {
    setSaving(true)
    try {
      const payload = {
        name: formData.name.trim() || 'Untitled Product',
        description: formData.description.trim(),
        business_unit: formData.requestor_type === 'business_unit' ? formData.business_unit.trim() || null : null,
        requestor_business_unit_id: formData.requestor_type === 'business_unit' ? formData.requestor_business_unit_id || null : null,
        requestor_type: formData.requestor_type,
        requestor_id: formData.requestor_type === 'service_department' ? parseInt(formData.requestor_id) || null : null,
        status: 'Draft',
        product_type: formData.product_type,
        estimated_value: 0
      }
      await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      addToast('Product saved as draft', 'success')
      onComplete()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleQuickEstimateComplete = async (value, inputs) => {
    setCalculatedValue(value)
    setQuickEstimateInputs(inputs)
    setStep(4)
  }

  const handleFullValuationNext = () => {
    const value = calculateFullValuationValue()
    setCalculatedValue(value)
    setStep(4)
  }

  const handleFinalComplete = async (rawOutput) => {
    setSaving(true)
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        business_unit: formData.requestor_type === 'business_unit' ? formData.business_unit.trim() || null : null,
        requestor_business_unit_id: formData.requestor_type === 'business_unit' ? formData.requestor_business_unit_id || null : null,
        requestor_type: formData.requestor_type,
        requestor_id: formData.requestor_type === 'service_department' ? parseInt(formData.requestor_id) || null : null,
        status: 'Ideation',
        product_type: formData.product_type,
        estimated_value: calculatedValue,
        valuation_type: valuationType,
        valuation_confidence: valuationType === 'quick' ? 'Low' : valuationForm.confidence_level,
        quick_estimate_inputs: valuationType === 'quick' ? JSON.stringify(quickEstimateInputs) : null
      }

      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Failed to create product')
      const data = await res.json()
      const productId = data.data.id

      await fetch(`${API_BASE}/products/${productId}/documents/raw-valuation-output`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: rawOutput })
      })

      if (valuationType === 'full') {
        const valuationPayload = { ...valuationForm, product_id: productId }
        await fetch(`${API_BASE}/valuations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(valuationPayload)
        })
      }

      addToast('Product created successfully!', 'success')
      onComplete()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const getSteps = () => {
    if (!valuationType) return ['Basic Info', 'Method', 'Valuation', 'Complete']
    if (valuationType === 'quick') return ['Basic Info', 'Method', 'Quick Estimate', 'Complete']
    return ['Basic Info', 'Method', 'Full Valuation', 'Complete']
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto p-2 sm:p-4 sm:py-8">
      <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-[calc(100vw-1rem)] sm:max-w-3xl mx-auto my-auto max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-4rem)] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-center">Add New Product</h2>
        
        <StepIndicator currentStep={step} steps={getSteps()} />

        {step === 1 && (
          <Step1BasicInfo
            formData={formData}
            setFormData={setFormData}
            serviceDepartments={serviceDepartments}
            businessUnits={businessUnits}
            onNext={() => setStep(2)}
            onCancel={onCancel}
          />
        )}

        {step === 2 && (
          <Step2ValuationMethod
            onSelect={(method) => { setValuationType(method); setStep(3) }}
            onBack={() => setStep(1)}
            onCancel={handleSaveAsDraft}
          />
        )}

        {step === 3 && valuationType === 'quick' && (
          <Step3QuickEstimate
            productType={formData.product_type}
            onComplete={handleQuickEstimateComplete}
            onBack={() => setStep(2)}
            onCancel={handleSaveAsDraft}
          />
        )}

        {step === 3 && valuationType === 'full' && (
          <FullValuationForm
            productType={formData.product_type}
            form={valuationForm}
            onChange={handleValuationChange}
            onNext={handleFullValuationNext}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && (
          <Step4RawOutput
            productType={formData.product_type}
            calculatedValue={calculatedValue}
            onComplete={handleFinalComplete}
            onBack={() => setStep(3)}
            saving={saving}
          />
        )}
      </div>
    </div>
  )
}
