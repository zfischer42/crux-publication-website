<script lang="ts">
	import type { Article, Content, ArticlePreview } from '$lib/services/article.types';
	import ArticlePreviewCard from '$lib/components/ArticlePreviewCard.svelte';
	import { FormatDateTime } from '$lib/services/helpers';
	import AuthorTag from '$lib/components/AuthorTag.svelte';

	export let data: { article: Article } | undefined;
	let loading = true;
	let preview: ArticlePreview;
	let content: Content[];

	$: if (data) {
		loading = false;
		preview = data.article.preview;
		console.log(preview);
		content = data.article.content;
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
		<!-- AUTHOR/DATE -->
		<div
			class="font-serif flex flex-row justify-center gap-2 text-zinc-500 mb-1 text-md md:text-md"
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
		</div>

		<!-- TITLE IMAGE -->
		<div class="mt-8 w-full">
			<img class="w-full object-contain" src={preview.image.src} alt={preview.description} />
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
						<img class="w-full object-cover mx-0" src={content?.src} alt={'Image'} />
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
