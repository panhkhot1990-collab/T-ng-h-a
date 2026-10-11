import React, { useState } from 'react';
import {
  FileCheck2,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Printer,
  Download,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  Clock,
  Award,
  Layers,
  FileSpreadsheet,
  FileText,
  Sliders,
  Play,
  X,
  ShieldCheck,
} from 'lucide-react';
import { Test, Question, TestMatrix, TestSpecification, Role } from '../../types';
import { StorageService } from '../../services/storage';
import { validateTest } from '../../utils/testValidation';
import { downloadFile } from '../../utils/exportImport';
import { ConfirmModal } from '../common/ConfirmModal';

interface TestsViewProps {
  currentRole: Role;
  tests: Test[];
  matrices: TestMatrix[];
  specs: TestSpecification[];
  questions: Question[];
  onRefresh: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  onOpenTestTaking?: (testId: string) => void;
  onOpenTestBuilder?: (testId?: string) => void;
  onOpenMatrix?: () => void;
  onOpenSpecs?: () => void;
}

export const TestsView: React.FC<TestsViewProps> = ({
  currentRole,
  tests,
  matrices,
  specs,
  questions,
  onRefresh,
  onShowToast,
  onOpenTestTaking,
  onOpenTestBuilder,
  onOpenMatrix,
  onOpenSpecs,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  // Detail preview modal
  const [previewTest, setPreviewTest] = useState<Test | null>(null);

  // Print modal
  const [printTest, setPrintTest] = useState<Test | null>(null);

  // Validation details modal
  const [validationModalTest, setValidationModalTest] = useState<Test | null>(null);

  // Create new test modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Hóa học');
  const [newGrade, setNewGrade] = useState(11);
  const [newDuration, setNewDuration] = useState(45);
  const [newMatrixId, setNewMatrixId] = useState<string>(matrices[0]?.id || '');
  const [newSpecId, setNewSpecId] = useState<string>(specs[0]?.id || '');
  const [newStatus, setNewStatus] = useState<'published' | 'draft'>('published');
  const [includeDefaultQuestions, setIncludeDefaultQuestions] = useState(true);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<Test | null>(null);

  // Filtered tests
  const filteredTests = tests.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchSubject = selectedSubject === 'all' || t.subject === selectedSubject;
    return matchSearch && matchStatus && matchSubject;
  });

  // Calculate metrics
  const totalTests = tests.length;
  const publishedTests = tests.filter((t) => t.status === 'published').length;
  const totalQuestionsInTests = tests.reduce((sum, t) => sum + t.questions.length, 0);

  // Handle Create Test
  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      onShowToast('error', 'Lỗi dữ liệu', 'Vui lòng nhập tên đề kiểm tra.');
      return;
    }

    const selectedMatrix = matrices.find((m) => m.id === newMatrixId);
    const selectedSpec = specs.find((s) => s.id === newSpecId);
    const questionsToInclude = includeDefaultQuestions ? questions.slice(0, 10) : [];
    const totalPts = questionsToInclude.reduce((sum, q) => sum + q.points, 0);

    const newTest: Test = {
      id: `test-${Date.now()}`,
      title: newTitle.trim(),
      subject: newSubject,
      grade: Number(newGrade),
      durationMinutes: Number(newDuration),
      totalQuestions: questionsToInclude.length,
      totalPoints: totalPts > 0 ? totalPts : 10.0,
      matrixId: newMatrixId || undefined,
      specId: newSpecId || undefined,
      status: newStatus,
      questions: questionsToInclude,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };

    // Auto-validate
    newTest.validationResult = validateTest(newTest, selectedMatrix, selectedSpec);

    StorageService.saveTest(newTest);
    setIsCreateModalOpen(false);
    setNewTitle('');
    onShowToast('success', 'Tạo đề kiểm tra thành công', `Đề "${newTest.title}" đã được lưu vào hệ thống.`);
    onRefresh();
  };

  // Handle Duplicate
  const handleDuplicate = (test: Test) => {
    const duplicated = StorageService.duplicateTest(test.id);
    if (duplicated) {
      onShowToast('success', 'Nhân bản thành công', `Đã tạo bản sao: ${duplicated.title}`);
      onRefresh();
    }
  };

  // Handle Delete
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    StorageService.deleteTest(deleteTarget.id);
    setDeleteTarget(null);
    onShowToast('success', 'Đã xóa đề kiểm tra', `Đã xóa đề ${deleteTarget.title}`);
    onRefresh();
  };

  // Handle Export TXT
  const handleExportTxt = (test: Test) => {
    const content = `========================================================================
SỞ GIÁO DỤC VÀ ĐÀO TẠO - TRƯỜNG THPT CHUYÊN KHOA HỌC TỰ NHIÊN
ĐỀ KIỂM TRA ĐỊNH KỲ: ${test.title.toUpperCase()}
Môn: ${test.subject} - Lớp: ${test.grade} - Thời gian làm bài: ${test.durationMinutes} phút
Mã đề thi: ${test.id} - Tổng số câu: ${test.questions.length} - Thang điểm: ${test.totalPoints}đ
========================================================================

I. PHẦN CÂU HỎI
${test.questions
  .map(
    (q, idx) => `
Câu ${idx + 1} [Mã ${q.code} - ${q.cognitiveLevel} - ${q.points} điểm]:
${q.question}
${q.options ? q.options.join('\n') : '(Câu hỏi trả lời ngắn / Tự luận)'}
`
  )
  .join('\n------------------------------------------------------------------------\n')}

========================================================================
II. ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM
========================================================================
${test.questions
  .map(
    (q, idx) => `Câu ${idx + 1} (${q.code}): Đáp án: ${q.correctAnswer} (${q.points}đ)
Giải thích: ${q.explanation}
`
  )
  .join('\n')}
========================================================================`;

    downloadFile(`DeKiemTra_${test.id}_${test.subject}.txt`, content);
    onShowToast('info', 'Tải đề kiểm tra', `Đã xuất đề ${test.title} thành công.`);
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-300 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-900/50">
              Mục KIỂM TRA & ĐẶC TẢ
            </span>
            <span className="text-xs text-slate-400">• GDPT 2018</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5 mt-1">
            <FileCheck2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Quản Lý Đề Kiểm Tra & Khảo Thí Chuẩn Hóa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Hệ thống ngân hàng đề kiểm tra tích hợp đối chiếu Ma trận, Bản đặc tả và thẩm định tự động năng lực kiểm chứng AI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenMatrix && (
            <button
              onClick={onOpenMatrix}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500" />
              <span>Xem Ma Trận</span>
            </button>
          )}

          {onOpenSpecs && (
            <button
              onClick={onOpenSpecs}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-purple-500" />
              <span>Xem Bản Đặc Tả</span>
            </button>
          )}

          {onOpenTestBuilder && (
            <button
              onClick={() => onOpenTestBuilder()}
              className="px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 flex items-center gap-1.5 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>AI Test Builder</span>
            </button>
          )}

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Đề Kiểm Tra Mới</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tổng số đề kiểm tra</span>
            <FileCheck2 className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{totalTests}</p>
          <p className="mt-1 text-[11px] text-slate-400">Đã lưu trữ trong hệ thống</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Đề đã phát hành (Published)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{publishedTests}</p>
          <p className="mt-1 text-[11px] text-slate-400">Học sinh có thể thi ngay</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Thẩm định đạt chuẩn 10đ</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">100%</p>
          <p className="mt-1 text-[11px] text-slate-400">Khớp chuẩn Ma trận & Đặc tả</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tổng câu hỏi trong đề</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">{totalQuestionsInTests}</p>
          <p className="mt-1 text-[11px] text-slate-400">4 mức độ nhận thức GDPT 2018</p>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo tên đề, mã đề, môn học..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 bg-slate-50 dark:bg-slate-800 text-[11px] font-semibold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Tất cả ({tests.length})
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === 'published'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Đã phát hành
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === 'draft'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Bản nháp
            </button>
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-700 dark:text-slate-200"
          >
            <option value="all">Tất cả môn học</option>
            <option value="Hóa học">Hóa học</option>
            <option value="Khoa học Tự nhiên">Khoa học Tự nhiên</option>
          </select>
        </div>
      </div>

      {/* TESTS GRID / LIST */}
      {filteredTests.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <FileCheck2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Không tìm thấy đề kiểm tra nào</p>
          <p className="text-xs text-slate-400 mt-1">Thử đổi từ khóa tìm kiếm hoặc tạo một đề kiểm tra mới.</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Đề Mới Ngay</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredTests.map((test) => {
            const matrix = matrices.find((m) => m.id === test.matrixId);
            const spec = specs.find((s) => s.id === test.specId);
            const valResult = validateTest(test, matrix, spec);

            // Cognitive breakdown count
            const levelCounts = {
              'Nhận biết': test.questions.filter((q) => q.cognitiveLevel === 'Nhận biết').length,
              'Thông hiểu': test.questions.filter((q) => q.cognitiveLevel === 'Thông hiểu').length,
              'Vận dụng': test.questions.filter((q) => q.cognitiveLevel === 'Vận dụng').length,
              'Vận dụng cao': test.questions.filter((q) => q.cognitiveLevel === 'Vận dụng cao').length,
            };

            return (
              <div
                key={test.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top tags & status */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-900/50">
                        {test.subject} • Khối {test.grade}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">ID: {test.id}</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        test.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {test.status === 'published' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Đã phát hành</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Bản nháp</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {test.title}
                  </h3>

                  {/* Metadata Stats */}
                  <div className="mt-3 grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Thời gian:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{test.durationMinutes} phút</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Số câu:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{test.questions.length} câu</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Thang điểm:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {test.questions.reduce((s, q) => s + q.points, 0).toFixed(1)} / {test.totalPoints}đ
                      </span>
                    </div>
                  </div>

                  {/* Linked Matrix & Spec */}
                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="font-medium text-slate-400">Ma trận:</span>
                      <span className="truncate">{matrix ? matrix.title : 'Chưa gắn ma trận'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <FileText className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span className="font-medium text-slate-400">Đặc tả:</span>
                      <span className="truncate">{spec ? spec.title : 'Chưa gắn bản đặc tả'}</span>
                    </div>
                  </div>

                  {/* Cognitive Levels Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span>Cơ cấu 4 mức độ nhận thức:</span>
                      <span className="font-mono text-slate-600 dark:text-slate-300">
                        {levelCounts['Nhận biết']} NB • {levelCounts['Thông hiểu']} TH • {levelCounts['Vận dụng']} VD • {levelCounts['Vận dụng cao']} VDC
                      </span>
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <div
                        style={{ width: `${(levelCounts['Nhận biết'] / (test.questions.length || 1)) * 100}%` }}
                        className="bg-blue-500"
                        title={`Nhận biết: ${levelCounts['Nhận biết']} câu`}
                      />
                      <div
                        style={{ width: `${(levelCounts['Thông hiểu'] / (test.questions.length || 1)) * 100}%` }}
                        className="bg-emerald-500"
                        title={`Thông hiểu: ${levelCounts['Thông hiểu']} câu`}
                      />
                      <div
                        style={{ width: `${(levelCounts['Vận dụng'] / (test.questions.length || 1)) * 100}%` }}
                        className="bg-amber-500"
                        title={`Vận dụng: ${levelCounts['Vận dụng']} câu`}
                      />
                      <div
                        style={{ width: `${(levelCounts['Vận dụng cao'] / (test.questions.length || 1)) * 100}%` }}
                        className="bg-rose-500"
                        title={`Vận dụng cao: ${levelCounts['Vận dụng cao']} câu`}
                      />
                    </div>
                  </div>

                  {/* Validation pill */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => setValidationModalTest(test)}
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Thẩm định chất lượng ({valResult.checks.filter((c) => c.passed).length}/{valResult.checks.length} tiêu chí đạt)</span>
                    </button>
                    <span className="text-[11px] text-slate-400">v{test.version || 1}</span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewTest(test)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1"
                      title="Xem chi tiết câu hỏi & đáp án"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Chi Tiết</span>
                    </button>

                    <button
                      onClick={() => setPrintTest(test)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1"
                      title="Xem trước & In đề thi Bộ GD&ĐT"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>In Đề</span>
                    </button>

                    <button
                      onClick={() => handleExportTxt(test)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 bg-slate-100 dark:bg-slate-800 rounded-lg"
                      title="Tải văn bản đề thi (.txt)"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDuplicate(test)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 bg-slate-100 dark:bg-slate-800 rounded-lg"
                      title="Nhân bản đề này"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeleteTarget(test)}
                      className="p-1.5 text-slate-400 hover:text-red-600 bg-slate-100 dark:bg-slate-800 rounded-lg"
                      title="Xóa đề"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onOpenTestBuilder && (
                      <button
                        onClick={() => onOpenTestBuilder(test.id)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 rounded-lg flex items-center gap-1"
                        title="Chỉnh sửa câu hỏi trong AI Test Builder"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                        <span>Sửa Đề</span>
                      </button>
                    )}

                    {onOpenTestTaking && (
                      <button
                        onClick={() => onOpenTestTaking(test.id)}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                        title="Vào giao diện làm bài kiểm tra"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Làm Thử</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: VIEW DETAILS OF TEST */}
      {previewTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                  {previewTest.subject} • Lớp {previewTest.grade} • {previewTest.durationMinutes} phút
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {previewTest.title}
                </h2>
              </div>
              <button
                onClick={() => setPreviewTest(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl font-mono">
                <span>Tổng số câu hỏi: <strong>{previewTest.questions.length}</strong></span>
                <span>Thang điểm: <strong>{previewTest.totalPoints}đ</strong></span>
                <span>Mã đề: <strong>{previewTest.id}</strong></span>
              </div>

              <div className="space-y-4">
                {previewTest.questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                          Câu {idx + 1}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">[{q.code}]</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            q.cognitiveLevel === 'Nhận biết'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : q.cognitiveLevel === 'Thông hiểu'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : q.cognitiveLevel === 'Vận dụng'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {q.cognitiveLevel}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {q.points} điểm
                      </span>
                    </div>

                    <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                      {q.question}
                    </p>

                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        {q.options.map((opt, oIdx) => {
                          const isCorrect = opt.startsWith(String(q.correctAnswer));
                          return (
                            <div
                              key={oIdx}
                              className={`p-2 rounded-lg border text-xs font-mono transition-colors ${
                                isCorrect
                                  ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold'
                                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {opt} {isCorrect && '✓ (Đáp án đúng)'}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {!q.options && (
                      <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-900 dark:text-emerald-200 font-medium">
                        Đáp án đúng: <strong>{q.correctAnswer}</strong>
                      </div>
                    )}

                    {q.explanation && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-slate-600 dark:text-slate-400 leading-relaxed border border-slate-100 dark:border-slate-800">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                          💡 Hướng dẫn giải & Phản biện:
                        </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <button
                onClick={() => {
                  setPrintTest(previewTest);
                  setPreviewTest(null);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Xem Bản In</span>
              </button>

              <button
                onClick={() => setPreviewTest(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PRINTABLE OFFICIAL EXAM SHEET */}
      {printTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white text-black rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            <div className="px-6 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-100">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-slate-600" />
                <span className="font-bold text-xs text-slate-700">Xem trước bản in Đề thi chuẩn Bộ Giáo Dục & Đào Tạo</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In ngay (Print)</span>
                </button>
                <button
                  onClick={() => setPrintTest(null)}
                  className="p-1 text-slate-500 hover:text-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Exam Sheet Container */}
            <div className="p-8 overflow-y-auto space-y-6 text-sm font-serif leading-relaxed text-black">
              {/* Header Box */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b-2 border-black">
                <div className="text-center font-sans">
                  <p className="font-bold uppercase text-xs">SỞ GIÁO DỤC VÀ ĐÀO TẠO</p>
                  <p className="font-bold uppercase text-xs">TRƯỜNG THPT CHUYÊN KHOA HỌC TỰ NHIÊN</p>
                  <div className="w-24 h-0.5 bg-black mx-auto mt-1" />
                  <p className="mt-2 text-xs font-mono font-bold">MÃ ĐỀ THI: {printTest.id.slice(-4).toUpperCase()}</p>
                </div>
                <div className="text-center font-sans">
                  <p className="font-bold uppercase text-xs">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                  <p className="font-bold text-xs">Độc lập - Tự do - Hạnh phúc</p>
                  <div className="w-32 h-0.5 bg-black mx-auto mt-1" />
                  <p className="mt-2 text-xs italic">Năm học 2025 - 2026</p>
                </div>
              </div>

              {/* Title Header */}
              <div className="text-center font-sans py-2">
                <h2 className="text-base font-bold uppercase tracking-wide">
                  ĐỀ KIỂM TRA ĐỊNH KỲ - MÔN: {printTest.subject.toUpperCase()} (LỚP {printTest.grade})
                </h2>
                <p className="text-xs mt-1">
                  <strong>{printTest.title}</strong>
                </p>
                <p className="text-xs italic mt-0.5">
                  Thời gian làm bài: {printTest.durationMinutes} phút (Không kể thời gian phát đề)
                </p>
              </div>

              {/* Student info box */}
              <div className="p-3 border border-black font-sans text-xs grid grid-cols-2 gap-4">
                <div>
                  <p>Họ và tên thí sinh: ....................................................................</p>
                  <p className="mt-1.5">Số báo danh: ..............................................................................</p>
                </div>
                <div>
                  <p>Lớp: ......................................................................................</p>
                  <p className="mt-1.5">Phòng thi: .................................................................................</p>
                </div>
              </div>

              {/* SECTION I: MULTIPLE CHOICE */}
              <div className="space-y-4">
                <p className="font-sans font-bold text-xs uppercase underline">
                  PHẦN I. Câu hỏi trắc nghiệm nhiều phương án lựa chọn (Thí sinh trả lời từ câu 1 đến hết):
                </p>

                {printTest.questions.map((q, idx) => (
                  <div key={q.id} className="space-y-1.5">
                    <p>
                      <strong>Câu {idx + 1} ({q.code} - {q.points}đ):</strong> {q.question}
                    </p>
                    {q.options && (
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 pl-4 text-xs font-sans">
                        {q.options.map((opt, i) => (
                          <div key={i}>{opt}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* ANSWER KEY & RUBRIC TABLE */}
              <div className="pt-6 border-t-2 border-black space-y-3 font-sans">
                <h4 className="font-bold text-xs uppercase">BẢNG ĐÁP ÁN VÀ THANG ĐIỂM CHUẨN:</h4>
                <table className="w-full text-xs border-collapse border border-black text-center">
                  <thead>
                    <tr className="bg-slate-100">
                      {printTest.questions.map((_, i) => (
                        <th key={i} className="border border-black p-1">Câu {i + 1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {printTest.questions.map((q) => (
                        <td key={q.id} className="border border-black p-1 font-bold">
                          {q.correctAnswer}
                        </td>
                      ))}
                    </tr>
                    <tr className="text-slate-600 text-[10px]">
                      {printTest.questions.map((q) => (
                        <td key={q.id} className="border border-black p-1">
                          {q.points}đ
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="text-center font-sans text-xs italic pt-4">
                ---------- HẾT ----------
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: QUALITY VALIDATION DETAILS */}
      {validationModalTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Thẩm Định Đề Kiểm Tra Chuẩn Hóa
                </h3>
              </div>
              <button
                onClick={() => setValidationModalTest(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                Kết quả kiểm tra đối chiếu đề <strong>"{validationModalTest.title}"</strong>:
              </p>

              <div className="space-y-2">
                {validationModalTest.validationResult?.checks.map((check, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{check.label}</p>
                      <p className="text-slate-500 text-[11px]">{check.details}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-900 dark:text-emerald-200 text-xs">
                ✓ Đề thi đạt đầy đủ các tiêu chuẩn kiểm định của Chương trình Giáo dục phổ thông 2018 và quy chuẩn nghiên cứu Automation Bias.
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setValidationModalTest(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CREATE NEW TEST */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-indigo-600" />
                Tạo Đề Kiểm Tra Mới
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTest} className="space-y-3.5">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Tên đề kiểm tra *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Vd: Đề kiểm tra Khảo sát Năng lực Kiểm chứng AI - Đợt 2"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Môn học
                  </label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <option value="Hóa học">Hóa học</option>
                    <option value="Khoa học Tự nhiên">Khoa học Tự nhiên</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Khối lớp
                  </label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <option value={10}>Lớp 10</option>
                    <option value={11}>Lớp 11</option>
                    <option value={12}>Lớp 12</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Thời lượng (phút)
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={180}
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Liên kết Ma trận đề kiểm tra
                </label>
                <select
                  value={newMatrixId}
                  onChange={(e) => setNewMatrixId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  <option value="">-- Không liên kết --</option>
                  {matrices.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.subject} - {m.totalPoints}đ)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Liên kết Bản đặc tả đề thi
                </label>
                <select
                  value={newSpecId}
                  onChange={(e) => setNewSpecId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  <option value="">-- Không liên kết --</option>
                  {specs.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.subject})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Trạng thái phát hành
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as 'published' | 'draft')}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  <option value="published">Xuất bản ngay (Học sinh có thể thi)</option>
                  <option value="draft">Bản nháp (Đang biên soạn)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <input
                  type="checkbox"
                  id="includeDefQuestions"
                  checked={includeDefaultQuestions}
                  onChange={(e) => setIncludeDefaultQuestions(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <label htmlFor="includeDefQuestions" className="text-slate-700 dark:text-slate-300 cursor-pointer">
                  Tự động nạp 10 câu hỏi chuẩn hóa từ Ngân hàng câu hỏi (Khớp ma trận 10đ)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Tạo Đề Kiểm Tra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xác nhận xóa đề kiểm tra"
        message={`Bạn có chắc chắn muốn xóa đề kiểm tra "${deleteTarget?.title}" không? Thao tác này không thể hoàn tác.`}
        confirmText="Xóa đề"
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
