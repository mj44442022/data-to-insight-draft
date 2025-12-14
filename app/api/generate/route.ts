import { NextRequest, NextResponse } from 'next/server';
import { generateContentPlan } from '@/lib/gemini';
import { createCarouselSlide, createReelFrame, normalizeImage } from '@/lib/image-processor';
import { createReelVideo, createCarouselZip } from '@/lib/video-creator';

export const maxDuration = 300; // 5 minutes timeout for Vercel

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('[GENERATE] Starting content generation request');

  try {
    // Parse form data with error handling
    let formData;
    try {
      formData = await request.formData();
    } catch (error) {
      console.error('[GENERATE] Failed to parse form data:', error);
      return NextResponse.json(
        { error: 'Invalid form data. Please check your upload and try again.' },
        { status: 400 }
      );
    }

    // Extract form data
    const description = formData.get('description') as string;
    const keyMessages = formData.get('keyMessages') as string;
    const tone = formData.get('tone') as string;
    const contentPillar = formData.get('contentPillar') as string;
    const imageFiles = formData.getAll('images') as File[];

    console.log('[GENERATE] Request params:', {
      descriptionLength: description?.length,
      keyMessagesLength: keyMessages?.length,
      tone,
      contentPillar,
      imageCount: imageFiles.length,
    });

    // Validate inputs with detailed errors
    if (!description || description.length < 100 || description.length > 500) {
      console.error('[GENERATE] Invalid description:', description?.length);
      return NextResponse.json(
        {
          error: 'Description must be between 100-500 characters',
          details: `Current length: ${description?.length || 0} characters`,
        },
        { status: 400 }
      );
    }

    if (!keyMessages || keyMessages.length < 20) {
      console.error('[GENERATE] Invalid key messages:', keyMessages?.length);
      return NextResponse.json(
        {
          error: 'Key messages are required (min 20 characters)',
          details: `Current length: ${keyMessages?.length || 0} characters`,
        },
        { status: 400 }
      );
    }

    if (!tone || !['Professional', 'Casual', 'Inspiring', 'Educational'].includes(tone)) {
      console.error('[GENERATE] Invalid tone:', tone);
      return NextResponse.json(
        { error: 'Valid tone is required', details: `Received: ${tone}` },
        { status: 400 }
      );
    }

    if (!contentPillar || !['Heard', 'Helpful', 'Humor', 'Happenings', 'Mixed'].includes(contentPillar)) {
      console.error('[GENERATE] Invalid content pillar:', contentPillar);
      return NextResponse.json(
        { error: 'Valid content pillar is required', details: `Received: ${contentPillar}` },
        { status: 400 }
      );
    }

    if (imageFiles.length < 3 || imageFiles.length > 10) {
      console.error('[GENERATE] Invalid image count:', imageFiles.length);
      return NextResponse.json(
        {
          error: 'Please upload between 3-10 images',
          details: `Received: ${imageFiles.length} images`,
        },
        { status: 400 }
      );
    }

    // Validate image file types and sizes
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxImageSize = 10 * 1024 * 1024; // 10MB

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      if (!validImageTypes.includes(file.type)) {
        console.error('[GENERATE] Invalid image type:', file.type, 'for file:', file.name);
        return NextResponse.json(
          {
            error: `Invalid image type for file: ${file.name}`,
            details: `Allowed types: JPG, PNG, WEBP. Received: ${file.type}`,
          },
          { status: 400 }
        );
      }

      if (file.size > maxImageSize) {
        console.error('[GENERATE] Image too large:', file.size, 'for file:', file.name);
        return NextResponse.json(
          {
            error: `Image ${file.name} is too large`,
            details: `Max size: 10MB. File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
          },
          { status: 400 }
        );
      }
    }

    console.log('[GENERATE] All validations passed, processing images...');

    // Convert images to buffers with error handling
    let imageBuffers;
    try {
      imageBuffers = await Promise.all(
        imageFiles.map(async (file, index) => {
          try {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            console.log(`[GENERATE] Processing image ${index + 1}/${imageFiles.length}`);
            return normalizeImage(buffer);
          } catch (error) {
            console.error(`[GENERATE] Failed to process image ${index + 1}:`, error);
            throw new Error(`Failed to process image ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        })
      );
    } catch (error) {
      console.error('[GENERATE] Image processing failed:', error);
      return NextResponse.json(
        {
          error: 'Failed to process images',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    console.log('[GENERATE] Step 1/5: Generating content plan with Gemini AI...');

    // Generate content plan using Gemini with error handling
    let contentPlan;
    try {
      contentPlan = await generateContentPlan(
        imageBuffers,
        description,
        keyMessages,
        tone,
        contentPillar
      );
      console.log('[GENERATE] Content plan generated successfully');
    } catch (error) {
      console.error('[GENERATE] Gemini API failed:', error);
      return NextResponse.json(
        {
          error: 'Failed to generate content with AI',
          details: error instanceof Error ? error.message : 'Unknown error',
          step: 'AI Content Generation',
        },
        { status: 500 }
      );
    }

    console.log('[GENERATE] Step 2/5: Creating carousel slides...');

    // Generate carousel slides with error handling
    let carouselSlides;
    try {
      carouselSlides = await Promise.all(
        contentPlan.carousel.map(async (slide, index) => {
          try {
            const imageIndex = slide.imageIndex % imageBuffers.length;
            console.log(`[GENERATE] Creating carousel slide ${index + 1}/10`);
            return createCarouselSlide(
              imageBuffers[imageIndex],
              slide.text,
              slide.slideNumber
            );
          } catch (error) {
            console.error(`[GENERATE] Failed to create slide ${index + 1}:`, error);
            throw new Error(`Failed to create slide ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        })
      );
      console.log('[GENERATE] All carousel slides created');
    } catch (error) {
      console.error('[GENERATE] Carousel slide creation failed:', error);
      return NextResponse.json(
        {
          error: 'Failed to create carousel slides',
          details: error instanceof Error ? error.message : 'Unknown error',
          step: 'Carousel Creation',
        },
        { status: 500 }
      );
    }

    console.log('[GENERATE] Step 3/5: Creating carousel ZIP file...');

    // Create carousel ZIP with error handling
    let carouselZip;
    try {
      carouselZip = await createCarouselZip(carouselSlides);
      console.log('[GENERATE] Carousel ZIP created');
    } catch (error) {
      console.error('[GENERATE] ZIP creation failed:', error);
      return NextResponse.json(
        {
          error: 'Failed to create carousel ZIP file',
          details: error instanceof Error ? error.message : 'Unknown error',
          step: 'ZIP Creation',
        },
        { status: 500 }
      );
    }

    console.log('[GENERATE] Step 4/5: Creating reel frames...');

    // Generate reel frames with error handling
    let reelFrames;
    try {
      reelFrames = await Promise.all(
        contentPlan.reel.map(async (scene, index) => {
          try {
            const imageIndex = scene.imageIndex % imageBuffers.length;
            console.log(`[GENERATE] Creating reel frame ${index + 1}/${contentPlan.reel.length}`);
            return createReelFrame(imageBuffers[imageIndex], scene.text);
          } catch (error) {
            console.error(`[GENERATE] Failed to create reel frame ${index + 1}:`, error);
            throw new Error(`Failed to create reel frame ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        })
      );
      console.log('[GENERATE] All reel frames created');
    } catch (error) {
      console.error('[GENERATE] Reel frame creation failed:', error);
      return NextResponse.json(
        {
          error: 'Failed to create reel frames',
          details: error instanceof Error ? error.message : 'Unknown error',
          step: 'Reel Frame Creation',
        },
        { status: 500 }
      );
    }

    console.log('[GENERATE] Step 5/5: Creating reel video...');

    // Create reel video with error handling
    let reelVideo;
    try {
      const reelDurations = contentPlan.reel.map((scene) => scene.duration);
      reelVideo = await createReelVideo(reelFrames, reelDurations);
      console.log('[GENERATE] Reel video created');
    } catch (error) {
      console.error('[GENERATE] Video creation failed:', error);
      return NextResponse.json(
        {
          error: 'Failed to create reel video',
          details: error instanceof Error ? error.message : 'Unknown error. Make sure FFmpeg is installed.',
          step: 'Video Creation',
        },
        { status: 500 }
      );
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[GENERATE] Generation complete in ${totalTime}s`);

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
      generationTime: totalTime,
    });
  } catch (error) {
    console.error('[GENERATE] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate content',
        details: error instanceof Error ? error.message : 'Unknown error',
        step: 'Unknown',
      },
      { status: 500 }
    );
  }
}
