<script lang="ts">
	import { onMount } from 'svelte';
	import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

	export let journal: { name: string; title: string };
	let pdf_url: string = `/journal_pdfs/${journal.name}.pdf`;
	let thumbnail: string = `/journal_thumbnails/${journal.name}.png`;

	let pdfDoc: PDFDocumentProxy | null = null;
	let page = 1;
	let canvasEl: HTMLCanvasElement;
	let loading = false;
	let error: string | null = null;
	let open = false;

	async function renderPage(p: number) {
		if (!pdfDoc) return;
		loading = true;
		error = null;
		try {
			const pdfPage = await pdfDoc.getPage(p);
			// Container dimensions
			const container = canvasEl.parentElement as HTMLElement;
			const availableHeight = container.clientHeight;
			const availableWidth = container.clientWidth;
			// Get natural size at scale=1
			const tempViewport = pdfPage.getViewport({ scale: 1 });
			// Compute scale to fit both height and width
			const heightScale = availableHeight / tempViewport.height;
			// Always fit height and apply the 8.5×11 aspect ratio
			const aspectRatio = 8.5 / 11;
			// Compute target logical width based on height
			const targetWidth = availableHeight * (8.5 / 11);
			// If PDF page width at heightScale exceeds container width, shrink heightScale accordingly
			const widthBasedHeightScale = availableWidth / tempViewport.width;
			let ratioScale = heightScale;
			if (tempViewport.width * heightScale > availableWidth) {
				// fallback: scale by width
				ratioScale = widthBasedHeightScale;
			}
			// Account for device pixel ratio
			const pixelRatio = window.devicePixelRatio || 1;
			const finalScale = ratioScale * pixelRatio;
			// Create viewport
			const viewport = pdfPage.getViewport({ scale: finalScale });

			// Resize canvas buffer
			canvasEl.width = viewport.width;
			canvasEl.height = viewport.height;
			// Set CSS size back to logical dims
			canvasEl.style.width = `${viewport.width / pixelRatio}px`;
			canvasEl.style.height = `${viewport.height / pixelRatio}px`;

			// Render
			const ctx = canvasEl.getContext('2d')!;
			await pdfPage.render({ canvasContext: ctx, viewport }).promise;
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			loading = false;
		}
	}

	function openModal() {
		open = true;
		page = 1;
		if (pdfDoc) renderPage(page);
		window.addEventListener('keydown', handleKeydown);
	}

	function closeModal() {
		open = false;
		error = null;
		window.removeEventListener('keydown', handleKeydown);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') closeModal();
	}

	onMount(async () => {
		if (!pdf_url) {
			error = 'No URL provided';
			return;
		}
		loading = true;
		try {
			const pdfjsLib = await import('pdfjs-dist');
			const { GlobalWorkerOptions, getDocument } = pdfjsLib as typeof import('pdfjs-dist');
			const worker = new Worker(new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url), {
				type: 'module'
			});
			GlobalWorkerOptions.workerPort = worker;
			pdfDoc = await getDocument(pdf_url).promise;
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			loading = false;
		}
	});
</script>

<!-- Open Button -->
<div class="flex flex-col items-center p-2 mx-4">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<img
		src={thumbnail}
		alt={journal.name}
		class="w-40 h-56 object-cover object-top rounded-md cursor-pointer duration-200 ease-in shadow hover:shadow-lg transform hover:scale-[1.03]"
		on:click={openModal}
	/>

	<button type="button" class="relative text-black pt-2 flex flex-col items-center text-center" on:click={openModal}>
		<span class="font-medium text-lg">{journal.name}</span>
		<span class="text-base inline-block text-black"> {journal.title} </span>
	</button>
</div>

<!-- PDF VIEWER MODAL -->
{#if open}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		aria-label="Close PDF viewer"
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[20]"
		on:click={closeModal}
		on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && closeModal()}
	>
		<!-- Modal Content -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
		<div
			role="dialog"
			aria-modal="true"
			aria-label="PDF viewer dialog"
			tabindex="-1"
			class="relative w-[90vw] h-[90vh] rounded-lg flex flex-col shadow-xl cursor-default bg-gradient-to-b from-zinc-800/75 via-[rgba(39,39,42,1)_75%] to-zinc-800"
			on:click|stopPropagation
		>
			<!-- Close Button -->
			<button
				type="button"
				aria-label="Close"
				class="absolute top-2 right-2 z-20 text-white rounded px-2 text-xl focus:outline-none cursor-pointer"
				on:click={closeModal}
			>
				✕
			</button>

			<!-- Flex layout: PDF view takes rest, controls at bottom -->
			<div class="flex flex-col h-full pt-2">
				<!-- PDF Container -->
				<div class="flex items-center justify-center overflow-hidden h-full relative">
					<canvas bind:this={canvasEl} class="h-full w-auto max-w-full max-h-full" />

					{#if loading}
						<div
							class="absolute inset-0 flex items-center justify-center bg-zinc-900 bg-opacity-80 text-black font-bold z-10"
						>
							Loading...
						</div>
					{:else if error}
						<div
							class="absolute inset-0 flex items-center justify-center bg-zinc-900 bg-opacity-80 text-red-600 font-bold z-10"
						>
							Error: {error}
						</div>
					{/if}
				</div>

				<!-- Controls -->
				{#if pdfDoc}
					<div class="w-50 justify-center flex items-center gap-2 mt-2">
						<!-- PREV PAGE -->
						<button
							type="button"
							class="px-2 py-1 text-base text-white rounded focus:outline-none cursor-pointer"
							on:click={() => page > 1 && ((page -= 1), renderPage(page))}
							disabled={page <= 1}
						>
							◀
						</button>

						<!-- Skip to Page number -->
						<input
							type="number"
							min="1"
							max={pdfDoc.numPages}
							bind:value={page}
							on:change={() => renderPage(page)}
							class="w-8 text-center text-base text-white bg-transparent border rounded border-white focus:outline-none appearance-none"
						/>
						<span class="text-base text-white">/ {pdfDoc.numPages}</span>
						<!-- NEXT PAGE -->
						<button
							type="button"
							class="px-2 py-1 text-base text-white opacity-90 rounded focus:outline-none cursor-pointer"
							on:click={() => pdfDoc && page < pdfDoc.numPages && ((page += 1), renderPage(page))}
							disabled={page >= pdfDoc.numPages}
						>
							▶
						</button>
					</div>

					<!-- Download button -->
					<div class="flex justify-center mb-2">
						<button
							type="button"
							class="text-xs font-mono inline-block text-white my-1 underline opacity-90"
							on:click={() => {
								const link = document.createElement('a');
								link.href = pdf_url;
								link.download = '';
								document.body.appendChild(link);
								link.click();
								document.body.removeChild(link);
							}}
						>
							Download
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	/* Hide number input spinners */
	input[type='number']::-webkit-outer-spin-button,
	input[type='number']::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	input[type='number'] {
		-moz-appearance: textfield;
		appearance: textfield;
	}
</style>
