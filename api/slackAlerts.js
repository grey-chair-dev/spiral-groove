/**
 * Enhanced Error Alerting System (via Make.com Webhook)
 * 
 * Comprehensive error monitoring with performance tracking, error frequency detection,
 * request context, rate limiting details, error grouping, and more.
 * 
 * Environment Variables:
 *   MAKE_ALERTS_WEBHOOK_URL - Make.com webhook URL for error alerts (falls back to MAKE_WEBHOOK_URL)
 *   ALERT_ENABLED - Set to "true" to enable alerts (default: false in dev)
 *   ALERT_SLOW_QUERY_THRESHOLD_MS - Alert on queries slower than this (default: 500)
 *   ALERT_SLOW_API_THRESHOLD_MS - Alert on API responses slower than this (default: 2000)
 *   ALERT_ERROR_SPIKE_THRESHOLD - Alert if errors exceed this count in window (default: 10)
 *   ALERT_ERROR_SPIKE_WINDOW_MS - Time window for error spike detection (default: 5 minutes)
 * 
 * Usage:
 *   import { sendSlackAlert } from './slackAlerts.js'
 *   await sendSlackAlert({ statusCode: 500, error: 'Database connection failed', endpoint: '/api/products' })
 */

const DEFAULT_DEDUPE_TTL_MS = 5 * 60 * 1000 // 5 minutes
const SLOW_QUERY_THRESHOLD_MS = parseInt(process.env.ALERT_SLOW_QUERY_THRESHOLD_MS || '500', 10)
const SLOW_API_THRESHOLD_MS = parseInt(process.env.ALERT_SLOW_API_THRESHOLD_MS || '2000', 10)
const ERROR_SPIKE_THRESHOLD = parseInt(process.env.ALERT_ERROR_SPIKE_THRESHOLD || '10', 10)
const ERROR_SPIKE_WINDOW_MS = parseInt(process.env.ALERT_ERROR_SPIKE_WINDOW_MS || '300000', 10) // 5 minutes

const dedupeMap = new Map() // key -> timestamp
const errorCounts = new Map() // errorFingerprint -> { count, firstSeen, lastSeen, occurrences: [] }
const performanceMetrics = new Map() // endpoint -> { totalTime, count, maxTime, minTime }

// Error grouping/fingerprinting
function generateErrorFingerprint(payload) {
  const { endpoint, method, statusCode, error } = payload
  // Create a fingerprint based on endpoint, method, status code, and error message
  const errorMsg = (error || '').substring(0, 100) // Truncate for consistency
  return `${method}:${endpoint}:${statusCode}:${errorMsg}`
}

// Track error frequency
function trackErrorFrequency(payload) {
  const fingerprint = generateErrorFingerprint(payload)
  const now = Date.now()
  
  if (!errorCounts.has(fingerprint)) {
    errorCounts.set(fingerprint, {
      count: 1,
      firstSeen: now,
      lastSeen: now,
      occurrences: [{ timestamp: now, requestId: payload.requestId }],
    })
  } else {
    const record = errorCounts.get(fingerprint)
    record.count++
    record.lastSeen = now
    record.occurrences.push({ timestamp: now, requestId: payload.requestId })
    
    // Keep only last 50 occurrences
    if (record.occurrences.length > 50) {
      record.occurrences = record.occurrences.slice(-50)
    }
  }
  
  // Clean up old entries (older than 1 hour)
  const oneHourAgo = now - 60 * 60 * 1000
  for (const [key, value] of errorCounts.entries()) {
    if (value.lastSeen < oneHourAgo) {
      errorCounts.delete(key)
    }
  }
  
  return errorCounts.get(fingerprint)
}

// Check for error spikes
function detectErrorSpike(payload) {
  const fingerprint = generateErrorFingerprint(payload)
  const record = errorCounts.get(fingerprint)
  
  if (!record) return null
  
  const now = Date.now()
  const windowStart = now - ERROR_SPIKE_WINDOW_MS
  const recentErrors = record.occurrences.filter(occ => occ.timestamp >= windowStart)
  
  if (recentErrors.length >= ERROR_SPIKE_THRESHOLD) {
    return {
      fingerprint,
      count: recentErrors.length,
      windowMs: ERROR_SPIKE_WINDOW_MS,
      threshold: ERROR_SPIKE_THRESHOLD,
      firstOccurrence: recentErrors[0].timestamp,
      lastOccurrence: recentErrors[recentErrors.length - 1].timestamp,
    }
  }
  
  return null
}

