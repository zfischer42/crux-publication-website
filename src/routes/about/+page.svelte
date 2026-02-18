<script>
	import BackgroundComponent from '$lib/components/BackgroundComponent.svelte';
	import { storage } from '$lib/services/firebase.client';
	import { ref, getDownloadURL } from 'firebase/storage';
	import { onMount } from 'svelte';

	export let data;

	let currentAuthorsWithImages = [];
	let currentBoardWithImages = [];
	let pastAuthorsWithImages = [];

	onMount(async () => {
		// Load profile images for current authors
		currentAuthorsWithImages = await Promise.all(
			data.currentAuthors.map(async (author) => {
				let profilePic = '';
				if (author.pfp) {
					try {
						const imageRef = ref(storage, author.pfp);
						profilePic = await getDownloadURL(imageRef);
					} catch (error) {
						console.error('Error loading author image:', error);
					}
				}
				return {
					...author,
					profilePic
				};
			})
		);

		// Load profiles images for current board members 
		currentBoardWithImages = await Promise.all(
			data.currentBoard.map(async (author) => {
				let profilePic = '';
				if (author.pfp) {
					try {
						const imageRef = ref(storage, author.pfp);
						profilePic = await getDownloadURL(imageRef);
					} catch (error) {
						console.error('Error loading author image:', error);
					}
				}
				return {
					...author,
					profilePic
				};
			})
		);

		// Load profile images for past authors
		pastAuthorsWithImages = await Promise.all(
			data.pastAuthors.map(async (author) => {
				let profilePic = '';
				if (author.pfp) {
					try {
						const imageRef = ref(storage, author.pfp);
						profilePic = await getDownloadURL(imageRef);
					} catch (error) {
						console.error('Error loading author image:', error);
					}
				}
				return {
					...author,
					profilePic
				};
			})
		);
	});
</script>

<!-- ABOUT PAGE -->

<BackgroundComponent />

<div
	class="flex flex-col mx-auto p-3 w-5/6 sm:w-3/4 md:w-3/5 lg:w-1/2 mt-5 text-center text-primary z-10"
>
	<!-- Our mission -->
	<div class="p-5 rounded-xl bg-white/85 border mb-8">
		<p class="text-4xl font-bold mb-4">Our Mission</p>

		<p>
			At CruX Publication, we aim to drive progress in neuroscience and technology by delivering
			cutting-edge news and analysis. Our mission is to inform and connect the neurotech community,
			highlight groundbreaking research and innovations, and inspire advancements that enhance
			mental health and cognitive function. Through expert insights and comprehensive coverage, we
			strive to be the go-to source for the latest in neurotechnology.
		</p>
		<br />
		<p>
			CruX UCLA Organization: <a class="underline" href="https://www.cruxucla.com/">cruxucla.com</a>
		</p>
		<p>
			Our parent organization <a class="underline" href="https://neurotechx.com/">neurotechx</a>
		</p>
	</div>

	<!-- Meet the Team -->
	<div class="p-5 rounded-xl bg-white/85 border mb-8">
		<!-- Board Members Section -->
			<p class="text-4xl font-bold mb-4">Meet the Team</p>
			<div class="mt-8 pt-6 border-t border-gray-300">
				<p class="text-3xl font-bold mb-4">Board</p>
				<div class="flex flex-wrap justify-center gap-2">
					{#each currentBoardWithImages as member}
						<a href={member.linkedin} target="_blank" class="hover:bg-blue">
							<div
								class="flex flex-col justify-center w-36 transition duration-200 ease-in hover:bg-zinc-200 hover:shadow p-2 rounded-lg"
							>
								<div class="mx-auto avatar mb-1">
									<div class="w-24 rounded-full">
										{#if member.profilePic}
											<img src={member.profilePic} alt="{member.name} profile pic" />
										{:else}
											<div class="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
												<span class="text-gray-600 font-bold text-xl">{member.name.charAt(0)}</span>
											</div>
										{/if}
									</div>
								</div>

								<div>
									<p class="text-sm font-bold">{member.name}</p>
									<p class="text-sm">{member.title}</p>
								</div>
							</div>
						</a>
					{/each}
				</div>
			</div>
		<!-- General Members Section -->
		<div class="mt-8 pt-6 border-t border-gray-300">
			<p class="text-3xl font-bold mb-4">General Members</p>
			<div class="flex flex-wrap justify-center gap-2">
				{#each currentAuthorsWithImages as member}
					<a href={member.linkedin} target="_blank" class="hover:bg-blue">
						<div
							class="flex flex-col justify-center w-36 transition duration-200 ease-in hover:bg-zinc-200 hover:shadow p-2 rounded-lg"
						>
							<div class="mx-auto avatar mb-1">
								<div class="w-24 rounded-full">
									{#if member.profilePic}
										<img src={member.profilePic} alt="{member.name} profile pic" />
									{:else}
										<div class="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
											<span class="text-gray-600 font-bold text-xl">{member.name.charAt(0)}</span>
										</div>
									{/if}
								</div>
							</div>

							<div>
								<p class="text-sm font-bold">{member.name}</p>
								<p class="text-sm">{member.title}</p>
							</div>
						</div>
					</a>
				{/each}
			</div>
		</div>
		<!-- Past Members Section -->
		{#if pastAuthorsWithImages.length > 0}
			<div class="mt-8 pt-6 border-t border-gray-300">
				<p class="text-3xl font-bold mb-4">Past Members</p>

				<div class="flex flex-wrap justify-center gap-2">
					{#each pastAuthorsWithImages as member}
						<a href={member.linkedin} target="_blank" class="hover:bg-blue">
							<div
								class="flex flex-col justify-center w-36 transition duration-200 ease-in hover:bg-zinc-200 hover:shadow p-2 rounded-lg opacity-75"
							>
								<div class="mx-auto avatar mb-1">
									<div class="w-24 rounded-full">
										{#if member.profilePic}
											<img src={member.profilePic} alt="{member.name} profile pic" />
										{:else}
											<div
												class="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center"
											>
												<span class="text-gray-600 font-bold text-xl">{member.name.charAt(0)}</span>
											</div>
										{/if}
									</div>
								</div>

								<div>
									<p class="text-sm font-bold">{member.name}</p>
									<p class="text-sm">{member.title}</p>
								</div>
							</div>
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<!-- Our mission -->
	<div class="p-5 rounded-xl bg-white/85 border mb-8">
		<p class="text-4xl font-bold mb-4">Contact Us</p>
		<p>
			Email:
			<span class="font-bold">cruxneurotech@g.ucla.edu</span>
		</p>

		<p>
			Visit the <a class="underline" href="https://www.cruxucla.com/">CruX parent website</a>
		</p>
	</div>
</div>
