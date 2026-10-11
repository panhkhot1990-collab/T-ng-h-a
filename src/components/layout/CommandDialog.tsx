import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Sparkles,
  FileCheck2,
  FileSpreadsheet,
  FlaskConical,
  Download,
  Users,
  FolderArchive,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { NavItemKey } from './Sidebar';

interface CommandDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavItemKey) => void;
  onAction?: (actionId: string) => void;
}

export const CommandDialog: React.FC<CommandDialogProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onAction,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onAction?.('open-command');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onAction]);

  if (!isOpen) return null;

  const quickActions = [
    { id: 'tests', label: 'Quản lý Đề kiểm tra & Khảo thí chuẩn hóa (Kiểm tra & Đặc tả)', icon: FileCheck2, tab: 'tests' },
    { id: 'matrix', label: 'Xem & Tạo Ma trận đề kiểm tra', icon: FileSpreadsheet, tab: 'matrix' },
    { id: 'specs', label: 'Xem & Quản lý Bản đặc tả đề kiểm tra GDPT 2018', icon: FileSpreadsheet, tab: 'specs' },
    { id: 'test-builder', label: 'Tạo đề kiểm tra Hóa 11 bằng AI Test Builder', icon: Sparkles, tab: 'test-builder' },
    { id: 'ai-verification', label: 'Mở Phòng kiểm chứng nội dung AI (Verification Lab)', icon: FlaskConical, tab: 'ai-verification' },
    { id: 'verification-trainer', label: 'Thực hiện quy trình 7 bước rèn luyện can thiệp', icon: FlaskConical, tab: 'verification-trainer' },
    { id: 'materials', label: 'Tải lên & quản lý tài liệu học tập', icon: FolderArchive, tab: 'materials' },
    { id: 'students', label: 'Tra cứu danh sách học sinh & nhóm nghiên cứu', icon: Users, tab: 'students' },
    { id: 'research-dashboard', label: 'Xem thống kê chỉ số Automation Bias & Pre/Post', icon: Download, tab: 'research-dashboard' },
    { id: 'data-vault', label: 'Két dữ liệu: Sao lưu & Khôi phục toàn bộ hệ thống', icon: Download, tab: 'data-vault' },
  ];

  const filtered = quickActions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-indigo-500 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Bạn muốn làm gì? (Vd: Tạo đề, Ma trận, Kiểm chứng, Học sinh, Sao lưu...)"
            className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Lối tắt hành động nhanh
          </div>
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              Không tìm thấy lệnh hoặc học liệu nào khớp với "{query}".
            </div>
          ) : (
            filtered.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => {
                    onNavigate(action.tab as NavItemKey);
                    onClose();
                  }}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg group transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium">{action.label}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex justify-between">
          <span>Dùng phím mũi tên và Enter để chọn</span>
          <span>Esc để đóng</span>
        </div>
      </div>
    </div>
  );
};
