<script lang="ts">
	import { session } from '$lib/services/session';
	import { db, storage } from '$lib/services/firebase.client';
	import {
		doc,
		setDoc,
		collection,
		getDocs,
		updateDoc,
		arrayUnion,
		arrayRemove
	} from 'firebase/firestore';
	import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	// DATA MANAGEMENT
	export let data;

	// NEW AUTHOR
	let newAuthorName = '';
	let newAuthorTitle = '';
	let newAuthorPFP: {
		type: string;
		src: string;
		file?: File;
		fileName?: string;
		originalPath?: string;
	} = {
		type: '',
		src: ''
	};
	let newAuthorLinkedIn = '';
	let newAuthorArticles: string[] = [];
	let newAuthorCurrent = true; // Default to true for new authors
	let authorStatus = 'Changes pending';

	// Load existing authors
	let existingAuthors: any[] = [];
	let selectedAuthor: any = null;
	let isEditing = false;

	// Auto-load authors when component mounts
	onMount(async () => {
		await loadExistingAuthors();
	});

	// Navigation
	function goBack() {
		goto('/backdoor');
	}

	/**
	 * Convert Firebase Storage path to download URL
	 */
	async function getImageUrl(storagePath: string): Promise<string> {
		if (!storagePath) return '';
		try {
			const imageRef = ref(storage, storagePath);
			return await getDownloadURL(imageRef);
		} catch (error) {
			console.error('Error getting image URL:', error);
			return '';
		}
	}

	/**
	 * Select an existing author to edit
	 */
	function selectAuthor(author: any) {
		selectedAuthor = author;
		isEditing = true;

		// Populate form fields
		newAuthorName = author.name || '';
		newAuthorTitle = author.title || '';
		newAuthorLinkedIn = author.linkedin || '';
		newAuthorArticles = author.articles || [];
		newAuthorCurrent = author.currentAuthor !== undefined ? author.currentAuthor : true;

		// Set profile image if exists - use display URL for preview, keep original path for saving
		if (author.pfp) {
			newAuthorPFP = {
				type: 'image',
				src: author.pfpUrl || author.pfp, // Use display URL if available, fallback to original path
				fileName: author.pfp.split('/').pop() || '',
				originalPath: author.pfp // Store original storage path
			};
		} else {
			newAuthorPFP = { type: '', src: '' };
		}

		authorStatus = 'Editing existing author';
	}

	/**
	 * Clear form and start creating a new author
	 */
	function createNewAuthor() {
		selectedAuthor = null;
		isEditing = false;

		// Reset form fields
		newAuthorName = '';
		newAuthorTitle = '';
		newAuthorLinkedIn = '';
		newAuthorArticles = [];
		newAuthorCurrent = true; // Reset to default true for new authors
		newAuthorPFP = { type: '', src: '' };

		authorStatus = 'Changes pending';
	}

	/**
	 * Handle author profile image upload
	 */
	function handleAuthorImageUpload(event: any) {
		const file = event.target.files[0];
		if (file) {
			newAuthorPFP = {
				file: file,
				type: 'image',
				fileName: file.name,
				src: URL.createObjectURL(file)
			};
		}
	}

	/**
	 * Function to save new author to database or update existing one
	 */
	async function handleAuthorSubmit() {
		authorStatus = 'Loading';

		// Validate author fields
		if (!newAuthorName.trim()) {
			authorStatus = 'Author name is required';
			return;
		}

		try {
			// Handle profile image
			let pfpUrl = '';
			if (newAuthorPFP.file) {
				// Upload new image
				const fileRef = ref(storage, `pfps/${newAuthorPFP.fileName}`);
				const snapshot = await uploadBytes(fileRef, newAuthorPFP.file as File);
				pfpUrl = `pfps/${newAuthorPFP.fileName}`;
				console.log('Profile image uploaded successfully', snapshot);
			} else if (newAuthorPFP.originalPath) {
				// Keep existing Firebase Storage path
				pfpUrl = newAuthorPFP.originalPath;
			} else if (newAuthorPFP.src && newAuthorPFP.src.startsWith('pfps/')) {
				// Fallback: if src is a storage path
				pfpUrl = newAuthorPFP.src;
			}

			// Create author object
			const authorData: any = {
				name: newAuthorName.trim(),
				title: newAuthorTitle.trim(),
				linkedin: newAuthorLinkedIn.trim(),
				pfp: pfpUrl,
				articles: newAuthorArticles,
				currentAuthor: newAuthorCurrent,
				updatedAt: new Date()
			};

			// Use existing ID if editing, otherwise generate new one
			const authorId =
				isEditing && selectedAuthor
					? selectedAuthor.id
					: newAuthorName
							.toLowerCase()
							.replace(/\s+/g, '-')
							.replace(/[^a-z0-9-]/g, '');

			// Preserve original creation date if editing
			if (isEditing && selectedAuthor && selectedAuthor.createdAt) {
				authorData.createdAt = selectedAuthor.createdAt;
			} else {
				authorData.createdAt = new Date();
			}

			// Save to authors collection
			await setDoc(doc(db, 'authors', authorId), authorData);

			// Update articles to include this author (both preview and content collections)
			if (newAuthorArticles.length > 0) {
				for (const articleSlug of newAuthorArticles) {
					// Update article-preview collection
					const previewRef = doc(db, 'article-preview', articleSlug);
					await updateDoc(previewRef, {
						authors: arrayUnion(authorId)
					});

					// Update article-content collection - update preview.authors field
					const contentRef = doc(db, 'article-content', articleSlug);
					await updateDoc(contentRef, {
						'preview.authors': arrayUnion(authorId)
					});
				}
			}

			// If editing, also remove author from articles that are no longer selected
			if (isEditing && selectedAuthor && selectedAuthor.articles) {
				const removedArticles = selectedAuthor.articles.filter(
					(articleSlug: string) => !newAuthorArticles.includes(articleSlug)
				);

				for (const articleSlug of removedArticles) {
					// Remove from article-preview collection
					const previewRef = doc(db, 'article-preview', articleSlug);
					await updateDoc(previewRef, {
						authors: arrayRemove(authorId)
					});

					// Remove from article-content collection - update preview.authors field
					const contentRef = doc(db, 'article-content', articleSlug);
					await updateDoc(contentRef, {
						'preview.authors': arrayRemove(authorId)
					});
				}
			}

			if (isEditing) {
				console.log('Author updated successfully!');
				authorStatus = 'Author updated successfully!';
			} else {
				console.log('Author added successfully!');
				authorStatus = 'Author added successfully!';
			}

			// Reset form
			createNewAuthor();

			// Reload authors list to show updated data
			await loadExistingAuthors();
		} catch (error) {
			console.error('Error saving author:', error);
			authorStatus = 'Failed to save author: ' + (error as Error).message;
		}
	}

	/**
	 * Load existing authors from database
	 */
	async function loadExistingAuthors() {
		console.log('loadExistingAuthors called');
		try {
			const authorsRef = collection(db, 'authors');
			const snapshot = await getDocs(authorsRef);
			const authorsData = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data()
			}));

			// Keep original storage paths but add display URLs
			const authorsWithUrls = await Promise.all(
				authorsData.map(async (author: any) => {
					if (author.pfp) {
						const imageUrl = await getImageUrl(author.pfp);
						return {
							...author,
							pfp: author.pfp, // Keep original storage path
							pfpUrl: imageUrl // Add display URL
						};
					}
					return author;
				})
			);

			existingAuthors = authorsWithUrls;
			console.log('Loaded authors:', existingAuthors);
		} catch (error) {
			console.error('Error loading authors:', error);
		}
	}
