import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Download,
  Printer,
  FileCheck2,
  HelpCircle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Sliders,
} from 'lucide-react';
import { Test, Question, TestMatrix, TestSpecification, CognitiveLevel, QuestionType, Role } from '../../types';
import { StorageService } from '../../services/storage';
import { AIService } from '../../services/aiService';
import { validateTest } from '../../utils/testValidation';
import { downloadFile } from '../../utils/exportImport';
import { ConfirmModal } from '../common/ConfirmModal';

interface AITestBuilderViewProps {
  currentRole: Role;
  tests: Test[];
  questions: Question[];
  matrices: TestMatrix[];
  specs: TestSpecification[];
  onRefresh: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const AITestBuilderView: React.FC<AITestBuilderViewProps> = ({
  currentRole,
  tests,
  questions,
  matrices,
  specs,
  onRefresh,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'tests' | 'bank' | 'generator' | 'validate'>('tests');
  const [selectedTestId, setSelectedTestId] = useState<string>(tests[0]?.id || '');
  const activeTest = tests.find((t) => t.id === selectedTestId) || tests[0];

  // AI generator parameters
  const [aiSubject, setAiSubject] = useState('Hóa học');
  const [aiGrade, setAiGrade] = useState(11);
  const [aiTopic, setAiTopic] = useState('Cân bằng hóa học & Le Chatelier');
  const [aiLevel, setAiLevel] = useState<CognitiveLevel>('Thông hiểu');
  const [aiType, setAiType] = useState<QuestionType>('multiple_choice');
  const [aiCount, setAiCount] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreviewQuestions, setGeneratedPreviewQuestions] = useState<Question[]>([]);

  // Manual Question modal
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // New Test modal
  const [isNewTestModalOpen, setIsNewTestModalOpen] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'test' | 'question'; id: string; name: string } | null>(null);

  // Run Test Quality Validation
  const validationResult = activeTest
    ? validateTest(
        activeTest,
        matrices.find((m) => m.id === activeTest.matrixId),
        specs.find((s) => s.id === activeTest.specId)
      )
    : null;

