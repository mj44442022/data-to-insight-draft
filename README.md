# ContentOS - AI Instagram Automation

Transform photos into Instagram carousels and reels in 2 minutes. Built for founders who need to 30X their content productivity.

## Features

- **10-slide carousel generation** (1080x1080 PNG)
- **5-7 second reel creation** (1080x1920 MP4, 30fps)
- **AI-generated captions and hashtags**
- **30X faster** than manual content creation
- **Professional quality** output with text overlays
- **Zero design skills** required

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **AI**: Google Gemini 2.0 Flash (multimodal, cheapest)
- **Image Processing**: Sharp
- **Video Creation**: FFmpeg (fluent-ffmpeg)
- **Deployment**: Vercel (free tier)

## Local Setup

### Prerequisites

- Node.js 18.17 or higher
- FFmpeg installed on your system
- Google Gemini API key

### Install FFmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**Windows:**
Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd data-to-insight-draft
```

2. **Install dependencies**
```bash
npm install
```

3. **Get your Gemini API key**
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Click "Create API Key"
   - Copy the key

4. **Create environment file**
```bash
echo "GOOGLE_AI_API_KEY=your_api_key_here" > .env.local
```

5. **Run development server**
```bash
npm run dev
```

6. **Open in browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel (FREE)

### Method 1: Vercel Dashboard (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Click "Deploy"

3. **Add Environment Variable**
   - Go to Project Settings → Environment Variables
   - Add `GOOGLE_AI_API_KEY` with your API key
   - Redeploy the project

4. **Done!** Your app is live at `your-project.vercel.app`

### Method 2: Vercel CLI

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

4. **Set environment variable**
```bash
vercel env add GOOGLE_AI_API_KEY production
```

5. **Deploy to production**
```bash
vercel --prod
```

## Usage

1. **Upload 3-10 images** of your business/product
2. **Add business description** (100-500 characters)
3. **Add key messages** (bullet points)
4. **Select tone** (Professional, Casual, Inspiring, Educational)
5. **Click "Generate Content"**
6. **Wait 1-2 minutes** for AI processing
7. **Download**:
   - Carousel (ZIP with 10 slides)
   - Reel (MP4 video)
   - Copy caption and hashtags
8. **Post to Instagram**

## Project Structure

```
content-automation/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── create/page.tsx             # Upload interface
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   └── api/
│       ├── generate/route.ts       # Main generation endpoint
│       └── health/route.ts         # Health check
├── components/
│   ├── upload-form.tsx             # Upload UI
│   ├── preview-carousel.tsx        # Carousel preview
│   ├── preview-reel.tsx            # Reel preview
│   └── download-buttons.tsx        # Download UI
├── lib/
│   ├── gemini.ts                   # Gemini API client
│   ├── image-processor.ts          # Sharp image utilities
│   └── video-creator.ts            # FFmpeg video generation
├── .env.local                      # Environment variables (create this)
├── .env.example                    # Environment template
└── package.json
```

## Cost Breakdown

### Development & Hosting
- **Vercel Hosting**: $0/month (free tier)
- **Next.js**: Free (open source)

### AI API Costs
- **Google Gemini 2.0 Flash**:
  - Free tier: 1500 requests/day
  - Paid: ~$0.05 per generation
- **Monthly estimate** (1000 generations): $10-20

### Total Cost
- **Development**: $0
- **Hosting**: $0/month
- **Production**: ~$10-20/month (1000 generations)

## Environment Variables

Create a `.env.local` file with:

```env
GOOGLE_AI_API_KEY=your_gemini_api_key_here
```

Get your API key from: https://aistudio.google.com/app/apikey

## Troubleshooting

### Build Errors

**Problem**: "Cannot find module 'sharp'"
```bash
npm install sharp --force
```

**Problem**: "FFmpeg not found"
- Make sure FFmpeg is installed and in your system PATH
- Test: `ffmpeg -version`

**Problem**: TypeScript errors
```bash
npm run build
```

### Runtime Errors

**Problem**: "GOOGLE_AI_API_KEY is not set"
- Create `.env.local` file
- Add your API key
- Restart dev server

**Problem**: Generation timeout
- Increase timeout in `app/api/generate/route.ts`
- Currently set to 300 seconds (5 minutes)

**Problem**: Out of memory
- Reduce image sizes before upload
- Limit to 3-5 images for testing

## Performance

- **Generation time**: 1-2 minutes (depends on image count)
- **Carousel creation**: ~20 seconds
- **Reel video**: ~30-60 seconds
- **AI analysis**: ~30-40 seconds

## Limitations

- **Max images**: 10 per generation
- **Max image size**: 10MB per image
- **Generation timeout**: 5 minutes (Vercel limit)
- **Concurrent requests**: Limited by API rate limits

## Future Enhancements

- Add authentication
- Save generation history
- Batch processing
- Custom fonts and colors
- Audio for reels
- Direct Instagram posting
- Analytics dashboard

## Support

For issues and questions:
- Check the troubleshooting section
- Review Vercel deployment logs
- Verify FFmpeg installation
- Check Gemini API quota

## License

MIT

## Built For

Andrés Bilbao (Rappi co-founder) and founders who need to automate content creation and save 20+ hours per week.

---

**Ready to 30X your content creation?** Deploy now and start generating!
