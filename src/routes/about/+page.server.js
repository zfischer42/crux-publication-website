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

        // Separate board members, current members, and past members
        const currentBoard = allAuthors.filter(author => author.currentAuthor === "board")
        const currentAuthors = allAuthors.filter(author => author.currentAuthor === "general member");
        const pastAuthors = allAuthors.filter(author => author.currentAuthor === "past member");

        return {
            currentBoard,
            currentAuthors,
            pastAuthors
        };

    } catch (error) {
        console.error('Error loading authors:', error);
        return {
            currentBoard: [],
            currentAuthors: [],
            pastAuthors: [],
        };
    }
}
