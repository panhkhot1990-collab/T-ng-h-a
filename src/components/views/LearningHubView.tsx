import React, { useState } from 'react';
import {
  Compass,
  Target,
  BookOpen,
  FolderArchive,
  ClipboardList,
  FileCheck2,
  FlaskConical,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Download,
  Eye,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Lesson, LearningMaterial, Assignment, Submission, Test, VerificationTask, Role } from '../../types';
import { NavItemKey } from '../layout/Sidebar';

interface LearningHubViewProps {
  currentRole: Role;
  lessons: Lesson[];
  materials: LearningMaterial[];
  assignments: Assignment[];
  submissions: Submission[];
  tests: Test[];
  verificationTasks: VerificationTask[];
  onNavigate: (tab: NavItemKey) => void;
  onOpenTest: (testId: string) => void;
  onOpenVerification: (taskId: string) => void;
  onOpenMaterial: (mat: LearningMaterial) => void;
}

export const LearningHubView: React.FC<LearningHubViewProps> = ({
  currentRole,
  lessons,
  materials,
  assignments,
  submissions,
  tests,
  verificationTasks,
  onNavigate,
  onOpenTest,
  onOpenVerification,
  onOpenMaterial,
}) => {
  const [selectedLessonId, setSelectedLessonId] = useState<string>(lessons[0]?.id || '');
  const activeLesson = lessons.find((l) => l.id === selectedLessonId) || lessons[0];

  const linkedMaterials = materials.filter((m) => activeLesson?.materialIds.includes(m.id));
  const linkedAssignments = assignments.filter((a) => activeLesson?.assignmentIds.includes(a.id));
  const linkedTests = tests.filter((t) => activeLesson?.testIds.includes(t.id));
  const linkedVerification = verificationTasks.filter((v) => activeLesson?.verificationTaskIds.includes(v.id));

  const steps = [
    { num: '01', title: 'Mục Tiêu', icon: Target },
    { num: '02', title: 'Kiến Thức Nền', icon: BookOpen },
    { num: '03', title: 'Học Liệu Chuẩn', icon: FolderArchive },
    { num: '04', title: 'Nội Dung Bài Học', icon: BookOpen },
    { num: '05', title: 'Nhiệm Vụ Học Tập', icon: ClipboardList },
    { num: '06', title: 'Bài Tập & Nộp Bài', icon: ClipboardList },
    { num: '07', title: 'Kiểm Tra Đánh Giá', icon: FileCheck2 },
    { num: '08', title: 'Kiểm Chứng AI', icon: FlaskConical },
    { num: '09', title: 'Phản Hồi & Đánh Giá', icon: MessageSquare },
    { num: '10', title: 'Tiến Độ Cá Nhân', icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Compass className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Learning Hub — Trung Tâm Học Tập Đa Tuyến
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quy trình chuẩn: Mục tiêu → Kiến thức nền → Học liệu → Bài học → Nhiệm vụ → Bài tập → Kiểm tra → Kiểm chứng AI → Phản hồi → Tiến độ
          </p>
        </div>

        {/* Lesson Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
            Chọn chủ đề:
          </label>
          <select
            value={selectedLessonId}
            onChange={(e) => setSelectedLessonId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual Pipeline Bar */}
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="flex items-center gap-2 min-w-max">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs shadow-2xs">
                  <span className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1 rounded">
                    {step.num}
                  </span>
                  <Icon className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">{step.title}</span>
                </div>
                {idx < steps.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />}
              </div>
            );
          })}
        </div>
      </div>

      {activeLesson ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column: Content, Objectives, Knowledge */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. MỤC TIÊU CẦN ĐẠT */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
              <h2 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 mb-3">
                <Target className="w-4 h-4" />
                MỤC TIÊU BÀI HỌC (Yêu cầu cần đạt GDPT 2018)
              </h2>
              <ul className="space-y-2">
                {activeLesson.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. KIẾN THỨC NỀN & NỘI DUNG */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-slate-500" />
                KIẾN THỨC NỀN & TRỌNG TÂM LÝ THUYẾT
              </h2>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-lg text-xs text-slate-600 dark:text-slate-300 mb-4">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Kiến thức tiên quyết: </span>
                {activeLesson.backgroundKnowledge}
              </div>

              <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {activeLesson.content}
              </div>
            </div>

            {/* 3. NHIỆM VỤ & BÀI TẬP */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  NHIỆM VỤ HỌC TẬP & BÀI TẬP ĐÍNH KÈM
                </h2>
                <button
                  onClick={() => onNavigate('assignments')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  Xem tất cả nhiệm vụ
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {linkedAssignments.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 border border-dashed rounded-lg">
                  Chưa có nhiệm vụ bài tập cụ thể cho chủ đề này.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-2.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-[11px] text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
                    <span>💡 <strong>Tính năng nộp bài:</strong> Học sinh có thể tải lên file Word (.docx), PDF (.pdf) hoặc bảng tính Excel (.xlsx) để phản biện AI.</span>
                    <button
                      onClick={() => onNavigate('assignments')}
                      className="font-bold underline hover:text-indigo-900 shrink-0 ml-2"
                    >
                      Mở cổng nộp bài →
                    </button>
                  </div>
                  {linkedAssignments.map((asn) => (
                    <div
                      key={asn.id}
                      className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">{asn.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{asn.description}</p>
                        <div className="mt-2 flex items-center gap-4 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-500" />
                            Hạn nộp: {new Date(asn.deadline).toLocaleDateString('vi-VN')}
                          </span>
                          <span>Điểm tối đa: {asn.maxScore}đ</span>
                        </div>
                      </div>
                      <button
                        onClick={() => onNavigate('assignments')}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors whitespace-nowrap shadow-xs flex items-center gap-1.5"
                      >
                        <ClipboardList className="w-3.5 h-3.5" />
                        <span>Nộp bài (Word / PDF / Excel)</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Side Column: Materials, Tests, Verification, Feedback */}
          <div className="space-y-6">
            {/* HỌC LIỆU ĐỐI CHIẾU */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 uppercase tracking-wider">
                  <FolderArchive className="w-4 h-4 text-blue-500" />
                  Học liệu đối chiếu ({linkedMaterials.length})
                </h3>
                <button
                  onClick={() => onNavigate('materials')}
                  className="text-[11px] text-indigo-600 hover:underline"
                >
                  Kho học liệu
                </button>
              </div>

              <div className="space-y-2">
                {linkedMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    onClick={() => onOpenMaterial(mat)}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-400 bg-slate-50/60 dark:bg-slate-800/40 cursor-pointer transition-all flex items-start gap-2.5 group"
                  >
                    <FolderArchive className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 truncate">
                        {mat.title}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {mat.fileName} • {(mat.fileSize / 1024).toFixed(0)} KB
                      </p>
                    </div>
                    <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* KIỂM CHỨNG NỘI DUNG AI */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-2 uppercase tracking-wider">
                  <FlaskConical className="w-4 h-4" />
                  Nhiệm vụ kiểm chứng AI ({linkedVerification.length})
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Rèn luyện phát hiện ảo giác và lập luận sai của AI trước khi tin dùng:
              </p>

              <div className="space-y-2">
                {linkedVerification.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => onOpenVerification(v.id)}
                    className="p-3 rounded-lg border border-purple-200 dark:border-purple-800/60 bg-purple-50/40 dark:bg-purple-950/20 hover:bg-purple-100/50 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/60 rounded">
                        Độ khó: {v.difficulty}
                      </span>
                      <span className="text-[10px] text-purple-600 font-mono">Thực nghiệm</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 mt-1.5 line-clamp-2">
                      {v.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* BÀI KIỂM TRA ĐÁNH GIÁ */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 uppercase tracking-wider mb-3">
                <FileCheck2 className="w-4 h-4 text-emerald-500" />
                Đề kiểm tra đánh giá ({linkedTests.length})
              </h3>
              {linkedTests.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40"
                >
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{t.title}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                    <span>{t.totalQuestions} câu • {t.durationMinutes} phút</span>
                    <button
                      onClick={() => onOpenTest(t.id)}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 rounded transition-colors"
                    >
                      Bắt đầu làm
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500">Chưa có bài học nào được khởi tạo.</div>
      )}
    </div>
  );
};
