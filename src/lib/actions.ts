
'use server';

import 'dotenv/config';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getFirebase } from '@/firebase/server-init';
import { doc, addDoc, setDoc, serverTimestamp, getDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import type { ArchiveState } from './types';

// NOTE: This is a high-fidelity simulation. In a real production app,
// the following functions would interact with actual backend services.
// The documentation in DECISIONS.md outlines the path to production.

/**
 * Simulates pinning content to an IPFS service like Pinata.
 * In a real app, this would make an API call to Pinata.
 * @returns A full, working Pinata gateway URL or null if simulated.
 */
async function pinContentToIpfs(content: string, title: string): Promise<string | null> {
  console.log('Simulating IPFS Pinning...');
  const { PINATA_API_KEY, PINATA_SECRET_API_KEY } = process.env;

  // If Pinata keys are present, use them to get a real, working URL.
  if (PINATA_API_KEY && PINATA_SECRET_API_KEY) {
    try {
      const pinataData = JSON.stringify({
        pinataContent: { title: title, html: content },
        pinataMetadata: { name: `${title.replace(/[^a-zA-Z0-9]/g, '-')}.json` },
        pinataOptions: { cidVersion: 1 }
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
      if (!res.ok) throw new Error(`Pinata API Error: ${res.statusText}`);
      const responseData = await res.json();
      const ipfsHash = responseData.IpfsHash;
      console.log('Successfully pinned to Pinata:', ipfsHash);
      // Return the full gateway URL for immediate access
      return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    } catch (error) {
      console.warn('Pinata upload failed, falling back to simulation.', error);
      // Fall through to simulation if Pinata fails.
    }
  }

  // Fallback simulation returns null because there's no real URL.
  await new Promise((resolve) => setTimeout(resolve, 1500));
  console.log('IPFS pinning simulated. No public URL generated.');
  return null;
}

/**
 * Simulates generating a blockchain transaction hash.
 * In a real app, this would involve a library like `viem` to interact with a smart contract.
 * @returns A simulated Polygon transaction hash.
 */
async function notarizeOnBlockchain(ipfsHash: string | null): Promise<string> {
  console.log('Simulating blockchain notarization...');
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const txHash = `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
  console.log(`Simulated TX Hash for IPFS content: ${txHash}`);
  return txHash;
}


/**
 * Gets a screenshot URL for the given page URL.
 * Uses a real service (ScreenshotOne) if an API key is provided, otherwise returns a placeholder.
 * @returns A URL for a screenshot image.
 */
async function getScreenshotUrl(url: string): Promise<string> {
  const screenshotOneApiKey = process.env.SCREENSHOTONE_API_KEY;
  if (!screenshotOneApiKey) {
    console.warn("ScreenshotOne API key not found. Using placeholder image.");
    // Generate a consistent placeholder based on the URL hash
    const seed = Array.from(url).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `https://picsum.photos/seed/${seed}/600/400`;
  }
  
  // Use a reliable screenshot service
  const screenshotApiUrl = new URL('https://api.screenshotone.com/take');
  screenshotApiUrl.searchParams.set('access_key', screenshotOneApiKey);
  screenshotApiUrl.searchParams.set('url', url);
  screenshotApiUrl.searchParams.set('full_page', 'false');
  screenshotApiUrl.searchParams.set('viewport_width', '1200');
  screenshotApiUrl.searchParams.set('viewport_height', '630');
  screenshotApiUrl.searchParams.set('block_ads', 'true');
  screenshotApiUrl.searchParams.set('block_cookie_banners', 'true');
  screenshotApiUrl.searchParams.set('cache', 'false'); // Use cache:false to get fresh screenshots for this demo

  return screenshotApiUrl.toString();
}

/**
 * The main server action to archive a URL.
 */
export async function archiveUrl(
  prevState: ArchiveState,
  formData: FormData
): Promise<ArchiveState> {
  const schema = z.object({
    url: z.string().url({ message: 'Please enter a valid URL.' }),
    tags: z.string().optional(),
  });

  const validatedFields = schema.safeParse({
    url: formData.get('url'),
    tags: formData.get('tags'),
  });

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    return {
      result: 'error',
      message: errors.url?.[0] || errors.tags?.[0] || 'Invalid input.',
    };
  }
  
  const { url, tags: tagsString } = validatedFields.data;
  const tags = tagsString
    ? tagsString.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean)
    : [];

  const { firestore } = await getFirebase();
  const tempDocRef = doc(collection(firestore, 'archives'));

  // Create temporary document immediately for UI feedback
  await setDoc(tempDocRef, {
      originalUrl: url,
      title: `Archiving: ${url}`,
      createdAt: serverTimestamp(),
      archiveStatus: 'pending',
      screenshotUrl: null,
      tags: tags.length > 0 ? tags : [],
  });
  revalidatePath('/');

  try {
    // 1. Fetch the content from the URL
    console.log(`Fetching content from: ${url}`);
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'VeritasVault/1.0 (+https://veritas-vault.example.com/bot)',
            'Accept': 'text/html',
        },
        redirect: 'follow',
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    const pageContent = await response.text();
    const titleMatch = pageContent.match(/<title>([^<]*)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].trim() : `Archived Page: ${new URL(url).hostname}`;
    
    await setDoc(tempDocRef, { title: pageTitle }, { merge: true });

    // 2. Upload to IPFS (Simulated or Real)
    const ipfsUrl = await pinContentToIpfs(pageContent, pageTitle);

    // 3. Notarize on Blockchain (Simulated)
    const txHash = await notarizeOnBlockchain(ipfsUrl);

    // 4. Get Screenshot URL
    const screenshotUrl = await getScreenshotUrl(url);

    // 5. Finalize document in Firestore
    const finalArchiveData = {
        originalUrl: url,
        title: pageTitle,
        createdAt: serverTimestamp(),
        ipfsUrl: ipfsUrl, // This will be the full Pinata URL or null
        blockchainTx: txHash,
        screenshotUrl: screenshotUrl,
        archiveStatus: 'complete' as const,
        tags: tags,
    };
    
    await setDoc(tempDocRef, finalArchiveData, { merge: true });

    // Store the full content separately to keep the main 'archives' collection light
    const contentDocRef = doc(firestore, 'archive_content', tempDocRef.id);
    await setDoc(contentDocRef, { content: pageContent });
    
    revalidatePath('/');
    revalidatePath(`/archives/${tempDocRef.id}`);
    
    return {
        result: 'success',
        message: 'Page successfully archived!',
        data: {
            archiveId: tempDocRef.id,
            ipfsUrl: ipfsUrl,
            blockchainTx: txHash,
        }
    };

  } catch (error: any) {
    console.error('Archiving failed:', error);
    
    // Update the doc to failed status
    await setDoc(tempDocRef, {
        archiveStatus: 'failed',
        failureReason: error.message || 'An unknown error occurred.',
    }, { merge: true });

    revalidatePath('/');
    revalidatePath(`/archives/${tempDocRef.id}`);
    
    return {
      result: 'error',
      message: error.message || 'Archiving failed. The server may be blocking requests.',
    };
  }
}

