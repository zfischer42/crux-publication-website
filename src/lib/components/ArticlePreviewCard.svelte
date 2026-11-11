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
				class="w-full aspect-[2/1] object-cover rounded-lg"
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

			<!-- Author/date/views -->
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
				<div class="flex items-center gap-2 text-zinc-500">
					<p>{FormatDateTime(preview.date)}</p>
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

				<!-- Author/date/views -->
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
					<div class="flex items-center gap-2 text-zinc-500">
						<p>{FormatDateTime(preview.date)}</p>
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
				</div>
			</div>

			<div class="flex-none w-1/3">
				<!-- Image -->
				<OptimizedImage
					class="w-full aspect-[4/3] object-cover rounded-lg"
					src={preview.image.src}
					alt={preview.description}
					width={384}
				/>
			</div>
		</div>
	</div>
</a>
