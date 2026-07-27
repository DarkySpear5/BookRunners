import { promises as fs } from 'fs'
import { extname } from 'path'
import { nativeImage, type NativeImage } from 'electron'

function scaledSize(width: number, height: number, maxDimension: number): { width: number; height: number } {
  const scale = maxDimension / Math.max(width, height)
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

async function writeResized(img: NativeImage, destPath: string): Promise<void> {
  const ext = extname(destPath).toLowerCase()
  const buffer = ext === '.jpg' || ext === '.jpeg' ? img.toJPEG(92) : img.toPNG()
  await fs.writeFile(destPath, buffer)
}

/**
 * Copies byte-for-byte if the source is already within `maxDimension` on its
 * long edge (no quality loss, no wasted work); otherwise resizes
 * proportionally and re-encodes. Uses Electron's built-in `nativeImage`
 * rather than adding sharp/jimp — this machine has hit native-binding
 * install problems before (see @tailwindcss/oxide), and nativeImage is
 * already a dependency of Electron itself.
 */
export async function saveCappedImage(sourcePath: string, destPath: string, maxDimension: number): Promise<void> {
  const img = nativeImage.createFromPath(sourcePath)
  const { width, height } = img.getSize()
  if (width <= maxDimension && height <= maxDimension) {
    await fs.copyFile(sourcePath, destPath)
    return
  }
  await writeResized(img.resize({ ...scaledSize(width, height, maxDimension), quality: 'best' }), destPath)
}

/** Same as saveCappedImage, but for an in-memory buffer (e.g. a base64-embedded image from a .brprofile import). */
export async function saveCappedImageBuffer(
  sourceBuffer: Buffer,
  destPath: string,
  maxDimension: number
): Promise<void> {
  const img = nativeImage.createFromBuffer(sourceBuffer)
  const { width, height } = img.getSize()
  if (width <= maxDimension && height <= maxDimension) {
    await fs.writeFile(destPath, sourceBuffer)
    return
  }
  await writeResized(img.resize({ ...scaledSize(width, height, maxDimension), quality: 'best' }), destPath)
}
