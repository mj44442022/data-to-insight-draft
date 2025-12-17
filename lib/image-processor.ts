import satori from 'satori';
import sharp from 'sharp';
import { ReactElement } from 'react';

// Font cache to avoid re-fetching
let fontCache: ArrayBuffer | null = null;

/**
 * Fetch Roboto Bold font from Google Fonts CDN
 * Cached after first fetch to improve performance
 */
async function getRobotoFont(): Promise<ArrayBuffer> {
  if (fontCache) {
    return fontCache;
  }

  try {
    console.log('[IMAGE-PROCESSOR] Fetching Roboto Bold font...');

    // Use Google Fonts CDN (reliable, fast, global CDN)
    const response = await fetch(
      'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc4.woff'
    );

    if (!response.ok) {
      throw new Error(`Font fetch failed: ${response.status}`);
    }

    fontCache = await response.arrayBuffer();
    console.log(`[IMAGE-PROCESSOR] ✅ Font loaded and cached (${fontCache.byteLength} bytes)`);
    return fontCache;

  } catch (error) {
    console.error('[IMAGE-PROCESSOR] Font fetch failed:', error);
    throw new Error('Failed to load Roboto font - cannot generate carousel');
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

    // Step 1: Convert image to base64 data URL for background
    const imageBase64 = imageBuffer.toString('base64');
    const imageDataUrl = `data:image/jpeg;base64,${imageBase64}`;

    // Step 2: Fetch font (REQUIRED for Satori)
    const fontData = await getRobotoFont();

    // Step 3: Word wrap text (max 40 chars per line)
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
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
                padding: '80px 60px',
                textAlign: 'center',
              },
              children: lines.map((line, i) => ({
                type: 'div',
                key: `line-${i}`,
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
            key: 'slide-number',
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
          // Footer: Branding
          {
            type: 'div',
            key: 'branding',
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
    } as ReactElement;

    // Step 5: Generate SVG using Satori
    const svg = await satori(element, {
      width: 1080,
      height: 1080,
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

    console.log(`[IMAGE-PROCESSOR] ✅ Slide ${slideNumber} created (${pngBuffer.length} bytes)`);
    return pngBuffer;

  } catch (error) {
    console.error(`[IMAGE-PROCESSOR] Failed to create slide ${slideNumber}:`, error);
    throw new Error(`Carousel slide generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
