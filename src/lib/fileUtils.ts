/**
 * 统一的文件上传和下载工具函数
 */

export interface UploadedFile {
  name: string;
  url: string;
  type: string;
  size: number;
}

/**
 * 上传文件到服务器
 */
export async function uploadFile(file: File): Promise<UploadedFile | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    if (!data.success) {
      console.error('文件上传失败:', data.message);
      return null;
    }

    return {
      name: file.name,
      url: data.url,
      type: file.type,
      size: file.size,
    };
  } catch (error) {
    console.error('文件上传错误:', error);
    return null;
  }
}

/**
 * 上传多个文件
 */
export async function uploadFiles(files: File[]): Promise<UploadedFile[]> {
  const uploadPromises = files.map(file => uploadFile(file));
  const results = await Promise.all(uploadPromises);
  return results.filter((file): file is UploadedFile => file !== null);
}

/**
 * 下载文件到本地
 */
export function downloadFile(url: string, filename: string) {
  try {
    // 如果是data URL (base64)，直接创建下载链接
    if (url.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // 如果是普通URL，使用fetch下载
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      })
      .catch(error => {
        console.error('文件下载失败:', error);
        alert('文件下载失败');
      });
  } catch (error) {
    console.error('文件下载错误:', error);
    alert('文件下载失败');
  }
}

/**
 * 获取文件类型图标
 */
export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️';
  if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
  if (mimeType.startsWith('text/')) return '📃';
  return '📎';
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
