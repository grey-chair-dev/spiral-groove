#!/usr/bin/env node
/**
 * Test script to send all email types to a specified email address
 * 
 * Usage: node scripts/test-emails.mjs [email]
 * Default email: bcohen0424@gmail.com
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = resolve(__dirname, '..')

// Load environment variables from .env.local
const envPath = resolve(projectRoot, '.env.local')
if (existsSync(envPath)) {
  const envContents = readFileSync(envPath, 'utf-8')
  const lines = envContents.split(/\r?\n/)
  for (const line of lines) {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
        process.env[key.trim()] = value
      }
    }
  }
}

// Get email from command line or use default
const testEmail = process.argv[2] || 'tools@greychair.io'

// Check if webhook URL is configured
if (!process.env.MAKE_EMAIL_WEBHOOK_URL) {
  console.error('❌ Error: MAKE_EMAIL_WEBHOOK_URL is not configured in .env.local')
  process.exit(1)
}

console.log(`📧 Testing email webhook: ${process.env.MAKE_EMAIL_WEBHOOK_URL}`)
console.log(`📬 Sending test emails to: ${testEmail}\n`)

// Import database functions and sendEmail
const { query } = await import('../api/db.js')
const { sendEmail } = await import('../api/sendEmail.js')
import crypto from 'crypto'

// Test data for each email type
const emailTests = [
  {
    type: 'newsletter',
    to: testEmail,
    subject: 'Test: Welcome to Spiral Groove Records Newsletter',
    data: {
      firstName: 'Brendan',
      lastName: 'Cohen',
      source: 'test-script',
    },
    // Database storage function
    storeInDb: async (data) => {
      try {
        await query(
          `INSERT INTO email_list (email, first_name, last_name, source, subscribed, created_at, updated_at)
           VALUES ($1, $2, $3, $4, TRUE, NOW(), NOW())
           ON CONFLICT (email) 
           DO UPDATE SET 
             first_name = COALESCE(EXCLUDED.first_name, email_list.first_name),
             last_name = COALESCE(EXCLUDED.last_name, email_list.last_name),
             subscribed = TRUE,
             updated_at = NOW()`,
          [data.to, data.data.firstName || null, data.data.lastName || null, 'test-script']
        )
        return true
      } catch (error) {
        console.error(`  ⚠️  Failed to store ${data.type} in database:`, error.message)
        return false
      }
    },
  },
  {
    type: 'signup',
    to: testEmail,
    subject: 'Test: Welcome to Spiral Groove Records',
    data: {
      name: 'Brendan Cohen',
      email: testEmail,
      source: 'test-script',
    },
    // Database storage function
    storeInDb: async (data) => {
      try {
        // Check if user already exists
        const existing = await query('SELECT id FROM users WHERE email = $1', [data.to])
        if (existing.rows.length > 0) {
          console.log(`  ℹ️  User already exists in database: ${data.to}`)
          return true
        }
        
        // Create user
        await query(
          `INSERT INTO users (email, name, email_verified, created_at, updated_at)
           VALUES ($1, $2, FALSE, NOW(), NOW())`,
          [data.to, data.data.name || null]
        )
        return true
      } catch (error) {
        console.error(`  ⚠️  Failed to store ${data.type} in database:`, error.message)
        return false
      }
    },
  },
  {
    type: 'order_confirmation',
    to: testEmail,
    subject: 'Test: Order Confirmation ORD-TEST123 - Spiral Groove Records',
    data: {
      orderNumber: 'ORD-TEST123',
      orderId: 'test-order-uuid-12345',
      squareOrderId: 'test-square-order-id',
      squarePaymentId: 'test-square-payment-id',
      total: '45.99',
      currency: 'USD',
      customerName: 'Brendan Cohen',
      customerEmail: testEmail,
      customerPhone: '513-555-1234',
      items: [
        {
          name: 'Test Album - Vinyl',
          quantity: 1,
          price: 29.99,
        },
        {
          name: 'Test Single - CD',
          quantity: 2,
          price: 15.00,
        },
      ],
      deliveryMethod: 'pickup',
      pickupLocation: '215B Main Street, Milford, OH 45150',
    },
    // Order confirmations are already stored via the orders table, skip DB storage
    storeInDb: async () => true,
  },
  {
    type: 'forgot_password',
    to: testEmail,
    subject: 'Test: Reset Your Password - Spiral Groove Records',
    data: {
      email: testEmail,
      // Token will be generated in storeInDb
      resetToken: null, // Will be set after DB storage
      resetUrl: null, // Will be set after DB storage
      expiresIn: '1 hour',
      source: 'test-script',
    },
    dedupeTtlMs: 0, // Disable deduplication for testing
    // Database storage function
    storeInDb: async (data) => {
      try {
        // Check if user exists
        const userResult = await query('SELECT id FROM users WHERE email = $1', [data.to])
        const userId = userResult.rows.length > 0 ? userResult.rows[0].id : null
        
        // Generate unique token
        const resetToken = crypto.randomUUID()
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        
        // Store reset token
        await query(
          `INSERT INTO password_reset_tokens (user_id, email, token, expires_at, used, created_at)
           VALUES ($1, $2, $3, $4, FALSE, NOW())`,
          [userId, data.to, resetToken, expiresAt]
        )
        
        // Update the data object with the generated token and URL
        data.data.resetToken = resetToken
        data.data.resetUrl = `${process.env.SITE_URL || 'https://spiralgrooverecords.com'}/reset-password?token=${resetToken}&email=${encodeURIComponent(data.to)}`
        
        return true
      } catch (error) {
        console.error(`  ⚠️  Failed to store ${data.type} in database:`, error.message)
        return false
      }
    },
  },
  {
    type: 'order_status_update',
    to: testEmail,
    subject: 'Test: Order Status Update ORD-TEST456 - Spiral Groove Records',
    data: {
      orderNumber: 'ORD-TEST456',
      customerName: 'Brendan Cohen',
      customerEmail: testEmail,
      status: 'PREPARED',
      previousStatus: 'OPEN',
      items: [
        {
          name: 'Test Album - Vinyl',
          quantity: 1,
          price: 29.99,
        },
        {
          name: 'Test Single - CD',
          quantity: 2,
          price: 15.00,
        },
      ],
      total: '59.99',
      currency: 'USD',
      deliveryMethod: 'pickup',
      pickupLocation: '215B Main Street, Milford, OH 45150',
    },
    dedupeTtlMs: 0, // Disable deduplication for testing
    // Order status updates don't need separate DB storage (order already exists)
    storeInDb: async () => true,
  },
]

// Send each email type
let successCount = 0
let failCount = 0
const results = []

for (let i = 0; i < emailTests.length; i++) {
  const test = emailTests[i]
  console.log(`[${i + 1}/${emailTests.length}] Testing ${test.type} email...`)
  
  try {
    // Store in database first
    let dbStored = false
    if (test.storeInDb) {
      try {
        dbStored = await test.storeInDb(test)
        if (dbStored) {
          console.log(`  💾 ${test.type} data stored in database`)
        }
      } catch (dbError) {
        console.error(`  ⚠️  Database storage failed:`, dbError.message)
      }
    }
    
    // Capture console output to check for errors
    const originalError = console.error
    let hasError = false
    let errorDetails = null
    
    console.error = (...args) => {
      if (args[0]?.includes('[Email Webhook] Failed')) {
        hasError = true
        errorDetails = args[0]
      }
      originalError(...args)
    }
    
    // Send email via webhook
    await sendEmail(test)
    
    // Restore console.error
    console.error = originalError
    
    if (hasError) {
      console.log(`  ⚠️  ${test.type} email sent but webhook returned an error`)
      console.log(`     ${errorDetails || 'Check webhook logs'}\n`)
      failCount++
      results.push({ type: test.type, status: 'error', details: errorDetails, dbStored })
    } else {
      console.log(`  ✅ ${test.type} email sent successfully`)
      if (dbStored) {
        console.log(`     Database: ✅ | Webhook: ✅\n`)
      } else {
        console.log(`     Database: ⚠️  | Webhook: ✅\n`)
      }
      successCount++
      results.push({ type: test.type, status: 'success', dbStored })
    }
    
    // Small delay between emails to avoid rate limiting
    if (i < emailTests.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  } catch (error) {
    console.error(`  ❌ ${test.type} email failed:`, error.message)
    failCount++
    results.push({ type: test.type, status: 'exception', error: error.message })
  }
}

// Summary
console.log('\n' + '='.repeat(50))
console.log('📊 Test Summary:')
console.log(`  ✅ Successful: ${successCount}`)
console.log(`  ⚠️  Errors/Warnings: ${failCount}`)
console.log(`  📧 Total: ${emailTests.length}`)
console.log('='.repeat(50))

if (failCount > 0) {
  console.log('\n⚠️  Some emails had issues:')
  results.forEach(r => {
    if (r.status !== 'success') {
      console.log(`   - ${r.type}: ${r.status}${r.details ? ` (${r.details})` : ''}${r.error ? ` - ${r.error}` : ''}`)
    }
  })
  console.log('\n💡 Note: HTTP errors (like 410) may indicate the webhook needs configuration.')
  console.log('   Check your Make.com scenario to ensure all email types are handled.')
} else {
  console.log('\n✨ All test emails sent successfully!')
}

// Database summary
const dbStoredCount = results.filter(r => r.dbStored).length
console.log(`\n💾 Database Storage:`)
console.log(`   ✅ Stored in database: ${dbStoredCount}/${emailTests.length}`)
if (dbStoredCount < emailTests.length) {
  console.log(`   ⚠️  Some records may not have been stored (check logs above)`)
}

console.log(`\n📬 Check ${testEmail} for the test emails.`)
console.log(`   Webhook URL: ${process.env.MAKE_EMAIL_WEBHOOK_URL}`)

