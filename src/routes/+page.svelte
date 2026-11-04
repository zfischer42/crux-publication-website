<script lang="ts">
	import ArticleCardComponent from '$lib/components/ArticleCardComponent.svelte';
	import FeaturedArticleComponent from '$lib/components/FeaturedArticleComponent.svelte';
	import FeaturedSubarticleComponent from '$lib/components/FeaturedSubarticleComponent.svelte';
	import FeaturedListComponent from '$lib/components/FeaturedListComponent.svelte';
	import TextSectionComponent from '$lib/components/TextSectionComponent.svelte';

	import BackgroundComponent from '$lib/components/BackgroundComponent.svelte';
	import ArticleList from '$lib/components/ArticleList.svelte';
	import type { Article, ArticlePreview } from '$lib/services/article.types';

	import { page } from '$app/stores';

	export let data: { featuredArticles: ArticlePreview[] } | undefined;
	let loading = true;

	$: if (data) {
		loading = false;
	}

	$: authorQuery = $page.url.searchParams.get('authorSearch') || '';

	import PdfViewer from '$lib/components/PdfViewer.svelte';
	import EventViewer from '$lib/components/EventViewer.svelte';

	// List journal filenames (without extension)
	const journals = [
		{ name: 'CruX Journal 24-25', title: 'Human Subjectivity and Experience' },
		{ name: 'CruX Journal 25-26', title: 'Taking Control: Brain Bodymind And Society' }
		// { name: 'CruX Journal 25-26', title: '...' }
		// { name: 'CruX Journal 26-27', title: '...' }
	];

	// Hardcoded events (replicates Journals preview -> expands media in modal)
	const events = [
		{
			name: 'Neurotechnology Panel',
			title: 'Decoding the Brain From Neural Signals to Neurotech',
			date: 'Nov 20, 2025 • 6:00 PM – 7:00 PM PST',
			location: 'Gonda 1357, UCLA',
			thumbnail: '/events/neurotech_panel_media/panel_flyer_1.png',
			badge: 'Panel Discussion',
			dateLocation: 'Nov 20, 2025 • 6:00 PM – 7:00 PM PST • Gonda 1357',
			host: 'UCLA Neurotechnology Organization',
			moderators: 'Chandni Sacheti & Shivang Kulkarni',
			description: [
				'From how neurons encode information to how we translate those signals into cutting-edge technologies. This dynamic panel brought together UCLA’s leading minds across the neurotech spectrum to showcase how foundational brain science transforms into real-world devices and systems.',
				'Experts in neural coding, circuit neuroscience, brain-machine interfaces, and clinical neuroengineering explored:'
			],
			bullets: [
				'Cutting-edge trends in decoding brain signals and building neurotech',
				'How neural theory, engineering, and clinical translation converge',
				'Pathways for UCLA students to get involved in research labs and industry'
			],
			flyers: [
				{
					src: '/events/neurotech_panel_media/panel_flyer_1.png',
					alt: 'Neurotech Panel Official Flyer'
				},
				{
					src: '/events/neurotech_panel_media/panel_flyer_2.png',
					alt: 'Neurotech Panel Speakers and Moderators'
				}
			],
			speakers: [
				{
					name: 'Dr. Dario Ringach',
					topic: 'Neural population coding & computational neuroscience'
				},
				{
					name: 'Dr. Paul Mathews',
					topic: 'Brain circuits, behavior & therapeutic insights'
				},
				{
					name: 'Dr. Ahmet Arac',
					topic: 'Motor decoding & neuro-rehabilitation'
				},
				{
					name: 'Dr. Jonathan Kao',
					topic: 'Brain-machine interfaces powered by AI'
				},
				{
					name: 'Dr. Wentai Liu',
					topic: 'FDA-approved neural prosthetics & implantable tech'
				}
			],
			audioUrl: '/events/neurotech_panel_media/panel_audio.mp3'
		}
	];
</script>

<!-- HOME PAGE -->
<BackgroundComponent />

{#if data}
	<!-- Featured Section -->
	<div class="mx-auto p-3 w-full md:w-3/4 lg:w-3/5 mt-1 md:mt-5 z-10 mb-2">
		<!-- Mobile view -->
		<div class="block md:hidden col">
			<FeaturedArticleComponent preview={data.featuredArticles[0]}></FeaturedArticleComponent>
			<div class="pt-3"></div>
			<FeaturedListComponent previews={data.featuredArticles.slice(3, 6)}></FeaturedListComponent>
		</div>

		<!-- Medium+ Screens -->
		<div class="hidden md:grid grid-cols-11 grid-rows-7 gap-6">
			<div class="col-span-8 row-span-4">
				<FeaturedArticleComponent preview={data.featuredArticles[0]} />
			</div>
			<div class="col-span-3 row-span-5 col-start-9">
				<FeaturedListComponent previews={data.featuredArticles.slice(3, 6)} />
			</div>
			<div class="col-span-3 row-span-2 col-start-9 row-start-6">
				<TextSectionComponent
					title="About"
					description="At CruX Publication, we aim to drive progress in neuroscience and technology by delivering cutting-edge news and"
				/>
			</div>
			<div class="col-span-4 row-span-3 col-start-5 row-start-5">
				<FeaturedSubarticleComponent preview={data.featuredArticles[2]} />
			</div>
			<div class="col-span-4 row-span-3 col-start-1 row-start-5">
				<FeaturedSubarticleComponent preview={data.featuredArticles[1]} />
			</div>
		</div>
	</div>

	<!-- <PdfViewer url="/CruX Journal 24-25.pdf" scale={1.0} /> -->

	<!-- View Journals -->
	<div class="mx-auto px-3 w-full md:w-3/4 lg:w-3/5 md:mt-3 mb-2">
		<div class="flex flex-col h-full">
			<!-- Header -->
			<div class="relative z-10 flex-none w-full bg-gradient-to-r from-[#315AB0] to-[#07d1f9c1] p-3 rounded-t-lg md:bg-transparent md:p-0 md:rounded-none md:mb-3">
				<h2 class="text-3xl font-bold text-zinc-100 md:text-zinc-900">Journals</h2>
			</div>

			<!-- Row of journal thumbnails -->
			<div
				class=" grow w-full duration-200 ease-in bg-white md:bg-white/70 rounded-b-lg shadow hover:shadow-lg overflow-hidden"
			>
				<div class="flex flex-row justify-center overflow-x-auto p-4 items-start">
					{#each journals as journal}
						<PdfViewer {journal} />
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- View Events -->
	<div class="mx-auto px-3 w-full md:w-3/4 lg:w-3/5 md:mt-3 mb-2">
		<div class="flex flex-col h-full">
			<!-- Header -->
			<div class="relative z-10 flex-none w-full bg-gradient-to-r from-[#315AB0] to-[#07d1f9c1] p-3 rounded-t-lg md:bg-transparent md:p-0 md:rounded-none md:mb-3">
				<h2 class="text-3xl font-bold text-zinc-100 md:text-zinc-900">Events</h2>
			</div>

			<!-- Row of event thumbnails -->
			<div
				class="grow w-full duration-200 ease-in bg-white md:bg-white/70 rounded-b-lg shadow hover:shadow-lg overflow-hidden"
			>
				<div class="flex flex-row justify-center overflow-x-auto p-4 items-start">
					{#each events as event}
						<EventViewer {event} />
					{/each}
				</div>
			</div>
		</div>
	</div>

	<ArticleList
		articles={data.featuredArticles}
		header="The Latest in Neurotech"
		includeSearch={true}
		searchFromUrl={authorQuery}
	/>
{/if}
