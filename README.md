# LOT Systems

**Self-care through proactive context-aware AI**

---

## 🌟 What is LOT?

LOT is a subscription service that distributes digital and physical necessities, basic wardrobes, organic self-care products, home and kids essentials.

But more importantly, LOT features the **Memory Engine** - a revolutionary AI-powered self-care companion that follows up on your wellness routines like a coach, and even more, like a life partner who truly knows you.

---

## 💎 The Memory Engine: Your Personal Self-care Vault

### Unlike Any Other Wellness App

Most health apps track data points. LOT builds your **Memory Story**.

The Memory Engine doesn't just ask questions - it **remembers every answer** and builds a progressively deeper understanding of your self-care preferences, habits, and patterns.

**Think of it as:**
- 🧘 A wellness coach who never forgets what you've shared
- 💬 A life partner who knows your body, mind, and soul preferences
- 📖 An invaluable vault of your personal settings, concentrated over time
- 🎯 A proactive companion that asks the right question at the right moment

### How It Works

**Day 1:**
- "What is your morning beverage preference?"
- You answer: "Tea"

**Day 2:**
- "Since you prefer tea, how do you usually prepare it?"
- You answer: "Loose leaf ritual"

**Day 3:**
- "You mentioned enjoying the loose leaf ritual. What's your favorite type?"
- You answer: "Green tea"

**Week 2:**
- "You love hot green loose leaf tea as a morning ritual. What do you typically do while drinking it?"
- You answer: "Quiet reading time"

**Month 2:**
- "Now that it's colder, you mentioned loving your morning tea ritual with reading. Has your tea preference changed with the season?"

**Notice:** Each question builds on the last. The Memory Engine **never forgets**. Your story grows richer over time.

### Your Memory Story Becomes Invaluable

Over weeks and months, your Memory Story becomes:

✨ **A vault of your personal wellness settings**
- What energizes you
- What calms you
- What rituals matter most
- How your preferences change with seasons
- What patterns emerge in your self-care

💪 **Body knowledge concentrated**
- Movement preferences
- Energy patterns
- Rest requirements
- Nutrition choices

🧠 **Mind patterns revealed**
- How you focus best
- When you need quiet
- What helps you think clearly
- Your creative rhythms

❤️ **Soul preferences honored**
- What brings you joy
- What rituals ground you
- How you recharge
- What makes you feel whole

**This isn't data collection. This is your life story, told through self-care choices.**

---

## 🔒 Your Story, Your Data

Unlike other wellness apps:
- ✅ Your Memory Story lives in **your database**, not an AI company's servers
- ✅ AI providers only execute questions - they **never remember** your data
- ✅ You can **export or delete** your entire story anytime
- ✅ Complete privacy by design

---

## 🤖 AI Vendor Independence

LOT uses a revolutionary AI engine abstraction that gives you:

**5 AI Providers Supported:**
1. Together AI - Best for cost ($0.88/M tokens)
2. Google Gemini - Best balance ($1.25/M tokens)
3. Mistral AI - Best for EU privacy ($2/M tokens)
4. Anthropic Claude - Best quality ($3/M tokens)
5. OpenAI GPT-4 - Industry standard ($10/M tokens)

**Auto Mode:** System automatically uses the cheapest available engine, with automatic fallback if one provider has issues.

**Key Innovation:** Switch AI providers mid-conversation without losing ANY context. Your Memory Story stays intact because it lives in LOT's database, not the AI provider's memory.

See `AI-ENGINE-GUIDE.md` for complete documentation.

---

## 📚 Documentation

- **White Paper:** `LOT-self-care-proactive-context-AI-white-paper.txt`
  - Complete philosophy and technical architecture
  - Memory densification vs data accumulation
  - Economic model and unit economics

- **AI Engine Guide:** `AI-ENGINE-GUIDE.md`
  - Setup instructions for all 5 AI engines
  - Configuration and switching guide
  - Cost comparisons

- **Switching Test:** `AI-ENGINE-SWITCHING-TEST.md`
  - Verification that LOT owns memory logic
  - Proof of vendor independence

- **Release Notes:** `RELEASE-NOTES-v0.0.3.md`
  - Complete changelog
  - Deployment history

---

## 🚀 Quick Start

### Run Locally

<details>
  <summary>example.env</summary>

```
NODE_ENV="development"
DEBUG=true

APP_NAME="LOT"
APP_DESCRIPTION="LOT is a subscription service that distributes digital and physical necessities, basic wardrobes, organic self-care products, home and kids essentials."

PORT=4400
APP_HOST="http://127.0.0.1:4400"

# Database
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="lot_systems"
DB_USER="postgres"
DB_PASSWORD="..."

# Authentication
JWT_SECRET="..."
JWT_COOKIE_KEY="auth_token"

# Email (Resend)
RESEND_API_KEY="..."
RESEND_FROM_EMAIL="auth@lot-systems.com"
RESEND_FROM_NAME="LOT Systems"

# Optional - for geocoding
GEONAMES_USERNAME="..."

# Admin emails (comma-separated)
ADMIN_EMAILS="vadikmarmeladov@gmail.com"

# AI Engines (choose at least one)
TOGETHER_API_KEY="..."        # Recommended: cheapest option
GOOGLE_API_KEY="..."          # Good balance
MISTRAL_API_KEY="..."         # EU privacy
ANTHROPIC_API_KEY="..."       # Premium quality
OPENAI_API_KEY="..."          # Industry standard
```

</details>

```bash
# Before running
yarn migrations:up

# Run in development mode:
yarn server:watch
yarn client:watch

# Run in production mode:
yarn production:run
```

---

## 🌐 Production Deployment

**Production URL:** https://lot-systems.com

**Hosted on:** Digital Ocean App Platform

