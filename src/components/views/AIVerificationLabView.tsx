import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Send,
  Star,
  RefreshCw,
  FileText,
  HelpCircle,
  Download,
} from 'lucide-react';
import { VerificationTask, VerificationSubmission, Student, LearningMaterial, Role } from '../../types';
import { StorageService } from '../../services/storage';
import {
  StudentFileUploadZone,
  UploadedFileItem,
  FileTypeBadge,
} from '../common/StudentFileUploadZone';

interface AIVerificationLabViewProps {
  currentRole: Role;
  tasks: VerificationTask[];
  submissions: VerificationSubmission[];
  students: Student[];
  materials: LearningMaterial[];
  onRefresh: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const AIVerificationLabView: React.FC<AIVerificationLabViewProps> = ({
  currentRole,
  tasks,
  submissions,
  students,
  materials,
  onRefresh,
  onShowToast,
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string>(tasks[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || 'std-001');

  const activeTask = tasks.find((t) => t.id === selectedTaskId) || tasks[0];
  const activeStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // Research recording state
  const [viewStartTime, setViewStartTime] = useState<string>('');
  const [initialDecision, setInitialDecision] = useState<'agree' | 'disagree' | 'uncertain' | null>(null);
  const [initialDecisionTime, setInitialDecisionTime] = useState<string>('');
  const [initialDurationSec, setInitialDurationSec] = useState<number>(0);

  // Workflow step
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Read & Initial, 2: Reason & Evidence, 3: Edit & Final, 4: Feedback & Log

  // Interactive inputs
  const [reason, setReason] = useState('');
  const [selectedEvidence, setSelectedEvidence] = useState('');
  const [editedResponse, setEditedResponse] = useState('');
  const [editCount, setEditCount] = useState(0);
  const [finalDecision, setFinalDecision] = useState<'agree' | 'disagree' | 'uncertain'>('disagree');
  const [confidence, setConfidence] = useState<number>(4);
  const [evidenceFiles, setEvidenceFiles] = useState<UploadedFileItem[]>([]);

  // Completed submission for review
  const [lastSavedSubmission, setLastSavedSubmission] = useState<VerificationSubmission | null>(null);

  // Initialize view timer when task changes
  useEffect(() => {
    setViewStartTime(new Date().toISOString());
    setStep(1);
    setInitialDecision(null);
    setReason('');
    setSelectedEvidence('');
    setEditedResponse('');
    setEditCount(0);
    setEvidenceFiles([]);
    setLastSavedSubmission(null);
  }, [selectedTaskId]);

  // Handle Step 1: Initial Decision
  const handleInitialDecision = (decision: 'agree' | 'disagree' | 'uncertain') => {
    const now = new Date();
    const duration = viewStartTime ? Math.round((now.getTime() - new Date(viewStartTime).getTime()) / 1000) : 15;
    setInitialDecision(decision);
    setInitialDecisionTime(now.toISOString());
    setInitialDurationSec(duration);
    setFinalDecision(decision);
    setStep(2);
  };

  // Handle Save Verification Experiment
  const handleCompleteVerification = () => {
    if (!activeTask || !activeStudent) return;

    const finishTime = new Date();
    const totalDurationSec = viewStartTime
      ? Math.round((finishTime.getTime() - new Date(viewStartTime).getTime()) / 1000)
      : 60;

    // Ground truth comparison:
    // If AI had errors (errorType !== 'none') and student still agreed -> isAiErrorAccepted = true (Biased!)
    const aiHasError = activeTask.errorType !== 'none';
    const isAiErrorAccepted = aiHasError && finalDecision === 'agree';
    const isCorrectDecision = aiHasError ? finalDecision === 'disagree' : finalDecision === 'agree';

    const sub: VerificationSubmission = {
      id: `vsub-${Date.now()}`,
      taskId: activeTask.id,
      taskTitle: activeTask.title,
      studentId: activeStudent.id,
      studentName: activeStudent.name,
      condition: activeStudent.group,
      viewStartTime,
      initialDecisionTime,
      initialDecision: initialDecision || 'uncertain',
      initialDecisionDurationSec: initialDurationSec,
      reason,
      selectedEvidence,
      editedResponse,
      finalDecision,
      confidence,
      verificationDurationSec: totalDurationSec,
      editCount,
      isAiErrorAccepted,
      isCorrectDecision,
      attachedFiles: evidenceFiles.map((f) => ({
        name: f.name,
        size: f.size,
        dataUrl: f.dataUrl,
        type: f.type,
      })),
      submittedAt: finishTime.toISOString(),
    };

    StorageService.saveVerificationSubmission(sub);
    setLastSavedSubmission(sub);
    setStep(4);
    onShowToast('success', 'Ghi nhận thực nghiệm', `Đã lưu kết quả kiểm chứng của ${activeStudent.name}.`);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <FlaskConical className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            AI Verification Lab — Phòng Kiểm Chứng Nội Dung AI
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ghi nhận hành vi đối chiếu tài liệu, phát hiện ảo giác và đo lường độ trễ suy nghĩ của học sinh THPT.
          </p>
        </div>

        {/* Task and Student selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 font-semibold">Tình huống:</span>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border rounded-lg text-slate-800 dark:text-slate-200 font-medium"
            >
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 font-semibold">Thí sinh:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border rounded-lg text-slate-800 dark:text-slate-200 font-medium"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code} - {s.group === 'intervention' ? 'Can thiệp' : 'Đối chứng'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Progress Steps Indicators */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
        <div
          className={`py-2 px-3 rounded-lg border transition-all ${
            step >= 1
              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
              : 'border-slate-200 text-slate-400'
          }`}
        >
          1. Đọc & Quyết định đầu
        </div>
        <div
          className={`py-2 px-3 rounded-lg border transition-all ${
            step >= 2
              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
              : 'border-slate-200 text-slate-400'
          }`}
        >
          2. Nêu lý do & Dẫn chứng
        </div>
        <div
          className={`py-2 px-3 rounded-lg border transition-all ${
            step >= 3
              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
              : 'border-slate-200 text-slate-400'
          }`}
        >
          3. Sửa câu trả lời & Tự tin
        </div>
        <div
          className={`py-2 px-3 rounded-lg border transition-all ${
            step === 4
              ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
              : 'border-slate-200 text-slate-400'
          }`}
        >
          4. Phản hồi thực nghiệm
        </div>
      </div>

      {activeTask && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: AI Prompt & AI Response */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-purple-600 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded">
                  {activeTask.subject} • {activeTask.topic}
                </span>
                <span className="text-slate-400 font-mono">Độ khó: {activeTask.difficulty}</span>
              </div>

              {/* Student prompt to AI */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border text-xs">
                <strong className="text-slate-500 block mb-1">Câu hỏi đầu vào của học sinh (Prompt):</strong>
                <p className="font-medium text-slate-800 dark:text-slate-200">{activeTask.aiPrompt}</p>
              </div>

              {/* AI Generated Content */}
              <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/60 rounded-xl text-xs sm:text-sm space-y-2">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold text-xs uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  Câu trả lời do AI tạo sinh cung cấp:
                </div>
                <div className="text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                  {activeTask.aiResponse}
                </div>
              </div>
            </div>

            {/* STEP 1: INITIAL DECISION */}
            {step === 1 && (
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Bước 1: Quyết định ban đầu (Initial Decision)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sau khi đọc câu trả lời trên của AI, bạn có tin tưởng và đồng ý với nội dung này không?
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleInitialDecision('agree')}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-center transition-all group"
                  >
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">Đồng ý</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Nội dung có vẻ đúng</span>
                  </button>

                  <button
                    onClick={() => handleInitialDecision('disagree')}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-center transition-all group"
                  >
                    <AlertTriangle className="w-6 h-6 text-rose-500 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">Không đồng ý</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Phát hiện lỗi sai/ảo giác</span>
                  </button>

                  <button
                    onClick={() => handleInitialDecision('uncertain')}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-center transition-all group"
                  >
                    <HelpCircle className="w-6 h-6 text-amber-500 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">Chưa chắc chắn</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Cần tra cứu thêm tài liệu</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: REASON & EVIDENCE */}
            {step === 2 && (
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Bước 2: Nêu lý do & Trích dẫn bằng chứng đối chiếu
                  </h3>
                  <span className="text-slate-500">
                    Quyết định đầu: <strong>{initialDecision}</strong> ({initialDurationSec}s)
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Vì sao bạn đưa ra quyết định trên? (Nêu lập luận phản biện):
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Chỉ rõ điểm bất thường, mâu thuẫn trong lập luận của AI hoặc căn cứ từ bài học..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-800 dark:text-slate-200 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Bằng chứng đối chiếu từ Học liệu SGK chuẩn:
                  </label>
                  <input
                    type="text"
                    value={selectedEvidence}
                    onChange={(e) => setSelectedEvidence(e.target.value)}
                    placeholder="Vd: SGK Hóa học 11 Bài 1 mục IV: Chất xúc tác không làm thay đổi hằng số Kc..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-800 dark:text-slate-200"
                  />
                </div>

                {/* Upload evidence files: Word, PDF, Excel */}
                <div className="pt-2">
                  <StudentFileUploadZone
                    files={evidenceFiles}
                    onChange={setEvidenceFiles}
                    label="Học sinh tải lên tệp minh chứng (Word, PDF, Excel)"
                    description="Đính kèm báo cáo Word (.docx), trích lục tài liệu SGK PDF (.pdf), hoặc bảng tính thực nghiệm Excel (.xlsx, .xls) làm cơ sở chứng minh."
                    maxFiles={3}
                    maxSizeMB={20}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={() => {
                      setEditedResponse(activeTask.aiResponse);
                      setStep(3);
                    }}
                    className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                  >
                    Tiếp tục sang bước 3
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: EDIT & FINAL DECISION */}
            {step === 3 && (
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Bước 3: Chỉnh sửa câu trả lời AI & Khẳng định kết luận cuối
                </h3>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Sửa lại câu trả lời cho đúng (nếu phát hiện AI sai):
                  </label>
                  <textarea
                    rows={4}
                    value={editedResponse}
                    onChange={(e) => {
                      setEditedResponse(e.target.value);
                      setEditCount((p) => p + 1);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-800 dark:text-slate-200 leading-relaxed font-mono text-xs"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Số lần chỉnh sửa ghi nhận: {editCount} lần
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Kết luận quyết định cuối cùng:
                    </label>
                    <select
                      value={finalDecision}
                      onChange={(e) => setFinalDecision(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-bold"
                    >
                      <option value="disagree">Bác bỏ câu trả lời AI (Không đồng ý)</option>
                      <option value="agree">Đồng ý với câu trả lời AI</option>
                      <option value="uncertain">Chưa chắc chắn</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Mức độ tự tin vào quyết định của bạn:
                    </label>
                    <div className="flex items-center gap-1.5 pt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setConfidence(star)}
                          className={`p-1 rounded ${confidence >= star ? 'text-amber-500' : 'text-slate-300'}`}
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-600 ml-2">
                        {confidence}/5 sao ({confidence * 20}%)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    onClick={() => setStep(2)}
                    className="px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={handleCompleteVerification}
                    className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Nộp Kết Quả Kiểm Chứng</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: FEEDBACK & RESEARCH LOG RESULT */}
            {step === 4 && lastSavedSubmission && (
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-5 text-xs">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                      lastSavedSubmission.isCorrectDecision
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-rose-100 text-rose-600'
                    }`}
                  >
                    {lastSavedSubmission.isCorrectDecision ? (
                      <CheckCircle2 className="w-7 h-7" />
                    ) : (
                      <AlertTriangle className="w-7 h-7" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {lastSavedSubmission.isCorrectDecision
                        ? 'Xuất sắc! Bạn đã phát hiện đúng ảo giác của AI!'
                        : 'Cảnh báo: Bạn đã bị thuyết phục bởi lập luận sai của AI!'}
                    </h3>
                    <p className="text-slate-500">
                      Thời gian kiểm chứng: <strong>{lastSavedSubmission.verificationDurationSec}s</strong> • Trạng thái
                      thiên lệch:{' '}
                      <strong className={lastSavedSubmission.isAiErrorAccepted ? 'text-rose-600' : 'text-emerald-600'}>
                        {lastSavedSubmission.isAiErrorAccepted ? 'Chấp nhận lỗi AI (Automation Bias)' : 'Đã phòng vệ bias'}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border space-y-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    Sự thật khoa học chuẩn (Ground Truth):
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {activeTask.groundTruth}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-slate-600">
                  <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded">
                    <span>Quyết định ban đầu: <strong>{lastSavedSubmission.initialDecision}</strong> ({lastSavedSubmission.initialDecisionDurationSec}s)</span>
                  </div>
                  <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded">
                    <span>Quyết định cuối cùng: <strong>{lastSavedSubmission.finalDecision}</strong> (Tự tin: {lastSavedSubmission.confidence}/5★)</span>
                  </div>
                </div>

                {/* Display uploaded evidence files */}
                {lastSavedSubmission.attachedFiles && lastSavedSubmission.attachedFiles.length > 0 && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                      Tệp minh chứng đã đính kèm ({lastSavedSubmission.attachedFiles.length}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {lastSavedSubmission.attachedFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs shadow-2xs"
                        >
                          <FileTypeBadge fileName={file.name} mimeType={file.type} />
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                            {file.name}
                          </span>
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
                              className="text-indigo-600 hover:text-indigo-700 ml-1"
                              title="Tải về tệp"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Thực hiện lại nhiệm vụ này</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Ground Truth & Learning Material Scaffolding */}
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs space-y-2">
              <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-500" />
                Tài liệu học tập liên kết để tra cứu:
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{activeTask.learningMaterialRef}</p>
              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-lg text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-900/40">
                <span className="font-bold block mb-1">Gợi ý kiểm chứng từ giáo viên:</span>
                {activeTask.suggestedEvidence}
              </div>
            </div>

            {currentRole === 'teacher' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                <span className="font-bold text-slate-500 text-[10px] uppercase block">
                  Dành cho Nhà nghiên cứu (Teacher/Researcher):
                </span>
                <p>
                  <strong>Loại lỗi cài cắm:</strong> {activeTask.errorType}
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  <strong>Mô tả bẫy:</strong> {activeTask.errorDescription}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
