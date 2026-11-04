<script lang="ts">
	import { onMount } from 'svelte';
	import { db, storage } from '$lib/services/firebase.client';
	import { doc, getDoc } from 'firebase/firestore';
	import { ref, getDownloadURL } from 'firebase/storage';
	import { goto } from '$app/navigation';
	import OptimizedImage from './OptimizedImage.svelte';

	export let authorId: string;

	let authorName = '';
	let authorPfp = '';
	let loading = true;

	function handleAuthorClick(event: Event) {
		// Prevent the click from bubbling up to parent elements (like article links)
		event.stopPropagation();
		// Prevent the default behavior of the parent anchor tag
		event.preventDefault();
		
		// Navigate to home page with author search
		goto(`/?authorSearch=${encodeURIComponent(authorName)}`);
	}

	onMount(async () => {
		try {
			// Get author data from Firestore
			const authorRef = doc(db, 'authors', authorId);
			const authorSnap = await getDoc(authorRef);

			if (authorSnap.exists()) {
				const authorData = authorSnap.data();
				authorName = authorData.name || authorId;

				// Convert Firebase Storage path to download URL
				if (authorData.pfp) {
					try {
						const imageRef = ref(storage, authorData.pfp);
						authorPfp = await getDownloadURL(imageRef);
					} catch (error) {
						console.error('Error getting author image URL:', error);
					}
				}
			} else {
				// Fallback to the parsed author name if no profile doc exists in 'authors' yet
				authorName = authorId;
			}
		} catch (error) {
			console.error('Error loading author:', error);
			authorName = authorId;
		} finally {
			loading = false;
		}
	});
</script>

<button on:click={handleAuthorClick} class="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-0.5 cursor-pointer hover:bg-gray-200 transition-colors">
	<span class="text-xs font-medium text-gray-700">{authorName}</span>
	{#if authorPfp}
		<OptimizedImage
			src={authorPfp}
			alt="{authorName} profile"
			class="w-5 h-5 rounded-full object-cover"
			width={32}
		/>
	{:else}
		<div class="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center">
			<span class="text-xs text-gray-600 font-bold">{authorName.charAt(0)}</span>
		</div>
	{/if}
</button>
