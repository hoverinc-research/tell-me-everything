import React from 'react';
import { CameraScreen } from '../../platform/camera/CameraScreen';
import { UploadQueueList } from '../../platform/upload/UploadQueueList';
import { useUploadQueue } from '../../platform/upload/useUploadQueue';

type Props = {
  jobId: string;
};

export function InspectionCaptureScreen({ jobId }: Props) {
  const { items, enqueue, retry } = useUploadQueue(jobId);

  return (
    <CameraScreen onCapture={enqueue} footer={<UploadQueueList items={items} onRetry={retry} />} />
  );
}
