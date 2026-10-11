import React, { useState } from 'react';
import {
  FolderArchive,
  Upload,
  Download,
  Eye,
  Edit2,
  Trash2,
  Search,
  Filter,
  Plus,
  FileText,
  FileSpreadsheet,
  FileImage,
  FileCode,
  Tag,
  Link2,
  X,
  CheckCircle,
} from 'lucide-react';
import { LearningMaterial, Lesson, Test, Role } from '../../types';
import { StorageService } from '../../services/storage';
import { downloadFile, readFileAsDataURL } from '../../utils/exportImport';
import { ConfirmModal } from '../common/ConfirmModal';

interface LearningMaterialsViewProps {
  currentRole: Role;
  materials: LearningMaterial[];
  lessons: Lesson[];
  tests: Test[];
  onRefresh: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const LearningMaterialsView: React.FC<LearningMaterialsViewProps> = ({
  currentRole,
  materials,
  lessons,
  tests,
  onRefresh,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<LearningMaterial | null>(null);
  const [previewingMaterial, setPreviewingMaterial] = useState<LearningMaterial | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LearningMaterial | null>(null);

  // Selected file for upload
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    type: string;
    dataUrl: string;
  } | null>(null);

  // Filter materials
  const allTags = Array.from(new Set(materials.flatMap((m) => m.tags)));
  const subjects = Array.from(new Set(materials.map((m) => m.subject)));

  const filteredMaterials = materials.filter((m) => {
    const matchSubject = selectedSubject === 'all' || m.subject === selectedSubject;
    const matchTag = selectedTag === 'all' || m.tags.includes(selectedTag);
    const matchQuery =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSubject && matchTag && matchQuery;
  });

  // Handle File Input
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataURL(file);
      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        dataUrl,
      });
    } catch (err: any) {
      onShowToast('error', 'Lỗi đọc tệp', err.message);
    }
  };

  // Handle Save / Upload
  const handleSaveMaterial = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = fd.get('title') as string;
    const subject = (fd.get('subject') as string) || 'Hóa học';
    const grade = Number(fd.get('grade') || 11);
    const topic = fd.get('topic') as string;
    const lesson = fd.get('lesson') as string;
    const author = (fd.get('author') as string) || 'Tổ Hóa học THPT';
    const description = fd.get('description') as string;
    const tagsStr = (fd.get('tags') as string) || '';
    const tags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    const linkedLessonIds = fd.getAll('linkedLessonIds') as string[];
    const linkedTestIds = fd.getAll('linkedTestIds') as string[];

    const finalFileName = uploadedFile ? uploadedFile.name : editingMaterial?.fileName || `${title.replace(/\s+/g, '_')}.pdf`;
    const finalFileSize = uploadedFile ? uploadedFile.size : editingMaterial?.fileSize || 102400;
    const finalFileType = uploadedFile ? uploadedFile.type : editingMaterial?.fileType || 'application/pdf';
    const finalDataUrl = uploadedFile ? uploadedFile.dataUrl : editingMaterial?.fileDataUrl || '';

    const matToSave: LearningMaterial = {
      id: editingMaterial ? editingMaterial.id : `mat-${Date.now()}`,
      title,
      subject,
      grade,
      topic,
      lesson,
      schoolYear: '2025-2026',
      author,
      tags: tags.length > 0 ? tags : ['#HocLieuChuan', '#Hóa11'],
      version: editingMaterial?.version || 1,
      fileName: finalFileName,
      fileSize: finalFileSize,
      fileType: finalFileType,
      fileDataUrl: finalDataUrl,
      description,
      linkedLessonIds,
      linkedTestIds,
      createdAt: editingMaterial?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveMaterial(matToSave);
    setIsUploadModalOpen(false);
    setEditingMaterial(null);
    setUploadedFile(null);
    onShowToast('success', 'Thành công', `Đã lưu học liệu: ${title}`);
    onRefresh();
  };

  // Handle Download File
  const handleDownload = (mat: LearningMaterial) => {
    if (mat.fileDataUrl && mat.fileDataUrl.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = mat.fileDataUrl;
      a.download = mat.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Download text summary
      const textContent = `HỌC LIỆU CHUẨN: ${mat.title}\nMôn: ${mat.subject} - Lớp ${mat.grade}\nChủ đề: ${mat.topic}\nBài học: ${mat.lesson}\nTác giả: ${mat.author}\nPhiên bản: v${mat.version}\n\nMÔ TẢ HỌC LIỆU:\n${mat.description}`;
      downloadFile(mat.fileName.endsWith('.txt') ? mat.fileName : `${mat.fileName}.txt`, textContent);
    }
    onShowToast('info', 'Tải xuống', `Đang tải tệp: ${mat.fileName}`);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (fileType.includes('spreadsheet') || fileType.includes('csv') || fileType.includes('excel'))
      return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    if (fileType.includes('image')) return <FileImage className="w-5 h-5 text-purple-500" />;
    return <FileCode className="w-5 h-5 text-blue-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <FolderArchive className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Kho Học Liệu & Quản Lý Tệp Đối Chiếu AI
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Học liệu chuẩn hóa dùng để đối chiếu phát hiện ảo giác AI, gắn kết trực tiếp vào bài học và đề kiểm tra.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingMaterial(null);
            setUploadedFile(null);
            setIsUploadModalOpen(true);
          }}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-xs whitespace-nowrap"
        >
          <Upload className="w-4 h-4" />
          <span>{currentRole === 'student' ? 'Học Sinh Tải Lên Tệp (Word / PDF / Excel)' : 'Tải Lên Học Liệu Mới'}</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tài liệu theo tên, chủ đề hoặc tên file..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium"
          >
            <option value="all">Tất cả môn học</option>
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>

          {/* Tag Filter */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium"
          >
            <option value="all">Tất cả thẻ Tag</option>
            {allTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Hiển thị <strong>{filteredMaterials.length}</strong> / {materials.length} tài liệu
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.map((mat) => (
          <div
            key={mat.id}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                    {getFileIcon(mat.fileType)}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
                      {mat.subject} • Lớp {mat.grade}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-2 font-mono">v{mat.version}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setPreviewingMaterial(mat)}
                    className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    title="Xem chi tiết"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownload(mat)}
                    className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                    title="Tải tệp xuống"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingMaterial(mat);
                      setUploadedFile(null);
                      setIsUploadModalOpen(true);
                    }}
                    className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                    title="Sửa thông tin"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(mat)}
                    className="p-1 text-slate-400 hover:text-red-600"
                    title="Xóa học liệu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-3 line-clamp-2">
                {mat.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{mat.description}</p>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-1">
                {mat.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer Metadata */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span className="truncate max-w-[140px] font-mono">{mat.fileName}</span>
              <span>{(mat.fileSize / 1024).toFixed(0)} KB</span>
            </div>
          </div>
        ))}
      </div>

      {/* PREVIEW MODAL */}
      {previewingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                {getFileIcon(previewingMaterial.fileType)}
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-md">
                  {previewingMaterial.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewingMaterial(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                <div>
                  <span className="text-slate-500">Chủ đề:</span>{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{previewingMaterial.topic}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Bài học liên kết:</span>{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{previewingMaterial.lesson}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Người thẩm định:</span>{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{previewingMaterial.author}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Kích thước file:</span>{' '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {(previewingMaterial.fileSize / 1024).toFixed(1)} KB
                  </strong>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Mô tả và trích dẫn chuẩn:</h4>
                <p className="text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  {previewingMaterial.description}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => handleDownload(previewingMaterial)}
                  className="px-4 py-2 font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải tệp này xuống máy</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD / EDIT MATERIAL MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
              {editingMaterial
                ? 'Sửa thông tin học liệu'
                : currentRole === 'student'
                ? 'Học sinh tải lên tệp bài tập / ghi chú / minh chứng (Word, PDF, Excel)'
                : 'Tải lên học liệu chuẩn & đính kèm tệp thật'}
            </h3>

            <form onSubmit={handleSaveMaterial} className="space-y-4 text-xs">
              {/* File upload drag drop area */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-indigo-500 transition-colors bg-slate-50 dark:bg-slate-800/40">
                <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {uploadedFile ? uploadedFile.name : editingMaterial?.fileName || 'Nhấp để chọn tệp hoặc kéo thả vào đây'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {uploadedFile
                    ? `Kích thước: ${(uploadedFile.size / 1024).toFixed(1)} KB • Định dạng: ${uploadedFile.type}`
                    : 'Hỗ trợ: Word (.docx, .doc), PDF (.pdf), Excel (.xlsx, .xls, .csv), TXT, Hình ảnh (Tối đa 50MB)'}
                </p>
                <label className="mt-3 inline-block px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-medium cursor-pointer hover:bg-indigo-700">
                  Chọn tệp từ máy tính
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".docx,.doc,.pdf,.xlsx,.xls,.csv,.pptx,.txt,image/*"
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Tên học liệu</label>
                <input
                  name="title"
                  type="text"
                  required
                  defaultValue={editingMaterial?.title || ''}
                  placeholder="Vd: Tài liệu chuẩn Cân bằng hóa học & Le Chatelier"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Môn học</label>
                  <input
                    name="subject"
                    type="text"
                    defaultValue={editingMaterial?.subject || 'Hóa học'}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Khối lớp</label>
                  <input
                    name="grade"
                    type="number"
                    defaultValue={editingMaterial?.grade || 11}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Chủ đề & Bài</label>
                <input
                  name="topic"
                  type="text"
                  required
                  defaultValue={editingMaterial?.topic || 'Cân bằng hóa học'}
                  placeholder="Vd: Cân bằng hóa học"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Mô tả tóm tắt nội dung</label>
                <textarea
                  name="description"
                  rows={3}
                  required
                  defaultValue={editingMaterial?.description || ''}
                  placeholder="Trích dẫn nội dung chính, định lý hoặc bảng dữ liệu chuẩn để đối chiếu với câu trả lời AI..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Thẻ Tags (cách nhau bằng dấu phẩy)
                </label>
                <input
                  name="tags"
                  type="text"
                  defaultValue={editingMaterial?.tags.join(', ') || '#Hóa11, #CanBangHoaHoc, #HocLieuChuan'}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Lưu học liệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xác nhận xóa học liệu"
        message={`Bạn có chắc muốn xóa học liệu "${deleteTarget?.title}"? Các câu hỏi hoặc nhiệm vụ đang liên kết tới học liệu này sẽ bị ảnh hưởng.`}
        linkedCount={deleteTarget?.linkedLessonIds.length || 0}
        linkedWarning={`Đang được liên kết trong ${deleteTarget?.linkedLessonIds.length} bài học.`}
        onConfirm={() => {
          if (deleteTarget) {
            StorageService.deleteMaterial(deleteTarget.id);
            onShowToast('info', 'Đã xóa', `Đã xóa học liệu: ${deleteTarget.title}`);
            setDeleteTarget(null);
            onRefresh();
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
