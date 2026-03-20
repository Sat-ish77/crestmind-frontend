import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://crestmind-api-88776185583.us-central1.run.app' 

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Types
export interface Source {
  doc_name: string
  section: string
  page_number: number
  confidence: 'high' | 'medium' | 'low'
  chunk_text: string
}

export interface AskResponse {
  answer: string
  found_in_documents: boolean
  overall_confidence: 'high' | 'medium' | 'low'
  sources: Source[]
}

export interface AskRequest {
  query: string
  filter_doc_type?: string | null
  filter_doc_name?: string | null
  top_k?: number
}

export interface IngestResponse {
  doc_name: string
  chunks_stored: number
  doc_type: string
}

export interface Document {
  doc_name: string
  doc_type: string
  chunks: number
  created_at: string
}

export interface DocumentsResponse {
  documents: Document[]
}

export interface DeleteResponse {
  success: boolean
  doc_name: string
}

// API Functions
export async function askQuestion(request: AskRequest): Promise<AskResponse> {
  const response = await api.post<AskResponse>('/ask', request)
  return response.data
}

export async function ingestDocument(
  file: File,
  propertyName: string,
  docType: string
): Promise<IngestResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('property_name', propertyName)
  formData.append('doc_type', docType)

  const response = await api.post<IngestResponse>('/ingest', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export async function getDocuments(): Promise<DocumentsResponse> {
  const response = await api.get<DocumentsResponse>('/documents')
  return response.data
}

export async function deleteDocument(docName: string): Promise<DeleteResponse> {
  const response = await api.delete<DeleteResponse>(`/documents/${encodeURIComponent(docName)}`)
  return response.data
}
