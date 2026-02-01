type MetricPayload = {
  name: string
  value: number
  tags?: Record<string, string>
  timestamp: number
}

type ErrorPayload = {
  context: string
  message: string
  stack?: string
  timestamp: number
  screenshot?: string // Base64 encoded screenshot
  pageUrl?: string
  viewport?: {
    width: number
    height: number
  }
}

const errorEndpoint =
  import.meta.env.VITE_ERROR_WEBHOOK_URL ?? import.meta.env.ERROR_WEBHOOK_URL
const metricEndpoint =
  import.meta.env.VITE_METRICS_WEBHOOK_URL ?? import.meta.env.METRICS_WEBHOOK_URL

/**
 * Registers global listeners for runtime errors and unhandled rejections.
 * Returns a cleanup function to remove the listeners.
 */
export function initClientMonitors(): () => void {
  if (typeof window === 'undefined') {
    return () => undefined
  }

  const handleError = (event: ErrorEvent) => {
    void reportClientError(event.error ?? event.message ?? 'Unknown error', 'window.error')
  }

  const handleRejection = (event: PromiseRejectionEvent) => {
    void reportClientError(event.reason ?? 'Unhandled rejection', 'unhandledrejection')
  }

  window.addEventListener('error', handleError)
  window.addEventListener('unhandledrejection', handleRejection)

  // Capture a basic TTI-style metric once the monitors are initialized.
  trackMetric('time_to_interactive_ms', Math.round(performance.now()))
  
  // Initialize Core Web Vitals tracking
  trackWebVitals()

  return () => {
    window.removeEventListener('error', handleError)
    window.removeEventListener('unhandledrejection', handleRejection)
  }
}

export async function reportClientError(error: unknown, context = 'client'): Promise<void> {
  if (!errorEndpoint || typeof navigator === 'undefined') {
    return
  }

  // Capture screenshot asynchronously (non-blocking)
  let screenshot: string | null = null
  try {
    const { captureScreenshotSafe } = await import('./utils/captureScreenshot')
    screenshot = await captureScreenshotSafe()
  } catch (err) {
    // Screenshot capture is optional, don't block error reporting
    console.warn('[Monitoring] Screenshot capture failed:', err)
  }

  const payload: ErrorPayload = {
    context,
    message:
      typeof error === 'string'
        ? error
        : error instanceof Error
          ? error.message
          : JSON.stringify(error),
    stack: error instanceof Error ? error.stack ?? undefined : undefined,
    timestamp: Date.now(),
    ...(screenshot && { screenshot }),
    ...(typeof window !== 'undefined' && { 
      pageUrl: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      }
    }),
  }

  postJson(errorEndpoint, payload)
}

export function trackMetric(
  name: string,
  value: number,
  tags?: Record<string, string>,
): void {
  if (!metricEndpoint || typeof navigator === 'undefined') {
    return
  }

  const payload: MetricPayload = {
    name,
    value,
    tags,
    timestamp: Date.now(),
  }

  postJson(metricEndpoint, payload)
  
  // Alert on slow performance metrics
  const SLOW_PAGE_LOAD_THRESHOLD_MS = 3000 // 3 seconds
  const SLOW_API_CALL_THRESHOLD_MS = 2000 // 2 seconds
  
  if (name.includes('page_load') && value > SLOW_PAGE_LOAD_THRESHOLD_MS) {
    // Track slow page loads
    console.warn(`[Monitoring] Slow page load detected: ${value}ms`)
  }
  
  if (name.includes('api_call') && value > SLOW_API_CALL_THRESHOLD_MS) {
    // Track slow API calls
    console.warn(`[Monitoring] Slow API call detected: ${value}ms`)
  }
}

/**
 * Track Core Web Vitals and performance metrics
 */
export function trackWebVitals() {
  if (typeof window === 'undefined' || !window.performance) return
  
  // Track Largest Contentful Paint (LCP)
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          const lcp = entry as PerformanceEntry & { renderTime?: number; loadTime?: number }
          const value = lcp.renderTime || lcp.loadTime || 0
          trackMetric('web_vital_lcp', Math.round(value), {
            url: window.location.pathname,
          })
          
          // Alert on slow LCP (>2.5s is considered poor)
          if (value > 2500) {
            console.warn(`[Monitoring] Poor LCP: ${Math.round(value)}ms`)
          }
        }
      }
    })
    observer.observe({ entryTypes: ['largest-contentful-paint'] })
  } catch (e) {
    // Performance Observer not supported
  }
  
  // Track First Input Delay (FID)
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'first-input') {
          const fid = entry as any // PerformanceEventTiming
          const delay = fid.processingStart - fid.startTime
          trackMetric('web_vital_fid', Math.round(delay), {
            url: window.location.pathname,
          })
          
          // Alert on slow FID (>100ms is considered poor)
          if (delay > 100) {
            console.warn(`[Monitoring] Poor FID: ${Math.round(delay)}ms`)
          }
        }
      }
    })
    observer.observe({ entryTypes: ['first-input'] })
  } catch (e) {
    // Performance Observer not supported
  }
  
  // Track Cumulative Layout Shift (CLS)
  let clsValue = 0
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
        }
      }
      trackMetric('web_vital_cls', Math.round(clsValue * 1000) / 1000, {
        url: window.location.pathname,
      })
      
      // Alert on poor CLS (>0.25 is considered poor)
      if (clsValue > 0.25) {
        console.warn(`[Monitoring] Poor CLS: ${clsValue.toFixed(3)}`)
      }
    })
    observer.observe({ entryTypes: ['layout-shift'] })
  } catch (e) {
    // Performance Observer not supported
  }
}

function postJson(url: string, payload: unknown) {
  const body = JSON.stringify(payload)
  const blob = new Blob([body], { type: 'application/json' })

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, blob)
    return
  }

  fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
    keepalive: true,
  }).catch((error) => {
    console.error('[monitoring] Failed to send payload', error)
  })
}

