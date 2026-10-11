import React, { useState } from 'react';
import {
  BookMarked,
  Plus,
  Trash2,
  Edit2,
  Download,
  Upload,
  BookOpen,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { ResearchNotebookEntry, Role } from '../../types';
import { StorageService } from '../../services/storage';
import { downloadFile } from '../../utils/exportImport';
import { ConfirmModal } from '../common/ConfirmModal';

interface ResearchNotebookViewProps {
  currentRole: Role;
  notebook: ResearchNotebookEntry[];
  onRefresh: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const ResearchNotebookView: React.FC<ResearchNotebookViewProps> = ({
  currentRole,
  notebook,
  onRefresh,
  onShowToast,
}) => {
  const [editingEntry, setEditingEntry] = useState<ResearchNotebookEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ResearchNotebookEntry | null>(null);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = fd.get('title') as string;
    const researchQuestion = fd.get('researchQuestion') as string;
    const hypothesis = fd.get('hypothesis') as string;
    const independentVariable = fd.get('independentVariable') as string;
    const dependentVariable = fd.get('dependentVariable') as string;
    const methodology = fd.get('methodology') as string;
    const notes = fd.get('notes') as string;

    const entryToSave: ResearchNotebookEntry = {
      id: editingEntry ? editingEntry.id : `nb-${Date.now()}`,
      title,
      researchQuestion,
      hypothesis,
      independentVariable,
      dependentVariable,
      methodology,
      notes,
      tags: ['#AutomationBias', '#NghienCuuEdTech'],
      version: editingEntry ? editingEntry.version + 1 : 1,
      createdAt: editingEntry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveNotebookEntry(entryToSave);
    setIsModalOpen(false);
    setEditingEntry(null);
    onShowToast('success', 'Thành công', `Đã lưu mục sổ tay nghiên cứu: ${title}`);
    onRefresh();
  };

  const handleDownloadEntry = (entry: ResearchNotebookEntry) => {
    const text = `SỔ TAY NGHIÊN CỨU KHOA HỌC: ${entry.title}\nPhiên bản: v${entry.version} • Cập nhật: ${entry.updatedAt}\n\n1. CÂU HỎI NGHIÊN CỨU:\n${entry.researchQuestion}\n\n2. GIẢ THUYẾT NGHIÊN CỨU:\n${entry.hypothesis}\n\n3. BIẾN ĐỘC LẬP:\n${entry.independentVariable}\n\n4. BIẾN PHỤ THUỘC:\n${entry.dependentVariable}\n\n5. THIẾT KẾ & PHƯƠNG PHÁP:\n${entry.methodology}\n\n6. NHẬT KÝ & GHI CHÚ:\n${entry.notes}`;
    downloadFile(`SoTay_NghienCuu_${entry.id}.txt`, text);
    onShowToast('info', 'Tải xuống', 'Đã tải tệp ghi chú nghiên cứu.');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <BookMarked className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Sổ Tay Nghiên Cứu Khoa Học Giáo Dục (Research Notebook)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quản lý câu hỏi nghiên cứu, giả thuyết H1, biến số độc lập/phụ thuộc, thiết kế thực nghiệm và nhật ký theo phiên bản.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingEntry(null);
            setIsModalOpen(true);
          }}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Mục Nghiên Cứu Mới</span>
        </button>
      </div>

      {/* Notebook Entries List */}
      <div className="space-y-4">
        {notebook.map((entry) => (
          <div
            key={entry.id}
            className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded font-mono">
                  v{entry.version} • {new Date(entry.updatedAt).toLocaleDateString('vi-VN')}
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-2">{entry.title}</h2>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDownloadEntry(entry)}
                  className="p-1.5 text-slate-400 hover:text-emerald-600 rounded"
                  title="Tải tệp ghi chép"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setEditingEntry(entry);
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded"
                  title="Sửa ghi chép"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(entry)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                  title="Xóa mục"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-500 uppercase text-[10px] block">Câu hỏi nghiên cứu:</span>
                <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  {entry.researchQuestion}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-500 uppercase text-[10px] block">Giả thuyết khoa học (H1):</span>
                <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  {entry.hypothesis}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-bold text-slate-500 block mb-1">Biến độc lập (Independent Var):</span>
                <p className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800">
                  {entry.independentVariable}
                </p>
              </div>
              <div>
                <span className="font-bold text-slate-500 block mb-1">Biến phụ thuộc (Dependent Var):</span>
                <p className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800">
                  {entry.dependentVariable}
                </p>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-500 block mb-1 text-xs">Phương pháp & Thiết kế thực nghiệm:</span>
              <p className="text-slate-700 dark:text-slate-300 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg leading-relaxed whitespace-pre-line border">
                {entry.methodology}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-3 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {editingEntry ? 'Sửa mục nghiên cứu' : 'Thêm đề mục nghiên cứu khoa học mới'}
            </h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="font-semibold block mb-1">Tên đề mục nghiên cứu</label>
                <input
                  name="title"
                  type="text"
                  required
                  defaultValue={editingEntry?.title || ''}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Câu hỏi nghiên cứu (Research Question)</label>
                <textarea
                  name="researchQuestion"
                  rows={2}
                  required
                  defaultValue={editingEntry?.researchQuestion || ''}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Giả thuyết nghiên cứu (Hypothesis)</label>
                <textarea
                  name="hypothesis"
                  rows={2}
                  required
                  defaultValue={editingEntry?.hypothesis || ''}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Biến độc lập</label>
                  <input
                    name="independentVariable"
                    type="text"
                    defaultValue={editingEntry?.independentVariable || ''}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Biến phụ thuộc</label>
                  <input
                    name="dependentVariable"
                    type="text"
                    defaultValue={editingEntry?.dependentVariable || ''}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Phương pháp & Thiết kế nghiên cứu</label>
                <textarea
                  name="methodology"
                  rows={3}
                  defaultValue={editingEntry?.methodology || ''}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Ghi chú & Đạo đức nghiên cứu</label>
                <textarea
                  name="notes"
                  rows={2}
                  defaultValue={editingEntry?.notes || ''}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded font-semibold"
                >
                  Lưu sổ tay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xác nhận xóa mục nghiên cứu"
        message={`Bạn có chắc muốn xóa đề mục "${deleteTarget?.title}"?`}
        onConfirm={() => {
          if (deleteTarget) {
            StorageService.deleteNotebookEntry(deleteTarget.id);
            onShowToast('info', 'Đã xóa', 'Đã xóa mục nghiên cứu khỏi sổ tay');
            setDeleteTarget(null);
            onRefresh();
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
