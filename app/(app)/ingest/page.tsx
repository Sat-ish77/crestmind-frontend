'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, CloudUpload, FileText, Check, Trash2, AlertCircle, X, Database, Search } from 'lucide-react'
import { ingestDocument, getDocuments, deleteDocument, Document } from '@/lib/api'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import useSWR, { mutate } from 'swr'
import { cn } from '@/lib/utils'

const docTypes = [
  { value: 'auto-detect', label: 'Auto-detect' },
  { value: 'lease', label: 'Lease' },
  { value: 'amendment', label: 'Amendment' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'quote', label: 'Quote' },
  { value: 'work_order', label: 'Work Order' },
]

type IngestStep = 'reading' | 'chunking' | 'embedding'

interface IngestProgress {
  step: IngestStep
  progress: number
}

function getDocTypeBadgeClass(docType: string): string {
  const type = docType.toLowerCase()
  if (type === 'lease') return 'badge-lease'
  if (type === 'amendment') return 'badge-amendment'
  if (type === 'invoice') return 'badge-invoice'
  if (type === 'inspection') return 'badge-inspection'
  if (type === 'quote') return 'badge-quote'
  if (type === 'work_order') return 'badge-work_order'
  return 'badge-invoice'
}

function ProgressIndicator({ currentStep }: { currentStep: IngestStep }) {
  const steps: { key: IngestStep; label: string }[] = [
    { key: 'reading', label: 'Reading' },
    { key: 'chunking', label: 'Chunking' },
    { key: 'embedding', label: 'Embedding' },
  ]

  const currentIndex = steps.findIndex((s) => s.key === currentStep)
  const progressWidth = ((currentIndex + 1) / steps.length) * 100

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-semibold text-primary">Processing...</span>
        <span className="text-xs text-muted-foreground">
          Step {currentIndex + 1} of {steps.length}
        </span>
      </div>
      <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-primary transition-all duration-300"
          style={{ width: `${progressWidth}%` }}
        />
        <div className="absolute top-0 left-0 h-full w-full progress-shimmer" />
      </div>
      <div className="flex justify-between px-2">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          return (
            <div key={step.key} className="flex flex-col items-center gap-1">
              {isCompleted ? (
                <Check className="w-4 h-4 text-primary" />
              ) : isCurrent ? (
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
              )}
              <span className={cn(
                'text-[10px] uppercase font-bold',
                isCompleted || isCurrent ? 'text-primary' : 'text-muted-foreground/50'
              )}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function IngestPage() {
  const [file, setFile] = useState<File | null>(null)
  const [propertyName, setPropertyName] = useState('')
  const [docType, setDocType] = useState('auto-detect')
  const [isIngesting, setIsIngesting] = useState(false)
  const [progress, setProgress] = useState<IngestProgress | null>(null)
  const [lastIngestResult, setLastIngestResult] = useState<{ docName: string; chunks: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingDoc, setDeletingDoc] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const { data: documentsData, isLoading: isLoadingDocs } = useSWR('documents', getDocuments, {
    refreshInterval: 10000,
  })

  const documents = documentsData?.documents || []
  const filteredDocuments = documents.filter((doc) =>
    doc.doc_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      setFile(droppedFile)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleIngest = async () => {
    if (!file) {
      toast.error('Please select a file to ingest')
      return
    }
    if (!propertyName.trim()) {
      toast.error('Please enter a property name')
      return
    }

    setIsIngesting(true)
    setLastIngestResult(null)

    // Simulate progress steps
    const steps: IngestStep[] = ['reading', 'chunking', 'embedding']
    for (const step of steps) {
      setProgress({ step, progress: 0 })
      await new Promise((resolve) => setTimeout(resolve, 800))
    }

    try {
      const result = await ingestDocument(file, propertyName, docType)
      setLastIngestResult({ docName: result.doc_name, chunks: result.chunks_stored })
      toast.success(`Successfully ingested ${result.doc_name}`)
      
      // Reset form
      setFile(null)
      setPropertyName('')
      setDocType('auto-detect')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      // Refresh documents list
      mutate('documents')
    } catch (error) {
      console.error('Ingest error:', error)
      toast.error('Failed to ingest document. Please check if the API is running.')
    } finally {
      setIsIngesting(false)
      setProgress(null)
    }
  }

  const handleDelete = async (docName: string) => {
    setDeletingDoc(docName)
    try {
      await deleteDocument(docName)
      toast.success(`Deleted ${docName}`)
      mutate('documents')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete document')
    } finally {
      setDeletingDoc(null)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-3xl font-serif text-foreground">Ingest Document</h1>
          <p className="text-muted-foreground">
            Expand your knowledge base by uploading property documents
          </p>
        </header>

        {/* Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'flex flex-col items-center justify-center gap-6 rounded-xl border-2 border-dashed px-6 py-20 cursor-pointer transition-all',
              isDragOver
                ? 'border-primary bg-primary/10'
                : 'border-primary/40 bg-primary/5 hover:bg-primary/10',
              file && 'border-success bg-success/5'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.doc"
              onChange={handleFileSelect}
              className="hidden"
            />
            {file ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-success" />
                </div>
                <div className="text-center">
                  <p className="font-semibold">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Remove file
                </button>
              </div>
            ) : (
              <>
                <CloudUpload className="w-16 h-16 text-primary" />
                <div className="text-center">
                  <p className="text-xl font-semibold">Drop files here</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Supports PDF, DOCX, and TXT (Max 50MB)
                  </p>
                </div>
                <button className="bg-primary text-primary-foreground font-semibold px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors">
                  Browse Files
                </button>
              </>
            )}
          </div>

          {/* Metadata Form */}
          <div className="glass-card rounded-xl p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Property Name
                </label>
                <input
                  type="text"
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  placeholder="e.g. Westfield Shopping Center"
                  className="w-full bg-background border border-border rounded-lg h-12 px-4 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary input-glow transition-all placeholder:text-muted-foreground/50"
                  disabled={isIngesting}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Document Type
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg h-12 px-4 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  disabled={isIngesting}
                >
                  {docTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Progress */}
            {progress && (
              <ProgressIndicator currentStep={progress.step} />
            )}

            {/* Ingest Button */}
            <button
              onClick={handleIngest}
              disabled={isIngesting || !file || !propertyName.trim()}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-lg shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
            >
              {isIngesting ? (
                <>
                  <Spinner className="w-5 h-5" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Ingest Document</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success Card */}
        {lastIngestResult && (
          <div className="flex items-center gap-4 bg-success/10 border border-success/30 p-4 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center">
              <Check className="w-4 h-4 text-success-foreground" />
            </div>
            <div>
              <p className="font-bold text-success">Ingestion Complete</p>
              <p className="text-sm text-success/80">
                &quot;{lastIngestResult.docName}&quot; has been processed into {lastIngestResult.chunks} chunks.
              </p>
            </div>
          </div>
        )}

        {/* Knowledge Base Table */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Knowledge Base</h2>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents..."
                className="pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>
          </div>

          <div className="glass-card rounded-xl overflow-hidden">
            {isLoadingDocs ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="w-6 h-6 text-primary" />
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="w-10 h-10 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'No documents match your search' : 'No documents ingested yet'}
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-primary/5">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Document Name
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Type
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Chunks
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Created
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredDocuments.map((doc: Document) => (
                    <tr key={doc.doc_name} className="hover:bg-primary/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-primary" />
                          <span className="font-medium">{doc.doc_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'text-[10px] font-bold uppercase px-2 py-1 rounded',
                          getDocTypeBadgeClass(doc.doc_type)
                        )}>
                          {doc.doc_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{doc.chunks}</td>
                      <td className="px-6 py-4 text-muted-foreground">{doc.created_at}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(doc.doc_name)}
                          disabled={deletingDoc === doc.doc_name}
                          className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                        >
                          {deletingDoc === doc.doc_name ? (
                            <Spinner className="w-4 h-4" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