// Track performance metrics
function trackPerformance(endpoint, duration) {
  if (!performanceMetrics.has(endpoint)) {
    performanceMetrics.set(endpoint, {
      totalTime: duration,
      count: 1,
      maxTime: duration,
      minTime: duration,
      lastUpdated: Date.now(),
    })
  } else {
    const metrics = performanceMetrics.get(endpoint)
    metrics.totalTime += duration
    metrics.count++
    metrics.maxTime = Math.max(metrics.maxTime, duration)
    metrics.minTime = Math.min(metrics.minTime, duration)
    metrics.lastUpdated = Date.now()
  }
  
  // Clean up old entries (older than 1 hour)
  const oneHourAgo = Date.now() - 60 * 60 * 1000
  for (const [key, value] of performanceMetrics.entries()) {
    if (value.lastUpdated < oneHourAgo) {
      performanceMetrics.delete(key)
    }
  }
}

function shouldSend(dedupeKey, ttlMs = DEFAULT_DEDUPE_TTL_MS) {
  if (!dedupeKey) return true
  const now = Date.now()
  const last = dedupeMap.get(dedupeKey)
  if (last && now - last < ttlMs) return false
  dedupeMap.set(dedupeKey, now)
  return true
}

function getSeverity(statusCode, context = {}) {
  // Check for performance issues
  if (context.responseTime && context.responseTime > SLOW_API_THRESHOLD_MS) {
    return 'warning' // Slow responses are warnings
  }
  if (context.queryDuration && context.queryDuration > SLOW_QUERY_THRESHOLD_MS) {
    return 'warning' // Slow queries are warnings
  }
  
  // Check for error spikes
  if (context.errorSpike) {
    return 'critical' // Error spikes are critical
  }
  
  // Standard severity based on status code
  if (statusCode >= 500) return 'critical'
  if (statusCode === 404) return 'warning'
  if (statusCode === 405) return 'info'
  if (statusCode >= 400) return 'warning'
  return 'info'
}

function getEmoji(severity) {
  switch (severity) {
    case 'critical': return '🚨'
    case 'warning': return '⚠️'
    case 'info': return 'ℹ️'
    default: return '📢'
  }
}

function getColor(severity) {
  switch (severity) {
    case 'critical': return '#FF0000' // Red
    case 'warning': return '#FFA500' // Orange
    case 'info': return '#36A2EB' // Blue
    default: return '#808080' // Gray
  }
}

// Generate error recovery suggestions
function generateRecoverySuggestions(payload) {
  const { statusCode, error, endpoint, context = {} } = payload
  const suggestions = []
  
  if (statusCode === 500) {
    if (error?.includes('connection') || error?.includes('database')) {
      suggestions.push('Check database connection string and credentials')
      suggestions.push('Verify database server is running and accessible')
      suggestions.push('Check for connection pool exhaustion')
    }
    if (error?.includes('table') && error?.includes('not exist')) {
      suggestions.push('Run database migrations: npm run sync:square')
      suggestions.push('Verify table schema matches expected structure')
    }
  }
  
  if (statusCode === 400) {
    if (error?.includes('required fields')) {
      suggestions.push('Add client-side validation before form submission')
      suggestions.push('Check that all required fields are being sent')
    }
    if (error?.includes('phone')) {
      suggestions.push('Validate phone number format on client side')
      suggestions.push('Use a phone number validation library')
    }
  }
  
  if (statusCode === 502) {
    suggestions.push('Check external webhook/service is running')
    suggestions.push('Verify webhook URL is correct and accessible')
    suggestions.push('Check network connectivity to external service')
  }
  
  if (context.responseTime && context.responseTime > SLOW_API_THRESHOLD_MS) {
    suggestions.push('Optimize database queries (add indexes, reduce joins)')
    suggestions.push('Consider caching frequently accessed data')
    suggestions.push('Check for N+1 query problems')
  }
  
  if (context.queryDuration && context.queryDuration > SLOW_QUERY_THRESHOLD_MS) {
    suggestions.push('Add database indexes on frequently queried columns')
    suggestions.push('Optimize SQL query (use EXPLAIN ANALYZE)')
    suggestions.push('Consider query result caching')
  }
  
  if (context.errorSpike) {
    suggestions.push('Investigate root cause - this error is occurring frequently')
    suggestions.push('Check for recent deployments or configuration changes')
    suggestions.push('Review error patterns to identify common trigger')
  }
  
  if (context.rateLimit) {
    suggestions.push('Check if this is legitimate traffic or abuse')
    suggestions.push('Consider increasing rate limit for this endpoint')
    suggestions.push('Implement CAPTCHA or additional verification')
  }
  
  return suggestions.length > 0 ? suggestions : ['Review error logs and stack trace for details']
}

