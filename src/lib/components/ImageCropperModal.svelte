<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let open = false;
	export let imageSrc = '';
	export let fileName = 'image.jpg';
	export let preset: 'article-cover' | 'article-content' | 'author-pfp' = 'article-cover';

	const dispatch = createEventDispatcher<{
		confirm: { file: File; url: string; fileName: string; width: number; height: number };
		cancel: void;
	}>();

	let activeTab: 'crop' | 'preview' = 'crop';

	let loadedImage: HTMLImageElement | null = null;
	let naturalWidth = 0;
	let naturalHeight = 0;
	let imageLoaded = false;
	let loadError = false;
	let exporting = false;

	// Transform state (in target canvas pixel coordinates)
	let zoom = 1;
	let panX = 0;
	let panY = 0;

	// Pointer dragging state
	let isDragging = false;
	let dragStartX = 0;
	let dragStartY = 0;
	let dragOriginPanX = 0;
	let dragOriginPanY = 0;

	let canvasEl: HTMLCanvasElement;
	let previewDataUrl = '';

	$: targetWidth = preset === 'author-pfp' ? 512 : 1600;
	$: targetHeight = preset === 'author-pfp' ? 512 : 1200;

	// Reload image whenever modal opens with a source
	$: if (open && imageSrc) {
		loadSourceImage(imageSrc);
	}

	function loadSourceImage(src: string) {
		imageLoaded = false;
		loadError = false;
		activeTab = 'crop';
		zoom = 1;
		panX = 0;
		panY = 0;

		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => {
			loadedImage = img;
			naturalWidth = img.naturalWidth || img.width;
			naturalHeight = img.naturalHeight || img.height;
			imageLoaded = true;
			resetTransform();
		};
		img.onerror = () => {
			loadError = true;
		};
		img.src = src;
	}

	function getBaseScale(natW: number, natH: number, targW: number, targH: number): number {
		if (!natW || !natH) return 1;
		return Math.max(targW / natW, targH / natH);
	}

	function clampPan(nextPanX: number, nextPanY: number, currentZoom: number) {
		if (!naturalWidth || !naturalHeight) return { x: 0, y: 0 };
		const baseScale = getBaseScale(naturalWidth, naturalHeight, targetWidth, targetHeight);
		const totalScale = baseScale * currentZoom;
		const drawnW = naturalWidth * totalScale;
		const drawnH = naturalHeight * totalScale;

		const maxPanX = Math.max(0, (drawnW - targetWidth) / 2);
		const maxPanY = Math.max(0, (drawnH - targetHeight) / 2);

		return {
			x: Math.max(-maxPanX, Math.min(maxPanX, nextPanX)),
			y: Math.max(-maxPanY, Math.min(maxPanY, nextPanY))
		};
	}

	function resetTransform() {
		zoom = 1;
		panX = 0;
		panY = 0;
		drawCanvas();
	}

	$: if (imageLoaded && canvasEl) {
		const clamped = clampPan(panX, panY, zoom);
		if (clamped.x !== panX || clamped.y !== panY) {
			panX = clamped.x;
			panY = clamped.y;
		}
		drawCanvas();
	}

	function drawCanvas() {
		if (!canvasEl || !loadedImage || !imageLoaded) return;
		const ctx = canvasEl.getContext('2d');
		if (!ctx) return;

		canvasEl.width = targetWidth;
		canvasEl.height = targetHeight;

		ctx.clearRect(0, 0, targetWidth, targetHeight);

		ctx.fillStyle = '#ffffff';
		ctx.fillRect(0, 0, targetWidth, targetHeight);

		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = 'high';

		const scale = getBaseScale(naturalWidth, naturalHeight, targetWidth, targetHeight) * zoom;
		const drawnW = naturalWidth * scale;
		const drawnH = naturalHeight * scale;

		const drawX = (targetWidth - drawnW) / 2 + panX;
		const drawY = (targetHeight - drawnH) / 2 + panY;

		ctx.drawImage(loadedImage, drawX, drawY, drawnW, drawnH);
	}

	function switchToPreviewTab() {
		drawCanvas();
		if (canvasEl) {
			previewDataUrl = canvasEl.toDataURL('image/jpeg', 0.92);
		}
		activeTab = 'preview';
	}

	function handlePointerDown(event: PointerEvent) {
		if (!imageLoaded || !canvasEl) return;
		isDragging = true;
		dragStartX = event.clientX;
		dragStartY = event.clientY;
		dragOriginPanX = panX;
		dragOriginPanY = panY;
		(event.currentTarget as HTMLElement)?.setPointerCapture(event.pointerId);
	}

	function handlePointerMove(event: PointerEvent) {
		if (!isDragging || !canvasEl) return;
		const rect = canvasEl.getBoundingClientRect();
		if (!rect.width || !rect.height) return;

		const scaleX = targetWidth / rect.width;
		const scaleY = targetHeight / rect.height;

		const deltaX = (event.clientX - dragStartX) * scaleX;
		const deltaY = (event.clientY - dragStartY) * scaleY;

		const clamped = clampPan(dragOriginPanX + deltaX, dragOriginPanY + deltaY, zoom);
		panX = clamped.x;
		panY = clamped.y;
		drawCanvas();
	}

	function handlePointerUp(event: PointerEvent) {
		if (!isDragging) return;
		isDragging = false;
		try {
			(event.currentTarget as HTMLElement)?.releasePointerCapture(event.pointerId);
		} catch {
			// Ignore if not captured
		}
	}

	function handleWheel(event: WheelEvent) {
		if (!imageLoaded) return;
		event.preventDefault();
		const step = event.deltaY < 0 ? 0.08 : -0.08;
		const nextZoom = Math.max(1, Math.min(3, Number((zoom + step).toFixed(2))));
		zoom = nextZoom;
		const clamped = clampPan(panX, panY, zoom);
		panX = clamped.x;
		panY = clamped.y;
		drawCanvas();
	}

	async function handleConfirm() {
		if (!canvasEl || !imageLoaded) return;
		exporting = true;
		drawCanvas();

		const baseName = fileName.replace(/\.[^/.]+$/, '') || 'image';
		const finalFileName = `${baseName}.jpg`;

		canvasEl.toBlob(
			(blob) => {
				exporting = false;
				if (!blob) return;
				const croppedFile = new File([blob], finalFileName, {
					type: 'image/jpeg',
					lastModified: Date.now()
				});
				const url = URL.createObjectURL(croppedFile);
				dispatch('confirm', {
					file: croppedFile,
					url,
					fileName: finalFileName,
					width: targetWidth,
					height: targetHeight
				});
			},
			'image/jpeg',
			0.92
		);
	}

	function handleCancel() {
		dispatch('cancel');
	}
