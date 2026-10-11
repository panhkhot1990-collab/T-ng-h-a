import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Sparkles,
  CheckCircle2,
  Download,
  Printer,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { TestMatrix, MatrixRow, CognitiveLevel, Role } from '../../types';
import { StorageService } from '../../services/storage';
import { AIService } from '../../services/aiService';
import { downloadFile } from '../../utils/exportImport';
import { ConfirmModal } from '../common/ConfirmModal';

interface MatrixViewProps {
  currentRole: Role;
  matrices: TestMatrix[];
  onRefresh: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  onNavigateToSpec?: () => void;
  onNavigateToTests?: () => void;
}

export const MatrixView: React.FC<MatrixViewProps> = ({
  currentRole,
  matrices,
  onRefresh,
  onShowToast,
  onNavigateToSpec,
  onNavigateToTests,
}) => {
  const [selectedMatrixId, setSelectedMatrixId] = useState<string>(matrices[0]?.id || '');
  const activeMatrix = matrices.find((m) => m.id === selectedMatrixId) || matrices[0];

  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Row being added or edited
  const [rowTopic, setRowTopic] = useState('Cân bằng hóa học');
  const [rowContent, setRowContent] = useState('');
  const [rowLevel, setRowLevel] = useState<CognitiveLevel>('Nhận biết');
  const [rowQuestionsCount, setRowQuestionsCount] = useState<number>(2);
  const [rowPoints, setRowPoints] = useState<number>(2.0);

  // Auto calculate totals
  const totalQuestions = activeMatrix?.rows.reduce((sum, r) => sum + r.questionsCount, 0) || 0;
  const totalPoints = activeMatrix?.rows.reduce((sum, r) => sum + r.points, 0) || 0;
  const totalPercentage = activeMatrix?.rows.reduce((sum, r) => sum + r.percentage, 0) || 0;

  // Add or update row
  const handleSaveRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMatrix) return;

    const percentage = totalPoints > 0 ? Number(((rowPoints / (totalPoints + rowPoints)) * 100).toFixed(0)) : 20;

    const newRow: MatrixRow = {
      id: `mr-${Date.now()}`,
      topic: rowTopic,
      content: rowContent,
      level: rowLevel,
      questionsCount: rowQuestionsCount,
      points: rowPoints,
      percentage,
    };

    const updatedRows = [...activeMatrix.rows, newRow];
    // Re-balance percentages
    const sumPts = updatedRows.reduce((acc, r) => acc + r.points, 0);
    const rebalancedRows = updatedRows.map((r) => ({
      ...r,
      percentage: sumPts > 0 ? Number(((r.points / sumPts) * 100).toFixed(1)) : 0,
    }));

    const updatedMatrix: TestMatrix = {
      ...activeMatrix,
      rows: rebalancedRows,
      totalQuestions: rebalancedRows.reduce((acc, r) => acc + r.questionsCount, 0),
      totalPoints: sumPts,
      updatedAt: new Date().toISOString(),
      version: activeMatrix.version + 1,
    };

    StorageService.saveMatrix(updatedMatrix);
    setIsAddingRow(false);
    setRowContent('');
    onShowToast('success', 'Đã thêm dòng', 'Đã cập nhật bảng ma trận đề kiểm tra.');
    onRefresh();
  };

  // Delete row
  const handleDeleteRow = (rowId: string) => {
    if (!activeMatrix) return;
    const filteredRows = activeMatrix.rows.filter((r) => r.id !== rowId);
    const sumPts = filteredRows.reduce((acc, r) => acc + r.points, 0);
    const rebalancedRows = filteredRows.map((r) => ({
      ...r,
      percentage: sumPts > 0 ? Number(((r.points / sumPts) * 100).toFixed(1)) : 0,
    }));

    const updatedMatrix: TestMatrix = {
      ...activeMatrix,
      rows: rebalancedRows,
      totalQuestions: rebalancedRows.reduce((acc, r) => acc + r.questionsCount, 0),
      totalPoints: sumPts,
      updatedAt: new Date().toISOString(),
      version: activeMatrix.version + 1,
    };

    StorageService.saveMatrix(updatedMatrix);
    setDeleteRowId(null);
    onShowToast('info', 'Đã xóa', 'Đã xóa dòng khỏi ma trận.');
    onRefresh();
  };

  // AI Suggest Matrix
  const handleAISuggest = async () => {
    if (!activeMatrix) return;
    setIsGeneratingAI(true);
    try {
      const suggestedRows = await AIService.suggestMatrix(activeMatrix.title, activeMatrix.subject, activeMatrix.grade);
      const updatedMatrix: TestMatrix = {
        ...activeMatrix,
        rows: suggestedRows,
        totalQuestions: suggestedRows.reduce((acc, r) => acc + r.questionsCount, 0),
        totalPoints: 10,
        updatedAt: new Date().toISOString(),
        version: activeMatrix.version + 1,
      };
      StorageService.saveMatrix(updatedMatrix);
      onShowToast('success', 'AI Gợi ý thành công', 'Đã áp dụng cấu trúc ma trận chuẩn 4 mức độ nhận thức GDPT 2018.');
      onRefresh();
    } catch (err: any) {
      onShowToast('error', 'Lỗi AI', err.message);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Download / Print
  const handleDownload = () => {
    if (!activeMatrix) return;
    downloadFile(`MaTranDe_${activeMatrix.id}.json`, JSON.stringify(activeMatrix, null, 2), 'application/json');
    onShowToast('success', 'Tải xuống', 'Đã xuất file cấu trúc Ma trận JSON');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Ma Trận Đề Kiểm Tra Đánh Giá
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quy hoạch 4 mức độ nhận thức (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao) và tự động tính tỷ lệ điểm %.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleAISuggest}
            disabled={isGeneratingAI}
            className="px-3.5 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 flex items-center gap-1.5 shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>{isGeneratingAI ? 'AI đang tính...' : 'AI Gợi Ý Ma Trận'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>In Ma Trận</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>Tải JSON</span>
          </button>

          <button
            onClick={() => setIsAddingRow(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Dòng Ma Trận</span>
          </button>
        </div>
      </div>

      {activeMatrix ? (
        <div className="space-y-4">
          {/* Matrix Metadata Card */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                  {activeMatrix.subject} • Lớp {activeMatrix.grade}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Phiên bản v{activeMatrix.version}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">{activeMatrix.title}</h2>
            </div>

            {/* Live Summary Chips */}
            <div className="flex items-center gap-3 text-xs">
              <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[10px] text-slate-500 block">Tổng số câu</span>
                <strong className="text-slate-900 dark:text-slate-100 font-mono text-sm">{totalQuestions} câu</strong>
              </div>
              <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[10px] text-slate-500 block">Tổng điểm</span>
                <strong className="text-indigo-600 dark:text-indigo-400 font-mono text-sm">{totalPoints.toFixed(1)}đ</strong>
              </div>
              <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[10px] text-slate-500 block">Tổng tỷ lệ</span>
                <strong className="text-emerald-600 font-mono text-sm">{totalPercentage.toFixed(0)}%</strong>
              </div>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">STT</th>
                  <th className="py-3 px-4">Chủ đề</th>
                  <th className="py-3 px-4">Nội dung kiến thức</th>
                  <th className="py-3 px-4">Mức độ nhận thức</th>
                  <th className="py-3 px-4 text-center">Số câu</th>
                  <th className="py-3 px-4 text-center">Số điểm</th>
                  <th className="py-3 px-4 text-center">Tỷ lệ %</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeMatrix.rows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{row.topic}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{row.content}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.level === 'Nhận biết'
                            ? 'bg-blue-100 text-blue-800'
                            : row.level === 'Thông hiểu'
                            ? 'bg-emerald-100 text-emerald-800'
                            : row.level === 'Vận dụng'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {row.level}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold">{row.questionsCount}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {row.points.toFixed(1)}đ
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-medium">{row.percentage.toFixed(1)}%</td>
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

          {/* Validation Notice */}
          <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-indigo-950 dark:text-indigo-200">
                  Ma trận hợp lệ theo quy định khảo thí (Tổng 10 điểm, 4 mức độ cân bằng).
                </p>
                <p className="text-indigo-700 dark:text-indigo-400">
                  Bạn có thể tạo Bản đặc tả chi tiết từ ma trận này để kiểm tra độ khớp câu hỏi.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {onNavigateToSpec && (
                <button
                  onClick={onNavigateToSpec}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <span>Tạo Bản Đặc Tả</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              {onNavigateToTests && (
                <button
                  onClick={onNavigateToTests}
                  className="px-3.5 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100/80 dark:bg-indigo-900/40 hover:bg-indigo-200 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <span>Xem Đề Kiểm Tra</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500">Chưa có ma trận nào.</div>
      )}

      {/* ADD ROW MODAL */}
      {isAddingRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Thêm dòng mới vào Ma trận đề
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
                  placeholder="Vd: Nguyên lý Le Chatelier khi thay đổi nhiệt độ"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Mức độ</label>
                  <select
                    value={rowLevel}
                    onChange={(e) => setRowLevel(e.target.value as CognitiveLevel)}
                    className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <option value="Nhận biết">Nhận biết</option>
                    <option value="Thông hiểu">Thông hiểu</option>
                    <option value="Vận dụng">Vận dụng</option>
                    <option value="Vận dụng cao">Vận dụng cao</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Số câu</label>
                  <input
                    type="number"
                    min="1"
                    value={rowQuestionsCount}
                    onChange={(e) => setRowQuestionsCount(Number(e.target.value))}
                    className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
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
                    className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-indigo-600"
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
                  Thêm dòng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
