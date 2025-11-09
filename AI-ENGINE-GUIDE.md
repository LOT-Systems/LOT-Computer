# AI Engine Abstraction Layer

## Overview

LOT Systems now has a **provider-agnostic AI engine system**. This means:

✅ **LOT owns the Memory densification logic** - Not the AI provider
✅ **Easy switching** between AI providers with one config change
✅ **Automatic fallback** - If one provider fails, try the next
✅ **Future-proof** - Easy to add new AI providers

---

## 📦 Supported AI Engines

### 1. **Together AI** (Recommended)
- **Model:** Meta Llama 3.1 70B Instruct Turbo
- **Speed:** Very fast
- **Cost:** Very affordable (~$0.88/million tokens)
- **Quality:** Excellent for conversational AI
- **Env Var:** `TOGETHER_API_KEY`
- **Get Key:** https://api.together.xyz/

### 2. **Google Gemini**
- **Model:** Gemini 1.5 Pro
- **Speed:** Fast
- **Cost:** Competitive
- **Quality:** Excellent, strong reasoning
- **Env Var:** `GOOGLE_API_KEY`
- **Get Key:** https://aistudio.google.com/app/apikey

### 3. **Anthropic Claude**
- **Model:** Claude 3.5 Sonnet
- **Speed:** Moderate
- **Cost:** Higher ($3/million tokens)
- **Quality:** Excellent, very conversational
- **Env Var:** `ANTHROPIC_API_KEY`
- **Get Key:** https://console.anthropic.com/settings/keys

### 4. **OpenAI GPT-4**
- **Model:** GPT-4 Turbo
- **Speed:** Moderate
- **Cost:** Higher ($10/million tokens)
- **Quality:** Excellent
- **Env Var:** `OPENAI_API_KEY`
- **Get Key:** https://platform.openai.com/api-keys

---

## 🎯 How It Works

### The Memory Logic Stays on LOT's Side

```
┌─────────────────────────────────────┐
│   LOT Systems (YOU own this)       │
│                                     │
│  • Memory densification prompts    │
│  • User story formatting           │
│  • Feedback loop logic             │
│  • Question generation rules       │
└─────────────────────────────────────┘
                  ↓
         Sends prompt to...
                  ↓
┌─────────────────────────────────────┐
│   AI Engine (Interchangeable)      │
│                                     │
│  Together AI / Gemini / Claude...  │
│  • Just executes the prompt        │
│  • Returns completion              │
└─────────────────────────────────────┘
```

**Key Point:** If you switch from Together AI to Gemini, your Memory logic stays exactly the same. Only the execution engine changes.

---

## 🔧 Configuration

### Option 1: Prefer Specific Engine

Edit `/src/server/utils/memory.ts` line 47:

```typescript
// Use Together AI
const AI_ENGINE_PREFERENCE: EnginePreference = 'together'

// Or use Gemini
const AI_ENGINE_PREFERENCE: EnginePreference = 'gemini'

// Or use Claude
const AI_ENGINE_PREFERENCE: EnginePreference = 'claude'

// Or use OpenAI
const AI_ENGINE_PREFERENCE: EnginePreference = 'openai'
```

### Option 2: Auto Mode (Recommended)

```typescript
// Tries engines in order: Together AI → Gemini → Claude → OpenAI
const AI_ENGINE_PREFERENCE: EnginePreference = 'auto'
```

**Auto mode** will:
1. Try Together AI first
2. If not available, try Gemini
3. If not available, try Claude
4. If not available, try OpenAI
5. If none available, use legacy fallback

---

## 🚀 Setup Instructions

### 1. Get API Keys

Choose which AI engines you want to use:

**For Together AI:**
```bash
# Sign up at https://api.together.xyz/
# Copy your API key
# Add to Digital Ocean environment variables:
TOGETHER_API_KEY=your_key_here
```

**For Google Gemini:**
```bash
# Get key at https://aistudio.google.com/app/apikey
# Add to Digital Ocean environment variables:
GOOGLE_API_KEY=your_key_here
```

**For Anthropic Claude:**
```bash
# Get key at https://console.anthropic.com/settings/keys
# Add to Digital Ocean environment variables:
ANTHROPIC_API_KEY=your_key_here
```

**For OpenAI:**
```bash
# Get key at https://platform.openai.com/api-keys
# Add to Digital Ocean environment variables:
OPENAI_API_KEY=your_key_here
```

### 2. Configure Preference

Edit `/src/server/utils/memory.ts`:

```typescript
const AI_ENGINE_PREFERENCE: EnginePreference = 'together' // or 'gemini', 'claude', 'openai', 'auto'
```

