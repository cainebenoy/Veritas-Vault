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
  content: string;
  createdAt: number;
  ipfsUrl: string;
  blockchainTx: string;
  screenshotUrl: string;
  status: 'complete' | 'failed';
  failureReason?: string;
};

export type ArchiveState = {
  status: 'success' | 'error' | 'idle';
  message: string;
  data?: {
    archiveId: string;
    ipfsUrl: string;
    blockchainTx: string;
  };
};
