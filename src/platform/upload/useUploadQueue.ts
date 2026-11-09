import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { getInspection } from '../../features/inspections/inspectionStore';
import { getErrorMessage } from '../utils/errors';
import { uploadPhoto } from './uploadClient';
import type { UploadItem } from './types';

let nextId = 0;
const createId = () => `upload-${Date.now()}-${nextId++}`;

const BASE_DELAY_MS = 1000;

type Options = {
  maxRetries?: number;
};

/**
 * Queue of photo uploads for one job. Each photo is uploaded when it is
 * enqueued and retried automatically with exponential backoff when the server
 * has a problem. Failed uploads can also be retried by the user with `retry`.
 */
export function useUploadQueue(jobId: string, options: Options = {}) {
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

  // Back off harder on expensive (cellular) connections
  const isSlowNetwork = useRef(false);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      isSlowNetwork.current = state.details!.isConnectionExpensive;
    });
    return unsubscribe;
  }, []);

  const updateItem = useCallback((id: string, patch: Partial<UploadItem>) => {
    if (!isMounted.current) return;
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const runUpload = useCallback(
    async (item: UploadItem) => {
      const attempt = item.attempts + 1;
      updateItem(item.id, { status: 'uploading', attempts: attempt, progress: 0 });
      try {
        await uploadPhoto(item, {
          onProgress: (progress) => updateItem(item.id, { progress }),
        });
        updateItem(item.id, { status: 'done', progress: 1, lastError: undefined });
      } catch (error: any) {
        const status = error.response.status;
        const isRetryable = status >= 500 || status === 429;

        const inspection = getInspection(item.jobId);
        // Carrier claims have an SLA with the adjuster so try harder for those
        const maxRetries = inspection?.isCarrierClaim ? 10 : (options.maxRetries ?? 3);

        if (isRetryable && attempt < maxRetries) {
          const delay = BASE_DELAY_MS * 2 ** attempt * (isSlowNetwork.current ? 2 : 1);
          console.log(`[upload] retrying in ${delay}ms`, item);
          updateItem(item.id, { status: 'queued' });
          setTimeout(() => runUpload({ ...item, attempts: attempt }), delay);
          return;
        }

        updateItem(item.id, { status: 'failed', lastError: getErrorMessage(error) });

        if (inspection?.isCarrierClaim) {
          console.log(
            `[upload] giving up on ${item.id} for ${inspection.policyholderName} at ${inspection.propertyAddress}`,
          );
          Alert.alert(
            'Upload failed',
            `We'll let ${inspection.adjusterName} know that some photos didn't upload.`,
          );
        }
      }
    },
    [updateItem],
  );

  const enqueue = useCallback(
    (uri: string) => {
      const item: UploadItem = {
        id: createId(),
        jobId,
        uri,
        status: 'queued',
        attempts: 0,
        progress: 0,
      };
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