</script>

{#if open}
	<div
		class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby="cropper-modal-title"
	>
		<div
			class="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden"
		>
			<!-- Modal Header -->
			<div class="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
				<div>
					<h2 id="cropper-modal-title" class="text-xl font-bold text-gray-900">
						{#if preset === 'author-pfp'}
							Fit Author Headshot to Grid
						{:else if preset === 'article-cover'}
							Fit Article Cover Photo to Grid
						{:else}
							Fit Article Image to Grid
						{/if}
					</h2>
					<p class="text-xs text-gray-600 mt-0.5">
						Drag and zoom to position the image inside the grid, then check the preview on site.
					</p>
				</div>

				<!-- Mode Tabs -->
				<div class="flex items-center gap-2">
					<div class="join border rounded-lg bg-white p-0.5">
						<button
							type="button"
							class="join-item btn btn-xs {activeTab === 'crop'
								? 'btn-primary text-white'
								: 'btn-ghost text-gray-700'}"
							on:click={() => (activeTab = 'crop')}
						>
							1. Fit Grid
						</button>
						<button
							type="button"
							class="join-item btn btn-xs {activeTab === 'preview'
								? 'btn-primary text-white'
								: 'btn-ghost text-gray-700'}"
							on:click={switchToPreviewTab}
						>
							2. Check Quality on Site
						</button>
					</div>
				</div>
			</div>

			<!-- Modal Body -->
			<div class="p-6 overflow-y-auto flex-1 space-y-4">
				{#if loadError}
					<div class="p-6 bg-red-50 text-red-700 rounded-lg text-center">
						Could not load this image for cropping. Please try selecting another image file.
					</div>
				{:else}
					<!-- Interactive Grid Canvas (kept mounted in DOM, hidden when on preview tab) -->
					<div class:hidden={activeTab !== 'crop'} class="space-y-3">
						<div
							class="relative mx-auto bg-zinc-900 rounded-lg overflow-hidden shadow-inner select-none flex items-center justify-center border-2 border-zinc-700"
							style="max-width: {preset === 'author-pfp' ? '400px' : '640px'}; aspect-ratio: {targetWidth} / {targetHeight};"
						>
							<canvas
								bind:this={canvasEl}
								class="w-full h-full block cursor-grab active:cursor-grabbing touch-none"
								on:pointerdown={handlePointerDown}
								on:pointermove={handlePointerMove}
								on:pointerup={handlePointerUp}
								on:pointercancel={handlePointerUp}
								on:wheel={handleWheel}
							></canvas>

							<!-- 3x3 Rule-of-Thirds Grid Overlay (Always On) -->
							<div class="pointer-events-none absolute inset-0">
								<!-- Vertical thirds -->
								<div
									class="absolute top-0 bottom-0 left-1/3 border-l border-white/60 shadow-sm"
								></div>
								<div
									class="absolute top-0 bottom-0 left-2/3 border-l border-white/60 shadow-sm"
								></div>
								<!-- Horizontal thirds -->
								<div
									class="absolute left-0 right-0 top-1/3 border-t border-white/60 shadow-sm"
								></div>
								<div
									class="absolute left-0 right-0 top-2/3 border-t border-white/60 shadow-sm"
								></div>
								<!-- Outer frame border -->
								<div class="absolute inset-0 border-2 border-white/80"></div>
							</div>

							<!-- Author Circular Headshot Guide -->
							{#if preset === 'author-pfp'}
								<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
									<div
										class="w-full h-full rounded-full border-2 border-dashed border-cyan-300 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
									></div>
								</div>
							{:else}
								<!-- Banner Safe Zone for Wide Cards (Always On for Article Images) -->
								<div class="pointer-events-none absolute inset-0 flex flex-col justify-between">
									<div
										class="w-full h-[16.67%] bg-black/35 border-b border-dashed border-cyan-300"
									></div>
									<div
										class="w-full h-[16.67%] bg-black/35 border-t border-dashed border-cyan-300"
									></div>
								</div>
							{/if}
						</div>

						<!-- Zoom Slider & Reset -->
						<div class="flex items-center justify-center gap-4 max-w-lg mx-auto pt-1">
							<span class="text-xs font-medium text-gray-600 w-16">Zoom: {zoom.toFixed(2)}×</span>
							<input
								type="range"
								min="1"
								max="3"
								step="0.02"
								bind:value={zoom}
								on:input={() => {
									const clamped = clampPan(panX, panY, zoom);
									panX = clamped.x;
									panY = clamped.y;
									drawCanvas();
								}}
								class="range range-xs range-primary flex-1"
							/>
							<button
								type="button"
								class="btn btn-xs btn-outline text-gray-700"
								on:click={resetTransform}
							>
								Reset
							</button>
						</div>
					</div>

					<!-- Visual Quality Preview Tab -->
					{#if activeTab === 'preview'}
						<div class="space-y-6">
							{#if preset === 'author-pfp'}
								<div
									class="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-gray-50 p-6 rounded-xl border"
								>
									<div class="flex flex-col items-center text-center">
										<p class="text-xs font-semibold text-gray-500 uppercase mb-2">
											About Page Card
										</p>
										<div
											class="w-36 bg-white p-3 rounded-lg shadow border flex flex-col items-center"
										>
											<img
												src={previewDataUrl}
												alt="About page preview"
												class="w-24 h-24 rounded-full object-cover mb-1"
											/>
											<p class="text-sm font-bold text-gray-800">Author Name</p>
											<p class="text-xs text-gray-500">Writer</p>
										</div>
									</div>

									<div class="flex flex-col items-center text-center">
										<p class="text-xs font-semibold text-gray-500 uppercase mb-2">
											Author Tag Pill
										</p>
										<div
											class="inline-flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1 border"
										>
											<span class="text-xs font-medium text-gray-700">Author Name</span>
											<img
												src={previewDataUrl}
												alt="Tag preview"
												class="w-5 h-5 rounded-full object-cover"
											/>
										</div>
									</div>

									<div class="flex flex-col items-center text-center">
										<p class="text-xs font-semibold text-gray-500 uppercase mb-2">
											Full Square Preview
										</p>
										<img
											src={previewDataUrl}
											alt="Full square preview"
											class="w-40 h-40 rounded-lg object-cover border shadow"
										/>
									</div>
								</div>
							{:else}
								<!-- Article Cover / Content Previews -->
								<div class="space-y-5">
									{#if preset === 'article-cover'}
										<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
											<!-- Featured Main Card Simulation -->
											<div class="border rounded-lg p-3 bg-gray-50">
												<p class="text-xs font-semibold text-gray-500 uppercase mb-2">
													Featured Card Banner
												</p>
												<div class="bg-zinc-800 rounded-lg overflow-hidden shadow">
													<img
														src={previewDataUrl}
														alt="Featured preview"
														class="w-full h-44 object-cover"
													/>
													<div class="p-3">
														<p class="text-lg font-semibold text-white">Article Title Preview</p>
													</div>
												</div>
											</div>

											<!-- Latest in Neurotech Card Simulation -->
											<div class="border rounded-lg p-3 bg-gray-50">
												<p class="text-xs font-semibold text-gray-500 uppercase mb-2">
													"The Latest in Neurotech" Card
												</p>
												<div
													class="bg-white p-3 rounded-lg border flex items-center justify-between gap-3"
												>
													<div class="flex-1">
														<p class="text-xs font-bold text-accent">Science</p>
														<p class="text-sm font-bold text-zinc-700">Article Title Preview</p>
														<p class="text-xs text-zinc-500 line-clamp-2">
															The image fills 100% of the card slot without shrinking.
														</p>
													</div>
													<div class="w-1/3 flex-none">
														<img
															src={previewDataUrl}
															alt="Card preview"
															class="w-full aspect-[4/3] object-cover rounded-lg"
														/>
													</div>
												</div>
											</div>
										</div>
									{/if}

									<!-- Full-Width Article Page Enlarged View -->
									<div class="border rounded-lg p-4 bg-white">
										<p class="text-xs font-semibold text-gray-500 uppercase mb-2">
											Enlarged Article Page View (Full Width Quality Check)
										</p>
										<img
											src={previewDataUrl}
											alt="Enlarged article preview"
											class="w-full max-w-2xl mx-auto object-contain rounded border"
										/>
									</div>
								</div>
							{/if}
						</div>
					{/if}
				{/if}
			</div>

			<!-- Modal Footer -->
			<div class="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
				<button
					type="button"
					class="btn btn-sm bg-gray-600 hover:bg-gray-700 text-white border-none"
					on:click={handleCancel}
				>
					Cancel
				</button>

				<div class="flex items-center gap-2">
					{#if activeTab === 'crop'}
						<button
							type="button"
							class="btn btn-sm btn-outline text-gray-700"
							on:click={switchToPreviewTab}
						>
							Preview Quality on Site →
						</button>
					{:else}
						<button
							type="button"
							class="btn btn-sm btn-outline text-gray-700"
							on:click={() => (activeTab = 'crop')}
						>
							← Back to Grid
						</button>
					{/if}

					<button
						type="button"
						class="btn btn-sm bg-green-600 hover:bg-green-700 text-white border-none"
						disabled={!imageLoaded || exporting}
						on:click={handleConfirm}
					>
						{exporting ? 'Processing...' : 'Apply & Use Image'}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
