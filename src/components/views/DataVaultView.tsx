import React, { useState } from 'react';
import {
  Database,
  Download,
  Upload,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ShieldAlert,
  FileCheck,
  Layers,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { downloadFile, readFileAsText } from '../../utils/exportImport';
import { ConfirmModal } from '../common/ConfirmModal';

interface DataVaultViewProps {
  onRefresh: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const DataVaultView: React.FC<DataVaultViewProps> = ({ onRefresh, onShowToast }) => {
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [isWipeModalOpen, setIsWipeModalOpen] = useState(false);
  const [isBackupFirstDone, setIsBackupFirstDone] = useState(false);

  // Export Full JSON
  const handleExportJSON = () => {
    const jsonStr = StorageService.exportFullBackupJSON();
    downloadFile(`AutoBiasEd_Backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`, jsonStr, 'application/json');
    setIsBackupFirstDone(true);
    onShowToast('success', 'Sao lưu thành công', 'Đã tải tệp cơ sở dữ liệu JSON toàn diện.');
  };

  // Import JSON
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await readFileAsText(file);
      const res = StorageService.importFullBackupJSON(text, importMode);
      if (res.success) {
        onShowToast('success', 'Khôi phục thành công', res.message);
        onRefresh();
      } else {
        onShowToast('error', 'Lỗi khôi phục', res.message);
      }
    } catch (err: any) {
      onShowToast('error', 'Lỗi đọc tệp', err.message);
    }
  };

  // Wipe Data
  const handleConfirmWipe = () => {
    StorageService.resetAllData();
    setIsWipeModalOpen(false);
    onShowToast('info', 'Đã đặt lại', 'Hệ thống đã được thiết lập lại về bộ dữ liệu nghiên cứu chuẩn ban đầu.');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Database className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Két Dữ Liệu Toàn Hệ Thống (Data Vault & Backup/Restore)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Sao lưu, phục hồi toàn bộ cơ sở dữ liệu nghiên cứu, học liệu, học sinh, đề kiểm tra và nhật ký thực nghiệm.
          </p>
        </div>

        <button
          onClick={handleExportJSON}
          className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2 shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Sao Lưu Toàn Bộ Hệ Thống (JSON)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* EXPORT BACKUP CARD */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
            <Download className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Xuất & Tải Tệp Sao Lưu Dự Phòng</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Tạo bản snapshot đầy đủ gồm: Khách thể nghiên cứu, kết quả làm bài, toàn bộ lượt thực nghiệm kiểm chứng, ma trận, bản đặc tả và audit log.
            </p>
          </div>

          <button
            onClick={handleExportJSON}
            className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Tải tệp sao lưu .json</span>
          </button>
        </div>

        {/* IMPORT RESTORE CARD */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
            <Upload className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Khôi Phục & Nạp Dữ Liệu Từ JSON</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Khôi phục lại hệ thống trên thiết bị mới hoặc nhập dữ liệu thu thập từ các phiên thực nghiệm khác.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <label className="font-semibold text-slate-600">Chế độ nạp:</label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="mode"
                checked={importMode === 'replace'}
                onChange={() => setImportMode('replace')}
              />
              <span>Thay thế toàn bộ</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="mode"
                checked={importMode === 'merge'}
                onChange={() => setImportMode('merge')}
              />
              <span>Hợp nhất (Merge)</span>
            </label>
          </div>

          <label className="w-full py-2.5 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Chọn tệp .json để khôi phục</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>
        </div>
      </div>

      {/* DANGER ZONE: RESET / WIPE DATA */}
      <div className="p-6 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 space-y-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">
              Vùng An Toàn & Thiết Lập Lại Hệ Thống (Danger Zone)
            </h3>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 leading-relaxed">
              Để bảo vệ tính toàn vẹn của dữ liệu khoa học, hệ thống yêu cầu bạn phải tải bản sao lưu dự phòng trước khi thực hiện reset về trạng thái dữ liệu mẫu ban đầu.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsWipeModalOpen(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Đặt Lại Về Dữ Liệu Mẫu Ban Đầu</span>
          </button>

          {!isBackupFirstDone && (
            <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
              * Khuyến cáo: Hãy nhấp "Sao Lưu Toàn Bộ" trước khi đặt lại.
            </span>
          )}
        </div>
      </div>

      {/* CONFIRM RESET MODAL */}
      <ConfirmModal
        isOpen={isWipeModalOpen}
        title="Xác nhận đặt lại toàn bộ hệ thống"
        message="Hành động này sẽ xóa các bản ghi bạn vừa tạo và đưa hệ sinh thái về bộ dữ liệu mẫu nghiên cứu Hóa học 11 ban đầu. Thao tác này KHÔNG THỂ đảo ngược nếu bạn chưa sao lưu."
        confirmText="Tôi hiểu, hãy đặt lại dữ liệu"
        cancelText="Hủy bỏ"
        onConfirm={handleConfirmWipe}
        onCancel={() => setIsWipeModalOpen(false)}
      />
    </div>
  );
};
