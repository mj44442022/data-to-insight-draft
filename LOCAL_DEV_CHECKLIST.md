# 🔍 LOCAL DEVELOPMENT VALIDATION CHECKLIST

## ⚠️ CRITICAL UNDERSTANDING

**The app has TWO modes:**

### 🏠 LOCAL DEVELOPMENT MODE
- **Blob Token**: NOT available (normal)
- **File Storage**: Base64 in response (fallback)
- **Response Size**: May be large (OK for testing)
- **Why**: Vercel Blob only works in production

### 🚀 PRODUCTION MODE (Vercel)
- **Blob Token**: Auto-provided by Vercel
- **File Storage**: Vercel Blob (URLs)
- **Response Size**: Tiny (<100KB)
- **Why**: Optimized for production

---

## ✅ LOCAL DEVELOPMENT CHECKLIST

| # | Requirement | How to Verify | Expected Result |
|---|-------------|---------------|-----------------|
| **Environment Setup** |
| 1.1 | `.env.local` exists | `ls .env.local` | File exists |
| 1.2 | `GOOGLE_AI_API_KEY` is set | Check .env.local file | Key present |
| 1.3 | `BLOB_READ_WRITE_TOKEN` is MISSING | Check .env.local file | NOT present (expected locally) |
| **Build & Run** |
| 2.1 | Build succeeds | `npm run build` | ✓ Compiled successfully |
| 2.2 | Dev server starts | `npm run dev` | Server running on port 3000 |
| 2.3 | Landing page loads | Visit http://localhost:3000 | Page renders, no console errors |
| 2.4 | Create page loads | Visit /create | Form visible |
| **Content Generation (Local Fallback)** |
| 3.1 | Upload 3-10 images | Drag/drop images | Images appear in preview |
| 3.2 | Fill business description | Type 100+ chars | Character counter works |
| 3.3 | Fill key messages | Type bullet points | Validation passes |
| 3.4 | Click "Generate Content" | Click button | Progress bar appears |
| 3.5 | Wait for generation | Monitor console | "Using fallback: base64" message |
| 3.6 | Carousel preview appears | Check UI | 10 slides visible |
| 3.7 | Script with visual notes | Check reel preview | Visual direction boxes visible |
| 3.8 | Download carousel ZIP | Click download | ZIP downloads (base64 converted) |
| 3.9 | Caption includes SEO keywords | Read caption | 3-5 keywords present |
| 3.10 | No video download button | Check UI | Video button shows "(Unavailable)" |
| **Console Logs to Verify** |
| 4.1 | Titan Agent strategy logged | Browser console | Target Avatar, Purple Cow visible |
| 4.2 | "No Blob token found" warning | Browser console | Warning present (expected) |
| 4.3 | "Using fallback: base64" | Browser console | Fallback confirmed |
| 4.4 | No 500 errors | Browser console | No server errors |

**Local Development Score: If all pass → Ready for production deployment**

---

## 🚀 PRODUCTION DEPLOYMENT CHECKLIST

| # | Requirement | How to Verify | Action if Fails |
|---|-------------|---------------|-----------------|
| **Pre-Deployment** |
| 1.1 | Code pushed to Git | `git status` | Shows "up to date" |
| 1.2 | Build succeeds locally | `npm run build` | Fix TypeScript errors |
| 1.3 | Validation checklist complete | Review above | Fix failing items |
| **Vercel Setup** |
| 2.1 | Project connected to Vercel | Vercel dashboard | Connect repository |
| 2.2 | Environment variables set | Vercel settings | See table below |
| 2.3 | Auto-deploy enabled | Vercel settings | Enable git integration |
| **Environment Variables (Production)** |
| 3.1 | `GOOGLE_AI_API_KEY` | Vercel → Settings → Environment Variables | Add your key |
| 3.2 | `BLOB_READ_WRITE_TOKEN` | **AUTO-PROVIDED** by Vercel | No action needed |
| 3.3 | `NODE_ENV` | Set to `production` | Vercel auto-sets this |
| **Post-Deployment** |
| 4.1 | Deployment succeeds | Vercel dashboard | Check build logs |
| 4.2 | Landing page loads | Visit your-app.vercel.app | Should load instantly |
| 4.3 | Generate content test | Upload images + generate | Should complete in 30-60s |
| 4.4 | Blob URLs working | Check network tab | URLs start with `blob.vercel-storage.com` |
| 4.5 | ZIP download works | Click download | File downloads from Blob |
| 4.6 | Response size < 1MB | Network tab → XHR | Response should be ~50KB |
| 4.7 | Strategy logic logged | Browser console (production) | Target Avatar, SEO keywords visible |

**Production Score: If all pass → Fully deployed! 🎉**

---

## 🛠️ ENVIRONMENT VARIABLES SETUP

### For Local Development (.env.local):
```bash
GOOGLE_AI_API_KEY=your_actual_key_here
# DO NOT ADD BLOB_READ_WRITE_TOKEN locally - it won't work anyway
```

### For Production (Vercel Dashboard):
```
Navigate to: Your Project → Settings → Environment Variables

Add:
  Name: GOOGLE_AI_API_KEY
  Value: [paste your key]
  Environments: ✓ Production ✓ Preview ✓ Development

DO NOT ADD BLOB_READ_WRITE_TOKEN - Vercel adds this automatically!
```

---

## ❌ COMMON ISSUES & FIXES

### Issue: "No token found" in LOCAL development
- ✅ **EXPECTED** - This is normal locally
- ✅ **FIX**: Code should auto-fallback to base64
- ⚠️ **If fallback not working**: See fix below

### Issue: "No token found" in PRODUCTION
- ❌ **NOT EXPECTED** - Vercel should provide this
- 🔧 **FIX**:
  1. Go to Vercel Dashboard
  2. Settings → Storage
  3. Enable Vercel Blob
  4. Redeploy

### Issue: Build fails with TypeScript errors
- 🔧 **FIX**: Run `npm run build` locally first
- 🔧 Check error messages, fix typing issues
- 🔧 Common: Missing interface fields

### Issue: Downloads don't work
- 🔧 **Local**: Check fallback is converting base64 → Blob
- 🔧 **Production**: Check Blob URLs are returned
- 🔧 Verify CORS settings (should be auto-configured)

---

## 🎯 SELF-TEST SCRIPT

Run this to validate everything:

```bash
# 1. Check environment
echo "Checking .env.local..."
[ -f .env.local ] && echo "✅ .env.local exists" || echo "❌ Create .env.local"

# 2. Build
echo "Building..."
npm run build || echo "❌ Build failed - fix errors"

# 3. Start dev server (manual check)
echo "Starting dev server..."
echo "Visit http://localhost:3000/create and test generation"
npm run dev
```

---

## 📋 VALIDATION RESULTS

### Local Development:
- [ ] Environment variables configured
- [ ] Build succeeds
- [ ] Dev server runs
- [ ] Content generation works (with fallback)
- [ ] Downloads work
- [ ] Console shows expected warnings
- [ ] No 500 errors

### Production Deployment:
- [ ] Pushed to Git
- [ ] Vercel connected
- [ ] Environment variables set
- [ ] Deployment succeeds
- [ ] Blob URLs working
- [ ] Response size < 1MB
- [ ] Downloads work
- [ ] No errors in logs

**Status**: If all checked → READY TO DEPLOY! ✅
