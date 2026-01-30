require('dotenv').config()

console.log('Environment Check:')
console.log('----------------------------------------')
console.log('Process ENV:', {
  RESEND_API_KEY_EXISTS: !!process.env.RESEND_API_KEY,
  RESEND_API_KEY_PREFIX: process.env.RESEND_API_KEY?.substring(0, 5) + '...',
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  RESEND_FROM_NAME: process.env.RESEND_FROM_NAME
})
console.log('----------------------------------------')
