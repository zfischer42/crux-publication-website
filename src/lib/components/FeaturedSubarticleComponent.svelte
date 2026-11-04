<script lang="ts">
	import type { ArticlePreview } from '$lib/services/article.types';
	const LoadingGif = '/Loading.gif';
	import { dummyArticle, dummyPreview } from '$lib/services/dummy';
	import { FormatDateTime } from '$lib/services/helpers';
	import AuthorTag from './AuthorTag.svelte';
	import OptimizedImage from './OptimizedImage.svelte';

	export let preview: ArticlePreview = dummyPreview;
</script>

<a href="/article/{preview.slug}">
	<div
		class="w-full h-full flex flex-col bg-white/80 rounded-lg shadow duration-200 ease-in hover:bg-zinc-200/90 hover:shadow-lg group"
	>
		<OptimizedImage
			class="flex-none object-cover w-full max-h-44 rounded-t-lg"
			src={preview.image?.src}
			alt={preview.description}
			width={640}
		/>

		<!-- Title -->
		<p
			class="flex-none text-lg md:text-2xl font-bold text-zinc-700 px-4 py-2 group-hover:text-accent md:line-clamp-3 md:leading-7"
		>
			{preview.title}
		</p>

		<div class="grow"></div>

		<!-- Author/date -->
		<div class="flex flex-row justify-between text-sm md:text- px-4 pb-2 text-zinc-500">
			{#if preview.authors && preview.authors.length > 0}
				<div class="flex items-center gap-2">
					{#each preview.authors as authorId}
						<AuthorTag {authorId} />
					{/each}
				</div>
			{:else}
				<p class="text-accent font-bold">{preview.categories[0]}</p>
			{/if}
			<p>{FormatDateTime(preview.date)}</p>
		</div>
	</div>
</a>
