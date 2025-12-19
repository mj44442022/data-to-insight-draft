import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIGenerationError } from './errors';

const apiKey = process.env.GOOGLE_AI_API_KEY || 'placeholder-key-for-build';
const genAI = new GoogleGenerativeAI(apiKey);

// Vertex AI configuration
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || '';
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

// Timeouts and limits
const IMAGE_GENERATION_TIMEOUT = 30000; // 30 seconds per image
const MAX_FAILURES_ALLOWED = 5; // If 5+ images fail, abort and use uploaded photos

export interface BrandAnalysis {
  colorPalette: string[];
  visualStyle: string;
  photographyStyle: string;
  subjectMatter: string;
  composition: string;
  brandKeywords: string[];
}

/**
 * Analyze uploaded photos to extract brand visual patterns
 * This creates a "brand DNA" that guides AI image generation
 */
export async function analyzeBrandVisuals(imageBuffers: Buffer[]): Promise<BrandAnalysis> {
  try {
    console.log('[IMAGEN] Analyzing brand visuals from uploaded photos...');

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Convert images to base64 for Gemini
    const imageParts = imageBuffers.map((buffer) => ({
      inlineData: {
        data: buffer.toString('base64'),
        mimeType: 'image/jpeg',
      },
    }));

    const prompt = `# BRAND VISUAL ANALYSIS TASK

You are a professional brand designer analyzing these ${imageBuffers.length} business photos to extract the visual brand identity.

Analyze and identify:

1. **Color Palette**: What are the 3-5 dominant colors? (Use descriptive names like "navy blue", "warm coral", "sage green")
2. **Visual Style**: Overall aesthetic (e.g., "minimalist", "vibrant and energetic", "professional corporate", "warm and organic")
3. **Photography Style**: Shooting approach (e.g., "clean product shots", "lifestyle photography", "candid workspace", "high-contrast studio")
4. **Subject Matter**: Main focus (e.g., "technology products", "people and team", "food and dining", "architecture and spaces")
5. **Composition**: Framing patterns (e.g., "centered subjects", "rule of thirds", "negative space", "close-up details")
6. **Brand Keywords**: 3-5 visual descriptors (e.g., "modern", "trustworthy", "innovative", "approachable")

Return ONLY valid JSON in this exact format:
{
  "colorPalette": ["navy blue", "warm coral", "soft cream"],
  "visualStyle": "minimalist and modern",
  "photographyStyle": "clean product shots with soft shadows",
  "subjectMatter": "technology products and workspace",
  "composition": "centered subjects with ample negative space",
  "brandKeywords": ["modern", "professional", "clean", "trustworthy"]
}`;

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    let text = response.text().trim();

    // Extract JSON from markdown code blocks
    if (text.startsWith('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/```\n?/g, '').replace(/```\n?$/g, '');
    }

    const analysis: BrandAnalysis = JSON.parse(text);

    console.log('[IMAGEN] ✅ Brand analysis complete:', {
      colors: analysis.colorPalette.join(', '),
      style: analysis.visualStyle,
      keywords: analysis.brandKeywords.join(', ')
    });

    return analysis;
  } catch (error) {
    console.error('[IMAGEN] Brand analysis failed:', error);
    throw new AIGenerationError(
      `Failed to analyze brand visuals: ${error instanceof Error ? error.message : 'Unknown error'}`,
      false
    );
  }
}

/**
 * Generate image prompts for carousel slides based on brand analysis
 */
export function generateImagePrompts(
  brandAnalysis: BrandAnalysis,
  slideTexts: string[],
  businessDescription: string
): string[] {
  const baseStyle = `${brandAnalysis.visualStyle} style, ${brandAnalysis.photographyStyle}, ` +
    `featuring ${brandAnalysis.colorPalette.slice(0, 3).join(' and ')} color palette, ` +
    `${brandAnalysis.composition} composition, ` +
    `${brandAnalysis.brandKeywords.join(', ')} aesthetic`;

  return slideTexts.map((text, index) => {
    // Extract key concept from slide text
    const concept = extractConcept(text, businessDescription);

    return `Professional ${brandAnalysis.subjectMatter} image for business content. ` +
      `Theme: ${concept}. ` +
      `Style: ${baseStyle}. ` +
      `High-quality, Instagram-ready, brand-consistent visual. ` +
      `No text, no watermarks, clean background.`;
  });
}

/**
 * Extract the main concept from slide text for image generation
 */
function extractConcept(slideText: string, businessDescription: string): string {
  // Remove common filler words and extract key themes
  const text = slideText.toLowerCase();

  // Simple concept extraction
  if (text.includes('grow') || text.includes('scale') || text.includes('increase')) {
    return 'growth and success';
  }
  if (text.includes('team') || text.includes('people') || text.includes('collaboration')) {
    return 'teamwork and collaboration';
  }
  if (text.includes('innovation') || text.includes('technology') || text.includes('future')) {
    return 'innovation and technology';
  }
  if (text.includes('customer') || text.includes('client') || text.includes('service')) {
    return 'customer experience';
  }
  if (text.includes('strategy') || text.includes('plan') || text.includes('approach')) {
    return 'strategy and planning';
  }

  // Fallback to business description theme
  return businessDescription.split(' ').slice(0, 3).join(' ');
}

/**
 * Generate a single image with timeout protection
 */
async function generateImageWithTimeout(
  prompt: string,
  slideNumber: number,
  timeoutMs: number = IMAGE_GENERATION_TIMEOUT
): Promise<Buffer> {
  return Promise.race([
    generateImage(prompt, slideNumber),
    new Promise<Buffer>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

/**
 * Generate a single image using Google Imagen 3 via Vertex AI
 */
export async function generateImage(
  prompt: string,
  slideNumber: number
): Promise<Buffer> {
  try {
    console.log(`[IMAGEN] Generating image ${slideNumber}/10 with Imagen 3...`);

    // Check for required environment variables
    if (!PROJECT_ID || !process.env.GOOGLE_CREDENTIALS) {
      throw new AIGenerationError(
        'Vertex AI credentials not configured. Set GOOGLE_CLOUD_PROJECT and GOOGLE_CREDENTIALS in Vercel environment variables.',
        false
      );
    }

    // Vertex AI REST API endpoint for Imagen 3
    const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagen-3.0-generate-001:predict`;

    // Get access token from Vertex AI SDK
    const authHeader = await getAuthHeader();

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: prompt
          }
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: '4:5', // Instagram portrait ratio (1080x1350)
          negativePrompt: 'text, watermark, logo, low quality, blurry, distorted, cartoon, anime',
          seed: slideNumber, // Consistent generation for same slide
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[IMAGEN] API Error ${response.status}:`, errorText);
      throw new AIGenerationError(
        `Imagen 3 API failed: ${response.status} ${response.statusText}`,
        response.status === 429 || response.status >= 500
      );
    }

    const result = await response.json();

    // Extract base64 image from response
    if (!result.predictions || !result.predictions[0] || !result.predictions[0].bytesBase64Encoded) {
      throw new AIGenerationError('Invalid response from Imagen 3 API - no image data', false);
    }

    const imageBase64 = result.predictions[0].bytesBase64Encoded;
    const imageBuffer = Buffer.from(imageBase64, 'base64');

    console.log(`[IMAGEN] ✅ Image ${slideNumber}/10 generated (${(imageBuffer.length / 1024).toFixed(2)}KB)`);

    return imageBuffer;
  } catch (error) {
    console.error(`[IMAGEN] Image generation failed for slide ${slideNumber}:`, error);

    // Preserve AIGenerationError if already thrown
    if (error instanceof AIGenerationError) {
      throw error;
    }

    throw new AIGenerationError(
      `Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      false
    );
  }
}

/**
 * Get authentication header for Vertex AI API
 */
async function getAuthHeader(): Promise<string> {
  try {
    const credsJson = process.env.GOOGLE_CREDENTIALS;
    if (!credsJson) {
      throw new Error('GOOGLE_CREDENTIALS not set');
    }

    // Parse credentials JSON from environment variable
    const credentials = JSON.parse(credsJson);

    // For serverless, we'll use Google Auth Library with parsed credentials
    const { GoogleAuth } = require('google-auth-library');
    const auth = new GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    if (!accessToken.token) {
      throw new Error('Failed to obtain access token');
    }

    return `Bearer ${accessToken.token}`;
  } catch (error) {
    console.error('[IMAGEN] Auth failed:', error);
    throw new AIGenerationError(
      `Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
      'Ensure GOOGLE_CREDENTIALS contains valid service account JSON.',
      false
    );
  }
}

/**
 * 🛡️ BULLETPROOF IMAGE GENERATION with graceful degradation
 *
 * Safeguards:
 * 1. Individual try/catch for each image (one failure doesn't kill all)
 * 2. Timeout protection (30s per image)
 * 3. Failure tracking (abort if >50% fail)
 * 4. Never throws - returns null or mixed Buffer/null array
 * 5. Returns null if generation is impossible or credentials missing
 */
export async function generateCarouselImages(
  brandAnalysis: BrandAnalysis,
  slideTexts: string[],
  businessDescription: string
): Promise<(Buffer | null)[] | null> {
  console.log('[IMAGEN] 🛡️ Starting bulletproof AI image generation...');

  try {
    // Pre-flight check: validate credentials
    if (!PROJECT_ID || !process.env.GOOGLE_CREDENTIALS) {
      console.warn('[IMAGEN] Missing credentials - skipping AI generation');
      return null;
    }

    // Generate all prompts
    const prompts = generateImagePrompts(brandAnalysis, slideTexts, businessDescription);
    const images: (Buffer | null)[] = [];
    let failureCount = 0;

    // Generate images with rate limiting (2 at a time)
    const batchSize = 2;

    for (let i = 0; i < prompts.length; i += batchSize) {
      const batch = prompts.slice(i, i + batchSize);

      // 🛡️ Process batch with individual error handling
      const batchResults = await Promise.all(
        batch.map(async (prompt, index) => {
          const slideNum = i + index + 1;
          try {
            // Try to generate with timeout
            const image = await generateImageWithTimeout(prompt, slideNum);
            return image;
          } catch (error) {
            failureCount++;
            console.warn(`[IMAGEN] ⚠️ Image ${slideNum}/10 failed:`, error instanceof Error ? error.message : 'Unknown');

            // 🛡️ EARLY ABORT: If >50% failed, stop trying
            if (failureCount > MAX_FAILURES_ALLOWED) {
              console.error(`[IMAGEN] ❌ Too many failures (${failureCount}/${slideNum}) - aborting AI generation`);
              throw new Error('Too many image generation failures');
            }

            return null;
          }
        })
      );

      images.push(...batchResults);

      // Delay between batches (rate limiting)
      if (i + batchSize < prompts.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // 🛡️ Check results
    const successCount = images.filter(img => img !== null).length;
    const successRate = (successCount / images.length) * 100;

    if (successCount === 0) {
      console.error('[IMAGEN] ❌ All images failed to generate');
      return null;
    }

    if (successCount < images.length) {
      console.warn(`[IMAGEN] ⚠️ Partial success: ${successCount}/10 images generated (${successRate.toFixed(0)}%)`);
      console.warn('[IMAGEN] Some slides will use uploaded photos as fallback');
    } else {
      console.log('[IMAGEN] ✅ All 10 images generated successfully!');
    }

    // Return images (mix of AI-generated and null for fallback)
    return images;

  } catch (error) {
    console.error('[IMAGEN] ❌ Image generation aborted:', error);
    return null;
  }
}
