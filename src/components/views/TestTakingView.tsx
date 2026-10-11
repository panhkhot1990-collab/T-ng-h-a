import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Award,
  Send,
  RotateCcw,
} from 'lucide-react';
import { Test, Student, TestAttempt, Role } from '../../types';
import { StorageService } from '../../services/storage';

interface TestTakingViewProps {
  currentRole: Role;
  tests: Test[];
  students: Student[];
  onRefresh: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const TestTakingView: React.FC<TestTakingViewProps> = ({
  currentRole,
  tests,
  students,
  onRefresh,
  onShowToast,
}) => {
  const [selectedTestId, setSelectedTestId] = useState<string>(tests[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || 'std-001');

  const activeTest = tests.find((t) => t.id === selectedTestId) || tests[0];
  const activeStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  const [isTakingTest, setIsTakingTest] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeftSec, setTimeLeftSec] = useState<number>(45 * 60);
  const [completedAttempt, setCompletedAttempt] = useState<TestAttempt | null>(null);

  // Timer countdown
  useEffect(() => {
    if (!isTakingTest || timeLeftSec <= 0) return;
    const interval = setInterval(() => {
      setTimeLeftSec((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTakingTest, timeLeftSec]);

  // Start Test
  const handleStartTest = () => {
    setAnswers({});
    setCurrentQuestionIdx(0);
    setTimeLeftSec((activeTest?.durationMinutes || 45) * 60);
    setCompletedAttempt(null);
    setIsTakingTest(true);
  };

  // Submit Test
  const handleAutoSubmit = () => {
    if (!activeTest || !activeStudent) return;

    let score = 0;
    activeTest.questions.forEach((q) => {
      const studentAns = (answers[q.id] || '').trim().toUpperCase();
      const correctAns = String(q.correctAnswer).trim().toUpperCase();
      if (studentAns === correctAns || (q.type === 'multiple_choice' && studentAns.startsWith(correctAns))) {
        score += q.points;
      }
    });

    const maxScore = activeTest.questions.reduce((sum, q) => sum + q.points, 0);

    const attempt: TestAttempt = {
      id: `att-${Date.now()}`,
      testId: activeTest.id,
      testTitle: activeTest.title,
      studentId: activeStudent.id,
      studentName: activeStudent.name,
      answers,
      startedAt: new Date(Date.now() - (activeTest.durationMinutes * 60 - timeLeftSec) * 1000).toISOString(),
      submittedAt: new Date().toISOString(),
      score: Number(score.toFixed(1)),
      maxScore: Number(maxScore.toFixed(1)),
      status: 'submitted',
    };

    StorageService.saveTestAttempt(attempt);
    setIsTakingTest(false);
    setCompletedAttempt(attempt);
    onShowToast('success', 'Nộp bài thành công', `Bạn đạt ${attempt.score} / ${attempt.maxScore} điểm.`);
    onRefresh();
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <FileCheck2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Làm Bài Kiểm Tra (Học Sinh Thực Hiện)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Giao diện làm bài thực tế với bộ đếm giờ, lưu nháp câu trả lời và tự động chấm điểm theo ma trận.
          </p>
        </div>

        {/* Student selector for role simulation */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
            Thí sinh làm bài:
          </label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            disabled={isTakingTest}
            className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border rounded-lg text-slate-800 dark:text-slate-200"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code} - {s.className})
              </option>
            ))}
          </select>
        </div>
      </div>

      {!isTakingTest && !completedAttempt && (
        <div className="max-w-2xl mx-auto p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
            <FileCheck2 className="w-8 h-8" />
          </div>

          <div>
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
              {activeTest?.subject} • Lớp {activeTest?.grade}
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-3">{activeTest?.title}</h2>
            <p className="text-xs text-slate-500 mt-2">
              Thời gian làm bài: <strong>{activeTest?.durationMinutes} phút</strong> • Số lượng câu hỏi:{' '}
              <strong>{activeTest?.questions.length} câu</strong>
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border text-xs text-slate-600 dark:text-slate-400 text-left space-y-2">
            <p className="font-bold text-slate-800 dark:text-slate-200">Quy định và hướng dẫn làm bài:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Đọc kỹ từng câu hỏi trước khi chọn phương án trả lời.</li>
              <li>Hệ thống tự động lưu câu trả lời sau mỗi thao tác chọn đáp án.</li>
              <li>Khi hết thời gian, hệ thống sẽ tự động nộp bài và tính điểm.</li>
            </ul>
          </div>

          <button
            onClick={handleStartTest}
            className="px-8 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all flex items-center gap-2 mx-auto"
          >
            <span>Bắt Đầu Làm Bài Ngay</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ACTIVE TEST INTERFACE */}
      {isTakingTest && activeTest && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question Display */}
          <div className="lg:col-span-3 space-y-4">
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-indigo-600 text-xs">
                  Câu hỏi {currentQuestionIdx + 1} / {activeTest.questions.length}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 font-medium">
                  {activeTest.questions[currentQuestionIdx].cognitiveLevel} (
                  {activeTest.questions[currentQuestionIdx].points}đ)
                </span>
              </div>

              <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                {activeTest.questions[currentQuestionIdx].question}
              </p>

              {/* Multiple Choice Options */}
              {activeTest.questions[currentQuestionIdx].options ? (
                <div className="space-y-2.5 pt-2">
                  {activeTest.questions[currentQuestionIdx].options.map((opt, oIdx) => {
                    const letter = opt.substring(0, 1);
                    const isSelected = answers[activeTest.questions[currentQuestionIdx].id] === letter;
                    return (
                      <div
                        key={oIdx}
                        onClick={() =>
                          setAnswers({
                            ...answers,
                            [activeTest.questions[currentQuestionIdx].id]: letter,
                          })
                        }
                        className={`p-3.5 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-200 font-semibold shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                          }`}
                        >
                          {letter}
                        </span>
                        <span className="flex-1">{opt}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="pt-2">
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Nhập câu trả lời của bạn:
                  </label>
                  <textarea
                    rows={4}
                    value={answers[activeTest.questions[currentQuestionIdx].id] || ''}
                    onChange={(e) =>
                      setAnswers({
                        ...answers,
                        [activeTest.questions[currentQuestionIdx].id]: e.target.value,
                      })
                    }
                    placeholder="Trình bày câu trả lời ngắn gọn..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs"
                  />
                </div>
              )}

              {/* Prev / Next buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
                  disabled={currentQuestionIdx === 0}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 disabled:opacity-30"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Câu trước</span>
                </button>

                <button
                  onClick={() =>
                    setCurrentQuestionIdx((p) => Math.min(activeTest.questions.length - 1, p + 1))
                  }
                  disabled={currentQuestionIdx === activeTest.questions.length - 1}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 disabled:opacity-30"
                >
                  <span>Câu tiếp theo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Navigator & Timer */}
          <div className="space-y-4">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Thời gian còn lại:
                </span>
                <span className="font-mono font-black text-lg text-amber-600 dark:text-amber-400">
                  {formatTime(timeLeftSec)}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 block mb-2">Bảng câu hỏi:</span>
                <div className="grid grid-cols-4 gap-2">
                  {activeTest.questions.map((q, qIdx) => {
                    const isAnswered = !!answers[q.id];
                    const isCurrent = currentQuestionIdx === qIdx;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestionIdx(qIdx)}
                        className={`h-9 rounded-lg font-mono text-xs font-bold transition-all ${
                          isCurrent
                            ? 'ring-2 ring-indigo-500 bg-indigo-600 text-white'
                            : isAnswered
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {qIdx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleAutoSubmit}
                className="w-full mt-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Nộp Bài Thi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETED TEST REVIEW MODAL / VIEW */}
      {completedAttempt && (
        <div className="max-w-2xl mx-auto p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Kết Quả Bài Kiểm Tra</h2>
            <p className="text-xs text-slate-500">
              Thí sinh: <strong>{completedAttempt.studentName}</strong> • Đề: {completedAttempt.testTitle}
            </p>
            <div className="py-2">
              <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
                {completedAttempt.score}
              </span>
              <span className="text-slate-400 text-lg font-bold"> / {completedAttempt.maxScore} điểm</span>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="space-y-3 pt-3 border-t">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Chi tiết các câu trả lời và giải thích:
            </h4>
            {activeTest.questions.map((q, idx) => {
              const studentAns = (completedAttempt.answers[q.id] || '').trim();
              const isCorrect =
                studentAns.toUpperCase() === String(q.correctAnswer).trim().toUpperCase();
              return (
                <div
                  key={q.id}
                  className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${
                    isCorrect
                      ? 'border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-rose-200 bg-rose-50/50 dark:bg-rose-950/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">
                      Câu {idx + 1}: {q.question.substring(0, 50)}...
                    </span>
                    <span className={`font-bold ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isCorrect ? `+${q.points}đ` : '0đ'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    <span>Bạn đã chọn: <strong>{studentAns || 'Bỏ trống'}</strong></span> •{' '}
                    <span>Đáp án đúng: <strong className="text-emerald-600">{q.correctAnswer}</strong></span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic">Giải thích: {q.explanation}</p>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setCompletedAttempt(null)}
            className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
          >
            Quay lại trang chủ đề kiểm tra
          </button>
        </div>
      )}
    </div>
  );
};
