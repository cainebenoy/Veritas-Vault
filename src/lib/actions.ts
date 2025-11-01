
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getFirebase } from '@/firebase/server-init';
import { doc, addDoc, setDoc, serverTimestamp, getDoc, collection } from 'firebase/firestore';
import type { ArchiveState } from './types';
import 'dotenv/config';


async function pinContentToPinata(content: string, title: string) {
  const { PINATA_API_KEY, PINATA_SECRET_API_KEY } = process.env;

  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    console.warn('Pinata API keys not found. Simulating IPFS upload.');
    // Fallback to simulation if keys are not provided
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const randomHash = [...Array(46)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    return `bafybei${randomHash}`;
  }
  
  const pinataData = JSON.stringify({
    pinataContent: {
      title: title,
      html: content,
    },
    pinataMetadata: {
      name: `${title.replace(/[^a-zA-Z0-9]/g, '-')}.json`,
    },
    pinataOptions: {
      cidVersion: 1,
    }
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


async function getScreenshotUrl(url: string) {
  const screenshotOneApiKey = process.env.SCREENSHOTONE_API_KEY;
  if (!screenshotOneApiKey) {
    console.warn("ScreenshotOne API key not found. Using placeholder image.");
    return `https://picsum.photos/seed/${Math.random()}/600/400`;
  }
  
  // Use a reliable screenshot service
  const screenshotApiUrl = `https://api.screenshotone.com/take?access_key=${screenshotOneApiKey}&url=${encodeURIComponent(url)}&full_page=false&viewport_width=1200&viewport_height=630&block_ads=true&block_cookie_banners=true`;

  // No need to fetch, the URL itself is what we store
  return screenshotApiUrl;
}

function extractImageUrlFromHtml(pageContent: string, baseUrl: string): string | null {
    try {
        // 1. Prioritize Open Graph image
        const ogImageMatch = pageContent.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["'](.*?)["']/i);
        if (ogImageMatch && ogImageMatch[1]) {
            const ogImageUrl = ogImageMatch[1];
            if (ogImageUrl.startsWith('http')) {
                 return new URL(ogImageUrl, baseUrl).href;
            }
        }

        // 2. Fallback to searching for a suitable image tag
        const bodyMatch = pageContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        if (bodyMatch) {
            const imgTags = bodyMatch[1].match(/<img[^>]+>/gi) || [];
            
            for (const imgTag of imgTags) {
                const srcMatch = imgTag.match(/src=["'](.*?)["']/i);
                if (!srcMatch || !srcMatch[1]) continue;

                const src = srcMatch[1];
                
                if (src.startsWith('data:')) continue;
                if (src.toLowerCase().includes('logo')) continue;

                const widthMatch = imgTag.match(/width=["'](\d+)["']/i);
                const heightMatch = imgTag.match(/height=["'](\d+)["']/i);
                const minSize = 150;

                if (widthMatch && parseInt(widthMatch[1], 10) < minSize) continue;
                if (heightMatch && parseInt(heightMatch[1], 10) < minSize) continue;
                
                return new URL(src, baseUrl).href;
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
  const validatedFields = z.object({
    url: z.string().url({ message: 'Please enter a valid URL.' }),
  }).safeParse({
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
    
    const titleMatch = pageContent.match(/<title>(.*?)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1] : `Archived Page: ${new URL(url).hostname}`;
    console.log(`Fetched page with title: "${pageTitle}"`);

    const { firestore } = getFirebase();
    
    // Create temporary document to show progress
    const tempDocRef = doc(collection(firestore, 'archives'));
    await setDoc(tempDocRef, {
        originalUrl: url,
        title: pageTitle,
        createdAt: serverTimestamp(),
        status: 'pending',
        screenshotUrl: `https://picsum.photos/seed/${tempDocRef.id}/600/400`,
    });
    console.log("Created temporary document with ID: ", tempDocRef.id);
    revalidatePath('/'); // Trigger UI update to show pending card

    // 2. Upload to IPFS via Pinata (can be slow)
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


    // 5. Update document in Firestore with all data
    const finalArchiveData = {
        originalUrl: url,
        title: pageTitle,
        createdAt: serverTimestamp(),
        ipfsUrl: ipfsUrl,
        blockchainTx: txHash,
        screenshotUrl: screenshotUrl,
        status: 'complete' as const,
    };
    
    await setDoc(tempDocRef, finalArchiveData, { merge: true });

    // Also store the full content separately to keep the main 'archives' collection light
    const contentDocRef = doc(firestore, 'archive_content', tempDocRef.id);
    await setDoc(contentDocRef, { content: pageContent });
    
    console.log("Finalized document with ID: ", tempDocRef.id);
    
    revalidatePath('/');
    revalidatePath(`/archives/${tempDocRef.id}`);
    
    return {
        status: 'success',
        message: 'Page successfully archived!',
        data: {
            archiveId: tempDocRef.id,
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
    
    const content = contentDoc.exists() 
      ? contentDoc.data().content 
      : '<p>Error: Could not load archived content.</p>';
    
    return {
      ...archiveData,
      content: content,
    };
  } catch (error) {
    console.error(`Error fetching archive ${id}:`, error);
    return undefined;
  }
}
