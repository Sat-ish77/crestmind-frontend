'use client'

import Link from 'next/link'
import { MessageSquare, Upload, Database, FileText, Layers, Clock, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import useSWR from 'swr'
import { getDocuments } from '@/lib/api'
import { Spinner } from '@/components/ui/spinner'

const featureCards = [
  {
    title: 'Ask Questions',
    description: 'Query your property documents using natural language and receive AI-powered insights with source citations.',
    icon: MessageSquare,
    href: '/ask',
    color: 'text-primary',
    bgColor: 'bg-primary/5',
  },
  {
    title: 'Ingest Documents',
    description: 'Upload and process new documents to expand your knowledge base with automatic chunking and embedding.',
    icon: Upload,
    href: '/ingest',
    color: 'text-success',
    bgColor: 'bg-success/5',
  },
  {
    title: 'Explore Knowledge',
    description: 'Browse your entire document library, search across all ingested materials, and manage your data.',
    icon: Database,
    href: '/ingest',
    color: 'text-gold-light',
    bgColor: 'bg-gold-light/5',
  },
]

const gettingStartedSteps = [
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
]

export default function DashboardPage() {
  const { user } = useAuth()
  
  const { data: documentsData, isLoading } = useSWR('documents', getDocuments, {
    refreshInterval: 30000,
  })

  const documents = documentsData?.documents || []
  const totalChunks = documents.reduce((acc, doc) => acc + doc.chunks, 0)
  const lastIngestion = documents.length > 0 
    ? documents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    : null

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

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-4xl font-serif">
            <span className="text-muted-foreground font-light">Welcome back,</span>{' '}
            <span className="text-primary font-normal">{user?.username || 'User'}</span>
          </h1>
          <p className="text-muted-foreground">Your property intelligence dashboard is ready for analysis.</p>
        </header>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-xl p-6 card-hover">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Documents Ingested</p>
            </div>
            {isLoading ? (
              <Spinner className="w-5 h-5 text-primary" />
            ) : (
              <p className="text-4xl font-serif text-primary">{documents.length.toLocaleString()}</p>
            )}
          </div>

          <div className="glass-card rounded-xl p-6 card-hover">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Layers className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Total Chunks</p>
            </div>
            {isLoading ? (
              <Spinner className="w-5 h-5 text-primary" />
            ) : (
              <p className="text-4xl font-serif text-primary">{totalChunks.toLocaleString()}</p>
            )}
          </div>

          <div className="glass-card rounded-xl p-6 card-hover">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Last Ingestion</p>
            </div>
            {isLoading ? (
              <Spinner className="w-5 h-5 text-primary" />
            ) : (
              <p className="text-4xl font-serif text-primary">
                {lastIngestion ? formatTimeAgo(lastIngestion.created_at) : '—'}
              </p>
            )}
          </div>
        </section>

        {/* Feature Cards */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featureCards.map((card) => {
              const Icon = card.icon
              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className="glass-card rounded-xl p-6 card-hover group"
                >
                  <div className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {card.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-primary font-medium">
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Getting Started Guide */}
        <section className="glass-card rounded-xl p-8">
          <h2 className="text-lg font-semibold mb-6">Getting Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {gettingStartedSteps.map((item) => (
              <div key={item.step} className="relative">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">{item.step}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
                {item.step < 3 && (
                  <div className="hidden md:block absolute top-4 left-[calc(100%_-_1rem)] w-8 border-t border-dashed border-primary/30" />
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
