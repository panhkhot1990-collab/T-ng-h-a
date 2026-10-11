import React, { useState } from 'react';
import {
  TestTube2,
  Users,
  Settings2,
  Play,
  Download,
  AlertCircle,
  CheckCircle2,
  BarChart2,
  TrendingDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { VerificationTask, VerificationSubmission, Student, Role, AppSettings } from '../../types';
import { StorageService } from '../../services/storage';
import { calculateAutomationBiasIndicator } from '../../utils/stats';
import { arrayToCSV, downloadFile } from '../../utils/exportImport';

interface AutomationBiasLabViewProps {
  currentRole: Role;
  tasks: VerificationTask[];
  submissions: VerificationSubmission[];
  students: Student[];
  settings: AppSettings;
  anonymize: boolean;
  onRefresh: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const AutomationBiasLabView: React.FC<AutomationBiasLabViewProps> = ({
  currentRole,
  tasks,
  submissions,
  students,
  settings,
  anonymize,
  onRefresh,
  onShowToast,
}) => {
  const [selectedCondition, setSelectedCondition] = useState<'all' | 'control' | 'intervention'>('all');

  // Filtered submissions
  const filteredSubs = submissions.filter((s) => {
    if (selectedCondition === 'all') return true;
    return s.condition === selectedCondition;
  });

  const controlSubs = submissions.filter((s) => s.condition === 'control');
  const interventionSubs = submissions.filter((s) => s.condition === 'intervention');

  // Calculate ABI for both groups
  const controlMetrics = calculateAutomationBiasIndicator(controlSubs, settings.biasFormula);
  const interventionMetrics = calculateAutomationBiasIndicator(interventionSubs, settings.biasFormula);

  // Export Experiment Dataset
  const handleExportExperimentCSV = () => {
    const data = submissions.map((s) => {
      const student = students.find((std) => std.id === s.studentId);
      return {
        Submission_ID: s.id,
        Participant_ID: anonymize ? (student?.code || s.studentId) : s.studentName,
        Experimental_Condition: s.condition === 'intervention' ? 'Condition B (Intervention)' : 'Condition A (Control)',
        Task_Title: s.taskTitle,
        Initial_Decision: s.initialDecision,
        Initial_Decision_Duration_Sec: s.initialDecisionDurationSec,
        Verification_Duration_Sec: s.verificationDurationSec,
        Evidence_Cited: s.selectedEvidence ? 'YES' : 'NO',
        Edit_Count: s.editCount,
        Final_Decision: s.finalDecision,
        Confidence_Level: s.confidence,
        Is_AI_Error_Accepted: s.isAiErrorAccepted ? 'YES (BIASED)' : 'NO (UNBIASED)',
        Is_Correct_Decision: s.isCorrectDecision ? 'CORRECT' : 'INCORRECT',
        Timestamp: s.submittedAt,
      };
    });

    const csv = arrayToCSV(data);
    downloadFile(`AutomationBias_Experiment_Dataset_${Date.now()}.csv`, csv, 'text/csv;charset=utf-8');
    onShowToast('success', 'Xuất dữ liệu', `Đã xuất ${data.length} dòng dữ liệu thực nghiệm.`);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <TestTube2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Phòng Thực Nghiệm Automation Bias (A/B Testing Lab)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Thiết kế nghiên cứu thực nghiệm: Điều kiện A (Đối chứng: Dùng AI không gợi ý) đối chiếu với Điều kiện B (Can thiệp: Công cụ tương tác kiểm chứng).
          </p>
        </div>

        <button
          onClick={handleExportExperimentCSV}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Xuất Dataset Thực Nghiệm (CSV)</span>
        </button>
      </div>

      {/* Experimental Design Matrix Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CONDITION A */}
        <div className="p-5 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
              CONDITION A — NHÓM ĐỐI CHỨNG
            </span>
            <span className="text-xs font-mono font-bold text-amber-700">{controlSubs.length} lượt thực nghiệm</span>
          </div>

          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
            Tương tác AI tự do (Không có công cụ can thiệp)
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Học sinh đọc câu trả lời do AI tạo sinh và đưa ra quyết định mà không nhận được bất kỳ gợi ý phản biện hay công cụ tra cứu đối chiếu nào.
          </p>

          <div className="pt-2 border-t border-amber-200 dark:border-amber-800/40 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Chỉ số Automation Bias:</span>
              <strong className="text-lg font-black text-rose-600">{controlMetrics.abi} / 100</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Tỷ lệ tin theo lỗi AI:</span>
              <strong className="text-lg font-black text-rose-600">{controlMetrics.errorAcceptanceRatePct}%</strong>
            </div>
          </div>
        </div>

        {/* CONDITION B */}
        <div className="p-5 rounded-xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/40 dark:bg-purple-950/20 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-200 text-purple-900 dark:bg-purple-900/60 dark:text-purple-200">
              CONDITION B — NHÓM THỰC NGHIỆM CAN THIỆP
            </span>
            <span className="text-xs font-mono font-bold text-purple-700">{interventionSubs.length} lượt thực nghiệm</span>
          </div>

          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
            Quy trình tương tác rèn luyện kiểm chứng (Verification Trainer)
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Học sinh được trang bị công cụ kiểm chứng 7 bước: đọc bẫy lỗi, dự đoán, đối chiếu học liệu SGK chuẩn, chỉnh sửa câu trả lời và tự đánh giá.
          </p>

          <div className="pt-2 border-t border-purple-200 dark:border-purple-800/40 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Chỉ số Automation Bias:</span>
              <strong className="text-lg font-black text-emerald-600">{interventionMetrics.abi} / 100</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Tỷ lệ tin theo lỗi AI:</span>
              <strong className="text-lg font-black text-emerald-600">{interventionMetrics.errorAcceptanceRatePct}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Submissions Log */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs">
          <span className="font-bold text-slate-600 dark:text-slate-400">Lọc theo điều kiện:</span>
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-800 dark:text-slate-200"
          >
            <option value="all">Tất cả điều kiện ({submissions.length})</option>
            <option value="control">Chỉ xem Điều kiện A (Đối chứng)</option>
            <option value="intervention">Chỉ xem Điều kiện B (Can thiệp)</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-mono">
          Công thức: {settings.biasFormula.formulaName}
        </span>
      </div>

      {/* Raw Trial Records Table */}
      <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Thí sinh</th>
              <th className="py-3 px-4">Điều kiện</th>
              <th className="py-3 px-4">Nhiệm vụ</th>
              <th className="py-3 px-4 text-center">Quyết định đầu</th>
              <th className="py-3 px-4 text-center">Độ trễ đầu</th>
              <th className="py-3 px-4 text-center">Tổng thời gian</th>
              <th className="py-3 px-4 text-center">Quyết định cuối</th>
              <th className="py-3 px-4 text-center">Tự tin</th>
              <th className="py-3 px-4 text-center">Hành vi Bias</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredSubs.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                  {anonymize ? s.studentId : s.studentName}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.condition === 'intervention'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {s.condition === 'intervention' ? 'Condition B (Can thiệp)' : 'Condition A (Đối chứng)'}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                  {s.taskTitle}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="font-mono">{s.initialDecision}</span>
                </td>
                <td className="py-3 px-4 text-center font-mono">{s.initialDecisionDurationSec}s</td>
                <td className="py-3 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                  {s.verificationDurationSec}s
                </td>
                <td className="py-3 px-4 text-center font-bold">
                  {s.finalDecision}
                </td>
                <td className="py-3 px-4 text-center font-mono">{s.confidence}/5★</td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      s.isAiErrorAccepted
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    }`}
                  >
                    {s.isAiErrorAccepted ? 'BỊ THIÊN LỆCH (BIASED)' : 'KIỂM CHỨNG TỐT'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
