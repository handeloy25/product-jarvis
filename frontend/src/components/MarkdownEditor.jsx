import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

export default function MarkdownEditor({ 
  value, 
  onChange, 
  onSave, 
  disabled = false, 
  placeholder = 'Enter content...',
  saving = false
}) {
  const [mode, setMode] = useState('edit')

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value || '')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between bg-gray-50 border-b border-gray-300 px-4 py-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('edit')}
            className={`px-3 py-1 text-sm rounded ${
              mode === 'edit'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
            }`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`px-3 py-1 text-sm rounded ${
              mode === 'preview'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
            }`}
          >
            Preview
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyToClipboard}
            className="px-3 py-1 text-sm bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
          >
            Copy
          </button>
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              disabled={disabled || saving}
              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      </div>

      {mode === 'edit' ? (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full h-96 p-4 font-mono text-sm resize-y focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      ) : (
        <div className="w-full h-96 p-4 overflow-auto prose prose-sm max-w-none">
          {value ? (
            <ReactMarkdown>{value}</ReactMarkdown>
          ) : (
            <p className="text-gray-400 italic">No content to preview</p>
          )}
        </div>
      )}

      <div className="bg-gray-50 border-t border-gray-300 px-4 py-2 text-xs text-gray-500">
        {value ? `${value.length} characters` : '0 characters'}
      </div>
    </div>
  )
}
