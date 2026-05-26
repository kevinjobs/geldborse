type FetchOptions = Omit<RequestInit, 'body'> & {
  body?: Record<string, unknown> | unknown[] | FormData
}

async function apiRequest<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { body, ...rest } = options

  const isFormData = body instanceof FormData

  const response = await fetch(endpoint, {
    ...rest,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...rest.headers,
    },
    credentials: 'include',
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || 'Request failed')
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}

export const api = {
  get: <T>(endpoint: string, options?: FetchOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: FetchOptions['body'], options?: FetchOptions) =>
    apiRequest<T>(endpoint, { ...options, body, method: 'POST' }),

  put: <T>(endpoint: string, body?: FetchOptions['body'], options?: FetchOptions) =>
    apiRequest<T>(endpoint, { ...options, body, method: 'PUT' }),

  patch: <T>(endpoint: string, body?: FetchOptions['body'], options?: FetchOptions) =>
    apiRequest<T>(endpoint, { ...options, body, method: 'PATCH' }),

  delete: <T>(endpoint: string, options?: FetchOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
}

export type { FetchOptions }