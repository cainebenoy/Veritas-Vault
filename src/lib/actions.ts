'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import type { Archive, ArchiveState } from './types';
import { mockArchives } from './mock-data';

// Simulate a database fetch
export async function getArchives(): Promise<Archive[]> {
  // In a real app, you'd fetch this from Firestore or another DB
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return mockArchives;
}

export async function getArchiveById(id: string): Promise<Archive | undefined> {
  // In a real app, you'd fetch this from a DB
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockArchives.find((archive) => archive.id === id);
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

    // 4. Simulate saving to database and creating the new archive object
    const newArchive: Archive = {
        id: (mockArchives.length + 1).toString(),
        originalUrl: url,
        title: pageTitle,
        content: pageContent,
        createdAt: Date.now(),
        ipfsUrl: ipfsUrl,
        blockchainTx: txHash,
        screenshotUrl: `https://picsum.photos/seed/${Math.random()}/600/400`,
        status: 'complete',
    };

    // In a real app, you would save `newArchive` to your database.
    // For this simulation, we'll just pretend. We won't modify the mock data directly.
    // We will add it to the top of the array for UI demonstration purposes.
    mockArchives.unshift(newArchive);


    revalidatePath('/');
    
    return {
        status: 'success',
        message: 'Page successfully archived!',
        data: {
            archiveId: newArchive.id,
            ipfsUrl: newArchive.ipfsUrl,
            blockchainTx: newArchive.blockchainTx,
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
