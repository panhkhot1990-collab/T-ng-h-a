import React, { useState } from 'react';
import {
  BookOpen,
  ClipboardList,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Send,
  FileCheck2,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Eye,
  MessageSquare,
  Award,
} from 'lucide-react';
import { Lesson, Assignment, Submission, Student, Classroom, LearningMaterial, Role } from '../../types';
import { StorageService } from '../../services/storage';
import { ConfirmModal } from '../common/ConfirmModal';
import { readFileAsDataURL } from '../../utils/exportImport';
import {
  StudentFileUploadZone,
  UploadedFileItem,
  FileTypeBadge,
  formatFileSize,
} from '../common/StudentFileUploadZone';

interface LessonsAssignmentsViewProps {
  currentRole: Role;
  lessons: Lesson[];
  assignments: Assignment[];
  submissions: Submission[];
  students: Student[];
  classrooms: Classroom[];
  materials: LearningMaterial[];
  onRefresh: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const LessonsAssignmentsView: React.FC<LessonsAssignmentsViewProps> = ({
  currentRole,
  lessons,
  assignments,
  submissions,
  students,
  classrooms,
  materials,
  onRefresh,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'lessons' | 'assignments' | 'submissions'>('assignments');

  // Modals state
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  // Student submission modal
  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionFiles, setSubmissionFiles] = useState<UploadedFileItem[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || 'std-001');

  // Viewing submission detail modal
  const [viewingSubmission, setViewingSubmission] = useState<Submission | null>(null);

  // Grading modal
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [gradingScore, setGradingScore] = useState<number>(9);
  const [gradingFeedback, setGradingFeedback] = useState<string>('');

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'lesson' | 'assignment'; id: string; name: string } | null>(null);

  // Handle Save Lesson
  const handleSaveLesson = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = fd.get('title') as string;
    const subject = (fd.get('subject') as string) || 'Hóa học';
    const grade = Number(fd.get('grade') || 11);
    const topic = fd.get('topic') as string;
    const objectivesStr = (fd.get('objectives') as string) || '';
    const objectives = objectivesStr.split('\n').filter((o) => o.trim().length > 0);
    const backgroundKnowledge = fd.get('backgroundKnowledge') as string;
    const content = fd.get('content') as string;

    const lessonToSave: Lesson = {
      id: editingLesson ? editingLesson.id : `les-${Date.now()}`,
      title,
      subject,
      grade,
      topic,
      objectives,
      backgroundKnowledge,
      content,
      materialIds: editingLesson?.materialIds || ['mat-001'],
      assignmentIds: editingLesson?.assignmentIds || [],
      testIds: editingLesson?.testIds || ['test-001'],
      verificationTaskIds: editingLesson?.verificationTaskIds || ['task-001'],
      createdAt: editingLesson?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: editingLesson?.version || 1,
    };

