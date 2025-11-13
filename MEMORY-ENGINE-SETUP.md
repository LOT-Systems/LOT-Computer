# Memory Engine Setup Guide

## Problem

The Memory Engine is not responding because **no valid AI API keys are configured**.

## Diagnosis

Visit: `https://lot-systems.com/api/public/test-ai-engines`

This will show:
- Which AI engines are available
- Which API keys are configured
- What the issue is

## Quick Fix

The Memory Engine requires **at least ONE valid API key** from any of these providers:

### Option 1: Google Gemini (Recommended - Free Tier Available)
1. Get API key: https://aistudio.google.com/app/apikey
2. Add to environment: `GOOGLE_API_KEY=your_key_here`
3. Cost: Free tier available, then ~$1.25/million tokens

### Option 2: Together AI (Cheapest)
1. Get API key: https://api.together.xyz/
2. Add to environment: `TOGETHER_API_KEY=your_key_here`
3. Cost: ~$0.88/million tokens

### Option 3: OpenAI (Most Common)
1. Get API key: https://platform.openai.com/api-keys
2. Add to environment: `OPENAI_API_KEY=your_key_here`
3. Cost: ~$10/million tokens

### Option 4: Anthropic Claude (Premium)
1. Get API key: https://console.anthropic.com/settings/keys
2. Add to environment: `ANTHROPIC_API_KEY=your_key_here`
3. Cost: ~$3/million tokens

### Option 5: Mistral AI (European/GDPR)
1. Get API key: https://console.mistral.ai/
2. Add to environment: `MISTRAL_API_KEY=your_key_here`
3. Cost: ~$2/million tokens

## How to Add API Key to Digital Ocean

### For Development (.env file):
```bash
# Edit .env file
GOOGLE_API_KEY=your_actual_key_here
# or
TOGETHER_API_KEY=your_actual_key_here
```

### For Production (Digital Ocean):
1. Go to Digital Ocean App Platform
2. Navigate to your app → Settings → App-Level Environment Variables
3. Click "Edit"
4. Add new variable:
   - Key: `GOOGLE_API_KEY` (or another from above)
   - Value: Your actual API key
   - Encrypt: Yes
5. Click "Save"
6. Redeploy the app (or wait for auto-deploy)

## Verification

After adding the API key:

1. Visit: `https://lot-systems.com/api/public/test-ai-engines`
2. Check that at least one engine shows `"available": true`
3. Check that `hasAvailableEngine` is `true`
4. Check that `preferredEngine` shows the engine name (not an error)

## How It Works

The Memory Engine uses an **auto-fallback system**:
1. Tries Together AI first (cheapest)
2. Falls back to Gemini
3. Falls back to Mistral
4. Falls back to Claude
5. Falls back to OpenAI
6. If none available, falls back to hardcoded questions

You only need **ONE** API key - the system will automatically use the first available engine.

## Current Issue

Based on the `.env` file:
- ❌ `ANTHROPIC_API_KEY=your_anthropic_api_key_here` (placeholder)
- ❌ `OPENAI_API_KEY=sk-proj-...` (might be expired/invalid)
- ❌ No other API keys configured

**Solution:** Configure at least one valid API key from the options above.

## Changes Made

1. Added `/api/public/test-ai-engines` endpoint to diagnose issues
2. Added placeholder key detection (ignores keys like "your_...")
3. Improved error logging to show all API key statuses
4. Memory Engine automatically falls back to hardcoded questions if no engines available

## Need Help?

- Check server logs for detailed error messages
- Look for: `❌ Memory question generation failed`
- Error logs now show which API keys are configured
- Visit test endpoint for live diagnosis
