'use client';

import { downloadFile, getFileIcon, formatFileSize } from '@/lib/fileUtils';

interface FileMessageProps {
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  fileMimeType?: string;
}

export default function FileMessage({ fileName, fileUrl, fileSize, fileMimeType }: FileMessageProps) {
  const handleDownload = () => {
    downloadFile(fileUrl, fileName);
  };

  const icon = fileMimeType ? getFileIcon(fileMimeType) : '📎';
  const sizeText = fileSize ? formatFileSize(fileSize) : '';

  // 如果是图片，显示预览
  if (fileMimeType?.startsWith('image/')) {
    return (
      <div className="max-w-sm">
        <img 
          src={fileUrl} 
          alt={fileName} 
          className="rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          onClick={handleDownload}
        />
        <div className="mt-2 text-sm text-slate-600 flex items-center justify-between">
          <span className="truncate">{fileName}</span>
          {sizeText && <span className="ml-2 text-slate-400">{sizeText}</span>}
        </div>
      </div>
    );
  }

  // 其他文件类型显示为下载卡片
  return (
    <div 
      onClick={handleDownload}
      className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors max-w-sm"
    >
      <div className="text-3xl">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-slate-900 truncate">{fileName}</div>
        {sizeText && <div className="text-sm text-slate-500">{sizeText}</div>}
      </div>
      <div className="text-slate-400">⬇️</div>
    </div>
  );
}