    StorageService.saveLesson(lessonToSave);
    setIsLessonModalOpen(false);
    setEditingLesson(null);
    onShowToast('success', 'Thành công', `Đã lưu bài học: ${title}`);
    onRefresh();
  };

  // Handle Save Assignment
  const handleSaveAssignment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = fd.get('title') as string;
    const description = fd.get('description') as string;
    const classroomId = (fd.get('classroomId') as string) || classrooms[0]?.id;
    const subject = (fd.get('subject') as string) || 'Hóa học';
    const topic = fd.get('topic') as string;
    const deadline = (fd.get('deadline') as string) || new Date(Date.now() + 7 * 86400000).toISOString();
    const maxScore = Number(fd.get('maxScore') || 10);
    const rubricsStr = (fd.get('rubrics') as string) || '';
    const rubrics = rubricsStr.split('\n').filter((r) => r.trim().length > 0);

    const asnToSave: Assignment = {
      id: editingAssignment ? editingAssignment.id : `asn-${Date.now()}`,
      title,
      description,
      classroomId,
      subject,
      topic,
      deadline,
      attachedFiles: [{ name: 'HuongDanNhiemVu.pdf', size: 102400 }],
      rubrics: rubrics.length > 0 ? rubrics : ['Đúng trọng tâm (4đ)', 'Phát hiện lỗi sai AI (3đ)', 'Đối chiếu học liệu (3đ)'],
      maxScore,
      createdAt: editingAssignment?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveAssignment(asnToSave);
    setIsAssignmentModalOpen(false);
    setEditingAssignment(null);
    onShowToast('success', 'Thành công', `Đã giao nhiệm vụ: ${title}`);
    onRefresh();
  };

  // Handle Submit by Student
  const handleSubmitAssignment = (status: 'draft' | 'submitted') => {
    if (!submittingAssignment) return;
    const student = students.find((s) => s.id === selectedStudentId) || students[0];

    const submission: Submission = {
      id: `sub-${Date.now()}`,
      assignmentId: submittingAssignment.id,
      studentId: student.id,
      studentName: student.name,
      content: submissionContent,
      attachedFiles: submissionFiles.map((f) => ({
        name: f.name,
        size: f.size,
        dataUrl: f.dataUrl,
        type: f.type,
      })),
      submittedAt: new Date().toISOString(),
      status,
    };

    StorageService.saveSubmission(submission);
    setSubmittingAssignment(null);
    setSubmissionContent('');
    setSubmissionFiles([]);
    onShowToast(
      'success',
      status === 'draft' ? 'Đã lưu nháp' : 'Đã nộp bài thành công',
      `Bài làm của ${student.name} kèm ${submissionFiles.length} tệp đính kèm đã được ghi nhận.`
    );
    onRefresh();
  };

  // Handle Grade Submission
  const handleSaveGrade = () => {
    if (!gradingSubmission) return;
    const updated: Submission = {
      ...gradingSubmission,
      score: gradingScore,
      feedback: gradingFeedback,
      status: 'graded',
      gradedAt: new Date().toISOString(),
    };
    StorageService.saveSubmission(updated);
    setGradingSubmission(null);
    onShowToast('success', 'Đã chấm điểm', `Đã ghi nhận điểm ${gradingScore} cho học sinh ${updated.studentName}`);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <ClipboardList className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Nhiệm Vụ Học Tập, Bài Học & Nộp Bài
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Giao nhiệm vụ rèn luyện năng lực phản biện, học sinh nộp bài và đối chiếu với câu trả lời mẫu của AI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'lessons' && (
            <button
              onClick={() => {
                setEditingLesson(null);
                setIsLessonModalOpen(true);
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Bài Học Mới</span>
            </button>
          )}

          {activeTab === 'assignments' && currentRole === 'teacher' && (
            <button
              onClick={() => {
                setEditingAssignment(null);
                setIsAssignmentModalOpen(true);
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Giao Nhiệm Vụ Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs font-bold text-slate-500">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`py-2.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'assignments'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Danh Sách Nhiệm Vụ ({assignments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`py-2.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'submissions'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Bài Làm Đã Nộp ({submissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('lessons')}
          className={`py-2.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'lessons'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Chương Trình Bài Học ({lessons.length})</span>
        </button>
      </div>

      {/* TAB 1: ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          {assignments.map((asn) => {
            const classObj = classrooms.find((c) => c.id === asn.classroomId);
            const submittedCount = submissions.filter((s) => s.assignmentId === asn.id).length;
            return (
              <div
                key={asn.id}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                      {asn.subject} • {asn.topic}
                    </span>
                    <span className="text-xs text-slate-500">Lớp: <strong>{classObj?.name || 'Tất cả'}</strong></span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{asn.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{asn.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      Hạn nộp: {new Date(asn.deadline).toLocaleString('vi-VN')}
                    </span>
                    <span>Thang điểm: <strong>{asn.maxScore}đ</strong></span>
                    <span>Đã nộp: <strong className="text-indigo-600">{submittedCount} bài</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setSubmittingAssignment(asn);
                      setSubmissionContent('');
                      setSubmissionFiles([]);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Làm & Nộp bài (Word / PDF / Excel)</span>
                  </button>

                  {currentRole === 'teacher' && (
                    <>
                      <button
                        onClick={() => {
                          setEditingAssignment(asn);
                          setIsAssignmentModalOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: 'assignment', id: asn.id, name: asn.title })}
                        className="p-2 text-slate-400 hover:text-red-600 border border-slate-200 dark:border-slate-700 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: SUBMISSIONS LOG */}
      {activeTab === 'submissions' && (
        <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Mã bài nộp</th>
                <th className="py-3 px-4">Học sinh</th>
                <th className="py-3 px-4">Nhiệm vụ</th>
                <th className="py-3 px-4">Tệp đính kèm (Word/PDF/Excel)</th>
                <th className="py-3 px-4">Thời điểm nộp</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-center">Điểm số</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono text-indigo-600 font-bold">{sub.id}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">{sub.studentName}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                    {assignments.find((a) => a.id === sub.assignmentId)?.title || sub.assignmentId}
                  </td>
                  <td className="py-3 px-4">
                    {sub.attachedFiles && sub.attachedFiles.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {sub.attachedFiles.map((file, fIdx) => (
                          <button
                            key={fIdx}
                            type="button"
                            onClick={() => {
                              if (file.dataUrl) {
                                const a = document.createElement('a');
                                a.href = file.dataUrl;
                                a.download = file.name;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                              } else {
                                onShowToast('info', 'Thông báo', `Tệp mô phỏng ${file.name}`);
                              }
                            }}
                            title={`Tải xuống: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] transition-colors"
                          >
                            <FileTypeBadge fileName={file.name} />
                            <span className="truncate max-w-[100px] font-medium">{file.name}</span>
                            <Download className="w-3 h-3 text-slate-400" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">Không có tệp</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {new Date(sub.submittedAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.status === 'graded'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sub.status === 'submitted'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {sub.status === 'graded' ? 'Đã chấm' : sub.status === 'submitted' ? 'Đã nộp' : 'Lưu nháp'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                    {sub.score !== undefined ? `${sub.score}đ` : '--'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewingSubmission(sub)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                      >
                        Chi tiết
                      </button>
                      {currentRole === 'teacher' && (
                        <button
                          onClick={() => {
                            setGradingSubmission(sub);
                            setGradingScore(sub.score || 9);
                            setGradingFeedback(sub.feedback || '');
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded"
                        >
                          Chấm điểm
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: LESSONS */}
      {activeTab === 'lessons' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lessons.map((les) => (
            <div
              key={les.id}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                    {les.subject} • Lớp {les.grade}
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mt-1">{les.title}</h3>
                </div>
                {currentRole === 'teacher' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingLesson(les);
                        setIsLessonModalOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-blue-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ type: 'lesson', id: les.id, name: les.title })}
                      className="p-1 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Yêu cầu cần đạt:
                </span>
                <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
                  {les.objectives.slice(0, 2).map((obj, i) => (
                    <li key={i} className="line-clamp-1">
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex justify-between">
                <span>{les.materialIds.length} học liệu liên kết</span>
                <span>Phiên bản v{les.version}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* STUDENT SUBMISSION MODAL */}
      {submittingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 text-xs my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Send className="w-5 h-5 text-indigo-600" />
                  Nộp bài: {submittingAssignment.title}
                </h3>
                <p className="text-slate-500 mt-0.5">
                  Môn học: {submittingAssignment.subject} • Thang điểm: {submittingAssignment.maxScore}đ
                </p>
              </div>
              <button
                onClick={() => setSubmittingAssignment(null)}
                className="text-slate-400 hover:text-slate-600 text-base"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Học sinh nộp bài:
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code} - {s.className}) - Nhóm {s.group === 'intervention' ? 'Thực nghiệm' : 'Đối chứng'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Nội dung bài làm & Phân tích phản biện:
              </label>
              <textarea
                rows={4}
                required
                value={submissionContent}
                onChange={(e) => setSubmissionContent(e.target.value)}
                placeholder="Trình bày bài làm, các bước tính toán, chỉ ra ảo giác và dẫn chứng học liệu chuẩn phản biện câu trả lời của AI..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 leading-relaxed"
              />
            </div>

            {/* Student Word / PDF / Excel File Upload Zone */}
            <div className="pt-1">
              <StudentFileUploadZone
                files={submissionFiles}
                onChange={setSubmissionFiles}
                label="Tải lên tệp bài làm của học sinh (Word, PDF, Excel)"
                description="Hỗ trợ các định dạng: Microsoft Word (.docx, .doc), Adobe PDF (.pdf), Microsoft Excel (.xlsx, .xls, .csv). Cho phép tải lên nhiều tệp (tối đa 5 tệp, 25MB/tệp)."
                maxFiles={5}
                maxSizeMB={25}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleSubmitAssignment('draft')}
                className="px-4 py-2 font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200"
              >
                Lưu nháp
              </button>
              <button
                type="button"
                onClick={() => handleSubmitAssignment('submitted')}
                disabled={!submissionContent.trim() && submissionFiles.length === 0}
                className="px-5 py-2 font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Nộp bài chính thức</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW SUBMISSION DETAIL MODAL */}
      {viewingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4 text-xs my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <div>
                <span className="font-mono text-[10px] text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                  {viewingSubmission.id}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                  Bài làm của: {viewingSubmission.studentName}
                </h3>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Thời điểm nộp: {new Date(viewingSubmission.submittedAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <button onClick={() => setViewingSubmission(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                Nội dung bài làm & Phản biện:
              </span>
              <p className="text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                {viewingSubmission.content || '(Không có nội dung văn bản trực tiếp)'}
              </p>
            </div>

            {/* Attached files */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                Tệp đính kèm học sinh tải lên ({viewingSubmission.attachedFiles?.length || 0}):
              </span>
              {viewingSubmission.attachedFiles && viewingSubmission.attachedFiles.length > 0 ? (
                <div className="space-y-1.5">
                  {viewingSubmission.attachedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                        <FileTypeBadge fileName={file.name} mimeType={file.type} />
                        <span className="truncate font-semibold text-slate-800 dark:text-slate-200">
                          {file.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      {file.dataUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            const a = document.createElement('a');
                            a.href = file.dataUrl!;
                            a.download = file.name;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 rounded flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Tải về</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic">Học sinh không đính kèm tệp.</p>
              )}
            </div>

            {/* Grading result */}
            {viewingSubmission.status === 'graded' && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    Kết quả chấm điểm:
                  </span>
                  <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                    {viewingSubmission.score} / 10 điểm
                  </span>
                </div>
                {viewingSubmission.feedback && (
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                    Nhận xét: {viewingSubmission.feedback}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingSubmission(null)}
                className="px-4 py-2 font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GRADING MODAL */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4 text-xs my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Chấm điểm bài làm: {gradingSubmission.studentName}
            </h3>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-bold text-slate-500 block mb-1">Nội dung bài làm:</span>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">{gradingSubmission.content}</p>
            </div>

            {/* Attached files for teacher to review */}
            {gradingSubmission.attachedFiles && gradingSubmission.attachedFiles.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  Tệp đính kèm học sinh nộp (Word / PDF / Excel):
                </span>
                <div className="space-y-1.5">
                  {gradingSubmission.attachedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                        <FileTypeBadge fileName={file.name} mimeType={file.type} />
                        <span className="truncate font-semibold text-slate-800 dark:text-slate-200">
                          {file.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      {file.dataUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            const a = document.createElement('a');
                            a.href = file.dataUrl!;
                            a.download = file.name;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                          }}
                          className="px-2 py-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 rounded flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>Tải tệp</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Điểm đánh giá (Thang điểm 10):
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="10"
                value={gradingScore}
                onChange={(e) => setGradingScore(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold text-sm"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Nhận xét & Hướng dẫn phản biện của giáo viên:
              </label>
              <textarea
                rows={3}
                value={gradingFeedback}
                onChange={(e) => setGradingFeedback(e.target.value)}
                placeholder="Nhận xét khả năng phát hiện lỗi AI, cách dùng từ và dẫn chứng học liệu..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setGradingSubmission(null)}
                className="px-4 py-2 font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveGrade}
                className="px-4 py-2 font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
              >
                Lưu kết quả chấm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xác nhận xóa"
        message={`Bạn có chắc muốn xóa "${deleteTarget?.name}"?`}
        onConfirm={() => {
          if (deleteTarget?.type === 'assignment') {
            StorageService.deleteAssignment(deleteTarget.id);
          } else if (deleteTarget?.type === 'lesson') {
            StorageService.deleteLesson(deleteTarget.id);
          }
          onShowToast('info', 'Đã xóa', `Đã xóa ${deleteTarget?.name}`);
          setDeleteTarget(null);
          onRefresh();
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
