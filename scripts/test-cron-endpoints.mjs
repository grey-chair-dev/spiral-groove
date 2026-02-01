#!/usr/bin/env node

/**
 * Test Cron Job Endpoints
 * Verifies that the cron job endpoints are accessible and working
 */

const BASE_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : process.env.PRODUCTION_URL || 'https://spiralgrooverecords.com'

async function testCronEndpoint(path, name) {
  console.log(`\n🧪 Testing ${name}...`)
  console.log(`   URL: ${BASE_URL}${path}`)
  
  try {
    // Simulate Vercel cron request with proper headers
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'vercel-cron/1.0',
        'x-vercel-cron': '1',
      },
    })
    
    const status = response.status
    const statusText = response.statusText
    const contentType = response.headers.get('content-type') || ''
    
    let body = null
    try {
      if (contentType.includes('application/json')) {
        body = await response.json()
      } else {
        body = await response.text()
      }
    } catch (e) {
      body = 'Could not parse response'
    }
    
    if (status === 200 || status === 201) {
      console.log(`   ✅ Status: ${status} ${statusText}`)
      if (body && typeof body === 'object') {
        console.log(`   📦 Response:`, JSON.stringify(body, null, 2).substring(0, 200))
      }
      return { success: true, status, body }
    } else {
      console.log(`   ⚠️  Status: ${status} ${statusText}`)
      if (body) {
        console.log(`   📦 Response:`, typeof body === 'string' ? body.substring(0, 200) : JSON.stringify(body, null, 2).substring(0, 200))
      }
      return { success: false, status, body }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function checkVercelCronStatus() {
  console.log('\n📊 Cron Job Status Check')
  console.log('='.repeat(60))
  console.log(`\n📍 Testing endpoints on: ${BASE_URL}`)
  console.log('\n⚠️  Note: These endpoints require Vercel cron headers.')
  console.log('   In production, only Vercel cron can call them with GET.')
  console.log('   This test simulates a Vercel cron request.\n')
  
  const results = {
    sync: await testCronEndpoint('/api/square/sync', 'Square Sync'),
    salesSync: await testCronEndpoint('/api/square/sales-sync', 'Square Sales Sync'),
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('\n📋 Summary:')
  console.log(`   Square Sync: ${results.sync.success ? '✅ Working' : '❌ Failed'}`)
  console.log(`   Sales Sync: ${results.salesSync.success ? '✅ Working' : '❌ Failed'}`)
  
  console.log('\n💡 To verify cron jobs are actually running:')
  console.log('   1. Go to Vercel Dashboard → Your Project')
  console.log('   2. Navigate to "Cron Jobs" tab')
  console.log('   3. Check execution history and logs')
  console.log('   4. Look for successful runs at 6:00 AM and 6:30 AM daily')
  
  console.log('\n📝 Cron Schedule:')
  console.log('   Square Sync: Daily at 6:00 AM UTC (0 6 * * *)')
  console.log('   Sales Sync: Daily at 6:30 AM UTC (30 6 * * *)')
  
  return results
}

// Run tests
checkVercelCronStatus().catch(console.error)
