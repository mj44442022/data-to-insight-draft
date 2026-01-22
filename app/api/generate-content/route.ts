import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_AI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
  try {
    const { article, additionalContext } = await req.json();

    if (!article || article.trim().length < 100) {
      return new Response(
        JSON.stringify({ error: 'Article must be at least 100 characters' }),
        { status: 400 }
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

          // Generate content for all platforms
          const platforms = ['linkedin', 'instagram', 'reel', 'stories', 'whatsapp'];
          const generatedContent: any = {
            originalArticle: article,
            additionalContext,
          };

          for (const platform of platforms) {
            const prompt = generatePromptForPlatform(platform, article, additionalContext);

            // Send progress update
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'progress', platform })}\n\n`)
            );

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            generatedContent[platform] = parsePlatformResponse(platform, text);
          }

          // Send complete event
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'complete', content: generatedContent })}\n\n`)
          );

          controller.close();
        } catch (error) {
          console.error('[GENERATE-CONTENT] Error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'Generation failed' })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[GENERATE-CONTENT] Request error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate content' }),
      { status: 500 }
    );
  }
}

function generatePromptForPlatform(platform: string, article: string, additionalContext?: string): string {
  const contextNote = additionalContext ? `\n\nCONTEXTO ADICIONAL: ${additionalContext}` : '';

  switch (platform) {
    case 'linkedin':
      return `Eres un experto en LinkedIn content. Convierte este artículo en un post de LinkedIn PROFESIONAL.

ARTÍCULO:
${article}${contextNote}

REQUISITOS:
- 200-300 palabras
- Hook inicial MUY fuerte (primera línea debe atrapar)
- Storytelling profesional
- Formato fácil de leer (párrafos cortos, espacios)
- CTA al final
- Tono: profesional pero auténtico

FORMATO:
Devuelve SOLO el texto del post, sin etiquetas ni metadata.`;

    case 'instagram':
      return `Eres un experto en Instagram content. Convierte este artículo en un caption de Instagram IMPACTANTE.

ARTÍCULO:
${article}${contextNote}

REQUISITOS:
- 150-200 palabras
- Hook en primera línea
- Value rápido y claro
- Emojis estratégicos (no abuses)
- 3-5 hashtags relevantes al final
- CTA claro
- Tono: personal, auténtico

FORMATO:
Devuelve SOLO el texto del caption, sin etiquetas ni metadata.`;

    case 'reel':
      return `Eres un experto en Instagram Reels. Convierte este artículo en un SCRIPT para Reel de 30 segundos.

ARTÍCULO:
${article}${contextNote}

REQUISITOS:
- Duración: 30 segundos máximo
- Formato: [timestamp]: texto
- Estructura: Hook → Value → CTA
- Texto corto y punchy
- Cada segmento debe ser visual

FORMATO JSON:
Devuelve un array JSON con esta estructura:
[
  {"timestamp": "[0-3s]", "text": "Hook impactante aquí"},
  {"timestamp": "[3-10s]", "text": "Value punto 1"},
  {"timestamp": "[10-15s]", "text": "Value punto 2"},
  {"timestamp": "[15-25s]", "text": "Value punto 3"},
  {"timestamp": "[25-30s]", "text": "CTA fuerte"}
]

DEVUELVE SOLO EL JSON, sin texto adicional.`;

    case 'stories':
      return `Eres un experto en Instagram Stories. Convierte este artículo en 3-5 SLIDES para Stories.

ARTÍCULO:
${article}${contextNote}

REQUISITOS:
- 3-5 slides
- Cada slide: máximo 30 palabras
- Texto grande y legible
- Sugerencia de visual por slide
- Estructura: Hook → Value → CTA

FORMATO JSON:
Devuelve un array JSON con esta estructura:
[
  {"text": "Texto del slide 1", "visual": "Sugerencia de visual (ej: emoji grande, gráfico)"},
  {"text": "Texto del slide 2", "visual": "Sugerencia de visual"},
  ...
]

DEVUELVE SOLO EL JSON, sin texto adicional.`;

    case 'whatsapp':
      return `Eres un experto en comunicación por WhatsApp. Convierte este artículo en un MENSAJE para WhatsApp.

ARTÍCULO:
${article}${contextNote}

REQUISITOS:
- Máximo 100 palabras
- Tono MUY personal (como si fuera de amigo a amigo)
- Emojis naturales (2-3)
- Hook en primera línea
- Value rápido
- CTA sutil

FORMATO:
Devuelve SOLO el texto del mensaje, sin etiquetas ni metadata.`;

    default:
      return article;
  }
}

function parsePlatformResponse(platform: string, text: string): any {
  // Try to parse JSON for platforms that return structured data
  if (platform === 'reel' || platform === 'stories') {
    try {
      // Extract JSON from response (might have extra text)
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        if (platform === 'reel') {
          return {
            text: JSON.stringify(parsed),
            script: parsed,
            currentVersion: 1,
            versions: [JSON.stringify(parsed)],
          };
        } else if (platform === 'stories') {
          return {
            text: JSON.stringify(parsed),
            slides: parsed,
            currentVersion: 1,
            versions: [JSON.stringify(parsed)],
          };
        }
      }
    } catch (e) {
      console.error(`[GENERATE-CONTENT] Failed to parse ${platform} JSON:`, e);
    }
  }

  // For standard text platforms
  return {
    text: text.trim(),
    currentVersion: 1,
    versions: [text.trim()],
  };
}
