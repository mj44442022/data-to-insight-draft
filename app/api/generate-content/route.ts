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

CRÍTICO: Tu respuesta debe ser ÚNICAMENTE un array JSON válido. Sin introducción, sin explicación, sin texto adicional. Solo el JSON.

FORMATO EXACTO:
[
  {"timestamp": "[0-3s]", "text": "Hook impactante aquí"},
  {"timestamp": "[3-10s]", "text": "Value punto 1"},
  {"timestamp": "[10-20s]", "text": "Value punto 2"},
  {"timestamp": "[20-30s]", "text": "CTA fuerte"}
]

Empieza tu respuesta con [ y termina con ]`;

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

CRÍTICO: Tu respuesta debe ser ÚNICAMENTE un array JSON válido. Sin introducción, sin explicación, sin texto adicional. Solo el JSON.

FORMATO EXACTO:
[
  {"text": "Texto del slide 1 (máx 30 palabras)", "visual": "📱 Emoji grande o descripción visual"},
  {"text": "Texto del slide 2 (máx 30 palabras)", "visual": "✨ Emoji grande o descripción visual"},
  {"text": "Texto del slide 3 (máx 30 palabras)", "visual": "🎯 Emoji grande o descripción visual"}
]

Empieza tu respuesta con [ y termina con ]`;

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
      } else {
        // No JSON found, create fallback structure
        console.warn(`[GENERATE-CONTENT] No JSON found in ${platform} response, creating fallback`);

        if (platform === 'reel') {
          // Create basic reel structure from text
          const fallbackScript = [
            { timestamp: '[0-5s]', text: text.slice(0, 100) },
            { timestamp: '[5-15s]', text: text.slice(100, 250) || 'Value proposition' },
            { timestamp: '[15-30s]', text: text.slice(250, 400) || 'Call to action' },
          ];
          return {
            text: JSON.stringify(fallbackScript),
            script: fallbackScript,
            currentVersion: 1,
            versions: [JSON.stringify(fallbackScript)],
          };
        } else if (platform === 'stories') {
          // Create basic stories structure from text
          const words = text.split(' ');
          const fallbackSlides = [
            { text: words.slice(0, 15).join(' '), visual: '📱 Intro visual' },
            { text: words.slice(15, 30).join(' '), visual: '✨ Value visual' },
            { text: words.slice(30, 45).join(' '), visual: '🎯 CTA visual' },
          ];
          return {
            text: JSON.stringify(fallbackSlides),
            slides: fallbackSlides,
            currentVersion: 1,
            versions: [JSON.stringify(fallbackSlides)],
          };
        }
      }
    } catch (e) {
      console.error(`[GENERATE-CONTENT] Failed to parse ${platform} JSON:`, e);
      console.error(`[GENERATE-CONTENT] Raw text was:`, text.slice(0, 200));

      // Return fallback structure
      if (platform === 'reel') {
        const fallbackScript = [
          { timestamp: '[0-10s]', text: 'Hook: ' + text.slice(0, 50) },
          { timestamp: '[10-20s]', text: 'Value: ' + text.slice(50, 100) },
          { timestamp: '[20-30s]', text: 'CTA: Check bio for more' },
        ];
        return {
          text: JSON.stringify(fallbackScript),
          script: fallbackScript,
          currentVersion: 1,
          versions: [JSON.stringify(fallbackScript)],
        };
      } else if (platform === 'stories') {
        const fallbackSlides = [
          { text: text.slice(0, 50), visual: '📱 Visual 1' },
          { text: text.slice(50, 100), visual: '✨ Visual 2' },
          { text: text.slice(100, 150), visual: '🎯 Visual 3' },
        ];
        return {
          text: JSON.stringify(fallbackSlides),
          slides: fallbackSlides,
          currentVersion: 1,
          versions: [JSON.stringify(fallbackSlides)],
        };
      }
    }
  }

  // For standard text platforms
  return {
    text: text.trim(),
    currentVersion: 1,
    versions: [text.trim()],
  };
}
