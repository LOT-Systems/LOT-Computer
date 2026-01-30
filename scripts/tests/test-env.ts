import 'dotenv/config'
import config from '#server/config'

console.log('Environment Check:')
console.log('----------------------------------------')
console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY?.substring(0, 5) + '...')
console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL)
console.log('RESEND_FROM_NAME:', process.env.RESEND_FROM_NAME)
console.log('----------------------------------------')
console.log('Config Check:')
console.log('email.resendApiKey exists:', !!config.email?.resendApiKey)
console.log('email.fromEmail:', config.email?.fromEmail)
console.log('email.fromName:', config.email?.fromName)
console.log('----------------------------------------')
