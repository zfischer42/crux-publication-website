# TinyMCE Developer Documentation

This document explains how **TinyMCE** is integrated, configured, persisted, and rendered in the CruX Publication website for future developers.

---

## 1. Architecture Overview

TinyMCE is used in the `/backdoor/articles` editor for rich-text paragraph blocks. It uses the official Svelte wrapper (`@tinymce/tinymce-svelte`) paired with a **self-hosted** TinyMCE v7 bundle in `static/tinymce/`.

| File / Directory | Role |
| :--- | :--- |
| `static/tinymce/tinymce.min.js` | Self-hosted TinyMCE v7 runtime, themes, skins, icons, and plugins. |
| [`src/routes/backdoor/articles/+page.svelte`](../src/routes/backdoor/articles/+page.svelte) | Mounts the `<Editor />` component and defines `tinymceConfig`. |
| [`src/lib/services/article.types.ts`](../src/lib/services/article.types.ts) | Defines the `Content` interface (`{ type: 'paragraph', text?: string }`). |
| [`src/lib/services/firebase.client.ts`](../src/lib/services/firebase.client.ts) | `addArticle()` persists the `Content[]` array to Firestore (`article-content/{slug}`). |
| [`src/routes/article/[slug]/+page.svelte`](../src/routes/article/%5Bslug%5D/+page.svelte) | Renders saved paragraph HTML on the public article page via `{@html content.text}`. |

---

## 2. Self-Hosting & Licensing (`static/tinymce`)

Instead of loading TinyMCE from TinyCloud (which requires an API key and domain allowlisting), this project self-hosts the open-source bundle in `static/tinymce/`:

```svelte
<!-- src/routes/backdoor/articles/+page.svelte -->
<Editor
	licenseKey="gpl"
	scriptSrc="/tinymce/tinymce.min.js"
	bind:value={field.text}
	conf={tinymceConfig}
/>
```

* **`licenseKey="gpl"`**: Required by TinyMCE v7+ when self-hosting under the GPLv2+ license to disable the unlicensed API key warning banner.
* **`scriptSrc="/tinymce/tinymce.min.js"`**: Directs `@tinymce/tinymce-svelte` to load TinyMCE from SvelteKit's `static/tinymce/` assets instead of TinyMCE's CDN.

### Upgrading TinyMCE
If you update `"tinymce"` in `package.json`, npm only updates `node_modules/tinymce/`. Because the app loads `/tinymce/tinymce.min.js` from `static/tinymce/`, you **must** copy the updated files from `node_modules/tinymce/` into `static/tinymce/` (including `icons/`, `models/`, `plugins/`, `skins/`, and `themes/`) to actually upgrade the editor runtime.

---

## 3. Configuration (`tinymceConfig`)

The editor configuration is defined in [`src/routes/backdoor/articles/+page.svelte`](../src/routes/backdoor/articles/+page.svelte#L51-L64):

```ts
let tinymceConfig = {
	menubar: true,
	height: 300,
	plugins: 'link code',
	setup(editor) {
		// Listen for keydown event to handle Tab key
		editor.on('keydown', function (e) {
			if (e.key === 'Tab') {
				e.preventDefault(); // Prevent default tab behavior
				editor.execCommand('mceInsertContent', false, '&emsp;&emsp;'); // Insert tab character
			}
		});
	}
};
```

### Customizing Plugins & Toolbar Controls
All standard TinyMCE plugins are already bundled inside `static/tinymce/plugins/` (including `lists`, `table`, `image`, `media`, `wordcount`, `autolink`, `autoresize`, `charmap`, `preview`, `searchreplace`, etc.).

To enable additional features:
1. Add the plugin name to the space-separated `plugins` string in `tinymceConfig`.
2. Add a `toolbar` string if you want specific controls pinned to the main toolbar:
   ```ts
   let tinymceConfig = {
   	menubar: true,
   	height: 300,
   	plugins: 'link code lists table wordcount',
   	toolbar: 'undo redo | blocks | bold italic underline | bullist numlist | link table code',
   	setup(editor) {
   		// ...
   	}
   };
   ```

---

## 4. Data Flow & Frontend Rendering

1. **Block State (`fields`):**
   In `/backdoor/articles`, clicking **+ Paragraph** appends `{ type: 'paragraph' }` to the `fields: Content[]` array.
2. **Two-Way Binding:**
   `<Editor bind:value={field.text} />` binds the editor's HTML output string directly to `field.text`.
3. **Validation:**
   On submit, `validateFields()` in [`src/routes/backdoor/articles/+page.svelte`](../src/routes/backdoor/articles/+page.svelte#L227-L233) checks that every `{ type: 'paragraph' }` entry has a non-empty `field.text`.
4. **Firestore Persistence:**
   `addArticle()` in [`src/lib/services/firebase.client.ts`](../src/lib/services/firebase.client.ts#L119-L128) strips temporary file/DOM references and writes `{ preview, content }` to the `article-content/{slug}` document.
5. **Public Rendering (`{@html}`):**
   In [`src/routes/article/[slug]/+page.svelte`](../src/routes/article/%5Bslug%5D/+page.svelte#L91-L94), paragraph blocks are injected as raw HTML:
   ```svelte
   {:else if content.type === 'paragraph'}
   	<div class="mb-7 text-base leading-0 md:text-lg 2xl:leading-7">{@html content.text}</div>
   ```

---

## 5. Known Gotchas & Maintenance Notes

* **Tailwind CSS Reset vs. `{@html}`:**
  Tailwind's Preflight resets default browser styles on headings (`<h1>`–`<h6>`), lists (`<ul>`, `<ol>`), blockquotes, and links (`<a>`). Because `{@html content.text}` outputs unscoped HTML inside `/article/[slug]`, enabling list or heading plugins in TinyMCE will require either custom descendant CSS rules in `src/routes/article/[slug]/+page.svelte` or `@tailwindcss/typography` (`prose` classes) to display bullets/numbers and link styles properly.
* **First-Paragraph Drop Cap:**
  In [`src/routes/article/[slug]/+page.svelte`](../src/routes/article/%5Bslug%5D/+page.svelte#L68), the article wrapper applies `first-letter:text-7xl first-letter:font-bold first-letter:me-3 first-letter:float-start` if `data.article.content[0]?.type === 'paragraph'`. Pasted inline styles or leading empty tags (`<p>&nbsp;</p>`) from TinyMCE in the first block can interfere with the `:first-letter` pseudo-element.
* **Pasted Inline Styles (Google Docs / Word):**
  Pasting rich text from Google Docs or Word into TinyMCE retains inline `style="..."` attributes (such as `font-family: Arial`), which override the site's `font-serif` class. If this becomes a recurring issue, consider adding TinyMCE's `paste_as_text: true` option or configuring `invalid_styles: 'font-family font-size'` in `tinymceConfig`.
* **Multiple Editor Instances:**
  Each `+ Paragraph` block mounts a separate TinyMCE iframe. Articles with many separate paragraph blocks can take longer to initialize in `/backdoor/articles`.
