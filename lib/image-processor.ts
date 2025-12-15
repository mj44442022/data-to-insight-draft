import sharp from 'sharp';

/**
 * Create a carousel slide by compositing text over an image
 * Creates NEW images based on the uploaded ones
 */
export async function createCarouselSlide(
  imageBuffer: Buffer,
  text: string,
  slideNumber: number
): Promise<Buffer> {
  // Resize and prepare base image
  const baseImage = await sharp(imageBuffer)
    .resize(1080, 1080, {
      fit: 'cover',
      position: 'center'
    })
    .toBuffer();

  // Create dark overlay
  const overlay = Buffer.from(
    `<svg width="1080" height="1080">
      <rect width="1080" height="1080" fill="rgba(0,0,0,0.5)"/>
    </svg>`
  );

  // Word wrap text for better display
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  const maxCharsPerLine = 30;

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

  // Create text SVG overlay with wrapped text
  const textY = 540 - (lines.length * 40); // Center vertically
  const textSvg = `
    <svg width="1080" height="1080">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
          <feOffset dx="2" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.8"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      ${lines.map((line, i) => `
        <text
          x="540"
          y="${textY + (i * 80)}"
          font-family="Arial, sans-serif"
          font-size="64"
          font-weight="bold"
          fill="white"
          text-anchor="middle"
          filter="url(#shadow)"
        >${escapeXml(line)}</text>
      `).join('')}
      <text
        x="1020"
        y="1040"
        font-family="Arial, sans-serif"
        font-size="32"
        fill="white"
        text-anchor="end"
        opacity="0.7"
      >${slideNumber}/10</text>
    </svg>
  `;

  // Composite all layers
  const result = await sharp(baseImage)
    .composite([
      { input: overlay, blend: 'over' },
      { input: Buffer.from(textSvg), blend: 'over' }
    ])
    .png()
    .toBuffer();

  return result;
}

/**
 * Create a reel frame (9:16 aspect ratio)
 * Creates NEW images based on the uploaded ones
 */
export async function createReelFrame(
  imageBuffer: Buffer,
  text: string
): Promise<Buffer> {
  // Resize and prepare base image for reel (9:16)
  const baseImage = await sharp(imageBuffer)
    .resize(1080, 1920, {
      fit: 'cover',
      position: 'center'
    })
    .toBuffer();

  // Create dark overlay (lighter for reels)
  const overlay = Buffer.from(
    `<svg width="1080" height="1920">
      <rect width="1080" height="1920" fill="rgba(0,0,0,0.4)"/>
    </svg>`
  );

  // Word wrap text
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  const maxCharsPerLine = 28;

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

  // Create text SVG overlay centered for reel
  const textY = 960 - (lines.length * 35); // Center vertically
  const textSvg = `
    <svg width="1080" height="1920">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="2" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.8"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      ${lines.map((line, i) => `
        <text
          x="540"
          y="${textY + (i * 70)}"
          font-family="Arial, sans-serif"
          font-size="56"
          font-weight="bold"
          fill="white"
          text-anchor="middle"
          filter="url(#shadow)"
        >${escapeXml(line)}</text>
      `).join('')}
    </svg>
  `;

  // Composite all layers
  const result = await sharp(baseImage)
    .composite([
      { input: overlay, blend: 'over' },
      { input: Buffer.from(textSvg), blend: 'over' }
    ])
    .png()
    .toBuffer();

  return result;
}

/**
 * Normalize image for consistent processing
 */
export async function normalizeImage(imageBuffer: Buffer): Promise<Buffer> {
  return sharp(imageBuffer)
    .jpeg({ quality: 90 })
    .toBuffer();
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
