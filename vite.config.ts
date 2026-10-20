import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
	  	sveltekit()
	],
	define: {
		// Vercel sets VERCEL=1 during its builds; /_vercel/image only exists there.
		__VERCEL_IMAGES__: JSON.stringify(!!process.env.VERCEL)
	},
	ssr: {
      noExternal: ['pdfjs-dist']
    }
});
