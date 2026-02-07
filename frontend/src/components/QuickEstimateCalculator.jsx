import { useState, useEffect } from 'react'

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount)
}

function InternalCalculator({ onCalculate }) {
  const [inputs, setInputs] = useState({
    hours_saved_per_user_per_week: '',
    number_of_users: '',
    average_hourly_cost: '50'
  })

  const handleChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }))
  }

  const hoursSaved = parseFloat(inputs.hours_saved_per_user_per_week) || 0
  const numUsers = parseInt(inputs.number_of_users) || 0
  const hourlyCost = parseFloat(inputs.average_hourly_cost) || 0
  const annualValue = hoursSaved * numUsers * hourlyCost * 52
  const monthlyValue = annualValue / 12

  const isComplete = hoursSaved > 0 && numUsers > 0 && hourlyCost > 0

  useEffect(() => {
    if (isComplete) {
      onCalculate(monthlyValue, inputs)
    }
  }, [monthlyValue, isComplete])

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Quick estimates use default strategic scores (all 3s) 
          and Low confidence. Use Full Valuation for more accurate valuations.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Hours Saved per User per Week
        </label>
        <input
          type="number"
          step="0.5"
          min="0"
          value={inputs.hours_saved_per_user_per_week}
          onChange={(e) => handleChange('hours_saved_per_user_per_week', e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
          placeholder="e.g., 2"
        />
        <p className="text-xs text-gray-500 mt-1">How many hours will each user save weekly?</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Number of Users
        </label>
        <input
          type="number"
          min="1"
          value={inputs.number_of_users}
          onChange={(e) => handleChange('number_of_users', e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
          placeholder="e.g., 50"
        />
        <p className="text-xs text-gray-500 mt-1">How many people will use this product?</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Average Hourly Cost ($)
        </label>
        <input
          type="number"
          min="0"
          value={inputs.average_hourly_cost}
          onChange={(e) => handleChange('average_hourly_cost', e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
          placeholder="50"
        />
        <p className="text-xs text-gray-500 mt-1">Average fully-loaded hourly cost per employee</p>
      </div>

      {isComplete && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Estimated Monthly Value</div>
          <div className="text-2xl font-bold text-green-700">{formatCurrency(monthlyValue)}</div>
          <div className="text-xs text-gray-500 mt-1">
            {formatCurrency(annualValue)} annually ({hoursSaved}h × {numUsers} users × ${hourlyCost}/hr × 52 weeks)
          </div>
        </div>
      )}
    </div>
  )
}

function ExternalCalculator({ onCalculate }) {
  const [inputs, setInputs] = useState({
    total_potential_customers: '',
    serviceable_percent: '20',
    market_share_percent: '5',
    average_deal_size: '',
    gross_margin_percent: '70',
    customer_lifetime_months: '24'
  })

  const handleChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }))
  }

  const totalCustomers = parseInt(inputs.total_potential_customers) || 0
  const serviceablePercent = parseFloat(inputs.serviceable_percent) || 0
  const marketSharePercent = parseFloat(inputs.market_share_percent) || 0
  const dealSize = parseFloat(inputs.average_deal_size) || 0
  const marginPercent = parseFloat(inputs.gross_margin_percent) || 0
  const lifetimeMonths = parseInt(inputs.customer_lifetime_months) || 0

  const addressableCustomers = totalCustomers * (serviceablePercent / 100) * (marketSharePercent / 100)
  const lifetimeValue = dealSize * (marginPercent / 100) * (lifetimeMonths / 12)
  const annualValue = addressableCustomers * lifetimeValue
  const monthlyValue = annualValue / 12

  const isComplete = totalCustomers > 0 && dealSize > 0 && lifetimeMonths > 0

  useEffect(() => {
    if (isComplete) {
      onCalculate(monthlyValue, inputs)
    }
  }, [monthlyValue, isComplete])

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Quick estimates use default strategic scores (all 3s) 
          and Low confidence. Use Full Valuation for more accurate valuations.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Total Potential Customers (TAM)
        </label>
        <input
          type="number"
          min="0"
          value={inputs.total_potential_customers}
          onChange={(e) => handleChange('total_potential_customers', e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
          placeholder="e.g., 10000"
        />
        <p className="text-xs text-gray-500 mt-1">Total addressable market size in customers</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Serviceable % (SAM)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={inputs.serviceable_percent}
            onChange={(e) => handleChange('serviceable_percent', e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Market Share %
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={inputs.market_share_percent}
            onChange={(e) => handleChange('market_share_percent', e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="5"
          />
        </div>
      </div>
      <p className="text-xs text-gray-500 -mt-2">
        Addressable customers: {Math.round(addressableCustomers).toLocaleString()}
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Average Deal Size ($)
        </label>
        <input
          type="number"
          min="0"
          value={inputs.average_deal_size}
          onChange={(e) => handleChange('average_deal_size', e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
          placeholder="e.g., 1000"
        />
        <p className="text-xs text-gray-500 mt-1">Average revenue per customer</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gross Margin %
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={inputs.gross_margin_percent}
            onChange={(e) => handleChange('gross_margin_percent', e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="70"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer Lifetime (months)
          </label>
          <input
            type="number"
            min="1"
            value={inputs.customer_lifetime_months}
            onChange={(e) => handleChange('customer_lifetime_months', e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="24"
          />
        </div>
      </div>

      {isComplete && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Estimated Monthly Value</div>
          <div className="text-2xl font-bold text-green-700">{formatCurrency(monthlyValue)}</div>
          <div className="text-xs text-gray-500 mt-1">
            {formatCurrency(annualValue)} annually 
            ({Math.round(addressableCustomers).toLocaleString()} customers × {formatCurrency(lifetimeValue)} LTV)
          </div>
        </div>
      )}
    </div>
  )
}

export default function QuickEstimateCalculator({ productType, onCalculate }) {
  if (productType === 'Internal') {
    return <InternalCalculator onCalculate={onCalculate} />
  }
  return <ExternalCalculator onCalculate={onCalculate} />
}
