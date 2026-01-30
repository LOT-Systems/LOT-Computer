# Live Message - Terminal Commands

Quick reference for managing Live messages via terminal.

## Prerequisites

Ensure you have the database credentials in your `.env` file:
```bash
DB_HOST=your-db-host
DB_PORT=25060
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password
```

## Commands

### Set or Update Live Message

Set a new live message or update the existing one:

```bash
yarn run db:admin -- set-live "Welcome to LOT Systems!"
```

**Examples:**
```bash
# Simple message
yarn run db:admin -- set-live "System maintenance scheduled for tonight"

# Multi-word message
yarn run db:admin -- set-live "New features available! Check them out in Settings."

# Announcement
yarn run db:admin -- set-live "Special offer: 20% off Usership subscriptions this week"
```

### View Current Live Message

Check what live message is currently displayed:

```bash
yarn run db:admin -- get-live
```

**Output:**
```
Current live message:
┌─────────┬──────────────────────────┬───────────────────┬────────────┬───────────┬─────────────┐
│ (index) │ id                       │ message           │ createdAt  │ updatedAt │ authorEmail │
├─────────┼──────────────────────────┼───────────────────┼────────────┼───────────┼─────────────┤
│    0    │ 'abc123...'              │ 'Welcome to LOT!' │ 2025-11-16 │ 2025-11-16│ 'admin@...' │
└─────────┴──────────────────────────┴───────────────────┴────────────┴───────────┴─────────────┘
```

### Clear Live Message

Remove the current live message:

```bash
yarn run db:admin -- clear-live
```

This sets the message to an empty string, effectively removing it from the System page.

## How It Works

1. **Author Assignment**: Automatically uses the first admin user in the database as the message author
2. **Update vs Create**: If a live message exists, it updates it; otherwise, creates a new one
3. **Real-time Sync**: Changes are immediately visible to all connected users via Server-Sent Events (SSE)
4. **Database**: Stored in `live_messages` table with timestamps

## Web UI Access

Admins can also manage Live messages through the web interface:
- Navigate to `/us` (Admin page)
- Form appears at the top of the page
- Type message and click "Post" (or "Remove" to clear)

## User Visibility

Live messages appear on the System page (`/`) for all logged-in users:
```
┌──────────────────────────────┐
│ Live: Welcome to LOT Systems │
└──────────────────────────────┘
```

## Troubleshooting

**"No admin user found to set as author"**
- Solution: Add an admin tag to a user first:
  ```bash
  yarn run db:admin -- add-admin-tag your@email.com
  ```

**"tsx: not found"**
- Solution: The command will work in the deployed environment. Locally, ensure dependencies are installed:
  ```bash
  yarn install
  ```

**Message not appearing on System page**
- Check the message was set: `yarn run db:admin -- get-live`
- Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+F5 (Windows)
- Check browser console for SSE connection errors

## See Also

- [USER-TAG-COMMANDS.md](USER-TAG-COMMANDS.md) - Managing user tags
- [DB-ADMIN-README.md](DB-ADMIN-README.md) - All database admin commands
