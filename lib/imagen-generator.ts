import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIGenerationError } from './errors';

const apiKey = process.env.GOOGLE_AI_API_KEY || 'placeholder-key-for-build';
const genAI = new GoogleGenerativeAI(apiKey);

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

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

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

  // Simple concept extraction (you can enhance this with NLP)
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
 * Generate a single image using Google Imagen 3
 * NOTE: Imagen 3 is available via Vertex AI, not directly through generative-ai SDK
 * This requires Google Cloud project setup with Vertex AI enabled
 */
export async function generateImage(
  prompt: string,
  slideNumber: number
): Promise<Buffer> {
  try {
    console.log(`[IMAGEN] Generating image for slide ${slideNumber}...`);

    // IMPORTANT: Imagen 3 requires Vertex AI API
    // For now, we'll return a placeholder until Vertex AI is set up
    // The user will need to:
    // 1. Enable Vertex AI API in Google Cloud Console
    // 2. Set up authentication (GOOGLE_APPLICATION_CREDENTIALS)
    // 3. Install @google-cloud/aiplatform package

    throw new AIGenerationError(
      'Imagen 3 requires Vertex AI setup. Please enable Vertex AI API in Google Cloud Console. ' +
      'For now, falling back to uploaded images.',
      false
    );

    // TODO: Implement Imagen 3 API call when Vertex AI is enabled
    // const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagen-3.0-generate-001:predict`;
    // const response = await fetch(endpoint, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${accessToken}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     instances: [{ prompt }],
    //     parameters: {
    //       sampleCount: 1,
    //       aspectRatio: '4:5', // Instagram portrait
    //       negativePrompt: 'text, watermark, low quality, blurry',
    //     },
    //   }),
    // });

  } catch (error) {
    console.error(`[IMAGEN] Image generation failed for slide ${slideNumber}:`, error);
    throw error;
  }
}
