#!/usr/bin/env node
/**
 * Weekly Newsletter Sender Script
 * 
 * Sends weekly newsletter emails to all newsletter subscribers.
 * Includes upcoming events, new records, and personalized recommendations.
 * 
 * Usage:
 *   node scripts/send-weekly-newsletter.mjs
 * 
 * Environment Variables:
 *   SGR_DATABASE_URL - Database connection string
 *   MAKE_EMAIL_WEBHOOK_URL - Email webhook URL
 */

import pg from 'pg'
const { Pool } = pg
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'
import dotenv from 'dotenv'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const envPath = join(__dirname, '..', '.env.local')
try {
  const envFile = readFileSync(envPath, 'utf8')
  const envConfig = dotenv.parse(envFile)
  Object.assign(process.env, envConfig)
} catch (e) {
  // .env.local might not exist, that's okay
}

// Database connection
let pool = null
function getPool() {
  if (pool) return pool
  const connectionString = process.env.SGR_DATABASE_URL || process.env.SPR_DATABASE_URL || process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('SGR_DATABASE_URL, SPR_DATABASE_URL, or DATABASE_URL environment variable is not set')
  }
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  })
  return pool
}

async function query(text, params) {
  const p = getPool()
  return await p.query(text, params)
}

// Import email functions (need to use dynamic imports for ES modules)
async function generateWeeklyNewsletterData(customerEmail, firstName, lastName) {
  const { generateWeeklyNewsletterData: gen } = await import('../api/weekly-newsletter.js')
  return gen(customerEmail, firstName, lastName)
}

async function sendEmail(params) {
  const { sendEmail: send } = await import('../api/sendEmail.js')
  return send(params)
}

async function getNewsletterSubscribers() {
  try {
    // Get subscribers from email_list table (where subscribed = TRUE)
    // Handle both snake_case and camelCase column names for compatibility
    let result
    try {
      // Try snake_case first (most common)
      result = await query(`
        SELECT 
          email, 
          first_name, 
          last_name,
          subscribed
        FROM email_list
        WHERE subscribed = TRUE
          AND email IS NOT NULL
          AND email != ''
          AND (unsubscribed_at IS NULL OR unsubscribed_at IS NULL)
        ORDER BY created_at DESC
      `)
    } catch (e) {
      // Fallback: try camelCase column names
      try {
        result = await query(`
          SELECT 
            email, 
            "firstName" as first_name, 
            "lastName" as last_name,
            subscribed
          FROM email_list
          WHERE subscribed = TRUE
            AND email IS NOT NULL
            AND email != ''
          ORDER BY "createdAt" DESC
        `)
      } catch (e2) {
        console.error('[Weekly Newsletter] Error querying email_list:', e2.message)
        throw e2
      }
    }
    
    return result.rows
      .filter(row => row.email && row.subscribed !== false)
      .map(row => ({
        email: row.email.toLowerCase().trim(),
        firstName: row.first_name || null,
        lastName: row.last_name || null,
      }))
  } catch (error) {
    console.error('[Weekly Newsletter] Error fetching subscribers:', error)
    return []
  }
}

async function sendWeeklyNewsletter() {
  console.log('[Weekly Newsletter] Starting weekly newsletter send...')
  
  const subscribers = await getNewsletterSubscribers()
  console.log(`[Weekly Newsletter] Found ${subscribers.length} subscribers`)
  
  if (subscribers.length === 0) {
    console.log('[Weekly Newsletter] No subscribers found. Exiting.')
    return
  }
  
  let successCount = 0
  let errorCount = 0
  const errors = []
  
  for (const subscriber of subscribers) {
    try {
      console.log(`[Weekly Newsletter] Sending to ${subscriber.email}...`)
      
      // Generate newsletter data
      const newsletterData = await generateWeeklyNewsletterData(
        subscriber.email,
        subscriber.firstName,
        subscriber.lastName
      )
      
      // Send email
      const result = await sendEmail({
        type: 'weekly_newsletter',
        to: subscriber.email,
        data: newsletterData,
        dedupeKey: `weekly_newsletter:${subscriber.email}:${new Date().toISOString().split('T')[0]}`,
        dedupeTtlMs: 24 * 60 * 60 * 1000, // 24 hours
      })
      
      if (result.ok) {
        successCount++
        console.log(`[Weekly Newsletter] ✓ Sent to ${subscriber.email} (${newsletterData.upcomingEvents.length} events, ${newsletterData.newRecords.length} new records, ${newsletterData.recommendations.length} recommendations)`)
      } else {
        errorCount++
        const errorMsg = `Failed to send to ${subscriber.email}: ${result.reason}`
        errors.push(errorMsg)
        console.error(`[Weekly Newsletter] ✗ ${errorMsg}`)
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      errorCount++
      const errorMsg = `Error sending to ${subscriber.email}: ${error.message}`
      errors.push(errorMsg)
      console.error(`[Weekly Newsletter] ✗ ${errorMsg}`)
    }
  }
  
  console.log('\n[Weekly Newsletter] Summary:')
  console.log(`  ✓ Success: ${successCount}`)
  console.log(`  ✗ Errors: ${errorCount}`)
  
  if (errors.length > 0) {
    console.log('\n[Weekly Newsletter] Errors:')
    errors.forEach(err => console.log(`  - ${err}`))
  }
  
  console.log('[Weekly Newsletter] Done!')
}

// Run the script
sendWeeklyNewsletter()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Weekly Newsletter] Fatal error:', error)
    process.exit(1)
  })
