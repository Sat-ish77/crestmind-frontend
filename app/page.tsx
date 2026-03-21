'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { AuthProvider } from '@/lib/auth-context'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'

// Particle system for login background
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    
    interface Particle {
      x: number
      y: number
      size: number
      speedY: number
      opacity: number
      fadeSpeed: number
    }
    
    const particles: Particle[] = []
    const particleCount = 60
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedY: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.5 + 0.1,
        fadeSpeed: Math.random() * 0.005 + 0.002,
      })
    }
    
    let animationId: number
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach((p) => {
        p.y -= p.speedY
        p.opacity += Math.sin(Date.now() * p.fadeSpeed) * 0.01
        
        if (p.y < -10) {
          p.y = canvas.height + 10
          p.x = Math.random() * canvas.width
        }
        
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3)
        gradient.addColorStop(0, `rgba(201, 168, 76, ${Math.max(0.1, Math.min(0.6, p.opacity))})`)
        gradient.addColorStop(1, 'rgba(201, 168, 76, 0)')
        
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      })
      
      animationId = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])
  
  return <canvas ref={canvasRef} className="particle-canvas z-0" />
}

// Animated gold ring around logo
function LogoRing() {
  return (
    <motion.div
      className="absolute inset-0 rounded-xl"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <motion.div
        className="absolute inset-[-3px] rounded-xl border border-primary/30"
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(201, 168, 76, 0)',
            '0 0 20px 2px rgba(201, 168, 76, 0.3)',
            '0 0 0 0 rgba(201, 168, 76, 0)',
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 1,
        }}
      />
    </motion.div>
  )
}

function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { login, user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter both username and password')
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
      return
    }

    setIsLoading(true)
    try {
      const success = await login(username, password)
      if (success) {
        setIsSuccess(true)
        toast.success('Welcome to CrestMind AI')
        setTimeout(() => router.push('/dashboard'), 600)
      } else {
        toast.error('Invalid credentials')
        setIsShaking(true)
        setTimeout(() => setIsShaking(false), 500)
      }
    } catch {
      toast.error('An error occurred during login')
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
    } finally {
      setIsLoading(false)
    }
  }, [username, password, login, router])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Spinner className="w-8 h-8 text-primary" />
          <p className="text-sm text-muted-foreground tracking-widest uppercase">Initializing</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-[12vh] md:pt-[15vh] bg-background relative overflow-hidden">
      {/* Particle Background */}
      <ParticleField />
      
      {/* Dot Grid Background */}
      <div className="absolute inset-0 dot-grid z-0" />
      
      {/* Noise Texture */}
      <div className="noise-texture z-0" />

      {/* Corner Accents */}
      <motion.div 
        className="absolute top-0 left-0 w-32 h-32 border-l border-t border-primary/20 m-8"
        initial={{ opacity: 0, x: -20, y: -20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />
      <motion.div 
        className="absolute bottom-0 right-0 w-32 h-32 border-r border-b border-primary/20 m-8"
        initial={{ opacity: 0, x: 20, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />

      {/* Main Login Card */}
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="login-card"
            className="relative w-full max-w-md md:max-w-lg px-6 z-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Gold Glow Behind */}
            <div className="absolute -inset-8 bg-primary/5 blur-3xl rounded-full" />
            
            <motion.div 
              className={`glass-card relative rounded-xl p-8 gold-glow ${isShaking ? 'shake' : ''}`}
              animate={isShaking ? { x: [0, -4, 4, -4, 4, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              {/* Logo & Brand */}
              <motion.div 
                className="flex flex-col items-center mb-10 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="relative w-20 h-20 rounded-xl overflow-hidden mb-4">
                  <LogoRing />
                  <Image
                    src="/images/logo.jpeg"
                    alt="CrestMind AI"
                    fill
                    className="object-cover relative z-10"
                  />
                </div>
                <motion.h1 
                  className="font-serif text-3xl text-primary tracking-tight mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  CRESTMIND AI
                </motion.h1>
                <motion.p 
                  className="text-[10px] font-semibold tracking-[0.3em] text-primary/70 uppercase"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Property Document Intelligence
                </motion.p>
              </motion.div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em] mb-2 px-1">
                    Username
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="w-full bg-background/50 border border-primary/20 rounded-lg h-14 px-4 pr-10 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 input-glow input-gold-sweep transition-all caret-primary"
                      disabled={isLoading}
                    />
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-primary/60 transition-colors" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em] mb-2 px-1">
                    Password
                  </label>
                  <div className="relative group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-background/50 border border-primary/20 rounded-lg h-14 px-4 pr-10 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 input-glow input-gold-sweep transition-all caret-primary"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/30 hover:text-primary/60 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-primary to-primary-electric hover:from-primary-electric hover:to-primary text-primary-foreground font-bold py-4 rounded-lg shadow-lg shadow-primary/20 transition-all uppercase tracking-[0.15em] text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 button-press button-shimmer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <>
                      <Spinner className="w-4 h-4" />
                      <span>Authenticating</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Sign In</span>
                    </>
                  )}
                </motion.button>
              </form>

              {/* SSO Button */}
              <motion.div 
                className="mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <button
                  disabled
                  className="w-full bg-muted/30 text-muted-foreground/50 font-medium py-3 rounded-lg border border-border/50 cursor-not-allowed text-sm tracking-wide"
                >
                  Single Sign-On (Coming Soon)
                </button>
              </motion.div>

              {/* Secure Access Note */}
              <motion.div 
                className="mt-8 pt-8 border-t border-primary/10 flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <p className="text-[9px] text-muted-foreground/60 uppercase tracking-[0.2em] font-semibold">
                  Secure Archival Access
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="success-state"
            className="flex flex-col items-center gap-6 z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5 }}
            >
              <motion.svg
                className="w-10 h-10 text-success"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </motion.svg>
            </motion.div>
            <p className="text-primary font-serif text-xl">Welcome, {username}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.footer 
        className="mt-auto pb-8 text-center z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-[10px] font-semibold text-primary/30 tracking-[0.2em] uppercase">
          <span>Woodcrest Capital</span>
          <span className="hidden md:inline text-primary/20">|</span>
          <span>Group 13</span>
          <span className="hidden md:inline text-primary/20">|</span>
          <span>UNT Capstone 2026</span>
        </div>
      </motion.footer>
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
