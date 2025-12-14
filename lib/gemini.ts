import { GoogleGenerativeAI } from '@google/generative-ai';

// Use placeholder during build time, real key at runtime
const apiKey = process.env.GOOGLE_AI_API_KEY || 'placeholder-key-for-build';
const genAI = new GoogleGenerativeAI(apiKey);

export interface CarouselSlide {
  slideNumber: number;
  text: string;
  imageIndex: number;
}

export interface ReelScene {
  sceneNumber: number;
  text: string;
  imageIndex: number;
  duration: number;
}

export interface ContentPlan {
  carousel: CarouselSlide[];
  reel: ReelScene[];
  caption: string;
  hashtags: string[];
}

export async function generateContentPlan(
  images: Buffer[],
  description: string,
  keyMessages: string,
  tone: string,
  contentPillar: string
): Promise<ContentPlan> {
  // Runtime check for API key
  if (!process.env.GOOGLE_AI_API_KEY) {
    throw new Error('GOOGLE_AI_API_KEY is not set. Please add it to your .env.local file.');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

  // Shannon's 4 H's Framework guidance based on pillar
  const frameworkGuidance = {
    Heard: `Focus on HEARD pillar - Make the audience feel seen and validated:
- Create inspirational content that shares your brand message
- Use POV posts and pep talks
- Create belonging and emotional connection
- Make it highly shareable and savable
- People should say "I feel seen" when they watch this`,

    Helpful: `Focus on HELPFUL pillar - Give quick wins and bite-sized tips:
- Mini-tutorials and practical how-tos
- "What I'm buying" content
- Instant gratification tips (NOT 10-step guides)
- Keep it actionable and snackable
- Deliver value in seconds, not minutes`,

    Humor: `Focus on HUMOR pillar - Relatable situations that make people tag friends:
- Content that makes people say "I feel seen"
- Pair relatable scenarios with the vibe (don't need actual jokes)
- Tap into shared experiences
- Make it tag-worthy and shareable
- Focus on relatability over comedy`,

    Happenings: `Focus on HAPPENINGS pillar - Behind-the-scenes content:
- Day-in-the-life footage
- Team highlights and client stories
- Personal life moments
- What you're eating, drinking, working on
- Show the human side of your brand`,

    Mixed: `Use a BALANCED approach across all 4 H's:
- Mix inspirational validation (Heard)
- Quick actionable tips (Helpful)
- Relatable moments (Humor)
- Behind-the-scenes authenticity (Happenings)
- Create variety that keeps audience engaged`
  };

  const pillarGuidance = frameworkGuidance[contentPillar as keyof typeof frameworkGuidance] || frameworkGuidance.Mixed;

  const prompt = `You are an expert Instagram content creator following Shannon McKinstrie's proven 4 H's Framework.

ANALYZE these ${images.length} business photos and create scroll-stopping Instagram content.

Business: ${description}
Key Messages: ${keyMessages}
Tone: ${tone}
Content Pillar: ${contentPillar}

${pillarGuidance}

## SHANNON'S UNIVERSAL SUCCESS PRINCIPLES:

**REP Hook Formula** (include at least 2 of these):
- R = Relatable (phrases, words, or identifiers your audience recognizes)
- E = Expertise (builds instant trust and qualifies you as credible)
- P = Personal (adds human connection we all crave)

Hook Templates to Consider:
- "___ I recommend as a ___ who ___"
- "___ I would never ___ as a ___"
- "I'm a ___ and this is the ___ I swear by"
- "I wish more ___ knew ___"

**Voice & Style:**
- Talk like a human, not a brand - use "I, my, me"
- Keep content SIMPLE, SPECIFIC, and SHAREABLE
- Under 10 seconds when possible (attention span = 8 seconds)
- Hook in BOTH video text AND caption
- Display main message all at once (don't reveal slowly)
- Focus on watch-through rate over fancy production

**Content Must:**
- Create instant connection
- Be entertainment + value (not masterclasses)
- Give quick fixes and bite-sized tips
- Make people want to share with friends

Generate:
1. Carousel concept (10 slides):
   - Slide 1: Scroll-stopping hook using REP formula (max 40 chars)
   - Slides 2-9: Value points following ${contentPillar} pillar (max 70 chars each)
   - Slide 10: Clear, actionable CTA (max 40 chars)
   - Each slide text should feel personal and conversational

2. Reel script (5-7 scenes, keep TOTAL under 10 seconds):
   - Scene 1: Powerful hook with REP formula (0.8-1.5 seconds, max 35 chars)
   - Middle scenes: Quick value hits (0.8-1.2 seconds each, max 50 chars)
   - Final scene: Clear CTA (1.0-1.5 seconds, max 35 chars)
   - Use "I/my/me" voice throughout
   - Make it tag-worthy and shareable

3. Instagram caption (150 words, ${tone} tone):
   - Start with the hook from the video
   - Use conversational "I/my/me" language
   - Include call-to-action
   - Make it feel personal, not corporate

4. Hashtags (15 relevant, trending-ready tags)

CRITICAL REQUIREMENTS:
- Text must be PUNCHY and CONVERSATIONAL (like texting a friend)
- Include ${contentPillar} pillar principles
- Use REP formula in hooks
- Keep reel UNDER 10 SECONDS total
- Make it shareable and tag-worthy
- Use the provided images intelligently (reference image index 0-${images.length - 1})

Return ONLY valid JSON in this exact format:
{
  "carousel": [
    {"slideNumber": 1, "text": "Your hook here", "imageIndex": 0},
    {"slideNumber": 2, "text": "Value point 1", "imageIndex": 1},
    {"slideNumber": 3, "text": "Value point 2", "imageIndex": 2},
    {"slideNumber": 4, "text": "Value point 3", "imageIndex": 0},
    {"slideNumber": 5, "text": "Value point 4", "imageIndex": 1},
    {"slideNumber": 6, "text": "Value point 5", "imageIndex": 2},
    {"slideNumber": 7, "text": "Value point 6", "imageIndex": 0},
    {"slideNumber": 8, "text": "Value point 7", "imageIndex": 1},
    {"slideNumber": 9, "text": "Value point 8", "imageIndex": 2},
    {"slideNumber": 10, "text": "CTA here", "imageIndex": 0}
  ],
  "reel": [
    {"sceneNumber": 1, "text": "Hook text", "imageIndex": 0, "duration": 1.5},
    {"sceneNumber": 2, "text": "Benefit 1", "imageIndex": 1, "duration": 1.2},
    {"sceneNumber": 3, "text": "Benefit 2", "imageIndex": 2, "duration": 1.2},
    {"sceneNumber": 4, "text": "Benefit 3", "imageIndex": 0, "duration": 1.2},
    {"sceneNumber": 5, "text": "CTA", "imageIndex": 1, "duration": 1.5}
  ],
  "caption": "Your engaging caption here...",
  "hashtags": ["tag1", "tag2", "tag3"]
}`;

  // Convert images to base64 for Gemini
  const imageParts = images.map((buffer) => ({
    inlineData: {
      data: buffer.toString('base64'),
      mimeType: 'image/jpeg',
    },
  }));

  const result = await model.generateContent([prompt, ...imageParts]);
  const response = await result.response;
  const text = response.text();

  // Extract JSON from response (handle markdown code blocks)
  let jsonText = text.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
  }

  try {
    const contentPlan: ContentPlan = JSON.parse(jsonText);

    // Validate the structure
    if (!contentPlan.carousel || !Array.isArray(contentPlan.carousel) || contentPlan.carousel.length !== 10) {
      throw new Error('Invalid carousel structure');
    }
    if (!contentPlan.reel || !Array.isArray(contentPlan.reel) || contentPlan.reel.length < 5) {
      throw new Error('Invalid reel structure');
    }
    if (!contentPlan.caption || !contentPlan.hashtags) {
      throw new Error('Missing caption or hashtags');
    }

    return contentPlan;
  } catch (error) {
    console.error('Failed to parse Gemini response:', text);
    throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
