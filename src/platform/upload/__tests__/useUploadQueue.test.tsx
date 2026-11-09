import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as uploadClient from '../uploadClient';
import { useUploadQueue } from '../useUploadQueue';

describe('useUploadQueue', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uploads an enqueued photo and marks it done', async () => {
    const uploadSpy = jest.spyOn(uploadClient, 'uploadPhoto').mockResolvedValue();
    const { result } = renderHook(() => useUploadQueue('job-1'));

    act(() => result.current.enqueue('file:///photo-1.jpg'));

    await waitFor(() => expect(result.current.items[0].status).toBe('done'));
    expect(uploadSpy).toHaveBeenCalledTimes(1);
    expect(uploadSpy.mock.calls[0][0]).toMatchObject({ jobId: 'job-1', uri: 'file:///photo-1.jpg' });
    expect(result.current.items[0].attempts).toBe(1);
  });

  it('marks the upload failed when the server rejects it', async () => {
    jest
      .spyOn(uploadClient, 'uploadPhoto')
      .mockRejectedValue(new uploadClient.UploadHttpError(400));
    const { result } = renderHook(() => useUploadQueue('job-1'));

    act(() => result.current.enqueue('file:///photo-1.jpg'));

    await waitFor(() => expect(result.current.items[0].status).toBe('failed'));
    expect(result.current.items[0].lastError).toBe('Upload failed with status 400');
  });

  it('uploads a failed photo again when the user retries', async () => {
    jest
      .spyOn(uploadClient, 'uploadPhoto')
      .mockRejectedValueOnce(new uploadClient.UploadHttpError(400))
      .mockResolvedValueOnce();
    const { result } = renderHook(() => useUploadQueue('job-1'));

    act(() => result.current.enqueue('file:///photo-1.jpg'));
    await waitFor(() => expect(result.current.items[0].status).toBe('failed'));

    act(() => result.current.retry(result.current.items[0].id));

    await waitFor(() => expect(result.current.items[0].status).toBe('done'));
    expect(result.current.items[0].attempts).toBe(2);
  });
});
