'use client'

import { useState, useMemo } from 'react'
import { Search, DollarSign, CalendarDays, ShieldCheck, ParkingCircle, Droplet, PawPrint, ChevronDown, ChevronUp, CheckCircle, AlertCircle, AlertTriangle, FileText } from 'lucide-react'
import { askQuestion, AskResponse, Source, getDocuments } from '@/lib/api'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import useSWR from 'swr'
import { cn } from '@/lib/utils'

const quickQuestions = [
  { icon: DollarSign, label: 'What is the monthly rent?' },
  { icon: PawPrint, label: 'What is the pet policy?' },
  { icon: CalendarDays, label: 'When does the lease expire?' },
  { icon: ShieldCheck, label: 'What is the security deposit?' },
  { icon: ParkingCircle, label: 'Are there parking fees?' },
  { icon: Droplet, label: 'Who pays for utilities?' },
]

const docTypes = [
  { value: '', label: 'All Document Types' },
  { value: 'lease', label: 'Lease' },
  { value: 'amendment', label: 'Amendment' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'quote', label: 'Quote' },
  { value: 'work_order', label: 'Work Order' },
]

function ConfidenceBadge({ confidence }: { confidence: 'high' | 'medium' | 'low' }) {
  const config = {
    high: {
      icon: CheckCircle,
      label: 'High Confidence',
      className: 'bg-success/10 border-success/20 text-success confidence-high',
    },
    medium: {
      icon: AlertCircle,
      label: 'Medium Confidence',
      className: 'bg-warning/10 border-warning/20 text-warning',
    },
    low: {
      icon: AlertTriangle,
      label: 'Low Confidence',
      className: 'bg-destructive/10 border-destructive/20 text-destructive',
    },
  }

  const { icon: Icon, label, className } = config[confidence]

  return (
    <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-full border', className)}>
      <Icon className="w-3.5 h-3.5" />
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </div>
  )
}

function SourceCard({ source, index }: { source: Source; index: number }) {
  const [isExpanded, setIsExpanded] = useState(index === 0)

  const confidenceConfig = {
    high: 'text-success',
    medium: 'text-warning',
    low: 'text-destructive',
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card/30">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-primary/5 hover:bg-primary/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <FileText className="w-4 h-4 text-primary/60" />
          <div className="text-left">
            <p className="text-sm font-semibold">{source.doc_name}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Page {source.page_number} · {source.section}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn('text-[10px] font-bold uppercase', confidenceConfig[source.confidence])}>
            {source.confidence}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>
      {isExpanded && (
        <div className="p-5 bg-background/40 border-t border-border">
          <pre className="font-mono text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {source.chunk_text}
          </pre>
        </div>
      )}
    </div>
  )
}

export default function AskPage() {
  const [query, setQuery] = useState('')
  const [filterDocType, setFilterDocType] = useState('')
  const [filterDocName, setFilterDocName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<AskResponse | null>(null)

  const { data: documentsData } = useSWR('documents', getDocuments)
  const documents = documentsData?.documents || []

  // Deduplicate sources by doc_name + section
  const deduplicatedSources = useMemo(() => {
    if (!response?.sources) return []
    const seen = new Set<string>()
    return response.sources.filter((source) => {
      const key = `${source.doc_name}-${source.section}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [response?.sources])

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query
    if (!q.trim()) {
      toast.error('Please enter a question')
      return
    }

    setIsLoading(true)
    setResponse(null)

    try {
      const result = await askQuestion({
        query: q,
        filter_doc_type: filterDocType || null,
        filter_doc_name: filterDocName || null,
        top_k: 5,
      })
      setResponse(result)
    } catch (error) {
      console.error('Ask error:', error)
      toast.error('Failed to get answer. Please check if the API is running.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickQuestion = (question: string) => {
    setQuery(question)
    handleSearch(question)
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-3xl font-serif text-foreground">Ask a Question</h1>
          <p className="text-muted-foreground">
            Query your property documents using natural language
          </p>
        </header>

        {/* Quick Questions */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 px-1">
            Common Inquiries
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickQuestions.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  onClick={() => handleQuickQuestion(item.label)}
                  disabled={isLoading}
                  className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-xl hover:border-primary/40 hover:bg-primary/10 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Search Input */}
        <section className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Ask anything about your property documents..."
              className="w-full bg-card/50 border border-border rounded-xl py-5 pl-12 pr-6 text-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary input-glow transition-all placeholder:text-muted-foreground/50"
              disabled={isLoading}
            />
          </div>

          {/* Filters & Search Button */}
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={filterDocType}
              onChange={(e) => setFilterDocType(e.target.value)}
              className="bg-card border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              disabled={isLoading}
            >
              {docTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <select
              value={filterDocName}
              onChange={(e) => setFilterDocName(e.target.value)}
              className="bg-card border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              disabled={isLoading}
            >
              <option value="">All Documents</option>
              {documents.map((doc) => (
                <option key={doc.doc_name} value={doc.doc_name}>
                  {doc.doc_name}
                </option>
              ))}
            </select>

            <button
              onClick={() => handleSearch()}
              disabled={isLoading || !query.trim()}
              className="ml-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Spinner className="w-4 h-4" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Results */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Spinner className="w-8 h-8 text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Analyzing your documents...</p>
          </div>
        )}

        {response && !isLoading && (
          <section className="space-y-6">
            {/* Confidence Badge */}
            <div className="flex items-center justify-between px-1">
              <ConfidenceBadge confidence={response.overall_confidence} />
              <span className="text-xs text-muted-foreground">
                {response.found_in_documents ? 'Found in documents' : 'No direct match found'}
              </span>
            </div>

            {/* Answer Box */}
            <div className="bg-primary/5 border-l-4 border-primary rounded-r-xl p-8 gold-glow-sm">
              <p className="text-lg leading-relaxed text-foreground whitespace-pre-wrap">
                {response.answer}
              </p>
            </div>

            {/* Sources */}
            {deduplicatedSources.length > 0 && (
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">
                  Source Citations ({deduplicatedSources.length})
                </p>
                <div className="space-y-3">
                  {deduplicatedSources.map((source, index) => (
                    <SourceCard key={`${source.doc_name}-${source.section}-${index}`} source={source} index={index} />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Empty State */}
        {!response && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-primary/60" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Ready to Search</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Enter your question above or select a common inquiry to get started. Our AI will analyze your property documents and provide accurate answers with source citations.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
