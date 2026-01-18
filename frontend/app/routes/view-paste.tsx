import { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { pasteApi } from '../../lib/api'
import { Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import Prism from 'prismjs'

import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-json'

export default function ViewPastePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const codeRef = useRef<HTMLElement>(null)


  const { data: paste, isLoading, error } = useQuery({
    queryKey: ['paste', id],
    queryFn: async () => {
      console.log('Making API call with ID:', id)
      const response = await pasteApi.getById(id!)
      console.log('API response:', response)
      return response
    },
    enabled: !!id,
  })

  useEffect(() => {
    console.log('useEffect - paste:', paste)
    if (paste && codeRef.current) {
      console.log('Highlighting code')
      Prism.highlightElement(codeRef.current)
    }
  }, [paste])

  const handleCopy = async () => {
    if (paste?.data.content) {
      await navigator.clipboard.writeText(paste.data.content)
      toast.success('Copied!')
    }
  }

  console.log('Render state:', { isLoading, error, hasPaste: !!paste })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-xl text-gray-600">Loading paste...</div>
      </div>
    )
  }

  if (error || !paste) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Paste Not Found
        </h2>
        <p className="text-gray-600 mb-4">
          {error ? String(error) : 'This paste does not exist'}
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Go Home
        </button>
      </div>
    )
  }

  const pasteData = paste.data

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {pasteData.title || 'Untitled Paste'}
        </h1>
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Copy className="w-4 h-4" />
            Copy
          </button>
        </div>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
          {pasteData.language}
        </span>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-800 px-4 py-2">
          <span className="text-white text-sm font-mono">{pasteData.language}</span>
        </div>
        <div className="overflow-x-auto">
          <pre className="!m-0 !p-4 !bg-[#2d2d2d]">
            <code
              ref={codeRef}
              className={`language-${pasteData.language}`}
            >
              {pasteData.content}
            </code>
          </pre>
        </div>
      </div>
    </div>
  )
}