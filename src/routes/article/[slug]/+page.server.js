import { error } from '@sveltejs/kit';
import { loadArticle } from '$lib/services/firebase.services';  // Assuming this is your Firestore query function

export async function load({ params }) {
    // Access the slug from the params
    const slug = params.slug;

    // Query Firestore for articles based on the slug
    const article = await loadArticle(slug);
	// console.log("server", article)
	if (!article) error(404, 'Article not found');

    // Pass the articles to the frontend
    return {
        article,
    };
}