function generateGeminiPrompt(payload) {
  const {
    statusCode,
    error,
    endpoint,
    method = 'GET',
    stack,
    context = {},
    requestId,
    ip,
    userAgent,
    screenshot,
    responseTime,
    queryDuration,
    errorSpike,
    requestBody,
    requestHeaders,
    queryParams,
  } = payload

  const severity = getSeverity(statusCode, { responseTime, queryDuration, errorSpike })
  const env = process.env.NODE_ENV || 'development'
  const hasStack = stack && stack.trim().length > 0
  const hasScreenshot = screenshot && screenshot.startsWith('data:image')
  const recoverySuggestions = generateRecoverySuggestions(payload)
  
  let prompt = `I'm experiencing an API error in my Node.js/Express application. Please help me diagnose and fix it.

**Error Details:**
- Status Code: ${statusCode}
- Severity: ${severity}
- HTTP Method: ${method}
- Endpoint: ${endpoint}
- Error Message: ${error}
- Environment: ${env}
${requestId ? `- Request ID: ${requestId}` : ''}
${ip ? `- Client IP: ${ip}` : ''}
${responseTime ? `- Response Time: ${responseTime}ms ${responseTime > SLOW_API_THRESHOLD_MS ? '⚠️ SLOW' : ''}` : ''}
${queryDuration ? `- Query Duration: ${queryDuration}ms ${queryDuration > SLOW_QUERY_THRESHOLD_MS ? '⚠️ SLOW' : ''}` : ''}

${errorSpike ? `**⚠️ ERROR SPIKE DETECTED:**
- This error has occurred ${errorSpike.count} times in the last ${Math.round(errorSpike.windowMs / 1000 / 60)} minutes
- This indicates a systemic issue requiring immediate attention
- First occurrence: ${new Date(errorSpike.firstOccurrence).toISOString()}
- Last occurrence: ${new Date(errorSpike.lastOccurrence).toISOString()}` : ''}

${hasStack ? `**Stack Trace:**
\`\`\`
${stack}
\`\`\`` : `**Note:** This is a validation/request error, not an exception. No stack trace available.`}

${hasScreenshot ? `**Screenshot Available:** A screenshot of the user's viewport is included in the error data. This shows what the user saw when the error occurred.` : ''}

**Request Context:**
${Object.keys(context).length > 0 
  ? JSON.stringify(context, null, 2)
  : 'No additional context provided'}
${userAgent ? `- User Agent: ${userAgent.substring(0, 100)}` : ''}

${requestBody ? `**Request Body:**
\`\`\`json
${typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody, null, 2).substring(0, 1000)}
\`\`\`` : ''}

${requestHeaders ? `**Request Headers:**
\`\`\`json
${JSON.stringify(requestHeaders, null, 2).substring(0, 500)}
\`\`\`` : ''}

${queryParams ? `**Query Parameters:**
\`\`\`json
${JSON.stringify(queryParams, null, 2)}
\`\`\`` : ''}

**Application Context:**
- Framework: Node.js with Vercel serverless functions
- API Route: ${endpoint}
- Timestamp: ${new Date().toISOString()}
${hasScreenshot ? '- Screenshot: Included (base64 data URL in screenshot field)' : ''}

