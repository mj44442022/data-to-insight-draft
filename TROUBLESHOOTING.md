# Troubleshooting Guide - Instagram Content Generator

This guide helps diagnose and fix common issues with the AI-powered Instagram carousel generator.

## Table of Contents
- [Image Generation Issues](#image-generation-issues)
- [Image Processing Issues](#image-processing-issues)
- [API & Authentication Issues](#api--authentication-issues)
- [Quota & Rate Limiting](#quota--rate-limiting)
- [How to Read Error Logs](#how-to-read-error-logs)

---

## Image Generation Issues

### Issue: "Seed is not supported when watermark is enabled"

**Cause**: Vertex AI Imagen 3 doesn't allow seed parameter when watermarks are enabled (default).

**Solution**: Removed seed parameter from generation requests.

**Fixed in**: `lib/imagen-generator.ts` - seed parameter removed from API call

---

### Issue: "Invalid aspect ratio, 4:5"

**Cause**: Imagen 3 only supports: 1:1, 3:4, 4:3, 9:16, 16:9 (NOT 4:5)

**Solution**: Changed to 9:16 (tall portrait, closest to Instagram 4:5). Images are resized to 1080x1350 during carousel slide creation.

**Fixed in**: `lib/imagen-generator.ts:251` - `aspectRatio: '9:16'`

---

### Issue: "Quota exceeded for aiplatform.googleapis.com/online_prediction_requests_per_base_model"

**Cause**: Free tier limited to 5 images/day

**Current Strategy**: Generate only 3 AI images per carousel (stay under quota)

**Permanent Solution**: Request quota increase at Google Cloud Console > IAM & Admin > Quotas

**Configuration**: `lib/imagen-generator.ts` - `MAX_AI_IMAGES = 3`

---

## Image Processing Issues

### Issue: "RangeError: Offset is outside the bounds of the DataView"

**Cause**: Imagen 3 returns PNG/WebP format, but image processor was hardcoding JPEG in data URLs. Format mismatch causes Sharp to fail.

**Solution**: Normalize all images to JPEG before creating data URLs.

**Fixed in**:
- `lib/image-processor.ts:70` - calls `normalizeImage()` before processing
- `lib/image-processor.ts:409` - converts any format (PNG/WebP/JPEG) to JPEG with 90% quality

**Diagnostic Logs**:
```
[IMAGE-PROCESSOR] 🔄 Normalizing PNG image (1055.81KB) to JPEG...
[IMAGE-PROCESSOR] ✅ Normalized to JPEG (987.23KB)
```

---

### Issue: Empty or Corrupted Image Buffers

**Symptoms**: "Cannot normalize empty image buffer" or "Suspiciously small image buffer"

**Diagnostic Steps**:
1. Check image format detection logs:
   ```
   [WORKER] 🔍 Image format detected: PNG (magic: 89504e47)
   ```

2. Verify buffer size:
   ```
   [IMAGE-PROCESSOR] 📥 Input buffer: 1055.81KB
   ```

3. Look for validation errors:
   ```
   [IMAGE-PROCESSOR] ❌ Image normalization failed
   [IMAGE-PROCESSOR] 📝 Error details: { bufferSize: 0 }
   ```

**Common Causes**:
- Vertex AI returned invalid response
- Network interruption during image download
- Base64 decoding failure

**Solution**: Check error logs for specific failure point. Enhanced logging will show exact buffer sizes and formats at each step.

---

## API & Authentication Issues

### Issue: "Error acquiring access token: invalid_grant"

**Cause**: Invalid service account private key format

**Common Problems**:
1. Escaped newlines (`\n` instead of actual newlines)
2. Missing spaces in BEGIN/END markers (`-----BEGINPRIVATEKEY-----`)
3. Copy/paste formatting issues

**Automatic Fixes**: `lib/imagen-generator.ts:196-202` automatically corrects these issues

**Manual Verification**: Check that private key has:
```
-----BEGIN PRIVATE KEY-----
MIIEvQIB... (actual newlines, not \n)
-----END PRIVATE KEY-----
```

---

### Issue: "404 Model not found"

**Cause**: Wrong model ID or region

**Current Configuration**:
- Model: `imagen-3.0-generate-001`
- Region: `us-central1`
- Endpoint: `us-central1-aiplatform.googleapis.com`

**Verification**: Check that model is available in your GCP project and region.

---

## Quota & Rate Limiting

### Understanding Quotas

**Free Tier**:
- 5 images/day per model
- No billing required
- Good for testing

**Paid Tier** (requires quota increase request):
- Default: Same as free tier
- Must explicitly request increase via Google Cloud Console
- Billing enabled ≠ automatic quota increase

**Current Implementation**:
```typescript
// lib/imagen-generator.ts
const MAX_AI_IMAGES = 3; // Stay under 5 images/day quota
```

### Hybrid Image Strategy

To stay within quota limits, the system uses:
- **3 AI-generated images** (first 3 slides)
- **7 uploaded photos** (remaining 7 slides)

**Fallback Mechanism**: If AI generation fails, all 10 slides use uploaded photos.

**To scale up**: Change `MAX_AI_IMAGES` constant after getting quota increase.

---

## How to Read Error Logs

### Log Prefixes

- `[WORKER]` - Vertex AI image generation
- `[IMAGE-PROCESSOR]` - Sharp/Satori processing
- `[GEMINI]` - Content generation
- `[GENERATE]` - API route validation

### Understanding Diagnostic Logs

#### Image Format Detection
```
[WORKER] 🔍 Image format detected: PNG (magic: 89504e47)
```
- `89504e47` = PNG
- `ffd8ff*` = JPEG
- `52494646` = WebP (RIFF)

#### Buffer Size Tracking
```
[WORKER] ✅ Image 1/10 generated (1055.81KB, PNG)
[IMAGE-PROCESSOR] 📥 Input buffer: 1055.81KB
[IMAGE-PROCESSOR] 🔄 Normalizing PNG image (1055.81KB) to JPEG...
[IMAGE-PROCESSOR] ✅ Normalized to JPEG (987.23KB)
```

This shows image successfully generated, received, normalized, and ready for processing.

#### Error Context
```
[IMAGE-PROCESSOR] 📝 Error details: {
  name: 'Error',
  message: 'Input buffer contains unsupported image format',
  slideNumber: 1,
  textLength: 87,
  bufferSize: 1055810,
  stack: '...'
}
```

This provides full context: which slide failed, text length, buffer size, and stack trace.

---

## Quick Diagnostics Checklist

When something goes wrong, check logs for:

1. **Image Generation** (look for `[WORKER]` logs):
   - ✅ Image format detected (PNG/JPEG/WebP)?
   - ✅ Image size reasonable (>100KB)?
   - ❌ API error code (400/429/500)?

2. **Image Processing** (look for `[IMAGE-PROCESSOR]` logs):
   - ✅ Input buffer received?
   - ✅ Normalization successful?
   - ✅ Slide creation completed?
   - ❌ Error at which step?

3. **Authentication** (look for access token logs):
   - ✅ Private key format validated?
   - ✅ Access token acquired?
   - ❌ Invalid grant error?

4. **Content Generation** (look for `[GEMINI]` logs):
   - ✅ Strategy created?
   - ✅ Content generated?
   - ✅ ARCS pillar recognized?

---

## Common Error Patterns

### Pattern: Generation succeeds, processing fails
```
[WORKER] ✅ Image 1/10 generated (1055.81KB, PNG)
[IMAGE-PROCESSOR] ❌ Failed to create slide 1: RangeError
```
**Cause**: Format mismatch or buffer corruption
**Solution**: Check normalization logs, verify buffer integrity

### Pattern: All generations fail with 429
```
[WORKER] 💥 Generation error: 429 Quota exceeded
```
**Cause**: Hit daily quota limit (5 images/day)
**Solution**: Wait until next day or request quota increase

### Pattern: Intermittent 401/403 errors
```
[WORKER] 💥 Generation error: 401 Unauthorized
```
**Cause**: Access token expired or invalid credentials
**Solution**: Verify service account credentials in .env.local

---

## Support

If you encounter an issue not covered here:

1. **Check logs** for error patterns listed above
2. **Verify configuration** matches this guide
3. **Check recent commits** for related fixes
4. **Look for diagnostic logs** showing buffer sizes and formats

**Recent Fixes**:
- Image format normalization (commit: `11727bb`)
- Quota optimization to 3 images (commit: `58c8310`)
- Aspect ratio 9:16 fix (commit: `8800d30`)
- Seed parameter removal (commit: `6a73f7b`)
