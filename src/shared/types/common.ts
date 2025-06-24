export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface ApiError {
  success: false
  error: string
  code?: string
  statusCode?: number
}

export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E } 