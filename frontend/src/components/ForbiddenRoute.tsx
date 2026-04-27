import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { ForbiddenPage } from '@/pages/ForbiddenPage'

interface ForbiddenRouteProps {
  children: React.ReactNode
  hasError: boolean
  errorStatus: number | null
}

export function ForbiddenRoute({ children, hasError, errorStatus }: ForbiddenRouteProps) {
  const [showForbidden, setShowForbidden] = useState(false)

  useEffect(() => {
    if (hasError && errorStatus === 403) {
      setShowForbidden(true)
    }
  }, [hasError, errorStatus])

  if (showForbidden) {
    return <ForbiddenPage />
  }

  return <>{children}</>
}