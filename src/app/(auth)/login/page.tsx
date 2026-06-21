'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const MAX_ATTEMPTS = 5
const LOCKOUT_SECONDS = 60

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const lockedUntil = useRef(0)
  const router = useRouter()

  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = setInterval(() => {
      const left = Math.ceil((lockedUntil.current - Date.now()) / 1000)
      if (left <= 0) {
        setSecondsLeft(0)
        clearInterval(id)
      } else {
        setSecondsLeft(left)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [secondsLeft])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (secondsLeft > 0) return
    setLoading(true)
    setError('')

    const password = (new FormData(e.currentTarget).get('password') as string) ?? ''
    const result = await signIn('credentials', { password, redirect: false })

    if (!result?.ok || result?.error) {
      const next = attempts + 1
      setAttempts(next)
      if (next >= MAX_ATTEMPTS) {
        lockedUntil.current = Date.now() + LOCKOUT_SECONDS * 1000
        setSecondsLeft(LOCKOUT_SECONDS)
        setError(`Too many attempts. Try again in ${LOCKOUT_SECONDS}s.`)
      } else {
        setError(`Incorrect password (${next}/${MAX_ATTEMPTS})`)
      }
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  const locked = secondsLeft > 0

  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Hermes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Private dashboard</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-border bg-card p-6"
        >
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              autoComplete="current-password"
              disabled={locked}
            />
          </div>
          {error && (
            <p className="text-sm text-neg" role="alert">
              {locked ? `Too many attempts. Try again in ${secondsLeft}s.` : error}
            </p>
          )}
          <Button type="submit" disabled={loading || locked} className="w-full">
            {locked ? `Locked (${secondsLeft}s)` : loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  )
}
