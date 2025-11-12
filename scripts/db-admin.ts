#!/usr/bin/env tsx
/**
 * Database Admin Utility
 *
 * Run database admin commands securely using environment variables
 *
 * Usage:
 *   npm run db:admin -- add-admin-tag vadikmarmeladov@gmail.com
 *   npm run db:admin -- query "SELECT * FROM users WHERE email='vadikmarmeladov@gmail.com'"
 *   npm run db:admin -- list-users
 *   npm run db:admin -- add-tag user@example.com usership
 *   npm run db:admin -- remove-tag user@example.com tagname
 */

import dotenv from 'dotenv'
import { Client } from 'pg'

dotenv.config()

const config = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '25060', 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false, // Required for Digital Ocean managed databases
  },
}

async function connectDB() {
  const client = new Client(config)
  await client.connect()
  return client
}

async function addAdminTag(email: string) {
  const client = await connectDB()
  try {
    console.log(`Adding Admin tag to: ${email}`)

    const result = await client.query(
      `UPDATE users
       SET tags = array_append(tags, 'admin')
       WHERE email = $1
       AND NOT ('admin' = ANY(tags))
       RETURNING id, email, "firstName", "lastName", tags`,
      [email]
    )

    if (result.rows.length === 0) {
      console.log('❌ User not found or already has Admin tag')
      return
    }

    console.log('✅ Admin tag added successfully!')
    console.log('User:', result.rows[0])
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.end()
  }
}

async function addTag(email: string, tag: string) {
  const client = await connectDB()
  try {
    const normalizedTag = tag.toLowerCase()
    console.log(`Adding tag "${normalizedTag}" to: ${email}`)

    const result = await client.query(
      `UPDATE users
       SET tags = array_append(tags, $2)
       WHERE email = $1
       AND NOT ($2 = ANY(tags))
       RETURNING id, email, "firstName", "lastName", tags`,
      [email, normalizedTag]
    )

    if (result.rows.length === 0) {
      console.log('❌ User not found or already has this tag')
      return
    }

    console.log('✅ Tag added successfully!')
    console.log('User:', result.rows[0])
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.end()
  }
}

async function removeTag(email: string, tag: string) {
  const client = await connectDB()
  try {
    const normalizedTag = tag.toLowerCase()
    console.log(`Removing tag "${normalizedTag}" from: ${email}`)

    const result = await client.query(
      `UPDATE users
       SET tags = array_remove(tags, $2)
       WHERE email = $1
       RETURNING id, email, "firstName", "lastName", tags`,
      [email, normalizedTag]
    )

    if (result.rows.length === 0) {
      console.log('❌ User not found')
      return
    }

    console.log('✅ Tag removed successfully!')
    console.log('User:', result.rows[0])
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.end()
  }
}

async function runQuery(query: string) {
  const client = await connectDB()
  try {
    console.log(`Running query: ${query}`)
    const result = await client.query(query)
    console.log('\n✅ Query executed successfully!')
    console.log(`Rows returned: ${result.rows.length}`)
    if (result.rows.length > 0) {
      console.log('\nResults:')
      console.table(result.rows)
    }
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.end()
  }
}

async function listUsers() {
  const client = await connectDB()
  try {
    console.log('Fetching all users...\n')
    const result = await client.query(
      `SELECT id, email, "firstName", "lastName", tags, "createdAt", "lastSeenAt"
       FROM users
       ORDER BY "createdAt" DESC`
    )
    console.log(`Total users: ${result.rows.length}\n`)
    console.table(result.rows)
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.end()
  }
}

async function main() {
  const [command, ...args] = process.argv.slice(2)

  if (!command) {
    console.log(`
Database Admin Utility

Commands:
  add-admin-tag <email>       Add Admin tag to user
  add-tag <email> <tag>       Add any tag to user
  remove-tag <email> <tag>    Remove tag from user
  list-users                  List all users
  query "<sql>"               Run custom SQL query

Examples:
  npm run db:admin -- add-admin-tag vadikmarmeladov@gmail.com
  npm run db:admin -- add-tag user@example.com usership
  npm run db:admin -- remove-tag user@example.com usership
  npm run db:admin -- list-users
  npm run db:admin -- query "SELECT * FROM users WHERE email='vadikmarmeladov@gmail.com'"
    `)
    process.exit(1)
  }

  switch (command) {
    case 'add-admin-tag':
      if (!args[0]) {
        console.error('❌ Email required')
        process.exit(1)
      }
      await addAdminTag(args[0])
      break

    case 'add-tag':
      if (!args[0] || !args[1]) {
        console.error('❌ Email and tag required')
        process.exit(1)
      }
      await addTag(args[0], args[1])
      break

    case 'remove-tag':
      if (!args[0] || !args[1]) {
        console.error('❌ Email and tag required')
        process.exit(1)
      }
      await removeTag(args[0], args[1])
      break

    case 'query':
      if (!args[0]) {
        console.error('❌ SQL query required')
        process.exit(1)
      }
      await runQuery(args[0])
      break

    case 'list-users':
      await listUsers()
      break

    default:
      console.error(`❌ Unknown command: ${command}`)
      process.exit(1)
  }
}

main().catch(console.error)
