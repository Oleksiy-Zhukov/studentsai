import React, { createContext, useContext, useEffect, useState } from 'react'

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || ''

const RecaptchaContext = createContext({
  isLoaded: false,
  isReady: false,
  error: null,
  execute: () => Promise.reject(new Error('reCAPTCHA not initialized'))
})

export const RecaptchaProvider = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) {
      setError('reCAPTCHA site key is not configured')
      return
    }

    const scriptId = 'recaptcha-v3-script'
    const existingScript = document.getElementById(scriptId)

    if (existingScript) {
      // Script already exists, check if grecaptcha is available
      if (window.grecaptcha) {
        setIsLoaded(true)
        window.grecaptcha.ready(() => {
          setIsReady(true)
        })
      }
      return
    }

    // Load the reCAPTCHA script
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`
    script.id = scriptId
    script.async = true
    script.defer = true
    
    script.onload = () => {
      setIsLoaded(true)
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          setIsReady(true)
        })
      }
    }
    
    script.onerror = () => {
      setError('Failed to load reCAPTCHA script')
    }

    document.head.appendChild(script)

    // Cleanup function
    return () => {
      // Don't remove the script on unmount as it might be needed by other components
    }
  }, [])

  const execute = (action = 'submit') => {
    return new Promise((resolve, reject) => {
      if (!RECAPTCHA_SITE_KEY) {
        reject(new Error('Missing reCAPTCHA site key'))
        return
      }

      if (!isReady || !window.grecaptcha) {
        reject(new Error('reCAPTCHA is not ready yet'))
        return
      }

      window.grecaptcha.ready(() => {
        window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action })
          .then(resolve)
          .catch(reject)
      })
    })
  }

  const value = {
    isLoaded,
    isReady,
    error,
    execute,
    isEnabled: !!RECAPTCHA_SITE_KEY
  }

  return (
    <RecaptchaContext.Provider value={value}>
      {children}
    </RecaptchaContext.Provider>
  )
}

export const useRecaptchaContext = () => {
  const context = useContext(RecaptchaContext)
  if (!context) {
    throw new Error('useRecaptchaContext must be used within a RecaptchaProvider')
  }
  return context
}

export default RecaptchaProvider

