import adapter from '@sveltejs/adapter-vercel';

import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter({
			images: {
				// Keep in sync with IMAGE_SIZES in src/lib/services/images.ts
				sizes: [64, 128, 256, 384, 640, 828, 1080, 1600, 2048],
				formats: ['image/avif', 'image/webp'],
				minimumCacheTTL: 60 * 60 * 24 * 30,
				domains: ['firebasestorage.googleapis.com']
			}
		})
	},
};

export default config;
