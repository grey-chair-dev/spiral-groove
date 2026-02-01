#!/usr/bin/env node

/**
 * SEO & PageSpeed Test Script
 * Tests SEO elements and performance metrics
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3001'

async function testSEO() {
  console.log('\n🔍 SEO TEST RESULTS\n')
  console.log('='.repeat(60))
  
  try {
    const response = await fetch(BASE_URL)
    const html = await response.text()
    
    // Test 1: Title Tag
    const titleMatch = html.match(/<title>(.*?)<\/title>/i)
    const title = titleMatch ? titleMatch[1] : null
    console.log(`✅ Title Tag: ${title || '❌ MISSING'}`)
    
    // Test 2: Meta Description
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i)
    const description = descMatch ? descMatch[1] : null
    console.log(`✅ Meta Description: ${description ? (description.length > 0 ? 'Present' : 'Empty') : '❌ MISSING'}`)
    if (description) {
      console.log(`   Length: ${description.length} chars (optimal: 150-160)`)
    }
    
    // Test 3: Open Graph Tags
    const ogTags = {
      type: html.match(/<meta\s+property=["']og:type["']\s+content=["'](.*?)["']/i)?.[1],
      title: html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i)?.[1],
      description: html.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i)?.[1],
      image: html.match(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i)?.[1],
      url: html.match(/<meta\s+property=["']og:url["']\s+content=["'](.*?)["']/i)?.[1],
    }
    console.log('\n📱 Open Graph Tags:')
    Object.entries(ogTags).forEach(([key, value]) => {
      console.log(`   ${value ? '✅' : '❌'} og:${key}: ${value || 'MISSING'}`)
    })
    
    // Test 4: Twitter Card Tags
    const twitterTags = {
      card: html.match(/<meta\s+name=["']twitter:card["']\s+content=["'](.*?)["']/i)?.[1],
      title: html.match(/<meta\s+name=["']twitter:title["']\s+content=["'](.*?)["']/i)?.[1],
      description: html.match(/<meta\s+name=["']twitter:description["']\s+content=["'](.*?)["']/i)?.[1],
      image: html.match(/<meta\s+name=["']twitter:image["']\s+content=["'](.*?)["']/i)?.[1],
    }
    console.log('\n🐦 Twitter Card Tags:')
    Object.entries(twitterTags).forEach(([key, value]) => {
      console.log(`   ${value ? '✅' : '❌'} twitter:${key}: ${value || 'MISSING'}`)
    })
    
    // Test 5: Canonical URL
    const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["'](.*?)["']/i)?.[1]
    console.log(`\n🔗 Canonical URL: ${canonical ? '✅' : '❌'} ${canonical || 'MISSING'}`)
    
    // Test 6: Robots Meta Tag
    const robots = html.match(/<meta\s+name=["']robots["']\s+content=["'](.*?)["']/i)?.[1]
    console.log(`🤖 Robots Meta: ${robots ? '✅' : '❌'} ${robots || 'MISSING'}`)
    
    // Test 7: Viewport Meta Tag
    const viewport = html.match(/<meta\s+name=["']viewport["']\s+content=["'](.*?)["']/i)?.[1]
    console.log(`📱 Viewport Meta: ${viewport ? '✅' : '❌'} ${viewport || 'MISSING'}`)
    
    // Test 8: Theme Color
    const themeColor = html.match(/<meta\s+name=["']theme-color["']\s+content=["'](.*?)["']/i)?.[1]
    console.log(`🎨 Theme Color: ${themeColor ? '✅' : '❌'} ${themeColor || 'MISSING'}`)
    
    // Test 9: Language Attribute
    const lang = html.match(/<html\s+lang=["'](.*?)["']/i)?.[1]
    console.log(`🌐 HTML Lang: ${lang ? '✅' : '❌'} ${lang || 'MISSING'}`)
    
    // Test 10: Charset
    const charset = html.match(/<meta\s+charset=["'](.*?)["']/i)?.[1]
    console.log(`📝 Charset: ${charset ? '✅' : '❌'} ${charset || 'MISSING'}`)
    
    // Test 11: Preconnect to external domains
    const preconnects = html.match(/<link\s+rel=["']preconnect["']/gi)
    console.log(`\n⚡ Preconnect Links: ${preconnects ? preconnects.length : 0} found`)
    
    // Test 12: Font Loading
    const fontLinks = html.match(/fonts\.googleapis\.com|fonts\.gstatic\.com/gi)
    console.log(`🔤 Google Fonts: ${fontLinks ? '✅ Loaded' : '❌ Not found'}`)
    
    // SEO Score Calculation
    let seoScore = 0
    const checks = [
      title, description, ogTags.type, ogTags.title, ogTags.description, 
      ogTags.image, twitterTags.card, canonical, robots, viewport, lang, charset
    ]
    checks.forEach(check => { if (check) seoScore++ })
    const seoPercentage = Math.round((seoScore / checks.length) * 100)
    
    console.log('\n' + '='.repeat(60))
    console.log(`📊 SEO Score: ${seoScore}/${checks.length} (${seoPercentage}%)`)
    console.log('='.repeat(60))
    
    return { seoScore, seoPercentage, title, description, ogTags, twitterTags }
  } catch (error) {
    console.error('❌ SEO Test Failed:', error.message)
    return null
  }
}

async function testPerformance() {
  console.log('\n⚡ PERFORMANCE TEST RESULTS\n')
  console.log('='.repeat(60))
  
  try {
    const startTime = Date.now()
    const response = await fetch(BASE_URL)
    const loadTime = Date.now() - startTime
    
    console.log(`⏱️  Initial Load Time: ${loadTime}ms`)
    
    // Check response headers
    const contentType = response.headers.get('content-type')
    const contentLength = response.headers.get('content-length')
    const cacheControl = response.headers.get('cache-control')
    
    console.log(`📦 Content-Type: ${contentType || 'Not set'}`)
    console.log(`📏 Content-Length: ${contentLength ? `${Math.round(contentLength / 1024)}KB` : 'Not set'}`)
    console.log(`💾 Cache-Control: ${cacheControl || 'Not set'}`)
    
    // Performance recommendations
    console.log('\n💡 Performance Recommendations:')
    if (loadTime > 1000) {
      console.log('   ⚠️  Load time is > 1s - consider optimizing')
    } else {
      console.log('   ✅ Load time is good (< 1s)')
    }
    
    if (!cacheControl) {
      console.log('   ⚠️  No cache-control header - consider adding caching')
    } else {
      console.log('   ✅ Cache-control header present')
    }
    
    // Check for common performance issues
    const html = await response.text()
    const inlineStyles = (html.match(/<style>/gi) || []).length
    const inlineScripts = (html.match(/<script[^>]*>(?!.*src=)/gi) || []).length
    const externalScripts = (html.match(/<script[^>]*src=/gi) || []).length
    
    console.log(`\n📊 Resource Count:`)
    console.log(`   Inline Styles: ${inlineStyles}`)
    console.log(`   Inline Scripts: ${inlineScripts}`)
    console.log(`   External Scripts: ${externalScripts}`)
    
    if (inlineStyles > 5) {
      console.log('   ⚠️  Many inline styles - consider external CSS')
    }
    if (inlineScripts > 3) {
      console.log('   ⚠️  Many inline scripts - consider external JS')
    }
    
    // Check for async/defer on scripts
    const asyncScripts = (html.match(/<script[^>]*async/gi) || []).length
    const deferScripts = (html.match(/<script[^>]*defer/gi) || []).length
    
    console.log(`\n🚀 Script Loading:`)
    console.log(`   Async Scripts: ${asyncScripts}`)
    console.log(`   Defer Scripts: ${deferScripts}`)
    
    if (externalScripts > 0 && asyncScripts + deferScripts < externalScripts) {
      console.log('   ⚠️  Some scripts not async/defer - may block rendering')
    } else if (externalScripts > 0) {
      console.log('   ✅ Scripts are properly async/defer')
    }
    
    // Performance score
    let perfScore = 0
    if (loadTime < 1000) perfScore++
    if (cacheControl) perfScore++
    if (inlineStyles <= 5) perfScore++
    if (asyncScripts + deferScripts >= externalScripts || externalScripts === 0) perfScore++
    
    const perfPercentage = Math.round((perfScore / 4) * 100)
    
    console.log('\n' + '='.repeat(60))
    console.log(`📊 Performance Score: ${perfScore}/4 (${perfPercentage}%)`)
    console.log('='.repeat(60))
    
    return { 
      loadTime, 
      contentType, 
      contentLength, 
      cacheControl,
      perfScore,
      perfPercentage
    }
  } catch (error) {
    console.error('❌ Performance Test Failed:', error.message)
    return null
  }
}

async function testAccessibility() {
  console.log('\n♿ ACCESSIBILITY TEST RESULTS\n')
  console.log('='.repeat(60))
  
  try {
    const response = await fetch(BASE_URL)
    const html = await response.text()
    
    // Test 1: Alt text on images
    const images = html.match(/<img[^>]*>/gi) || []
    const imagesWithAlt = html.match(/<img[^>]*alt=["'][^"']*["']/gi) || []
    const altCoverage = images.length > 0 ? Math.round((imagesWithAlt.length / images.length) * 100) : 100
    
    console.log(`🖼️  Image Alt Text: ${imagesWithAlt.length}/${images.length} (${altCoverage}%)`)
    if (altCoverage < 100) {
      console.log('   ⚠️  Some images missing alt text')
    } else if (images.length > 0) {
      console.log('   ✅ All images have alt text')
    }
    
    // Test 2: Semantic HTML
    const semanticTags = ['header', 'nav', 'main', 'article', 'section', 'aside', 'footer']
    const foundSemantic = semanticTags.filter(tag => html.includes(`<${tag}`))
    
    console.log(`\n📄 Semantic HTML: ${foundSemantic.length}/${semanticTags.length} tags found`)
    console.log(`   Found: ${foundSemantic.join(', ') || 'None'}`)
    
    // Test 3: ARIA labels
    const ariaLabels = (html.match(/aria-label=["'][^"']*["']/gi) || []).length
    const ariaLabelledBy = (html.match(/aria-labelledby=["'][^"']*["']/gi) || []).length
    console.log(`\n🎯 ARIA Attributes: ${ariaLabels + ariaLabelledBy} found`)
    
    // Test 4: Heading hierarchy
    const h1 = (html.match(/<h1/gi) || []).length
    const h2 = (html.match(/<h2/gi) || []).length
    const h3 = (html.match(/<h3/gi) || []).length
    
    console.log(`\n📑 Heading Structure:`)
    console.log(`   H1: ${h1} (should be 1)`)
    console.log(`   H2: ${h2}`)
    console.log(`   H3: ${h3}`)
    
    if (h1 === 1) {
      console.log('   ✅ Single H1 found (good)')
    } else if (h1 === 0) {
      console.log('   ⚠️  No H1 found')
    } else {
      console.log('   ⚠️  Multiple H1s found (should be 1)')
    }
    
    // Accessibility score
    let a11yScore = 0
    if (altCoverage === 100 || images.length === 0) a11yScore++
    if (foundSemantic.length >= 3) a11yScore++
    if (h1 === 1) a11yScore++
    if (ariaLabels + ariaLabelledBy > 0) a11yScore++
    
    const a11yPercentage = Math.round((a11yScore / 4) * 100)
    
    console.log('\n' + '='.repeat(60))
    console.log(`📊 Accessibility Score: ${a11yScore}/4 (${a11yPercentage}%)`)
    console.log('='.repeat(60))
    
    return { a11yScore, a11yPercentage, altCoverage, semanticTags: foundSemantic.length }
  } catch (error) {
    console.error('❌ Accessibility Test Failed:', error.message)
    return null
  }
}

async function runTests() {
  console.log('\n🚀 Starting SEO & Performance Tests')
  console.log(`📍 Testing: ${BASE_URL}\n`)
  
  const seoResults = await testSEO()
  const perfResults = await testPerformance()
  const a11yResults = await testAccessibility()
  
  // Overall Summary
  console.log('\n\n📋 OVERALL SUMMARY\n')
  console.log('='.repeat(60))
  
  if (seoResults) {
    console.log(`SEO: ${seoResults.seoPercentage}% (${seoResults.seoScore}/12 checks passed)`)
  }
  
  if (perfResults) {
    console.log(`Performance: ${perfResults.perfPercentage}% (${perfResults.perfScore}/4 checks passed)`)
    console.log(`   Load Time: ${perfResults.loadTime}ms`)
  }
  
  if (a11yResults) {
    console.log(`Accessibility: ${a11yResults.a11yPercentage}% (${a11yResults.a11yScore}/4 checks passed)`)
  }
  
  const overallScore = seoResults && perfResults && a11yResults
    ? Math.round((seoResults.seoPercentage + perfResults.perfPercentage + a11yResults.a11yPercentage) / 3)
    : 0
  
  console.log(`\n🎯 Overall Score: ${overallScore}%`)
  console.log('='.repeat(60))
  
  if (overallScore >= 90) {
    console.log('✅ Excellent! Site is well optimized.')
  } else if (overallScore >= 75) {
    console.log('✅ Good! Minor improvements recommended.')
  } else if (overallScore >= 60) {
    console.log('⚠️  Fair. Several improvements needed.')
  } else {
    console.log('❌ Needs significant improvements.')
  }
  
  console.log('\n')
}

// Run tests
runTests().catch(console.error)
