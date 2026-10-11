import React from 'react';
import {
  Search,
  UserCheck,
  GraduationCap,
  ShieldCheck,
  Moon,
  Sun,
  Download,
  Menu,
} from 'lucide-react';
import { Role, Student } from '../../types';

interface HeaderProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  students: Student[];
  activeStudentId: string;
  onSelectActiveStudent: (id: string) => void;
  anonymize: boolean;
  onAnonymizeToggle: () => void;
  darkMode: boolean;
  onThemeToggle: () => void;
  onOpenCommand: () => void;
  onQuickExport: () => void;
  onToggleSidebar: () => void;
  lastSavedText: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  students,
  activeStudentId,
  onSelectActiveStudent,
  anonymize,
  onAnonymizeToggle,
  darkMode,
  onThemeToggle,
  onOpenCommand,
  onQuickExport,
  onToggleSidebar,
  lastSavedText,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Left section: Hamburger & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 md:hidden"
          title="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={onOpenCommand}
          className="flex items-center gap-2.5 w-full max-w-md px-3.5 py-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 rounded-lg border border-slate-200 dark:border-slate-700/70 transition-all text-left shadow-2xs group"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
          <span className="flex-1 font-medium">Bạn muốn tìm gì hoặc làm gì?</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-2xs">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Right section: Auto-save status, Role switcher, Anonymize toggle, Quick Export, Theme */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Autosave status indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{lastSavedText}</span>
        </div>

        {/* Anonymization Toggle */}
        <button
          onClick={onAnonymizeToggle}
          title={anonymize ? 'Đang ẩn danh dữ liệu (Chuẩn đạo đức nghiên cứu: HS11-xxx)' : 'Đang hiện họ tên học sinh thật'}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            anonymize
              ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300'
              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{anonymize ? 'Ẩn danh: BẬT' : 'Ẩn danh: TẮT'}</span>
        </button>

        {/* Student Selector when in student role */}
        {currentRole === 'student' && (
          <div className="hidden md:flex items-center gap-1.5 text-xs bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/60">
            <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold whitespace-nowrap">
              Đóng vai:
            </span>
            <select
              value={activeStudentId}
              onChange={(e) => onSelectActiveStudent(e.target.value)}
              className="bg-transparent text-emerald-900 dark:text-emerald-200 font-bold focus:outline-hidden text-xs cursor-pointer"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id} className="text-slate-800 bg-white">
                  {anonymize ? s.code : s.name} ({s.group === 'intervention' ? 'Can thiệp' : 'Đối chứng'})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Role Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
          <button
            onClick={() => onRoleChange('teacher')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
              currentRole === 'teacher'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nghiên cứu viên / GV</span>
          </button>
          <button
            onClick={() => onRoleChange('student')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
              currentRole === 'student'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Học sinh</span>
          </button>
        </div>

        {/* Quick Export CSV */}
        <button
          onClick={onQuickExport}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          title="Xuất nhanh tập dữ liệu nghiên cứu (CSV)"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={onThemeToggle}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          title={darkMode ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </header>
  );
};
