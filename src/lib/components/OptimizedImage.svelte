<script lang="ts">
	import { onMount } from 'svelte';
	import { optimizedSrc, optimizedSrcset } from '$lib/services/images';

	export let src: string | undefined;
	export let alt: string;
	/** Approximate rendered width in CSS pixels; used to pick the served size. */
	export let width: number;
	export let eager = false;
	let className = '';
	export { className as class };

	let img: HTMLImageElement;
	let loaded = false;

	$: src, (loaded = false);

	// The image may finish loading before hydration, in which case on:load never fires.
	onMount(() => {
		if (img?.complete) loaded = true;
	});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<img
	bind:this={img}
	src={optimizedSrc(src ?? '', width)}
	srcset={optimizedSrcset(src ?? '', width)}
	{alt}
	loading={eager ? 'eager' : 'lazy'}
	fetchpriority={eager ? 'high' : 'auto'}
	decoding="async"
	class="fade-img transition-opacity duration-300 {loaded ? 'opacity-100' : 'opacity-0'} {className}"
	on:load={() => (loaded = true)}
	on:error={() => (loaded = true)}
	on:click
/>
