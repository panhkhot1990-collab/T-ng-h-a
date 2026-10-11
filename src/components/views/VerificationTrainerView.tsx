import React, { useState } from 'react';
import {
  Workflow,
  Sparkles,
  Search,
  BookOpen,
  Edit3,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Star,
  Award,
} from 'lucide-react';
import { VerificationTask, Student, Role } from '../../types';
import { StorageService } from '../../services/storage';

interface VerificationTrainerViewProps {
  currentRole: Role;
  tasks: VerificationTask[];
  students: Student[];
  onRefresh: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const VerificationTrainerView: React.FC<VerificationTrainerViewProps> = ({
  currentRole,
  tasks,
  students,
  onRefresh,
  onShowToast,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(tasks[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || 'std-001');

  const activeTask = tasks.find((t) => t.id === selectedTaskId) || tasks[0];
  const activeStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // 7-step answers state
  const [step2Trust, setStep2Trust] = useState<'yes' | 'no' | 'unsure' | null>(null);
  const [step3EvidenceNotes, setStep3EvidenceNotes] = useState('');
  const [step4ErrorSpot, setStep4ErrorSpot] = useState('');
  const [step5Rewrite, setStep5Rewrite] = useState('');
  const [step7Reflection, setStep7Reflection] = useState('');
  const [step7Confidence, setStep7Confidence] = useState(4);

  const stepsList = [
    '1. Nhận câu trả lời AI',
    '2. Dự đoán độ tin cậy',
    '3. Kiểm tra bằng chứng',
    '4. Phát hiện lỗi sai',
    '5. Viết lại cho đúng',
    '6. Phản hồi chuyên gia',
    '7. Tự đánh giá phản tư',
  ];

  // Reset trainer
  const handleReset = () => {
    setCurrentStep(1);
    setStep2Trust(null);
    setStep3EvidenceNotes('');
    setStep4ErrorSpot('');
    setStep5Rewrite('');
    setStep7Reflection('');
  };

  // Complete 7 steps
  const handleFinish = () => {
    StorageService.addLog(
      'COMPLETE_TRAINER',
      'VerificationTrainer',
      activeTask.id,
      `Học sinh ${activeStudent.name} hoàn thành khóa huấn luyện 7 bước phản biện cho nhiệm vụ "${activeTask.title}"`
    );
    onShowToast('success', 'Hoàn thành can thiệp', 'Bạn đã hoàn tất quy trình 7 bước rèn luyện năng lực kiểm chứng!');
    handleReset();
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Workflow className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Verification Trainer — Công Cụ Can Thiệp Rèn Luyện 7 Bước
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quy trình scaffolded tương tác giúp học sinh hình thành phản xạ hoài nghi khoa học trước nội dung AI.
          </p>
        </div>

        {/* Thí sinh thực hiện */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold">Người học:</span>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border rounded-lg text-slate-800 dark:text-slate-200"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 7-Step Navigation Bar */}
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="flex items-center gap-2 min-w-max">
          {stepsList.map((stepName, idx) => {
            const stepNum = idx + 1;
            const isCurrent = currentStep === stepNum;
            const isCompleted = currentStep > stepNum;
            return (
              <div
                key={idx}
                onClick={() => setCurrentStep(stepNum)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                  isCurrent
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                    : isCompleted
                    ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500'
                }`}
              >
                <span>{stepName}</span>
              </div>
            );
          })}
        </div>
      </div>

      {activeTask && (
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
          {/* BƯỚC 1: AI đưa ra câu trả lời */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-purple-600 tracking-wider">
                  BƯỚC 1: TIẾP NHẬN CÂU TRẢ LỜI CỦA AI
                </span>
                <span className="text-xs text-slate-400">Nhiệm vụ: {activeTask.title}</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border text-xs">
                <strong className="text-slate-500 block mb-1">Câu hỏi nghiên cứu:</strong>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{activeTask.aiPrompt}</p>
              </div>

              <div className="p-5 bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60 rounded-xl text-xs sm:text-sm space-y-2">
                <span className="font-bold text-purple-700 dark:text-purple-300 block text-xs uppercase">
                  Văn bản phản hồi của Trợ lý AI:
                </span>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {activeTask.aiResponse}
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <span>Chuyển sang Bước 2: Dự đoán</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* BƯỚC 2: Học sinh dự đoán */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <span className="text-xs font-bold uppercase text-indigo-600 tracking-wider">
                BƯỚC 2: DỰ ĐOÁN ĐỘ TIN CẬY BAN ĐẦU
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Bạn có tin câu trả lời này không?
              </h3>
              <p className="text-xs text-slate-500">
                Hãy dựa trên trực giác và ấn tượng đầu tiên trước khi tra cứu tài liệu học tập.
              </p>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <button
                  onClick={() => setStep2Trust('yes')}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    step2Trust === 'yes'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="block text-xl mb-1">👍</span>
                  <span className="text-xs">Có, tôi tin tưởng</span>
                </button>

                <button
                  onClick={() => setStep2Trust('no')}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    step2Trust === 'no'
                      ? 'border-rose-500 bg-rose-50 text-rose-800 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="block text-xl mb-1">👎</span>
                  <span className="text-xs">Không, tôi nghi ngờ sai</span>
                </button>

                <button
                  onClick={() => setStep2Trust('unsure')}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    step2Trust === 'unsure'
                      ? 'border-amber-500 bg-amber-50 text-amber-800 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="block text-xl mb-1">🤔</span>
                  <span className="text-xs">Tôi chưa chắc chắn</span>
                </button>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Quay lại
                </button>
                <button
                  disabled={!step2Trust}
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <span>Chuyển sang Bước 3: Tra cứu</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* BƯỚC 3: Học sinh kiểm tra bằng chứng */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <span className="text-xs font-bold uppercase text-blue-600 tracking-wider">
                BƯỚC 3: KIỂM TRA BẰNG CHỨNG HỌC LIỆU
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Đối chiếu với tài liệu học tập chính thống
              </h3>

              <div className="p-4 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800/60 text-xs space-y-2">
                <strong className="text-blue-900 dark:text-blue-200 flex items-center gap-1.5 font-bold">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Học liệu tham chiếu: {activeTask.learningMaterialRef}
                </strong>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeTask.suggestedEvidence}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Ghi chú những điểm mâu thuẫn bạn tìm thấy giữa câu trả lời AI và tài liệu:
                </label>
                <textarea
                  rows={3}
                  value={step3EvidenceNotes}
                  onChange={(e) => setStep3EvidenceNotes(e.target.value)}
                  placeholder="Ghi lại các đoạn tài liệu phủ định khẳng định của AI..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Quay lại
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <span>Chuyển sang Bước 4: Tìm lỗi</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* BƯỚC 4: Học sinh tìm lỗi */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <span className="text-xs font-bold uppercase text-amber-600 tracking-wider">
                BƯỚC 4: XÁC ĐỊNH VÀ KHOANH VÙNG LỖI SAI CỦA AI
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Câu khẳng định nào của AI là sai lầm hoặc bịa đặt?
              </h3>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Trích xuất câu sai và phân tích bản chất lỗi:
                </label>
                <textarea
                  rows={4}
                  value={step4ErrorSpot}
                  onChange={(e) => setStep4ErrorSpot(e.target.value)}
                  placeholder="Vd: Câu 'chất xúc tác làm thay đổi hằng số Kc' là sai hoàn toàn vì theo nhiệt động học, chất xúc tác chỉ làm tăng tốc độ đạt cân bằng..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Quay lại
                </button>
                <button
                  onClick={() => {
                    setStep5Rewrite(activeTask.aiResponse);
                    setCurrentStep(5);
                  }}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <span>Chuyển sang Bước 5: Viết lại</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* BƯỚC 5: Học sinh sửa câu trả lời */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <span className="text-xs font-bold uppercase text-emerald-600 tracking-wider">
                BƯỚC 5: VIẾT LẠI CÂU TRẢ LỜI CHUẨN XÁC
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Tự tay chỉnh sửa lại câu trả lời để loại bỏ ảo giác
              </h3>

              <div>
                <textarea
                  rows={5}
                  value={step5Rewrite}
                  onChange={(e) => setStep5Rewrite(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs font-mono"
                />
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Quay lại
                </button>
                <button
                  onClick={() => setCurrentStep(6)}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <span>Chuyển sang Bước 6: Xem phản hồi</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* BƯỚC 6: Hệ thống phản hồi */}
          {currentStep === 6 && (
            <div className="space-y-4 animate-in fade-in text-xs">
              <span className="font-bold uppercase text-indigo-600 tracking-wider text-xs">
                BƯỚC 6: PHẢN HỒI VÀ ĐỐI CHIẾU VỚI ĐÁP ÁN CHUYÊN GIA
              </span>

              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Đáp án khoa học chuẩn (Ground Truth):
                </span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {activeTask.groundTruth}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border">
                <span className="font-semibold block text-slate-500 mb-1">Bản sửa của bạn:</span>
                <p className="text-slate-800 dark:text-slate-200 italic">{step5Rewrite}</p>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setCurrentStep(5)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Quay lại
                </button>
                <button
                  onClick={() => setCurrentStep(7)}
                  className="px-6 py-2.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <span>Chuyển sang Bước 7: Phản tư</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* BƯỚC 7: Học sinh tự đánh giá */}
          {currentStep === 7 && (
            <div className="space-y-4 animate-in fade-in text-xs">
              <span className="font-bold uppercase text-purple-600 tracking-wider text-xs">
                BƯỚC 7: TỰ ĐÁNH GIÁ VÀ PHẢN TƯ (METACOGNITION)
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Tôi đã thay đổi quyết định vì bằng chứng nào?
              </h3>

              <div>
                <label className="font-semibold block mb-1">
                  Tự phản tư: Điều gì khiến bạn nhận ra câu trả lời AI ban đầu có vấn đề?
                </label>
                <textarea
                  rows={3}
                  value={step7Reflection}
                  onChange={(e) => setStep7Reflection(e.target.value)}
                  placeholder="Tôi nhận ra vì đã tra cứu SGK và thấy nguyên lý thực sự ngược lại hoàn toàn so với lời AI..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">
                  Đánh giá mức độ tự tin hiện tại của bạn vào quyết định khoa học:
                </label>
                <div className="flex items-center gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setStep7Confidence(star)}
                      className={`p-1 rounded ${step7Confidence >= star ? 'text-amber-500' : 'text-slate-300'}`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                  <span className="font-bold text-slate-600 ml-2">{step7Confidence}/5 sao</span>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <button
                  onClick={() => setCurrentStep(6)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleFinish}
                  className="px-6 py-2.5 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Award className="w-4 h-4" />
                  <span>Hoàn Thành Khóa Huấn Luyện</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
