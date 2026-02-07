import { useState, useEffect } from 'react'
import { LoadingPage } from '../components/Spinner'

const API_BASE = 'http://localhost:8001/api'

const CATEGORIES = [
  'General',
  'Product Strategy',
  'Internal Guidelines',
  'Industry Knowledge',
  'Competitive Intelligence',
  'Best Practices'
]

function KnowledgeCard({ entry, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div 
        className="px-4 py-3 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <div>
              <h3 className="font-medium text-gray-900">{entry.title}</h3>
              <span className="text-xs text-gray-500">{entry.category}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(entry); }}
              className="p-1 text-gray-400 hover:text-indigo-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
              className="p-1 text-gray-400 hover:text-red-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {expanded && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">{entry.content}</pre>
        </div>
      )}
    </div>
  )
}

function KnowledgeForm({ entry, onSave, onCancel }) {
  const [title, setTitle] = useState(entry?.title || '')
  const [content, setContent] = useState(entry?.content || '')
  const [category, setCategory] = useState(entry?.category || 'General')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    await onSave({ title, content, category })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-2xl my-auto max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">{entry ? 'Edit Knowledge Entry' : 'Add Knowledge Entry'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Our ROI Calculation Guidelines"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter the knowledge content. This can be guidelines, best practices, key metrics, competitive intelligence, or any other information you want the AI assistant to know about..."
              required
              rows={10}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim() || !content.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function KnowledgePage() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [filterCategory, setFilterCategory] = useState('')

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      const res = await fetch(`${API_BASE}/knowledge`)
      const data = await res.json()
      if (data.success) {
        setEntries(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch knowledge:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (formData) => {
    try {
      const url = editingEntry 
        ? `${API_BASE}/knowledge/${editingEntry.id}`
        : `${API_BASE}/knowledge`
      const method = editingEntry ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        fetchEntries()
        setShowForm(false)
        setEditingEntry(null)
      }
    } catch (err) {
      console.error('Failed to save:', err)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this knowledge entry?')) return
    
    try {
      const res = await fetch(`${API_BASE}/knowledge/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchEntries()
      }
    } catch (err) {
      console.error('Failed to delete:', err)
    }
  }

  const handleEdit = (entry) => {
    setEditingEntry(entry)
    setShowForm(true)
  }

  const filteredEntries = filterCategory 
    ? entries.filter(e => e.category === filterCategory)
    : entries

  const categories = [...new Set(entries.map(e => e.category))]

  if (loading) return <LoadingPage />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-gray-600 text-sm">Add custom knowledge for the AI assistant to reference</p>
        </div>
        <button
          onClick={() => { setEditingEntry(null); setShowForm(true); }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Knowledge
        </button>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-indigo-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-medium text-indigo-900">How this works</h3>
            <p className="text-sm text-indigo-700 mt-1">
              Add knowledge entries here to teach the AI assistant about your specific context, guidelines, and best practices. 
              When you enable "Include knowledge base" in the Assistant, it will reference this information when answering your questions.
            </p>
          </div>
        </div>
      </div>

      {entries.length > 0 && (
        <div className="mb-4 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterCategory('')}
            className={`px-3 py-1 rounded-full text-sm ${!filterCategory ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            All ({entries.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm ${filterCategory === cat ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {cat} ({entries.filter(e => e.category === cat).length})
            </button>
          ))}
        </div>
      )}

      {filteredEntries.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No knowledge entries yet</h3>
          <p className="text-gray-500 mb-4">Add your first entry to start building your knowledge base</p>
          <button
            onClick={() => { setEditingEntry(null); setShowForm(true); }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Add First Entry
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredEntries.map(entry => (
            <KnowledgeCard 
              key={entry.id} 
              entry={entry} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showForm && (
        <KnowledgeForm
          entry={editingEntry}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingEntry(null); }}
        />
      )}
    </div>
  )
}
