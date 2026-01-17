/**
 * Development server for API routes
 * Run this alongside Vite for local development: node api-dev-server.js
 * Then update vite.config.ts proxy to point to http://localhost:3001
 */

import { createServer } from 'http'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFile } from 'fs/promises'
import dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local (priority) then .env
const envPath = resolve(process.cwd(), '.env.local')
dotenv.config({ path: envPath })
dotenv.config() // Also load .env if it exists

console.log('[API Dev Server] Loading environment variables...')
console.log('[API Dev Server] SPR_DATABASE_URL:', process.env.SPR_DATABASE_URL ? 'SET (Neon)' : 'NOT SET')
console.log('[API Dev Server] DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET')
console.log('[API Dev Server] Using:', process.env.SPR_DATABASE_URL ? 'SPR_DATABASE_URL' : (process.env.DATABASE_URL ? 'DATABASE_URL' : 'NONE'))

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PORT = 3001

const server = createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-webhook-secret')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  const url = new URL(req.url, `http://${req.headers.host}`)
  
      // Handle API routes
      if (url.pathname.startsWith('/api/')) {
        try {
          const route = url.pathname.replace('/api/', '')
          let handler

          // Handle simple routes
          if (route === 'products') {
            const module = await import('./api/products.js')
            handler = module.webHandler ?? module.default
          } else if (route === 'webhook/test') {
            const module = await import('./api/webhook/test.js')
            handler = module.webHandler ?? module.default
          } else if (route === 'pay') {
            const module = await import('./api/pay.js')
            handler = module.webHandler ?? module.default
          } else if (route === 'orders') {
            const module = await import('./api/orders.js')
            handler = module.webHandler ?? module.default
          } else if (route === 'orders/update') {
            const module = await import('./api/orders/update.js')
            handler = module.webHandler ?? module.default
          } else if (route === 'inventory/log') {
            const module = await import('./api/inventory/log.js')
            handler = module.webHandler ?? module.default
          } else {
            res.writeHead(404, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Not found', route }))
            return
          }

      // Create a Request-like object
      const request = {
        method: req.method,
        url: url.toString(),
        headers: new Headers(Object.entries(req.headers).flatMap(([k, v]) => {
          if (typeof v === 'undefined') return []
          if (Array.isArray(v)) return v.map(val => [k, String(val)])
          return [[k, String(v)]]
        })),
        json: async () => {
          return new Promise((resolve, reject) => {
            let body = ''
            req.on('data', chunk => { body += chunk.toString() })
            req.on('end', () => {
              try {
                resolve(JSON.parse(body))
              } catch (e) {
                reject(e)
              }
            })
          })
        },
      }

      // Execute the handler
      let response
      try {
        response = await handler(request)
        
        // Ensure we got a response
        if (!response) {
          throw new Error('Handler returned undefined or null')
        }
      } catch (handlerError) {
        console.error('[API Dev Server] Handler threw error:', handlerError)
        console.error('[API Dev Server] Handler error stack:', handlerError.stack)
        
        // Create an error response instead of re-throwing
        response = new Response(
          JSON.stringify({
            success: false,
            error: handlerError.message || 'Handler error',
            message: 'An error occurred in the API handler',
            details: process.env.NODE_ENV === 'development' ? {
              message: handlerError.message,
              stack: handlerError.stack,
              name: handlerError.name,
            } : undefined
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
      
      // Handle Response object (from Vercel serverless functions)
      if (response instanceof Response) {
        // Copy status and headers
        const status = response.status || 500
        const headers = Object.fromEntries(response.headers.entries())
        
        // Get body
        let body
        try {
          body = await response.text()
        } catch (e) {
          console.error('[API Dev Server] Failed to read response body:', e)
          body = JSON.stringify({ error: 'Failed to read response body' })
        }
        
        // Ensure we have a body
        if (!body || !body.trim()) {
          console.warn('[API Dev Server] Empty response body, using default error')
          body = JSON.stringify({ 
            success: false, 
            error: 'Empty response from handler',
            status 
          })
          headers['Content-Type'] = 'application/json'
        }
        
        res.writeHead(status, headers)
        res.end(body)
      } else {
        // Fallback for other response types
        res.writeHead(response.status || 200, response.headers || { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(response.body || response))
      }
    } catch (error) {
      console.error('[API Dev Server] Error:', error)
      console.error('[API Dev Server] Error stack:', error.stack)
      console.error('[API Dev Server] Error name:', error.name)
      console.error('[API Dev Server] Error message:', error.message)
      
      // Always return valid JSON, even on errors
      const errorResponse = {
        success: false,
        error: error.message || 'Internal server error',
        message: error.message || 'An error occurred processing the request',
        details: process.env.NODE_ENV === 'development' ? {
          name: error.name,
          stack: error.stack,
        } : undefined
      }
      
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(errorResponse))
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Not found' }))
  }
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 API Dev Server running on http://127.0.0.1:${PORT}`)
  console.log(`   Proxy Vite requests from /api to http://127.0.0.1:${PORT}/api`)
})
