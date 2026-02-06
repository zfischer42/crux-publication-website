<script lang="ts">
	import type { ArticlePreview, Category } from '$lib/services/article.types';
	import { searchArticles } from '$lib/services/firebase.services';
	import ArticlePreviewCard from './ArticlePreviewCard.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores'
	import type { formatPostcssSourceMap } from 'vite';

	export let articles: ArticlePreview[];
	export let header = '';
	export let category = 'All' as Category;
	export let includeSearch = true;
	export let initialQuery = '';
	export let searchFromUrl = '';
	export let articlesPerPage = 5;

	let searchQuery = initialQuery;
	let selectedSort = 'none';
	let debounceTimeout: ReturnType<typeof setTimeout>;
	let userHasModifiedSearch = false;
	let currentPage = 1;

	// Reactive statement to handle searchFromUrl changes
	$: if (searchFromUrl && searchFromUrl !== searchQuery) {
		// Reset the flag when a new searchFromUrl is provided (new AuthorTag click)
		userHasModifiedSearch = false;
		searchQuery = searchFromUrl;
		currentPage = 1;
		runSearch(searchQuery);
		if (typeof document !== 'undefined') {
			setTimeout(() => {
				document.getElementById('search-input')?.scrollIntoView({ behavior: 'smooth' });
			}, 0);
		}
		// Clear searchFromUrl after processing to prevent interference with user input
		searchFromUrl = '';
	}

	onMount(() => {
		// Check if we have a search query from URL parameters or props
		const initial = $page.url.searchParams.get('search') ??
						$page.url.searchParams.get('authorSearch') ??
						searchFromUrl;
		
		if (initial) {
			searchQuery = initial;
			runSearch(searchQuery);
			setTimeout(() => {
				document.getElementById('search-input')?.scrollIntoView({ behavior: 'smooth' });
			}, 0);
		}
	})

	// Remove the reactive statement that was causing the text to disappear

	async function runSearch(query: string) {
		console.log('Searching for:', query);
		articles = await searchArticles(query, category, selectedSort);
	}

	function handleInput() {
		console.log('Input event triggered, searchQuery:', searchQuery);
		
		// Mark that user has modified the search
		userHasModifiedSearch = true;
		currentPage = 1;

		// Clear the previous timeout
		clearTimeout(debounceTimeout);

		// Set a new timeout (e.g., 300ms delay)
		debounceTimeout = setTimeout(() => {
			runSearch(searchQuery);
		}, 300);
	}

	function handleSortChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		selectedSort = target.value;
		currentPage = 1;
		runSearch(searchQuery);
	}
</script>

<!-- Search Bar -->
{#if includeSearch}
	<div class="mx-auto w-3/5 md:w-1/2 lg:w-2/5 py-3 my-3 z-10">
		<div class="flex flex-row justify-center">
			<div class="input input-bordered flex items-center gap-2 w-80 md:w-96 ms-2">
				<input 
					id="search-input" 
					type="text" 
					class="grow" 
					placeholder="Search All Articles"
					bind:value={searchQuery}
					on:input={handleInput} 
				/>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					fill="currentColor"
					class="h-4 w-4 opacity-70"
				>
					<path
						fill-rule="evenodd"
						d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
						clip-rule="evenodd"
					/>
				</svg>
			</div>

			<select
				bind:value={selectedSort}
				on:change={handleSortChange}
				class="select select-bordered flex-wrap mx-3 w-auto bg-white border"
			>
				<option disabled value="none">Sort</option>
				<option value="date">Date</option>
				<option value="author">Author</option>
				<option value="a-z">A-Z</option>
			</select>
		</div>
	</div>
{/if}

<!-- List of Articles -->
<div class="mx-auto px-3 w-full md:w-3/4 lg:w-3/5 mt-2 z-10 mb-2">
	<div class="flex flex-col h-full">
		<!-- If header exists, rounded just on bottom, otherwise rounded everywhere- -->
		{#if articles.length === 0}
			<div class="mt-10 text-center mb-20">No articles matched your query.</div>
		{:else}
			<!-- List Header if it exists -->
			{#if header !== ''}
				<div
					class="flex-none w-full bg-gradient-to-r from-[#315AB0] to-[#07d1f9c1] p-3 rounded-t-lg"
				>
					<div class="flex-none text-3xl font-bold text-zinc-100">The Latest in Neurotech</div>
				</div>
			{/if}

			<div
				class="grow w-full duration-200 ease-in bg-white md:bg-white/75 rounded-b-lg shadow hover:shadow-lg overflow-hidden"
				class:rounded-t-lg={header === ''}
			>
				{#each articles.slice((currentPage - 1) * articlesPerPage, currentPage * articlesPerPage) as article, index}
					<ArticlePreviewCard preview={article}></ArticlePreviewCard>
					{#if index < articlesPerPage - 1 && index < articles.slice((currentPage - 1) * articlesPerPage, currentPage * articlesPerPage).length - 1}
						<div class="mx-6 border-zinc-300 border-[0.5px]"></div>
					{/if}
				{/each}
			</div>

			<!-- Switch pages -->
			<div class="flex-none join my-3 mb-5 text-zinc-700 mx-auto shadow ease-in duration-200">
				<button 
					class="join-item btn bg-white/75 hover:bg-zinc-200/75 disabled:opacity-50 disabled:cursor-not-allowed"
					on:click={() => currentPage = Math.max(1, currentPage - 1)}
					disabled={currentPage === 1}
				>
					<i class="fas fa-chevron-left"></i>
				</button>
				<button class="join-item btn bg-white/75 hover:bg-zinc-200/75 cursor-default">
					Page {currentPage} of {Math.ceil(articles.length / articlesPerPage)}
				</button>
				<button 
					class="join-item btn bg-white/75 hover:bg-zinc-200/75 disabled:opacity-50 disabled:cursor-not-allowed"
					on:click={() => currentPage = Math.min(Math.ceil(articles.length / articlesPerPage), currentPage + 1)}
					disabled={currentPage === Math.ceil(articles.length / articlesPerPage)}
				>
					<i class="fas fa-chevron-right"></i>
				</button>
			</div>
		{/if}
	</div>
</div>
