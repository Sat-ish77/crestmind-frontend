'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { MessageSquare, Upload, Database, FileText, Layers, Clock, ArrowRight, Search, Sparkles } from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import useSWR from 'swr'
import { getDocuments } from '@/lib/api'
import { Spinner } from '@/components/ui/spinner'

// Animated counter hook
function useAnimatedCounter(target: number, duration: number = 1500, startOnView: boolean = true) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (startOnView && !isInView) return
    if (hasStarted) return
    
    setHasStarted(true)
    const startTime = Date.now()
    const startValue = 0
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentValue = Math.floor(startValue + (target - startValue) * easeOut)
      
      setCount(currentValue)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [target, duration, isInView, hasStarted, startOnView])

  return { count, ref }
}

// Animated icon components
function PulsingSearchIcon() {
  return (
    <motion.div
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Search className="w-7 h-7 text-primary" />
    </motion.div>
  )
}

function FillingDocumentIcon() {
  return (
    <div className="relative w-7 h-7">
      <FileText className="w-7 h-7 text-success absolute" />
      <motion.div
        className="absolute inset-0 overflow-hidden"
        initial={{ height: '100%' }}
        animate={{ height: ['100%', '0%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-7 h-7 bg-card" />
      </motion.div>
    </div>
  )
}

function AssemblingGridIcon() {
  return (
    <motion.div className="relative w-7 h-7 flex flex-wrap gap-0.5">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="w-3 h-3 rounded-sm bg-gold-light"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.3,
            delay: i * 0.15,
            repeat: Infinity,
            repeatType: 'reverse',
            repeatDelay: 1.5,
          }}
        />
      ))}
    </motion.div>
  )
}

