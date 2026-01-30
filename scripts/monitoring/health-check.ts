import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env') })

interface HealthStatus {
  timestamp: string;
  database: {
    connected: boolean;
    latency: number;
    activeConnections?: number;
    error?: string;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
}

async function checkHealth(): Promise<HealthStatus> {
  const startTime = Date.now()
  const sequelize = new Sequelize(process.env.DATABASE_URL!, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  })

  const status: HealthStatus = {
    timestamp: new Date().toISOString(),
    database: {
      connected: false,
      latency: 0
    },
    memory: {
      used: process.memoryUsage().heapUsed,
      total: process.memoryUsage().heapTotal,
      percentage: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100
    }
  }

  try {
    await sequelize.authenticate()
    status.database.connected = true
    status.database.latency = Date.now() - startTime

    // Check active connections
    const [result] = await sequelize.query('SELECT count(*) as count FROM pg_stat_activity')
    status.database.activeConnections = (result as any)[0].count

  } catch (error) {
    status.database.connected = false
    status.database.error = (error as Error).message
  } finally {
    await sequelize.close()
  }

  return status
}

async function monitor() {
  try {
    const status = await checkHealth()
    console.clear() // Clear console for better readability
    console.log('\n=== Database Health Monitor ===')
    console.log('Timestamp:', status.timestamp)
    console.log('\nDatabase:')
    console.log('Status:', status.database.connected ? 'Connected' : 'Disconnected')
    console.log('Latency:', status.database.latency + 'ms')
    if (status.database.activeConnections) {
      console.log('Active Connections:', status.database.activeConnections)
    }
    if (status.database.error) {
      console.log('Error:', status.database.error)
    }
    console.log('\nMemory:')
    console.log('Used:', Math.round(status.memory.used / 1024 / 1024) + 'MB')
    console.log('Total:', Math.round(status.memory.total / 1024 / 1024) + 'MB')
    console.log('Usage:', Math.round(status.memory.percentage) + '%')
    console.log('\nPress Ctrl+C to stop monitoring')
  } catch (error) {
    console.error('Monitoring error:', error)
  }
}

// Run monitoring every 5 seconds
setInterval(monitor, 5000)
monitor() // Initial check
