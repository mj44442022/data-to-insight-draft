import { NextRequest, NextResponse } from 'next/server';
import { generateContentPlan } from '@/lib/gemini';
import { createCarouselSlide, createReelFrame, normalizeImage } from '@/lib/image-processor';
import { createReelVideo, createCarouselZip } from '@/lib/video-creator';

export const maxDuration = 300; // 5 minutes timeout for Vercel

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract form data
    const description = formData.get('description') as string;
    const keyMessages = formData.get('keyMessages') as string;
    const tone = formData.get('tone') as string;
    const imageFiles = formData.getAll('images') as File[];

    // Validate inputs
    if (!description || description.length < 100 || description.length > 500) {
      return NextResponse.json(
        { error: 'Description must be between 100-500 characters' },
        { status: 400 }
      );
    }

    if (!keyMessages || keyMessages.length < 20) {
      return NextResponse.json(
        { error: 'Key messages are required (min 20 characters)' },
        { status: 400 }
      );
    }

    if (!tone || !['Professional', 'Casual', 'Inspiring', 'Educational'].includes(tone)) {
      return NextResponse.json(
        { error: 'Valid tone is required' },
        { status: 400 }
      );
    }

    if (imageFiles.length < 3 || imageFiles.length > 10) {
      return NextResponse.json(
        { error: 'Please upload between 3-10 images' },
        { status: 400 }
      );
    }

    // Convert images to buffers
    const imageBuffers = await Promise.all(
      imageFiles.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return normalizeImage(buffer);
      })
    );

    console.log('Generating content plan with Gemini...');

    // Generate content plan using Gemini
    const contentPlan = await generateContentPlan(
      imageBuffers,
      description,
      keyMessages,
      tone
    );

    console.log('Content plan generated, creating carousel slides...');

    // Generate carousel slides
    const carouselSlides = await Promise.all(
      contentPlan.carousel.map((slide) => {
        const imageIndex = slide.imageIndex % imageBuffers.length;
        return createCarouselSlide(
          imageBuffers[imageIndex],
          slide.text,
          slide.slideNumber
        );
      })
    );

    console.log('Creating carousel ZIP...');

    // Create carousel ZIP
    const carouselZip = await createCarouselZip(carouselSlides);

    console.log('Creating reel frames...');

    // Generate reel frames
    const reelFrames = await Promise.all(
      contentPlan.reel.map((scene) => {
        const imageIndex = scene.imageIndex % imageBuffers.length;
        return createReelFrame(imageBuffers[imageIndex], scene.text);
      })
    );

    console.log('Creating reel video...');

    // Create reel video
    const reelDurations = contentPlan.reel.map((scene) => scene.duration);
    const reelVideo = await createReelVideo(reelFrames, reelDurations);

    console.log('Generation complete!');

    // Return response with files
    return NextResponse.json({
      success: true,
      carousel: {
        zip: carouselZip.toString('base64'),
        slides: carouselSlides.map((slide) => slide.toString('base64')),
      },
      reel: {
        video: reelVideo.toString('base64'),
      },
      caption: contentPlan.caption,
      hashtags: contentPlan.hashtags,
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate content',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
