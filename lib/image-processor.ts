import sharp from 'sharp';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    // Rough estimate: each character is about 30-40 pixels at font-size 64
    if (testLine.length * 40 > maxWidth && currentLine) {
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
  const lines = wrapText(text, 900);
  const lineHeight = 80;
  const startY = 540 - ((lines.length - 1) * lineHeight) / 2;

  const textElements = lines
    .map((line, i) => {
      const y = startY + i * lineHeight;
      return `
      <text
        x="540"
        y="${y}"
        text-anchor="middle"
        font-family="Arial Black, sans-serif"
        font-size="64"
        font-weight="900"
        fill="white"
        style="paint-order: stroke; stroke: #000; stroke-width: 8px;"
      >
        ${escapeXml(line)}
      </text>`;
    })
    .join('');

  const textSvg = `
    <svg width="1080" height="1080">
      <!-- Dark overlay -->
      <rect width="1080" height="1080" fill="rgba(0,0,0,0.5)"/>

      <!-- Main text -->
      ${textElements}

      <!-- Slide number -->
      <text
        x="1020"
        y="1040"
        text-anchor="end"
        font-family="Arial, sans-serif"
        font-size="32"
        fill="white"
        opacity="0.7"
      >
        ${slideNumber}/10
      </text>
    </svg>
  `;

  return sharp(imageBuffer)
    .resize(1080, 1080, { fit: 'cover', position: 'center' })
    .composite([
      {
        input: Buffer.from(textSvg),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toBuffer();
}

export async function createReelFrame(
  imageBuffer: Buffer,
  text: string
): Promise<Buffer> {
  const lines = wrapText(text, 900);
  const lineHeight = 70;
  const startY = 960 - ((lines.length - 1) * lineHeight) / 2;

  const textElements = lines
    .map((line, i) => {
      const y = startY + i * lineHeight;
      return `
      <text
        x="540"
        y="${y}"
        text-anchor="middle"
        font-family="Arial Black, sans-serif"
        font-size="56"
        font-weight="900"
        fill="white"
        style="paint-order: stroke; stroke: #000; stroke-width: 6px;"
      >
        ${escapeXml(line)}
      </text>`;
    })
    .join('');

  const textSvg = `
    <svg width="1080" height="1920">
      <!-- Dark overlay -->
      <rect width="1080" height="1920" fill="rgba(0,0,0,0.4)"/>

      <!-- Main text -->
      ${textElements}
    </svg>
  `;

  return sharp(imageBuffer)
    .resize(1080, 1920, { fit: 'cover', position: 'center' })
    .composite([
      {
        input: Buffer.from(textSvg),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toBuffer();
}

export async function normalizeImage(imageBuffer: Buffer): Promise<Buffer> {
  // Normalize image to JPEG format for consistency
  return sharp(imageBuffer)
    .jpeg({ quality: 90 })
    .toBuffer();
}