### 3. Deploy

```bash
# Build
yarn build

# Commit
git add -A
git commit -m "Configure AI engine preference"

# Push to Digital Ocean
git push origin your-branch

# Force rebuild in DO if needed
```

### 4. Verify

Check logs after deployment:

```
✅ Using AI engine: Together AI
```

or

```
✅ Using AI engine: Google Gemini
```

---

## 📊 Testing Different Engines

### Test Endpoint

Visit: `https://lot-systems.com/api/public/test-ai-engines`

This will show which engines are available and working.

### Compare Outputs

To compare quality between engines:

1. Set preference to 'together'
2. Deploy, test Memory question quality
3. Set preference to 'gemini'
4. Deploy, test Memory question quality
5. Choose your favorite!

---

## 💡 Recommendations

### For Cost-Effectiveness:
**Use Together AI** (`'together'`)
- $0.88/million tokens
- Fast responses
- Great quality for conversational AI

### For Maximum Quality:
**Use Claude** (`'claude'`)
- Most conversational and context-aware
- Best for complex reasoning
- Higher cost but worth it for premium experience

### For Balanced Performance:
**Use Gemini** (`'gemini'`)
- Good balance of cost/quality
- Fast responses
- Strong reasoning capabilities

### For Maximum Reliability:
**Use Auto Mode** (`'auto'`)
- Automatic fallback chain
- Never goes down (uses first available engine)
- Best for production stability

---

## 🔍 How to Add New AI Engines

Want to add Mistral, Cohere, or Groq?

1. Edit `/src/server/utils/ai-engines.ts`
2. Create a new class implementing `AIEngine` interface:

```typescript
export class MistralEngine implements AIEngine {
  name = 'Mistral'

  isAvailable(): boolean {
    return !!process.env.MISTRAL_API_KEY
  }

  async generateCompletion(prompt: string, maxTokens: number): Promise<string> {
    // Call Mistral API
  }
}
```

3. Register in `AIEngineManager`:

```typescript
this.engines.set('mistral', new MistralEngine())
```

4. Update `EnginePreference` type:

```typescript
export type EnginePreference = 'together' | 'gemini' | 'mistral' | ...
```

5. Add to fallback order if desired

---

## 📝 Architecture Benefits

### ✅ Vendor Independence
You're not locked into any single AI provider

### ✅ Cost Optimization
Switch to cheaper providers without changing logic

### ✅ Resilience
Automatic fallback if one provider has issues

### ✅ Quality Testing
Easy to A/B test different models

### ✅ Future-Proof
New AI providers emerge? Add them in minutes

### ✅ LOT Owns the IP
Your memory densification logic stays with you

---

## 🎓 Examples

### Example 1: Use Together AI (Cheapest)

```typescript
const AI_ENGINE_PREFERENCE: EnginePreference = 'together'
```

Add to DO environment:
```bash
TOGETHER_API_KEY=your_key_here
```

### Example 2: Fallback Chain

```typescript
const AI_ENGINE_PREFERENCE: EnginePreference = 'auto'
```

Add to DO environment:
```bash
TOGETHER_API_KEY=your_together_key
GOOGLE_API_KEY=your_google_key
```

System will try Together AI first, fall back to Gemini if Together fails.

### Example 3: Premium Experience

```typescript
const AI_ENGINE_PREFERENCE: EnginePreference = 'claude'
```

Add to DO environment:
```bash
ANTHROPIC_API_KEY=your_claude_key
```

---

## 🐛 Troubleshooting

### Engine Not Available

**Symptom:** Logs show "No AI engines available"

**Solution:**
1. Check environment variables are set in DO
2. Verify API keys are valid
3. Check logs for initialization errors

### Wrong Engine Being Used

**Symptom:** Logs show different engine than expected

**Solution:**
1. Check `AI_ENGINE_PREFERENCE` in memory.ts
2. Ensure preferred engine's API key is set
3. Rebuild and redeploy

### API Key Invalid

**Symptom:** 401 authentication errors

**Solution:**
1. Generate fresh API key from provider
2. Update in DO environment variables (carefully, no spaces)
3. Force rebuild in DO
4. Test with diagnostic endpoint

---

## 📞 Support

- **Together AI Docs:** https://docs.together.ai/
- **Google Gemini Docs:** https://ai.google.dev/docs
- **Anthropic Docs:** https://docs.anthropic.com/
- **OpenAI Docs:** https://platform.openai.com/docs

---

**Remember:** LOT owns the memory logic. AI engines are just tools to execute it. You're in control! 🚀
