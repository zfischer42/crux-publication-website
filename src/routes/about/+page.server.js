import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '$lib/services/firebase.client';

export async function load() {
    try {
        // Get all authors from Firebase
        const authorsRef = collection(db, 'authors');
        const snapshot = await getDocs(authorsRef);
        
        const allAuthors = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                title: data.title,
                linkedin: data.linkedin,
                pfp: data.pfp,
                currentAuthor: data.currentAuthor
            };
        });

        // Separate current and past authors
        const currentAuthors = allAuthors.filter(author => author.currentAuthor !== false);
        const pastAuthors = allAuthors.filter(author => author.currentAuthor === false);

        return {
            currentAuthors,
            pastAuthors
        };
    } catch (error) {
        console.error('Error loading authors:', error);
        return {
            currentAuthors: [],
            pastAuthors: []
        };
    }
}
