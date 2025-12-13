import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';

export async function createReelVideo(
  frames: Buffer[],
  durations: number[]
): Promise<Buffer> {
  const tempDir = path.join('/tmp', 'reel-' + Date.now().toString());
  await fs.mkdir(tempDir, { recursive: true });

  try {
    // Save frames as temporary files
    const framePaths = await Promise.all(
      frames.map(async (frame, i) => {
        const framePath = path.join(tempDir, `frame${i.toString().padStart(3, '0')}.png`);
        await fs.writeFile(framePath, frame);
        return framePath;
      })
    );

    const outputPath = path.join(tempDir, 'output.mp4');

    // Create concat file for ffmpeg
    const concatContent = framePaths
      .map((framePath, i) => `file '${framePath}'\nduration ${durations[i] || 1.2}`)
      .join('\n');

    // Add the last frame again for proper duration
    const lastFrameIndex = framePaths.length - 1;
    const concatWithLastFrame = concatContent + `\nfile '${framePaths[lastFrameIndex]}'`;

    const concatPath = path.join(tempDir, 'concat.txt');
    await fs.writeFile(concatPath, concatWithLastFrame);

    // Create video with FFmpeg
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(concatPath)
        .inputOptions(['-f concat', '-safe 0'])
        .outputOptions([
          '-c:v libx264',
          '-pix_fmt yuv420p',
          '-r 30',
          '-preset fast',
          '-crf 23',
        ])
        .output(outputPath)
        .on('end', async () => {
          try {
            const videoBuffer = await fs.readFile(outputPath);
            await fs.rm(tempDir, { recursive: true, force: true });
            resolve(videoBuffer);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', async (error) => {
          await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
          reject(error);
        })
        .run();
    });
  } catch (error) {
    // Cleanup on error
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    throw error;
  }
}

export async function createCarouselZip(slides: Buffer[]): Promise<Buffer> {
  const archiver = require('archiver');
  const { Readable } = require('stream');

  return new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks: Buffer[] = [];

    archive.on('data', (chunk: Buffer) => chunks.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', reject);

    slides.forEach((slide, i) => {
      const slideNumber = (i + 1).toString().padStart(2, '0');
      archive.append(slide, { name: `slide-${slideNumber}.png` });
    });

    archive.finalize();
  });
}
