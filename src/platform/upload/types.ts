export type UploadStatus = 'queued' | 'uploading' | 'done' | 'failed';

export type UploadItem = {
  id: string;
  jobId: string;
  uri: string;
  status: UploadStatus;
  attempts: number;
  lastError?: string;
};
