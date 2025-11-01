'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { collection, addDoc, getDocs, doc, getDoc, query, orderBy, limit, serverTimestamp, setDoc } from 'firebase/firestore';
import { getFirebase } from '@/firebase/server-init';
import type { Archive, ArchiveState, ArchiveContent } from './types';

// Simulate a database fetch
export async function getArchives(): Promise<Archive[]> {
  const { firestore } = getFirebase();
  const archivesCol = collection(firestore, 'archives');
  const q = query(archivesCol, orderBy('createdAt', 'desc'), limit(20));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return [];
  }
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Archive));
}

export async function getArchiveById(id: string): Promise<(Archive & ArchiveContent) | undefined> {
  const { firestore } = getFirebase();
  const archiveDocRef = doc(firestore, 'archives', id);
  const contentDocRef = doc(firestore, 'archive_content', id);

  const [archiveDoc, contentDoc] = await Promise.all([
    getDoc(archiveDocRef),
    getDoc(contentDocRef)
  ]);

  if (!archiveDoc.exists()) {
    return undefined;
  }

  const archiveData = { id: archiveDoc.id, ...archiveDoc.data() } as Archive;
  const contentData = contentDoc.exists() ? contentDoc.data() as ArchiveContent : { content: '' };

  return {
    ...archiveData,
    ...contentData,
  };
}

const ArchiveUrlSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
});

export async function archiveUrl(
  prevState: ArchiveState,
  formData: FormData
): Promise<ArchiveState> {
  const validatedFields = ArchiveUrlSchema.safeParse({
    url: formData.get('url'),
  });

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: validatedFields.error.flatten().fieldErrors.url?.[0] || 'Invalid input.',
    };
  }
  
  const url = validatedFields.data.url;

  try {
    const { firestore } = getFirebase();
    // 1. Fetch the content from the URL
    console.log(`Fetching content from: ${url}`);
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'VeritasVault/1.0; (+https://veritas-vault.example.com/bot)',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const pageContent = await response.text();
    
    // Extract title from HTML
    const titleMatch = pageContent.match(/<title>(.*?)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1] : `Archived Page: ${new URL(url).hostname}`;
    console.log(`Fetched page with title: "${pageTitle}"`);

    // 2. Simulate uploading to IPFS via Pinata
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const ipfsHash = `bafybei${Math.random().toString(36).substring(2)}`;
    const ipfsUrl = `ipfs://${ipfsHash}`;
    
    // 3. Simulate notarizing on Polygon blockchain
    await new Promise((resolve) => setTimeout(resolve, 2500));
    const txHash = `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    // 4. Save to Firestore
    const archivesCollection = collection(firestore, 'archives');
    
    const newArchiveData: Omit<Archive, 'id'> = {
        originalUrl: url,
        title: pageTitle,
        createdAt: serverTimestamp(), // Use server timestamp
        ipfsUrl: ipfsUrl,
        blockchainTx: txHash,
        screenshotUrl: `https://picsum.photos/seed/${Math.random()}/600/400`,
        status: 'complete',
    };

    const docRef = await addDoc(archivesCollection, newArchiveData);
    console.log("Document written with ID: ", docRef.id);

    // Save the large content to a separate document
    const contentDocRef = doc(firestore, 'archive_content', docRef.id);
    await setDoc(contentDocRef, { content: pageContent });


    revalidatePath('/');
    revalidatePath(`/archives/${docRef.id}`);
    
    return {
        status: 'success',
        message: 'Page successfully archived!',
        data: {
            archiveId: docRef.id,
            ipfsUrl: ipfsUrl,
            blockchainTx: txHash,
        }
    };

  } catch (error: any) {
    console.error('Archiving failed:', error);
    return {
      status: 'error',
      message: error.message || 'Archiving failed. The server may be blocking requests.',
    };
  }
}
