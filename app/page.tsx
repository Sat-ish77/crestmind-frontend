'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { AuthProvider } from '@/lib/auth-context'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'

function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login, user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter both username and password')
      return
    }

    setIsLoading(true)
    try {
      const success = await login(username, password)
      if (success) {
        toast.success('Welcome to CrestMind AI')
        router.push('/dashboard')
      } else {
        toast.error('Invalid credentials')
      }
    } catch {
      toast.error('An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l border-t border-primary/20 m-8" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r border-b border-primary/20 m-8" />

      {/* Main Login Card */}
      <div className="relative w-full max-w-md px-6">
        {/* Gold Glow Behind */}
        <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full" />
        
        <div className="glass-card relative rounded-xl p-8 gold-glow">
          {/* Logo & Brand */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-20 h-20 rounded-xl overflow-hidden mb-4 gold-glow-sm">
              <Image
                src="/images/logo.jpeg"
                alt="CrestMind AI"
                width={80}
                height={80}
                className="object-cover"
              />
            </div>
            <h1 className="font-serif text-3xl text-primary tracking-tight mb-2">CrestMind AI</h1>
            <p className="text-[10px] font-semibold tracking-[0.3em] text-primary/70 uppercase">
              Property Document Intelligence
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-primary/70 uppercase tracking-widest mb-2 px-1">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full bg-background/50 border border-primary/30 rounded-lg h-12 px-4 pr-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary input-glow transition-all"
                  disabled={isLoading}
                />
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary/70 uppercase tracking-widest mb-2 px-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-background/50 border border-primary/30 rounded-lg h-12 px-4 pr-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary input-glow transition-all"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-lg shadow-lg shadow-primary/20 transition-all uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Spinner className="w-4 h-4" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* SSO Button (Disabled) */}
          <div className="mt-6">
            <button
              disabled
              className="w-full bg-muted/50 text-muted-foreground font-medium py-3 rounded-lg border border-border cursor-not-allowed text-sm"
            >
              Single Sign-On (Coming Soon)
            </button>
          </div>

          {/* Secure Access Note */}
          <div className="mt-8 pt-8 border-t border-primary/10 flex flex-col items-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
              Secure Archival Access
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-[11px] font-semibold text-primary/40 tracking-[0.15em] uppercase">
          <span>Woodcrest Capital</span>
          <span className="hidden md:inline">·</span>
          <span>Group 13</span>
          <span className="hidden md:inline">·</span>
          <span>UNT Capstone 2026</span>
        </div>
      </footer>
    </div>
  )
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  )
}
