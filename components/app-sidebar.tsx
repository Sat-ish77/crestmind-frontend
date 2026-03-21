'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Home, MessageSquare, Upload, FolderOpen, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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

interface AppSidebarProps {
  onNavigate?: () => void
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  
  const { data: documentsData } = useSWR('documents', getDocuments, {
    refreshInterval: 30000,
    revalidateOnFocus: false,
  })

  const documents = documentsData?.documents || []

  const handleNavigation = () => {
    onNavigate?.()
  }

  const handleLogout = () => {
    logout()
    onNavigate?.()
  }

  return (
    <aside className="h-full w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo & Brand */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3" onClick={handleNavigation}>
          <motion.div 
            className="relative w-10 h-10 rounded-lg overflow-hidden bg-card logo-breathe"
          >
            <Image
              src="/images/logo.jpeg"
              alt="CrestMind AI"
              fill
              className="object-cover"
            />
          </motion.div>
          <div className="flex flex-col">
            <h1 className="font-serif text-lg text-primary tracking-tight">CrestMind AI</h1>
            <p className="text-[8px] text-muted-foreground/60 uppercase tracking-[0.2em]">Property Intelligence</p>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="h-px bg-sidebar-border/50 mx-4" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 px-3 mb-3">Navigation</p>
        {navItems.map((item, index) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={item.href}
                onClick={handleNavigation}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-300',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
              >
                {/* Active indicator */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] bg-primary rounded-r-full"
                      initial={{ opacity: 0, scaleY: 0 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      exit={{ opacity: 0, scaleY: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ boxShadow: '0 0 10px rgba(201, 168, 76, 0.5)' }}
                    />
                  )}
                </AnimatePresence>
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            </motion.div>
          )
        })}

        {/* Knowledge Base Section */}
        <div className="pt-8">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 px-3 mb-3">Knowledge Base</p>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {documents.length === 0 ? (
              <p className="text-xs text-muted-foreground/40 px-3 italic">No documents ingested</p>
            ) : (
              documents.slice(0, 10).map((doc: Document, index: number) => (
                <motion.div
                  key={doc.doc_name}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent transition-all duration-200 group cursor-default"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.03 }}
                  whileHover={{ x: 4 }}
                >
                  <FolderOpen className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                  <span className="text-xs text-muted-foreground/60 group-hover:text-sidebar-foreground truncate flex-1 transition-colors">
                    {doc.doc_name}
                  </span>
                  <span className={cn(
                    'text-[8px] font-bold uppercase px-1.5 py-0.5 rounded',
                    getDocTypeBadgeClass(doc.doc_type)
                  )}>
                    {doc.doc_type}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
            {user?.username?.slice(0, 2).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-foreground/90">{user?.username || 'User'}</p>
            <p className="text-[9px] text-muted-foreground/50 uppercase tracking-[0.1em]">Woodcrest Capital</p>
          </div>
        </div>
        <motion.button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </motion.button>
      </div>
    </aside>
  )
}
