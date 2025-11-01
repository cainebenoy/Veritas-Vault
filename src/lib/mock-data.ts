import type { Archive } from './types';

// This file is no longer the primary source of truth, but can be kept for testing or as a backup.
export const mockArchives: Archive[] = [
  {
    id: '1',
    originalUrl: 'https://example.com/article-one',
    title: 'The Future of Decentralized Web',
    createdAt: new Date('2024-05-19T10:00:00Z').getTime(),
    ipfsUrl: 'ipfs://bafybeigdyrzt5s62f2q6e42o7733h3hzrwza4g4b3oeaby2j2g6cmjdi4y',
    blockchainTx: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    screenshotUrl: 'https://picsum.photos/seed/tech/600/400',
    status: 'complete',
  },
];
