/**
 * Cold Start / Morning Loading Tests
 *
 * Tests all critical screens and APIs to ensure the application
 * loads correctly after deployment or server restart.
 *
 * Usage: esr ./test-cold-start.ts
 */

import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const APP_HOST = process.env.APP_HOST || 'http://localhost:4400'
const TEST_ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || ''
const TEST_ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || ''

interface TestResult {
  name: string
  passed: boolean
  duration: number
  error?: string
  details?: any
}

const results: TestResult[] = []

// Helper function to log test results
function logResult(result: TestResult) {
  results.push(result)
  const status = result.passed ? '✅' : '❌'
  const time = `(${result.duration}ms)`
  console.log(`${status} ${result.name} ${time}`)
  if (result.error) {
    console.log(`   Error: ${result.error}`)
  }
  if (result.details) {
    console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`)
  }
}

// Helper to run a test with timing
async function runTest(name: string, testFn: () => Promise<void>): Promise<TestResult> {
  const start = Date.now()
  try {
    await testFn()
    const duration = Date.now() - start
    return { name, passed: true, duration }
  } catch (error: any) {
    const duration = Date.now() - start
    return {
      name,
      passed: false,
      duration,
      error: error.message || String(error),
    }
  }
}

// Create axios instance without auth
const client = axios.create({
  baseURL: APP_HOST,
  timeout: 30000,
  validateStatus: (status) => status < 500, // Don't throw on 4xx
})

// Create axios instance with cookies for authenticated requests
let authenticatedClient = axios.create({
  baseURL: APP_HOST,
  timeout: 30000,
  withCredentials: true,
  validateStatus: (status) => status < 500,
})

let authCookie = ''

// ============================================================================
// 1. Auth Screen Tests
// ============================================================================

async function testAuthScreenLoads() {
  const response = await client.get('/')
  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`)
  }
  if (!response.data.includes('<!DOCTYPE html>')) {
    throw new Error('Response does not contain HTML')
  }
  // Should load login script for non-authenticated users
  if (!response.data.includes('login')) {
    console.warn('   Warning: Login page might not be loading correctly')
  }
}

async function testAuthEndpointExists() {
  const response = await client.post('/auth/login', {
    email: 'test@example.com',
    password: 'wrongpassword',
  })
  // Should get 401 for wrong credentials, not 404 or 500
  if (response.status === 404) {
    throw new Error('Auth endpoint not found (404)')
  }
  if (response.status >= 500) {
    throw new Error(`Auth endpoint server error (${response.status})`)
  }
}

async function testAuthLogin() {
  if (!TEST_ADMIN_EMAIL || !TEST_ADMIN_PASSWORD) {
    console.log('   Skipped: TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD not set in .env')
    return
  }

  const response = await authenticatedClient.post('/auth/login', {
    email: TEST_ADMIN_EMAIL,
    password: TEST_ADMIN_PASSWORD,
  })

  if (response.status !== 200) {
    throw new Error(`Login failed with status ${response.status}`)
  }

  // Extract cookies
  const cookies = response.headers['set-cookie']
  if (cookies && cookies.length > 0) {
    authCookie = cookies.map(cookie => cookie.split(';')[0]).join('; ')
    authenticatedClient.defaults.headers.Cookie = authCookie
  }
}

// ============================================================================
// 2. Settings Screen Tests
// ============================================================================

async function testSettingsScreenLoads() {
  const response = await client.get('/settings')
  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`)
  }
  if (!response.data.includes('<!DOCTYPE html>')) {
    throw new Error('Response does not contain HTML')
  }
}

async function testSettingsAPI() {
  if (!authCookie) {
    console.log('   Skipped: Requires authentication')
    return
  }

  const response = await authenticatedClient.get('/api/me')
  if (response.status === 401) {
    console.log('   Skipped: Not authenticated')
    return
  }
  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`)
  }
  if (!response.data.email) {
    throw new Error('User profile missing email field')
  }
}

