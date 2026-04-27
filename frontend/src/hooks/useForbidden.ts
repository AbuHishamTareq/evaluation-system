import { useNavigate } from 'react-router-dom'
import { useCallback } from 'react'

export function useForbidden() {
  const navigate = useNavigate()

  const handleForbidden = useCallback(() => {
    navigate('/forbidden')
  }, [navigate])

  return { handleForbidden }
}

export function handleApiError(error: unknown, navigate: ReturnType<typeof useNavigate>): boolean {
  const err = error as { response?: { status?: number } }
  if (err.response?.status === 403) {
    navigate('/forbidden')
    return true
  }
  return false
}