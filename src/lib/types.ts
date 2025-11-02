import type { FieldValue } from "firebase/firestore";

export type ArchiveStatus =
  | 'idle'
  | 'pending'
  | 'fetching'
  | 'uploading'
  | 'notarizing'
  | 'complete'
  | 'error';

export type Archive = {
  id: string;
  originalUrl: string;
  title: string;
  createdAt: FieldValue | number;
  ipfsUrl: string | null; // Can be a full URL or null if simulated
  blockchainTx: string;
  screenshotUrl: string;
  archiveStatus: 'complete' | 'failed' | 'pending';
  failureReason?: string;
  tags?: string[];
};

export type ArchiveContent = {
  content: string;
}

export type ArchiveState = {
  result: 'success' | 'error' | 'idle';
  message: string;
  data?: {
    archiveId: string;
    ipfsUrl: string | null;
    blockchainTx: string;
  };
};