</script>

<div class="min-h-screen bg-gray-100 p-8">
	<div class="max-w-4xl mx-auto">
		<!-- Header -->
		<div class="flex items-center justify-between mb-8">
			<div>
				<h1 class="text-3xl font-bold text-gray-900">Author Management</h1>
				<p class="text-gray-600 mt-2">Create and manage authors</p>
			</div>
			<div class="flex gap-2">
				<button on:click={goBack} class="btn btn-sm btn-accent"> ← Back </button>
			</div>
		</div>

		<!-- Author Form -->
		<div class="bg-white rounded-lg shadow-md p-6">
			<div class="flex flex-row justify-between mb-6">
				<div class="text-3xl font-bold">
					{isEditing ? 'Edit Author:' : 'New Author:'}
					{#if isEditing && selectedAuthor}
						<span class="text-lg text-gray-600 ml-2">({selectedAuthor.name})</span>
					{/if}
				</div>
				<div class="flex gap-2">
					{#if isEditing}
						<button class="btn btn-sm btn-secondary" on:click={createNewAuthor}>New Author</button>
					{/if}
				</div>
			</div>

			<div class="space-y-4">
				<!-- Full Name -->
				<label class="input input-bordered flex items-center gap-2">
					Full Name:
					<input bind:value={newAuthorName} type="text" class="grow" placeholder="Zach Fischer" />
				</label>

				<!-- Title -->
				<label class="input input-bordered flex items-center gap-2">
					Title:
					<input bind:value={newAuthorTitle} type="text" class="grow" placeholder="Webmaster" />
				</label>

				<!-- LinkedIn -->
				<label class="input input-bordered flex items-center gap-2">
					LinkedIn:
					<input
						bind:value={newAuthorLinkedIn}
						type="text"
						class="grow"
						placeholder="https://www.linkedin.com/in/zachfischer/"
					/>
				</label>

				<!-- Current Author Toggle -->
				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-3">
						<input type="checkbox" bind:checked={newAuthorCurrent} class="toggle toggle-primary" />
						<span class="label-text">Current Author</span>
						<span class="text-sm text-gray-500">
							{newAuthorCurrent ? '(Active member)' : '(Past member)'}
						</span>
					</label>
				</div>

				<!-- Profile Photo Upload -->
				<div>
					<label class="form-control w-full">
						<div class="label p-0 pb-1 mt-1">
							<span>Profile Photo:</span>
						</div>
						<input
							type="file"
							accept="image/*"
							class="file-input file-input-bordered file-input-accent w-full"
							on:change={handleAuthorImageUpload}
						/>
					</label>

					{#if newAuthorPFP.src}
						<img
							src={newAuthorPFP.src}
							alt="Profile image"
							class="w-1/3 m-5 aspect-square object-cover rounded-lg"
						/>
					{/if}
				</div>

				<!-- Articles Selection -->
				<div class="mt-4">
					<div class="text-lg font-semibold mb-2">Articles Written:</div>

					<!-- Article List -->
					<div class="max-h-60 overflow-y-auto border rounded-lg p-2">
						{#each data.articles as article}
							<div class="flex items-center p-2 hover:bg-gray-100 rounded">
								<input
									type="checkbox"
									checked={newAuthorArticles.includes(article.slug)}
									on:change={() => {
										if (newAuthorArticles.includes(article.slug)) {
											newAuthorArticles = newAuthorArticles.filter((slug) => slug !== article.slug);
										} else {
											newAuthorArticles = [...newAuthorArticles, article.slug];
										}
									}}
									class="checkbox checkbox-sm mr-3"
								/>
								<div class="flex-1">
									<div class="font-medium">{article.title}</div>
									<div class="text-sm text-gray-600">By {article.author}</div>
								</div>
							</div>
						{/each}
					</div>

					<!-- Selected Articles Display -->
					{#if newAuthorArticles.length > 0}
						<div class="mt-3">
							<div class="text-sm font-medium mb-2">
								Selected Articles ({newAuthorArticles.length}):
							</div>
							<div class="flex flex-wrap gap-2">
								{#each newAuthorArticles as articleSlug}
									{@const article = data.articles.find((a) => a.slug === articleSlug)}
									{#if article}
										<div class="badge badge-primary gap-2">
											{article.title}
											<button
												class="btn btn-xs btn-circle"
												on:click={() => {
													newAuthorArticles = newAuthorArticles.filter(
														(slug) => slug !== articleSlug
													);
												}}
											>
												×
											</button>
										</div>
									{/if}
								{/each}
							</div>
						</div>
					{/if}
				</div>

				<!-- Save Button -->
				<div class="mt-4 justify-items-center w-full flex flex-col">
					<button
						class="flex flex-row btn text-lg bg-green-600 hover:bg-green-700 w-100"
						on:click={handleAuthorSubmit}
					>
						{isEditing ? 'Update Author' : 'Save Author'}
					</button>
					<div class="flex flex-row text-zinc-400 text-sm font-semibold mt-1">
						{authorStatus}
					</div>
				</div>
			</div>
		</div>

		<!-- Existing Authors Display -->
		{#if existingAuthors.length > 0}
			<div class="mt-8 bg-white rounded-lg shadow-md p-6">
				<div class="text-2xl font-bold mb-4">Existing Authors:</div>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each existingAuthors as author}
						<div
							class="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
							on:click={() => selectAuthor(author)}
						>
							<div class="flex items-center gap-3 mb-2">
								{#if author.pfpUrl}
									<img
										src={author.pfpUrl}
										alt="Profile"
										class="w-12 h-12 rounded-full object-cover"
									/>
								{:else if author.pfp}
									<img src={author.pfp} alt="Profile" class="w-12 h-12 rounded-full object-cover" />
								{:else}
									<div class="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
										<span class="text-gray-600 font-bold">{author.name.charAt(0)}</span>
									</div>
								{/if}
								<div class="flex-1">
									<div class="flex items-center gap-2">
										<div class="font-semibold">{author.name}</div>
										{#if author.currentAuthor === false}
											<span class="badge badge-outline badge-sm text-gray-500">Past</span>
										{:else}
											<span class="badge badge-primary badge-sm">Current</span>
										{/if}
									</div>
									<div class="text-sm text-gray-600">{author.title}</div>
								</div>
							</div>
							{#if author.linkedin}
								<div class="text-sm text-blue-600 mb-2">
									<a
										href={author.linkedin}
										target="_blank"
										rel="noopener noreferrer"
										on:click|stopPropagation>LinkedIn</a
									>
								</div>
							{/if}
							{#if author.articles && author.articles.length > 0}
								<div class="text-sm text-gray-600">
									Articles: {author.articles.length}
								</div>
							{/if}
							<div class="text-xs text-gray-500 mt-2">Click to edit</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.btn {
		color: white;
	}
	.input,
	.select,
	.file-input {
		height: 40px !important;
		min-height: 10px !important;
	}
</style>
