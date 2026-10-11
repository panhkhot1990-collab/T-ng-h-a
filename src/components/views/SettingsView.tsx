import React, { useState } from 'react';
import {
  Sliders,
  ShieldCheck,
  Cpu,
  Save,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { AppSettings, Role } from '../../types';
import { StorageService, DEFAULT_SETTINGS } from '../../services/storage';

interface SettingsViewProps {
  currentRole: Role;
  settings: AppSettings;
  onRefresh: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentRole,
  settings,
  onRefresh,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSettings(formData);
    onShowToast('success', 'Đã lưu cài đặt', 'Công thức Automation Bias và thiết lập hệ thống đã được cập nhật.');
    onRefresh();
  };

  const handleResetFormula = () => {
    setFormData({
      ...formData,
      biasFormula: DEFAULT_SETTINGS.biasFormula,
    });
    onShowToast('info', 'Đã đặt lại', 'Đã đưa công thức về trọng số chuẩn (0.5 - 0.3 - 0.2).');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Cài Đặt Hệ Thống & Cấu Hình Công Thức Automation Bias
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Không hard-code công thức tính thiên lệch; cấu hình trọng số khoa học, quyền ẩn danh và mô hình AI.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-sm"
        >
          <Save className="w-4 h-4" />
          <span>Lưu Cấu Hình</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* SECTION 1: CÔNG THỨC AUTOMATION BIAS */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Cấu Hình Công Thức Đo Lường Chỉ Số Automation Bias (ABI)
              </h3>
              <p className="text-slate-500 mt-0.5">
                Các trọng số ảnh hưởng trực tiếp đến kết quả tính toán trên dashboard và phân tích Pre/Post.
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetFormula}
              className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Đặt lại công thức chuẩn
            </button>
          </div>

          <div>
            <label className="font-semibold block mb-1">Tên công thức / Tiêu chuẩn đo lường</label>
            <input
              type="text"
              value={formData.biasFormula.formulaName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  biasFormula: { ...formData.biasFormula, formulaName: e.target.value },
                })
              }
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-medium"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Mô tả công thức toán học</label>
            <textarea
              rows={2}
              value={formData.biasFormula.formulaDescription}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  biasFormula: { ...formData.biasFormula, formulaDescription: e.target.value },
                })
              }
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono text-[11px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border">
              <label className="font-semibold block mb-1">
                Trọng số Chấp nhận lỗi AI (W1):
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={formData.biasFormula.errorAcceptanceWeight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    biasFormula: {
                      ...formData.biasFormula,
                      errorAcceptanceWeight: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border rounded font-bold text-indigo-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Hiện tại: {formData.biasFormula.errorAcceptanceWeight * 100}%</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border">
              <label className="font-semibold block mb-1">
                Trọng số Không kiểm chứng (W2):
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={formData.biasFormula.nonVerificationWeight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    biasFormula: {
                      ...formData.biasFormula,
                      nonVerificationWeight: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border rounded font-bold text-indigo-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Hiện tại: {formData.biasFormula.nonVerificationWeight * 100}%</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border">
              <label className="font-semibold block mb-1">
                Trọng số Mức tự tin khi sai (W3):
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={formData.biasFormula.confidenceWeight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    biasFormula: {
                      ...formData.biasFormula,
                      confidenceWeight: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border rounded font-bold text-indigo-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Hiện tại: {formData.biasFormula.confidenceWeight * 100}%</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg text-amber-800 dark:text-amber-300">
            <span className="font-bold">⚠️ Quy tắc khoa học: </span>
            Chỉ số ABI phản ánh <em>hành vi quan sát được trong nhiệm vụ thực nghiệm cụ thể</em>. Tuyệt đối không quy kết đây là năng lực hay phẩm chất trí tuệ cố định của người học.
          </div>
        </div>

        {/* SECTION 2: AI PROVIDER & MODEL */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600" />
            Cấu Hình Mô Hình AI (AI Model Configuration)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block mb-1">Mô hình AI chỉ định</label>
              <input
                type="text"
                value={formData.aiModel}
                onChange={(e) => setFormData({ ...formData, aiModel: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono font-medium"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Mặc định: gemini-3.8-flash (Chạy qua proxy máy chủ server.ts)
              </span>
            </div>

            <div>
              <label className="font-semibold block mb-1">Độ sáng tạo (Temperature: 0.0 - 1.0)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-medium"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                0.7 cho câu hỏi đa dạng và bẫy lỗi tự nhiên
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 3: PRIVACY & RESEARCH ETHICS */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Bảo Mật Dữ Liệu & Đạo Đức Nghiên Cứu Giáo Dục
          </h3>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border">
            <div>
              <strong className="block text-slate-800 dark:text-slate-200">
                Ẩn danh hóa dữ liệu khách thể (Anonymize Data)
              </strong>
              <p className="text-slate-500 mt-0.5">
                Khi kích hoạt, họ tên học sinh sẽ được thay bằng mã nghiên cứu (vd: HS11-001) trong các bảng phân tích và tệp xuất CSV/JSON.
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.anonymizeData}
              onChange={(e) => setFormData({ ...formData, anonymizeData: e.target.checked })}
              className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>
        </div>
      </form>
    </div>
  );
};
