import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

// 🔑 ONE API KEY FOR EVERYTHING
const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';

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

// ---------------------------------------------------------
// STEP 1: ANALYZE BRAND VISUALS (Gemini 2.0 Flash)
// ---------------------------------------------------------
export async function analyzeBrandVisuals(imageBuffers: Buffer[]): Promise<BrandAnalysis> {
  try {
    console.log('[BRAND-ANALYSIS] 🔍 Analyzing brand visuals with Gemini 2.0 Flash...');

    if (!API_KEY) {
      throw new Error('❌ GOOGLE_GENERATIVE_AI_API_KEY is not set in environment variables');
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

    // Clean up response (remove markdown code blocks)
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
    }

    const analysis: BrandAnalysis = JSON.parse(cleanText);

    console.log('[BRAND-ANALYSIS] ✅ Analysis complete:', {
      colors: analysis.colorPalette.join(', '),
      style: analysis.visualStyle,
      keywords: analysis.brandKeywords.join(', ')
    });

    return analysis;

  } catch (error) {
    console.error('[BRAND-ANALYSIS] ❌ Failed:', error);
    console.error('[BRAND-ANALYSIS] 💡 Tip: Check that GOOGLE_GENERATIVE_AI_API_KEY is set correctly');

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

// ---------------------------------------------------------
// STEP 2: GENERATE IMAGE PROMPTS
// ---------------------------------------------------------
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

// ---------------------------------------------------------
// STEP 3: GENERATE SINGLE IMAGE (Imagen 3 via AI Studio)
// ---------------------------------------------------------
async function generateSingleImage(
  prompt: string,
  slideNumber: number
): Promise<Buffer> {
  console.log(`[IMAGE-GEN] 🎨 Generating image ${slideNumber}/10 with Imagen 3...`);

  if (!API_KEY) {
    throw new Error('❌ GOOGLE_GENERATIVE_AI_API_KEY is not set');
  }

  // 🌐 Imagen 3 endpoint via Google AI Studio (Simple API)
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${API_KEY}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
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
        aspectRatio: '4:5', // Instagram portrait ratio
        negativePrompt: 'text, watermark, logo, low quality, blurry, distorted, cartoon, anime',
        seed: slideNumber,
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[IMAGE-GEN] ❌ API Error ${response.status}:`, errorText);
    throw new Error(`Imagen 3 API failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();

  // Extract base64 image from response
  if (!result.predictions || !result.predictions[0] || !result.predictions[0].bytesBase64Encoded) {
    console.error('[IMAGE-GEN] ❌ Invalid API response:', JSON.stringify(result));
    throw new Error('Invalid response from Imagen 3 API - no image data');
  }

  const imageBase64 = result.predictions[0].bytesBase64Encoded;
  const imageBuffer = Buffer.from(imageBase64, 'base64');

  console.log(`[IMAGE-GEN] ✅ Image ${slideNumber}/10 generated (${(imageBuffer.length / 1024).toFixed(2)}KB)`);

  return imageBuffer;
}

// ---------------------------------------------------------
// STEP 4: GENERATE WITH TIMEOUT
// ---------------------------------------------------------
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

// ---------------------------------------------------------
// STEP 5: BULLETPROOF BATCH GENERATION
// ---------------------------------------------------------
export async function generateCarouselImages(
  brandAnalysis: BrandAnalysis,
  slideTexts: string[],
  businessDescription: string
): Promise<(Buffer | null)[] | null> {
  console.log('[IMAGE-GEN] 🛡️ Starting bulletproof AI image generation...');

  try {
    // 🔍 Pre-flight check: validate API key
    if (!API_KEY) {
      console.error('[IMAGE-GEN] ❌ GOOGLE_GENERATIVE_AI_API_KEY not set');
      console.error('[IMAGE-GEN] 💡 Set this in Vercel: Project Settings → Environment Variables');
      console.error('[IMAGE-GEN] 💡 Get key from: https://aistudio.google.com/app/apikey');
      return null;
    }

    console.log('[IMAGE-GEN] ✅ API key detected:', API_KEY.substring(0, 10) + '...');

    // Generate all prompts
    const prompts = generateImagePrompts(brandAnalysis, slideTexts, businessDescription);
    console.log('[IMAGE-GEN] 📝 Generated', prompts.length, 'prompts');

    const images: (Buffer | null)[] = [];
    let failureCount = 0;

    // Generate images with rate limiting (2 at a time)
    const batchSize = 2;

    for (let i = 0; i < prompts.length; i += batchSize) {
      const batch = prompts.slice(i, i + batchSize);

      console.log(`[IMAGE-GEN] 🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(prompts.length / batchSize)}...`);

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
            console.warn(`[IMAGE-GEN] ⚠️ Image ${slideNum}/10 failed:`, errorMsg);

            // 🛑 EARLY ABORT: If >50% failed, stop trying
            if (failureCount > MAX_FAILURES_ALLOWED) {
              console.error(`[IMAGE-GEN] ❌ Too many failures (${failureCount}/${slideNum})`);
              console.error('[IMAGE-GEN] 💡 Possible issues:');
              console.error('[IMAGE-GEN]    1. API key lacks Imagen 3 access');
              console.error('[IMAGE-GEN]    2. Quota exceeded');
              console.error('[IMAGE-GEN]    3. Imagen 3 not available in your region');
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
      console.error('[IMAGE-GEN] ❌ All images failed to generate');
      console.error('[IMAGE-GEN] 💡 Check the errors above for details');
      return null;
    }

    if (successCount < images.length) {
      console.warn(`[IMAGE-GEN] ⚠️ Partial success: ${successCount}/10 images (${successRate.toFixed(0)}%)`);
      console.warn('[IMAGE-GEN] 🔄 Will use uploaded photos as fallback for failed slides');
    } else {
      console.log('[IMAGE-GEN] ✅ All 10 images generated successfully! 🎉');
    }

    return images;

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[IMAGE-GEN] ❌ Image generation aborted:', errorMsg);
    console.error('[IMAGE-GEN] 🔄 Falling back to uploaded images');
    return null;
  }
}
