import { GoogleGenerativeAI } from '@google/generative-ai';

// Use placeholder during build time, real key at runtime
const apiKey = process.env.GOOGLE_AI_API_KEY || 'placeholder-key-for-build';
const genAI = new GoogleGenerativeAI(apiKey);

// Model validation cache
let validatedModel: string | null = null;
let modelValidationAttempted = false;

/**
 * Validates that a Gemini model exists and is available for content generation.
 * Falls back to known working models if the preferred model is not available.
 */
async function getValidatedModel(): Promise<string> {
  // Return cached model if already validated
  if (validatedModel) {
    return validatedModel;
  }

  // Don't validate during build time
  if (apiKey === 'placeholder-key-for-build') {
    return 'gemini-1.5-flash-001'; // Default for build
  }

  // Only attempt validation once to avoid repeated failures
  if (modelValidationAttempted) {
    throw new Error('Model validation failed previously. Please check your API key and available models.');
  }

  modelValidationAttempted = true;

  try {
    console.log('[GEMINI] Validating available models...');

    // Fetch available models using REST API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.models || !Array.isArray(data.models)) {
      throw new Error('Invalid response from models API');
    }

    // Filter models that support generateContent
    const availableModels = data.models
      .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m: any) => m.name.replace('models/', ''));

    console.log('[GEMINI] Available models:', availableModels.join(', '));

    // Preferred models in order of preference
    const preferredModels = [
      'gemini-1.5-flash-001',
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-pro-vision',
      'gemini-pro'
    ];

    // Find the first available preferred model
    for (const preferred of preferredModels) {
      if (availableModels.includes(preferred)) {
        validatedModel = preferred;
        console.log('[GEMINI] Using validated model:', validatedModel);
        return validatedModel;
      }
    }

    // If no preferred model found, use the first available multimodal model
    const multimodalModel = availableModels.find((m: string) =>
      m.includes('flash') || m.includes('vision') || m.includes('pro')
    );

    if (multimodalModel && typeof multimodalModel === 'string') {
      validatedModel = multimodalModel;
      console.log('[GEMINI] Using fallback model:', validatedModel);
      return validatedModel;
    }

    throw new Error('No suitable Gemini models available for content generation');
  } catch (error) {
    console.error('[GEMINI] Model validation failed:', error);
    throw new Error(
      `Failed to validate Gemini model: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
      'Please check your API key at https://aistudio.google.com/app/apikey and ensure the Generative Language API is enabled.'
    );
  }
}

export interface StrategyLogic {
  targetAvatar: string;
  fourHBucket: string;
  purpleCowAngle: string;
  seoKeywords: string[];
}

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
  visualNote: string; // NEW: Visual direction for recording
}

export interface ContentPlan {
  strategyLogic: StrategyLogic; // NEW: Titan Content Agent strategy
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

  // Validate and get the best available model
  const modelName = await getValidatedModel();
  const model = genAI.getGenerativeModel({ model: modelName });

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

  const prompt = `# ROLE DEFINITION
You are the "Titan Content Agent." Your purpose is to generate high-performance social media content by synthesizing the methodologies of Seth Godin (Marketing Philosophy), Kevin Kelly (Audience Theory), Tim Ferriss (Efficiency/Testing), and Shannon McKinstrie (Tactical Execution).

# CORE OPERATING PRINCIPLES (THE "WHY")
1. **The True Fan Directive (Kelly/Godin):** Never write for "everyone." Write for the "Smallest Viable Audience." Content must be specific enough to exclude people. If it appeals to everyone, it appeals to no one.
2. **The Generosity Filter (Godin):** Content is not "content"—it is an act of generosity. It must solve a problem or validate a feeling.
3. **The 80/20 Hook (Ferriss):** 80% of the content's success depends on the Hook (Headline/First 3 Seconds). You must prioritize the hook above the body.
4. **The Remarkable Test (Godin):** Avoid the "safe center." If the content is not a "Purple Cow" (worth making a remark about), discard it.

# THE GENERATION FRAMEWORK

ANALYZE these ${images.length} business photos and create remarkable, scroll-stopping Instagram content.

**CONTEXT:**
Business: ${description}
Key Messages: ${keyMessages}
Tone: ${tone}
Content Pillar: ${contentPillar}

${pillarGuidance}

## PHASE 1: CATEGORIZATION (The McKinstrie 4-H Sort)
Select ONE of the following content buckets based on the goal:
* **HEARD (Validation):** "I see you." Focus on shared struggles/beliefs. Metric = Shares.
* **HELPFUL (Education):** "Here is how." Focus on quick wins/tutorials. Metric = Saves.
* **HUMOR (Relief):** "This is us." Focus on inside jokes/irony. Metric = Shares/Replies.
* **HAPPENINGS (Trust):** "This is me." Focus on BTS/Vulnerability. Metric = DMs/Views.

**Selected Bucket for this generation:** ${contentPillar}

## PHASE 2: FORMAT OPTIMIZATION (Instagram Algorithm)
* **If HEARD/HUMOR:** Generate a Static Carousel with powerful hook
* **If HELPFUL:** Generate a Value-Packed Carousel with quick wins
* **If HAPPENINGS:** Generate an Authentic Carousel with behind-the-scenes moments
* **MANDATORY:** Include 3-5 specific SEO keywords naturally in the caption (not just in hashtags).

## PHASE 3: THE FERRISS DECONSTRUCTION (Writing Rules)
1. **The Hook (CRITICAL):** Must be startling, contrarian, or immediately valuable. Use "Negative Space" (what people are afraid to say).
2. **The Body:** Use simple language (Grade 6 level). Cut "fluff" words (adverbs, passive voice).
3. **The Call to Action (CTA):** ONE specific request per post. (e.g., "Comment 'YES' for the link," not "Like, share, and subscribe").

**REP Hook Formula** (include at least 2 of these):
- R = Relatable (phrases, words, or identifiers your audience recognizes)
- E = Expertise (builds instant trust and qualifies you as credible)
- P = Personal (adds human connection we all crave)

Hook Templates (Purple Cow - Contrarian):
- "Most ___ are wrong about ___. Here's why..."
- "I stopped ___ and my ___ doubled"
- "___ won't tell you this, but..."
- "The ___ nobody talks about: ___"

Generate:

1. **STRATEGY LOGIC (Purple Cow Validation):**
   - Target Avatar: Who is this SPECIFICALLY for? (Be narrow, not broad)
   - The 4-H Bucket: Which pillar dominates? (${contentPillar})
   - The "Purple Cow" Angle: What makes this remarkable/contrarian/worth sharing?
   - SEO Keywords: 3-5 specific keywords to include naturally

2. **Carousel concept (10 slides):**
   - Slide 1: SCROLL-STOPPING hook using Purple Cow + REP formula (max 40 chars, must be contrarian/surprising)
   - Slides 2-9: Value points following ${contentPillar} pillar (max 70 chars each, simple language)
   - Slide 10: ONE specific CTA (max 40 chars)
   - **CRITICAL**: Distribute images EVENLY across all 10 slides
   - Use ALL ${images.length} images at least once
   - Pattern: Cycle through images (0,1,2,0,1,2...) for visual variety
   - NEVER use the same image more than 2 times in a row

3. **Reel script WITH VISUAL DIRECTION NOTES (5-7 scenes, TOTAL under 10 seconds):**
   - Scene 1: Powerful Purple Cow hook (0.8-1.5 seconds, max 35 chars)
   - Middle scenes: Quick value hits (0.8-1.2 seconds each, max 50 chars)
   - Final scene: ONE clear CTA (1.0-1.5 seconds, max 35 chars)
   - **NEW REQUIREMENT:** Each scene MUST include "visualNote" field describing what should be on screen
   - Visual notes should describe: camera angle, body language, props, text overlay, transitions
   - Use "I/my/me" voice throughout
   - **CRITICAL**: Distribute images across ALL scenes - cycle through available images

4. **Instagram caption (150 words, ${tone} tone):**
   - Start with the Purple Cow hook
   - Include 3-5 SEO keywords naturally (from strategy logic)
   - Use conversational "I/my/me" language
   - Include ONE specific call-to-action
   - Make it feel personal, not corporate

5. **Hashtags (15 relevant, trending-ready tags)**

CRITICAL IMAGE DISTRIBUTION RULES:
- You have ${images.length} images available (indices 0-${images.length - 1})
- MUST cycle through ALL images evenly
- DO NOT repeat the same image more than twice consecutively
- Example for 3 images: [0,1,2,0,1,2,0,1,2,0] ✅
- Example WRONG: [0,0,0,1,1,1,2,2,2,0] ❌

PURPLE COW TEST (Before finalizing):
- Is the hook contrarian or surprising? (Not generic)
- Would someone share this with a friend? (Remarkable)
- Does it exclude some people? (Specific, not broad)
- Does it solve a problem OR validate a feeling? (Generosity)

Return ONLY valid JSON in this exact format:
{
  "strategyLogic": {
    "targetAvatar": "Specific narrow audience description",
    "fourHBucket": "${contentPillar}",
    "purpleCowAngle": "What makes this content remarkable/contrarian/shareable",
    "seoKeywords": ["keyword1", "keyword2", "keyword3"]
  },
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
    {"sceneNumber": 1, "text": "Hook text", "imageIndex": 0, "duration": 1.5, "visualNote": "Close-up, direct to camera, confident eye contact"},
    {"sceneNumber": 2, "text": "Benefit 1", "imageIndex": 1, "duration": 1.2, "visualNote": "Medium shot, hand gesture for emphasis"},
    {"sceneNumber": 3, "text": "Benefit 2", "imageIndex": 2, "duration": 1.2, "visualNote": "Product/service in action, quick transition"},
    {"sceneNumber": 4, "text": "Benefit 3", "imageIndex": 0, "duration": 1.2, "visualNote": "Over-the-shoulder angle, show results"},
    {"sceneNumber": 5, "text": "CTA", "imageIndex": 1, "duration": 1.5, "visualNote": "Back to close-up, smile, point to CTA button"}
  ],
  "caption": "Your engaging caption here with SEO keywords naturally integrated...",
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
    if (!contentPlan.strategyLogic || !contentPlan.strategyLogic.targetAvatar) {
      throw new Error('Invalid strategy logic structure');
    }
    if (!contentPlan.carousel || !Array.isArray(contentPlan.carousel) || contentPlan.carousel.length !== 10) {
      throw new Error('Invalid carousel structure');
    }
    if (!contentPlan.reel || !Array.isArray(contentPlan.reel) || contentPlan.reel.length < 5) {
      throw new Error('Invalid reel structure');
    }
    // Validate visual notes in reel scenes
    const hasVisualNotes = contentPlan.reel.every(scene => scene.visualNote && scene.visualNote.length > 0);
    if (!hasVisualNotes) {
      console.warn('[GEMINI] Warning: Some reel scenes missing visual notes');
    }
    if (!contentPlan.caption || !contentPlan.hashtags) {
      throw new Error('Missing caption or hashtags');
    }

    console.log('[GEMINI] ✅ Titan Content Agent strategy:', {
      avatar: contentPlan.strategyLogic.targetAvatar,
      purpleCow: contentPlan.strategyLogic.purpleCowAngle,
      seoKeywords: contentPlan.strategyLogic.seoKeywords
    });

    return contentPlan;
  } catch (error) {
    console.error('Failed to parse Gemini response:', text);
    throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
