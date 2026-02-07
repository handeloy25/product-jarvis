import { useState, useEffect } from 'react'
import { LoadingPage } from '../components/Spinner'
import ErrorState from '../components/ErrorState'

const API_BASE = 'http://localhost:8001/api'

const CATEGORY_COLORS = {
  fundamentals: 'bg-blue-100 text-blue-800 border-blue-200',
  prioritization: 'bg-purple-100 text-purple-800 border-purple-200',
  decision: 'bg-green-100 text-green-800 border-green-200',
  advanced: 'bg-orange-100 text-orange-800 border-orange-200'
}

const CATEGORY_ICONS = {
  fundamentals: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  prioritization: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
    </svg>
  ),
  decision: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  advanced: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
}

function LessonCard({ lesson, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${CATEGORY_COLORS[lesson.category]}`}>
            {lesson.framework}
          </span>
          <span className="text-gray-400">
            {CATEGORY_ICONS[lesson.category]}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{lesson.title}</h3>
        <p className="text-sm text-gray-600">{lesson.summary}</p>
      </div>
    </div>
  )
}

function LessonModal({ lesson, onClose }) {
  if (!lesson) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b flex justify-between items-start">
          <div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${CATEGORY_COLORS[lesson.category]}`}>
              {lesson.framework}
            </span>
            <h2 className="text-2xl font-bold text-gray-900 mt-2">{lesson.title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="prose prose-sm max-w-none">
            {lesson.content.split('\n').map((line, i) => {
              if (line.startsWith('**') && line.endsWith('**')) {
                return <h4 key={i} className="font-semibold text-gray-900 mt-4 mb-2">{line.replace(/\*\*/g, '')}</h4>
              }
              if (line.startsWith('```')) return null
              if (line.startsWith('- ')) {
                return <p key={i} className="text-gray-600 ml-4 my-1">{line}</p>
              }
              if (line.startsWith('|')) {
                return <p key={i} className="text-gray-600 font-mono text-xs my-1">{line}</p>
              }
              if (line.trim() === '') return <br key={i} />
              return <p key={i} className="text-gray-600 my-2">{line}</p>
            })}
          </div>
          
          <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <h4 className="font-semibold text-indigo-900 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Key Takeaway
            </h4>
            <p className="text-indigo-800">{lesson.key_takeaway}</p>
          </div>
          
          {lesson.example && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Real-World Example
              </h4>
              <p className="text-gray-700">{lesson.example}</p>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LearnPage() {
  const [lessons, setLessons] = useState([])
  const [categories, setCategories] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [lessonsRes, categoriesRes] = await Promise.all([
        fetch(`${API_BASE}/learn`),
        fetch(`${API_BASE}/learn/categories`)
      ])
      const [lessonsData, categoriesData] = await Promise.all([
        lessonsRes.json(),
        categoriesRes.json()
      ])
      setLessons(lessonsData.data || [])
      setCategories(categoriesData.data || {})
    } catch (err) {
      setError('Failed to load lessons. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredLessons = activeCategory === 'all' 
    ? lessons 
    : lessons.filter(l => l.category === activeCategory)

  if (loading) return <LoadingPage />

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Learn</h1>
        <ErrorState message={error} onRetry={fetchData} />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Product Frameworks</h1>
        <p className="text-gray-600 mt-1">Learn the frameworks that drive smart product decisions</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeCategory === 'all' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({lessons.length})
        </button>
        {Object.entries(categories).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeCategory === key 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {CATEGORY_ICONS[key]}
            {cat.name} ({cat.count})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLessons.map(lesson => (
          <LessonCard 
            key={lesson.id} 
            lesson={lesson} 
            onClick={() => setSelectedLesson(lesson)}
          />
        ))}
      </div>

      {filteredLessons.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No lessons in this category yet.</p>
        </div>
      )}

      <LessonModal 
        lesson={selectedLesson} 
        onClose={() => setSelectedLesson(null)} 
      />
    </div>
  )
}
