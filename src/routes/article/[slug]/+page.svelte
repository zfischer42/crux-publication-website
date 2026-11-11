<script lang="ts">
	import { browser } from '$app/environment';
	import type { Article, Content, ArticlePreview } from '$lib/services/article.types';
	import ArticlePreviewCard from '$lib/components/ArticlePreviewCard.svelte';
	import { FormatDateTime } from '$lib/services/helpers';
	import { incrementArticleViews } from '$lib/services/firebase.services';
	import AuthorTag from '$lib/components/AuthorTag.svelte';
	import OptimizedImage from '$lib/components/OptimizedImage.svelte';

	export let data: { article: Article } | undefined;
	let loading = true;
	let preview: ArticlePreview;
	let content: Content[];
	let viewCount = 0;
	let lastTrackedSlug = '';

	$: if (data) {
		loading = false;
		preview = data.article.preview;
		content = data.article.content;

		if (preview?.slug && preview.slug !== lastTrackedSlug) {
			lastTrackedSlug = preview.slug;
			viewCount = preview.views ?? 0;

			if (browser) {
				const storageKey = `crux_viewed_${preview.slug}`;
				if (!sessionStorage.getItem(storageKey)) {
					sessionStorage.setItem(storageKey, '1');
					viewCount += 1;
					incrementArticleViews(preview.slug);
				}
			}
		}
	}
</script>

{#if data}
	<div class="flex flex-col mx-auto px-4 max-w-prose z-0">
		<!-- TITLE -->
		<div
			class="mb-2 font-serif text-primary text-center
                text-4xl md:text-4xl mt-8"
		>
			{preview.title}
		</div>
		<!-- AUTHOR/DATE/VIEWS -->
		<div
			class="font-serif flex flex-wrap items-center justify-center gap-2 text-zinc-500 mb-1 text-md md:text-md"
		>
			{#if preview.authors && preview.authors.length > 0}
				<div class="flex items-center gap-2">
					{#each preview.authors as authorId}
						<AuthorTag {authorId} />
					{/each}
				</div>
			{:else}
				<p class="underline">{preview.author}</p>
			{/if}
			<p>•</p>
			<p>{FormatDateTime(preview.date)}</p>
			<p>•</p>
			<div class="flex items-center gap-1" title="{viewCount.toLocaleString()} {viewCount === 1 ? 'view' : 'views'}">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					class="w-4 h-4 opacity-75"
					aria-hidden="true"
				>
					<path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
					<path
						fill-rule="evenodd"
						d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
						clip-rule="evenodd"
					/>
				</svg>
				<span>{viewCount.toLocaleString()} {viewCount === 1 ? 'view' : 'views'}</span>
			</div>
		</div>

		<!-- TITLE IMAGE -->
		<div class="mt-8 w-full">
			<OptimizedImage
				class="w-full object-contain"
				src={preview.image.src}
				alt={preview.description}
				width={700}
				eager
			/>
			{#if preview.image.credits && preview.image.credits.trim() !== ''}
				<p class="text-zinc-500 mt-2 font-serif text-sm font-light text-center italic">
					{preview.image.credits}
				</p>
			{/if}
		</div>

		<!-- DIVIDER -->
		<!-- <hr class="w-3/4 mx-auto border-zinc-400" /> -->

		<!-- ARTICLE CONTENT -->
		<div
			class={`font-serif mt-10 ${data.article.content[0]?.type === 'paragraph' ? 'first-letter:text-7xl first-letter:font-bold first-letter:me-3 first-letter:float-start' : ''}`}
		>
			{#each data.article.content as content, index}
				{#if content.type === 'image'}
					<!-- IMAGE -->
					<div class="mb-7">
						<OptimizedImage
							class="w-full object-cover mx-0"
							src={content?.src}
							alt={'Image'}
							width={700}
						/>
						{#if content.credits && content.credits.trim() !== ''}
							<p class="text-zinc-500 mt-2 font-serif text-sm font-light text-center italic">
								{content.credits}
							</p>
						{/if}
					</div>
				{:else if content.type === 'header'}
					<!-- HEADER -->
					<p class="mb-4 text-xl leading-7 font-[550] md:text-2xl">
						{content.text}
					</p>
				{:else if content.type === 'paragraph'}
					<!-- PARAGRAPH -->
					<div class="mb-7 text-base leading-0 md:text-lg 2xl:leading-7">{@html content.text}</div>
				{:else if content.type === 'video'}
					<!-- VIDEO -->
					<div
						class="rounded-lg md:rounded-xl lg:rounded-2xl w-full mx-auto aspect-[16/9] overflow-hidden mb-6"
					>
						<iframe
							class="w-full h-full"
							src={content?.src}
							title="YouTube video player"
							frameborder="0"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowfullscreen
						>
						</iframe>
					</div>
				{:else if content.type === 'custom_html'}
					<!-- PARAGRAPH -->
					<div class="mb-4 text-base">{@html content.text}</div>
				{/if}
			{/each}
		</div>
	</div>
{:else}
	<div>LOADING</div>
{/if}

<style>
</style>
