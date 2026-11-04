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
		noExternal: ['pdfjs-dist']
	}
});
