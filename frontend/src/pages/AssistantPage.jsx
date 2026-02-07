import { useState, useEffect, useRef } from 'react'
import { LoadingPage } from '../components/Spinner'

const API_BASE = 'http://localhost:8001/api'

const SUGGESTED_QUESTIONS = {
  normal: [
    "How do I calculate ROI for a product idea?",
    "When should I build vs buy a solution?",
    "How do I use the BACK matrix?",
    "What makes a problem worth solving?",
    "How do I prioritize features with RICE?"
  ],
  normal_with_data: [
    "Which of my products has the best ROI?",
    "Summarize my portfolio health",
    "Which products should I prioritize based on their valuations?",
    "Which product has the highest RICE score and why?",
    "Compare my products by value range and confidence level"
  ],
  problem_solving: [
    "This feature would cost $500K to build but could 10x our revenue",
    "We need real-time data but our infrastructure can't handle it",
    "The ideal solution requires 6 months but we only have 6 weeks",
    "Our competitors have a 2-year head start on this feature",
    "The integration we need doesn't have an API"
  ],
  problem_solving_with_data: [
    "My lowest ROI product has huge strategic value - how do I justify it?",
    "How can I reduce costs on my most expensive product?",
    "Challenge my valuation assumptions - what am I being too optimistic about?",
    "How do I increase the confidence level of my valuations?",
    "Which product should I invest more in based on strategic scores?"
  ]
}

function Message({ message, isUser }) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] rounded-lg px-4 py-3 ${
        isUser 
          ? 'bg-indigo-600 text-white' 
          : 'bg-white border border-gray-200 text-gray-800'
      }`}>
        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
        {message.framework_refs && message.framework_refs.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200 flex flex-wrap gap-1">
            {message.framework_refs.map(ref => (
              <span key={ref} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded">
                {ref}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

export default function AssistantPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [mode, setMode] = useState('normal')
  const [includeData, setIncludeData] = useState(false)
  const [includeKnowledge, setIncludeKnowledge] = useState(false)
  const [knowledgeCount, setKnowledgeCount] = useState(0)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetch(`${API_BASE}/assistant/status`)
      .then(r => r.json())
      .then(data => {
        setStatus(data.data)
        setCheckingStatus(false)
      })
      .catch(() => {
        setStatus({ ready: false })
        setCheckingStatus(false)
      })
    
    fetch(`${API_BASE}/knowledge`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setKnowledgeCount(data.data.length)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return

    const userMessage = { role: 'user', content: text }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const res = await fetch(`${API_BASE}/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history, mode, include_data: includeData, include_knowledge: includeKnowledge })
      })
      const data = await res.json()

      if (data.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.data.response,
          framework_refs: data.data.framework_refs
        }])
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Error: ${data.error || 'Something went wrong'}`,
          framework_refs: []
        }])
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Failed to connect to the assistant. Please check your connection.',
        framework_refs: []
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  if (checkingStatus) return <LoadingPage />

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Strategy Assistant</h1>
            <p className="text-gray-600 text-sm">Ask questions about product frameworks, ROI calculations, and decision-making</p>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setMode('normal')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === 'normal' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => setMode('problem_solving')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === 'problem_solving' 
                  ? 'bg-amber-500 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Problem Solving
            </button>
          </div>
        </div>
        {mode === 'problem_solving' && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm text-amber-800">
            Creative mode: I'll help you find unconventional solutions to tough problems
          </div>
        )}
        <div className="mt-3 flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeData}
              onChange={(e) => setIncludeData(e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Include my product data</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeKnowledge}
              onChange={(e) => setIncludeKnowledge(e.target.checked)}
              disabled={knowledgeCount === 0}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-50"
            />
            <span className={`text-sm ${knowledgeCount === 0 ? 'text-gray-400' : 'text-gray-700'}`}>
              Include knowledge base {knowledgeCount > 0 && `(${knowledgeCount})`}
            </span>
          </label>
        </div>
        {(includeData || includeKnowledge) && (
          <div className="mt-2 flex gap-2 flex-wrap">
            {includeData && (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                Products, tasks & team
              </span>
            )}
            {includeKnowledge && (
              <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                Custom knowledge
              </span>
            )}
          </div>
        )}
      </div>

      {!status?.ready && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-amber-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="font-medium text-amber-800">API Key Required</h3>
              <p className="text-sm text-amber-700 mt-1">
                To enable the AI assistant, set the <code className="bg-amber-100 px-1 rounded">ANTHROPIC_API_KEY</code> environment variable in your backend.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 bg-gray-50 rounded-lg overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
              <p className="text-gray-500 mb-6 max-w-md">
                Ask me about product frameworks, ROI calculations, prioritization methods, or any product strategy question.
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {SUGGESTED_QUESTIONS[includeData ? `${mode}_with_data` : mode].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    disabled={loading || !status?.ready}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <Message key={i} message={msg} isUser={msg.role === 'user'} />
              ))}
              {loading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={status?.ready ? "Ask a product strategy question..." : "Configure API key to enable assistant"}
              disabled={loading || !status?.ready}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || !status?.ready}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
