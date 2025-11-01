'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getFirebase } from '@/firebase/server-init';
import { collection, doc, addDoc, serverTimestamp, getDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import type { ArchiveState } from './types';
import 'dotenv/config';


async function getArchives() {
  const { firestore } = getFirebase();
  const archivesCol = collection(firestore, 'archives');
  const q = query(archivesCol, orderBy('createdAt', 'desc'), limit(20));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return [];
  }

  const archives = snapshot.docs.map((doc) => {
    const data = doc.data();
    const createdAt = data.createdAt;
    
    return {
      id: doc.id,
      ...data,
      createdAt: createdAt?.toMillis ? createdAt.toMillis() : createdAt,
    };
  });
  
  return archives;
}


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
  
  const pinataContent = {
    title: title,
    html: content,
  };

  const pinataData = JSON.stringify({
    pinataContent: pinataContent,
    pinataMetadata: {
      name: `${title}.json`,
    },
  });

  const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.PINATA_JWT}`,
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


async function getScreenshotUrl(url: string) {
  const screenshotOneApiKey = process.env.SCREENSHOTONE_API_KEY;
  if (!screenshotOneApiKey) {
    console.warn("ScreenshotOne API key not found. Using placeholder image.");
    return `https://picsum.photos/seed/${Math.random()}/600/400`;
  }
  
  // Use a reliable screenshot service
  const screenshotApiUrl = `https://api.screenshotone.com/take?access_key=${screenshotOneApiKey}&url=${encodeURIComponent(url)}&full_page=false&viewport_width=1200&viewport_height=630`;

  // No need to fetch, the URL itself is what we store
  return screenshotApiUrl;
}

function extractImageUrlFromHtml(pageContent: string, baseUrl: string): string | null {
    try {
        // 1. Prioritize Open Graph image
        const ogImageMatch = pageContent.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["'](.*?)["']/i);
        if (ogImageMatch && ogImageMatch[1]) {
            console.log('Found og:image:', ogImageMatch[1]);
            return new URL(ogImageMatch[1], baseUrl).href;
        }

        // 2. Fallback to the first image tag in the body
        const bodyMatch = pageContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        if (bodyMatch) {
            const imgTagMatch = bodyMatch[1].match(/<img[^>]+src=["'](.*?)["']/i);
            if (imgTagMatch && imgTagMatch[1]) {
                console.log('Found first img tag:', imgTagMatch[1]);
                return new URL(imgTagMatch[1], baseUrl).href;
            }
        }
        
    } catch (e) {
        console.error('Error parsing image from HTML.', e);
    }
    
    // 3. If nothing is found, return null
    return null;
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
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const txHash = `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    // 4. Get Screenshot URL
    let screenshotUrl = extractImageUrlFromHtml(pageContent, url);
    if (!screenshotUrl) {
        console.log("No image found in HTML, generating a new screenshot.");
        screenshotUrl = await getScreenshotUrl(url);
    } else {
        console.log(`Using extracted image as screenshot: ${screenshotUrl}`);
    }


    // 5. Save to Firestore
    const archivesCollection = collection(firestore, 'archives');
    
    const newArchiveData = {
        originalUrl: url,
        title: pageTitle,
        createdAt: serverTimestamp(),
        ipfsUrl: ipfsUrl,
        blockchainTx: txHash,
        screenshotUrl: screenshotUrl,
        status: 'complete' as const,
    };

    const docRef = await addDoc(archivesCollection, newArchiveData);

    console.log("Document written with ID: ", docRef.id);
    
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

export async function getArchiveById(id: string): Promise<any | undefined> {
  try {
    const { firestore } = getFirebase();
    const archiveDocRef = doc(firestore, `archives/${id}`);
    
    const archiveDoc = await getDoc(archiveDocRef);
    
    if (!archiveDoc.exists()) {
      return undefined;
    }
    
    const ipfsHash = archiveDoc.data().ipfsUrl.replace('ipfs://', '');
    const pinataUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    
    const res = await fetch(pinataUrl);
    if (!res.ok) {
        console.error(`Failed to fetch content from Pinata: ${res.status} ${res.statusText}`);
        // Return metadata even if content fails to load
        const archiveData = { id: archiveDoc.id, ...archiveDoc.data() } as any;
        if (archiveData.createdAt && typeof archiveData.createdAt.toMillis === 'function') {
            archiveData.createdAt = archiveData.createdAt.toMillis();
        }
        return {
            ...archiveData,
            content: '<p>Error: Could not load archived content from IPFS.</p>',
        };
    }
    
    const jsonData = await res.json();
    const content = jsonData.html;
    
    const archiveData = { id: archiveDoc.id, ...archiveDoc.data() } as any;
    if (archiveData.createdAt && typeof archiveData.createdAt.toMillis === 'function') {
      archiveData.createdAt = archiveData.createdAt.toMillis();
    }
    
    return {
      ...archiveData,
      content: content,
    };
  } catch (error) {
    console.error(`Error fetching archive ${id}:`, error);
    return undefined;
  }
}