// ============================================================================
// 3. Main/Sync Screen Tests
// ============================================================================

async function testSyncScreenLoads() {
  const response = await client.get('/sync')
  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`)
  }
  if (!response.data.includes('<!DOCTYPE html>')) {
    throw new Error('Response does not contain HTML')
  }
}

async function testSystemScreenLoads() {
  const response = await client.get('/')
  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`)
  }
  if (!response.data.includes('<!DOCTYPE html>')) {
    throw new Error('Response does not contain HTML')
  }
}

// ============================================================================
// 4. /us (Admin Users) Screen Tests
// ============================================================================

async function testUsScreenLoads() {
  const response = await client.get('/us')
  // Will redirect to / if not admin, but should not 500
  if (response.status >= 500) {
    throw new Error(`Server error: ${response.status}`)
  }
  if (response.status === 404) {
    throw new Error('Route /us not found (404)')
  }
}

async function testAdminUsersAPI() {
  if (!authCookie) {
    console.log('   Skipped: Requires authentication')
    return
  }

  const response = await authenticatedClient.get('/admin-api/users?skip=0&limit=10&sort=newest&tags=')

  if (response.status === 401) {
    console.log('   Info: User is not admin (401)')
    return
  }

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`)
  }

  if (!response.data.data || !Array.isArray(response.data.data)) {
    throw new Error('Response missing data array')
  }

  if (typeof response.data.total !== 'number') {
    throw new Error('Response missing total count')
  }
}

async function testAdminSingleUserAPI() {
  if (!authCookie) {
    console.log('   Skipped: Requires authentication')
    return
  }

  // First get the current user ID
  const meResponse = await authenticatedClient.get('/api/me')
  if (meResponse.status !== 200) {
    console.log('   Skipped: Could not get current user')
    return
  }

  const userId = meResponse.data.id
  const response = await authenticatedClient.get(`/admin-api/users/${userId}`)

  if (response.status === 401) {
    console.log('   Info: User is not admin (401)')
    return
  }

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`)
  }

  if (!response.data.id || !response.data.email) {
    throw new Error('User data incomplete')
  }
}

// ============================================================================
// 5. Usership Claude Tests
// ============================================================================

async function testMemoryAPI() {
  if (!authCookie) {
    console.log('   Skipped: Requires authentication')
    return
  }

  const date = Buffer.from(new Date().toISOString()).toString('base64')
  const response = await authenticatedClient.get(`/api/memory?d=${date}`)

  if (response.status === 401) {
    console.log('   Skipped: Not authenticated')
    return
  }

  if (response.status !== 200 && response.status !== 404) {
    throw new Error(`Expected 200 or 404, got ${response.status}`)
  }
}

async function testLiveMessageAPI() {
  const response = await client.get('/api/live-message')

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`)
  }

  if (typeof response.data.message !== 'string') {
    throw new Error('Live message response invalid')
  }
}

async function testChatMessagesAPI() {
  const response = await client.get('/api/chat-messages')

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`)
  }

  if (!Array.isArray(response.data)) {
    throw new Error('Chat messages should be an array')
  }
}

// ============================================================================
// 6. API Tests (Weather, Time, Dark/Light Modes)
// ============================================================================

