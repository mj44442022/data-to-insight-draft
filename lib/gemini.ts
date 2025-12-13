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
  tone: string
): Promise<ContentPlan> {
  // Runtime check for API key
  if (!process.env.GOOGLE_AI_API_KEY) {
    throw new Error('GOOGLE_AI_API_KEY is not set. Please add it to your .env.local file.');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Analyze these ${images.length} business photos and create Instagram content.

Business: ${description}
Key Messages: ${keyMessages}
Tone: ${tone}

Generate:
1. Carousel concept (10 slides):
   - Slide 1: Attention-grabbing hook (max 50 chars)
   - Slides 2-9: Value points, benefits, features (max 80 chars each)
   - Slide 10: Clear CTA (max 50 chars)

2. Reel script (5-7 scenes, 1-2 seconds each):
   - Scene 1: Hook (first 3 seconds critical, max 50 chars)
   - Middle scenes: Key benefits (max 60 chars each)
   - Final scene: CTA (max 40 chars)

3. Instagram caption (150 words, engaging, ${tone} tone)

4. Hashtags (15 relevant tags)

IMPORTANT:
- Keep text short and punchy for visual appeal
- Use the provided images intelligently (reference image index 0-${images.length - 1})
- Make the hook compelling and scroll-stopping
- Ensure CTA is clear and actionable

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
