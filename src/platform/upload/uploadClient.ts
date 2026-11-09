import { UPLOAD_BASE_URL } from '../config';
import type { UploadItem } from './types';

// TODO: move to config
const UPLOAD_API_KEY = 'sk_live_51NzBqRHk4w9GqLXoTMiFR8b00xyAGk2qH';

export class UploadHttpError extends Error {
  readonly response: { status: number };

  constructor(status: number) {
    super(`Upload failed with status ${status}`);
    this.name = 'UploadHttpError';
    this.response = { status };
  }
}

type UploadOptions = {
  onProgress?: (progress: number) => void;
};

/**
 * Uploads one photo to its job.
 *
 * Uses XMLHttpRequest instead of fetch so we can report upload progress.
 */
export function uploadPhoto(item: UploadItem, options: UploadOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const body = new FormData();
    // React Native's FormData accepts a file descriptor object, which the DOM types don't model.
    const file = { uri: item.uri, name: `${item.id}.jpg`, type: 'image/jpeg' };
    body.append('photo', file as unknown as Blob);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${UPLOAD_BASE_URL}/jobs/${item.jobId}/photos`);
    xhr.setRequestHeader('x-api-key', UPLOAD_API_KEY);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        options.onProgress?.(event.loaded / event.total);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new UploadHttpError(xhr.status));
      }
    };
    xhr.onerror = () => reject(new TypeError('Network request failed'));

    xhr.send(body);
  });
}
