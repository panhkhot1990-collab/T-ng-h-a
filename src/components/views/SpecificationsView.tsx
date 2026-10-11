import React, { useState } from 'react';
import {
  FileText,
  FileCheck2,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Download,
  Link2,
} from 'lucide-react';
import { TestSpecification, SpecRow, TestMatrix, CognitiveLevel, QuestionType, Role } from '../../types';
import { StorageService } from '../../services/storage';
import { AIService } from '../../services/aiService';
import { downloadFile } from '../../utils/exportImport';

interface SpecificationsViewProps {
  currentRole: Role;
  specs: TestSpecification[];
  matrices: TestMatrix[];
  onRefresh: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  onNavigateToTests?: () => void;
}

export const SpecificationsView: React.FC<SpecificationsViewProps> = ({
  currentRole,
  specs,
  matrices,
  onRefresh,
  onShowToast,
  onNavigateToTests,
}) => {
  const [selectedSpecId, setSelectedSpecId] = useState<string>(specs[0]?.id || '');
  const activeSpec = specs.find((s) => s.id === selectedSpecId) || specs[0];
  const linkedMatrix = matrices.find((m) => m.id === activeSpec?.matrixId);

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isAddingRow, setIsAddingRow] = useState(false);

  // New row form state
  const [rowTopic, setRowTopic] = useState('Cân bằng hóa học');
  const [rowContent, setRowContent] = useState('');
  const [rowRequirement, setRowRequirement] = useState('');
  const [rowLevel, setRowLevel] = useState<CognitiveLevel>('Nhận biết');
  const [rowQuestionsCount, setRowQuestionsCount] = useState<number>(2);
  const [rowFormat, setRowFormat] = useState<QuestionType>('multiple_choice');
  const [rowPoints, setRowPoints] = useState<number>(2.0);

  // Check consistency with matrix
  const matrixTotalQuestions = linkedMatrix?.rows.reduce((sum, r) => sum + r.questionsCount, 0) || 0;
  const specTotalQuestions = activeSpec?.rows.reduce((sum, r) => sum + r.questionsCount, 0) || 0;
  const isMatchQuestions = matrixTotalQuestions > 0 && matrixTotalQuestions === specTotalQuestions;

  // AI Generate Specification
  const handleAIGenerate = async () => {
    if (!linkedMatrix || !activeSpec) return;
    setIsGeneratingAI(true);
    try {
      const generatedRows = await AIService.suggestSpecification(linkedMatrix);
      const updatedSpec: TestSpecification = {
        ...activeSpec,
        rows: generatedRows,
        updatedAt: new Date().toISOString(),
        version: activeSpec.version + 1,
      };
      StorageService.saveSpec(updatedSpec);
      onShowToast('success', 'AI Tạo thành công', 'Đã sinh bản đặc tả chi tiết từ Ma trận đề!');
      onRefresh();
    } catch (err: any) {
      onShowToast('error', 'Lỗi', err.message);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Add row
  const handleSaveRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSpec) return;

    const newRow: SpecRow = {
      id: `sr-${Date.now()}`,
      topic: rowTopic,
      content: rowContent,
      requirement: rowRequirement,
      level: rowLevel,
      questionsCount: rowQuestionsCount,
      format: rowFormat,
      points: rowPoints,
      questionCodes: Array.from({ length: rowQuestionsCount }, (_, i) => `C${activeSpec.rows.length * 2 + i + 1}`),
    };

    const updatedSpec: TestSpecification = {
      ...activeSpec,
      rows: [...activeSpec.rows, newRow],
      updatedAt: new Date().toISOString(),
      version: activeSpec.version + 1,
    };

    StorageService.saveSpec(updatedSpec);
    setIsAddingRow(false);
    setRowContent('');
    setRowRequirement('');
    onShowToast('success', 'Đã thêm dòng', 'Đã cập nhật bản đặc tả.');
    onRefresh();
  };

  // Delete row
  const handleDeleteRow = (rowId: string) => {
    if (!activeSpec) return;
    const updatedSpec: TestSpecification = {
      ...activeSpec,
      rows: activeSpec.rows.filter((r) => r.id !== rowId),
      updatedAt: new Date().toISOString(),
      version: activeSpec.version + 1,
    };
    StorageService.saveSpec(updatedSpec);
    onShowToast('info', 'Đã xóa', 'Đã xóa dòng khỏi bản đặc tả.');
    onRefresh();
  };

  const handleDownload = () => {
    if (!activeSpec) return;
    downloadFile(`BanDacTa_${activeSpec.id}.json`, JSON.stringify(activeSpec, null, 2), 'application/json');
    onShowToast('success', 'Tải xuống', 'Đã xuất file bản đặc tả JSON');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Bản Đặc Tả Đề Kiểm Tra (Test Specification)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Xác định chi tiết yêu cầu cần đạt, dạng câu hỏi, thang điểm và mã câu hỏi khớp với Ma trận.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleAIGenerate}
            disabled={isGeneratingAI || !linkedMatrix}
            className="px-3.5 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>{isGeneratingAI ? 'AI đang tạo...' : 'AI Tạo Bản Đặc Tả'}</span>
          </button>

          {onNavigateToTests && (
            <button
              onClick={onNavigateToTests}
              className="px-3.5 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 flex items-center gap-1.5 shadow-2xs"
            >
              <FileCheck2 className="w-4 h-4 text-indigo-600" />
              <span>Xem Đề Kiểm Tra</span>
            </button>
          )}

          <button
            onClick={handleDownload}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>Tải JSON</span>
          </button>

          <button
            onClick={() => setIsAddingRow(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Dòng Đặc Tả</span>
          </button>
        </div>
      </div>

      {activeSpec ? (
        <div className="space-y-4">
          {/* Consistency banner with matrix */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
              isMatchQuestions
                ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                : 'border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isMatchQuestions ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              )}
              <div>
                <span className="font-bold">
                  {isMatchQuestions
                    ? 'Bản đặc tả khớp hoàn toàn với Ma trận đề kiểm tra!'
                    : `Cảnh báo lệch số lượng: Bản đặc tả có ${specTotalQuestions} câu, Ma trận quy định ${matrixTotalQuestions} câu.`}
                </span>
                <p className="opacity-80 mt-0.5">
                  Liên kết: {linkedMatrix?.title || 'Chưa liên kết ma trận'}
                </p>
              </div>
            </div>
            <span className="font-mono font-bold text-sm">{specTotalQuestions} / {matrixTotalQuestions} câu</span>
          </div>

          {/* Specification Table */}
          <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Chủ đề</th>
                  <th className="py-3 px-4">Nội dung</th>
                  <th className="py-3 px-4">Yêu cầu cần đạt (GDPT 2018)</th>
                  <th className="py-3 px-4">Mức độ</th>
                  <th className="py-3 px-4">Dạng câu</th>
                  <th className="py-3 px-4 text-center">Số câu</th>
                  <th className="py-3 px-4 text-center">Điểm</th>
                  <th className="py-3 px-4">Mã câu</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeSpec.rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{row.topic}</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{row.content}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs">{row.requirement}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800">
                        {row.level}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] text-slate-500">
                        {row.format === 'multiple_choice' ? 'Trắc nghiệm 4LC' : 'Trả lời ngắn'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold">{row.questionsCount}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {row.points.toFixed(1)}đ
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-indigo-600">
                      {row.questionCodes?.join(', ') || '--'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteRow(row.id)}
                        className="p-1 text-slate-400 hover:text-red-600"
                        title="Xóa dòng"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500">Chưa có bản đặc tả nào.</div>
      )}

      {/* ADD ROW MODAL */}
      {isAddingRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Thêm dòng mới vào Bản đặc tả
            </h3>
            <form onSubmit={handleSaveRow} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Chủ đề</label>
                <input
                  type="text"
                  required
                  value={rowTopic}
                  onChange={(e) => setRowTopic(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nội dung kiến thức</label>
                <input
                  type="text"
                  required
                  value={rowContent}
                  onChange={(e) => setRowContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Yêu cầu cần đạt</label>
                <textarea
                  rows={2}
                  required
                  value={rowRequirement}
                  onChange={(e) => setRowRequirement(e.target.value)}
                  placeholder="Vd: Vận dụng được nguyên lý Le Chatelier để dự đoán chiều phản ứng..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Mức độ nhận thức</label>
                  <select
                    value={rowLevel}
                    onChange={(e) => setRowLevel(e.target.value as CognitiveLevel)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <option value="Nhận biết">Nhận biết</option>
                    <option value="Thông hiểu">Thông hiểu</option>
                    <option value="Vận dụng">Vận dụng</option>
                    <option value="Vận dụng cao">Vận dụng cao</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Dạng câu hỏi</label>
                  <select
                    value={rowFormat}
                    onChange={(e) => setRowFormat(e.target.value as QuestionType)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <option value="multiple_choice">Trắc nghiệm 4 lựa chọn</option>
                    <option value="true_false">Đúng / Sai</option>
                    <option value="short_answer">Trả lời ngắn</option>
                    <option value="essay">Tự luận</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Số câu hỏi</label>
                  <input
                    type="number"
                    min="1"
                    value={rowQuestionsCount}
                    onChange={(e) => setRowQuestionsCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Số điểm</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={rowPoints}
                    onChange={(e) => setRowPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-indigo-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddingRow(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm font-semibold"
                >
                  Lưu dòng đặc tả
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
