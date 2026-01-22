import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_AI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
  try {
    const { platform, currentContent, adjustmentInstructions, originalArticle } = await req.json();

    if (!platform || !adjustmentInstructions || !originalArticle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = generateRegenerationPrompt(
      platform,
      originalArticle,
      currentContent,
      adjustmentInstructions
    );

    console.log(`[REGENERATE] Regenerating ${platform} with instructions: ${adjustmentInstructions}`);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const newContent = parsePlatformResponse(platform, text);

    return NextResponse.json(newContent);
  } catch (error) {
    console.error('[REGENERATE] Error:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate content' },
      { status: 500 }
    );
  }
}

function generateRegenerationPrompt(
  platform: string,
  originalArticle: string,
  currentContent: any,
  adjustmentInstructions: string
): string {
  const currentText = typeof currentContent?.text === 'string'
    ? currentContent.text
    : JSON.stringify(currentContent);

  const basePrompt = `Eres un experto en ${platform} content. Tienes que MEJORAR el contenido existente basándote en las instrucciones del usuario.

ARTÍCULO ORIGINAL:
${originalArticle}

CONTENIDO ACTUAL:
${currentText}

INSTRUCCIONES DE AJUSTE:
${adjustmentInstructions}

IMPORTANTE:
- Aplica SOLO los cambios solicitados en las instrucciones
- Mantén el resto del contenido similar
- No reinventes todo desde cero
- Respeta el formato original
`;

  switch (platform) {
    case 'linkedin':
      return `${basePrompt}

FORMATO: Devuelve SOLO el texto del post mejorado, sin etiquetas ni metadata.
RESTRICCIONES: 200-300 palabras, hook fuerte, storytelling, CTA.`;

    case 'instagram':
      return `${basePrompt}

FORMATO: Devuelve SOLO el caption mejorado, sin etiquetas ni metadata.
RESTRICCIONES: 150-200 palabras, hook, value, emojis estratégicos, hashtags, CTA.`;

    case 'reel':
      return `${basePrompt}

FORMATO JSON: Devuelve un array JSON con esta estructura:
[
  {"timestamp": "[0-3s]", "text": "..."},
  {"timestamp": "[3-10s]", "text": "..."},
  ...
]

DEVUELVE SOLO EL JSON, sin texto adicional.
RESTRICCIONES: 30 segundos máximo, texto corto y punchy.`;

    case 'stories':
      return `${basePrompt}

FORMATO JSON: Devuelve un array JSON con esta estructura:
[
  {"text": "...", "visual": "..."},
  {"text": "...", "visual": "..."},
  ...
]

DEVUELVE SOLO EL JSON, sin texto adicional.
RESTRICCIONES: 3-5 slides, máximo 30 palabras por slide.`;

    case 'whatsapp':
      return `${basePrompt}

FORMATO: Devuelve SOLO el mensaje mejorado, sin etiquetas ni metadata.
RESTRICCIONES: Máximo 100 palabras, tono personal, emojis naturales.`;

    default:
      return basePrompt;
  }
}

function parsePlatformResponse(platform: string, text: string): any {
  // Try to parse JSON for platforms that return structured data
  if (platform === 'reel' || platform === 'stories') {
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        if (platform === 'reel') {
          return {
            text: JSON.stringify(parsed),
            script: parsed,
          };
        } else if (platform === 'stories') {
          return {
            text: JSON.stringify(parsed),
            slides: parsed,
          };
        }
      }
    } catch (e) {
      console.error(`[REGENERATE] Failed to parse ${platform} JSON:`, e);
    }
  }

  // For standard text platforms
  return {
    text: text.trim(),
  };
}
