import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

// ================================================================
// 🧠 BRAIN: Brand Analysis (Gemini 2.0 Flash)
// Analyzes uploaded photos to understand brand visual identity
// ================================================================

const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';

// ================================================================
// 🔨 WORKER: Image Generation (Imagen 3 via Vertex AI)
// Generates new images based on brand DNA
// ================================================================

const VERTEX_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || '';
const VERTEX_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
const VERTEX_CREDENTIALS = process.env.GOOGLE_CREDENTIALS || ''; // JSON string

// Timeouts and limits
const IMAGE_GENERATION_TIMEOUT = 30000; // 30 seconds per image
const MAX_FAILURES_ALLOWED = 5; // If 5+ images fail, abort

export interface BrandAnalysis {
  colorPalette: string[];
  visualStyle: string;
  photographyStyle: string;
  subjectMatter: string;
  composition: string;
  brandKeywords: string[];
}

// ================================================================
// 🧠 BRAIN: ANALYZE BRAND VISUALS
// Uses Gemini to understand the brand's visual identity
// ================================================================
export async function analyzeBrandVisuals(imageBuffers: Buffer[]): Promise<BrandAnalysis> {
  try {
    console.log('[BRAIN] 🧠 Analyzing brand visuals with Gemini 2.0 Flash...');

    if (!GEMINI_API_KEY) {
      throw new Error('❌ GOOGLE_GENERATIVE_AI_API_KEY is not set');
    }

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

    const { text } = await generateText({
      model: google('gemini-2.0-flash-exp'),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            ...imageBuffers.map(buffer => ({
              type: 'image' as const,
              image: buffer,
            })),
          ],
        },
      ],
    });

    // Clean up response
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
    }

    const analysis: BrandAnalysis = JSON.parse(cleanText);

    console.log('[BRAIN] ✅ Brand DNA extracted:', {
      colors: analysis.colorPalette.join(', '),
      style: analysis.visualStyle,
      keywords: analysis.brandKeywords.join(', ')
    });

    return analysis;

  } catch (error) {
    console.error('[BRAIN] ❌ Analysis failed:', error);

    // Fallback to prevent total crash
    return {
      colorPalette: ['#4A90E2', '#F5A623', '#F8E71C'],
      visualStyle: 'modern and professional',
      photographyStyle: 'clean and bright',
      subjectMatter: 'business and lifestyle',
      composition: 'centered with negative space',
      brandKeywords: ['professional', 'modern', 'trustworthy']
    };
  }
}

// ================================================================
// 🔨 WORKER: GENERATE IMAGE PROMPTS
// Creates detailed prompts for Imagen 3 based on brand DNA
// ================================================================
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
    const concept = extractConcept(text, businessDescription);

    return `Professional ${brandAnalysis.subjectMatter} image for business content. ` +
      `Theme: ${concept}. ` +
      `Style: ${baseStyle}. ` +
      `High-quality, Instagram-ready, brand-consistent visual. ` +
      `No text, no watermarks, clean background.`;
  });
}

function extractConcept(slideText: string, businessDescription: string): string {
  const text = slideText.toLowerCase();

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

  return businessDescription.split(' ').slice(0, 3).join(' ');
}

