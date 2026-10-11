import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  ShieldCheck,
  Clock,
  UserCheck,
} from 'lucide-react';
import { AuditLogEntry, Role } from '../../types';
import { arrayToCSV, downloadFile } from '../../utils/exportImport';

interface AuditLogViewProps {
  currentRole: Role;
  logs: AuditLogEntry[];
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ currentRole, logs, onShowToast }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');

  const actionTypes = Array.from(new Set(logs.map((l) => l.action)));

  const filteredLogs = logs.filter((l) => {
    const matchAction = selectedAction === 'all' || l.action === selectedAction;
    const matchQuery =
      l.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.action.toLowerCase().includes(searchQuery.toLowerCase());
    return matchAction && matchQuery;
  });

  const handleExportCSV = () => {
    const data = filteredLogs.map((l) => ({
      Mã_Log: l.id,
      Người_Thực_Hiện: l.user,
      Vai_Trò: l.role,
      Hành_Động: l.action,
      Đối_Tượng: l.objectType,
      Mã_Đối_Tượng: l.objectId,
      Chi_Tiết: l.details,
      Thời_Điểm: l.timestamp,
    }));
    const csv = arrayToCSV(data);
    downloadFile(`Audit_Log_${Date.now()}.csv`, csv, 'text/csv;charset=utf-8');
    onShowToast('success', 'Xuất file CSV', 'Đã tải nhật ký hệ thống.');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <History className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Nhật Ký Hệ Thống & Kiểm Toán Dữ Liệu (Audit Log)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ghi nhận bất biến mọi thao tác tạo, sửa, xóa, nộp bài, kiểm chứng và sao lưu để đảm bảo tính minh bạch nghiên cứu.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Xuất Nhật Ký (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo người thực hiện, hành động hoặc chi tiết..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-lg"
            />
          </div>

          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-lg font-medium"
          >
            <option value="all">Tất cả hành động ({logs.length})</option>
            {actionTypes.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>

        <span className="text-slate-500 font-mono">
          Hiển thị <strong>{filteredLogs.length}</strong> bản ghi
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Thời gian</th>
              <th className="py-3 px-4">Người thực hiện</th>
              <th className="py-3 px-4">Hành động</th>
              <th className="py-3 px-4">Đối tượng</th>
              <th className="py-3 px-4">Chi tiết thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap text-[11px]">
                  {new Date(log.timestamp).toLocaleString('vi-VN')}
                </td>
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    {log.user}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {log.action}
                  </span>
                </td>
                <td className="py-3 px-4 font-medium text-indigo-600 dark:text-indigo-400">
                  {log.objectType}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
