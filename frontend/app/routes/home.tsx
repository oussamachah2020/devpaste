import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { pasteApi, type CreatePasteDto } from '../../lib/api'
import toast from 'react-hot-toast'
import Editor from 'react-simple-code-editor'
import Prism from 'prismjs'

// Import Prism languages
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-go'
import 'prismjs/components/prism-rust'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-markdown'

const LANGUAGES = [
  'plaintext', 'javascript', 'typescript', 'python', 'java', 
  'go', 'rust', 'json', 'sql', 'bash', 'markdown'
]

export default function HomePage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<CreatePasteDto>({
    title: '',
    content: '',
    language: 'javascript',
    expiresIn: '1day',
  })

  const createMutation = useMutation({
    mutationFn: pasteApi.create,
    onSuccess: (response) => {
      toast.success('Paste created! 🎉')
      navigate(`/paste/${response.data.id}`)
    },
    onError: () => {
      toast.error('Failed to create paste')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.content.trim()) {
      toast.error('Content cannot be empty')
      return
    }
    createMutation.mutate(formData)
  }

  const highlightCode = (code: string) => {
    try {
      const language = formData.language === 'plaintext' ? 'javascript' : formData.language
      return Prism.highlight(code, Prism.languages[language as any] || Prism.languages.javascript, language as any)
    } catch {
      return code
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Share Code Instantly
        </h1>
        <p className="text-gray-600">Paste your code, get a link, share it anywhere</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Input */}
        <div>
          <input
            type="text"
            placeholder="Title (optional)"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
          />
        </div>

        {/* Language & Expiry */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white capitalize focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang} className="capitalize">{lang}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expires In
            </label>
            <select
              value={formData.expiresIn}
              onChange={(e) => setFormData({ ...formData, expiresIn: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="1hour">1 Hour</option>
              <option value="1day">1 Day</option>
              <option value="1week">1 Week</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>

        {/* Code Editor with Syntax Highlighting */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Code
          </label>
          <div className="border border-gray-300 rounded-lg overflow-hidden bg-[#2d2d2d]">
            <Editor
              value={formData.content}
              onValueChange={(code) => setFormData({ ...formData, content: code })}
              highlight={highlightCode}
              padding={16}
              placeholder="Paste your code here..."
              style={{
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
                fontSize: 14,
                minHeight: '400px',
                backgroundColor: '#2d2d2d',
                color: '#f8f8f2',
              }}
              textareaClassName="focus:outline-none"
            />
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center gap-6 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.burnAfterRead || false}
              onChange={(e) => setFormData({ ...formData, burnAfterRead: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm font-medium text-gray-700">
              🔥 Burn after reading
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPrivate || false}
              onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm font-medium text-gray-700">
              🔒 Private
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {createMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating...
            </span>
          ) : (
            '✨ Create Paste'
          )}
        </button>
      </form>
    </div>
  )
}