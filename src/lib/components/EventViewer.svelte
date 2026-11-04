<script lang="ts">
	import { onDestroy } from 'svelte';
	import OptimizedImage from './OptimizedImage.svelte';

	export let event: {
		name: string;
		title: string;
		date?: string;
		location?: string;
		thumbnail: string;
		badge?: string;
		dateLocation?: string;
		host?: string;
		moderators?: string;
		description?: string[];
		bullets?: string[];
		flyers?: { src: string; alt: string }[];
		speakers?: { name: string; topic: string }[];
		audioUrl?: string;
	};

	let open = false;
	let selectedImage: { src: string; alt: string } | null = null;

	function openModal() {
		open = true;
		if (typeof window !== 'undefined') {
			window.addEventListener('keydown', handleKeydown);
		}
	}

	function closeModal() {
		if (selectedImage) {
			selectedImage = null;
			return;
		}
		open = false;
		if (typeof window !== 'undefined') {
			window.removeEventListener('keydown', handleKeydown);
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') closeModal();
	}

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('keydown', handleKeydown);
		}
	});
</script>

<!-- Open Button (replicates PdfViewer thumbnail & label in Journals section, with date & location details) -->
<div class="relative z-10 flex flex-col items-center p-2 mx-4 max-w-[16rem]">
	<OptimizedImage
		src={event.thumbnail}
		alt={event.name}
		class="w-40 h-56 object-cover object-top rounded-md cursor-pointer duration-200 ease-in shadow hover:shadow-lg transform hover:scale-[1.03]"
		width={160}
		on:click={openModal}
	/>

	<button
		type="button"
		class="relative text-black pt-2 flex flex-col items-center text-center cursor-pointer"
		on:click={openModal}
	>
		{#if event.badge}
			<span
				class="bg-[#315AB0] text-white text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide mb-1"
			>
				{event.badge}
			</span>
		{/if}
		<span class="font-medium text-lg leading-snug">{event.name}</span>
		<span class="text-base inline-block text-black leading-snug mt-0.5">{event.title}</span>
		{#if event.date}
			<span class="text-xs font-medium text-zinc-600 mt-1.5">{event.date}</span>
		{/if}
		{#if event.location}
			<span class="text-xs text-zinc-500">{event.location}</span>
		{/if}
	</button>
</div>

<!-- EXPANDED EVENT MEDIA MODAL (no route redirect) -->
{#if open}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		aria-label="Close event viewer"
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[20] p-4"
		on:click={() => {
			selectedImage = null;
			open = false;
		}}
		on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && closeModal()}
	>
		<!-- Modal Content -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
		<div
			role="dialog"
			aria-modal="true"
			aria-label={event.title}
			tabindex="-1"
			class="relative w-[90vw] max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg flex flex-col shadow-xl cursor-default bg-gradient-to-b from-zinc-800/75 via-[rgba(39,39,42,1)_75%] to-zinc-800 p-5 md:p-7 text-zinc-100"
			on:click|stopPropagation
		>
			<!-- Close Button -->
			<button
				type="button"
				aria-label="Close"
				class="absolute top-3 right-3 z-20 text-white rounded px-2 text-xl focus:outline-none cursor-pointer"
				on:click={() => {
					selectedImage = null;
					open = false;
				}}
			>
				✕
			</button>

			<!-- Event Badge and Date -->
			<div class="flex flex-wrap items-center gap-2 mb-3 pr-8">
				{#if event.badge}
					<span
						class="bg-[#315AB0] text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide"
					>
						{event.badge}
					</span>
				{/if}
				{#if event.dateLocation}
					<span class="text-sm font-medium text-zinc-300">
						{event.dateLocation}
					</span>
				{/if}
			</div>

			<!-- Event Title -->
			<h3 class="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
				{event.name}: {event.title}
			</h3>

			<!-- Host & Moderators -->
			{#if event.host || event.moderators}
				<p class="text-sm text-zinc-300 mb-4">
					{#if event.host}
						<span class="font-semibold text-white">Hosted by CruX</span> | {event.host}
					{/if}
					{#if event.moderators}
						<span class="hidden sm:inline mx-1.5 text-zinc-400">•</span>
						<span class="block sm:inline mt-1 sm:mt-0 text-zinc-300">
							Co-moderated by <span class="font-medium text-white">{event.moderators}</span>
						</span>
					{/if}
				</p>
			{/if}

			<!-- Flyer Images & Content Grid -->
			<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start my-4">
				<!-- Flyers Display -->
				{#if event.flyers && event.flyers.length > 0}
					<div
						class="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center items-center"
					>
						<div class="flex flex-row gap-3 w-full justify-center">
							{#each event.flyers as flyer}
								<button
									type="button"
									class="relative group cursor-pointer overflow-hidden rounded-lg shadow-md border border-zinc-600 bg-zinc-900 max-w-[210px] flex-1 text-left p-0 focus:outline-none focus:ring-2 focus:ring-[#315AB0]"
									on:click={() => (selectedImage = flyer)}
								>
									<img
										src={flyer.src}
										alt={flyer.alt}
										class="w-full h-auto object-cover transform duration-200 ease-out group-hover:scale-105 pointer-events-none"
									/>
									<span
										class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold tracking-wider uppercase transition-opacity"
									>
										Click to Enlarge
									</span>
								</button>
							{/each}
						</div>
						<p class="text-xs text-zinc-300 italic text-center">
							Click either flyer to view high-resolution poster
						</p>
					</div>
				{/if}

				<!-- Event Description and Speakers -->
				<div class="lg:col-span-7 flex flex-col gap-4 text-zinc-200">
					{#if event.description}
						<div class="text-base leading-relaxed space-y-3">
							{#each event.description as paragraph}
								<p>{paragraph}</p>
							{/each}
							{#if event.bullets && event.bullets.length > 0}
								<ul class="list-disc list-inside space-y-1 text-sm text-zinc-300 pl-1">
									{#each event.bullets as bullet}
										<li>{bullet}</li>
									{/each}
								</ul>
							{/if}
						</div>
					{/if}

					<!-- Featured Speakers -->
					{#if event.speakers && event.speakers.length > 0}
						<div class="mt-2 pt-3 border-t border-zinc-600">
							<h4 class="text-sm font-semibold uppercase tracking-wider text-zinc-200 mb-2.5">
								Featured Panelists
							</h4>
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
								{#each event.speakers as speaker}
									<div class="bg-zinc-900/60 border border-zinc-700 rounded-md p-2.5">
										<div class="font-semibold text-white">{speaker.name}</div>
										<div class="text-xs text-zinc-300 mt-0.5">{speaker.topic}</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>

			<!-- Audio Recording Player -->
			{#if event.audioUrl}
				<div
					class="mt-4 pt-5 bg-zinc-900/60 p-4 md:p-5 rounded-lg border border-zinc-700"
				>
					<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
						<div class="flex items-center gap-2">
							<span class="flex h-3 w-3 relative">
								<span class="relative inline-flex rounded-full h-3 w-3 bg-[#07d1f9]"></span>
							</span>
							<h4 class="text-base font-bold text-white">Listen to the Panel Recording</h4>
						</div>
						<a
							href={event.audioUrl}
							download="Neurotech_Panel_Recording.mp3"
							class="text-xs font-mono text-[#07d1f9] hover:underline flex items-center gap-1 self-start sm:self-auto"
						>
							Download Audio (.mp3)
						</a>
					</div>
					<p class="text-xs text-zinc-300 mb-3">
						Tune in to the complete live conversation with UCLA researchers discussing brain-machine
						interfaces, motor decoding, and neuroprosthetics.
					</p>
					<audio
						controls
						preload="metadata"
						class="w-full accent-[#315AB0] rounded"
						aria-label="Neurotechnology Panel Audio Recording"
					>
						<source src={event.audioUrl} type="audio/mpeg" />
						Your browser does not support the audio element.
					</audio>
				</div>
			{/if}
		</div>
	</div>
{/if}

<!-- High-Resolution Flyer Lightbox -->
{#if selectedImage}
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		aria-label="Close image viewer"
		class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
		on:click={() => (selectedImage = null)}
		on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && (selectedImage = null)}
	>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
		<div
			role="dialog"
			aria-modal="true"
			aria-label="Flyer image preview"
			tabindex="-1"
			class="relative max-w-2xl max-h-[90vh] flex flex-col items-center"
			on:click|stopPropagation
		>
			<button
				type="button"
				aria-label="Close"
				class="absolute -top-10 right-0 text-white hover:text-zinc-300 text-2xl font-bold cursor-pointer"
				on:click={() => (selectedImage = null)}
			>
				✕
			</button>
			<img
				src={selectedImage.src}
				alt={selectedImage.alt}
				class="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-zinc-700"
			/>
		</div>
	</div>
{/if}
