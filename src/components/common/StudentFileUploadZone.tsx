import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  File,
  X,
  CheckCircle2,
  AlertCircle,
  Download,
  Eye,
  FileCode,
} from 'lucide-react';
import { readFileAsDataURL } from '../../utils/exportImport';

export interface UploadedFileItem {
  name: string;
  size: number;
  type?: string;
  dataUrl?: string;
}

interface StudentFileUploadZoneProps {
  files: UploadedFileItem[];
  onChange: (files: UploadedFileItem[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  label?: string;
  description?: string;
  allowTypes?: ('word' | 'pdf' | 'excel')[];
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getFileCategory(fileName: string, mimeType?: string): 'word' | 'pdf' | 'excel' | 'other' {
  const lower = fileName.toLowerCase();
  if (
    lower.endsWith('.docx') ||
    lower.endsWith('.doc') ||
    mimeType?.includes('word') ||
    mimeType?.includes('officedocument.wordprocessingml')
  ) {
    return 'word';
  }
  if (lower.endsWith('.pdf') || mimeType?.includes('pdf')) {
    return 'pdf';
  }
  if (
    lower.endsWith('.xlsx') ||
    lower.endsWith('.xls') ||
    lower.endsWith('.csv') ||
    mimeType?.includes('spreadsheet') ||
    mimeType?.includes('excel') ||
    mimeType?.includes('csv')
  ) {
    return 'excel';
  }
  return 'other';
}

export function FileTypeBadge({ fileName, mimeType }: { fileName: string; mimeType?: string }) {
  const cat = getFileCategory(fileName, mimeType);
  if (cat === 'word') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
        <FileText className="w-3 h-3 text-blue-600 dark:text-blue-400" />
        WORD
      </span>
    );
  }
  if (cat === 'pdf') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
        <File className="w-3 h-3 text-rose-600 dark:text-rose-400" />
        PDF
      </span>
    );
  }
  if (cat === 'excel') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
        <FileSpreadsheet className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
        EXCEL
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
      <FileCode className="w-3 h-3 text-slate-500" />
      TỆP
    </span>
  );
}

export const StudentFileUploadZone: React.FC<StudentFileUploadZoneProps> = ({
  files,
  onChange,
  maxFiles = 5,
  maxSizeMB = 25,
  label = 'Tải lên tệp bài làm của học sinh (Word, PDF, Excel)',
  description = 'Hỗ trợ tệp Microsoft Word (.docx, .doc), Adobe PDF (.pdf), Microsoft Excel (.xlsx, .xls, .csv). Tối đa 25MB/tệp.',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const acceptedExtensions = ['.doc', '.docx', '.pdf', '.xls', '.xlsx', '.csv'];

  const validateFile = (file: File): boolean => {
    const lowerName = file.name.toLowerCase();
    const isExtensionMatch = acceptedExtensions.some((ext) => lowerName.endsWith(ext));
    if (!isExtensionMatch) {
      setErrorMessage(`Tệp "${file.name}" không hợp lệ. Vui lòng chỉ tải lên file Word (.doc, .docx), PDF (.pdf), hoặc Excel (.xls, .xlsx, .csv).`);
      return false;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setErrorMessage(`Tệp "${file.name}" vượt quá dung lượng tối đa ${maxSizeMB}MB.`);
      return false;
    }
    return true;
  };

  const processFiles = async (fileList: FileList | File[]) => {
    setErrorMessage(null);
    const validFiles: File[] = [];
    const array = Array.from(fileList);

    if (files.length + array.length > maxFiles) {
      setErrorMessage(`Bạn chỉ có thể tải lên tối đa ${maxFiles} tệp đính kèm.`);
      return;
    }

    for (const file of array) {
      if (validateFile(file)) {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) return;

    setIsReading(true);
    try {
      const newItems: UploadedFileItem[] = [];
      for (const file of validFiles) {
        const dataUrl = await readFileAsDataURL(file);
        newItems.push({
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          dataUrl,
        });
      }
      onChange([...files, ...newItems]);
    } catch (err: any) {
      setErrorMessage(`Lỗi khi đọc tệp: ${err.message || 'Không thể tải tệp'}`);
    } finally {
      setIsReading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (index: number) => {
    const updated = files.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleDownload = (item: UploadedFileItem) => {
    if (!item.dataUrl) return;
    const a = document.createElement('a');
    a.href = item.dataUrl;
    a.download = item.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <UploadCloud className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {label}
          </label>
          <span className="text-[11px] text-slate-500">
            {files.length}/{maxFiles} tệp
          </span>
        </div>
      )}

      {/* Format pills indicator */}
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <span className="text-slate-500 font-medium">Định dạng được chấp nhận:</span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <FileText className="w-3 h-3 text-blue-600" /> Word (.doc, .docx)
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <File className="w-3 h-3 text-rose-600" /> PDF (.pdf)
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <FileSpreadsheet className="w-3 h-3 text-emerald-600" /> Excel (.xlsx, .xls, .csv)
        </span>
      </div>

      {/* Drag and drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-800/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".doc,.docx,.pdf,.xls,.xlsx,.csv,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
          onChange={(e) => e.target.files && processFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
            {isReading ? (
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>
          <div className="text-xs">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Bấm để chọn tệp
            </span>{' '}
            <span className="text-slate-600 dark:text-slate-400">hoặc kéo và thả tệp Word, PDF, Excel vào đây</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-md">{description}</p>
        </div>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="ml-auto text-rose-500 hover:text-rose-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Đã tải lên {files.length} tệp đính kèm:
          </p>
          <div className="space-y-1.5">
            {files.map((file, idx) => {
              const cat = getFileCategory(file.name, file.type);
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xs hover:shadow-xs transition-shadow"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                    <FileTypeBadge fileName={file.name} mimeType={file.type} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {formatFileSize(file.size)} • {cat.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {file.dataUrl && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(file);
                        }}
                        title="Tải xuống tệp này"
                        className="p-1 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(idx);
                      }}
                      title="Xóa tệp"
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
