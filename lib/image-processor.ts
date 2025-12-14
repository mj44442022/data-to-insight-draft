import satori from 'satori';
import sharp from 'sharp';
import React from 'react';

// Font loading for Satori
let interFont: ArrayBuffer | null = null;
let interBoldFont: ArrayBuffer | null = null;

async function loadFonts() {
  if (!interFont || !interBoldFont) {
    // Load fonts from Google Fonts or local files
    // For production, you should bundle these fonts or load from CDN
    const [regular, bold] = await Promise.all([
      fetch('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff').then(res => res.arrayBuffer()),
      fetch('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiA.woff').then(res => res.arrayBuffer()),
    ]);
    interFont = regular;
    interBoldFont = bold;
  }
  return { interFont, interBoldFont };
}

function wrapText(text: string, maxLength: number = 35): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length > maxLength && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

export async function createCarouselSlide(
  imageBuffer: Buffer,
  text: string,
  slideNumber: number
): Promise<Buffer> {
  const fonts = await loadFonts();
  const lines = wrapText(text, 30);

  // Convert image to base64 for embedding
  const imageBase64 = imageBuffer.toString('base64');
  const imageSrc = `data:image/jpeg;base64,${imageBase64}`;

  // Create JSX for the slide using React.createElement
  const element = React.createElement(
    'div',
    {
      style: {
        width: '1080px',
        height: '1080px',
        display: 'flex',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `url(${imageSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      },
    },
    [
      // Dark overlay
      React.createElement('div', {
        key: 'overlay',
        style: {
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
      }),
      // Text container
      React.createElement(
        'div',
        {
          key: 'text-container',
          style: {
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px',
            textAlign: 'center',
            gap: '20px',
          },
        },
        lines.map((line, i) =>
          React.createElement(
            'div',
            {
              key: `line-${i}`,
              style: {
                fontSize: '64px',
                fontWeight: 900,
                color: 'white',
                textShadow: '4px 4px 8px rgba(0, 0, 0, 0.8)',
                lineHeight: 1.2,
              },
            },
            line
          )
        )
      ),
      // Slide number
      React.createElement(
        'div',
        {
          key: 'slide-number',
          style: {
            position: 'absolute',
            bottom: '40px',
            right: '40px',
            fontSize: '32px',
            color: 'white',
            opacity: 0.7,
          },
        },
        `${slideNumber}/10`
      ),
    ]
  );

  // Convert JSX to SVG using Satori
  const svg = await satori(element, {
    width: 1080,
    height: 1080,
    fonts: [
      {
        name: 'Inter',
        data: fonts.interFont!,
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Inter',
        data: fonts.interBoldFont!,
        weight: 900,
        style: 'normal',
      },
    ],
  });

  // Convert SVG to PNG using Sharp (better compatibility)
  const pngBuffer = await sharp(Buffer.from(svg))
    .png()
    .toBuffer();

  return pngBuffer;
}

export async function createReelFrame(
  imageBuffer: Buffer,
  text: string
): Promise<Buffer> {
  const fonts = await loadFonts();
  const lines = wrapText(text, 30);

  // Convert image to base64 for embedding
  const imageBase64 = imageBuffer.toString('base64');
  const imageSrc = `data:image/jpeg;base64,${imageBase64}`;

  // Create JSX for the reel frame (9:16 aspect ratio)
  const element = React.createElement(
    'div',
    {
      style: {
        width: '1080px',
        height: '1920px',
        display: 'flex',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `url(${imageSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      },
    },
    [
      // Dark overlay (lighter for reels)
      React.createElement('div', {
        key: 'overlay',
        style: {
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
        },
      }),
      // Text container (centered for reel)
      React.createElement(
        'div',
        {
          key: 'text-container',
          style: {
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '120px 60px',
            textAlign: 'center',
            gap: '16px',
          },
        },
        lines.map((line, i) =>
          React.createElement(
            'div',
            {
              key: `line-${i}`,
              style: {
                fontSize: '56px',
                fontWeight: 900,
                color: 'white',
                textShadow: '3px 3px 6px rgba(0, 0, 0, 0.8)',
                lineHeight: 1.2,
              },
            },
            line
          )
        )
      ),
    ]
  );

  // Convert JSX to SVG using Satori
  const svg = await satori(element, {
    width: 1080,
    height: 1920,
    fonts: [
      {
        name: 'Inter',
        data: fonts.interFont!,
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Inter',
        data: fonts.interBoldFont!,
        weight: 900,
        style: 'normal',
      },
    ],
  });

  // Convert SVG to PNG using Sharp (better compatibility)
  const pngBuffer = await sharp(Buffer.from(svg))
    .png()
    .toBuffer();

  return pngBuffer;
}

export async function normalizeImage(imageBuffer: Buffer): Promise<Buffer> {
  // Normalize to JPEG for consistency
  return sharp(imageBuffer)
    .jpeg({ quality: 90 })
    .toBuffer();
}
