// SvelteKit 2.5.x
// which uses Svelte 4 internally

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	const __VERCEL_IMAGES__: boolean;

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
