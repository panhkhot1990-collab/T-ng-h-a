import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  Plus,
  Search,
  Download,
  Upload,
  Edit2,
  Trash2,
  Eye,
  Filter,
  ShieldCheck,
  CheckCircle2,
  Clock,
  FlaskConical,
  Award,
  BookOpen,
  History,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { Student, Classroom, Submission, VerificationSubmission, PrePostAssessment } from '../../types';
import { StorageService } from '../../services/storage';
import { arrayToCSV, downloadFile, parseCSV, readFileAsText } from '../../utils/exportImport';
import { ConfirmModal } from '../common/ConfirmModal';

interface ClassroomStudentsViewProps {
  students: Student[];
  classrooms: Classroom[];
  submissions: Submission[];
  verificationSubs: VerificationSubmission[];
  prePost: PrePostAssessment[];
  anonymize: boolean;
  onRefresh: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const ClassroomStudentsView: React.FC<ClassroomStudentsViewProps> = ({
  students,
  classrooms,
  submissions,
  verificationSubs,
  prePost,
  anonymize,
  onRefresh,
  onShowToast,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [viewingProfileStudent, setViewingProfileStudent] = useState<Student | null>(null);
  const [profileActiveTab, setProfileActiveTab] = useState<string>('overview');

  // Classroom modal
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);

  // Delete confirm modal
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'student' | 'class'; id: string; name: string; count?: number } | null>(null);

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const matchClass = selectedClassId === 'all' || s.classroomId === selectedClassId;
    const matchGroup = selectedGroup === 'all' || s.group === selectedGroup;
    const nameMatch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchClass && matchGroup && nameMatch;
  });

  // Handle Save Student
  const handleSaveStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const code = (fd.get('code') as string) || `HS11-${Math.floor(100 + Math.random() * 900)}`;
    const name = fd.get('name') as string;
    const classroomId = fd.get('classroomId') as string;
    const cls = classrooms.find((c) => c.id === classroomId);
    const group = (fd.get('group') as 'control' | 'intervention') || 'intervention';
    const schoolYear = (fd.get('schoolYear') as string) || '2025-2026';

    const studentToSave: Student = {
      id: editingStudent ? editingStudent.id : `std-${Date.now()}`,
      code,
      name,
      classroomId,
      className: cls?.name || 'Chưa phân lớp',
      schoolYear,
      status: 'active',
      group,
      createdAt: editingStudent?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: editingStudent?.version || 1,
    };

    StorageService.saveStudent(studentToSave);
    setIsStudentModalOpen(false);
    setEditingStudent(null);
    onShowToast('success', 'Thành công', `Đã lưu thông tin học sinh: ${name}`);
    onRefresh();
  };

  // Handle Save Classroom
  const handleSaveClassroom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get('name') as string;
    const grade = Number(fd.get('grade') || 11);
    const teacherName = fd.get('teacherName') as string;
    const description = fd.get('description') as string;

    const classToSave: Classroom = {
      id: editingClassroom ? editingClassroom.id : `cls-${Date.now()}`,
      name,
      grade,
      schoolYear: '2025-2026',
      teacherName,
      studentCount: editingClassroom?.studentCount || 0,
      description,
      createdAt: editingClassroom?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveClassroom(classToSave);
    setIsClassModalOpen(false);
    setEditingClassroom(null);
    onShowToast('success', 'Thành công', `Đã lưu thông tin lớp: ${name}`);
    onRefresh();
  };

  // Handle Delete Confirmation
  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'student') {
      const res = StorageService.deleteStudent(deleteTarget.id);
      onShowToast('info', 'Đã xóa', `Đã xóa học sinh ${deleteTarget.name}. Liên kết đã giải phóng: ${res.linkedCount}`);
    } else {
      const res = StorageService.deleteClassroom(deleteTarget.id);
      onShowToast('info', 'Đã xóa', `Đã xóa lớp học ${deleteTarget.name}. Số học sinh trong lớp: ${res.studentCount}`);
    }
    setDeleteTarget(null);
    onRefresh();
  };

  // Export Students CSV
  const handleExportCSV = () => {
    const data = filteredStudents.map((s) => ({
      Mã_Học_Sinh: s.code,
      Họ_Tên: anonymize ? s.code : s.name,
      Lớp: s.className || s.classroomId,
      Nhóm_Nghiên_Cứu: s.group === 'intervention' ? 'Thực nghiệm (Can thiệp)' : 'Đối chứng (Tự do)',
      Năm_Học: s.schoolYear,
      Trạng_Thái: s.status,
      Ngày_Tạo: s.createdAt,
    }));
    const csvStr = arrayToCSV(data);
    downloadFile(`DanhSach_HocSinh_${Date.now()}.csv`, csvStr, 'text/csv;charset=utf-8');
    onShowToast('success', 'Đã xuất file CSV', `Đã tải xuống danh sách ${data.length} học sinh`);
  };

  // Import CSV
  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await readFileAsText(file);
      const rows = parseCSV(text);
      if (rows.length === 0) {
        onShowToast('error', 'Lỗi file', 'Không tìm thấy dữ liệu hợp lệ trong file CSV.');
        return;
      }
      rows.forEach((r, idx) => {
        const student: Student = {
          id: `std-imp-${Date.now()}-${idx}`,
          code: r['Mã_Học_Sinh'] || r['code'] || `HS11-${Math.floor(100 + Math.random() * 900)}`,
          name: r['Họ_Tên'] || r['name'] || `Học sinh ${idx + 1}`,
          classroomId: classrooms[0]?.id || 'cls-11a1',
          className: classrooms[0]?.name || '11A1',
          schoolYear: '2025-2026',
          status: 'active',
          group: r['Nhóm_Nghiên_Cứu']?.includes('Đối chứng') ? 'control' : 'intervention',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1,
        };
        StorageService.saveStudent(student);
      });
      onShowToast('success', 'Nhập thành công', `Đã nhập thêm ${rows.length} học sinh từ file CSV.`);
      onRefresh();
    } catch (err: any) {
      onShowToast('error', 'Lỗi nhập file', err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Quản Lý Lớp Học & Hồ Sơ Khách Thể Nghiên Cứu
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dữ liệu học sinh liên kết với bài học, nhiệm vụ, đề kiểm tra, và phân tích Automation Bias thực nghiệm.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center gap-1.5 shadow-2xs">
            <Upload className="w-3.5 h-3.5 text-indigo-500" />
            <span>Import CSV</span>
            <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
          </label>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setEditingClassroom(null);
              setIsClassModalOpen(true);
            }}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Lớp</span>
          </button>

          <button
            onClick={() => {
              setEditingStudent(null);
              setIsStudentModalOpen(true);
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Học Sinh</span>
          </button>
        </div>
      </div>

      {/* Classrooms Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {classrooms.map((cls) => {
          const classStudents = students.filter((s) => s.classroomId === cls.id);
          const isIntervention = classStudents.some((s) => s.group === 'intervention');
          return (
            <div
              key={cls.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-[11px] font-bold rounded-md uppercase tracking-wider ${
                        isIntervention
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {isIntervention ? 'Nhóm Thực Nghiệm (Can thiệp)' : 'Nhóm Đối Chứng'}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Khối {cls.grade}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingClassroom(cls);
                        setIsClassModalOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteTarget({
                          type: 'class',
                          id: cls.id,
                          name: cls.name,
                          count: classStudents.length,
                        })
                      }
                      className="p-1 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-2">{cls.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{cls.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>GVCN: <strong className="text-slate-800 dark:text-slate-200">{cls.teacherName}</strong></span>
                <span>Sĩ số: <strong className="text-indigo-600 dark:text-indigo-400">{classStudents.length} học sinh</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên học sinh hoặc mã HS..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filter by class */}
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium"
          >
            <option value="all">Tất cả các lớp ({students.length})</option>
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Filter by group */}
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium"
          >
            <option value="all">Tất cả nhóm nghiên cứu</option>
            <option value="intervention">Nhóm Can thiệp (Intervention)</option>
            <option value="control">Nhóm Đối chứng (Control)</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Hiển thị <strong>{filteredStudents.length}</strong> / {students.length} học sinh
        </div>
      </div>

      {/* Students Data Table */}
      <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Mã định danh</th>
              <th className="py-3 px-4">Họ và tên</th>
              <th className="py-3 px-4">Lớp</th>
              <th className="py-3 px-4">Nhóm thực nghiệm</th>
              <th className="py-3 px-4 text-center">Nhiệm vụ nộp</th>
              <th className="py-3 px-4 text-center">Kiểm chứng AI</th>
              <th className="py-3 px-4 text-center">Chỉ số ABI</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  Không tìm thấy học sinh nào phù hợp bộ lọc.
                </td>
              </tr>
            ) : (
              filteredStudents.map((s) => {
                const subCount = submissions.filter((sub) => sub.studentId === s.id).length;
                const vsubCount = verificationSubs.filter((v) => v.studentId === s.id).length;
                const post = prePost.find((p) => p.studentId === s.id && p.type === 'post_test');
                const abiScore = post ? post.automationBiasIndicator.toFixed(1) : '--';

                return (
                  <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {s.code}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {anonymize ? s.code : s.name}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{s.className || '11A1'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.group === 'intervention'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {s.group === 'intervention' ? 'Can thiệp' : 'Đối chứng'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-medium">
                      {subCount} bài
                    </td>
                    <td className="py-3 px-4 text-center font-medium">
                      {vsubCount} lần
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                      {abiScore}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setViewingProfileStudent(s);
                            setProfileActiveTab('overview');
                          }}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Xem hồ sơ chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingStudent(s);
                            setIsStudentModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Sửa thông tin"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const linked = submissions.filter((sub) => sub.studentId === s.id).length;
                            setDeleteTarget({
                              type: 'student',
                              id: s.id,
                              name: s.name,
                              count: linked,
                            });
                          }}
                          className="p-1.5 text-slate-500 hover:text-red-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Xóa học sinh"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* STUDENT PROFILE MODAL WITH TABS */}
      {viewingProfileStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                  {viewingProfileStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    {anonymize ? viewingProfileStudent.code : viewingProfileStudent.name}
                    <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                      {viewingProfileStudent.code}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Lớp {viewingProfileStudent.className} • Nhóm:{' '}
                    <strong>
                      {viewingProfileStudent.group === 'intervention' ? 'Thực nghiệm Can thiệp' : 'Đối chứng'}
                    </strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingProfileStudent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Tabs Navigation */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 gap-4 overflow-x-auto text-xs font-semibold text-slate-500">
              {[
                { key: 'overview', label: 'Tổng quan' },
                { key: 'assignments', label: 'Bài tập & Nộp bài' },
                { key: 'verifications', label: 'Kiểm chứng AI' },
                { key: 'automation-bias', label: 'Chỉ số Automation Bias' },
                { key: 'history', label: 'Lịch sử hoạt động' },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setProfileActiveTab(t.key)}
                  className={`py-3 border-b-2 transition-colors whitespace-nowrap ${
                    profileActiveTab === t.key
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Profile Tab Contents */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {profileActiveTab === 'overview' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500">Bài tập hoàn thành</span>
                      <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                        {submissions.filter((s) => s.studentId === viewingProfileStudent.id).length} bài
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500">Lượt kiểm chứng AI</span>
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-1">
                        {verificationSubs.filter((v) => v.studentId === viewingProfileStudent.id).length} lượt
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500">Điểm Pre-test</span>
                      <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1">
                        {prePost.find((p) => p.studentId === viewingProfileStudent.id && p.type === 'pre_test')?.score || '--'} / 10
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500">Điểm Post-test</span>
                      <p className="text-lg font-bold text-emerald-600 mt-1">
                        {prePost.find((p) => p.studentId === viewingProfileStudent.id && p.type === 'post_test')?.score || '--'} / 10
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Đánh giá hành vi khoa học:</h4>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      Học sinh thể hiện năng lực đối chiếu kiến thức sách giáo khoa chuẩn trước khi đưa ra quyết định. Trong nhiệm vụ Le Chatelier, học sinh đã tự phát hiện ảo giác về hằng số Kc của AI và chỉnh sửa thành công.
                    </p>
                  </div>
                </div>
              )}

              {profileActiveTab === 'assignments' && (
                <div className="space-y-3">
                  {submissions.filter((s) => s.studentId === viewingProfileStudent.id).length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">Học sinh chưa nộp bài tập nào.</div>
                  ) : (
                    submissions
                      .filter((s) => s.studentId === viewingProfileStudent.id)
                      .map((sub) => (
                        <div
                          key={sub.id}
                          className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-800/30 text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              Bài làm nộp: {new Date(sub.submittedAt).toLocaleString('vi-VN')}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold">
                              Điểm: {sub.score !== undefined ? `${sub.score}đ` : 'Chờ chấm'}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 whitespace-pre-line bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-800">
                            {sub.content}
                          </p>
                          {sub.feedback && (
                            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 italic">
                              Nhận xét của GV: {sub.feedback}
                            </p>
                          )}
                        </div>
                      ))
                  )}
                </div>
              )}

              {profileActiveTab === 'verifications' && (
                <div className="space-y-3">
                  {verificationSubs.filter((v) => v.studentId === viewingProfileStudent.id).length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">Chưa có kết quả kiểm chứng.</div>
                  ) : (
                    verificationSubs
                      .filter((v) => v.studentId === viewingProfileStudent.id)
                      .map((vsub) => (
                        <div
                          key={vsub.id}
                          className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-800/30 text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-slate-100">{vsub.taskTitle}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                vsub.isCorrectDecision
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {vsub.isCorrectDecision ? 'Kiểm chứng đúng' : 'Bị AI đánh lừa'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                            <span>Quyết định đầu: <strong>{vsub.initialDecision}</strong> ({vsub.initialDecisionDurationSec}s)</span>
                            <span>Quyết định cuối: <strong>{vsub.finalDecision}</strong> (Độ tự tin: {vsub.confidence}/5★)</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 italic bg-white dark:bg-slate-900 p-2 rounded">
                            Lý do: {vsub.reason}
                          </p>
                        </div>
                      ))
                  )}
                </div>
              )}

              {profileActiveTab === 'automation-bias' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">Chỉ số Thiên lệch Tự động hóa (ABI):</h4>
                    <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
                      {prePost.find((p) => p.studentId === viewingProfileStudent.id && p.type === 'post_test')?.automationBiasIndicator.toFixed(1) || 'Chưa đo'} / 100
                    </p>
                    <p className="text-slate-500 mt-1">
                      Đo lường mức độ cảnh giác và khả năng phát hiện ảo giác AI sau các bài thực nghiệm can thiệp.
                    </p>
                  </div>
                </div>
              )}

              {profileActiveTab === 'history' && (
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="p-2.5 border-l-2 border-indigo-500 bg-slate-50 dark:bg-slate-800/30 rounded-r">
                    <span className="text-[10px] text-slate-400">{new Date(viewingProfileStudent.createdAt).toLocaleString('vi-VN')}</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Khởi tạo hồ sơ học sinh và gán vào nhóm {viewingProfileStudent.group}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT STUDENT MODAL */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
              {editingStudent ? 'Chỉnh sửa thông tin học sinh' : 'Thêm học sinh mới vào hệ thống'}
            </h3>
            <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Mã học sinh</label>
                <input
                  name="code"
                  type="text"
                  required
                  defaultValue={editingStudent?.code || `HS11-${Math.floor(100 + Math.random() * 900)}`}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Họ và tên</label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={editingStudent?.name || ''}
                  placeholder="Vd: Nguyễn Minh Khôi"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Lớp học</label>
                <select
                  name="classroomId"
                  required
                  defaultValue={editingStudent?.classroomId || classrooms[0]?.id}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                >
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nhóm thực nghiệm nghiên cứu</label>
                <select
                  name="group"
                  defaultValue={editingStudent?.group || 'intervention'}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                >
                  <option value="intervention">Nhóm Can thiệp (Được dùng Verification Trainer)</option>
                  <option value="control">Nhóm Đối chứng (Dùng AI tự do)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Năm học</label>
                <input
                  name="schoolYear"
                  type="text"
                  defaultValue={editingStudent?.schoolYear || '2025-2026'}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Lưu học sinh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT CLASSROOM MODAL */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
              {editingClassroom ? 'Sửa thông tin lớp học' : 'Thêm lớp học mới'}
            </h3>
            <form onSubmit={handleSaveClassroom} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Tên lớp học</label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={editingClassroom?.name || ''}
                  placeholder="Vd: 11A3 (Khoa học Tự nhiên)"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Khối lớp</label>
                <input
                  name="grade"
                  type="number"
                  defaultValue={editingClassroom?.grade || 11}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Giáo viên chủ nhiệm</label>
                <input
                  name="teacherName"
                  type="text"
                  required
                  defaultValue={editingClassroom?.teacherName || 'ThS. Trần Thị Kim Oanh'}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Mô tả / Mục đích lớp học</label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editingClassroom?.description || ''}
                  placeholder="Vd: Lớp thử nghiệm can thiệp công cụ rèn luyện kiểm chứng"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Lưu lớp học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.type === 'student' ? 'Xác nhận xóa học sinh' : 'Xác nhận xóa lớp học'}
        message={`Bạn có chắc chắn muốn xóa "${deleteTarget?.name}"? Thao tác này sẽ ghi nhận vào Audit Log.`}
        linkedCount={deleteTarget?.count || 0}
        linkedWarning={
          deleteTarget?.type === 'student'
            ? `Học sinh này đang có ${deleteTarget?.count} bài nộp hoặc lượt kiểm chứng liên kết.`
            : `Lớp này hiện có ${deleteTarget?.count} học sinh đang theo học.`
        }
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
