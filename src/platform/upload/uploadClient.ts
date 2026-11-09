import { UPLOAD_BASE_URL } from '../config';
import type { UploadItem } from './types';

export class UploadHttpError extends Error {
  readonly response: { status: number };

  constructor(status: number) {
    super(`Upload failed with status ${status}`);
    this.name = 'UploadHttpError';
    this.response = { status };
  }
}

/**
 * Uploads one photo to its job.
 *
 * Rejects with `UploadHttpError` when the server responds with a non-2xx
 * status. Network failures (offline, timeouts, DNS) reject with whatever
 * `fetch` throws, usually a `TypeError`.
 */
export async function uploadPhoto(
  item: UploadItem,
  options: { signal?: AbortSignal } = {},
): Promise<void> {
  const body = new FormData();
  // React Native's FormData accepts a file descriptor object, which the DOM types don't model.
  const file = { uri: item.uri, name: `${item.id}.jpg`, type: 'image/jpeg' };
  body.append('photo', file as unknown as Blob);

  const response = await fetch(`${UPLOAD_BASE_URL}/jobs/${item.jobId}/photos`, {
    method: 'POST',
    body,
    signal: options.signal,
  });

  if (!response.ok) {
    throw new UploadHttpError(response.status);
  }
}
