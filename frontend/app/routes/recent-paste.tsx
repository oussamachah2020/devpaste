import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router'
import { pasteApi } from '../../lib/api'
import { Eye, Trash2, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RecentPastesPage() {
  const queryClient = useQueryClient()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data: pastes, isLoading } = useQuery({
    queryKey: ['recent-pastes'],
    queryFn: () => pasteApi.getRecent(20),
  })

  const deleteMutation = useMutation({
    mutationFn: pasteApi.delete,
    onSuccess: () => {
      toast.success('Paste deleted! 🗑️')
      queryClient.invalidateQueries({ queryKey: ['recent-pastes'] })
      setDeletingId(null)
    },
    onError: () => {
      toast.error('Failed to delete paste')
      setDeletingId(null)
    },
  })

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault() // Prevent navigation
    setDeletingId(id)
  }

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    deleteMutation.mutate(id)
  }

  const cancelDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    setDeletingId(null)
  }

  const formatDate = (date: string) => {
    const now = new Date()
    const past = new Date(date)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return past.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <div className="text-lg text-gray-600">Loading pastes...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Recent Pastes</h1>
        <p className="text-gray-600">Browse the latest public code snippets</p>
      </div>

      {!pastes?.data || pastes.data.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg shadow-md">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No pastes yet</h3>
          <p className="text-gray-600 mb-6">Be the first to create one!</p>
          <a 
            href="/" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Create Paste
          </a>
        </div>
      ) : (
        <div className="grid gap-4">
          {pastes.data.map((paste) => (
            <div
              key={paste.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              {deletingId === paste.id ? (
                // Delete Confirmation
                <div className="p-6 bg-red-50 border-l-4 border-red-500">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-red-900 mb-2">
                        Delete this paste?
                      </h3>
                      <p className="text-sm text-red-700">
                        This action cannot be undone. The paste will be permanently deleted.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => confirmDelete(e, paste.id)}
                        disabled={deleteMutation.isPending}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                      </button>
                      <button
                        onClick={cancelDelete}
                        disabled={deleteMutation.isPending}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Normal Paste Display
                <Link
                  to={`/paste/${paste.id}`}
                  className="block p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        {paste.title || 'Untitled Paste'}
                      </h3>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDate(paste.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {paste.views} views
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-semibold uppercase">
                          {paste.language}
                        </span>
                        {paste.expiresAt && (
                          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-lg text-xs font-semibold">
                            Expires: {formatDate(paste.expiresAt)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => handleDelete(e, paste.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete paste"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <span className="text-blue-600 font-semibold">View →</span>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}