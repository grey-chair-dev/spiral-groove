/**
 * Dynamically loads Square Web Payments SDK based on environment
 * This is called from the React app to ensure proper loading order
 */

export function loadSquareSdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if Square SDK is already loaded
    if (window.Square) {
      resolve()
      return
    }

    // Determine which SDK to load based on environment
    // Vite only exposes variables with VITE_ prefix to frontend
    const squareEnv =
      import.meta.env.VITE_SQUARE_ENVIRONMENT ||
      (import.meta.env.PROD ? 'production' : 'sandbox')
    const sdkUrl =
      squareEnv === 'production'
        ? 'https://web.squarecdn.com/v1/square.js'
        : 'https://sandbox.web.squarecdn.com/v1/square.js'

    // Check if script is already being loaded
    const existingScript = document.querySelector(`script[src="${sdkUrl}"]`)
    if (existingScript) {
      // Wait for it to load
      existingScript.addEventListener('load', () => resolve())
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Square SDK')))
      return
    }

    // Create and load script
    const script = document.createElement('script')
    script.src = sdkUrl
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Square SDK'))
    document.head.appendChild(script)
  })
}
