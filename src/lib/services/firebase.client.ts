import { initializeApp        } from 'firebase/app';
import { getAuth              } from 'firebase/auth';
import { browser              } from '$app/environment';
import { getFirestore         } from 'firebase/firestore';
import { doc                  } from "firebase/firestore"; 
import { setDoc               } from "firebase/firestore"; 
import { getStorage           } from "firebase/storage";
import { ref                  } from "firebase/storage"; 
import { uploadBytes          } from "firebase/storage"; 
import type { FirebaseApp     } from 'firebase/app';
import type { FirebaseStorage } from 'firebase/storage';
import type { Firestore       } from 'firebase/firestore';
import type { Auth            } from 'firebase/auth';
import type { ArticlePreview, Content         } from './article.types';
import { getAuthorIdByName } from './firebase.services';

const FIREBASE_CONFIG = {
    apiKey            : import.meta.env.VITE_FIREBASE_API_KEY,
    appId             : import.meta.env.VITE_FIREBASE_APP_ID,
    authDomain        : import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId         : "crux-publication",
    storageBucket     : "crux-publication.appspot.com",
    messagingSenderId : "926866903206",
    measurementId     : "G-3QPPFXM22C"
};

export const app     : FirebaseApp     = initializeApp(FIREBASE_CONFIG);
export const db      : Firestore       = getFirestore(app);
export const storage : FirebaseStorage = getStorage(app);

export let auth: Auth;

export const initializeFirebase = () => {
    console.log("Initialize firebase");
    if (!browser) {
        throw new Error("Can't use the Firebase client on the server.");
    }
    if (!auth) {
        auth = getAuth(app);
    }

    console.log("After firebase is initialized", db);
    return auth;
};

export async function addArticle(articlePreview : ArticlePreview, content : Content[]) {
    console.log('article:', articlePreview);

    const slug = (articlePreview.slug === '' ? slugifyTitle(articlePreview.title) : articlePreview.slug);

    try {
        // Sanitize main image filename
        const sanitizedMainImageName = sanitizeFileName(articlePreview.image.fileName);
        
        // Upload main article image to Storage
        const mainImageRef = ref(storage, `files/${sanitizedMainImageName}`);
        const mainImageSnapshot = await uploadBytes(mainImageRef, articlePreview.image.file as File);
        console.log('Main image uploaded successfully', mainImageSnapshot);

        // Upload all content images to Storage
        const sanitizedContent = await Promise.all(content.map(async (item) => {
            if (item.type === 'image' && item.file) {
                // Sanitize content image filename
                const sanitizedContentImageName = sanitizeFileName(item.fileName);
                
                // Upload content image to Storage
                const contentImageRef = ref(storage, `files/${sanitizedContentImageName}`);
                const contentImageSnapshot = await uploadBytes(contentImageRef, item.file as File);
                console.log('Content image uploaded successfully:', sanitizedContentImageName, contentImageSnapshot);
                
                // Remove the file property and update fileName with sanitized version
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { file, ...rest } = item;
                return { ...rest, fileName: sanitizedContentImageName };
            }
            return item;
        }));
        
        // Remove the file property from main image and update fileName with sanitized version
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { file, ...sanitizedImage } = articlePreview.image;
        sanitizedImage.fileName = sanitizedMainImageName;

        // Convert date string to Date object if it's a string
        let dateToStore = articlePreview.date;
        if (typeof dateToStore === 'string') {
            // Handle MM/DD/YYYY format
            const dateParts = dateToStore.split('/');
            if (dateParts.length === 3) {
                const month = parseInt(dateParts[0]) - 1; // JavaScript months are 0-indexed
                const day = parseInt(dateParts[1]);
                const year = parseInt(dateParts[2]);
                dateToStore = new Date(year, month, day);
            } else {
                // Fallback to parsing the string directly
                dateToStore = new Date(dateToStore);
            }
        }

        // Handle authors array - if not provided, try to get author ID from author name
        let authorsArray = articlePreview.authors || [];
        if (authorsArray.length === 0 && articlePreview.author) {
            const authorId = await getAuthorIdByName(articlePreview.author);
            if (authorId) {
                authorsArray = [authorId];
            }
        }

        // Add doc to Firestore
        const sanitizedPreview = {
            slug: slug,
            title: articlePreview.title,
            author: articlePreview.author,
            authors: authorsArray,
            date: dateToStore,
            categories: articlePreview.categories,
            description: articlePreview.description,
            image: sanitizedImage,
        };

        const sanitizedArticle = {
            preview : sanitizedPreview,
            content : sanitizedContent,
        }

        await setDoc(doc(db, "article-preview", slug), sanitizedPreview);
        console.log("Preview successfully added");

        await setDoc(doc(db, "article-content", slug), sanitizedArticle);
        console.log("Content successfully added");
    } catch (error) {
        console.error('Error occurred while adding the article:', error);
        throw error; // Re-throw to let the calling function handle it
    }
}

function slugifyTitle(title : string) : string {
    return title
        .toLowerCase()               // Convert to lowercase
        .trim()                      // Remove leading/trailing spaces
        .replace(/[^\w\s-]/g, '')    // Remove all non-word characters (punctuation, etc.)
        .replace(/\s+/g, '-')        // Replace spaces with hyphens
        .replace(/-+/g, '-');        // Ensure no repeated hyphens
}

function sanitizeFileName(fileName: string): string {
    return fileName
        .replace(/[^a-zA-Z0-9.-]/g, '_')  // Replace special characters with underscores
        .replace(/_+/g, '_')              // Replace multiple underscores with single
        .replace(/^_|_$/g, '');           // Remove leading/trailing underscores
}