/**
 * Fetches a single archive's metadata and content by its ID.
 */
export async function getArchiveById(id: string): Promise<any | undefined> {
  try {
    const { firestore } = await getFirebase();
    const archiveDocRef = doc(firestore, `archives/${id}`);
    const contentDocRef = doc(firestore, `archive_content/${id}`);

    const [archiveDoc, contentDoc] = await Promise.all([
      getDoc(archiveDocRef),
      getDoc(contentDocRef)
    ]).catch(err => {
      console.error(`Error fetching docs for archive ${id}:`, err);
      return [null, null];
    });
    
    if (!archiveDoc || !archiveDoc.exists()) {
      return undefined;
    }
    
    const archiveData = { id: archiveDoc.id, ...archiveDoc.data() } as any;
    // Serialize Firestore Timestamp to a number (milliseconds) for client-side compatibility
    if (archiveData.createdAt && typeof archiveData.createdAt.toMillis === 'function') {
      archiveData.createdAt = archiveData.createdAt.toMillis();
    }
    
    const content = contentDoc && contentDoc.exists() 
      ? contentDoc.data().content 
      : '<p>Error: Could not load archived content.</p>';
    
    return {
      ...archiveData,
      content: content,
    };
  } catch (error) {
    console.error(`Error processing archive ${id}:`, error);
    return undefined;
  }
}
