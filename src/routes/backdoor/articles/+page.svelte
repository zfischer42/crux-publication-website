<script lang="ts">
	// NOTE-- REMOVE THIS, only used for FileList error
	// @ts-nocheck
	import { session } from '$lib/services/session';
	import { addArticle, db, storage } from '$lib/services/firebase.client';
	import { auth } from '$lib/services/firebase.client';
	import { doc, setDoc } from 'firebase/firestore';
	import { ref, uploadBytes } from 'firebase/storage';
	import { goto } from '$app/navigation';
	import type { Article, Content } from '$lib/services/article.types';
	import Editor from '@tinymce/tinymce-svelte';
	import { Button } from 'flowbite-svelte';

	// DATA MANAGEMENT
	export let data;

	// Load article
	let articleSelectModal = false;
	let selectedArticle = ''; // To store the selected article

	// NEW ARTICLE
	let articleStatus = 'Changes pending';
	let newSlug = '';
	let newTitle = 'This is a title';
	let newAuthor = 'John Author';

	// Initialize with current date in MM/DD/YYYY format
	function getCurrentDateString(): string {
		const now = new Date();
		const month = (now.getMonth() + 1).toString().padStart(2, '0');
		const day = now.getDate().toString().padStart(2, '0');
		const year = now.getFullYear();
		return `${month}/${day}/${year}`;
	}

	let newDate = getCurrentDateString();
	let newCategories = [];
	const categories = ['Business', 'Technology', 'Science'];
	let otherCategory = ''; // Store the value for "Other" input

	let newDescription = 'This is a description';

	let newImage = { type: '', src: '' };
	let articleObject: Article;
	let errorMessages: string[] = [];

	let fields: Content[] = []; // Array to manage all fields
	let coverPhotoInput: HTMLInputElement; // Reference to hidden cover photo input

	// TinyMCE config with event handler (for text fields )
	let tinymceConfig = {
		menubar: true,
		height: 300,
		plugins: 'link code',
		setup(editor) {
			// Listen for keydown event to handle Tab key
			editor.on('keydown', function (e) {
				if (e.key === 'Tab') {
					e.preventDefault(); // Prevent default tab behavior
					editor.execCommand('mceInsertContent', false, '&emsp;&emsp;'); // Insert tab character
				}
			});
		}
	};

	// Navigation
	function goBack() {
		goto('/backdoor');
	}

	// Auto-populate date if empty
	function ensureDateIsSet() {
		if (!newDate || newDate.trim() === '') {
			newDate = getCurrentDateString();
		}
	}

	// Add anything
	function addContent(contentType: string) {
		fields = [...fields, { type: contentType }];
	}

	// Toggle categories
	function toggleCategory(category) {
		if (newCategories.includes(category)) {
			// Remove the category if already selected
			newCategories = newCategories.filter((c) => c !== category);
		} else {
			// Add the category if not already selected
			newCategories = [...newCategories, category];
		}
	}
	function handleOtherOptionChange(event) {
		otherCategory = event.target.value;
		if (!newCategories.includes('Other')) {
			newCategories = [...newCategories, 'Other'];
		}
	}

	// Data changes within a Paragraph box
	function handleParagraphChange(event: any, index: number) {
		console.log(event.target.value);
		fields[index] = { type: 'paragraph', text: event.target.value };
	}

	// Data changes within a Header box
	function handleHeaderChange(event: any, index: number) {
		fields[index] = { type: 'header', text: event.target.value };
	}

	// Data changes within a Header box
	function handleCustomHTMLChange(event: any, index: number) {
		fields[index] = { type: 'custom_html', text: event.target.value };
	}

	function handleVideoChange(event: any, index: number) {
		fields[index] = { type: 'video', src: event.target.value };
	}

	// Data changes within an Image credits field
	function handleImageCreditsChange(event: any, index: number) {
		fields[index] = { ...fields[index], credits: event.target.value };
	}

	// Remove a field from the contenxt
	function handleRemoveField(index: number) {
		fields.splice(index, 1); // Remove the item at the specified index
		fields = [...fields]; // Force reactivity
		console.log(fields);
	}

	/**
	 * @param {string | number} index
	 */
	function handleImageUpload(event: any, index = -1) {
		const file = event.target.files[0];

		console.log(event.target.files);
		if (file) {
			if (index !== -1) {
				// Image upload to article
				fields[index] = {
					file: file,
					fileName: file.name,
					type: 'image',
					src: URL.createObjectURL(file),
					credits: fields[index]?.credits || '' // Preserve existing credits
				};
			} else {
				// Image upload to Main Photo
				newImage = {
					file: file,
					type: 'image',
					fileName: file.name,
					src: URL.createObjectURL(file),
					credits: newImage?.credits || '' // Preserve existing credits
				};
			}
		}
	}

	/**
	 * Function runs when "Publish Article" button is pressed
	 */
	async function handleSubmit() {
		articleStatus = 'Loading';

		// Auto-populate date if empty
		ensureDateIsSet();

		// Validate all fields
		if (validateFields()) {
			articleStatus = 'Changes pending';
			return;
		}

		const articlePreview = {
			slug: newSlug,
			title: newTitle,
			author: newAuthor,
			date: newDate,
			categories: newCategories,
			description: newDescription,
			image: newImage
		};

		console.log('finished object:', articlePreview);
		try {
			await addArticle(articlePreview, fields); // Await the function
			console.log('Article added successfully!');
			articleStatus = 'Article added successfully!';
		} catch (error) {
			console.error('Error adding article:', error);
			articleStatus = 'Failed to add article';
		}
	}

	/**
	 * Function to validate each field
	 */
	function validateFields() {
		// No errors to begin
		errorMessages = [];

		if (!newTitle) {
			errorMessages.push('Title field is invalid');
		}
		if (!newAuthor) {
			errorMessages.push('Author field is invalid');
		}
		if (!newDate) {
			errorMessages.push('Date field is invalid');
		}
		if (!newCategories) {
			errorMessages.push('Category field is invalid');
		}
		if (!newDescription) {
			errorMessages.push('Description field is invalid');
		}
		if (!newImage.src) {
			errorMessages.push('Image field is invalid');
		}
		if (!fields) {
			errorMessages.push('Content fields are invalid');
		}

		for (let field of fields) {
			if (field.type === 'paragraph' && !field.text) {
				errorMessages.push('Article content paragraph invalid');
			} else if (field.type === 'image' && !field.src) {
				errorMessages.push('Article content image invalid');
			}
		}

		return errorMessages.length > 0;
	}
