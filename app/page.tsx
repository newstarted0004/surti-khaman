'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { verifyPIN, isAuthenticated, setAuthenticated } from '@/lib/auth'

export default function LoginPage() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard')
    }
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (verifyPIN(pin)) {
      setAuthenticated(true)
      router.push('/dashboard')
    } else {
      setError('ખોટો PIN! કૃપા કરીને ફરીથી પ્રયાસ કરો.')
      setPin('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-700 mb-2">
            સુરતી ખમણ
          </h1>
          <p className="text-gray-600 text-lg">Shop Management System</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-lg">
              PIN દાખલ કરો
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary-500 text-center text-2xl tracking-widest"
              placeholder="PIN"
              maxLength={4}
              autoFocus
            />
          </div>
          
          {error && (
            <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-xl text-center">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            લૉગિન કરો
          </button>
        </form>
      </div>
    </div>
  )
}

