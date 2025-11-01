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
    // 1. Simulate fetching the content from the URL
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const pageTitle = `Archived Page: ${new URL(url).hostname}`;
    const pageContent = `<html><head><title>${pageTitle}</title></head><body><h1>Successfully archived ${url}</h1><p>This is a simulated archive of the page content.</p><p>Archived on: ${new Date().toUTCString()}</p></body></html>`;

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

  } catch (error) {
    return {
      status: 'error',
      message: 'Archiving failed. Please try again.',
    };
  }
}
