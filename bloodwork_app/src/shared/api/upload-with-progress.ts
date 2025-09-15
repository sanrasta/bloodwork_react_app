import * as FileSystem from 'expo-file-system';
import { getApiBaseUrl, type ApiResponse, type ApiError } from './base';

export type UploadProgressCallback = (progress: number) => void; // 0..1

type UploadArgs = {
  fileUri: string;
  fileName: string;
  mimeType?: string;
  authToken: string;
  onProgress?: UploadProgressCallback;
};

export async function uploadPdfWithProgress<T = any>({
  fileUri,
  fileName,
  mimeType = 'application/pdf',
  authToken,
  onProgress,
}: UploadArgs): Promise<ApiResponse<T>> {
  const url = `${getApiBaseUrl()}/uploads`;

  // If FileSystem is not available, fall back to fetch + FormData
  const fsAvailable = (FileSystem as any)?.createUploadTask && FileSystem.FileSystemUploadType;
  if (!fsAvailable) {
    const fd = new FormData();
    fd.append('file', {
      // @ts-ignore
      uri: fileUri,
      name: fileName,
      type: mimeType,
    });
    return fetch(`${getApiBaseUrl()}/uploads`, {
      method: 'POST',
      body: fd as any,
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw { message: err.message || 'Upload failed', status: res.status } as ApiError;
        }
        return res.json();
      })
      .catch(() => {
        throw { message: 'Network error occurred', status: 0 } as ApiError;
      });
  }

  return new Promise<ApiResponse<T>>((resolve, reject) => {
    const task = FileSystem.createUploadTask(
      url,
      fileUri,
      {
        httpMethod: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: 'file',
        parameters: {
          // can include additional form fields here as needed
        },
        mimeType,
      },
      (progressData) => {
        if (!onProgress) return;
        const { totalByteSent, totalBytesExpectedToSend } = progressData;
        if (totalBytesExpectedToSend > 0) {
          onProgress(totalByteSent / totalBytesExpectedToSend);
        }
      }
    );

    task
      .uploadAsync()
      .then((res) => {
        const status = res.status ?? 0;
        if (status >= 200 && status < 300) {
          try {
            const json = JSON.parse(res.body ?? '{}');
            resolve(json as ApiResponse<T>);
          } catch {
            reject({ message: 'Invalid server response', status } as ApiError);
          }
        } else {
          try {
            const json = JSON.parse(res.body ?? '{}');
            reject({ message: json.message || 'Upload failed', status, errors: json.errors } as ApiError);
          } catch {
            reject({ message: 'Upload failed', status } as ApiError);
          }
        }
      })
      .catch(() => {
        reject({ message: 'Network error occurred', status: 0 } as ApiError);
      });
  });
}

export async function uploadPdfWithRetry<T = any>(args: UploadArgs, maxAttempts = 3): Promise<ApiResponse<T>> {
  let attempt = 0;
  // Exponential backoff with jitter
  while (true) {
    try {
      return await uploadPdfWithProgress<T>(args);
    } catch (e: any) {
      attempt += 1;
      const status = typeof e?.status === 'number' ? e.status : 0;
      // Do not retry auth errors or validation errors
      if (status === 401 || status === 403 || (status >= 400 && status < 500 && status !== 408)) {
        throw e;
      }
      if (attempt >= maxAttempts) {
        throw e;
      }
      const delay = Math.min(1000 * 2 ** (attempt - 1), 8000) + Math.floor(Math.random() * 400);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}


