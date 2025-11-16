# User Tag Management - Quick Reference

## 🎯 Common Commands (Use with Yarn)

### Add Usership Tag
```bash
yarn run db:admin -- add-tag user@example.com usership
```

### Add R&D Tag
```bash
yarn run db:admin -- add-tag user@example.com rnd
```

### Add Admin Tag
```bash
yarn run db:admin -- add-admin-tag user@example.com
```

### Remove Any Tag
```bash
yarn run db:admin -- remove-tag user@example.com tagname
```

---

## 📋 Available User Tags

Based on `src/shared/types/index.ts`:

```typescript
UserTag {
  Admin = 'Admin',          // Full admin access
  RND = 'RND',             // R&D team member
  Evangelist = 'Evangelist', // Evangelist
  Mala = 'Mala',           // Mala access
  Onyx = 'Onyx',           // Onyx access
  Usership = 'Usership',   // Premium features (AI Memory, Stories)
  Pro = 'Pro',             // Pro tier
  Suspended = 'Suspended', // Account suspended
}
```

---

## 🔑 Tag Permissions

### **Admin**
- Access to `/admin` route (user management)
- Custom theme picker in Settings
- Full chat message history (not limited to 12)
- User profile viewing at `/us/{userId}`
- Tag editing (CEO-only: vadikmarmeladov@gmail.com)

### **Usership**
- AI-powered Memory question generation
- Memory Story generation
- Access to `/us` section (user profiles)
- Premium features

### **RND (R&D)**
- R&D team access
- Special development features

---

## 📖 Usage Examples

### Add Multiple Tags to One User
```bash
# Add Usership tag
yarn run db:admin -- add-tag john@example.com usership

# Add RND tag to same user
yarn run db:admin -- add-tag john@example.com rnd

# Result: user has both tags
```

### List All Users and Their Tags
```bash
yarn run db:admin -- list-users
```

### Query Specific User
```bash
yarn run db:admin -- query "SELECT email, tags FROM users WHERE email='vadikmarmeladov@gmail.com'"
```

### Find All Usership Users
```bash
yarn run db:admin -- query "SELECT email, tags FROM users WHERE 'usership' = ANY(tags)"
```

### Find All Admin Users
```bash
yarn run db:admin -- query "SELECT email, tags FROM users WHERE 'admin' = ANY(tags)"
```

---

## 🛡️ Security Notes

### CEO-Only Permissions
Only `vadikmarmeladov@gmail.com` can:
- Edit user tags (via `canEditTags()`)
- Hardcoded in `src/server/models/user.ts:75`

### Admin Access Methods
Admin access is granted if **EITHER** is true:
1. Email in `ADMIN_EMAILS` environment variable
2. User has `admin` tag in database

### Tag Format
- Tags are stored **lowercase** in database
- Tag comparison is **case-insensitive**
- Example: 'Usership', 'usership', 'USERSHIP' all match

---

## 🔧 Database CLI Tool

**Location:** `scripts/db-admin.ts`

**All Commands:**
```bash
# Add admin tag (shortcut)
yarn run db:admin -- add-admin-tag <email>

# Add any tag
yarn run db:admin -- add-tag <email> <tag>

# Remove tag
yarn run db:admin -- remove-tag <email> <tag>

# List all users
yarn run db:admin -- list-users

# Custom SQL query
yarn run db:admin -- query "<SQL>"
```

---

## ✅ Verification

After adding a tag, verify:

```bash
# Check specific user
yarn run db:admin -- query "SELECT email, tags FROM users WHERE email='user@example.com'"

# User should log out and back in for session to refresh
```

**Or via API:**
```bash
# After user logs back in, their profile will include new tags
curl https://lot-systems.com/api/me -H "Cookie: auth_token=..."
```

---

## 🚨 Important Notes

1. **Always use `yarn`** (not `npm`) for this project
2. **Tags are case-insensitive** in the database
3. **Users must log out and back in** after tag changes
4. **Database credentials** loaded from `.env` file
5. **SSL required** for Digital Ocean managed database

---

## 📝 Tag Documentation

**Tags Definition:**
- File: `src/shared/types/index.ts`
- Enum: `UserTag`

**Tag Checking:**
- File: `src/server/models/user.ts`
- Methods: `isAdmin()`, `canAccessUsSection()`, `canEditTags()`

**Tag Usage:**
- Admin features: Check for 'admin' tag
- Usership features: Check for 'usership' tag (case-insensitive)
- R&D features: Check for 'rnd' tag

---

**Last Updated:** November 16, 2025
**Version:** 0.1.0
