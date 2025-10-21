import { getAllArticlesWithContent } from '$lib/services/firebase.services';

export async function load() {
    // Query Firestore for articles with content
    const articles = await getAllArticlesWithContent();

    // Pass articles to the frontend
    return {
        articles,
    };
}
