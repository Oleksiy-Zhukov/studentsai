'use client'

import { AuthForm } from '@/components/auth/AuthForm'

export default function AuthPage() {
  return (
    <AuthForm onSuccess={() => {
      if (typeof window !== 'undefined') {
        // Hard navigation avoids any dev-router stalls
        window.location.replace('/')
      }
    }} />
  )
}


