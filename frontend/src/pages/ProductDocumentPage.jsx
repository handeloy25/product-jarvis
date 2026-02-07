import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { LoadingPage } from '../components/Spinner'
import ErrorState from '../components/ErrorState'
import { useToast } from '../components/Toast'
import MarkdownEditor from '../components/MarkdownEditor'

const API_BASE = 'http://localhost:8001/api'

const DOC_TYPES = {
  'raw-valuation-output': 'Raw Valuation Output',
  'user-flow': 'User Flow',
  'specifications': 'Specifications',
  'persona-feedback': 'Persona Feedback'
}

export default function ProductDocumentPage() {
  const { id, docType } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()
  
  const [product, setProduct] = useState(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [locked, setLocked] = useState(false)
  const [lockReason, setLockReason] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [error, setError] = useState(null)

  const docTitle = DOC_TYPES[docType] || docType

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [productRes, docRes] = await Promise.all([
        fetch(`${API_BASE}/products/${id}`),
        fetch(`${API_BASE}/products/${id}/documents/${docType}`)
      ])
      
      if (!productRes.ok) {
        throw new Error('Product not found')
      }
      
      const productData = await productRes.json()
      setProduct(productData.data)
      
      if (docRes.ok) {
        const docData = await docRes.json()
        setContent(docData.data.content || '')
        setLastUpdated(docData.data.updated_at)
        setLocked(docData.data.locked)
        setLockReason(docData.data.lock_reason)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!DOC_TYPES[docType]) {
      navigate('/products')
      return
    }
    fetchData()
  }, [id, docType])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/products/${id}/documents/${docType}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Failed to save')
      }
      
      const data = await res.json()
      setLastUpdated(data.data.updated_at)
      addToast('Document saved', 'success')
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never'
    return new Date(dateStr).toLocaleString()
  }

  if (loading) return <LoadingPage />

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Document</h1>
        <ErrorState message={error} onRetry={fetchData} />
      </div>
    )
  }

  return (
    <div>
      <nav className="mb-4 text-sm">
        <Link to="/products" className="text-indigo-600 hover:text-indigo-800">Products</Link>
        <span className="mx-2 text-gray-400">/</span>
        <Link to="/products" className="text-indigo-600 hover:text-indigo-800">{product?.name}</Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-600">{docTitle}</span>
      </nav>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{docTitle}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {formatDate(lastUpdated)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {locked && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Locked
            </span>
          )}
          {docType === 'raw-valuation-output' && product?.valuation_complete && (
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
              Complete
            </span>
          )}
        </div>
      </div>

      {locked && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-yellow-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">{lockReason}</span>
          </div>
          <p className="text-sm text-yellow-700 mt-2">
            <Link to={`/products/${id}/raw-valuation-output`} className="underline hover:no-underline">
              Complete the Raw Valuation Output
            </Link>{' '}
            to unlock this document.
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <MarkdownEditor
          value={content}
          onChange={setContent}
          onSave={handleSave}
          disabled={locked}
          saving={saving}
          placeholder={`Enter ${docTitle.toLowerCase()} content here...`}
        />
      </div>

      <div className="mt-6 flex justify-between items-center">
        <Link
          to="/products"
          className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Products
        </Link>
        
        <div className="flex gap-2">
          {Object.entries(DOC_TYPES).map(([type, title]) => (
            <Link
              key={type}
              to={`/products/${id}/${type}`}
              className={`px-3 py-1 text-sm rounded ${
                type === docType
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
