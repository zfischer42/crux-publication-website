<script lang="ts">
	import '../app.css';
	import BackgroundComponent from '$lib/components/BackgroundComponent.svelte';
	import FooterComponent from '$lib/components/FooterComponent.svelte';
	const crux_logo = '/CruXLogo.png';
	const crux_title = '/CruXTitle.png';

	// Routing path
	import { page } from '$app/stores';
	let path: string;
	$: path = $page.url.pathname; // @param {string} currentPath

	import { onMount } from 'svelte';
	import { session } from '$lib/services/session';
	import { goto } from '$app/navigation';
	import { signOut } from 'firebase/auth';
	import { auth } from '$lib/services/firebase.client';
	import type { LayoutData } from './$types';
	export let data: LayoutData;

	export let loading: boolean = true;
	export let loggedIn: boolean = false;

	session.subscribe((cur: any) => {
		loading = cur?.loading;
		loggedIn = cur?.loggedIn;
	});

	onMount(async () => {
		const user: any = await data.getAuthUser();
		const loggedIn = !!user && user?.emailVerified;
		session.update((cur: any) => {
			loading = false;
			return {
				...cur,
				user,
				loggedIn,
				loading: false
			};
		});
		if (loggedIn) {
			goto('/backdoor');
		}
	});
</script>

<div class="relative flex flex-col h-screen justify-between">
	<div class="drawer">
		<input id="my-drawer-3" type="checkbox" class="drawer-toggle" />

		<div class="drawer-content flex flex-col">
			{#if !path.startsWith('/backdoor')}
				<!-- Navbar -->
				<div class="navbar bg-zinc-900 w-full p-0 m-0 shadow-lg z-10">
					<!-- Collapse icon -->
					<div class="flex-none md:hidden">
						<label for="my-drawer-3" aria-label="open sidebar" class="btn btn-square btn-ghost">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								class="inline-block h-6 w-6"
								stroke="gray"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 6h16M4 12h16M4 18h16"
								></path>
							</svg>
						</label>
					</div>

					<!-- Mobile Title and Logo -->
					<div class="mx-2 px-2 md:hidden flex flex-row z-30">
						<a href="/"><img class="max-h-12" src={crux_logo} alt="CruX Logo" /></a>
						<a href="/"><img class="max-h-12" src={crux_title} alt="CruX Title" /></a>
					</div>

					<div class="navbar-start hidden md:block"></div>
					<div class=" hidden flex-none md:block p-0 w-[90%] md:w-3/4 lg:w-3/5">
						<ul class="menu menu-horizontal w-full flex flex-col p-0">
							<!-- Navbar menu content here -->
							<div class="flex flex-row mx-auto">
								<a href="/"><img class="h-20 max-w-full" src={crux_logo} alt="CruX Logo" /></a>
								<a href="/"><img class="h-20 max-w-full" src={crux_title} alt="CruX Title" /></a>
							</div>
							<div class="w-full">
								<ul
									class="menu menu-horizontal p-0 pb-2 text-primary-content text-base flex justify-around"
								>
									<li class="hover:text-white">
										<a href="/">Home</a>
									</li>
									<li class="hover:text-white">
										<a href="/business">Business</a>
									</li>
									<li class="hover:text-white">
										<a href="/technology">Technology</a>
									</li>
									<li class="hover:text-white">
										<a href="/science">Science</a>
									</li>
									<li class="hover:text-white">
										<a href="/about">About</a>
									</li>
								</ul>
							</div>
						</ul>
					</div>
					<div class="navbar-end hidden md:block"></div>
				</div>
			{/if}

			<!-- Page Content -->
			<slot />
		</div>

		{#if !path.startsWith('/backdoor')}
			<!-- Sidebar Drawer -->
			<div class="drawer-side z-20">
				<label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay"></label>
				<ul class="menu bg-zinc-900 min-h-full w-80 p-4 text-primary-content">
					<!-- Sidebar content -->
					<li><a href="/"><img class="max-h-12" src={crux_logo} alt="CruX Logo" /></a></li>
					<li><a href="/">Home</a></li>
					<li><a href="/business">Business</a></li>
					<li><a href="/technology">Technology</a></li>
					<li><a href="/science">Science</a></li>
					<li><a href="/about"> About </a></li>
				</ul>
			</div>
		{/if}
	</div>

	{#if !path.startsWith('/backdoor')}
		<FooterComponent></FooterComponent>
	{/if}
</div>

<style>
	a:active {
		background-color: transparent !important;
		color: #6d9eff !important;
	}
</style>
