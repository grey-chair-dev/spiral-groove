/**
 * Screenshot capture utility for error reporting
 * Uses html2canvas to capture the current viewport
 */

/**
 * Capture a screenshot of the current viewport
 * @returns Promise<string> Base64 encoded image data URL
 */
export async function captureScreenshot(): Promise<string | null> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null
  }

  try {
    // Dynamically import html2canvas to avoid bundling it if not needed
    const html2canvas = (await import('html2canvas')).default
    
    const canvas = await html2canvas(document.body, {
      useCORS: true,
      logging: false,
      scale: 0.5, // Reduce size for faster capture
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    })
    
    return canvas.toDataURL('image/png', 0.8) // 80% quality
  } catch (error) {
    console.error('[Screenshot] Failed to capture:', error)
    return null
  }
}

/**
 * Capture screenshot with error handling
 * Returns null if capture fails (non-blocking)
 */
export async function captureScreenshotSafe(): Promise<string | null> {
  try {
    return await captureScreenshot()
  } catch (error) {
    console.warn('[Screenshot] Capture failed:', error)
    return null
  }
}
