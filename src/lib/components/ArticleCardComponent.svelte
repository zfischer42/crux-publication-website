<script lang="ts">
	import type { ArticlePreview } from '$lib/services/article.types';
	const LoadingGif = '/Loading.gif';
	import { dummyArticle, dummyPreview } from '$lib/services/dummy';
	import AuthorTag from './AuthorTag.svelte';
	import OptimizedImage from './OptimizedImage.svelte';

	export let preview: ArticlePreview = dummyPreview;
</script>

<a href="/article/{preview.slug}">
	<div
		class="group flex flex-col sm:flex-row mt-4 rounded-xl bg-white/75 transition duration-200 ease-in hover:shadow hover:brightness-95 border"
	>
		<div class="flex sm:flex-none w-auto sm:w-2/5 justify-center text-zinc-900">
			<OptimizedImage
				class="object-cover h-48 w-96 rounded-xl sm:rounded-r-none"
				src={preview.image.src}
				alt="Album"
				width={384}
			/>
		</div>
		<div class="p-4 flex flex-col justify-between">
			<div>
				<h1 class="text-2xl text-primary font-bold">{preview.title}</h1>
				<h2 class="text pt-1 pb-2 text-zinc-500 md:line-clamp-3">{preview.description}</h2>
			</div>
			<div class="flex flex-row justify-between text-zinc-500">
				<div class="flex flex-wrap items-center gap-2">
					{#if preview.authors && preview.authors.length > 0}
						<div class="flex items-center gap-2">
							{#each preview.authors as authorId}
								<AuthorTag {authorId} />
							{/each}
						</div>
					{:else}
						<b>{preview.author}</b>
					{/if}
					<span>{preview.date}</span>
					<span>•</span>
					<span class="inline-flex items-center gap-1" title="{(preview.views ?? 0).toLocaleString()} {(preview.views ?? 0) === 1 ? 'view' : 'views'}">
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
						{(preview.views ?? 0).toLocaleString()}
					</span>
				</div>
				<div>
					<a
						href="/archive/{preview.categories[0]}"
						class="hover:text-success text-accent font-bold font-mono">{preview.categories[0]}</a
					>
				</div>
			</div>
		</div>
	</div>
</a>
