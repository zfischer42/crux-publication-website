import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

function copyTinymcePlugin() {
	return {
		name: 'copy-tinymce',
		configResolved() {
			const src = path.resolve('node_modules/tinymce');
			const dest = path.resolve('static/tinymce');
			if (fs.existsSync(src) && !fs.existsSync(path.join(dest, 'tinymce.min.js'))) {
				fs.cpSync(src, dest, { recursive: true });
			}
		}
	};
}

export default defineConfig({
	plugins: [
		copyTinymcePlugin(),
		sveltekit()
	],
	define: {
		// Vercel sets VERCEL=1 during its builds; /_vercel/image only exists there.
		__VERCEL_IMAGES__: JSON.stringify(!!process.env.VERCEL)
	},
	ssr: {
		noExternal: ['pdfjs-dist'],
		// Keep Svelte 4 unbundled on the server. Bundling reformats its no-op onMount, which breaks
		// SvelteKit's Svelte 4 detection and crashes SSR with "$state is not defined".
		// Remove after migrating to Svelte 5.
		external: ['svelte']
	}
});
