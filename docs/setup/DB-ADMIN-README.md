# Database Admin Utility

Secure command-line tool for managing LOT database as admin.

## 🔐 Security First

Database credentials are stored in `.env` file (NOT committed to git).

### Setup

1. Ensure your `.env` file has these variables:
```bash
DB_HOST=your-db-host.ondigitalocean.com
DB_PORT=25060
DB_NAME=defaultdb
DB_USER=doadmin
DB_PASSWORD=your-secure-password
```

2. The `.env` file is in `.gitignore` - credentials stay local and secure

## 🚀 Quick Start

### Add Admin Tag to Yourself (CEO)

```bash
npm run db:admin -- add-admin-tag vadikmarmeladov@gmail.com
```

**What this does:**
- ✅ Adds `admin` tag to your account
- ✅ Grants access to `/us` admin panel
- ✅ Allows you to manage other users' tags
- ✅ Shows admin-only features in UI

**After running:** Refresh browser or log out/in to see changes.

## 📋 Available Commands

### User Tag Management

```bash
# Add Admin tag
npm run db:admin -- add-admin-tag user@example.com

# Add any tag (Usership, Pro, Onyx, etc.)
npm run db:admin -- add-tag user@example.com usership
npm run db:admin -- add-tag user@example.com pro

# Remove tag
npm run db:admin -- remove-tag user@example.com usership
```

### User Management

```bash
# List all users
npm run db:admin -- list-users

# Run custom SQL query
npm run db:admin -- query "SELECT * FROM users WHERE email='user@example.com'"
npm run db:admin -- query "SELECT COUNT(*) FROM users WHERE 'usership' = ANY(tags)"
```

## 🏷️ Available Tags

- **admin** - Full admin access, can edit user tags
- **usership** - Premium subscription, AI Memory Story
- **pro** - Pro tier features
- **onyx** - Onyx tier features
- **evangelist** - Special evangelist features
- **mala** - Mala features
- **rnd** - R&D features

## 💡 Common Operations

### Give Usership to a User

```bash
npm run db:admin -- add-tag user@example.com usership
```

### Check User's Current Tags

```bash
npm run db:admin -- query "SELECT email, tags FROM users WHERE email='user@example.com'"
```

### List All Usership Users

```bash
npm run db:admin -- query "SELECT email, \"firstName\", \"lastName\", tags FROM users WHERE 'usership' = ANY(tags)"
```

### Remove All Tags from User

```bash
npm run db:admin -- query "UPDATE users SET tags = ARRAY[]::varchar[] WHERE email='user@example.com'"
```

## 🔒 Security Notes

1. **Never commit `.env` file** - It's in `.gitignore` for security
2. **Database password** - Keep it secure, rotate regularly
3. **Digital Ocean SSL** - Connection uses SSL automatically
4. **Admin access** - Only you (CEO) can edit tags via UI

## 🐛 Troubleshooting

**"Connection refused":**
- Check `.env` has correct DB_HOST, DB_PORT
- Verify database is running on Digital Ocean

**"User not found":**
- User must exist in database first (sign up via app)
- Check email spelling matches exactly

**"Permission denied":**
- Ensure DB_USER and DB_PASSWORD are correct
- Check Digital Ocean database firewall allows your IP

## 📚 Examples

### Initial Setup (First Time)

```bash
# 1. Add Admin tag to yourself
npm run db:admin -- add-admin-tag vadikmarmeladov@gmail.com

# 2. Verify it worked
npm run db:admin -- query "SELECT email, tags FROM users WHERE email='vadikmarmeladov@gmail.com'"

# 3. Refresh browser and go to /us to access admin panel
```

### Daily Operations

```bash
# Give user Usership subscription
npm run db:admin -- add-tag user@example.com usership

# Check subscription status
npm run db:admin -- query "SELECT email, tags FROM users WHERE 'usership' = ANY(tags)"

# List all users with their tags
npm run db:admin -- list-users
```

---

**Need help?** This utility uses PostgreSQL directly via the `pg` library. All operations are secure and use parameterized queries to prevent SQL injection.
