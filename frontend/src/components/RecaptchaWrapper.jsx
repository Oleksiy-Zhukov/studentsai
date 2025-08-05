import React, { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || ''

export const RecaptchaWrapper = ({ action = 'submit', onVerify, onError }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) {
      setError('reCAPTCHA is not configured')
      return
    }

    const scriptId = 'recaptcha-v3-script'
    const scriptExists = document.getElementById(scriptId)

    if (!scriptExists) {
      const script = document.createElement('script')
      script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`
      script.id = scriptId
      script.async = true
      script.defer = true
      script.onload = () => setIsLoaded(true)
      script.onerror = () => setError('Failed to load reCAPTCHA')
      document.head.appendChild(script)
    } else {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (isLoaded && window.grecaptcha && RECAPTCHA_SITE_KEY) {
      window.grecaptcha.ready(() => {
        window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action }).then((recaptchaToken) => {
          if (onVerify) onVerify(recaptchaToken)
        }).catch(() => {
          const errorMsg = 'Failed to execute reCAPTCHA'
          setError(errorMsg)
          if (onError) onError(errorMsg)
        })
      })
    }
  }, [isLoaded, action, onVerify, onError])

  if (!RECAPTCHA_SITE_KEY) return null

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
        <AlertCircle className="w-4 h-4" />
        <span>{error}</span>
      </div>
    )
  }

  return null // reCAPTCHA v3 has no visible UI
}

// Hook for managing reCAPTCHA v3
export const useRecaptcha = (action = 'submit') => {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [isVerified, setIsVerified] = useState(false)

  const execute = () => {
    return new Promise((resolve, reject) => {
      setToken("")
      setIsVerified(false)
      setError("")

      if (!RECAPTCHA_SITE_KEY) {
        const errorMsg = "Missing reCAPTCHA site key"
        setError(errorMsg)
        reject(new Error(errorMsg))
        return
      }

      // Ensure grecaptcha is ready before executing
      window.grecaptcha.ready(() => {
        window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action }).then((recaptchaToken) => {
          setToken(recaptchaToken)
          setIsVerified(true)
          resolve(recaptchaToken)
        }).catch(() => {
          const errorMsg = "Failed to execute reCAPTCHA"
          setError(errorMsg)
          reject(new Error(errorMsg))
        })
      })
    })
  }

  return {
    token,
    isVerified,
    error,
    execute,
    isEnabled: !!RECAPTCHA_SITE_KEY
  }
}

export default RecaptchaWrapper