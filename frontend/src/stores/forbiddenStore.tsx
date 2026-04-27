import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface ForbiddenContextType {
  isForbidden: boolean
  showForbidden: () => void
  hideForbidden: () => void
}

const ForbiddenContext = createContext<ForbiddenContextType | undefined>(undefined)

export function ForbiddenProvider({ children }: { children: ReactNode }) {
  const [isForbidden, setIsForbidden] = useState(false)

  const showForbidden = useCallback(() => setIsForbidden(true), [])
  const hideForbidden = useCallback(() => setIsForbidden(false), [])

  return (
    <ForbiddenContext.Provider value={{ isForbidden, showForbidden, hideForbidden }}>
      {children}
    </ForbiddenContext.Provider>
  )
}

export function useForbidden() {
  const context = useContext(ForbiddenContext)
  if (!context) {
    throw new Error('useForbidden must be used within ForbiddenProvider')
  }
  return context
}