import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Users,
  GraduationCap,
  FolderArchive,
  BookOpen,
  ClipboardList,
  FileSpreadsheet,
  FileText,
  Sparkles,
  HelpCircle,
  FileCheck2,
  FlaskConical,
  TestTube2,
  Workflow,
  BarChart3,
  BookMarked,
  Bot,
  Terminal,
  Database,
  Sliders,
  X,
  History,
} from 'lucide-react';
import { Role } from '../../types';

export type NavItemKey =
  | 'dashboard'
  | 'learning-hub'
  | 'classrooms'
  | 'students'
  | 'materials'
  | 'lessons'
  | 'assignments'
  | 'tests'
  | 'matrix'
  | 'specs'
  | 'test-builder'
  | 'test-taking'
  | 'ai-verification'
  | 'automation-bias'
  | 'verification-trainer'
  | 'pre-post'
  | 'research-dashboard'
  | 'research-notebook'
  | 'ai-assistant'
  | 'prompts'
  | 'data-vault'
  | 'audit-log'
  | 'settings';

interface SidebarProps {
  currentTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  currentRole: Role;
  isOpen: boolean;
  onClose: () => void;
}

interface SidebarItem {
  key: NavItemKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  teacherOnly?: boolean;
}

interface SidebarSection {
  title: string;
  teacherOnly?: boolean;
  items: SidebarItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentRole,
  isOpen,
  onClose,
}) => {
  const sections: SidebarSection[] = [
    {
      title: 'TỔNG QUAN',
      items: [
        { key: 'dashboard', label: 'Trang chủ (Dashboard)', icon: LayoutDashboard },
        { key: 'learning-hub', label: 'Gốc học tập (Learning Hub)', icon: Compass },
      ],
    },
    {
      title: 'QUẢN LÝ DẠY & HỌC',
      items: [
        { key: 'classrooms', label: 'Lớp học', icon: Users, teacherOnly: true },
        { key: 'students', label: 'Hồ sơ học sinh', icon: GraduationCap, teacherOnly: true },
        { key: 'materials', label: 'Kho học liệu & Tải lên', icon: FolderArchive },
        { key: 'lessons', label: 'Bài học', icon: BookOpen },
        { key: 'assignments', label: 'Nhiệm vụ & Bài tập', icon: ClipboardList },
        { key: 'test-taking', label: 'Làm bài kiểm tra', icon: FileCheck2 },
      ],
    },
    {
      title: 'KIỂM TRA & ĐẶC TẢ',
      teacherOnly: true,
      items: [
        { key: 'tests', label: 'Đề kiểm tra', icon: FileCheck2 },
        { key: 'matrix', label: 'Ma trận đề kiểm tra', icon: FileSpreadsheet },
        { key: 'specs', label: 'Bản đặc tả đề', icon: FileText },
        { key: 'test-builder', label: 'AI Test Builder & Ngân hàng', icon: Sparkles },
      ],
    },
    {
      title: 'NGHIÊN CỨU AUTOMATION BIAS',
      items: [
        { key: 'ai-verification', label: 'Phòng kiểm chứng AI', icon: FlaskConical },
        { key: 'automation-bias', label: 'Thực nghiệm Automation Bias', icon: TestTube2, teacherOnly: true },
        { key: 'verification-trainer', label: 'Công cụ can thiệp (Trainer)', icon: Workflow },
        { key: 'pre-post', label: 'Đánh giá Pre/Post Test', icon: BarChart3, teacherOnly: true },
        { key: 'research-dashboard', label: 'Dashboard nghiên cứu', icon: BarChart3, teacherOnly: true },
        { key: 'research-notebook', label: 'Sổ tay nghiên cứu', icon: BookMarked, teacherOnly: true },
      ],
    },
    {
      title: 'CÔNG CỤ & DỮ LIỆU',
      items: [
        { key: 'ai-assistant', label: 'Trợ lý phản biện AI', icon: Bot },
        { key: 'prompts', label: 'Thư viện Prompt AI', icon: Terminal, teacherOnly: true },
        { key: 'data-vault', label: 'Két dữ liệu & Sao lưu', icon: Database, teacherOnly: true },
        { key: 'audit-log', label: 'Nhật ký Audit Log', icon: History, teacherOnly: true },
        { key: 'settings', label: 'Cài đặt hệ thống', icon: Sliders },
      ],
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-2xs transition-opacity"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-base shadow-md">
              AB
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block leading-tight">
                AutoBias<span className="text-indigo-400">Ed</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider block">
                RESEARCH v1.0
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
          {sections.map((section, sIdx) => {
            if (section.teacherOnly && currentRole !== 'teacher') return null;
            const visibleItems = section.items.filter((item) => !item.teacherOnly || currentRole === 'teacher');
            if (visibleItems.length === 0) return null;

            return (
              <div key={sIdx}>
                <div className="px-3 mb-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  {section.title}
                </div>
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => {
                          onSelectTab(item.key as NavItemKey);
                          if (window.innerWidth < 768) onClose();
                        }}
                        className={`flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium rounded-lg transition-all text-left group ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-300'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Role footer badge */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-slate-800/60 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                currentRole === 'teacher' ? 'bg-indigo-400' : 'bg-emerald-400'
              }`}
            />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 block leading-tight">Vai trò hoạt động</span>
              <span className="font-semibold text-slate-200">
                {currentRole === 'teacher' ? 'Giáo viên / Nghiên cứu' : 'Học sinh THPT'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
