// Keep in sync with images.sizes in svelte.config.js
const IMAGE_SIZES = [64, 128, 256, 384, 640, 828, 1080, 1600, 2048];

function snapToSize(width: number): number {
	return IMAGE_SIZES.find((size) => size >= width) ?? IMAGE_SIZES[IMAGE_SIZES.length - 1];
}

function isOptimizable(src: string): boolean {
	return src.startsWith('/') || src.startsWith('https://firebasestorage.googleapis.com/');
}

// Local dev and preview builds serve originals.
export function optimizedSrc(src: string, width: number, quality = 75): string {
	if (!__VERCEL_IMAGES__ || !src || !isOptimizable(src)) return src;
	return `/_vercel/image?url=${encodeURIComponent(src)}&w=${snapToSize(width)}&q=${quality}`;
}

export function optimizedSrcset(src: string, width: number): string | undefined {
	if (!__VERCEL_IMAGES__ || !src || !isOptimizable(src)) return undefined;
	return `${optimizedSrc(src, width)} 1x, ${optimizedSrc(src, width * 2)} 2x`;
}
