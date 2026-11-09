import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../utils/errors';
import { uploadPhoto } from './uploadClient';
import type { UploadItem } from './types';

let nextId = 0;
const createId = () => `upload-${Date.now()}-${nextId++}`;

/**
 * Queue of photo uploads for one job. Each photo is uploaded once when it is
 * enqueued; failed uploads can be retried by the user with `retry`.
 */
export function useUploadQueue(jobId: string) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const isMounted = useRef(true);
  useEffect(
    () => () => {
      isMounted.current = false;
    },
    [],
  );

  const updateItem = useCallback((id: string, patch: Partial<UploadItem>) => {
    if (!isMounted.current) return;
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const runUpload = useCallback(
    async (item: UploadItem) => {
      updateItem(item.id, { status: 'uploading', attempts: item.attempts + 1 });
      try {
        await uploadPhoto(item);
        updateItem(item.id, { status: 'done', lastError: undefined });
      } catch (error) {
        updateItem(item.id, { status: 'failed', lastError: getErrorMessage(error) });
      }
    },
    [updateItem],
  );

  const enqueue = useCallback(
    (uri: string) => {
      const item: UploadItem = { id: createId(), jobId, uri, status: 'queued', attempts: 0 };
      setItems((prev) => [...prev, item]);
      void runUpload(item);
    },
    [jobId, runUpload],
  );

  const retry = useCallback(
    (id: string) => {
      const item = itemsRef.current.find((candidate) => candidate.id === id);
      if (item?.status === 'failed') {
        void runUpload(item);
      }
    },
    [runUpload],
  );

  return { items, enqueue, retry };
}
