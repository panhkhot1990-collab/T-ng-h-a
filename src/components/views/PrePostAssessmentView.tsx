import React, { useState } from 'react';
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  Download,
  Users,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { PrePostAssessment, Student, Role } from '../../types';
import { calculateMean, comparePrePost } from '../../utils/stats';
import { arrayToCSV, downloadFile } from '../../utils/exportImport';

interface PrePostAssessmentViewProps {
  currentRole: Role;
  prePost: PrePostAssessment[];
  students: Student[];
  anonymize: boolean;
  onRefresh: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const PrePostAssessmentView: React.FC<PrePostAssessmentViewProps> = ({
  currentRole,
  prePost,
  students,
  anonymize,
  onRefresh,
  onShowToast,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<'all' | 'intervention' | 'control'>('all');

  const filteredAssessments = prePost.filter((p) => {
    if (selectedGroup === 'all') return true;
    return p.group === selectedGroup;
  });

  const preList = filteredAssessments.filter((p) => p.type === 'pre_test');
  const postList = filteredAssessments.filter((p) => p.type === 'post_test');

  const comparison = comparePrePost(preList, postList);

  // Export CSV
  const handleExportCSV = () => {
    const data = filteredAssessments.map((p) => ({
      ID: p.id,
      Mã_Khách_Thể: anonymize ? p.studentId : p.studentName,
      Thời_Điểm: p.type === 'pre_test' ? 'Trước can thiệp (Pre-test)' : 'Sau can thiệp (Post-test)',
      Nhóm: p.group === 'intervention' ? 'Thực nghiệm Can thiệp' : 'Đối chứng Tự do',
      Điểm_Kiểm_Tra: p.score,
      Thang_Điểm: p.maxScore,
      Độ_Chính_Xác_Kiểm_Chứng_Pct: p.verificationAccuracyPct,
      Tỷ_Lệ_Chấp_Nhận_Lỗi_AI_Pct: p.aiErrorAcceptanceRatePct,
      Chỉ_Số_Automation_Bias_ABI: p.automationBiasIndicator,
      Thời_Gian_Ghi_Nhận: p.timestamp,
    }));
    const csv = arrayToCSV(data);
    downloadFile(`PrePost_Evaluation_Dataset_${Date.now()}.csv`, csv, 'text/csv;charset=utf-8');
    onShowToast('success', 'Xuất file CSV', `Đã xuất ${data.length} dòng dữ liệu Pre/Post.`);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Đánh Giá Trước & Sau Can Thiệp (Pre-test → Post-test)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            So sánh định lượng các chỉ số học tập, độ chính xác kiểm chứng và sự suy giảm của chỉ số Automation Bias.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value as any)}
            className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border rounded-lg text-slate-800 dark:text-slate-200 font-medium"
          >
            <option value="all">Tất cả các nhóm nghiên cứu</option>
            <option value="intervention">Chỉ xem Nhóm Thực nghiệm Can thiệp</option>
            <option value="control">Chỉ xem Nhóm Đối chứng</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      {/* Comparative Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ABI DELTA */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold">Chỉ số Automation Bias (ABI)</span>
            <TrendingDown className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-3 pt-1">
            <span className="text-slate-400 text-sm font-semibold">Pre: {comparison.preStats.abi.mean}</span>
            <ArrowRight className="w-4 h-4 text-slate-300" />
            <span className="text-2xl font-black text-emerald-600">Post: {comparison.postStats.abi.mean}</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold pt-1">
            Biến thiên: {comparison.deltaABI > 0 ? `+${comparison.deltaABI}` : comparison.deltaABI} điểm (Giảm thiên lệch)
          </p>
        </div>

        {/* ACCURACY DELTA */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold">Độ chính xác kiểm chứng AI</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-3 pt-1">
            <span className="text-slate-400 text-sm font-semibold">Pre: {comparison.preStats.accuracy.mean}%</span>
            <ArrowRight className="w-4 h-4 text-slate-300" />
            <span className="text-2xl font-black text-indigo-600">Post: {comparison.postStats.accuracy.mean}%</span>
          </div>
          <p className="text-[11px] text-indigo-600 font-semibold pt-1">
            Biến thiên: +{comparison.deltaAccuracy}% năng lực phát hiện lỗi
          </p>
        </div>

        {/* TEST SCORE DELTA */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold">Điểm kiểm tra kiến thức hóa học</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-3 pt-1">
            <span className="text-slate-400 text-sm font-semibold">Pre: {comparison.preStats.score.mean}đ</span>
            <ArrowRight className="w-4 h-4 text-slate-300" />
            <span className="text-2xl font-black text-blue-600">Post: {comparison.postStats.score.mean}đ</span>
          </div>
          <p className="text-[11px] text-blue-600 font-semibold pt-1">
            Biến thiên: +{comparison.deltaScore}đ trên thang 10
          </p>
        </div>
      </div>

      {/* Pre/Post Individual Participant Tracking Table */}
      <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Khách thể</th>
              <th className="py-3 px-4">Nhóm nghiên cứu</th>
              <th className="py-3 px-4 text-center">Pre-test Điểm</th>
              <th className="py-3 px-4 text-center">Post-test Điểm</th>
              <th className="py-3 px-4 text-center">Pre-test ABI</th>
              <th className="py-3 px-4 text-center">Post-test ABI</th>
              <th className="py-3 px-4 text-center">Giảm Bias</th>
              <th className="py-3 px-4 text-right">Đánh giá chuyển biến</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {students.map((student) => {
              const pre = prePost.find((p) => p.studentId === student.id && p.type === 'pre_test');
              const post = prePost.find((p) => p.studentId === student.id && p.type === 'post_test');
              const preAbi = pre ? pre.automationBiasIndicator : null;
              const postAbi = post ? post.automationBiasIndicator : null;
              const abiReduction = preAbi !== null && postAbi !== null ? preAbi - postAbi : null;

              return (
                <tr key={student.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    {anonymize ? student.code : student.name}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        student.group === 'intervention'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {student.group === 'intervention' ? 'Can thiệp' : 'Đối chứng'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-medium">{pre?.score || '--'}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-blue-600">{post?.score || '--'}</td>
                  <td className="py-3 px-4 text-center font-mono text-slate-500">{preAbi !== null ? preAbi.toFixed(1) : '--'}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600">
                    {postAbi !== null ? postAbi.toFixed(1) : '--'}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold">
                    {abiReduction !== null ? (
                      <span className={abiReduction > 0 ? 'text-emerald-600' : 'text-slate-400'}>
                        {abiReduction > 0 ? `-${abiReduction.toFixed(1)}` : abiReduction.toFixed(1)}
                      </span>
                    ) : (
                      '--'
                    )}
                  </td>
                  <td className="py-3 px-4 text-right text-[11px]">
                    {student.group === 'intervention' && abiReduction && abiReduction > 20 ? (
                      <span className="text-emerald-600 font-semibold">Tiến bộ rõ rệt</span>
                    ) : student.group === 'control' ? (
                      <span className="text-slate-400">Giữ nguyên thiên lệch</span>
                    ) : (
                      <span className="text-slate-400">Đang theo dõi</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
