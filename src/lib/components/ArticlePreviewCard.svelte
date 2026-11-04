<script lang="ts">
	import type { Article, ArticlePreview } from '$lib/services/article.types';
	const LoadingGif = '/Loading.gif';
	import { dummyPreview } from '$lib/services/dummy';
	import { FormatDateTime } from '$lib/services/helpers';
	import AuthorTag from './AuthorTag.svelte';
	import OptimizedImage from './OptimizedImage.svelte';

	export let preview: ArticlePreview = dummyPreview;
</script>

<a href={preview.slug ? `/article/${preview.slug}` : undefined}>
	<div class="p-6 ease-in duration-200 hover:bg-zinc-200/75 text-zinc-500 group">
		<!-- SMALL SCREEN COLUMN -->
		<div class="flex flex-col md:hidden">
			<OptimizedImage
				class="w-max-full aspect-[2/1] object-cover rounded-lg"
				src={preview.image.src}
				alt={preview.description}
				width={640}
			/>

			<!-- Category -->
			<p class="flex-none text-md text-accent font-bold mt-1">{preview.categories[0]}</p>
			<!-- Title -->
			<p
				class="flex-none text-xl font-bold text-zinc-700 group-hover:text-accent ease-in duration-200"
			>
				{preview.title}
			</p>
			<!-- Description -->
			<p class="flex-none text-md group-hover:text-zinc-700 ease-in duration-200">
				{preview.description}
			</p>

			<!-- Author/date -->
			<div class="flex flex-wrap items-center gap-y-1 text-zinc-700 group-hover:text-zinc-800 ease-in duration-200">
				{#if preview.authors && preview.authors.length > 0}
					<div class="flex flex-wrap items-center gap-2 pe-5">
						{#each preview.authors as authorId, index}
							{#key `${preview.slug}-${authorId}-${index}`}
								<AuthorTag {authorId} />
							{/key}
						{/each}
					</div>
				{:else}
					<p class="font-bold pe-5">{preview.author}</p>
				{/if}
				<p>{FormatDateTime(preview.date)}</p>
			</div>
		</div>

		<!-- LARGE SCREENS, WIDE COLUMN -->
		<div class="hidden md:flex flex-row justify-between">
			<div class="flex flex-col me-5">
				<!-- Category -->
				<p class="flex-none text-lg text-accent font-bold">{preview.categories[0]}</p>

				<!-- Title -->
				<p
					class="flex-none text-2xl font-bold text-zinc-700 group-hover:text-accent ease-in duration-200"
				>
					{preview.title}
				</p>

				<!-- Description -->
				<p class="flex-none text-lg group-hover:text-zinc-700 ease-in duration-200">
					{preview.description}
				</p>

				<div class="grow"></div>

				<!-- Author/date -->
				<div class="flex flex-wrap items-center gap-y-1 text-zinc-700 group-hover:text-zinc-800 ease-in duration-200">
					{#if preview.authors && preview.authors.length > 0}
						<div class="flex flex-wrap items-center gap-2 pe-5">
							{#each preview.authors as authorId, index}
								{#key `${preview.slug}-${authorId}-${index}`}
									<AuthorTag {authorId} />
								{/key}
							{/each}
						</div>
					{:else}
						<p class="font-bold pe-5">{preview.author}</p>
					{/if}
					<p>{FormatDateTime(preview.date)}</p>
				</div>
			</div>

			<div class="flex-none w-1/3">
				<!-- Image -->
				<OptimizedImage
					class="w-max-full aspect-[4/3] object-cover rounded-lg"
					src={preview.image.src}
					alt={preview.description}
					width={384}
				/>
			</div>
		</div>
	</div>
</a>
