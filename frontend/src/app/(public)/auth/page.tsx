'use client'

import { useRouter } from 'next/navigation'
import { AuthForm } from '@/components/auth/AuthForm'

export default function AuthPage() {
  const router = useRouter()
  return (
    <AuthForm onSuccess={() => router.replace('/')} />
  )
}