</script>

<div class="min-h-screen bg-gray-100 p-8">
	<div class="max-w-6xl mx-auto">
		<!-- Header -->
		<div class="flex items-center justify-between mb-8">
			<div>
				<h1 class="text-3xl font-bold text-gray-900">Article Editor</h1>
				<p class="text-gray-600 mt-2">Create and edit articles</p>
			</div>
			<div class="flex gap-2">
				<button on:click={() => (articleSelectModal = true)} class="btn btn-primary">
					Select Article
				</button>
				<button on:click={goBack} class="btn btn-primary"> ← Back to Dashboard </button>
			</div>
		</div>

		<!-- Article Editor Form -->
		<div class="bg-white rounded-lg shadow-md p-6">
			<!-- Metadata -->
			<div class="flex flex-row justify-between mb-6">
				<div class="text-3xl font-bold">Metadata:</div>
			</div>

			<div class="space-y-4">
				<label class="input input-bordered flex items-center gap-2">
					Title:
					<input bind:value={newTitle} type="text" class="grow" placeholder="Grapes of Wrath" />
				</label>
				<label class="input input-bordered flex items-center gap-2">
					Author:
					<input bind:value={newAuthor} type="text" class="grow" placeholder="John Steinbeck" />
				</label>
				<label class="input input-bordered flex items-center gap-2">
					Date:
					<input
						bind:value={newDate}
						type="text"
						class="grow"
						placeholder="April 14, 1939"
						on:blur={ensureDateIsSet}
					/>
				</label>
				<label class="input input-bordered flex items-center gap-2">
					Description:
					<input
						bind:value={newDescription}
						type="text"
						class="grow"
						placeholder="1-2 sentence description."
					/>
				</label>

				<div class="flex flex-col space-y-2 mt-2">
					{#each categories as category}
						<label class="flex items-center space-x-2">
							<input
								type="checkbox"
								value={category}
								checked={newCategories.includes(category)}
								on:change={() => toggleCategory(category)}
								class="checkbox checkbox-bordered"
							/>
							<span>{category}</span>
						</label>
					{/each}

					<!-- Other option -->
					<label class="flex items-center space-x-2">
						<input
							type="checkbox"
							value="Other"
							checked={newCategories.includes('Other')}
							on:change={() => toggleCategory('Other')}
							class="checkbox checkbox-bordered"
						/>
						<span>Other</span>
					</label>

					{#if newCategories.includes('Other')}
						<input
							type="text"
							bind:value={otherCategory}
							placeholder="Please specify"
							class="input input-bordered w-full mt-2"
							on:input={handleOtherOptionChange}
						/>
					{/if}
				</div>

				<div>
					<label class="form-control w-full">
						<div class="label p-0 pb-1 mt-1">
							<span>Cover photo:</span>
						</div>
						<div class="relative">
							<input
								type="file"
								class="hidden"
								on:change={(event) => handleImageUpload(event, -1)}
								bind:this={coverPhotoInput}
							/>
							<button
								type="button"
								class="file-input file-input-bordered file-input-accent w-full flex items-center p-0"
								on:click={() => coverPhotoInput?.click()}
							>
								<span
									class="bg-accent text-accent-content px-3 py-2 text-sm font-medium h-full flex items-center"
									>IMAGE</span
								>
								<span class="px-3 text-sm text-gray-700"
									>{newImage.fileName || 'No file chosen'}</span
								>
							</button>
						</div>
					</label>

					<!-- Cover Photo Credits Input -->
					<div class="mt-2">
						<input
							type="text"
							placeholder="Cover photo credits (optional)"
							value={newImage.credits || ''}
							on:input={(event) => (newImage = { ...newImage, credits: event.target.value })}
							class="input input-bordered w-full"
						/>
					</div>

					{#if newImage.src}
						<img
							src={newImage.src}
							alt="Title img"
							class="w-1/3 m-5 aspect-[4/3] object-cover rounded-lg"
						/>
					{/if}
				</div>

				<!-- Article Content -->
				<div class="text-3xl font-bold mt-5">Article:</div>
				<div class="flex flex-col p-5 bg-zinc-100 rounded-lg border border-separate">
					{#each fields as field, index}
						{#if field.type === 'paragraph'}
							<!-- Paragraph content -->
							<div class="flex flex-row w-full">
								<div class="mb-3 me-1 grow">
									<Editor
										licenseKey="nr5tfa2k70yvg1zbuzu2rvguuhr5d4paqwbg3xp966forabr"
										scriptSrc="https://cdn.tiny.cloud/1/nr5tfa2k70yvg1zbuzu2rvguuhr5d4paqwbg3xp966forabr/tinymce/7/tinymce.min.js"
										bind:value={field.text}
										conf={tinymceConfig}
									/>
								</div>

								<button
									class="btn btn-sm bg-zinc-200 hover:bg-zinc-300 border-none font-mono flex items-center justify-center rounded-full h-8 w-8 p-0"
									on:click={() => handleRemoveField(index)}
								>
									<span class="text-zinc-500">x</span>
								</button>
							</div>
						{:else if field.type === 'header'}
							<!-- Header content -->
							<div class="flex flex-row w-full">
								<input
									class="mb-3 me-1 grow input input-bordered leading-5 font-bold"
									type="text"
									placeholder="Header"
									value={field.text ? field.text : ''}
									on:change={(event) => handleHeaderChange(event, index)}
								/>

								<button
									class="btn btn-sm bg-zinc-200 hover:bg-zinc-300 border-none font-mono flex items-center justify-center rounded-full h-8 w-8 p-0"
									on:click={() => handleRemoveField(index)}
								>
									<span class="text-zinc-500">x</span>
								</button>
							</div>
						{:else if field.type === 'image'}
							<!-- Image content -->
							<div class="mb-3">
								<div class="flex flex-row">
									<div class="flex-1 me-1">
										<input
											type="file"
											accept="image/*"
											class="hidden"
											on:change={(event) => handleImageUpload(event, index)}
											bind:this={field.inputRef}
										/>
										<button
											type="button"
											class="file-input file-input-bordered file-input-accent w-full flex items-center p-0"
											on:click={() => field.inputRef?.click()}
										>
											<span
												class="bg-accent text-accent-content px-3 py-2 text-sm font-medium h-full flex items-center"
												>IMAGE</span
											>
											<span class="px-3 text-sm text-gray-700"
												>{field.fileName || 'No file chosen'}</span
											>
										</button>
									</div>
									<button
										class="btn btn-sm bg-zinc-200 hover:bg-zinc-300 border-none font-mono flex items-center justify-center rounded-full h-8 w-8 p-0"
										on:click={() => handleRemoveField(index)}
									>
										<span class="text-zinc-500">x</span>
									</button>
								</div>

								<!-- Image Credits Input -->
								<div class="mt-2">
									<input
										type="text"
										placeholder="Image credits (optional)"
										value={field.credits || ''}
										on:input={(event) => handleImageCreditsChange(event, index)}
										class="input input-bordered w-full"
									/>
								</div>

								{#if field.src}
									<img
										src={field.src}
										alt="Title img"
										class="w-1/3 m-5 aspect-[4/3] object-cover rounded-md"
									/>
								{/if}
							</div>
						{:else if field.type === 'video'}
							<!-- Video content -->
							<div class="flex flex-row w-full">
								<input
									class="grow mb-3 me-1 input input-bordered leading-5"
									type="text"
									placeholder="Video embed link"
									value={field.src ? field.src : ''}
									on:change={(event) => handleVideoChange(event, index)}
								/>

								<button
									class="btn btn-sm bg-zinc-200 hover:bg-zinc-300 border-none font-mono flex items-center justify-center rounded-full h-8 w-8 p-0"
									on:click={() => handleRemoveField(index)}
								>
									<span class="text-zinc-500">x</span>
								</button>
							</div>
						{:else if field.type === 'custom_html'}
							<!-- Custom HTML content -->
							<div class="flex flex-row w-full">
								<textarea
									class="mb-3 me-1 grow w-full h-48 p-4 bg-gray-800 text-white font-mono text-sm rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Custom HTML..."
									value={field.customHTML ? field.customHTML : ''}
									on:change={(event) => handleCustomHTMLChange(event, index)}
								></textarea>

								<button
									class="btn btn-sm bg-zinc-200 hover:bg-zinc-300 border-none font-mono flex items-center justify-center rounded-full h-8 w-8 p-0"
									on:click={() => handleRemoveField(index)}
								>
									<span class="text-zinc-500">x</span>
								</button>
							</div>
						{/if}
					{/each}

					<!-- Add Buttons -->
					<div class="flex flex-row my-1">
						<button class="btn btn-sm btn-primary mx-1" on:click={() => addContent('paragraph')}>
							+ Paragraph
						</button>
						<button class="btn btn-sm btn-primary mx-1" on:click={() => addContent('header')}>
							+ Header
						</button>
						<button class="btn btn-sm btn-accent mx-1" on:click={() => addContent('image')}>
							+ Image
						</button>
						<button class="btn btn-sm btn-video mx-1" on:click={() => addContent('video')}>
							+ Video
						</button>
						<button class="btn btn-sm btn-custom mx-1" on:click={() => addContent('custom_html')}>
							+ Custom HTML
						</button>
					</div>
				</div>

				<div class="mt-4 justify-items-center w-full flex flex-col">
					<button
						class="flex flex-row btn text-lg bg-green-600 hover:bg-green-700 w-100"
						on:click={handleSubmit}>Publish/Save Article</button
					>
					<div class="flex flex-row text-zinc-400 text-sm font-semibold mt-1">
						{articleStatus}
					</div>

					{#each errorMessages as message}
						<div class="flex flex-row text-red-400 text-sm">{message}</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

{#if articleSelectModal}
	<!-- Custom Modal -->
	<div
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
	>
		<button
			class="absolute inset-0 w-full h-full"
			aria-label="Close modal"
			on:click={() => (articleSelectModal = false)}
			on:keydown={(e) => e.key === 'Escape' && (articleSelectModal = false)}
		></button>
		<div
			class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto relative z-10"
		>
			<!-- Header -->
			<div class="flex flex-row w-full justify-between items-center p-6 border-b">
				<h2 id="modal-title" class="font-bold text-xl">Select Article:</h2>
				<button
					class="btn btn-sm bg-gray-700 hover:bg-gray-600 border-none"
					on:click={() => (articleSelectModal = false)}
				>
					Exit
				</button>
			</div>

			<!-- Content -->
			<div class="p-6">
				<div class="flex flex-col mb-4">
					<button
						class="px-4 py-3 text-start {selectedArticle === ''
							? 'bg-blue-100 text-blue-800'
							: 'hover:bg-gray-100'}"
						on:click={() => {
							selectedArticle = '';
							articleSelectModal = false;
						}}
					>
						<i>New Article</i>
					</button>

					{#each data.articles as article}
						<button
							class="px-4 py-3 text-start {selectedArticle === article.title
								? 'bg-blue-100 text-blue-800'
								: 'hover:bg-gray-100'}"
							on:click={() => {
								selectedArticle = article.title;
								newSlug = article.slug;
								newTitle = article.title;
								newAuthor = article.author;
								// Convert Date object to MM/DD/YYYY string format for the form
								if (article.date instanceof Date) {
									const month = (article.date.getMonth() + 1).toString().padStart(2, '0');
									const day = article.date.getDate().toString().padStart(2, '0');
									const year = article.date.getFullYear();
									newDate = `${month}/${day}/${year}`;
								} else {
									newDate = article.date;
								}
								newCategories = article.categories;
								newDescription = article.description;
								newImage = article.image;
								fields = article.content;
								console.log(fields);
								console.log(article.content);
								articleSelectModal = false;
							}}
						>
							{article.title}
						</button>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.btn {
		color: white;
	}
	.input,
	.file-input {
		height: 40px !important;
		min-height: 10px !important;
	}

	.btn-video {
		background-color: brown;
	}
	.btn-custom {
		background-color: green;
	}
</style>
