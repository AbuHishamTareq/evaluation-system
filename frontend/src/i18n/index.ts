import en from './en'
import ar from './ar'

export const translations = { en, ar }

export type Locale = 'en' | 'ar'

export function getTranslation(locale: Locale, key: string): string {
  const keys = key.split('.')
  let result: unknown = translations[locale]
  
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = (result as Record<string, unknown>)[k]
    } else {
      return key
    }
  }
  
  return typeof result === 'string' ? result : key
}

export const rtlLocales: Locale[] = ['ar']
export function isRtl(locale: Locale): boolean {
  return rtlLocales.includes(locale)
}