'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getFirebase } from '@/firebase/server-init';
import { collection, doc, addDoc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import type { ArchiveState } from './types';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import 'dotenv/config';

// Simulate a database fetch (This function is now replaced by getArchives in archive-gallery)
// We keep it here as a reference or for other potential server-side uses.
export async function getArchives() {
  const { firestore } = getFirebase();
  const archivesCol = collection(firestore, 'archives');
  // ... implementation to get archives if needed, for now it's handled client-side
  return [];
}

// ... getArchiveById remains the same

const ArchiveUrlSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
});

async function pinContentToPinata(content: string, title: string) {
  const { PINATA_API_KEY, PINATA_SECRET_API_KEY } = process.env;

  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    console.warn('Pinata API keys not found. Simulating IPFS upload.');
    // Fallback to simulation if keys are not provided
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return `bafybei${Math.random().toString(36).substring(2)}`;
  }

  const pinataData = JSON.stringify({
    pinataContent: {
      title: title,
      content: content,
    },
    pinataMetadata: {
      name: `${title}.json`,
    },
  });

  const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'pinata_api_key': PINATA_API_KEY,
      'pinata_secret_api_key': PINATA_SECRET_API_KEY,
    },
    body: pinataData,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to pin content to Pinata: ${res.status} ${res.statusText} - ${errorBody}`);
  }

  const responseData = await res.json();
  return responseData.IpfsHash;
}


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
    
    const titleMatch = pageContent.match(/<title>(.*?)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1] : `Archived Page: ${new URL(url).hostname}`;
    console.log(`Fetched page with title: "${pageTitle}"`);

    // 2. Upload to IPFS via Pinata
    console.log('Uploading content to IPFS via Pinata...');
    const ipfsHash = await pinContentToPinata(pageContent, pageTitle);
    const ipfsUrl = `ipfs://${ipfsHash}`;
    console.log(`Content pinned to IPFS: ${ipfsUrl}`);
    
    // 3. Simulate notarizing on Polygon blockchain
    await new Promise((resolve) => setTimeout(resolve, 2500));
    const txHash = `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    // 4. Save to Firestore
    const archivesCollection = collection(firestore, 'archives');
    
    const newArchiveData = {
        originalUrl: url,
        title: pageTitle,
        createdAt: serverTimestamp(),
        ipfsUrl: ipfsUrl,
        blockchainTx: txHash,
        screenshotUrl: `https://picsum.photos/seed/${Math.random()}/600/400`,
        status: 'complete' as const,
    };

    const docRef = await addDoc(archivesCollection, newArchiveData)
      .catch(serverError => {
        const permissionError = new FirestorePermissionError({
          path: archivesCollection.path,
          operation: 'create',
          requestResourceData: newArchiveData
        });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
      });

    console.log("Document written with ID: ", docRef.id);

    const contentDocRef = doc(firestore, `archive_content/${docRef.id}`);
    const contentData = { content: pageContent };
    
    await setDoc(contentDocRef, contentData)
        .catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: contentDocRef.path,
                operation: 'create',
                requestResourceData: contentData
            });
            errorEmitter.emit('permission-error', permissionError);
            throw permissionError;
        });


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
    if (error instanceof FirestorePermissionError) {
        throw error;
    }
    console.error('Archiving failed:', error);
    return {
      status: 'error',
      message: error.message || 'Archiving failed. The server may be blocking requests.',
    };
  }
}

export async function getArchiveById(id: string): Promise<any | undefined> {
  const { firestore } = getFirebase();
  const archiveDocRef = doc(firestore, `archives/${id}`);
  const contentDocRef = doc(firestore, `archive_content/${id}`);

  const [archiveDoc, contentDoc] = await Promise.all([
    getDoc(archiveDocRef),
    getDoc(contentDocRef)
  ]);

  if (!archiveDoc.exists()) {
    return undefined;
  }

  const archiveData = { id: archiveDoc.id, ...archiveDoc.data() } as any;
  if (archiveData.createdAt && typeof archiveData.createdAt.toMillis === 'function') {
    archiveData.createdAt = archiveData.createdAt.toMillis();
  }
  
  const contentData = contentDoc.exists() ? (contentDoc.data() as any) : { content: '' };

  return {
    ...archiveData,
    ...contentData,
  };
}
