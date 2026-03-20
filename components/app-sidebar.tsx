'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Home, MessageSquare, Upload, FolderOpen, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import useSWR from 'swr'
import { getDocuments, Document } from '@/lib/api'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/ask', label: 'Ask a Question', icon: MessageSquare },
  { href: '/ingest', label: 'Ingest Document', icon: Upload },
]

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

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  
  const { data: documentsData } = useSWR('documents', getDocuments, {
    refreshInterval: 30000,
    revalidateOnFocus: false,
  })

  const documents = documentsData?.documents || []

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      {/* Logo & Brand */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-card flex items-center justify-center">
            <Image
              src="/images/logo.jpeg"
              alt="CrestMind AI"
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="font-serif text-lg text-primary tracking-tight">CrestMind AI</h1>
            <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em]">Property Intelligence</p>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="h-px bg-sidebar-border mx-4" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-3 mb-3">Navigation</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary nav-active'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          )
        })}

        {/* Knowledge Base Section */}
        <div className="pt-8">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-3 mb-3">Knowledge Base</p>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {documents.length === 0 ? (
              <p className="text-xs text-muted-foreground/60 px-3 italic">No documents ingested</p>
            ) : (
              documents.slice(0, 10).map((doc: Document) => (
                <div
                  key={doc.doc_name}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors group"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
                  <span className="text-xs text-muted-foreground group-hover:text-sidebar-foreground truncate flex-1">
                    {doc.doc_name}
                  </span>
                  <span className={cn(
                    'text-[9px] font-bold uppercase px-1.5 py-0.5 rounded',
                    getDocTypeBadgeClass(doc.doc_type)
                  )}>
                    {doc.doc_type}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
            {user?.username?.slice(0, 2).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.username || 'User'}</p>
            <p className="text-[10px] text-muted-foreground">Woodcrest Capital</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
