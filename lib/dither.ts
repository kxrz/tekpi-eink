import sharp from "sharp";

export const ACEP_PALETTE: [number, number, number][] = [
  [0, 0, 0],
  [255, 255, 255],
  [0, 255, 0],
  [0, 0, 255],
  [255, 0, 0],
  [255, 255, 0],
  [255, 128, 0],
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function findNearestPaletteColor(
  r: number,
  g: number,
  b: number,
): [number, number, number] {
  let bestR = ACEP_PALETTE[0][0];
  let bestG = ACEP_PALETTE[0][1];
  let bestB = ACEP_PALETTE[0][2];
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const [pr, pg, pb] of ACEP_PALETTE) {
    const dr = r - pr;
    const dg = g - pg;
    const db = b - pb;
    const distance = dr * dr + dg * dg + db * db;

    if (distance < bestDistance) {
      bestDistance = distance;
      bestR = pr;
      bestG = pg;
      bestB = pb;
    }
  }

  return [bestR, bestG, bestB];
}

function pixelIndex(x: number, y: number, width: number, channel: number): number {
  return (y * width + x) * 3 + channel;
}

function addError(
  pixels: Float32Array,
  x: number,
  y: number,
  width: number,
  height: number,
  channel: number,
  amount: number,
): void {
  if (x < 0 || x >= width || y < 0 || y >= height) {
    return;
  }

  const index = pixelIndex(x, y, width, channel);
  pixels[index] += amount;
}

// Controls how much of the quantization error is diffused to neighbours.
// 1.0 = classic Floyd-Steinberg (maximum grain), 0.0 = no dithering.
const ERROR_DIFFUSION = 0.65;

export async function ditherToACeP(
  rawBuffer: Buffer,
  width: number,
  height: number,
): Promise<Buffer> {
  const pixelCount = width * height * 3;
  const pixels = new Float32Array(pixelCount);

  for (let i = 0; i < pixelCount; i++) {
    pixels[i] = rawBuffer[i];
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const baseIndex = pixelIndex(x, y, width, 0);

      const currentR = pixels[baseIndex];
      const currentG = pixels[baseIndex + 1];
      const currentB = pixels[baseIndex + 2];

      const oldR = clamp(currentR, 0, 255);
      const oldG = clamp(currentG, 0, 255);
      const oldB = clamp(currentB, 0, 255);

      const [newR, newG, newB] = findNearestPaletteColor(oldR, oldG, oldB);

      pixels[baseIndex] = newR;
      pixels[baseIndex + 1] = newG;
      pixels[baseIndex + 2] = newB;

      const errR = oldR - newR;
      const errG = oldG - newG;
      const errB = oldB - newB;

      addError(pixels, x + 1, y, width, height, 0, errR * (7 / 16) * ERROR_DIFFUSION);
      addError(pixels, x + 1, y, width, height, 1, errG * (7 / 16) * ERROR_DIFFUSION);
      addError(pixels, x + 1, y, width, height, 2, errB * (7 / 16) * ERROR_DIFFUSION);

      addError(pixels, x - 1, y + 1, width, height, 0, errR * (3 / 16) * ERROR_DIFFUSION);
      addError(pixels, x - 1, y + 1, width, height, 1, errG * (3 / 16) * ERROR_DIFFUSION);
      addError(pixels, x - 1, y + 1, width, height, 2, errB * (3 / 16) * ERROR_DIFFUSION);

      addError(pixels, x, y + 1, width, height, 0, errR * (5 / 16) * ERROR_DIFFUSION);
      addError(pixels, x, y + 1, width, height, 1, errG * (5 / 16) * ERROR_DIFFUSION);
      addError(pixels, x, y + 1, width, height, 2, errB * (5 / 16) * ERROR_DIFFUSION);

      addError(pixels, x + 1, y + 1, width, height, 0, errR * (1 / 16) * ERROR_DIFFUSION);
      addError(pixels, x + 1, y + 1, width, height, 1, errG * (1 / 16) * ERROR_DIFFUSION);
      addError(pixels, x + 1, y + 1, width, height, 2, errB * (1 / 16) * ERROR_DIFFUSION);
    }
  }

  const output = Buffer.alloc(pixelCount);

  for (let i = 0; i < pixelCount; i++) {
    output[i] = Math.round(clamp(pixels[i], 0, 255));
  }

  return sharp(output, {
    raw: {
      width,
      height,
      channels: 3,
    },
  })
    .png()
    .toBuffer();
}