  // AI generate questions handler
  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    try {
      const result = await AIService.generateQuestions({
        subject: aiSubject,
        grade: aiGrade,
        topic: aiTopic,
        level: aiLevel,
        type: aiType,
        count: aiCount,
      });
      setGeneratedPreviewQuestions(result);
      onShowToast('success', 'Sinh câu hỏi thành công', `Đã tạo ${result.length} câu hỏi mới bằng AI.`);
    } catch (err: any) {
      onShowToast('error', 'Lỗi sinh AI', err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Add generated questions to Bank and current test
  const handleAcceptGenerated = () => {
    if (generatedPreviewQuestions.length === 0 || !activeTest) return;

    generatedPreviewQuestions.forEach((q) => {
      StorageService.saveQuestion(q);
    });

    const updatedTest: Test = {
      ...activeTest,
      questions: [...activeTest.questions, ...generatedPreviewQuestions],
      totalQuestions: activeTest.questions.length + generatedPreviewQuestions.length,
      totalPoints: Number(
        (activeTest.questions.reduce((sum, q) => sum + q.points, 0) +
          generatedPreviewQuestions.reduce((sum, q) => sum + q.points, 0)).toFixed(1)
      ),
      updatedAt: new Date().toISOString(),
      version: activeTest.version + 1,
    };
    StorageService.saveTest(updatedTest);

    setGeneratedPreviewQuestions([]);
    setActiveTab('tests');
    onShowToast('success', 'Đã tích hợp', 'Đã lưu các câu hỏi vào Ngân hàng và Đề kiểm tra.');
    onRefresh();
  };

  // Save single question
  const handleSaveQuestion = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const code = (fd.get('code') as string) || `C${questions.length + 1}`;
    const questionText = fd.get('question') as string;
    const type = fd.get('type') as QuestionType;
    const cognitiveLevel = fd.get('cognitiveLevel') as CognitiveLevel;
    const optA = fd.get('optA') as string;
    const optB = fd.get('optB') as string;
    const optC = fd.get('optC') as string;
    const optD = fd.get('optD') as string;
    const correctAnswer = fd.get('correctAnswer') as string;
    const explanation = fd.get('explanation') as string;
    const points = Number(fd.get('points') || 1.0);

    const questionToSave: Question = {
      id: editingQuestion ? editingQuestion.id : `q-${Date.now()}`,
      code,
      subject: 'Hóa học',
      grade: 11,
      topic: 'Cân bằng hóa học',
      type,
      cognitiveLevel,
      question: questionText,
      options: type === 'multiple_choice' ? [`A. ${optA}`, `B. ${optB}`, `C. ${optC}`, `D. ${optD}`] : undefined,
      correctAnswer,
      explanation,
      points,
      version: editingQuestion ? editingQuestion.version + 1 : 1,
    };

    StorageService.saveQuestion(questionToSave);
    setIsQuestionModalOpen(false);
    setEditingQuestion(null);
    onShowToast('success', 'Đã lưu câu hỏi', `Câu hỏi ${code} đã cập nhật.`);
    onRefresh();
  };

  // Download Test
  const handleDownloadTest = () => {
    if (!activeTest) return;
    const content = `ĐỀ KIỂM TRA: ${activeTest.title}\nMôn: ${activeTest.subject} - Lớp ${activeTest.grade}\nThời lượng: ${activeTest.durationMinutes} phút - Tổng số câu: ${activeTest.totalQuestions}\n\n` +
      activeTest.questions
        .map(
          (q, i) =>
            `Câu ${i + 1} (${q.code} - ${q.cognitiveLevel} - ${q.points}đ): ${q.question}\n` +
            (q.options ? q.options.join('\n') + '\n' : '') +
            `-> Đáp án đúng: ${q.correctAnswer}\nGiải thích: ${q.explanation}\n`
        )
        .join('\n----------------------------------------\n\n');

    downloadFile(`DeKiemTra_${activeTest.id}.txt`, content);
    onShowToast('info', 'Tải xuống', 'Đã xuất file đề kiểm tra văn bản.');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            AI Test Builder & Thẩm Định Chất Lượng Đề
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Sinh đề thi tự động theo ma trận GDPT 2018, quản lý ngân hàng câu hỏi và module kiểm tra chất lượng (Validate Test).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('generator')}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Tạo Câu Hỏi</span>
          </button>

          <button
            onClick={() => {
              setEditingQuestion(null);
              setIsQuestionModalOpen(true);
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Câu Hỏi Thủ Công</span>
          </button>

          <button
            onClick={handleDownloadTest}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>Xuất Đề</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs font-bold text-slate-500">
        <button
          onClick={() => setActiveTab('tests')}
          className={`py-2.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'tests'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Đề Kiểm Tra Đang Chọn ({activeTest?.questions.length || 0} câu)</span>
        </button>

        <button
          onClick={() => setActiveTab('generator')}
          className={`py-2.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'generator'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Tạo Câu Hỏi Tự Động</span>
        </button>

        <button
          onClick={() => setActiveTab('bank')}
          className={`py-2.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'bank'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Ngân Hàng Câu Hỏi ({questions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('validate')}
          className={`py-2.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'validate'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Thẩm Định Đề (Validate Test)</span>
        </button>
      </div>

      {/* TAB 1: CURRENT TEST QUESTIONS */}
      {activeTab === 'tests' && activeTest && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                {activeTest.subject} • Lớp {activeTest.grade}
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">{activeTest.title}</h2>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-slate-500">Thời lượng: <strong>{activeTest.durationMinutes} phút</strong></span>
              <span className="text-slate-500">Số câu: <strong>{activeTest.questions.length}</strong></span>
              <span className="text-indigo-600 font-bold">
                Tổng điểm: {activeTest.questions.reduce((s, q) => s + q.points, 0).toFixed(1)}đ
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {activeTest.questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-indigo-600 text-white font-mono text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-indigo-600">{q.code}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800">
                      {q.cognitiveLevel}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">({q.points} điểm)</span>
                  </div>

                  <button
                    onClick={() => {
                      const updated = {
                        ...activeTest,
                        questions: activeTest.questions.filter((item) => item.id !== q.id),
                        totalQuestions: activeTest.questions.length - 1,
                      };
                      StorageService.saveTest(updated);
                      onRefresh();
                    }}
                    className="p-1 text-slate-400 hover:text-red-600"
                    title="Xóa câu khỏi đề"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                  {q.question}
                </p>

                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className={`p-2.5 rounded-lg border text-xs ${
                          opt.startsWith(q.correctAnswer as string)
                            ? 'border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-xs border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                  <strong className="text-emerald-600">Đáp án chuẩn: {q.correctAnswer}</strong> — {q.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: AI QUESTION GENERATOR */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Form */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Thiết lập sinh câu hỏi bằng AI
            </h3>

            <div>
              <label className="font-semibold block mb-1">Môn học</label>
              <input
                type="text"
                value={aiSubject}
                onChange={(e) => setAiSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Chủ đề & Nội dung trọng tâm</label>
              <textarea
                rows={2}
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg leading-relaxed"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Mức độ nhận thức</label>
              <select
                value={aiLevel}
                onChange={(e) => setAiLevel(e.target.value as CognitiveLevel)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
              >
                <option value="Nhận biết">Nhận biết (40%)</option>
                <option value="Thông hiểu">Thông hiểu (30%)</option>
                <option value="Vận dụng">Vận dụng (20%)</option>
                <option value="Vận dụng cao">Vận dụng cao (10%)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Dạng câu hỏi</label>
              <select
                value={aiType}
                onChange={(e) => setAiType(e.target.value as QuestionType)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
              >
                <option value="multiple_choice">Trắc nghiệm 4 lựa chọn (MCQ)</option>
                <option value="short_answer">Trả lời ngắn / Phản biện AI</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Số lượng câu cần sinh</label>
              <input
                type="number"
                min="1"
                max="10"
                value={aiCount}
                onChange={(e) => setAiCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
              />
            </div>

            <button
              onClick={handleGenerateQuestions}
              disabled={isGenerating}
              className="w-full py-2.5 font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'AI đang phân tích kiến thức...' : 'Tạo Câu Hỏi Bằng AI'}</span>
            </button>
          </div>

          {/* Results Preview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Kết quả xem trước ({generatedPreviewQuestions.length} câu)
              </h3>
              {generatedPreviewQuestions.length > 0 && (
                <button
                  onClick={handleAcceptGenerated}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Chấp nhận & Lưu vào Đề
                </button>
              )}
            </div>

            {generatedPreviewQuestions.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 border border-dashed rounded-xl">
                Nhấp vào "Tạo Câu Hỏi Bằng AI" để sinh câu hỏi trắc nghiệm hoặc bài tập phản biện Le Chatelier.
              </div>
            ) : (
              <div className="space-y-3">
                {generatedPreviewQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-white dark:bg-slate-900 shadow-2xs space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-700 dark:text-purple-300">Câu hỏi {idx + 1} ({q.cognitiveLevel})</span>
                      <span className="font-mono text-slate-400">{q.points} điểm</span>
                    </div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{q.question}</p>
                    {q.options && (
                      <div className="space-y-1">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="p-1.5 bg-slate-50 dark:bg-slate-800/60 rounded text-[11px]">
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-[11px] text-emerald-600 font-medium">
                      Đáp án đúng: {q.correctAnswer} — {q.explanation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: QUESTION BANK */}
      {activeTab === 'bank' && (
        <div className="space-y-3">
          {questions.map((q) => (
            <div
              key={q.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex items-start justify-between gap-4 text-xs"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-600">{q.code}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800">
                    {q.cognitiveLevel}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">v{q.version}</span>
                </div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{q.question}</p>
                <p className="text-[11px] text-slate-500 italic">Đáp án: {q.correctAnswer}</p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => {
                    setEditingQuestion(q);
                    setIsQuestionModalOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget({ type: 'question', id: q.id, name: q.question })}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: VALIDATE TEST (TEST QUALITY AUDIT) */}
      {activeTab === 'validate' && validationResult && (
        <div className="space-y-4">
          <div
            className={`p-5 rounded-xl border flex items-center justify-between ${
              validationResult.isValid
                ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30'
                : 'border-red-200 dark:border-red-800 bg-red-50/70 dark:bg-red-950/30'
            }`}
          >
            <div className="flex items-center gap-3">
              {validationResult.isValid ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-red-600 shrink-0" />
              )}
              <div>
                <h3
                  className={`text-base font-bold ${
                    validationResult.isValid ? 'text-emerald-900 dark:text-emerald-200' : 'text-red-900 dark:text-red-200'
                  }`}
                >
                  KẾT QUẢ THẨM ĐỊNH ĐỀ: {validationResult.isValid ? 'ĐẠT TIÊU CHUẨN' : 'CẦN CHỈNH SỬA'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Đề thi: {activeTest?.title}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`px-3 py-1 text-xs font-black rounded-full uppercase ${
                  validationResult.isValid ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                }`}
              >
                {validationResult.isValid ? 'ĐẠT' : 'CHƯA ĐẠT'}
              </span>
            </div>
          </div>

          {/* Granular Checklist */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Danh mục kiểm tra chất lượng đề chi tiết
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {validationResult.checks.map((check, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    {check.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    )}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{check.label}</span>
                  </div>
                  <span className="text-slate-500 text-[11px]">{check.details}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MANUAL QUESTION MODAL */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-3 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {editingQuestion ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}
            </h3>
            <form onSubmit={handleSaveQuestion} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Mã câu</label>
                  <input
                    name="code"
                    type="text"
                    defaultValue={editingQuestion?.code || `C${questions.length + 1}`}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Mức độ</label>
                  <select
                    name="cognitiveLevel"
                    defaultValue={editingQuestion?.cognitiveLevel || 'Nhận biết'}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded"
                  >
                    <option value="Nhận biết">Nhận biết</option>
                    <option value="Thông hiểu">Thông hiểu</option>
                    <option value="Vận dụng">Vận dụng</option>
                    <option value="Vận dụng cao">Vận dụng cao</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Dạng câu</label>
                  <select
                    name="type"
                    defaultValue={editingQuestion?.type || 'multiple_choice'}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded"
                  >
                    <option value="multiple_choice">Trắc nghiệm</option>
                    <option value="short_answer">Trả lời ngắn</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Nội dung câu hỏi</label>
                <textarea
                  name="question"
                  rows={3}
                  required
                  defaultValue={editingQuestion?.question || ''}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                <span className="font-semibold block text-slate-500">Các phương án lựa chọn:</span>
                <input
                  name="optA"
                  placeholder="Phương án A..."
                  defaultValue={editingQuestion?.options?.[0]?.replace(/^A\.\s*/, '') || ''}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border rounded"
                />
                <input
                  name="optB"
                  placeholder="Phương án B..."
                  defaultValue={editingQuestion?.options?.[1]?.replace(/^B\.\s*/, '') || ''}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border rounded"
                />
                <input
                  name="optC"
                  placeholder="Phương án C..."
                  defaultValue={editingQuestion?.options?.[2]?.replace(/^C\.\s*/, '') || ''}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border rounded"
                />
                <input
                  name="optD"
                  placeholder="Phương án D..."
                  defaultValue={editingQuestion?.options?.[3]?.replace(/^D\.\s*/, '') || ''}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Đáp án đúng (A, B, C, D hoặc từ khóa)</label>
                  <input
                    name="correctAnswer"
                    type="text"
                    required
                    defaultValue={editingQuestion?.correctAnswer as string || 'A'}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded font-bold text-indigo-600"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Điểm số</label>
                  <input
                    name="points"
                    type="number"
                    step="0.5"
                    defaultValue={editingQuestion?.points || 1.0}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Giải thích chi tiết</label>
                <textarea
                  name="explanation"
                  rows={2}
                  defaultValue={editingQuestion?.explanation || ''}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded font-semibold"
                >
                  Lưu câu hỏi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xác nhận xóa câu hỏi"
        message={`Bạn có chắc muốn xóa câu hỏi này khỏi hệ thống?`}
        onConfirm={() => {
          if (deleteTarget) {
            StorageService.deleteQuestion(deleteTarget.id);
            onShowToast('info', 'Đã xóa', 'Đã xóa câu hỏi khỏi ngân hàng');
            setDeleteTarget(null);
            onRefresh();
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
