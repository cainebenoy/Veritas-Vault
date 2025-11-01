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
  ipfsUrl: string;
  blockchainTx: string;
  screenshotUrl: string;
  status: 'complete' | 'failed' | 'pending';
  failureReason?: string;
};

export type ArchiveContent = {
  content: string;
}

export type ArchiveState = {
  status: 'success' | 'error' | 'idle';
  message: string;
  data?: {
    archiveId: string;
    ipfsUrl: string;
    blockchainTx: string;
  };
};