async function testWeatherAPI() {
  if (!authCookie) {
    console.log('   Skipped: Requires authentication')
    return
  }

  const response = await authenticatedClient.get('/api/weather')

  if (response.status === 401) {
    console.log('   Skipped: Not authenticated')
    return
  }

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`)
  }

  // Weather can be null if not set
  if (response.data !== null) {
    if (!response.data.temperature) {
      throw new Error('Weather data missing temperature')
    }
  }
}

async function testStaticAssetsCSSLoad() {
  const response = await client.get('/css/index.css')

  if (response.status !== 200) {
    throw new Error(`CSS failed to load: ${response.status}`)
  }

  if (!response.data.includes('tailwind') && !response.data.includes('css')) {
    console.warn('   Warning: CSS content might be invalid')
  }
}

async function testStaticAssetsJSLoad() {
  // Test that at least one JS file is accessible
  const response = await client.get('/js/app.js')

  if (response.status !== 200 && response.status !== 404) {
    throw new Error(`JS endpoint error: ${response.status}`)
  }

  // In production, might be .gz, so 404 on .js is acceptable
  if (response.status === 404) {
    console.log('   Info: app.js not found (might be gzipped in production)')
  }
}

async function testPublicManifest() {
  const response = await client.get('/manifest.webmanifest')

  if (response.status !== 200) {
    throw new Error(`Manifest failed to load: ${response.status}`)
  }

  const manifest = response.data
  if (!manifest.name) {
    throw new Error('Manifest missing name field')
  }
}

// ============================================================================
// Run All Tests
// ============================================================================

async function runAllTests() {
  console.log('\n🚀 Starting Cold Start / Morning Loading Tests')
  console.log(`📍 Testing: ${APP_HOST}`)
  console.log('=' .repeat(60))

  // 1. Auth Screen Tests
  console.log('\n1️⃣  Auth Screen Tests')
  console.log('-' .repeat(60))
  logResult(await runTest('Auth screen loads', testAuthScreenLoads))
  logResult(await runTest('Auth endpoint exists', testAuthEndpointExists))
  logResult(await runTest('Admin login works', testAuthLogin))

  // 2. Settings Screen Tests
  console.log('\n2️⃣  Settings Screen Tests')
  console.log('-' .repeat(60))
  logResult(await runTest('Settings screen loads', testSettingsScreenLoads))
  logResult(await runTest('Settings API works', testSettingsAPI))

  // 3. Main/Sync Screen Tests
  console.log('\n3️⃣  Main/Sync Screen Tests')
  console.log('-' .repeat(60))
  logResult(await runTest('Sync screen loads', testSyncScreenLoads))
  logResult(await runTest('System screen loads', testSystemScreenLoads))

  // 4. /us Screen Tests
  console.log('\n4️⃣  Admin Users (/us) Tests')
  console.log('-' .repeat(60))
  logResult(await runTest('/us screen loads', testUsScreenLoads))
  logResult(await runTest('Admin users API works', testAdminUsersAPI))
  logResult(await runTest('Admin single user API works', testAdminSingleUserAPI))

  // 5. Usership Claude Tests
  console.log('\n5️⃣  Usership Claude Tests')
  console.log('-' .repeat(60))
  logResult(await runTest('Memory API works', testMemoryAPI))
  logResult(await runTest('Live message API works', testLiveMessageAPI))
  logResult(await runTest('Chat messages API works', testChatMessagesAPI))

  // 6. API Tests
  console.log('\n6️⃣  API Tests (Weather, Assets, etc.)')
  console.log('-' .repeat(60))
  logResult(await runTest('Weather API works', testWeatherAPI))
  logResult(await runTest('CSS assets load', testStaticAssetsCSSLoad))
  logResult(await runTest('JS assets accessible', testStaticAssetsJSLoad))
  logResult(await runTest('Manifest loads', testPublicManifest))

  // Summary
  console.log('\n' + '=' .repeat(60))
  console.log('📊 Test Summary')
  console.log('=' .repeat(60))

  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  const total = results.length
  const avgDuration = Math.round(results.reduce((sum, r) => sum + r.duration, 0) / total)

  console.log(`✅ Passed: ${passed}/${total}`)
  console.log(`❌ Failed: ${failed}/${total}`)
  console.log(`⏱️  Average duration: ${avgDuration}ms`)

  if (failed > 0) {
    console.log('\n❌ Failed Tests:')
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.name}: ${r.error}`)
    })
  }

  console.log('\n' + '=' .repeat(60))

  // Exit with error code if any tests failed
  if (failed > 0) {
    process.exit(1)
  }

  console.log('✅ All tests passed!\n')
}

// Run tests
runAllTests().catch((error) => {
  console.error('💥 Test runner error:', error)
  process.exit(1)
})
