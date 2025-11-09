# LOT Systems

**Self-care through proactive context-aware AI**

---

## 🌟 What is LOT?

LOT is a subscription service that distributes digital and physical necessities, basic wardrobes, organic self-care products, home and kids essentials.

But more importantly, LOT features the **Memory Engine** - a revolutionary AI-powered self-care companion that follows up on your wellness routines like a coach, and even more, like a life partner who truly knows you.

---

## 💎 The Memory Engine: Your Personal Self-Care Vault

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

### For Developers:
- 🤖 **AI Engine Abstraction** - Switch providers with one line of code
- 💰 **Cost Optimization** - 91% savings possible (Together AI vs OpenAI)
- 🛡️ **Auto-Fallback** - Never goes down, tries multiple engines
- 📊 **Complete Analytics** - Health check system with status monitoring
- 🔧 **TypeScript** - Full type safety across stack

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
