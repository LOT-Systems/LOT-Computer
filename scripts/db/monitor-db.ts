import { checkDatabaseConnection } from '../src/server/utils/db'

async function monitor() {
  while (true) {
    const isConnected = await checkDatabaseConnection()
    console.log(new Date().toISOString(), isConnected ? 'Connected' : 'Not connected')
    await new Promise(resolve => setTimeout(resolve, 5000)) // Check every 5 seconds
  }
}

monitor()
