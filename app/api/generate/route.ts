import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
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
    let imageBuffers: Buffer[];
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

    // Validate and fix image distribution for carousel
    const carouselImageIndices = contentPlan.carousel.map(s => s.imageIndex);
    const uniqueCarouselImages = new Set(carouselImageIndices).size;

    if (uniqueCarouselImages < Math.min(3, imageBuffers.length)) {
      console.log('[GENERATE] ⚠️ Poor image distribution detected, redistributing...');
      contentPlan.carousel.forEach((slide, index) => {
        slide.imageIndex = index % imageBuffers.length;
      });
      console.log('[GENERATE] ✅ Images redistributed for variety');
    }

    // Generate carousel slides with error handling
    let carouselSlides: Buffer[];
    try {
      carouselSlides = await Promise.all(
        contentPlan.carousel.map(async (slide, index) => {
          try {
            const imageIndex = slide.imageIndex % imageBuffers.length;
            console.log(`[GENERATE] Creating carousel slide ${index + 1}/10 with image ${imageIndex}`);
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
    let carouselZip: Buffer;
    try {
      carouselZip = await createCarouselZip(carouselSlides);
      console.log(`[GENERATE] Carousel ZIP created (${(carouselZip.length / 1024 / 1024).toFixed(2)}MB)`);
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

    // 🎯 STRATEGIC PIVOT: Skip reel frame/video generation - focus on carousel + script only
    // console.log('[GENERATE] Step 4/5: Creating reel frames...');
    // Validate and fix image distribution for reel
    const reelImageIndices = contentPlan.reel.map(s => s.imageIndex);
    const uniqueReelImages = new Set(reelImageIndices).size;

    if (uniqueReelImages < Math.min(2, imageBuffers.length)) {
      console.log('[GENERATE] ⚠️ Poor reel image distribution detected, redistributing...');
      contentPlan.reel.forEach((scene, index) => {
        scene.imageIndex = index % imageBuffers.length;
      });
      console.log('[GENERATE] ✅ Reel images redistributed for script visual notes');
    }

    // 🎯 REEL FRAMES GENERATION DISABLED - Not needed for script-only approach
    // Generate reel frames with error handling
    // let reelFrames: Buffer[];
    // try {
    //   reelFrames = await Promise.all(
    //     contentPlan.reel.map(async (scene, index) => {
    //       try {
    //         const imageIndex = scene.imageIndex % imageBuffers.length;
    //         console.log(`[GENERATE] Creating reel frame ${index + 1}/${contentPlan.reel.length} with image ${imageIndex}`);
    //         return createReelFrame(imageBuffers[imageIndex], scene.text);
    //       } catch (error) {
    //         console.error(`[GENERATE] Failed to create reel frame ${index + 1}:`, error);
    //         throw new Error(`Failed to create reel frame ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    //       }
    //     })
    //   );
    //   console.log('[GENERATE] All reel frames created');
    // } catch (error) {
    //   console.error('[GENERATE] Reel frame creation failed:', error);
    //   return NextResponse.json(
    //     {
    //       error: 'Failed to create reel frames',
    //       details: error instanceof Error ? error.message : 'Unknown error',
    //       step: 'Reel Frame Creation',
    //     },
    //     { status: 500 }
    //   );
    // }

    // 🗑️ GARBAGE COLLECTION: Free image buffers (no longer needed)
    imageBuffers = null as any;
    if (global.gc) {
      global.gc();
      console.log('[GENERATE] 🗑️ Garbage collection triggered after carousel generation');
    }

    console.log('[GENERATE] Step 4/4: Preparing reel script with visual direction notes...');
    console.log('[GENERATE] ✅ Reel script ready with visual direction notes (frames/video generation disabled)');

    console.log('[GENERATE] 🔼 Uploading carousel ZIP to Vercel Blob...');

    // Upload carousel ZIP to Vercel Blob
    let carouselZipUrl: string;
    try {
      const timestamp = Date.now();
      const blob = await put(`carousels/carousel-${timestamp}.zip`, carouselZip, {
        access: 'public',
        contentType: 'application/zip',
      });
      carouselZipUrl = blob.url;
      console.log(`[GENERATE] ✅ Carousel ZIP uploaded to: ${carouselZipUrl}`);
    } catch (error) {
      console.error('[GENERATE] Failed to upload carousel ZIP to Blob:', error);
      return NextResponse.json(
        {
          error: 'Failed to upload carousel ZIP',
          details: error instanceof Error ? error.message : 'Unknown error',
          step: 'Blob Upload (Carousel)',
        },
        { status: 500 }
      );
    }

    // 🗑️ GARBAGE COLLECTION: Free carousel ZIP buffer (uploaded to Blob)
    carouselZip = null as any;
    if (global.gc) {
      global.gc();
      console.log('[GENERATE] 🗑️ Garbage collection triggered after carousel upload');
    }

    // 🎯 VIDEO GENERATION DISABLED - Focus on carousel + script only
    // Upload reel video to Vercel Blob (if it exists)
    // let reelVideoUrl: string | null = null;
    // if (reelVideo) {
    //   console.log('[GENERATE] 🔼 Uploading reel video to Vercel Blob...');
    //   try {
    //     const timestamp = Date.now();
    //     const blob = await put(`reels/reel-${timestamp}.mp4`, reelVideo, {
    //       access: 'public',
    //       contentType: 'video/mp4',
    //     });
    //     reelVideoUrl = blob.url;
    //     console.log(`[GENERATE] ✅ Reel video uploaded to: ${reelVideoUrl}`);
    //   } catch (error) {
    //     console.error('[GENERATE] Failed to upload reel video to Blob:', error);
    //     // Don't fail the request, just log the error
    //     videoError = `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    //   }

    //   // 🗑️ GARBAGE COLLECTION: Free reel video buffer (uploaded to Blob)
    //   reelVideo = null;
    //   if (global.gc) {
    //     global.gc();
    //     console.log('[GENERATE] 🗑️ Garbage collection triggered after video upload');
    //   }
    // }

    const reelVideoUrl: string | null = null; // Video generation disabled

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[GENERATE] ✨ Generation complete in ${totalTime}s`);

    // Return response with Blob URLs (not base64)
    // This keeps the response size tiny (<4.5MB) and fast
    return NextResponse.json({
      success: true,
      carousel: {
        zipUrl: carouselZipUrl, // ✅ URL instead of base64
        slides: carouselSlides.map((slide) => slide.toString('base64')), // Keep for preview
      },
      reel: {
        videoUrl: null, // Video generation disabled - focus on script only
        script: contentPlan.reel, // Professional teleprompter script with visual notes
        videoError: 'Video generation disabled - use script for recording', // Explanation
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
