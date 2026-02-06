# Add Admin Tag to Vadik Marmeladov

## Quick Setup

To add the Admin tag to your account (vadikmarmeladov@gmail.com), run this command in your bash terminal:

```bash
npm run db:admin -- add-admin-tag vadikmarmeladov@gmail.com
```

## What This Does

This command will:
1. Connect to your PostgreSQL database using credentials from `.env`
2. Add the 'admin' tag to your user account
3. Display confirmation with your updated user info

## Expected Output

```
Adding Admin tag to: vadikmarmeladov@gmail.com
✅ Admin tag added successfully!
User: {
  id: 'your-user-id',
  email: 'vadikmarmeladov@gmail.com',
  firstName: 'Vadik',
  lastName: 'Marmeladov',
  tags: [ 'admin' ]
}
```

## What Admin Tag Gives You

Once you have the Admin tag, you'll be able to:

### 1. **Admin Panel Access**
- Access `/admin` route to view all users
- View user statistics and activity
- Search and filter users

### 2. **User Management**
- View any user's profile at `/us/{userId}`
- See detailed user information, logs, and memory answers
- Generate user summaries and memory stories (for debugging)

### 3. **Tag Management** (CEO-only: vadikmarmeladov@gmail.com)
- Edit user tags (add/remove Usership, RND, Evangelist, etc.)
- This permission is specifically restricted to your email

### 4. **Enhanced UI Features**
- Custom theme picker in Settings
- Additional system information
- Developer tools and diagnostics

### 5. **Chat Moderation**
- See all chat messages (not limited to last 12)
- Full message history visibility

## Other Available Commands

If you need to manage tags for other users:

```bash
# Add any tag to a user
npm run db:admin -- add-tag user@example.com usership

# Remove a tag from a user
npm run db:admin -- remove-tag user@example.com usership

# List all users in the database
npm run db:admin -- list-users

# Run custom SQL query
npm run db:admin -- query "SELECT * FROM users WHERE tags @> ARRAY['admin']"
```

## Security Notes

- The Admin tag is stored in lowercase as 'admin' in the database
- The script only adds the tag if it doesn't already exist
- All database operations use parameterized queries to prevent SQL injection
- Database credentials are loaded from `.env` file
- SSL connection is required for Digital Ocean managed databases

## Troubleshooting

**If the command fails:**

1. **Check database credentials in `.env`:**
   ```env
   DB_HOST=your-database-host
   DB_PORT=25060
   DB_NAME=defaultdb
   DB_USER=doadmin
   DB_PASSWORD=your-database-password
   ```

2. **User not found error:**
   - Make sure you've logged in to the app at least once
   - The user account must exist in the database before adding tags

3. **Already has Admin tag:**
   - If you see this message, you already have the Admin tag
   - Refresh the app to see admin features

## After Adding Admin Tag

1. **Refresh the app** - Log out and log back in, or refresh the page
2. **Check Settings** - You should see the Custom Theme picker
3. **Access Admin Panel** - Navigate to `/admin` to see the user list
4. **Verify in UI** - Your name should show with an `[Admin]` badge in various places

## File Location

This utility script is located at: `scripts/db-admin.ts`

You can also run it directly with tsx:
```bash
npx tsx scripts/db-admin.ts add-admin-tag vadikmarmeladov@gmail.com
```
