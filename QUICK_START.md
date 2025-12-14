# 🚀 QUICK START - Deploy in 5 Minutes

Get your Instagram content automation tool live and running FAST.

---

## Option 1: Deploy to Vercel (FASTEST - 3 Steps)

### Step 1: Get Your Gemini API Key (1 minute)
```bash
# Go to: https://aistudio.google.com/app/apikey
# Click "Create API Key"
# Copy the key
```

### Step 2: Deploy to Vercel (2 minutes)
```bash
# Visit: https://vercel.com/new
# Click "Import" on your GitHub repository
# Add Environment Variable:
#   Name: GOOGLE_AI_API_KEY
#   Value: [paste your API key]
# Click "Deploy"
```

### Step 3: Test Your Live Site
```
# Your app is now live at: https://your-project.vercel.app
# Click "Try Free Now" → Upload 3-5 test images → Generate!
```

**✅ DONE! Your app is live.**

---

## Option 2: Local Development (4 Steps)

### Step 1: Install FFmpeg
**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt install ffmpeg
```

**Windows:**
Download from https://ffmpeg.org/download.html

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment
```bash
# Get API key from: https://aistudio.google.com/app/apikey
echo "GOOGLE_AI_API_KEY=your_key_here" > .env.local
```

### Step 4: Run Development Server
```bash
npm run dev
# Open http://localhost:3000
```

**✅ DONE! Test locally at http://localhost:3000**

---

## 🎯 Quick Test Checklist

Once deployed, test with these steps:

1. **Upload 3-5 business photos**
2. **Fill form:**
   - Description: "We help founders automate Instagram content with AI, saving 20+ hours per week on content creation"
   - Key Messages: "• 30X faster\n• No design skills\n• Professional quality"
   - Tone: "Inspiring"
   - Content Pillar: "Helpful" (or try "Mixed")
3. **Click "Generate Content"**
4. **Wait 1-2 minutes**
5. **Download carousel & reel**

---

## 🐛 Troubleshooting

### "GOOGLE_AI_API_KEY is not set"
- **Vercel**: Go to Project Settings → Environment Variables → Add `GOOGLE_AI_API_KEY`
- **Local**: Create `.env.local` file in project root with your API key

### "FFmpeg not found"
- **Vercel**: No action needed (FFmpeg included)
- **Local**: Install FFmpeg (see Step 1 above)

### Build fails
```bash
npm install sharp --force
npm run build
```

### Check API key works
```bash
# Visit: http://localhost:3000/api/health
# or: https://your-app.vercel.app/api/health
# Should show: {"status":"healthy","geminiConfigured":true}
```

---

## 📊 What to Expect

**Generation Time:**
- Small (3 images): ~60-90 seconds
- Medium (5-7 images): ~90-120 seconds
- Large (10 images): ~120-180 seconds

**Output:**
- ✅ 10-slide carousel (1080x1080 PNG) as ZIP
- ✅ 5-7 second reel (1080x1920 MP4, 30fps)
- ✅ AI-generated caption (150 words)
- ✅ 15 relevant hashtags

**Cost (Gemini API):**
- FREE for first 1,500 requests/day
- Paid: ~$0.05 per generation
- Monthly: ~$10-20 for 1,000 generations

---

## 🎨 Shannon's 4 H's Framework

The app uses Shannon McKinstrie's proven Instagram framework:

**Content Pillars:**
- **HEARD** - Inspirational content that makes audience feel seen
- **HELPFUL** - Quick wins and bite-sized actionable tips
- **HUMOR** - Relatable moments that get shared
- **HAPPENINGS** - Behind-the-scenes authenticity
- **MIXED** - Balanced approach across all pillars

**REP Hook Formula:**
- **R**elatable - Words/phrases your audience recognizes
- **E**xpertise - Builds instant trust and credibility
- **P** ersonal - Human connection ("I/my/me" voice)

**Key Principles:**
- Under 10 seconds for reels (attention span = 8 seconds)
- Conversational voice, not corporate
- Simple, Specific, Shareable
- Entertainment + Value (not masterclasses)

---

## 🔄 Next Steps

### After Testing:
1. **Customize branding** (colors in `tailwind.config.ts`)
2. **Add your logo** (in `public/` folder)
3. **Update landing page** (edit `app/page.tsx`)
4. **Share feedback** - What features do you need?

### Production Tips:
- Monitor Vercel logs for errors
- Check Gemini API usage at https://aistudio.google.com
- Test with different content pillars
- Save successful outputs for reference

---

## 🚨 Emergency Support

If something breaks:

1. **Check Vercel deployment logs**
2. **Verify environment variable is set**
3. **Test API health endpoint**
4. **Review browser console (F12)**
5. **Check server logs** for `[GENERATE]` prefix

**Common Issues:**
- 500 error → Check API key is valid
- Timeout → Images too large or too many
- Bad output → Try different content pillar
- No video → FFmpeg issue (local only)

---

## ✅ Success!

You now have a production-ready Instagram content automation tool using:
- ✅ Shannon's proven 4 H's Framework
- ✅ REP Hook Formula for engagement
- ✅ Professional error handling
- ✅ Cost-effective AI ($0.05/generation)
- ✅ Under-10-second optimized reels

**Start creating scroll-stopping content in 2 minutes!** 🚀
