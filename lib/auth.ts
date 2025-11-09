const PIN = '1813'

export const verifyPIN = (inputPIN: string): boolean => {
  return inputPIN === PIN
}

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem('authenticated') === 'true'
}

export const setAuthenticated = (value: boolean): void => {
  if (typeof window === 'undefined') return
  sessionStorage.setItem('authenticated', value.toString())
}

export const logout = (): void => {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem('authenticated')
  window.location.href = '/'
}

