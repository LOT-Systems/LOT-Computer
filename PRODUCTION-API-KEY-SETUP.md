# Production API Key Setup Required

## Development is Ready ✓

The Anthropic API key has been added to your local `.env` file and the Memory Engine should now work in development.

## Production Setup Needed

**IMPORTANT:** To make the Memory Engine work in production (on Digital Ocean), you need to add the API key as an environment variable.

### Steps for Digital Ocean:

1. **Go to Digital Ocean App Platform**
   - Navigate to: https://cloud.digitalocean.com/apps
   - Select your `lot-systems` app

2. **Add Environment Variable**
   - Go to: Settings → App-Level Environment Variables
   - Click "Edit"
   - Add new variable:
     - **Key:** `ANTHROPIC_API_KEY`
     - **Value:** `sk-ant-api03-mUyBScB4JoNdfYJm1rA8zPv_bitstkNpfa9LZnvur6D8Hi6WYUEwvdmYStLlmzOmJxKa3hYESub-wvqPsLVETg-TP4RhQAA`
     - **Encrypt:** Yes (recommended)
   - Click "Save"

3. **Redeploy**
   - Digital Ocean will automatically redeploy your app
   - Or manually trigger a deployment
   - Wait for deployment to complete (~3-5 minutes)

4. **Verify**
   - Visit: `https://lot-systems.com/api/public/test-ai-engines`
   - Check that Claude engine shows `"available": true`
   - Check that `preferredEngine` is "Claude"

### Alternative: Use Another AI Provider

If you prefer, you can use a different AI provider instead of Claude:

**Google Gemini (Free tier available):**
- Get key: https://aistudio.google.com/app/apikey
- Add: `GOOGLE_API_KEY=your_key_here`

**Together AI (Cheapest):**
- Get key: https://api.together.xyz/
- Add: `TOGETHER_API_KEY=your_key_here`

**OpenAI:**
- Get key: https://platform.openai.com/api-keys
- Add: `OPENAI_API_KEY=your_key_here`

The system will automatically use whichever engine is available.

## Security Note

- The API key in this file is for your reference
- `.env` file is in `.gitignore` and will NOT be committed to git
- Make sure to encrypt the key in Digital Ocean settings
- Never commit API keys to git repositories

## Testing After Setup

Once you've added the key to Digital Ocean:

1. **Check diagnostics:**
   ```bash
   curl https://lot-systems.com/api/public/test-ai-engines
   ```

2. **Test Memory feature:**
   - Log in to your account with "Usership" tag
   - Navigate to the System page
   - Wait for a Memory prompt to appear
   - It should show an AI-generated personalized question

3. **Check server logs:**
   - Look for: `✅ Using AI engine: Claude`
   - Should NOT see: `❌ Memory question generation failed`

## Current Status

- ✅ Local development configured
- ⏳ Production setup pending (needs Digital Ocean env var)
- ✅ Build successful
- ✅ Diagnostic endpoint added
- ✅ Error logging improved

Next step: Add API key to Digital Ocean as described above.