**Auto-Deployment:**
1. Push to your deployment branch
2. Digital Ocean automatically builds and deploys
3. Zero-downtime deployment with health checks

**Monitor:**
- Status page: https://lot-systems.com/status
- Digital Ocean dashboard for logs and metrics

---

## 🎯 Core Features

### For Users:
- 🧘 **Memory Engine** - AI companion that remembers your self-care journey
- 📖 **Memory Story** - Your invaluable vault of personal wellness settings
- 🔄 **Feedback Loops** - Every question builds on previous answers
- 🌍 **Context Awareness** - Questions adapt to time, weather, location
- 🔒 **Privacy First** - Your data stays yours, AI providers are just tools
- 👤 **Public Profile** - Share your System with others (customizable privacy)

### For Developers:
- 🤖 **AI Engine Abstraction** - Switch providers with one line of code
- 💰 **Cost Optimization** - 91% savings possible (Together AI vs OpenAI)
- 🛡️ **Auto-Fallback** - Never goes down, tries multiple engines
- 📊 **Complete Analytics** - Health check system with status monitoring
- 🔧 **TypeScript** - Full type safety across stack

---

## 👤 Public Profile System (v1.0)

### Overview

LOT Systems now features a beautiful public profile system that allows users to share their System with the world while maintaining complete control over their privacy.

### Key Features

**Custom URLs:**
- Create memorable profile URLs: `https://lot-systems.com/u/vadik`
- Falls back to UUID-based URLs if custom URL not set
- Collision-safe: custom URLs are prioritized over ID matching

**Privacy Controls:**
Users can choose what to display on their public profile:
- ✅ **Name** - Always visible
- ✅ **Location** - City and country (optional)
- ✅ **Date** - Current date in readable format
- ✅ **Team Tags** - Professional affiliations (Admin, R&D, Usership, etc.)
- ✅ **Local Time** - Current time in user's timezone
- ✅ **Weather** - Real-time weather conditions
  - Sky conditions
  - Humidity (highlighted blue when ≥50%)
  - Temperature
  - Sunrise/Sunset times
- ✅ **Sound Status** - Current ambient sound settings
- ✅ **Memory Story** - Personal wellness narrative (optional)

**Design Philosophy:**
- **Consistent Styling** - Matches the System tab's Arial typography and spacing
- **Block Components** - Uses the same UI components as the main app
- **24px Spacing** - Identical gap-y-24 spacing for visual rhythm
- **Tag System** - Team tags display with colors (Suspended tags show in red)
- **Responsive Layout** - Works beautifully on all devices
- **Clean Footer** - "This is {Name}'s System powered by LOT" with return link

### Technical Implementation

**API Endpoint:**
```
GET /api/public/profile/:userIdOrUsername
```

**Custom URL Lookup Priority:**
1. Search by custom URL in user metadata
2. Fall back to user ID if custom URL not found
3. Return 404 if neither match

**Type Safety:**
```typescript
type PublicProfile = {
  firstName: string | null;
  lastName: string | null;
  city: string | null;
  country: string | null;
  localTime?: string;
  weather?: Weather;
  soundDescription?: string;
  memoryStory?: string;
  privacySettings: UserPrivacySettings;
  tags?: string[];
}
```

**Privacy Settings:**
```typescript
type UserPrivacySettings = {
  showCity: boolean;
  showLocalTime: boolean;
  showWeather: boolean;
  showSound: boolean;
  showMemoryStory: boolean;
  customUrl?: string;
}
```

### User Experience

**Example Public Profile:**
```
Vadik
Tuesday, 10 December, 2025
Malibu, USA

Team: [Usership] [R&D] [Admin]

Local time:       9:45 AM PST
Weather:          Clear sky
Humidity:         28%
Temperature:      22℃
Sunrise:          6:49 AM
Sunset:           4:46 PM
Sound:            Ocean waves

This is Vadik's System powered by LOT
```

**Navigation:**
- Clean, minimal footer with clickable "LOT" button to return to main app
- No top navigation clutter
- Focus on content, not chrome

### Privacy by Default

**What's NOT Shared (Ever):**
- Password or authentication details
- Email address
- Private logs or journal entries
- Any data marked private in settings
- Payment or subscription information

**User Control:**
Users control every aspect of their public profile through Settings:
- Toggle each section on/off independently
- Set custom URL or use default UUID
- Update profile anytime
- Delete profile completely

### Cache Management

**PWA-Safe Design:**
- Cache-busting CSS version (`?v=20241210-001`)
- Separate entry point for public profiles
- No interference with main app functionality
- Users can switch between app and profiles seamlessly

**Files Involved:**
- `/src/client/components/PublicProfile.tsx` - Main component
- `/src/client/entries/public-profile.tsx` - Entry point
- `/src/server/routes/public-api.ts` - API endpoint
- `/templates/generic-spa.ejs` - HTML template

---

## 💡 The LOT Philosophy

**From data accumulation → TO memory densification**
**From vendor lock-in → TO AI independence**
**From surveillance → TO sovereignty**
**From metrics → TO meaning**

Self-care is not about tracking every data point.
It's about understanding patterns, preferences, and the story of who you're becoming.

**Your story. Your data. Your AI provider of choice.**

That's LOT Systems.

---

## 🤝 Contributing

Interested in:
- Research partnerships on memory densification?
- Adding new AI engine providers?
- Privacy and data sovereignty advocacy?
- Self-care product collaborations?

Contact: support@lot-systems.com

---

## 📄 License

© 2025 LOT Systems. All rights reserved.

---

## 🔗 Links

- **Live App:** https://lot-systems.com
- **Status Page:** https://lot-systems.com/status
- **Documentation:** See `/docs` folder and white paper

---

**Built with care for self-care. 🌱**
