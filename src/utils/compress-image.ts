/**
 * Client-side image compression using Canvas API.
 * Compresses images to be under the target size (default 1MB)
 * while maintaining reasonable visual quality.
 */

const DEFAULT_TARGET_SIZE = 1 * 1024 * 1024 // 1MB
const MAX_DIMENSION = 1920 // Max width or height

interface CompressOptions {
  /** Target file size in bytes (default: 1MB) */
  targetSize?: number
  /** Max width/height in px — image is downscaled proportionally (default: 1920) */
  maxDimension?: number
  /** Starting JPEG quality 0–1 (default: 0.85) */
  initialQuality?: number
  /** Minimum JPEG quality to prevent excessive degradation (default: 0.5) */
  minQuality?: number
}

/**
 * Load a File/Blob as an HTMLImageElement.
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Gagal memuat gambar'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Draw the image onto a canvas, optionally downscaling if it exceeds maxDimension.
 */
function drawToCanvas(
  img: HTMLImageElement,
  maxDim: number
): HTMLCanvasElement {
  let { naturalWidth: w, naturalHeight: h } = img

  // Downscale proportionally if too large
  if (w > maxDim || h > maxDim) {
    const ratio = Math.min(maxDim / w, maxDim / h)
    w = Math.round(w * ratio)
    h = Math.round(h * ratio)
  }

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h

  const ctx = canvas.getContext('2d')!
  // Use better interpolation
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, w, h)

  return canvas
}

/**
 * Convert canvas to a Blob at the given JPEG quality.
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Gagal mengompres gambar'))
      },
      'image/jpeg',
      quality
    )
  })
}

/**
 * Compress an image file to be under `targetSize` bytes.
 *
 * Strategy:
 * 1. Downscale if dimensions exceed maxDimension.
 * 2. Convert to JPEG starting at `initialQuality`.
 * 3. If still over target, iteratively reduce quality until it fits
 *    or minQuality is reached.
 *
 * Returns the original file unchanged if it's already under targetSize.
 */
export async function compressImage(
  file: File,
  options?: CompressOptions
): Promise<File> {
  const {
    targetSize = DEFAULT_TARGET_SIZE,
    maxDimension = MAX_DIMENSION,
    initialQuality = 0.85,
    minQuality = 0.5,
  } = options ?? {}

  // Already small enough — return as-is
  if (file.size <= targetSize) {
    return file
  }

  const img = await loadImage(file)
  const canvas = drawToCanvas(img, maxDimension)

  // Free the object URL
  URL.revokeObjectURL(img.src)

  // Iteratively reduce quality until under targetSize
  let quality = initialQuality
  let blob = await canvasToBlob(canvas, quality)

  while (blob.size > targetSize && quality > minQuality) {
    quality -= 0.05
    blob = await canvasToBlob(canvas, quality)
  }

  // Build a new File with .jpg extension
  const baseName = file.name.replace(/\.[^.]+$/, '')
  const compressedFile = new File([blob], `${baseName}.jpg`, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  })

  return compressedFile
}
