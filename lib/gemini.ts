import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIGenerationError, ValidationError, retryWithBackoff, isRetryableError } from './errors';

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
    return 'gemini-1.5-pro'; // Default for build
  }

  // Only attempt validation once to avoid repeated failures
  if (modelValidationAttempted) {
    throw new AIGenerationError(
      'Model validation failed previously. Please check your API key and available models.',
      false
    );
  }

  modelValidationAttempted = true;

  try {
    console.log('[GEMINI] Validating available models...');

    // Fetch available models using REST API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!response.ok) {
      const isRetryable = response.status === 429 || response.status === 503 || response.status === 504;
      throw new AIGenerationError(
        `Failed to fetch models: ${response.status} ${response.statusText}`,
        isRetryable
      );
    }

    const data = await response.json();

    if (!data.models || !Array.isArray(data.models)) {
      throw new AIGenerationError('Invalid response from models API', false);
    }

    // Filter models that support generateContent
    const availableModels = data.models
      .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m: any) => m.name.replace('models/', ''));

    console.log('[GEMINI] Available models:', availableModels.join(', '));

    // Preferred models in order of preference (Pro model for higher quality)
    const preferredModels = [
      'gemini-1.5-pro',
      'gemini-1.5-pro-latest',
      'gemini-1.5-pro-001',
      'gemini-pro',
      'gemini-1.5-flash-001'
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

    throw new AIGenerationError('No suitable Gemini models available for content generation', false);
  } catch (error) {
    console.error('[GEMINI] Model validation failed:', error);

    // Preserve AIGenerationError if already thrown
    if (error instanceof AIGenerationError) {
      throw error;
    }

    throw new AIGenerationError(
      `Failed to validate Gemini model: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
      'Please check your API key at https://aistudio.google.com/app/apikey and ensure the Generative Language API is enabled.',
      false
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
    throw new ValidationError('GOOGLE_AI_API_KEY is not set. Please add it to your .env.local file.', 'apiKey');
  }

  // Validate and get the best available model (with retry for network errors)
  const modelName = await retryWithBackoff(
    async () => await getValidatedModel(),
    {
      maxRetries: 2,
      initialDelay: 1000,
      onRetry: (error, attempt) => {
        console.log(`[GEMINI] Model validation retry ${attempt}/2: ${error.message}`);
      }
    }
  );
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
You are an Elite B2B Growth Strategist & Copywriter (Ex-McKinsey, Ex-YCombinator). Your expertise is creating high-conversion Instagram content for professional audiences.

# CORE WRITING PRINCIPLES

**Tone:** Authoritative. Professional. Direct. High-Value.
**Voice:** Clear, confident, data-driven. No fluff.
**Forbidden:**
- STRICTLY NO slang (e.g., "huevón", "wey", "parce", "dude", "bro", "gonna", "wanna")
- STRICTLY NO emojis in the teleprompter script
- STRICTLY NO aggressive or casual language
- STRICTLY NO unnecessary exclamation marks

**Writing Standards:**
- Use formal, polished English
- Write for decision-makers and professionals
- Prioritize clarity and credibility over relatability
- Every word must add value

# CONTENT GENERATION TASK

Analyze these ${images.length} business photos and create professional Instagram content.

**CONTEXT:**
Business: ${description}
Key Messages: ${keyMessages}
Tone: ${tone}
Content Pillar: ${contentPillar}

${pillarGuidance}

# OUTPUT REQUIREMENTS

Generate:

1. **STRATEGY LOGIC:**
   - Target Avatar: Who is this for? (Be specific: "Series A founders in SaaS", not "entrepreneurs")
   - The 4-H Bucket: ${contentPillar}
   - Value Proposition: What concrete value does this provide?
   - SEO Keywords: 3-5 specific industry keywords

2. **Carousel (10 slides):**
   - Slide 1: Strong hook (max 50 characters, clear value proposition)
   - Slides 2-9: Key insights or steps (max 70 characters each, professional language)
   - Slide 10: Clear CTA (max 50 characters)
   - **IMAGE DISTRIBUTION**: Cycle through all ${images.length} images evenly (0,1,2,0,1,2...)
   - Use ALL images at least once
   - NEVER repeat the same image more than twice consecutively

3. **Teleprompter Script (3-4 segments, TOTAL under 60 words):**
   - **CRITICAL**: Total word count across ALL segments MUST be under 60 words
   - Segment 1: Hook (10-15 words max)
   - Segments 2-3: Key points (12-18 words each)
   - Final segment: CTA (8-12 words max)
   - Each segment includes "visualNote" field: camera angle, body language, props
   - Use professional, direct language
   - NO emojis, NO slang, NO casual phrases
   - **IMAGE DISTRIBUTION**: Cycle through available images across segments
   - Example word count: Hook (12) + Point 1 (15) + Point 2 (16) + CTA (10) = 53 words ✅

4. **Instagram caption (120-150 words, ${tone} tone):**
   - Professional opening hook
   - Include 3-5 SEO keywords naturally
   - Clear value proposition
   - ONE specific call-to-action
   - Professional but engaging tone

5. **Hashtags (12-15 professional, industry-relevant tags)**

# QUALITY VALIDATION CHECKLIST

Before finalizing, verify:
- [ ] NO slang or casual language anywhere
- [ ] NO emojis in the teleprompter script
- [ ] Teleprompter script is under 60 words TOTAL
- [ ] All language is professional and authoritative
- [ ] Images distributed evenly across all outputs
- [ ] All ${images.length} images used at least once

Return ONLY valid JSON in this exact format:
{
  "strategyLogic": {
    "targetAvatar": "Series A SaaS founders scaling from $1M to $10M ARR",
    "fourHBucket": "${contentPillar}",
    "purpleCowAngle": "Data-backed growth strategies enterprise competitors ignore",
    "seoKeywords": ["B2B growth", "SaaS scaling", "revenue optimization"]
  },
  "carousel": [
    {"slideNumber": 1, "text": "The 3 metrics killing your SaaS growth", "imageIndex": 0},
    {"slideNumber": 2, "text": "Customer acquisition cost rose 62% in 2024", "imageIndex": 1},
    {"slideNumber": 3, "text": "Lifetime value declined 31% year-over-year", "imageIndex": 2},
    {"slideNumber": 4, "text": "Focus on retention over acquisition", "imageIndex": 0},
    {"slideNumber": 5, "text": "Implement quarterly value reviews", "imageIndex": 1},
    {"slideNumber": 6, "text": "Track product engagement weekly", "imageIndex": 2},
    {"slideNumber": 7, "text": "Build customer success playbooks", "imageIndex": 0},
    {"slideNumber": 8, "text": "Automate onboarding workflows", "imageIndex": 1},
    {"slideNumber": 9, "text": "Result: 40% higher retention in 90 days", "imageIndex": 2},
    {"slideNumber": 10, "text": "Download the full framework", "imageIndex": 0}
  ],
  "reel": [
    {"sceneNumber": 1, "text": "Most SaaS companies track the wrong metrics.", "imageIndex": 0, "duration": 2.0, "visualNote": "Close-up, direct camera, serious expression"},
    {"sceneNumber": 2, "text": "Focus on customer retention, not just acquisition.", "imageIndex": 1, "duration": 2.5, "visualNote": "Medium shot, gesture to emphasize retention"},
    {"sceneNumber": 3, "text": "Implement quarterly value reviews with every customer.", "imageIndex": 2, "duration": 2.5, "visualNote": "Show dashboard or data visualization"},
    {"sceneNumber": 4, "text": "Download the complete playbook in bio.", "imageIndex": 0, "duration": 2.0, "visualNote": "Back to close-up, confident smile, point"}
  ],
  "caption": "Your professional caption here with SEO keywords naturally integrated...",
  "hashtags": ["B2BGrowth", "SaaSMetrics", "RevenueOptimization"]
}`;

  // Convert images to base64 for Gemini
  const imageParts = images.map((buffer) => ({
    inlineData: {
      data: buffer.toString('base64'),
      mimeType: 'image/jpeg',
    },
  }));

  // Call Gemini API with retry logic for rate limits and network errors
  const result = await retryWithBackoff(
    async () => await model.generateContent([prompt, ...imageParts]),
    {
      maxRetries: 3,
      initialDelay: 2000,
      maxDelay: 15000,
      onRetry: (error, attempt) => {
        console.log(`[GEMINI] Content generation retry ${attempt}/3: ${error.message}`);
        if (error.message.includes('429') || error.message.includes('rate limit')) {
          console.log('[GEMINI] Rate limit detected - backing off...');
        }
      }
    }
  );

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
      throw new ValidationError('Invalid strategy logic structure - missing targetAvatar', 'strategyLogic');
    }
    if (!contentPlan.carousel || !Array.isArray(contentPlan.carousel) || contentPlan.carousel.length !== 10) {
      throw new ValidationError(
        `Invalid carousel structure - expected 10 slides, got ${contentPlan.carousel?.length || 0}`,
        'carousel'
      );
    }
    if (!contentPlan.reel || !Array.isArray(contentPlan.reel) || contentPlan.reel.length < 3 || contentPlan.reel.length > 4) {
      throw new ValidationError(
        `Invalid reel structure - expected 3-4 segments, got ${contentPlan.reel?.length || 0}`,
        'reel'
      );
    }
    // Validate visual notes in reel scenes
    const hasVisualNotes = contentPlan.reel.every(scene => scene.visualNote && scene.visualNote.length > 0);
    if (!hasVisualNotes) {
      console.warn('[GEMINI] Warning: Some reel scenes missing visual notes');
    }
    if (!contentPlan.caption || !contentPlan.hashtags) {
      throw new ValidationError('Missing caption or hashtags in AI response', 'caption');
    }

    console.log('[GEMINI] ✅ Titan Content Agent strategy:', {
      avatar: contentPlan.strategyLogic.targetAvatar,
      purpleCow: contentPlan.strategyLogic.purpleCowAngle,
      seoKeywords: contentPlan.strategyLogic.seoKeywords
    });

    return contentPlan;
  } catch (error) {
    console.error('[GEMINI] Failed to parse Gemini response:', text.substring(0, 200) + '...');

    // Preserve ValidationError if already thrown
    if (error instanceof ValidationError) {
      throw error;
    }

    // Check if JSON parsing failed
    if (error instanceof SyntaxError) {
      throw new AIGenerationError(
        `Failed to parse AI response as JSON: ${error.message}. AI may have returned malformed content.`,
        true // Retryable - AI might succeed on next attempt
      );
    }

    throw new AIGenerationError(
      `Failed to validate AI response: ${error instanceof Error ? error.message : 'Unknown error'}`,
      false
    );
  }
}