**Recovery Suggestions:**
${recoverySuggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Please provide:
1. **Diagnosis**: What went wrong and why?
2. **Root Cause**: The underlying issue causing this error
3. **Step-by-Step Fix**: Concrete code examples showing how to fix it
4. **Prevention**: How to prevent this error in the future
5. **Best Practices**: Relevant patterns or practices for this scenario
${errorSpike ? '6. **Spike Analysis**: Why is this error occurring repeatedly? What changed?' : ''}

${statusCode >= 500 ? 'This is a server error - focus on backend fixes.' : statusCode >= 400 ? 'This is a client/validation error - focus on input validation and error handling.' : ''}

${hasScreenshot ? '**Note:** A screenshot is available showing the user\'s viewport. Use this to understand the UI state when the error occurred.' : ''}

${responseTime && responseTime > SLOW_API_THRESHOLD_MS ? '**Performance Issue:** This API response is slow. Focus on performance optimization.' : ''}
${queryDuration && queryDuration > SLOW_QUERY_THRESHOLD_MS ? '**Database Performance Issue:** This query is slow. Focus on database optimization.' : ''}

Provide actionable, production-ready solutions with code examples.`

  return prompt
}

function formatMakeWebhookPayload(payload) {
  const {
    statusCode,
    error,
    endpoint,
    method = 'GET',
    requestId,
    userAgent,
    ip,
    timestamp,
    context = {},
    stack,
    screenshot,
    responseTime,
    queryDuration,
    errorSpike,
    errorFrequency,
    requestBody,
    requestHeaders,
    queryParams,
    rateLimit,
    performanceMetrics: perfMetrics,
  } = payload

  const severity = getSeverity(statusCode, { responseTime, queryDuration, errorSpike })
  const emoji = getEmoji(severity)
  const env = process.env.NODE_ENV || 'development'
  
  // Always include full stack trace (not truncated)
  const fullStack = stack || null
  
  // Generate Gemini prompt for AI assistance
  const geminiPrompt = generateGeminiPrompt({
    ...payload,
    responseTime,
    queryDuration,
    errorSpike,
    requestBody,
    requestHeaders,
    queryParams,
  })
  
  // Generate error fingerprint for grouping
  const errorFingerprint = generateErrorFingerprint(payload)
  
  // Build structured payload for Make.com
  return {
    event: 'api.error',
    timestamp: timestamp || new Date().toISOString(),
    env: env,
    severity: severity,
    emoji: emoji,
    statusCode: statusCode,
    error: error || 'Unknown Error',
    endpoint: endpoint || 'unknown',
    method: method,
    requestId: requestId,
    ip: ip,
    userAgent: userAgent ? (userAgent.length > 200 ? userAgent.substring(0, 200) + '...' : userAgent) : undefined,
    context: Object.keys(context).length > 0 ? context : undefined,
    stack: fullStack,
    stackTrace: fullStack,
    
    // Screenshot from frontend (base64 data URL)
    screenshot: screenshot || undefined,
    screenshotDataUrl: screenshot || undefined,
    
    // Performance metrics
    responseTime: responseTime || undefined,
    queryDuration: queryDuration || undefined,
    isSlowResponse: responseTime && responseTime > SLOW_API_THRESHOLD_MS,
    isSlowQuery: queryDuration && queryDuration > SLOW_QUERY_THRESHOLD_MS,
    
    // Error frequency and grouping
    errorFingerprint: errorFingerprint,
    errorFrequency: errorFrequency || undefined,
    errorSpike: errorSpike || undefined,
    
    // Request context
    requestBody: requestBody ? (typeof requestBody === 'string' ? requestBody.substring(0, 2000) : JSON.stringify(requestBody).substring(0, 2000)) : undefined,
    requestHeaders: requestHeaders || undefined,
    queryParams: queryParams || undefined,
    
    // Rate limiting
    rateLimit: rateLimit || undefined,
    
    // Performance metrics
    performanceMetrics: perfMetrics || undefined,
    
    // Recovery suggestions
    recoverySuggestions: generateRecoverySuggestions(payload),
    
    // Gemini AI prompt for fixing the error
    geminiPrompt: geminiPrompt,
    aiFixPrompt: geminiPrompt,
    
    // Formatted fields for easy display in Make.com
    title: `${emoji} API Error: ${statusCode} ${error || 'Unknown Error'}${errorSpike ? ` (${errorSpike.count}x in ${Math.round(errorSpike.windowMs / 1000 / 60)}min)` : ''}`,
    summary: `${method} ${endpoint} - ${error}${responseTime ? ` (${responseTime}ms)` : ''}`,
    details: {
      endpoint: `${method} ${endpoint}`,
      statusCode: statusCode,
      severity: severity,
      ...(requestId && { requestId }),
      ...(ip && { ip }),
      ...(responseTime && { responseTime: `${responseTime}ms` }),
      ...(queryDuration && { queryDuration: `${queryDuration}ms` }),
      ...(errorSpike && { errorSpike: `${errorSpike.count} occurrences` }),
      ...context,
    },
  }
}

/**
 * Send error alert to Make.com webhook
 * 
 * @param {Object} payload
 * @param {number} payload.statusCode - HTTP status code
 * @param {string} payload.error - Error message
 * @param {string} payload.endpoint - API endpoint
 * @param {string} [payload.method] - HTTP method
 * @param {string} [payload.requestId] - Request ID for tracking
 * @param {string} [payload.userAgent] - User agent
 * @param {string} [payload.ip] - Client IP address
 * @param {string} [payload.timestamp] - ISO timestamp
 * @param {Object} [payload.context] - Additional context
 * @param {string} [payload.stack] - Stack trace
 * @param {number} [payload.responseTime] - API response time in ms
 * @param {number} [payload.queryDuration] - Database query duration in ms
 * @param {Object} [payload.requestBody] - Request body (sanitized)
 * @param {Object} [payload.requestHeaders] - Request headers
 * @param {Object} [payload.queryParams] - Query parameters
 * @param {Object} [payload.rateLimit] - Rate limiting details
 * @param {string} [payload.dedupeKey] - Deduplication key
 * @param {number} [payload.dedupeTtlMs] - Deduplication TTL in ms
 */
export async function sendSlackAlert(payload) {
  try {
    // Check if alerts are enabled
    const alertsEnabled = process.env.ALERT_ENABLED === 'true' || 
                         process.env.SLACK_ALERT_ENABLED === 'true' ||
                         (process.env.NODE_ENV === 'production' && (process.env.MAKE_ALERTS_WEBHOOK_URL || process.env.MAKE_WEBHOOK_URL))
    
    if (!alertsEnabled) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Alert] Alerts disabled (set ALERT_ENABLED=true to enable)')
      }
      return { sent: false, reason: 'alerts_disabled' }
    }

    // Use MAKE_ALERTS_WEBHOOK_URL if set, otherwise fall back to MAKE_WEBHOOK_URL
    const webhookUrl = process.env.MAKE_ALERTS_WEBHOOK_URL || process.env.MAKE_WEBHOOK_URL
    if (!webhookUrl) {
      console.warn('[Alert] MAKE_ALERTS_WEBHOOK_URL or MAKE_WEBHOOK_URL not configured')
      return { sent: false, reason: 'missing_webhook_url' }
    }

    // Track error frequency
    const errorFrequency = trackErrorFrequency(payload)
    
    // Detect error spikes
    const errorSpike = detectErrorSpike(payload)
    
    // Track performance if response time provided
    if (payload.responseTime) {
      trackPerformance(payload.endpoint, payload.responseTime)
    }

    // Check for slow responses/queries
    const isSlowResponse = payload.responseTime && payload.responseTime > SLOW_API_THRESHOLD_MS
    const isSlowQuery = payload.queryDuration && payload.queryDuration > SLOW_QUERY_THRESHOLD_MS
    
    // For slow queries, always alert (even if deduplicated)
    const shouldAlertSlowQuery = isSlowQuery && !payload.responseTime // Don't double-alert if already alerting on response time
    
    // Deduplication (unless it's a slow query or error spike)
    const dedupeKey = payload.dedupeKey || `slack:${payload.endpoint}:${payload.statusCode}:${payload.error}`
    const dedupeTtlMs = payload.dedupeTtlMs ?? DEFAULT_DEDUPE_TTL_MS
    
    if (!shouldSend(dedupeKey, dedupeTtlMs) && !shouldAlertSlowQuery && !errorSpike) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Alert] Skipping duplicate alert:', dedupeKey)
      }
      return { sent: false, reason: 'duplicate' }
    }

    // Format payload for Make.com webhook
    const makePayload = formatMakeWebhookPayload({
      ...payload,
      timestamp: payload.timestamp || new Date().toISOString(),
      errorFrequency,
      errorSpike,
      performanceMetrics: payload.endpoint ? performanceMetrics.get(payload.endpoint) : undefined,
    })

    // Send to Make.com webhook
    if (typeof fetch !== 'function') {
      console.warn('[Alert] fetch() not available')
      return { sent: false, reason: 'fetch_unavailable' }
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(makePayload),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      console.error('[Alert] Failed to send:', {
        status: response.status,
        statusText: response.statusText,
        body: text.substring(0, 200),
      })
      return { sent: false, reason: 'webhook_error', status: response.status }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[Alert] Sent to Make.com:', {
        endpoint: payload.endpoint,
        statusCode: payload.statusCode,
        severity: getSeverity(payload.statusCode, { responseTime: payload.responseTime, queryDuration: payload.queryDuration, errorSpike }),
        errorSpike: errorSpike ? `${errorSpike.count} occurrences` : null,
        slowResponse: isSlowResponse,
        slowQuery: isSlowQuery,
      })
    }

    return { sent: true, status: response.status }
  } catch (error) {
    console.error('[Alert] Error sending alert:', error?.message || error)
    return { sent: false, reason: 'exception', error: error?.message }
  }
}

/**
 * Send critical error alert (always sends, no deduplication)
 */
export async function sendCriticalAlert(payload) {
  return sendSlackAlert({
    ...payload,
    dedupeKey: null, // Disable deduplication for critical alerts
  })
}

/**
 * Send batch of errors (for rate limiting scenarios)
 */
export async function sendBatchAlert(errors) {
  if (!errors || errors.length === 0) return { sent: false, reason: 'no_errors' }

  const webhookUrl = process.env.MAKE_ALERTS_WEBHOOK_URL || process.env.MAKE_WEBHOOK_URL
  if (!webhookUrl) return { sent: false, reason: 'missing_webhook_url' }

  const criticalCount = errors.filter(e => getSeverity(e.statusCode) === 'critical').length
  const warningCount = errors.filter(e => getSeverity(e.statusCode) === 'warning').length

  const payload = {
    event: 'api.error.batch',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    severity: criticalCount > 0 ? 'critical' : 'warning',
    emoji: criticalCount > 0 ? '🚨' : '⚠️',
    title: `Batch Error Alert: ${errors.length} errors detected`,
    summary: `${errors.length} errors - ${criticalCount} critical, ${warningCount} warnings`,
    details: {
      totalErrors: errors.length,
      criticalCount: criticalCount,
      warningCount: warningCount,
      errors: errors.slice(0, 10).map((e, i) => ({
        index: i + 1,
        method: e.method || 'GET',
        endpoint: e.endpoint,
        statusCode: e.statusCode,
        error: e.error,
      })),
    },
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    return { sent: response.ok, status: response.status }
  } catch (error) {
    console.error('[Alert] Batch alert failed:', error)
    return { sent: false, reason: 'exception' }
  }
}

/**
 * Get error statistics for an endpoint
 */
export function getErrorStats(endpoint) {
  const stats = {
    totalErrors: 0,
    errorTypes: {},
    performance: performanceMetrics.get(endpoint) || null,
  }
  
  for (const [fingerprint, record] of errorCounts.entries()) {
    if (fingerprint.includes(endpoint)) {
      stats.totalErrors += record.count
      const errorType = fingerprint.split(':').pop()
      stats.errorTypes[errorType] = (stats.errorTypes[errorType] || 0) + record.count
    }
  }
  
  return stats
}
