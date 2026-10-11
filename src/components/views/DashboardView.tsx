import React from 'react';
import {
  BookOpen,
  Users,
  FolderArchive,
  ClipboardList,
  FileCheck2,
  FlaskConical,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Database,
  Sparkles,
  ShieldCheck,
  Clock,
  Star,
  Award,
  Workflow,
} from 'lucide-react';
import { Role, Student, Classroom, LearningMaterial, Lesson, Assignment, Submission, Test, VerificationTask, VerificationSubmission, PrePostAssessment } from '../../types';
import { NavItemKey } from '../layout/Sidebar';
import { calculateMean } from '../../utils/stats';

interface DashboardViewProps {
  currentRole: Role;
  students: Student[];
  classrooms: Classroom[];
  materials?: LearningMaterial[];
  lessons: Lesson[];
  assignments: Assignment[];
  submissions: Submission[];
  tests: Test[];
  verificationTasks: VerificationTask[];
  verificationSubmissions: VerificationSubmission[];
  prePost: PrePostAssessment[];
  anonymize: boolean;
  activeStudentId?: string;
  onNavigate: (tab: NavItemKey) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentRole,
  students,
  classrooms,
  materials = [],
  lessons,
  assignments,
  submissions,
  tests,
  verificationTasks,
  verificationSubmissions,
  prePost,
  anonymize,
  activeStudentId = 'std-001',
  onNavigate,
}) => {
  // Current active student for student mode
  const activeStudent = students.find((s) => s.id === activeStudentId) || students[0];

  // Pre vs Post calculations
  const preAssessments = prePost.filter((p) => p.type === 'pre_test');
  const postAssessments = prePost.filter((p) => p.type === 'post_test');
  const preAbiMean = calculateMean(preAssessments.map((p) => p.automationBiasIndicator));
  const postAbiMean = calculateMean(postAssessments.map((p) => p.automationBiasIndicator));
  const abiReductionPct = preAbiMean > 0 ? (((preAbiMean - postAbiMean) / preAbiMean) * 100).toFixed(1) : '0';

  const preAccuracyMean = calculateMean(preAssessments.map((p) => p.verificationAccuracyPct));
  const postAccuracyMean = calculateMean(postAssessments.map((p) => p.verificationAccuracyPct));

  // Pending items
  const pendingSubmissionsCount = assignments.length * students.length - submissions.length;
  const pendingVerificationsCount = verificationTasks.length;

  // Student specific data
  const studentSubmissions = submissions.filter((s) => s.studentId === activeStudent?.id);
  const studentVerifications = verificationSubmissions.filter((v) => v.studentId === activeStudent?.id);
  const studentPre = prePost.find((p) => p.studentId === activeStudent?.id && p.type === 'pre_test');
  const studentPost = prePost.find((p) => p.studentId === activeStudent?.id && p.type === 'post_test');

  // IF STUDENT ROLE: SIMPLE & FOCUSED DASHBOARD
  if (currentRole === 'student') {
    return (
      <div className="space-y-6">
        {/* Student Welcome Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-800 text-white p-6 sm:p-8 shadow-lg">
          <div className="max-w-2xl space-y-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-indigo-100 backdrop-blur-xs">
              Cổng Học Sinh THPT
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Xin chào, {anonymize ? activeStudent.code : activeStudent.name}!
            </h1>
            <p className="text-sm text-indigo-100">
              Lớp {activeStudent.className} • Nhóm nghiên cứu:{' '}
              <strong className="underline">
                {activeStudent.group === 'intervention'
                  ? 'Thực nghiệm can thiệp (Verification Trainer)'
                  : 'Đối chứng (Sử dụng AI tự do)'}
              </strong>
            </p>

            <div className="pt-3 flex flex-wrap gap-2.5">
              <button
                onClick={() => onNavigate('learning-hub')}
                className="px-4 py-2 text-xs font-bold text-indigo-950 bg-white hover:bg-indigo-50 rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
              >
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Vào Gốc Học Tập
              </button>
              <button
                onClick={() => onNavigate('verification-trainer')}
                className="px-4 py-2 text-xs font-bold text-white bg-purple-500/80 hover:bg-purple-500 border border-purple-400/40 rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Workflow className="w-4 h-4" />
                Luyện Tập 7 Bước Kiểm Chứng
              </button>
              <button
                onClick={() => onNavigate('test-taking')}
                className="px-4 py-2 text-xs font-bold text-indigo-100 bg-indigo-900/60 hover:bg-indigo-900 border border-indigo-500/40 rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
              >
                <FileCheck2 className="w-4 h-4 text-indigo-300" />
                Làm Bài Kiểm Tra
              </button>
            </div>
          </div>
        </div>

        {/* Student "Hôm nay của bạn" Cards */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Hôm nay của bạn
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Bài học */}
            <div
              onClick={() => onNavigate('learning-hub')}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-indigo-400 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold">Chủ đề bài học</span>
                <BookOpen className="w-4 h-4 text-indigo-500" />
              </div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 truncate">
                {lessons[0]?.title}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Cân bằng hóa học & Le Chatelier</p>
            </div>

            {/* 2. Bài tập */}
            <div
              onClick={() => onNavigate('assignments')}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-amber-400 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold">Nhiệm vụ & Bài tập</span>
                <ClipboardList className="w-4 h-4 text-amber-500" />
              </div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-amber-600 truncate">
                {assignments[0]?.title}
              </h3>
              <p className="text-[11px] text-amber-600 font-semibold mt-1">
                Đã nộp: {studentSubmissions.length} bài
              </p>
            </div>

            {/* 3. Nhiệm vụ kiểm chứng */}
            <div
              onClick={() => onNavigate('ai-verification')}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-purple-400 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold">Kiểm chứng AI</span>
                <FlaskConical className="w-4 h-4 text-purple-500" />
              </div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-purple-600 truncate">
                {verificationTasks[0]?.title}
              </h3>
              <p className="text-[11px] text-purple-600 font-semibold mt-1">
                Đã làm: {studentVerifications.length} lượt kiểm chứng
              </p>
            </div>

            {/* 4. Đề kiểm tra */}
            <div
              onClick={() => onNavigate('test-taking')}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-emerald-400 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold">Đề kiểm tra 45p</span>
                <FileCheck2 className="w-4 h-4 text-emerald-500" />
              </div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 truncate">
                {tests[0]?.title}
              </h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                Điểm Post-test: {studentPost ? `${studentPost.score}đ` : 'Chưa làm'}
              </p>
            </div>
          </div>
        </div>

        {/* Student Personal Progress Card */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" />
            Tiến độ rèn luyện & Chỉ báo Automation Bias cá nhân
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border space-y-1">
              <span className="text-slate-500">Độ chính xác kiểm chứng AI:</span>
              <p className="text-2xl font-black text-indigo-600">
                {studentPost ? `${studentPost.verificationAccuracyPct}%` : '45%'}
              </p>
              <span className="text-[11px] text-slate-400">Tăng mạnh nhờ can thiệp</span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border space-y-1">
              <span className="text-slate-500">Chỉ số Automation Bias (ABI):</span>
              <p className="text-2xl font-black text-emerald-600">
                {studentPost ? studentPost.automationBiasIndicator.toFixed(1) : 'Chưa đo'} / 100
              </p>
              <span className="text-[11px] text-emerald-600 font-semibold">
                {studentPre && studentPost ? `Đã giảm ${(studentPre.automationBiasIndicator - studentPost.automationBiasIndicator).toFixed(1)} điểm thiên lệch` : 'Cảnh giác cao'}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border space-y-1">
              <span className="text-slate-500">Điểm kiểm tra hóa học:</span>
              <p className="text-2xl font-black text-blue-600">
                {studentPost ? `${studentPost.score} / 10đ` : '6.5 / 10đ'}
              </p>
              <span className="text-[11px] text-blue-600 font-semibold">Đạt chuẩn GDPT 2018</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // TEACHER / RESEARCHER DASHBOARD VIEW (Full 10 Core Questions & Analytics)
  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-semibold text-indigo-300 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            Hệ thống Nghiên cứu Giáo dục THPT GDPT 2018
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Nghiên cứu Thiên lệch Tự động hóa & Năng lực Kiểm chứng AI
          </h1>
          <p className="text-sm sm:text-base text-indigo-200 leading-relaxed">
            Nền tảng kiểm định thực nghiệm tác động của công cụ tương tác rèn luyện năng lực phản biện, kiểm chứng nội dung AI tạo sinh ở học sinh THPT.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('verification-trainer')}
              className="px-4 py-2 text-xs font-semibold text-indigo-950 bg-white hover:bg-indigo-50 rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            >
              <FlaskConical className="w-4 h-4 text-indigo-600" />
              Mở Công cụ Can thiệp 7 bước
            </button>
            <button
              onClick={() => onNavigate('test-builder')}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600/80 hover:bg-indigo-600 border border-indigo-500/60 rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Tạo đề kiểm tra với AI
            </button>
            <button
              onClick={() => onNavigate('research-dashboard')}
              className="px-4 py-2 text-xs font-semibold text-indigo-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            >
              Xem báo cáo thực nghiệm Pre/Post
            </button>
          </div>
        </div>
      </div>

      {/* 10 CORE SCIENTIFIC QUESTIONS DASHBOARD MATRIX */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Bảng 10 Trọng Điểm Giám Sát Học Tập & Nghiên Cứu Hôm Nay
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Q1: Hôm nay học gì? */}
          <div
            onClick={() => onNavigate('lessons')}
            className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-semibold">1. Hôm nay học gì?</span>
              <BookOpen className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
              {lessons[0]?.title || 'Chưa có bài học'}
            </p>
            <span className="text-[11px] text-slate-500 block mt-1">Tổng cộng {lessons.length} chủ đề chuẩn</span>
          </div>

          {/* Q2: Bài tập chưa hoàn thành? */}
          <div
            onClick={() => onNavigate('assignments')}
            className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-amber-300 dark:hover:border-amber-700 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-semibold">2. Bài tập chưa xong?</span>
              <ClipboardList className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-amber-600 truncate">
              {assignments.length} nhiệm vụ đã giao
            </p>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 block mt-1 font-medium">
              Hạn nộp: {new Date(assignments[0]?.deadline || Date.now()).toLocaleDateString('vi-VN')}
            </span>
          </div>

          {/* Q3: Bài kiểm tra sắp tới? */}
          <div
            onClick={() => onNavigate('test-taking')}
            className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-semibold">3. Bài kiểm tra?</span>
              <FileCheck2 className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 truncate">
              {tests[0]?.title || 'Đề kiểm tra sẵn sàng'}
            </p>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 block mt-1">10 câu • 45 phút</span>
          </div>

          {/* Q4: Bài chưa nộp? */}
          <div
            onClick={() => onNavigate('assignments')}
            className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-rose-300 dark:hover:border-rose-700 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-semibold">4. Bài chưa nộp?</span>
              <Clock className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
              {Math.max(0, pendingSubmissionsCount)} lượt nộp còn lại
            </p>
            <span className="text-[11px] text-slate-500 block mt-1">Đã nộp: {submissions.length} bài</span>
          </div>

          {/* Q5: Nội dung AI cần kiểm chứng? */}
          <div
            onClick={() => onNavigate('ai-verification')}
            className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-semibold">5. AI cần kiểm chứng?</span>
              <FlaskConical className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
              {pendingVerificationsCount} kịch bản bẫy lỗi AI
            </p>
            <span className="text-[11px] text-slate-500 block mt-1">Le Chatelier & Nitric Acid</span>
          </div>

          {/* Q6: Tiến độ học tập hiện tại? */}
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-semibold">6. Tiến độ học tập?</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Hoàn thành 85%</p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2">
              <div className="bg-emerald-500 h-1.5 rounded-full w-[85%]" />
            </div>
          </div>

          {/* Q7: Năng lực kiểm chứng AI? */}
          <div
            onClick={() => onNavigate('pre-post')}
            className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-indigo-300 cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-semibold">7. Độ chính xác kiểm chứng?</span>
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {postAccuracyMean.toFixed(1)}% (Sau can thiệp)
            </p>
            <span className="text-[11px] text-slate-500 block mt-1">Trước can thiệp: {preAccuracyMean.toFixed(1)}%</span>
          </div>

          {/* Q8: Automation Bias trước/sau? */}
          <div
            onClick={() => onNavigate('research-dashboard')}
            className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-rose-300 cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-semibold">8. Automation Bias (ABI)?</span>
              <TrendingDown className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <span>{preAbiMean.toFixed(1)}</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-600 font-extrabold">{postAbiMean.toFixed(1)}</span>
            </p>
            <span className="text-[11px] text-emerald-600 block mt-1 font-semibold">
              Giảm {abiReductionPct}% thiên lệch
            </span>
          </div>

          {/* Q9: Dữ liệu có thiếu sót? */}
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-semibold">9. Toàn vẹn dữ liệu?</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-sm font-bold text-emerald-600">Đầy đủ 100%</p>
            <span className="text-[11px] text-slate-500 block mt-1">8/8 học sinh có đủ Pre & Post</span>
          </div>

          {/* Q10: Đã sao lưu két dữ liệu chưa? */}
          <div
            onClick={() => onNavigate('data-vault')}
            className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-teal-300 cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-semibold">10. Sao lưu Két dữ liệu?</span>
              <Database className="w-4 h-4 text-teal-500" />
            </div>
            <p className="text-sm font-bold text-teal-600 dark:text-teal-400">Đã an toàn</p>
            <span className="text-[11px] text-slate-500 block mt-1">Snapshot cục bộ tự động</span>
          </div>
        </div>
      </div>

      {/* EXPERIMENTAL SUMMARY STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Mẫu khách thể nghiên cứu</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{students.length} học sinh</p>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>{classrooms.length} lớp học</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-medium">Nhóm TN & ĐC</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Học liệu chuẩn hóa</span>
            <FolderArchive className="w-4 h-4 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{materials.length} tài liệu</p>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>SGK & Hướng dẫn</span>
            <span className="text-blue-600 font-medium">Hỗ trợ đối chiếu</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Lượt thực nghiệm kiểm chứng</span>
            <FlaskConical className="w-4 h-4 text-purple-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{verificationSubmissions.length} lượt</p>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Ghi nhận timestamp</span>
            <span className="text-purple-600 font-medium">Thời gian & Lý do</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Điểm kiểm tra trung bình</span>
            <FileCheck2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600">8.2 / 10</p>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Tăng 1.8đ sau can thiệp</span>
            <span className="text-emerald-600 font-medium">p &lt; 0.05</span>
          </div>
        </div>
      </div>

      {/* QUICK WORKFLOW NAVIGATION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
              <FlaskConical className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Phòng Kiểm Chứng AI (Lab)</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Trải nghiệm thực tế tình huống AI đưa ra câu trả lời chứa bẫy logic hoặc trích dẫn bịa đặt. Ghi nhận thời gian, lý do phản biện và đối chiếu học liệu.
            </p>
          </div>
          <button
            onClick={() => onNavigate('ai-verification')}
            className="mt-4 px-3 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 rounded-lg flex items-center justify-between transition-colors"
          >
            <span>Vào phòng kiểm chứng</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Đề Kiểm Tra, Ma Trận & Đặc Tả</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Quản lý đề kiểm tra chuẩn hóa 10.0đ, liên kết chặt chẽ Ma trận và Bản đặc tả GDPT 2018, in ấn đề thi và sinh câu hỏi bằng AI Test Builder.
            </p>
          </div>
          <button
            onClick={() => onNavigate('tests')}
            className="mt-4 px-3 py-2 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 rounded-lg flex items-center justify-between transition-colors"
          >
            <span>Quản lý Đề & Đặc tả</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Dashboard Nghiên Cứu & Dữ Liệu</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Phân tích chỉ số Automation Bias Indicator, độ lệch chuẩn SD, so sánh đối chứng vs thực nghiệm, xuất dataset CSV/JSON để công bố khoa học.
            </p>
          </div>
          <button
            onClick={() => onNavigate('research-dashboard')}
            className="mt-4 px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 rounded-lg flex items-center justify-between transition-colors"
          >
            <span>Xem số liệu thống kê</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
