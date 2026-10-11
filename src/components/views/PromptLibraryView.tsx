import React, { useState } from 'react';
import {
  Terminal,
  Plus,
  Copy,
  Trash2,
  Edit2,
  Download,
  Sparkles,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { PromptTemplate, Role } from '../../types';
import { StorageService } from '../../services/storage';
import { downloadFile } from '../../utils/exportImport';
import { ConfirmModal } from '../common/ConfirmModal';

interface PromptLibraryViewProps {
  currentRole: Role;
  prompts: PromptTemplate[];
  onRefresh: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const PromptLibraryView: React.FC<PromptLibraryViewProps> = ({
  currentRole,
  prompts,
  onRefresh,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPrompt, setEditingPrompt] = useState<PromptTemplate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PromptTemplate | null>(null);

  const filteredPrompts = prompts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.purpose.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    onShowToast('success', 'Đã sao chép', 'Đã sao chép Prompt vào bộ nhớ đệm clipboard.');
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = fd.get('title') as string;
    const purpose = fd.get('purpose') as string;
    const model = (fd.get('model') as string) || 'gemini-3.8-flash';
    const promptText = fd.get('promptText') as string;
    const sampleInput = fd.get('sampleInput') as string;
    const sampleOutput = fd.get('sampleOutput') as string;

    const promptToSave: PromptTemplate = {
      id: editingPrompt ? editingPrompt.id : `pmt-${Date.now()}`,
      title,
      purpose,
      model,
      promptText,
      sampleInput,
      sampleOutput,
      tags: ['#PromptAI', '#KiemChung'],
      version: editingPrompt ? editingPrompt.version + 1 : 1,
      createdAt: editingPrompt?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageService.savePrompt(promptToSave);
    setIsModalOpen(false);
    setEditingPrompt(null);
    onShowToast('success', 'Thành công', `Đã lưu prompt: ${title}`);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Terminal className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Thư Viện Prompt AI (AI Prompt Engineering Library)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quản lý các mẫu prompt tạo câu hỏi thi, tạo bẫy lỗi nhận thức (Error Injector) và hướng dẫn phản biện.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingPrompt(null);
            setIsModalOpen(true);
          }}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Prompt Mới</span>
        </button>
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPrompts.map((p) => (
          <div
            key={p.id}
            className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded">
                    Mô hình: {p.model}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono ml-2">v{p.version}</span>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-1">{p.title}</h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopy(p.promptText)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded"
                    title="Sao chép prompt"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingPrompt(p);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded"
                    title="Sửa prompt"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(p)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                    title="Xóa prompt"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-1">{p.purpose}</p>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-line mt-3 leading-relaxed">
                {p.promptText}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Đầu vào mẫu: {p.sampleInput}</span>
              <button
                onClick={() => handleCopy(p.promptText)}
                className="text-indigo-600 font-semibold hover:underline"
              >
                Sao chép
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {editingPrompt ? 'Sửa Prompt Template' : 'Thêm Prompt Template Mới'}
            </h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="font-semibold block mb-1">Tên Prompt</label>
                <input
                  name="title"
                  type="text"
                  required
                  defaultValue={editingPrompt?.title || ''}
                  placeholder="Vd: Sinh câu hỏi bẫy ảo giác Le Chatelier"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Mục đích sử dụng</label>
                <input
                  name="purpose"
                  type="text"
                  required
                  defaultValue={editingPrompt?.purpose || ''}
                  placeholder="Vd: Dùng để cài cắm lỗi tinh vi trong giải thích hóa học"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Nội dung câu lệnh Prompt</label>
                <textarea
                  name="promptText"
                  rows={4}
                  required
                  defaultValue={editingPrompt?.promptText || ''}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Đầu vào mẫu (Sample Input)</label>
                  <input
                    name="sampleInput"
                    type="text"
                    defaultValue={editingPrompt?.sampleInput || ''}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">AI Model chỉ định</label>
                  <input
                    name="model"
                    type="text"
                    defaultValue={editingPrompt?.model || 'gemini-3.8-flash'}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold"
                >
                  Lưu Prompt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xác nhận xóa prompt"
        message={`Bạn có chắc muốn xóa prompt template "${deleteTarget?.title}"?`}
        onConfirm={() => {
          if (deleteTarget) {
            StorageService.deletePrompt(deleteTarget.id);
            onShowToast('info', 'Đã xóa', 'Đã xóa prompt khỏi thư viện');
            setDeleteTarget(null);
            onRefresh();
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
