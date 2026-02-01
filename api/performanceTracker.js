/**
 * Performance Tracking and Request Context Helper
 * 
 * Wraps API handlers to automatically track response times,
 * capture request context, and enhance error alerts.
 */

/**
 * Sanitize request body for logging (remove sensitive data)
 */
function sanitizeRequestBody(body) {
  if (!body || typeof body !== 'object') return body
  
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'accessToken', 'sourceId', 'card', 'cvv', 'ssn']
  const sanitized = { ...body }
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]'
    }
  }
  
  return sanitized
}

/**
 * Extract request context from Request object
 */
export function extractRequestContext(request) {
  const url = new URL(request.url)
  const headers = {}
  
  // Extract relevant headers (sanitize sensitive ones)
  const relevantHeaders = ['user-agent', 'referer', 'origin', 'content-type', 'accept', 'accept-language']
  for (const header of relevantHeaders) {
    const value = request.headers.get(header)
    if (value) {
      headers[header] = value
    }
  }
  
  // Extract query parameters
  const queryParams = {}
  for (const [key, value] of url.searchParams.entries()) {
    queryParams[key] = value
  }
  
  return {
    headers,
    queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    url: url.pathname,
  }
}

/**
 * Wrap an API handler to track performance and enhance alerts
 */
export function withPerformanceTracking(handler) {
  return async (request) => {
    const startTime = Date.now()
    const requestId = crypto.randomUUID()
    const requestContext = extractRequestContext(request)
    
    // Extract request body if available (for POST/PUT requests)
    let requestBody = null
    try {
      if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
        const clonedRequest = request.clone()
        const body = await clonedRequest.json().catch(() => null)
        if (body) {
          requestBody = sanitizeRequestBody(body)
        }
      }
    } catch (e) {
      // Ignore body parsing errors
    }
    
    try {
      const response = await handler(request, { requestId, requestContext, requestBody })
      const responseTime = Date.now() - startTime
      
      // Track slow responses
      const SLOW_API_THRESHOLD_MS = parseInt(process.env.ALERT_SLOW_API_THRESHOLD_MS || '2000', 10)
      if (responseTime > SLOW_API_THRESHOLD_MS) {
        const { sendSlackAlert } = await import('./slackAlerts.js')
        const url = new URL(request.url)
        void sendSlackAlert({
          statusCode: response.status || 200,
          error: `Slow API response: ${responseTime}ms`,
          endpoint: url.pathname,
          method: request.method,
          requestId,
          responseTime,
          requestBody,
          requestHeaders: requestContext.headers,
          queryParams: requestContext.queryParams,
          context: {
            responseType: 'slow_response',
            statusCode: response.status,
          },
          dedupeKey: `slow:${url.pathname}:${request.method}`,
          dedupeTtlMs: 60 * 1000, // 1 minute for slow response alerts
        })
      }
      
      return response
    } catch (error) {
      const responseTime = Date.now() - startTime
      const url = new URL(request.url)
      
      // Enhanced error alert with all context
      const { sendSlackAlert } = await import('./slackAlerts.js')
      void sendSlackAlert({
        statusCode: 500,
        error: error?.message || 'Unknown error',
        endpoint: url.pathname,
        method: request.method,
        requestId,
        responseTime,
        requestBody,
        requestHeaders: requestContext.headers,
        queryParams: requestContext.queryParams,
        stack: error?.stack,
        context: {
          errorName: error?.name,
          handlerError: true,
        },
        dedupeKey: `handler:${url.pathname}:${error?.message || 'unknown'}`,
      })
      
      throw error
    }
  }
}
