# 🚀 Deployment Guide

## Quick Deploy to Vercel (Recommended)

### Method 1: Import from GitHub (Easiest)

1. **Go to Vercel:**  
   https://vercel.com/new

2. **Import Git Repository:**
   - Click "Import Project"
   - Select GitHub
   - Find: `Vegamus/UK-Visa-Check-Simulator-150126`

3. **Configure Project:**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Add Environment Variable:**
   - Key: `VITE_API_KEY`
   - Value: Your Gemini API Key
   - Get one free: https://ai.google.dev/

5. **Deploy!**
   - Click "Deploy"
   - Wait 1-2 minutes
   - Your app will be live!

---

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? uk-visa-simulator
# - Directory? ./
# - Override settings? No

# After deployment, add environment variable:
vercel env add VITE_API_KEY
# Paste your Gemini API key when prompted
# Choose: Production, Preview, Development (all)

# Redeploy with env var
vercel --prod
```

---

## Environment Variables

Required for production:

```
VITE_API_KEY=your_gemini_api_key_here
```

Get your free Gemini API key:
1. Go to https://ai.google.dev/
2. Click "Get API key in Google AI Studio"
3. Create new API key
4. Copy and paste into Vercel

---

## Post-Deployment Checklist

- [ ] Website loads correctly
- [ ] All form steps work
- [ ] AI assessment completes successfully
- [ ] PDF export works
- [ ] Toast notifications appear
- [ ] Mobile responsive
- [ ] No console errors

---

## Troubleshooting

### "API_KEY is not defined"
**Solution:** Make sure you added `VITE_API_KEY` environment variable in Vercel dashboard, then redeploy.

### "Failed to load resource: 404"
**Solution:** Check `vercel.json` configuration. Output directory should be `dist`.

### Build fails
**Solution:** 
```bash
# Test build locally first
npm run build

# Check for errors
npm run preview
```

### AI Assessment fails
**Solution:** 
- Verify API key is correct
- Check Gemini API quota/limits
- Test API key locally first

---

## Custom Domain (Optional)

1. Go to Vercel Dashboard
2. Select your project
3. Settings → Domains
4. Add your custom domain
5. Update DNS records as instructed

---

## Updates & Redeployment

Vercel automatically redeploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Vercel automatically deploys!
```

---

## Performance

Expected Lighthouse scores:
- Performance: 95+
- Accessibility: 90+
- Best Practices: 95+
- SEO: 100

---

## Support

- Vercel Docs: https://vercel.com/docs
- Gemini API: https://ai.google.dev/docs
- GitHub Issues: https://github.com/Vegamus/UK-Visa-Check-Simulator-150126/issues

---

**🎉 Congratulations! Your UK Visa Simulator is now live!**