const featureCards = [
  {
    title: 'Ask Questions',
    description: 'Query your property documents using natural language and receive AI-powered insights with source citations.',
    icon: PulsingSearchIcon,
    href: '/ask',
    gradient: 'from-primary/20 to-primary/5',
  },
  {
    title: 'Ingest Documents',
    description: 'Upload and process new documents to expand your knowledge base with automatic chunking and embedding.',
    icon: FillingDocumentIcon,
    href: '/ingest',
    gradient: 'from-success/20 to-success/5',
  },
  {
    title: 'Explore Knowledge',
    description: 'Browse your entire document library, search across all ingested materials, and manage your data.',
    icon: AssemblingGridIcon,
    href: '/ingest',
    gradient: 'from-gold-light/20 to-gold-light/5',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState('')
  
  const { data: documentsData, isLoading } = useSWR('documents', getDocuments, {
    refreshInterval: 30000,
  })

  const documents = documentsData?.documents || []
  const totalChunks = documents.reduce((acc, doc) => acc + doc.chunks, 0)
  const lastIngestion = documents.length > 0 
    ? documents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    : null

  // Typewriter effect for username
  useEffect(() => {
    const name = user?.username || 'User'
    let index = 0
    setDisplayName('')
    
    const interval = setInterval(() => {
      if (index <= name.length) {
        setDisplayName(name.slice(0, index))
        index++
      } else {
        clearInterval(interval)
      }
    }, 80)
    
    return () => clearInterval(interval)
  }, [user?.username])

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    return 'Just now'
  }

  const { count: docCount, ref: docRef } = useAnimatedCounter(documents.length)
  const { count: chunkCount, ref: chunkRef } = useAnimatedCounter(totalChunks)

  return (
    <motion.div 
      className="min-h-screen p-6 lg:p-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <motion.header className="space-y-3" variants={itemVariants}>
          <h1 className="text-4xl lg:text-5xl font-serif">
            <span className="text-muted-foreground/60 font-light">Welcome back,</span>{' '}
            <span className="text-primary">
              {displayName}
              <span className="typewriter-cursor" />
            </span>
          </h1>
          <motion.div 
            className="h-0.5 w-0 bg-gradient-to-r from-primary to-transparent"
            animate={{ width: displayName.length > 0 ? '120px' : '0px' }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />
          <p className="text-muted-foreground/80 text-sm tracking-wide">
            Your property intelligence dashboard is ready for analysis.
          </p>
        </motion.header>

        {/* Stats Cards */}
        <motion.section 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
        >
          <motion.div 
            ref={docRef}
            className="glass-card glass-card-hover rounded-xl p-6 animated-border"
            variants={itemVariants}
            whileHover={{ y: -4 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
                Documents Ingested
              </p>
            </div>
            {isLoading ? (
              <Spinner className="w-5 h-5 text-primary" />
            ) : (
              <p className="text-5xl font-serif text-primary tabular-nums">
                {docCount.toLocaleString()}
              </p>
            )}
          </motion.div>

          <motion.div 
            ref={chunkRef}
            className="glass-card glass-card-hover rounded-xl p-6 animated-border"
            variants={itemVariants}
            whileHover={{ y: -4 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                <Layers className="w-5 h-5 text-primary" />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
                Total Chunks
              </p>
            </div>
            {isLoading ? (
              <Spinner className="w-5 h-5 text-primary" />
            ) : (
              <p className="text-5xl font-serif text-primary tabular-nums">
                {chunkCount.toLocaleString()}
              </p>
            )}
          </motion.div>

          <motion.div 
            className="glass-card glass-card-hover rounded-xl p-6 animated-border"
            variants={itemVariants}
            whileHover={{ y: -4 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
                Last Ingestion
              </p>
            </div>
            {isLoading ? (
              <Spinner className="w-5 h-5 text-primary" />
            ) : (
              <p className="text-5xl font-serif text-primary">
                {lastIngestion ? formatTimeAgo(lastIngestion.created_at) : '—'}
              </p>
            )}
          </motion.div>
        </motion.section>

        {/* Feature Cards */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground">
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featureCards.map((card, index) => {
              const IconComponent = card.icon
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Link href={card.href}>
                    <motion.div 
                      className="glass-card rounded-xl p-6 h-full group animated-border cursor-pointer"
                      whileHover={{ y: -4, scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-5`}>
                        <IconComponent />
                      </div>
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
                        {card.title}
                      </h3>
                      <p className="text-sm text-muted-foreground/70 leading-relaxed mb-5">
                        {card.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-primary font-medium">
                        <span className="text-[11px] uppercase tracking-[0.1em]">Get Started</span>
                        <motion.div
                          className="inline-block"
                          whileHover={{ x: 4 }}
                          transition={{ type: 'spring', stiffness: 400 }}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </motion.div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        {/* Getting Started Guide */}
        <motion.section 
          className="glass-card rounded-xl p-8"
          variants={itemVariants}
        >
          <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground mb-8">
            Getting Started
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: 'Upload Your Documents',
                description: 'Start by ingesting your property documents such as leases, amendments, invoices, and inspection reports.',
              },
              {
                step: 2,
                title: 'AI Processing',
                description: 'Our system automatically chunks, embeds, and indexes your documents for intelligent retrieval.',
              },
              {
                step: 3,
                title: 'Ask Anything',
                description: 'Query your knowledge base using natural language and receive accurate answers with source citations.',
              },
            ].map((item, index) => (
              <motion.div 
                key={item.step} 
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.15 }}
              >
                <div className="flex items-start gap-4">
                  <motion.div 
                    className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0"
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(201, 168, 76, 0.2)' }}
                  >
                    <span className="text-sm font-bold text-primary">{item.step}</span>
                  </motion.div>
                  <div>
                    <h3 className="font-semibold mb-2 text-foreground/90">{item.title}</h3>
                    <p className="text-sm text-muted-foreground/70 leading-relaxed">{item.description}</p>
                  </div>
                </div>
                {item.step < 3 && (
                  <div className="hidden md:block absolute top-5 left-[calc(100%_-_1.5rem)] w-12 border-t border-dashed border-primary/20" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Recent Documents Preview */}
        {documents.length > 0 && (
          <motion.section
            variants={itemVariants}
            className="glass-card rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground">
                Recent Documents
              </h2>
              <Link 
                href="/ingest" 
                className="text-xs text-primary hover:text-primary-electric transition-colors flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {documents.slice(0, 3).map((doc, index) => (
                <motion.div
                  key={doc.doc_name}
                  className="flex items-center justify-between p-4 rounded-lg bg-background/30 border border-border/50 hover:border-primary/30 transition-colors"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <div className="flex items-center gap-3">
                    <Database className="w-4 h-4 text-primary/60" />
                    <span className="text-sm font-medium truncate max-w-[200px]">{doc.doc_name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{doc.chunks} chunks</span>
                    <span className="text-primary/60">{doc.created_at}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </motion.div>
  )
}
