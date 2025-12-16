import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';

// Font cache to avoid re-fetching
let fontCache: ArrayBuffer | null = null;

/**
 * Fetch Roboto Bold font from Google Fonts
 * Cached after first fetch to improve performance
 */
async function getRobotoFont(): Promise<ArrayBuffer> {
  if (fontCache) {
    return fontCache;
  }

  try {
    console.log('[IMAGE-PROCESSOR] Fetching Roboto Bold font...');
    const response = await fetch(
      'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc4.woff'
    );

    if (!response.ok) {
      throw new Error(`Font fetch failed: ${response.status}`);
    }

    fontCache = await response.arrayBuffer();
    console.log('[IMAGE-PROCESSOR] ✅ Font loaded and cached');
    return fontCache;
  } catch (error) {
    console.error('[IMAGE-PROCESSOR] Font fetch failed, using fallback:', error);
    // Return empty buffer as fallback - Satori will use system fonts
    return new ArrayBuffer(0);
  }
}

/**
 * Create a high-end Instagram carousel slide using Satori
 * @param imageBuffer - User's uploaded image
 * @param text - Text overlay for the slide
 * @param slideNumber - Slide number (e.g., 1/10)
 * @returns PNG buffer
 */
export async function createCarouselSlide(
  imageBuffer: Buffer,
  text: string,
  slideNumber: number
): Promise<Buffer> {
  try {
    console.log(`[IMAGE-PROCESSOR] Creating carousel slide ${slideNumber}...`);

    // Step 1: Convert image to base64 data URL for background
    const imageBase64 = imageBuffer.toString('base64');
    const imageDataUrl = `data:image/jpeg;base64,${imageBase64}`;

    // Step 2: Fetch font
    const fontData = await getRobotoFont();

    // Step 3: Word wrap text (max 40 chars per line for readability)
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    const maxCharsPerLine = 40;

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (testLine.length > maxCharsPerLine && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    // Step 4: Create JSX template (high-end Instagram carousel design)
    const svg = await satori(
      {
        type: 'div',
        props: {
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            backgroundImage: `url(${imageDataUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          },
          children: [
            // Dark overlay (40% black)
            {
              type: 'div',
              props: {
                style: {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                },
              },
            },
            // Text container
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  padding: '80px 60px',
                  textAlign: 'center',
                },
                children: lines.map((line) => ({
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 64,
                      fontWeight: 700,
                      color: 'white',
                      textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8)',
                      marginBottom: 16,
                      lineHeight: 1.2,
                    },
                    children: line,
                  },
                })),
              },
            },
            // Footer: Slide number
            {
              type: 'div',
              props: {
                style: {
                  position: 'absolute',
                  bottom: 40,
                  right: 50,
                  fontSize: 32,
                  fontWeight: 600,
                  color: 'white',
                  opacity: 0.8,
                  zIndex: 10,
                },
                children: `${slideNumber}/10`,
              },
            },
            // Footer: "Link in Bio" branding
            {
              type: 'div',
              props: {
                style: {
                  position: 'absolute',
                  bottom: 40,
                  left: 50,
                  fontSize: 28,
                  fontWeight: 500,
                  color: 'white',
                  opacity: 0.7,
                  zIndex: 10,
                  letterSpacing: '0.5px',
                },
                children: 'Link in Bio',
              },
            },
          ],
        },
      } as any,
      {
        width: 1080,
        height: 1080,
        fonts: fontData.byteLength > 0 ? [
          {
            name: 'Roboto',
            data: fontData,
            weight: 700,
            style: 'normal',
          },
        ] : [],
      }
    );

    // Step 5: Convert SVG to PNG using RESVG
    const resvg = new Resvg(svg, {
      fitTo: {
        mode: 'width',
        value: 1080,
      },
    });

    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    console.log(`[IMAGE-PROCESSOR] ✅ Carousel slide ${slideNumber} created (${pngBuffer.length} bytes)`);
    return Buffer.from(pngBuffer);

  } catch (error) {
    console.error(`[IMAGE-PROCESSOR] Failed to create carousel slide ${slideNumber}:`, error);
    throw new Error(`Carousel slide generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a reel frame (9:16 aspect ratio) using Satori
 * @param imageBuffer - User's uploaded image
 * @param text - Text overlay for the frame
 * @returns PNG buffer
 */
export async function createReelFrame(
  imageBuffer: Buffer,
  text: string
): Promise<Buffer> {
  try {
    console.log('[IMAGE-PROCESSOR] Creating reel frame...');

    // Step 1: Convert image to base64 data URL
    const imageBase64 = imageBuffer.toString('base64');
    const imageDataUrl = `data:image/jpeg;base64,${imageBase64}`;

    // Step 2: Fetch font
    const fontData = await getRobotoFont();

    // Step 3: Word wrap text (max 35 chars per line for vertical format)
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    const maxCharsPerLine = 35;

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (testLine.length > maxCharsPerLine && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    // Step 4: Create JSX template for reel (9:16)
    const svg = await satori(
      {
        type: 'div',
        props: {
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            backgroundImage: `url(${imageDataUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          },
          children: [
            // Dark overlay (40% black)
            {
              type: 'div',
              props: {
                style: {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                },
              },
            },
            // Text container
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  padding: '100px 50px',
                  textAlign: 'center',
                },
                children: lines.map((line) => ({
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 56,
                      fontWeight: 700,
                      color: 'white',
                      textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8)',
                      marginBottom: 12,
                      lineHeight: 1.2,
                    },
                    children: line,
                  },
                })),
              },
            },
          ],
        },
      } as any,
      {
        width: 1080,
        height: 1920,
        fonts: fontData.byteLength > 0 ? [
          {
            name: 'Roboto',
            data: fontData,
            weight: 700,
            style: 'normal',
          },
        ] : [],
      }
    );

    // Step 5: Convert SVG to PNG using RESVG
    const resvg = new Resvg(svg, {
      fitTo: {
        mode: 'width',
        value: 1080,
      },
    });

    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    console.log('[IMAGE-PROCESSOR] ✅ Reel frame created');
    return Buffer.from(pngBuffer);

  } catch (error) {
    console.error('[IMAGE-PROCESSOR] Failed to create reel frame:', error);
    throw new Error(`Reel frame generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Normalize image for consistent processing
 * Converts to JPEG with quality optimization
 */
export async function normalizeImage(imageBuffer: Buffer): Promise<Buffer> {
  return sharp(imageBuffer)
    .jpeg({ quality: 90 })
    .toBuffer();
}
