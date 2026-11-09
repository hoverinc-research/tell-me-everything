import React from 'react';
import { Text } from 'react-native';
import { CameraScreen } from '../../platform/camera/CameraScreen';
import { useIsOnline } from '../../platform/network/useIsOnline';
import { useUploadQueue } from '../../platform/upload/useUploadQueue';

type Props = {
  jobId: string;
};

export function InspectionCaptureScreen({ jobId }: Props) {
  const isOnline = useIsOnline();
  const { items, enqueue } = useUploadQueue(jobId);
  const pending = items.filter((item) => item.status !== 'done').length;

  return (
    <CameraScreen
      onCapture={enqueue}
      footer={
        <Text>
          {pending} photos uploading{isOnline ? '' : ' (offline)'}
        </Text>
      }
    />
  );
}
