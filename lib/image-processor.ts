import satori from 'satori';
import sharp from 'sharp';
import { ReactElement } from 'react';
import fs from 'fs';
import path from 'path';
import { FontLoadError, ImageProcessingError } from './errors';

// Font cache to avoid re-reading
let fontCache: ArrayBuffer | null = null;

/**
 * Load Roboto Bold font from public/fonts/ (bundled with app)
 * Cached after first load to improve performance
 * Uses WOFF format for better compatibility with Satori
 */
function getRobotoFont(): ArrayBuffer {
  if (fontCache) {
    return fontCache;
  }

  try {
    console.log('[IMAGE-PROCESSOR] Loading Roboto Bold font from public/fonts/...');

    // Load WOFF font from public/fonts/ directory (WOFF has better Satori compatibility than TTF)
    const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Roboto-Bold.woff');

    const fontBuffer = fs.readFileSync(fontPath);
    fontCache = fontBuffer.buffer.slice(
      fontBuffer.byteOffset,
      fontBuffer.byteOffset + fontBuffer.byteLength
    );

    console.log(`[IMAGE-PROCESSOR] ✅ Font loaded (${fontCache.byteLength} bytes)`);
    return fontCache;

  } catch (error) {
    const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Roboto-Bold.woff');
    console.error('[IMAGE-PROCESSOR] Font load failed:', error);
    console.error('[IMAGE-PROCESSOR] Font path attempted:', fontPath);
    throw new FontLoadError(
      `Failed to load Roboto font from public/fonts/. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      fontPath
    );
  }
}

/**
 * Create a high-end Instagram carousel slide using Satori + Sharp
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

    const imageBase64 = imageBuffer.toString('base64');
    const imageDataUrl = `data:image/jpeg;base64,${imageBase64}`;
    const fontData = getRobotoFont();

    // DYNAMIC FONT SIZING - Adjust based on text length
    const textLength = text.length;
    let fontSize = 64;
    if (textLength > 80) fontSize = 52;
    if (textLength > 150) fontSize = 42;

    // CREATE STRUCTURE - Let Flexbox handle wrapping (NO manual text splitting!)
    const element: ReactElement = {
      type: 'div',
      key: null,
      ref: null,
      props: {
        style: {
          display: 'flex',
          height: '100%',
          width: '100%',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#000',
          backgroundImage: `url(${imageDataUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        },
        children: [
          // Overlay (Darken image for readability)
          {
            type: 'div',
            key: 'overlay',
            props: {
              style: {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.6)',
              },
            },
          },
          // Header / Branding (Top)
          {
            type: 'div',
            key: 'header',
            props: {
              style: {
                display: 'flex',
                justifyContent: 'flex-start',
                padding: '60px 50px',
                zIndex: 10,
              },
              children: [
                {
                  type: 'span',
                  key: 'brand',
                  props: {
                    style: {
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: 24,
                      letterSpacing: '2px',
                      fontWeight: 700,
                    },
                    children: 'CONTENTOS',
                  },
                },
              ],
            },
          },
          // Main Content Area (Middle) - SATORI HANDLES TEXT WRAPPING!
          {
            type: 'div',
            key: 'content',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                padding: '0 60px',
                zIndex: 10,
                flexGrow: 1,
              },
              children: [
                {
                  type: 'p',
                  key: 'text',
                  props: {
                    style: {
                      color: 'white',
                      fontSize: fontSize,
                      fontWeight: 700,
                      lineHeight: 1.3,
                      textShadow: '0 4px 10px rgba(0,0,0,0.5)',
                      wordBreak: 'normal',
                      whiteSpace: 'pre-wrap',
                    },
                    children: text,
                  },
                },
              ],
            },
          },
          // Footer (Bottom)
          {
            type: 'div',
            key: 'footer',
            props: {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '60px 50px',
                zIndex: 10,
                borderTop: '1px solid rgba(255,255,255,0.2)',
                margin: '0 50px',
              },
              children: [
                {
                  type: 'span',
                  key: 'handle',
                  props: {
                    style: {
                      color: '#FFD700',
                      fontSize: 28,
                      fontWeight: 700,
                    },
                    children: '@ContentOS',
                  },
                },
                {
                  type: 'div',
                  key: 'number',
                  props: {
                    style: {
                      backgroundColor: 'white',
                      color: 'black',
                      borderRadius: '50%',
                      width: '60px',
                      height: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 24,
                      fontWeight: 900,
                    },
                    children: `${slideNumber}`,
                  },
                },
              ],
            },
          },
        ],
      },
    } as ReactElement;

    // GENERATE WITH PORTRAIT RATIO (4:5 - Instagram standard)
    const svg = await satori(element, {
      width: 1080,
      height: 1350, // CHANGED FROM 1080 to 1350
      fonts: [
        {
          name: 'Roboto',
          data: fontData,
          weight: 700,
          style: 'normal',
        },
      ],
    });

    const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

    console.log(`[IMAGE-PROCESSOR] ✅ Slide ${slideNumber} created (${pngBuffer.length} bytes)`);
    return pngBuffer;
  } catch (error) {
    console.error(`[IMAGE-PROCESSOR] Failed to create slide ${slideNumber}:`, error);

    if (error instanceof FontLoadError) {
      throw error;
    }

    throw new ImageProcessingError(
      `Carousel slide generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      slideNumber
    );
  }
}

/**
 * Create a reel frame (9:16 aspect ratio) using Satori + Sharp
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

    // Step 2: Load font from bundle
    const fontData = getRobotoFont();

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

    // Step 4: Create React element for Satori
    const element: ReactElement = {
      type: 'div',
      key: null,
      ref: null,
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
          // Dark overlay
          {
            type: 'div',
            key: 'overlay',
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
            key: 'text-container',
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
              children: lines.map((line, i) => ({
                type: 'div',
                key: `line-${i}`,
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
    } as ReactElement;

    // Step 5: Generate SVG using Satori
    const svg = await satori(element, {
      width: 1080,
      height: 1920,
      fonts: [
        {
          name: 'Roboto',
          data: fontData,
          weight: 700,
          style: 'normal',
        },
      ],
    });

    // Step 6: Convert SVG to PNG using Sharp (built-in SVG support)
    const pngBuffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();

    console.log('[IMAGE-PROCESSOR] ✅ Reel frame created');
    return pngBuffer;

  } catch (error) {
    console.error('[IMAGE-PROCESSOR] Failed to create reel frame:', error);

    // Preserve FontLoadError if already thrown
    if (error instanceof FontLoadError) {
      throw error;
    }

    throw new ImageProcessingError(
      `Reel frame generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
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