// ================================================================
// 🔨 WORKER: GENERATE SINGLE IMAGE (Imagen 3 via Vertex AI)
// ================================================================
async function generateSingleImage(
  prompt: string,
  slideNumber: number
): Promise<Buffer> {
  console.log(`[WORKER] 🔨 Generating image ${slideNumber}/10 with Imagen 3 (Vertex AI)...`);
  console.log(`[WORKER] 📝 Prompt length: ${prompt.length} characters`);

  // Pre-flight check
  if (!VERTEX_CREDENTIALS) {
    throw new Error('❌ GOOGLE_CREDENTIALS not set - Vertex AI unavailable');
  }
  if (!VERTEX_PROJECT_ID) {
    throw new Error('❌ GOOGLE_CLOUD_PROJECT not set - Vertex AI unavailable');
  }

  try {
    // Parse service account credentials
    const credentials = JSON.parse(VERTEX_CREDENTIALS);

    // 🔧 FIX: Normalize private key format (fix common Vercel paste issues)
    if (!credentials.private_key) {
      throw new Error('GOOGLE_CREDENTIALS is missing the private_key field');
    }

    // 🔍 DIAGNOSTIC: Log what we received (first 100 chars)
    const pkeyPreview = credentials.private_key.substring(0, 100);
    console.log(`[WORKER] 🔍 Private key preview (first 100 chars): ${pkeyPreview}`);
    console.log(`[WORKER] 🔍 Private key length: ${credentials.private_key.length} characters`);

    // Replace literal \n with actual newlines if they got escaped
    credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');

    // 🔧 FIX: Add missing spaces in BEGIN/END markers (common copy/paste error)
    credentials.private_key = credentials.private_key
      .replace('-----BEGINPRIVATEKEY-----', '-----BEGIN PRIVATE KEY-----')
      .replace('-----ENDPRIVATEKEY-----', '-----END PRIVATE KEY-----');

    // Ensure proper BEGIN/END format
    if (!credentials.private_key.includes('-----BEGIN PRIVATE KEY-----')) {
      throw new Error(
        `Private key missing BEGIN header. ` +
        `Length: ${credentials.private_key.length} chars. ` +
        `Preview: "${credentials.private_key.substring(0, 150)}..."`
      );
    }
    if (!credentials.private_key.includes('-----END PRIVATE KEY-----')) {
      throw new Error('Private key missing END footer - check your GOOGLE_CREDENTIALS format');
    }

    console.log(`[WORKER] 🔑 Private key format validated with proper spacing`);

    // Get OAuth2 access token
    const { GoogleAuth } = require('google-auth-library');
    const auth = new GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    if (!accessToken.token) {
      throw new Error('Failed to obtain access token from Vertex AI');
    }

    // Imagen 3 endpoint via Vertex AI
    const endpoint = `https://${VERTEX_LOCATION}-aiplatform.googleapis.com/v1/projects/${VERTEX_PROJECT_ID}/locations/${VERTEX_LOCATION}/publishers/google/models/imagen-3.0-generate-001:predict`;

    console.log(`[WORKER] 🌐 Calling Vertex AI endpoint: ${endpoint.split('/projects/')[0]}/projects/...`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
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
          aspectRatio: '4:5', // Instagram portrait (1080x1350)
          negativePrompt: 'text, watermark, logo, low quality, blurry, distorted, cartoon, anime',
          // Note: seed parameter removed - not supported with watermarks enabled
        }
      }),
    });

    console.log(`[WORKER] 📡 Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[WORKER] ❌ Vertex AI Error ${response.status}:`, errorText);

      // Parse error for better messaging
      try {
        const errorJson = JSON.parse(errorText);
        console.error(`[WORKER] 📋 Parsed error:`, errorJson);
      } catch (e) {
        // Not JSON, use raw text
      }

      throw new Error(`Vertex AI Imagen 3 failed: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const result = await response.json();
    console.log(`[WORKER] 📦 Response keys:`, Object.keys(result));

    // Extract base64 image from Vertex AI response
    if (!result.predictions || !result.predictions[0] || !result.predictions[0].bytesBase64Encoded) {
      console.error('[WORKER] ❌ Invalid response structure:', JSON.stringify(result, null, 2));
      throw new Error(`Invalid response from Vertex AI - no image data. Got: ${JSON.stringify(result)}`);
    }

    const imageBase64 = result.predictions[0].bytesBase64Encoded;
    const imageBuffer = Buffer.from(imageBase64, 'base64');

    console.log(`[WORKER] ✅ Image ${slideNumber}/10 generated (${(imageBuffer.length / 1024).toFixed(2)}KB)`);

    return imageBuffer;

  } catch (error) {
    console.error(`[WORKER] 💥 Generation error:`, error);
    throw error;
  }
}

// ================================================================
// 🔨 WORKER: GENERATE WITH TIMEOUT
// ================================================================
async function generateImageWithTimeout(
  prompt: string,
  slideNumber: number,
  timeoutMs: number = IMAGE_GENERATION_TIMEOUT
): Promise<Buffer> {
  return Promise.race([
    generateSingleImage(prompt, slideNumber),
    new Promise<Buffer>((_, reject) =>
      setTimeout(() => reject(new Error(`⏱️ Timeout after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

// ================================================================
// 🔨 WORKER: BULLETPROOF BATCH GENERATION
// Generates all images with graceful fallback
// ================================================================
export async function generateCarouselImages(
  brandAnalysis: BrandAnalysis,
  slideTexts: string[],
  businessDescription: string
): Promise<(Buffer | null)[] | null> {
  console.log('[WORKER] 🛡️ Starting bulletproof AI image generation...');

  try {
    // ✅ Pre-flight check: Validate Vertex AI credentials
    if (!VERTEX_CREDENTIALS || !VERTEX_PROJECT_ID) {
      console.error('[WORKER] ❌ Vertex AI not configured');
      console.error('[WORKER] 💡 Missing: GOOGLE_CREDENTIALS or GOOGLE_CLOUD_PROJECT');
      console.error('[WORKER] 💡 See setup guide for instructions');
      return null;
    }

    console.log('[WORKER] ✅ Vertex AI credentials detected');
    console.log('[WORKER] 🏗️ Project:', VERTEX_PROJECT_ID);
    console.log('[WORKER] 🌍 Location:', VERTEX_LOCATION);

    // Generate all prompts
    const prompts = generateImagePrompts(brandAnalysis, slideTexts, businessDescription);
    console.log('[WORKER] 📝 Generated', prompts.length, 'prompts');

    const images: (Buffer | null)[] = [];
    let failureCount = 0;

    // Generate images with rate limiting (2 at a time)
    const batchSize = 2;

    for (let i = 0; i < prompts.length; i += batchSize) {
      const batch = prompts.slice(i, i + batchSize);

      console.log(`[WORKER] 🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(prompts.length / batchSize)}...`);

      // 🛡️ Process batch with individual error handling
      const batchResults = await Promise.all(
        batch.map(async (prompt, index) => {
          const slideNum = i + index + 1;
          try {
            const image = await generateImageWithTimeout(prompt, slideNum);
            return image;
          } catch (error) {
            failureCount++;
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            console.error(`[WORKER] ⚠️ Image ${slideNum}/10 failed:`, errorMsg);

            // Log full error details
            if (error instanceof Error && error.stack) {
              console.error(`[WORKER] 📚 Stack trace:`, error.stack);
            }

            // 🛑 EARLY ABORT: If >50% failed, stop trying
            if (failureCount > MAX_FAILURES_ALLOWED) {
              console.error(`[WORKER] ❌ Too many failures (${failureCount}/${slideNum})`);
              console.error('[WORKER] 💡 Possible issues:');
              console.error('[WORKER]    1. Vertex AI API not enabled in GCP project');
              console.error('[WORKER]    2. Service account lacks permissions');
              console.error('[WORKER]    3. Imagen 3 not available in your region');
              console.error('[WORKER]    4. Quota exceeded');
              console.error('[WORKER] 🔧 Last error:', errorMsg);
              throw new Error(`Too many image generation failures. Last error: ${errorMsg}`);
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
      console.error('[WORKER] ❌ All images failed to generate');
      return null;
    }

    if (successCount < images.length) {
      console.warn(`[WORKER] ⚠️ Partial success: ${successCount}/10 images (${successRate.toFixed(0)}%)`);
      console.warn('[WORKER] 🔄 Some slides will use uploaded photos as fallback');
    } else {
      console.log('[WORKER] ✅ All 10 images generated successfully! 🎉');
    }

    return images;

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[WORKER] ❌ Image generation aborted:', errorMsg);
    console.error('[WORKER] 🔄 Falling back to uploaded images');
    return null;
  }
}
