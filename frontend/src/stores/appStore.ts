import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { isRtl, type Locale } from '@/i18n'

interface AppState {
  locale: Locale
  direction: 'ltr' | 'rtl'
  setLocale: (locale: Locale) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      locale: 'en',
      direction: 'ltr',

      setLocale: (locale: Locale) => {
        set({
          locale,
          direction: isRtl(locale) ? 'rtl' : 'ltr',
        })
      },
    }),
    {
      name: 'app-storage',
    }
  )
)