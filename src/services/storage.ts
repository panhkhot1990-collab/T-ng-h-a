import {
  Student,
  Classroom,
  LearningMaterial,
  Lesson,
  Assignment,
  Submission,
  Question,
  TestMatrix,
  TestSpecification,
  Test,
  TestAttempt,
  VerificationTask,
  VerificationSubmission,
  PrePostAssessment,
  ResearchNotebookEntry,
  PromptTemplate,
  AuditLogEntry,
  Tag,
  AppSettings,
} from '../types';

const DB_VERSION = 'v2026_unified_final_tests_v3_uploads';

const STORAGE_KEYS = {
  DB_VERSION: 'autobiased_db_version',
  STUDENTS: 'autobiased_students',
  CLASSROOMS: 'autobiased_classrooms',
  MATERIALS: 'autobiased_materials',
  LESSONS: 'autobiased_lessons',
  ASSIGNMENTS: 'autobiased_assignments',
  SUBMISSIONS: 'autobiased_submissions',
  QUESTIONS: 'autobiased_questions',
  MATRICES: 'autobiased_matrices',
  SPECS: 'autobiased_specs',
  TESTS: 'autobiased_tests',
  TEST_ATTEMPTS: 'autobiased_test_attempts',
  VERIFICATION_TASKS: 'autobiased_verification_tasks',
  VERIFICATION_SUBMISSIONS: 'autobiased_verification_subs',
  PRE_POST: 'autobiased_pre_post',
  NOTEBOOK: 'autobiased_notebook',
  PROMPTS: 'autobiased_prompts',
  LOGS: 'autobiased_logs',
  TAGS: 'autobiased_tags',
  SETTINGS: 'autobiased_settings',
};

// Default Settings
export const DEFAULT_SETTINGS: AppSettings = {
  anonymizeData: false,
  theme: 'light',
  aiModel: 'gemini-3.8-flash',
  temperature: 0.7,
  biasFormula: {
    errorAcceptanceWeight: 0.5,
    nonVerificationWeight: 0.3,
    confidenceWeight: 0.2,
    formulaName: 'Chỉ số Thiên lệch Tự động hóa Chuẩn (ABI-2026)',
    formulaDescription: 'ABI = (Tỷ lệ chấp nhận lỗi AI × 50%) + (Tỷ lệ bỏ qua kiểm chứng × 30%) + ((Điểm tự tin sai / 5) × 20%)',
  },
  autoSaveIntervalSec: 5,
  lastBackupDate: new Date().toISOString(),
};

// 1. CLASSROOMS
const SEED_CLASSROOMS: Classroom[] = [
  {
    id: 'cls-11a1',
    name: '11A1 (Chuyên Hóa - Tự nhiên)',
    grade: 11,
    schoolYear: '2025-2026',
    teacherName: 'ThS. Trần Thị Kim Oanh',
    studentCount: 4,
    description: 'Lớp thực nghiệm can thiệp năng lực kiểm chứng AI (Intervention Group - Condition B)',
    createdAt: '2026-09-05T08:00:00.000Z',
    updatedAt: '2026-09-05T08:00:00.000Z',
  },
  {
    id: 'cls-11a2',
    name: '11A2 (Khoa học Tự nhiên)',
    grade: 11,
    schoolYear: '2025-2026',
    teacherName: 'ThS. Nguyễn Văn Hải',
    studentCount: 4,
    description: 'Lớp đối chứng sử dụng AI tự do không công cụ can thiệp (Control Group - Condition A)',
    createdAt: '2026-09-05T08:00:00.000Z',
    updatedAt: '2026-09-05T08:00:00.000Z',
  },
];

// 2. STUDENTS (4 Intervention, 4 Control)
const SEED_STUDENTS: Student[] = [
  // Intervention Group (11A1)
  {
    id: 'std-001',
    code: 'HS11-001',
    name: 'Nguyễn Minh Khôi',
    classroomId: 'cls-11a1',
    className: '11A1 (Chuyên Hóa - Tự nhiên)',
    schoolYear: '2025-2026',
    status: 'active',
    group: 'intervention',
    createdAt: '2026-09-05T08:30:00.000Z',
    updatedAt: '2026-09-05T08:30:00.000Z',
    version: 1,
  },
  {
    id: 'std-002',
    code: 'HS11-002',
    name: 'Lê Hoàng Yến',
    classroomId: 'cls-11a1',
    className: '11A1 (Chuyên Hóa - Tự nhiên)',
    schoolYear: '2025-2026',
    status: 'active',
    group: 'intervention',
    createdAt: '2026-09-05T08:30:00.000Z',
    updatedAt: '2026-09-05T08:30:00.000Z',
    version: 1,
  },
  {
    id: 'std-003',
    code: 'HS11-003',
    name: 'Trần Gia Bảo',
    classroomId: 'cls-11a1',
    className: '11A1 (Chuyên Hóa - Tự nhiên)',
    schoolYear: '2025-2026',
    status: 'active',
    group: 'intervention',
    createdAt: '2026-09-05T08:30:00.000Z',
    updatedAt: '2026-09-05T08:30:00.000Z',
    version: 1,
  },
  {
    id: 'std-004',
    code: 'HS11-004',
    name: 'Phạm Quỳnh Chi',
    classroomId: 'cls-11a1',
    className: '11A1 (Chuyên Hóa - Tự nhiên)',
    schoolYear: '2025-2026',
    status: 'active',
    group: 'intervention',
    createdAt: '2026-09-05T08:30:00.000Z',
    updatedAt: '2026-09-05T08:30:00.000Z',
    version: 1,
  },
  // Control Group (11A2)
  {
    id: 'std-005',
    code: 'HS11-005',
    name: 'Đặng Tuấn Kiệt',
    classroomId: 'cls-11a2',
    className: '11A2 (Khoa học Tự nhiên)',
    schoolYear: '2025-2026',
    status: 'active',
    group: 'control',
    createdAt: '2026-09-05T08:30:00.000Z',
    updatedAt: '2026-09-05T08:30:00.000Z',
    version: 1,
  },
  {
    id: 'std-006',
    code: 'HS11-006',
    name: 'Vũ Thảo Vy',
    classroomId: 'cls-11a2',
    className: '11A2 (Khoa học Tự nhiên)',
    schoolYear: '2025-2026',
    status: 'active',
    group: 'control',
    createdAt: '2026-09-05T08:30:00.000Z',
    updatedAt: '2026-09-05T08:30:00.000Z',
    version: 1,
  },
  {
    id: 'std-007',
    code: 'HS11-007',
    name: 'Bùi Đức Anh',
    classroomId: 'cls-11a2',
    className: '11A2 (Khoa học Tự nhiên)',
    schoolYear: '2025-2026',
    status: 'active',
    group: 'control',
    createdAt: '2026-09-05T08:30:00.000Z',
    updatedAt: '2026-09-05T08:30:00.000Z',
    version: 1,
  },
  {
    id: 'std-008',
    code: 'HS11-008',
    name: 'Hoàng Mai Phương',
    classroomId: 'cls-11a2',
    className: '11A2 (Khoa học Tự nhiên)',
    schoolYear: '2025-2026',
    status: 'active',
    group: 'control',
    createdAt: '2026-09-05T08:30:00.000Z',
    updatedAt: '2026-09-05T08:30:00.000Z',
    version: 1,
  },
];

// 3. LEARNING MATERIALS
const SEED_MATERIALS: LearningMaterial[] = [
  {
    id: 'mat-001',
    title: 'Tài liệu chuẩn: Cân bằng hóa học & Nguyên lý Le Chatelier (SGK Hóa 11 KNTT)',
    subject: 'Hóa học',
    grade: 11,
    topic: 'Cân bằng hóa học',
    lesson: 'Bài 1: Khái niệm về cân bằng hóa học',
    schoolYear: '2025-2026',
    author: 'Tổ Hóa học THPT',
    tags: ['#Hóa11', '#CanBangHoaHoc', '#HocLieuChuan'],
    version: 1,
    fileType: 'application/pdf',
    fileName: 'CanBangHoaHoc_Chuan_SGK11.pdf',
    fileSize: 245800,
    fileDataUrl: '',
    description: 'Văn bản học liệu chính thức đối chiếu phản ứng thuận nghịch, hằng số Kc, và các yếu tố chuyển dịch cân bằng theo nguyên lý Le Chatelier. Kc chỉ đổi khi nhiệt độ đổi.',
    linkedLessonIds: ['les-001'],
    linkedTestIds: ['test-001'],
    createdAt: '2026-09-06T09:00:00.000Z',
    updatedAt: '2026-09-06T09:00:00.000Z',
  },
  {
    id: 'mat-002',
    title: 'Chuyên đề: Nitrogen, Ammonia & Muối Ammonium',
    subject: 'Hóa học',
    grade: 11,
    topic: 'Nitrogen & Sulfur',
    lesson: 'Bài 4: Nitrogen và các hợp chất',
    schoolYear: '2025-2026',
    author: 'ThS. Trần Thị Kim Oanh',
    tags: ['#Hóa11', '#Nitrogen', '#Ammonia'],
    version: 1,
    fileType: 'application/pdf',
    fileName: 'Nitrogen_Ammonia_ChuyenDe.pdf',
    fileSize: 189400,
    fileDataUrl: '',
    description: 'Lý thuyết tính khử của NH3, phương pháp tổng hợp Haber-Bosch và các tính toán nồng độ khi cân bằng chuyển dịch.',
    linkedLessonIds: ['les-002'],
    linkedTestIds: ['test-001'],
    createdAt: '2026-09-06T09:30:00.000Z',
    updatedAt: '2026-09-06T09:30:00.000Z',
  },
  {
    id: 'mat-003',
    title: 'Sổ tay hướng dẫn tư duy phản biện & kiểm chứng nội dung AI (Critical Prompting Guide)',
    subject: 'Nghiên cứu AI',
    grade: 11,
    topic: 'Kiểm chứng AI',
    lesson: 'Phương pháp kiểm chứng nguồn và ảo giác AI',
    schoolYear: '2025-2026',
    author: 'Nhóm Nghiên cứu EdTech',
    tags: ['#AutomationBias', '#KiemChungAI', '#CriticalThinking'],
    version: 1,
    fileType: 'text/markdown',
    fileName: 'HuongDanKiemChungAI_THPT.md',
    fileSize: 45200,
    fileDataUrl: '',
    description: 'Quy trình 5 bước đối chiếu tài liệu gốc: 1. Xác định khẳng định cốt lõi; 2. Tra cứu công thức/định lý; 3. Kiểm tra tính hợp lý của số liệu; 4. Phát hiện trích dẫn bịa đặt; 5. Tự tính toán lại.',
    linkedLessonIds: ['les-001', 'les-002'],
    linkedTestIds: ['test-001'],
    createdAt: '2026-09-07T10:00:00.000Z',
    updatedAt: '2026-09-07T10:00:00.000Z',
  },
];

// 4. LESSONS
const SEED_LESSONS: Lesson[] = [
  {
    id: 'les-001',
    title: 'Bài 1: Khái niệm về cân bằng hóa học & Nguyên lý Le Chatelier',
    subject: 'Hóa học',
    grade: 11,
    topic: 'Cân bằng hóa học',
    objectives: [
      'Trình bày được khái niệm phản ứng thuận nghịch và trạng thái cân bằng hóa học.',
      'Viết được biểu thức hằng số cân bằng Kc cho các phản ứng đồng thể và dị thể.',
      'Vận dụng nguyên lý Le Chatelier để dự đoán chiều chuyển dịch khi thay đổi nồng độ, nhiệt độ, áp suất.',
      'Phát hiện lỗi suy luận sai của AI khi dự đoán ảnh hưởng của nhiệt độ và chất xúc tác lên hằng số Kc.',
    ],
    backgroundKnowledge: 'Phản ứng một chiều, phản ứng thuận nghịch; tốc độ phản ứng hóa học.',
    content: `1. Phản ứng thuận nghịch: Phản ứng xảy ra theo hai chiều trái ngược nhau trong cùng điều kiện.
2. Trạng thái cân bằng: Tốc độ phản ứng thuận bằng tốc độ phản ứng nghịch (vt = vn > 0). Đây là cân bằng động.
3. Hằng số cân bằng Kc: Chỉ phụ thuộc vào nhiệt độ và bản chất phản ứng, KHÔNG phụ thuộc nồng độ ban đầu hay chất xúc tác.
4. Nguyên lý Le Chatelier: Khi một hệ đang ở trạng thái cân bằng chịu một tác động từ bên ngoài (nồng độ, nhiệt độ, áp suất), cân bằng sẽ chuyển dịch theo chiều làm giảm tác động đó.`,
    materialIds: ['mat-001', 'mat-003'],
    assignmentIds: ['asn-001'],
    testIds: ['test-001'],
    verificationTaskIds: ['task-001', 'task-002'],
    createdAt: '2026-09-08T08:00:00.000Z',
    updatedAt: '2026-09-08T08:00:00.000Z',
    version: 1,
  },
  {
    id: 'les-002',
    title: 'Bài 2: Ammonia và muối Ammonium - Phân tích ảo giác AI trong phương trình hóa học',
    subject: 'Hóa học',
    grade: 11,
    topic: 'Nitrogen & Sulfur',
    objectives: [
      'Nêu được tính chất vật lý, hóa học cơ bản của NH3 (tính base yếu, tính khử mạnh).',
      'Giải thích nguyên lý sản xuất NH3 trong công nghiệp bằng quá trình Haber.',
      'Thực hành kiểm chứng lập luận sai của AI khi sinh phương trình phản ứng với chất oxi hóa mạnh.',
    ],
    backgroundKnowledge: 'Cấu tạo phân tử NH3 có cặp electron tự do; số oxi hóa của N (-3).',
    content: `1. Tính base: Do phân tử NH3 còn cặp electron tự do chưa tham gia liên kết, có khả năng nhận proton H+.
2. Tính khử: Trong NH3, nguyên tử N có số oxi hóa -3 (thấp nhất), nên NH3 thể hiện tính khử khi tác dụng với các chất oxi hóa (O2, Cl2, CuO...).
3. Quá trình Haber: N2(g) + 3H2(g) <=> 2NH3(g); Delta_r H = -92 kJ (tỏa nhiệt).`,
    materialIds: ['mat-002', 'mat-003'],
    assignmentIds: ['asn-001'],
    testIds: ['test-001'],
    verificationTaskIds: ['task-003'],
    createdAt: '2026-09-09T08:00:00.000Z',
    updatedAt: '2026-09-09T08:00:00.000Z',
    version: 1,
  },
];

// 5. ASSIGNMENTS
const SEED_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asn-001',
    title: 'Nhiệm vụ 1: Giải thích cân bằng tổng hợp Ammonia và phản biện lập luận AI',
    description: 'Học sinh phân tích phản ứng Haber N2 + 3H2 <=> 2NH3 (Delta H = -92 kJ). Trả lời câu hỏi: Vì sao thực tế công nghiệp dùng 450°C thay vì hạ nhiệt độ phòng? Đối chiếu với câu trả lời của AI và chỉ ra sai sót nếu có.',
    classroomId: 'cls-11a1',
    subject: 'Hóa học',
    topic: 'Cân bằng hóa học',
    deadline: '2026-10-15T23:59:00.000Z',
    attachedFiles: [{ name: 'DeBai_NhiemVu_Haber.pdf', size: 124500 }],
    rubrics: [
      'Giải thích đúng mâu thuẫn giữa chuyển dịch cân bằng (nhiệt động) và tốc độ phản ứng (động học) (4 điểm)',
      'Phát hiện chính xác khẳng định sai trong câu trả lời mẫu của AI (3 điểm)',
      'Đưa ra bằng chứng đối chiếu từ tài liệu SGK chuẩn (3 điểm)',
    ],
    maxScore: 10,
    createdAt: '2026-09-10T10:00:00.000Z',
    updatedAt: '2026-09-10T10:00:00.000Z',
  },
];

// 6. SUBMISSIONS
const SEED_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-001',
    assignmentId: 'asn-001',
    studentId: 'std-001',
    studentName: 'Nguyễn Minh Khôi',
    content: `Theo nguyên lý Le Chatelier, vì phản ứng tỏa nhiệt (Delta H < 0), khi hạ nhiệt độ cân bằng chuyển dịch sang chiều thuận (tăng hiệu suất NH3). Tuy nhiên nếu hạ nhiệt độ quá thấp thì tốc độ phản ứng diễn ra cực kỳ chậm, xúc tác Fe mất hoạt tính. Do đó phải chọn nhiệt độ tối ưu 450°C.
AI trả lời sai ở chỗ: AI cho rằng "nhiệt độ cao làm hằng số Kc tăng lên", điều này trái ngược với bản chất phản ứng tỏa nhiệt (phản ứng tỏa nhiệt khi tăng T thì Kc phải giảm).`,
    attachedFiles: [{ name: 'BaiLam_NguyenMinhKhoi_Haber.docx', size: 45000 }],
    submittedAt: '2026-09-12T14:22:15.000Z',
    status: 'graded',
    score: 9.5,
    feedback: 'Bài phân tích rất chặt chẽ, phát hiện chuẩn xác ảo giác của AI về sự biến thiên của Kc theo nhiệt độ.',
    gradedAt: '2026-09-13T09:00:00.000Z',
  },
  {
    id: 'sub-002',
    assignmentId: 'asn-001',
    studentId: 'std-002',
    studentName: 'Lê Hoàng Yến',
    content: `Trong công nghiệp người ta chọn 450°C và 200 atm xúc tác bột Fe. Nhiệt độ này là sự thỏa hiệp giữa hiệu suất cân bằng và tốc độ phản ứng.
Đối chiếu với lời khuyên của AI: AI khẳng định "hạ nhiệt độ xuống âm độ C để tăng sản lượng tối đa", điều này phi thực tế vì tốc độ sẽ về 0. Em dùng SGK Hóa 11 mục Haber làm dẫn chứng.`,
    attachedFiles: [{ name: 'BaiLam_LeHoangYen_Haber.pdf', size: 52000 }],
    submittedAt: '2026-09-12T15:10:00.000Z',
    status: 'graded',
    score: 9.0,
    feedback: 'Lập luận sắc bén, dẫn chứng chính xác từ tài liệu chuẩn.',
    gradedAt: '2026-09-13T09:15:00.000Z',
  },
  {
    id: 'sub-003',
    assignmentId: 'asn-001',
    studentId: 'std-005',
    studentName: 'Đặng Tuấn Kiệt',
    content: `Theo câu trả lời AI, phản ứng tổng hợp ammonia cần nhiệt độ 450°C để cân bằng chuyển dịch theo chiều thuận tạo nhiều NH3 hơn. Em đồng ý với AI.`,
    attachedFiles: [{ name: 'KetQuaThuThapDuLieu.xlsx', size: 38400 }],
    submittedAt: '2026-09-12T16:00:00.000Z',
    status: 'graded',
    score: 6.0,
    feedback: 'Em cần đọc lại SGK. Tăng nhiệt độ làm cân bằng chuyển dịch theo chiều nghịch (giảm hiệu suất NH3), nhiệt độ 450°C được chọn là vì động học phản ứng.',
    gradedAt: '2026-09-13T09:30:00.000Z',
  },
  {
    id: 'sub-004',
    assignmentId: 'asn-001',
    studentId: 'std-003',
    studentName: 'Phạm Đức Anh',
    content: `Em lập bảng tính toán hiệu suất tổng hợp NH3 ở các dải nhiệt độ và áp suất khác nhau trong file Excel đính kèm. Kết quả thực nghiệm mô phỏng cho thấy nhận định của AI về "áp suất 1 atm là đủ" là hoàn toàn sai lệch so với quy trình công nghiệp Haber-Bosch.`,
    attachedFiles: [
      { name: 'BangTinhHieuSuat_Haber_Bosch.xlsx', size: 61440 },
      { name: 'BaoCaoKiemChung_PhamDucAnh.docx', size: 48100 },
    ],
    submittedAt: '2026-09-13T10:15:00.000Z',
    status: 'graded',
    score: 9.8,
    feedback: 'Xuất sắc! Bảng tính Excel mô hình hóa rất trực quan, phản biện AI dựa trên dữ liệu định lượng vững chắc.',
    gradedAt: '2026-09-13T11:00:00.000Z',
  },
];

// 7. QUESTIONS BANK (10 questions C01 - C10, exactly 10.0 points matching Matrix and Specification)
const SEED_QUESTIONS: Question[] = [
  // ROW 1: NHẬN BIẾT (3 câu, 2.0 điểm: C01 = 1.0đ, C05 = 0.5đ, C06 = 0.5đ)
  {
    id: 'q-001',
    code: 'C01',
    subject: 'Hóa học',
    grade: 11,
    topic: 'Cân bằng hóa học',
    cognitiveLevel: 'Nhận biết',
    type: 'multiple_choice',
    question: 'Hằng số cân bằng Kc của một phản ứng hóa học xác định CHỈ phụ thuộc vào yếu tố nào sau đây?',
    options: [
      'A. Nồng độ ban đầu của các chất phản ứng',
      'B. Áp suất chung của hệ',
      'C. Nhiệt độ và bản chất phản ứng',
      'D. Chất xúc tác',
    ],
    correctAnswer: 'C',
    explanation: 'Theo nhiệt động lực học hóa học, hằng số cân bằng Kc chỉ phụ thuộc vào bản chất phản ứng và nhiệt độ.',
    points: 1.0,
    version: 1,
  },
  {
    id: 'q-005',
    code: 'C05',
    subject: 'Hóa học',
    grade: 11,
    topic: 'Cân bằng hóa học',
    cognitiveLevel: 'Nhận biết',
    type: 'multiple_choice',
    question: 'Cho phản ứng thuận nghịch tổng quát: aA(g) + bB(g) <=> cC(g) + dD(g). Biểu thức đúng của hằng số cân bằng Kc là gì?',
    options: [
      'A. Kc = ([C]^c · [D]^d) / ([A]^a · [B]^b)',
      'B. Kc = ([A]^a · [B]^b) / ([C]^c · [D]^d)',
      'C. Kc = ([C] · [D]) / ([A] · [B])',
      'D. Kc = (c[C] + d[D]) / (a[A] + b[B])',
    ],
    correctAnswer: 'A',
    explanation: 'Biểu thức Kc được xác định bằng tích nồng độ các sản phẩm với số mũ bằng hệ số tỉ lượng chia cho tích nồng độ các chất phản ứng với số mũ tương ứng.',
    points: 0.5,
    version: 1,
  },
  {
    id: 'q-006',
    code: 'C06',
    subject: 'Hóa học',
    grade: 11,
    topic: 'Cân bằng hóa học',
    cognitiveLevel: 'Nhận biết',
    type: 'multiple_choice',
    question: 'Khi một phản ứng thuận nghịch đạt đến trạng thái cân bằng hóa học thì điều nào sau đây luôn đúng?',
    options: [
      'A. Phản ứng hoàn toàn dừng lại (vt = vn = 0)',
      'B. Nồng độ chất tham gia phải bằng nồng độ sản phẩm',
      'C. Tốc độ phản ứng thuận lớn hơn tốc độ phản ứng nghịch',
      'D. Tốc độ phản ứng thuận bằng tốc độ phản ứng nghịch (vt = vn > 0)',
    ],
    correctAnswer: 'D',
    explanation: 'Cân bằng hóa học là cân bằng động, tại đó vt = vn > 0 nên nồng độ các chất trong hệ không đổi theo thời gian.',
    points: 0.5,
    version: 1,
  },

  // ROW 2: THÔNG HIỂU (3 câu, 3.0 điểm: C02 = 1.0đ, C07 = 1.0đ, C08 = 1.0đ)
  {
    id: 'q-002',
    code: 'C02',
    subject: 'Hóa học',
    grade: 11,
    topic: 'Cân bằng hóa học',
    cognitiveLevel: 'Thông hiểu',
    type: 'multiple_choice',
    question: 'Cho cân bằng hóa học: N2(g) + 3H2(g) <=> 2NH3(g); Delta_r H = -92 kJ. Cân bằng chuyển dịch theo chiều nghịch khi nào?',
    options: [
      'A. Tăng áp suất chung của hệ',
      'B. Tăng nhiệt độ của hệ',
      'C. Thêm khí N2 vào bình',
      'D. Tách bớt NH3 ra khỏi hệ',
    ],
    correctAnswer: 'B',
    explanation: 'Vì phản ứng tỏa nhiệt (Delta_r H < 0), theo Le Chatelier khi tăng nhiệt độ, cân bằng chuyển dịch theo chiều thu nhiệt (chiều nghịch).',
    points: 1.0,
    version: 1,
  },
  {
    id: 'q-007',
    code: 'C07',
    subject: 'Hóa học',
    grade: 11,
    topic: 'Cân bằng hóa học',
    cognitiveLevel: 'Thông hiểu',
    type: 'multiple_choice',
    question: 'Cho phản ứng nung vôi trong bình kín: CaCO3(s) <=> CaO(s) + CO2(g); Delta_r H > 0 (phản ứng thu nhiệt). Khi tăng nhiệt độ thì lượng khí CO2 biến đổi thế nào?',
    options: [
      'A. Tăng lên do cân bằng chuyển dịch theo chiều thuận',
      'B. Giảm đi do cân bằng chuyển dịch theo chiều nghịch',
      'C. Không đổi vì CaCO3 và CaO là chất rắn',
      'D. Giảm đi vì áp suất tăng',
    ],
    correctAnswer: 'A',
    explanation: 'Phản ứng thuận là thu nhiệt (Delta H > 0), theo Le Chatelier khi tăng nhiệt độ cân bằng dịch chuyển theo chiều thuận, làm nồng độ CO2 tăng lên.',
    points: 1.0,
    version: 1,
  },
  {
    id: 'q-008',
    code: 'C08',
    subject: 'Hóa học',
    grade: 11,
    topic: 'Cân bằng hóa học',
    cognitiveLevel: 'Thông hiểu',
    type: 'multiple_choice',
    question: 'Cho cân bằng trong xilanh: 2NO2(g, màu nâu đỏ) <=> N2O4(g, không màu); Delta_r H < 0. Nếu nén pittông để giảm thể tích (tăng áp suất) ở nhiệt độ không đổi thì hiện tượng màu sắc quan sát được là gì?',
    options: [
      'A. Màu nâu đỏ nhạt dần ngay lập tức mà không đậm lên',
      'B. Màu nâu đỏ sẫm lên và giữ nguyên độ sẫm mãi mãi',
      'C. Màu nâu đỏ đậm lên tức thời do nồng độ tăng rồi sau đó nhạt dần do cân bằng dịch sang chiều tạo N2O4',
      'D. Hỗn hợp hoàn toàn mất màu ngay tức khắc',
    ],
    correctAnswer: 'C',
    explanation: 'Ban đầu nén thể tích giảm đột ngột nên nồng độ NO2 tăng tức thời làm màu sẫm lại; sau đó theo Le Chatelier hệ chuyển dịch theo chiều giảm số phân tử khí (chiều thuận) tạo N2O4 không màu làm màu nhạt bớt.',
    points: 1.0,
    version: 1,
  },

  // ROW 3: VẬN DỤNG (2 câu, 3.0 điểm: C03 = 1.5đ, C09 = 1.5đ)
  {
    id: 'q-003',
    code: 'C03',
    subject: 'Hóa học',
    grade: 11,
    topic: 'Cân bằng hóa học',
    cognitiveLevel: 'Vận dụng',
    type: 'multiple_choice',
    question: 'Cho cân bằng trong bình kín: 2SO2(g) + O2(g) <=> 2SO3(g); Delta_r H < 0. Để tăng hiệu suất tạo SO3 trong công nghiệp, biện pháp kỹ thuật nào sau đây là phù hợp nhất?',
    options: [
      'A. Tăng nhiệt độ và giảm áp suất',
      'B. Giảm nhiệt độ (trong giới hạn hoạt tính xúc tác) và tăng áp suất',
      'C. Dùng thêm chất xúc tác V2O5 và giảm nồng độ O2',
      'D. Tăng thể tích bình phản ứng ở nhiệt độ cao',
    ],
    correctAnswer: 'B',
    explanation: 'Chiều thuận là chiều tỏa nhiệt và giảm số mol khí (3 mol khí -> 2 mol khí). Do đó hạ nhiệt độ và tăng áp suất sẽ làm cân bằng dịch chuyển sang chiều thuận.',
    points: 1.5,
    version: 1,
  },
  {
    id: 'q-009',
    code: 'C09',
    subject: 'Hóa học',
    grade: 11,
    topic: 'Cân bằng hóa học',
    cognitiveLevel: 'Vận dụng',
    type: 'multiple_choice',
    question: 'Cho phản ứng: H2(g) + I2(g) <=> 2HI(g) ở 450°C có hằng số cân bằng Kc = 64. Trộn 1 mol H2 và 1 mol I2 trong bình kín 1 lít. Nồng độ của HI ở trạng thái cân bằng là:',
    options: [
      'A. 0.80 M',
      'B. 1.20 M',
      'C. 1.60 M',
      'D. 2.00 M',
    ],
    correctAnswer: 'C',
    explanation: 'Gọi lượng H2 phản ứng là x. [H2]=[I2]=1-x; [HI]=2x. Kc = (2x)^2 / (1-x)^2 = 64 => 2x/(1-x) = 8 => 2x = 8 - 8x => 10x = 8 => x = 0.8 M => [HI] = 2x = 1.60 M.',
    points: 1.5,
    version: 1,
  },

  // ROW 4: VẬN DỤNG CAO (2 câu, 2.0 điểm: C04 = 1.0đ, C10 = 1.0đ)
  {
    id: 'q-004',
    code: 'C04',
    subject: 'Hóa học',
    grade: 11,
    topic: 'Cân bằng hóa học',
    cognitiveLevel: 'Vận dụng cao',
    type: 'short_answer',
    question: 'Một AI khẳng định: "Chất xúc tác làm tăng tốc độ phản ứng thuận nên sẽ làm dịch chuyển cân bằng sang phía sản phẩm và làm tăng giá trị hằng số Kc". Khẳng định này Đúng hay Sai và vì sao?',
    correctAnswer: 'Sai',
    explanation: 'Khẳng định này sai hoàn toàn. Chất xúc tác làm giảm năng lượng hoạt hóa của cả phản ứng thuận và nghịch với mức độ như nhau, do đó chỉ giúp hệ nhanh đạt trạng thái cân bằng chứ không làm chuyển dịch cân bằng và không làm thay đổi giá trị Kc.',
    points: 1.0,
    version: 1,
  },
  {
    id: 'q-010',
    code: 'C10',
    subject: 'Hóa học',
    grade: 11,
    topic: 'Cân bằng hóa học & Phản biện AI',
    cognitiveLevel: 'Vận dụng cao',
    type: 'short_answer',
    question: 'Một công cụ AI khuyến nghị nhà máy hóa chất: "Để đạt hiệu suất 100% trong quá trình Haber N2 + 3H2 <=> 2NH3 (Delta H = -92 kJ), hãy hạ nhiệt độ xuống -10°C và không cần chất xúc tác". Nêu 2 sai sót nghiêm trọng của khuyến nghị này.',
    correctAnswer: 'Tốc độ phản ứng quá chậm và không thể đạt 100%',
    explanation: 'Sai sót 1: Ở nhiệt độ âm, tốc độ phản ứng thực tế bằng 0 vì phân tử không đủ năng lượng hoạt hóa. Sai sót 2: Phản ứng thuận nghịch luôn tồn tại giới hạn cân bằng động, không bao giờ đạt hiệu suất 100%; cần có xúc tác Fe để phản ứng xảy ra trong thời gian khả thi.',
    points: 1.0,
    version: 1,
  },
];

// 8. TEST MATRICES
const SEED_MATRICES: TestMatrix[] = [
  {
    id: 'mtx-001',
    title: 'Ma trận Đề kiểm tra Giữa kỳ 1 - Hóa học 11 (Cân bằng & Nitrogen)',
    subject: 'Hóa học',
    grade: 11,
    totalQuestions: 10,
    totalPoints: 10.0,
    rows: [
      {
        id: 'mr-1',
        topic: 'Cân bằng hóa học',
        content: 'Khái niệm, Kc, chiều phản ứng thuận nghịch (C01, C05, C06)',
        level: 'Nhận biết',
        questionsCount: 3,
        points: 2.0,
        percentage: 20,
      },
      {
        id: 'mr-2',
        topic: 'Cân bằng hóa học',
        content: 'Nguyên lý Le Chatelier (áp suất, nhiệt độ, nồng độ) (C02, C07, C08)',
        level: 'Thông hiểu',
        questionsCount: 3,
        points: 3.0,
        percentage: 30,
      },
      {
        id: 'mr-3',
        topic: 'Cân bằng hóa học & Ứng dụng',
        content: 'Tổng hợp NH3, SO3 trong công nghiệp (C03, C09)',
        level: 'Vận dụng',
        questionsCount: 2,
        points: 3.0,
        percentage: 30,
      },
      {
        id: 'mr-4',
        topic: 'Đánh giá & Phản biện AI',
        content: 'Phát hiện lỗi sai lý thuyết trong giải thích AI (C04, C10)',
        level: 'Vận dụng cao',
        questionsCount: 2,
        points: 2.0,
        percentage: 20,
      },
    ],
    createdAt: '2026-09-08T11:00:00.000Z',
    updatedAt: '2026-09-08T11:00:00.000Z',
    version: 1,
  },
];

// 9. TEST SPECIFICATIONS
const SEED_SPECS: TestSpecification[] = [
  {
    id: 'spc-001',
    title: 'Bản đặc tả Đề kiểm tra Giữa kỳ 1 - Hóa học 11',
    matrixId: 'mtx-001',
    subject: 'Hóa học',
    grade: 11,
    rows: [
      {
        id: 'sr-1',
        topic: 'Cân bằng hóa học',
        content: 'Khái niệm cân bằng động và biểu thức Kc',
        requirement: 'Nêu được định nghĩa phản ứng thuận nghịch và các yếu tố ảnh hưởng đến hằng số Kc.',
        level: 'Nhận biết',
        questionsCount: 3,
        format: 'multiple_choice',
        points: 2.0,
        questionCodes: ['C01', 'C05', 'C06'],
      },
      {
        id: 'sr-2',
        topic: 'Cân bằng hóa học',
        content: 'Nguyên lý Le Chatelier',
        requirement: 'Vận dụng nguyên lý Le Chatelier để giải thích chiều chuyển dịch cân bằng khi biến thiên T, P, C.',
        level: 'Thông hiểu',
        questionsCount: 3,
        format: 'multiple_choice',
        points: 3.0,
        questionCodes: ['C02', 'C07', 'C08'],
      },
      {
        id: 'sr-3',
        topic: 'Ứng dụng công nghiệp',
        content: 'Quá trình Haber và tiếp xúc sản xuất H2SO4',
        requirement: 'Tính toán hiệu suất và tối ưu hóa điều kiện phản ứng cân bằng trong thực tiễn.',
        level: 'Vận dụng',
        questionsCount: 2,
        format: 'multiple_choice',
        points: 3.0,
        questionCodes: ['C03', 'C09'],
      },
      {
        id: 'sr-4',
        topic: 'Kiểm chứng phản biện AI',
        content: 'Phát hiện ảo giác kiến thức hóa học do AI tạo ra',
        requirement: 'Xác định lập luận sai lệch về chất xúc tác hoặc cân bằng pha khí trong câu trả lời của AI và viết lại câu trả lời đúng.',
        level: 'Vận dụng cao',
        questionsCount: 2,
        format: 'short_answer',
        points: 2.0,
        questionCodes: ['C04', 'C10'],
      },
    ],
    createdAt: '2026-09-08T11:30:00.000Z',
    updatedAt: '2026-09-08T11:30:00.000Z',
    version: 1,
  },
];

// 10. TESTS (10 questions, exactly 10.0 points, perfectly validated)
const SEED_TESTS: Test[] = [
  {
    id: 'test-001',
    title: 'Đề kiểm tra Nghiên cứu: Cân bằng Hóa học & Năng lực Kiểm chứng AI (Pre-Test / Midterm)',
    subject: 'Hóa học',
    grade: 11,
    durationMinutes: 45,
    totalQuestions: 10,
    totalPoints: 10.0,
    matrixId: 'mtx-001',
    specId: 'spc-001',
    status: 'published',
    questions: SEED_QUESTIONS,
    validationResult: {
      isValid: true,
      errors: [],
      warnings: [],
      checks: [
        { label: 'Số lượng câu hỏi', passed: true, details: 'Đề có đủ 10/10 câu hỏi chuẩn hóa', severity: 'info' },
        { label: 'Tổng điểm kiểm tra', passed: true, details: 'Tổng điểm đạt chuẩn 10.0 / 10.0 điểm', severity: 'info' },
        { label: 'Độ khớp với Ma trận', passed: true, details: 'Khớp hoàn toàn 4 mức độ nhận thức theo ma trận mtx-001', severity: 'info' },
        { label: 'Khớp bản đặc tả', passed: true, details: 'Các câu hỏi khớp đúng mã C01-C10 trong bản đặc tả spc-001', severity: 'info' },
        { label: 'Đáp án đầy đủ', passed: true, details: 'Tất cả câu hỏi đều có đáp án và giải thích chi tiết', severity: 'info' },
        { label: 'Kiểm tra trùng lặp', passed: true, details: 'Không phát hiện câu hỏi trùng lặp', severity: 'info' },
      ],
    },
    createdAt: '2026-09-09T08:00:00.000Z',
    updatedAt: '2026-09-09T08:00:00.000Z',
    version: 1,
  },
  {
    id: 'test-002',
    title: 'Đề kiểm tra Đánh giá: Nitrogen - Ammonia & Nhận diện Lập luận AI Sai lệch (Post-Test)',
    subject: 'Hóa học',
    grade: 11,
    durationMinutes: 45,
    totalQuestions: 10,
    totalPoints: 10.0,
    matrixId: 'mtx-001',
    specId: 'spc-001',
    status: 'published',
    questions: SEED_QUESTIONS,
    validationResult: {
      isValid: true,
      errors: [],
      warnings: [],
      checks: [
        { label: 'Số lượng câu hỏi', passed: true, details: 'Đề có đủ 10/10 câu hỏi chuẩn hóa', severity: 'info' },
        { label: 'Tổng điểm kiểm tra', passed: true, details: 'Tổng điểm đạt chuẩn 10.0 / 10.0 điểm', severity: 'info' },
        { label: 'Độ khớp với Ma trận', passed: true, details: 'Khớp hoàn toàn 4 mức độ nhận thức theo ma trận mtx-001', severity: 'info' },
        { label: 'Khớp bản đặc tả', passed: true, details: 'Các câu hỏi khớp đúng mã C01-C10 trong bản đặc tả spc-001', severity: 'info' },
        { label: 'Đáp án đầy đủ', passed: true, details: 'Tất cả câu hỏi đều có đáp án và giải thích chi tiết', severity: 'info' },
        { label: 'Kiểm tra trùng lặp', passed: true, details: 'Không phát hiện câu hỏi trùng lặp', severity: 'info' },
      ],
    },
    createdAt: '2026-09-12T08:00:00.000Z',
    updatedAt: '2026-09-12T08:00:00.000Z',
    version: 1,
  },
];

// 11. TEST ATTEMPTS
const SEED_TEST_ATTEMPTS: TestAttempt[] = [
  {
    id: 'att-001',
    testId: 'test-001',
    testTitle: 'Đề kiểm tra Nghiên cứu: Cân bằng Hóa học & Năng lực Kiểm chứng AI',
    studentId: 'std-001',
    studentName: 'Nguyễn Minh Khôi',
    answers: {
      'q-001': 'C',
      'q-005': 'A',
      'q-006': 'D',
      'q-002': 'B',
      'q-007': 'A',
      'q-008': 'C',
      'q-003': 'B',
      'q-009': 'C',
      'q-004': 'Sai',
      'q-010': 'Tốc độ phản ứng quá chậm và không thể đạt 100%',
    },
    startedAt: '2026-09-28T08:00:00.000Z',
    submittedAt: '2026-09-28T08:35:10.000Z',
    score: 9.5,
    maxScore: 10.0,
    status: 'submitted',
  },
  {
    id: 'att-002',
    testId: 'test-001',
    testTitle: 'Đề kiểm tra Nghiên cứu: Cân bằng Hóa học & Năng lực Kiểm chứng AI',
    studentId: 'std-005',
    studentName: 'Đặng Tuấn Kiệt',
    answers: {
      'q-001': 'D', // Wrong
      'q-005': 'A',
      'q-006': 'D',
      'q-002': 'A', // Wrong
      'q-007': 'A',
      'q-008': 'B', // Wrong
      'q-003': 'B',
      'q-009': 'C',
      'q-004': 'Đúng', // Wrong
      'q-010': 'Hạ nhiệt độ là đúng', // Wrong
    },
    startedAt: '2026-09-28T08:00:00.000Z',
    submittedAt: '2026-09-28T08:22:40.000Z',
    score: 6.5,
    maxScore: 10.0,
    status: 'submitted',
  },
];

// 12. VERIFICATION TASKS
const SEED_VERIFICATION_TASKS: VerificationTask[] = [
  {
    id: 'task-001',
    title: 'Nhiệm vụ 1: AI giải thích ảnh hưởng của chất xúc tác lên hằng số cân bằng Kc',
    subject: 'Hóa học 11',
    topic: 'Cân bằng hóa học',
    aiPrompt: 'Chất xúc tác có làm thay đổi giá trị của hằng số cân bằng Kc không? Hãy giải thích cơ chế.',
    aiResponse: `Chào bạn! Có, chất xúc tác làm thay đổi hằng số cân bằng Kc. 
Bởi vì chất xúc tác làm tăng tốc độ phản ứng thuận mạnh hơn tốc độ phản ứng nghịch, dẫn đến nồng độ sản phẩm ở trạng thái cân bằng cao hơn ban đầu. Theo công thức Kc = [Sản phẩm] / [Chất phản ứng], khi nồng độ sản phẩm tăng thì giá trị hằng số Kc cũng tăng theo. Điều này được chứng minh trong Giáo trình Hóa học Lý thuyết (trang 114, NXB GDVN 2023).`,
    groundTruth: `Khẳng định của AI là SAI HOÀN TOÀN. Chất xúc tác làm giảm năng lượng hoạt hóa của cả phản ứng thuận và nghịch với một lượng như nhau, do đó làm tăng tốc độ của cả 2 phản ứng với cùng một hệ số. Kết quả là hệ chỉ đạt trạng thái cân bằng nhanh hơn, nhưng thành phần hỗn hợp cân bằng và hằng số Kc KHÔNG HỀ THAY ĐỔI. Kc chỉ phụ thuộc vào bản chất phản ứng và nhiệt độ. Đoạn trích dẫn sách là ảo giác do AI tự bịa.`,
    errorType: 'logical_fallacy',
    errorDescription: 'Sai lầm logic bản chất cân bằng động và trích dẫn tài liệu bịa đặt (Hallucinated citation).',
    suggestedEvidence: 'SGK Hóa học 11 - Bài 1 (Mục IV: Các yếu tố ảnh hưởng đến cân bằng hóa học): "Chất xúc tác không làm chuyển dịch cân bằng hóa học".',
    learningMaterialRef: 'CanBangHoaHoc_Chuan_SGK11.pdf',
    difficulty: 'Trung bình',
    targetGroup: 'all',
    createdAt: '2026-09-10T08:00:00.000Z',
    updatedAt: '2026-09-10T08:00:00.000Z',
    version: 1,
  },
  {
    id: 'task-002',
    title: 'Nhiệm vụ 2: AI tính toán chiều chuyển dịch khi nén hệ N2O4 <=> 2NO2',
    subject: 'Hóa học 11',
    topic: 'Cân bằng hóa học',
    aiPrompt: 'Cho cân bằng trong xilanh: N2O4(g, không màu) <=> 2NO2(g, màu nâu đỏ). Khi nén pittong để giảm thể tích (tăng áp suất), màu của hỗn hợp biến đổi thế nào?',
    aiResponse: `Khi tăng áp suất chung của hệ, theo nguyên lý Le Chatelier, cân bằng sẽ chuyển dịch theo chiều làm tăng số mol khí để chống lại sự nén. Do đó cân bằng chuyển dịch theo chiều thuận (tạo 2 mol NO2 từ 1 mol N2O4). Vì vậy, màu nâu đỏ của hỗn hợp sẽ ngày càng đậm hơn và không bao giờ nhạt đi.`,
    groundTruth: `AI giải thích SAI NGUYÊN LÝ LE CHATELIER. Khi tăng áp suất, cân bằng phải chuyển dịch theo chiều làm GIẢM áp suất, tức là chiều làm GIẢM số mol khí (chiều nghịch: từ 2 mol NO2 tạo 1 mol N2O4). Ban đầu khi nén, do nồng độ tăng tức thời nên màu có thể sẫm lại chốc lát, nhưng sau đó cân bằng dịch chuyển sang chiều nghịch làm màu nhạt dần. Khẳng định "chuyển dịch theo chiều tăng số mol" của AI là ngược nguyên lý 180 độ.`,
    errorType: 'factual_error',
    errorDescription: 'Hiểu sai nguyên lý Le Chatelier (ngược chiều chuyển dịch cân bằng khí).',
    suggestedEvidence: 'Nguyên lý Le Chatelier: Khi tăng áp suất, cân bằng chuyển dịch theo chiều làm giảm áp suất (chiều giảm số phân tử khí). Chiều nghịch: 2 mol NO2 -> 1 mol N2O4.',
    learningMaterialRef: 'CanBangHoaHoc_Chuan_SGK11.pdf',
    difficulty: 'Dễ',
    targetGroup: 'all',
    createdAt: '2026-09-10T08:30:00.000Z',
    updatedAt: '2026-09-10T08:30:00.000Z',
    version: 1,
  },
  {
    id: 'task-003',
    title: 'Nhiệm vụ 3: AI phân tích phản ứng của kim loại Đồng với HNO3 đặc nguội',
    subject: 'Hóa học 11',
    topic: 'Nitrogen & Hợp chất',
    aiPrompt: 'Kim loại Cu có phản ứng với dung dịch HNO3 đặc, nguội không? Viết phương trình phản ứng nếu có.',
    aiResponse: `Kim loại Cu thụ động hóa hoàn toàn trong axit HNO3 đặc, nguội tương tự như Fe, Al và Cr. Do đó Cu không thể phản ứng với HNO3 đặc nguội ở nhiệt độ phòng. Chỉ khi đun nóng mạnh thì Cu mới bị hòa tan giải phóng khí N2O.`,
    groundTruth: `AI đưa ra THÔNG TIN SAI NGHIÊM TRỌNG. Kim loại Cu KHÔNG bị thụ động hóa trong HNO3 đặc nguội (chỉ có Al, Fe, Cr mới bị thụ động trong HNO3 đặc nguội và H2SO4 đặc nguội). Ở nhiệt độ thường, Cu phản ứng mãnh liệt với HNO3 đặc nguội tạo dung dịch màu xanh lam Cu(NO3)2 và khí màu nâu đỏ NO2: Cu + 4HNO3 -> Cu(NO3)2 + 2NO2 + 2H2O. Khí thoát ra là NO2 chứ không phải N2O.`,
    errorType: 'factual_error',
    errorDescription: 'Nhầm lẫn hiện tượng thụ động hóa kim loại và sai sản phẩm khử khí.',
    suggestedEvidence: 'SGK Hóa học 11 (Axit nitric): "Chỉ Fe, Al, Cr bị thụ động trong HNO3 đặc nguội. Cu tan dễ dàng trong HNO3 đặc giải phóng NO2 màu nâu đỏ".',
    learningMaterialRef: 'Nitrogen_Ammonia_ChuyenDe.pdf',
    difficulty: 'Khó',
    targetGroup: 'all',
    createdAt: '2026-09-10T09:00:00.000Z',
    updatedAt: '2026-09-10T09:00:00.000Z',
    version: 1,
  },
];

// 13. VERIFICATION SUBMISSIONS (Real trials matching students and tasks)
const SEED_VERIFICATION_SUBMISSIONS: VerificationSubmission[] = [
  // Student 005 (Control Group - High Automation Bias, accepting AI errors)
  {
    id: 'vsub-001',
    taskId: 'task-001',
    taskTitle: 'Nhiệm vụ 1: AI giải thích ảnh hưởng của chất xúc tác lên hằng số cân bằng Kc',
    studentId: 'std-005',
    studentName: 'Đặng Tuấn Kiệt',
    condition: 'control',
    viewStartTime: '2026-09-15T09:00:00.000Z',
    initialDecisionTime: '2026-09-15T09:00:18.000Z',
    initialDecision: 'agree',
    initialDecisionDurationSec: 18,
    reason: 'AI giải thích rất logic, có công thức Kc và trích dẫn giáo trình rõ ràng nên em tin tưởng.',
    selectedEvidence: '',
    editedResponse: '',
    finalDecision: 'agree',
    confidence: 5,
    verificationDurationSec: 25,
    editCount: 0,
    isAiErrorAccepted: true, // Biased! Accepted false AI advice
    isCorrectDecision: false,
    submittedAt: '2026-09-15T09:00:25.000Z',
  },
  // Student 001 (Intervention Group - Trained, spotted error, verified evidence)
  {
    id: 'vsub-002',
    taskId: 'task-001',
    taskTitle: 'Nhiệm vụ 1: AI giải thích ảnh hưởng của chất xúc tác lên hằng số cân bằng Kc',
    studentId: 'std-001',
    studentName: 'Nguyễn Minh Khôi',
    condition: 'intervention',
    viewStartTime: '2026-09-15T09:10:00.000Z',
    initialDecisionTime: '2026-09-15T09:10:45.000Z',
    initialDecision: 'disagree',
    initialDecisionDurationSec: 45,
    reason: 'Theo định nghĩa trong SGK mục IV, chất xúc tác làm tăng tốc độ thuận và nghịch như nhau nên Kc không đổi. Sách giáo trình mà AI nêu không có thật.',
    selectedEvidence: 'Học liệu chuẩn CanBangHoaHoc_Chuan_SGK11.pdf trang 12: Kc chỉ phụ thuộc vào bản chất phản ứng và nhiệt độ.',
    editedResponse: 'Chất xúc tác KHÔNG làm thay đổi giá trị Kc. Nó chỉ giúp hệ nhanh đạt cân bằng hơn nhờ hạ năng lượng hoạt hóa của cả 2 chiều như nhau.',
    finalDecision: 'disagree',
    confidence: 4,
    verificationDurationSec: 185,
    editCount: 2,
    isAiErrorAccepted: false, // Refused erroneous AI advice!
    isCorrectDecision: true,
    submittedAt: '2026-09-15T09:13:05.000Z',
  },
  // Student 002 (Intervention Group)
  {
    id: 'vsub-003',
    taskId: 'task-002',
    taskTitle: 'Nhiệm vụ 2: AI tính toán chiều chuyển dịch khi nén hệ N2O4 <=> 2NO2',
    studentId: 'std-002',
    studentName: 'Lê Hoàng Yến',
    condition: 'intervention',
    viewStartTime: '2026-09-15T09:20:00.000Z',
    initialDecisionTime: '2026-09-15T09:20:30.000Z',
    initialDecision: 'disagree',
    initialDecisionDurationSec: 30,
    reason: 'AI nói ngược nguyên lý Le Chatelier: tăng áp suất phải dịch sang chiều giảm số mol khí (chiều nghịch), AI lại bảo sang chiều thuận.',
    selectedEvidence: 'Nguyên lý Le Chatelier: Chống lại sự tăng áp suất bằng cách dịch sang chiều có ít phân tử khí hơn (2 mol NO2 -> 1 mol N2O4).',
    editedResponse: 'Cân bằng chuyển dịch theo chiều nghịch (tạo N2O4 không màu). Ban đầu do nén nên màu sẫm tức thời, sau đó màu sẽ nhạt dần.',
    finalDecision: 'disagree',
    confidence: 5,
    verificationDurationSec: 140,
    editCount: 1,
    isAiErrorAccepted: false,
    isCorrectDecision: true,
    submittedAt: '2026-09-15T09:22:20.000Z',
  },
  // Student 006 (Control Group - Accepted Error)
  {
    id: 'vsub-004',
    taskId: 'task-002',
    taskTitle: 'Nhiệm vụ 2: AI tính toán chiều chuyển dịch khi nén hệ N2O4 <=> 2NO2',
    studentId: 'std-006',
    studentName: 'Vũ Thảo Vy',
    condition: 'control',
    viewStartTime: '2026-09-15T09:30:00.000Z',
    initialDecisionTime: '2026-09-15T09:30:15.000Z',
    initialDecision: 'agree',
    initialDecisionDurationSec: 15,
    reason: 'Đọc thấy AI giải thích thuận miệng, em không tra lại sách.',
    selectedEvidence: '',
    editedResponse: '',
    finalDecision: 'agree',
    confidence: 4,
    verificationDurationSec: 30,
    editCount: 0,
    isAiErrorAccepted: true,
    isCorrectDecision: false,
    submittedAt: '2026-09-15T09:30:45.000Z',
  },
  // Student 003 (Intervention Group - Task 3)
  {
    id: 'vsub-005',
    taskId: 'task-003',
    taskTitle: 'Nhiệm vụ 3: AI phân tích phản ứng của kim loại Đồng với HNO3 đặc nguội',
    studentId: 'std-003',
    studentName: 'Trần Gia Bảo',
    condition: 'intervention',
    viewStartTime: '2026-09-16T10:00:00.000Z',
    initialDecisionTime: '2026-09-16T10:00:40.000Z',
    initialDecision: 'disagree',
    initialDecisionDurationSec: 40,
    reason: 'Em đối chiếu SGK Hóa 11 bài Axit Nitric: Chỉ có Al, Fe, Cr bị thụ động trong HNO3 đặc nguội, Cu vẫn tan và sủi bọt khí NO2 màu nâu đỏ.',
    selectedEvidence: 'SGK Hóa 11 - Axit Nitric: Cu + 4HNO3 đặc -> Cu(NO3)2 + 2NO2 + 2H2O.',
    editedResponse: 'Kim loại Cu tan dễ dàng trong HNO3 đặc nguội giải phóng khí NO2 màu nâu đỏ, không bị thụ động hóa.',
    finalDecision: 'disagree',
    confidence: 5,
    verificationDurationSec: 160,
    editCount: 2,
    isAiErrorAccepted: false,
    isCorrectDecision: true,
    submittedAt: '2026-09-16T10:02:40.000Z',
  },
  // Student 007 (Control Group - Task 3)
  {
    id: 'vsub-006',
    taskId: 'task-003',
    taskTitle: 'Nhiệm vụ 3: AI phân tích phản ứng của kim loại Đồng với HNO3 đặc nguội',
    studentId: 'std-007',
    studentName: 'Bùi Đức Anh',
    condition: 'control',
    viewStartTime: '2026-09-16T10:15:00.000Z',
    initialDecisionTime: '2026-09-16T10:15:10.000Z',
    initialDecision: 'agree',
    initialDecisionDurationSec: 10,
    reason: 'AI liệt kê Cu cùng nhóm thụ động nên em nghĩ là đúng.',
    selectedEvidence: '',
    editedResponse: '',
    finalDecision: 'agree',
    confidence: 4,
    verificationDurationSec: 20,
    editCount: 0,
    isAiErrorAccepted: true,
    isCorrectDecision: false,
    submittedAt: '2026-09-16T10:15:20.000Z',
  },
];

// 14. PRE/POST ASSESSMENTS (Complete records for all 8 students)
const SEED_PRE_POST: PrePostAssessment[] = [
  // --- PRE-TEST BASELINE (All 8 students) ---
  {
    id: 'pp-001',
    type: 'pre_test',
    studentId: 'std-001',
    studentName: 'Nguyễn Minh Khôi',
    group: 'intervention',
    score: 6.5,
    maxScore: 10.0,
    verificationAccuracyPct: 45,
    aiErrorAcceptanceRatePct: 55,
    automationBiasIndicator: 62.5,
    timestamp: '2026-09-10T08:30:00.000Z',
  },
  {
    id: 'pp-002',
    type: 'pre_test',
    studentId: 'std-002',
    studentName: 'Lê Hoàng Yến',
    group: 'intervention',
    score: 7.0,
    maxScore: 10.0,
    verificationAccuracyPct: 50,
    aiErrorAcceptanceRatePct: 50,
    automationBiasIndicator: 58.0,
    timestamp: '2026-09-10T08:30:00.000Z',
  },
  {
    id: 'pp-003',
    type: 'pre_test',
    studentId: 'std-003',
    studentName: 'Trần Gia Bảo',
    group: 'intervention',
    score: 6.0,
    maxScore: 10.0,
    verificationAccuracyPct: 40,
    aiErrorAcceptanceRatePct: 60,
    automationBiasIndicator: 65.0,
    timestamp: '2026-09-10T08:30:00.000Z',
  },
  {
    id: 'pp-004',
    type: 'pre_test',
    studentId: 'std-004',
    studentName: 'Phạm Quỳnh Chi',
    group: 'intervention',
    score: 6.5,
    maxScore: 10.0,
    verificationAccuracyPct: 45,
    aiErrorAcceptanceRatePct: 55,
    automationBiasIndicator: 60.0,
    timestamp: '2026-09-10T08:30:00.000Z',
  },
  {
    id: 'pp-005',
    type: 'pre_test',
    studentId: 'std-005',
    studentName: 'Đặng Tuấn Kiệt',
    group: 'control',
    score: 6.0,
    maxScore: 10.0,
    verificationAccuracyPct: 40,
    aiErrorAcceptanceRatePct: 65,
    automationBiasIndicator: 68.5,
    timestamp: '2026-09-10T08:30:00.000Z',
  },
  {
    id: 'pp-006',
    type: 'pre_test',
    studentId: 'std-006',
    studentName: 'Vũ Thảo Vy',
    group: 'control',
    score: 6.5,
    maxScore: 10.0,
    verificationAccuracyPct: 45,
    aiErrorAcceptanceRatePct: 60,
    automationBiasIndicator: 64.0,
    timestamp: '2026-09-10T08:30:00.000Z',
  },
  {
    id: 'pp-007',
    type: 'pre_test',
    studentId: 'std-007',
    studentName: 'Bùi Đức Anh',
    group: 'control',
    score: 5.5,
    maxScore: 10.0,
    verificationAccuracyPct: 35,
    aiErrorAcceptanceRatePct: 70,
    automationBiasIndicator: 71.0,
    timestamp: '2026-09-10T08:30:00.000Z',
  },
  {
    id: 'pp-008',
    type: 'pre_test',
    studentId: 'std-008',
    studentName: 'Hoàng Mai Phương',
    group: 'control',
    score: 6.5,
    maxScore: 10.0,
    verificationAccuracyPct: 42,
    aiErrorAcceptanceRatePct: 60,
    automationBiasIndicator: 63.5,
    timestamp: '2026-09-10T08:30:00.000Z',
  },

  // --- POST-TEST AFTER INTERVENTION (All 8 students) ---
  {
    id: 'pp-009',
    type: 'post_test',
    studentId: 'std-001',
    studentName: 'Nguyễn Minh Khôi',
    group: 'intervention',
    score: 9.5,
    maxScore: 10.0,
    verificationAccuracyPct: 92,
    aiErrorAcceptanceRatePct: 12,
    automationBiasIndicator: 18.2, // Significant drop in bias!
    timestamp: '2026-09-28T09:00:00.000Z',
  },
  {
    id: 'pp-010',
    type: 'post_test',
    studentId: 'std-002',
    studentName: 'Lê Hoàng Yến',
    group: 'intervention',
    score: 9.0,
    maxScore: 10.0,
    verificationAccuracyPct: 88,
    aiErrorAcceptanceRatePct: 15,
    automationBiasIndicator: 21.0,
    timestamp: '2026-09-28T09:00:00.000Z',
  },
  {
    id: 'pp-011',
    type: 'post_test',
    studentId: 'std-003',
    studentName: 'Trần Gia Bảo',
    group: 'intervention',
    score: 8.5,
    maxScore: 10.0,
    verificationAccuracyPct: 85,
    aiErrorAcceptanceRatePct: 18,
    automationBiasIndicator: 24.5,
    timestamp: '2026-09-28T09:00:00.000Z',
  },
  {
    id: 'pp-012',
    type: 'post_test',
    studentId: 'std-004',
    studentName: 'Phạm Quỳnh Chi',
    group: 'intervention',
    score: 9.0,
    maxScore: 10.0,
    verificationAccuracyPct: 90,
    aiErrorAcceptanceRatePct: 14,
    automationBiasIndicator: 19.5,
    timestamp: '2026-09-28T09:00:00.000Z',
  },
  {
    id: 'pp-013',
    type: 'post_test',
    studentId: 'std-005',
    studentName: 'Đặng Tuấn Kiệt',
    group: 'control',
    score: 6.5,
    maxScore: 10.0,
    verificationAccuracyPct: 42,
    aiErrorAcceptanceRatePct: 62,
    automationBiasIndicator: 66.0, // Persisted high bias without intervention
    timestamp: '2026-09-28T09:00:00.000Z',
  },
  {
    id: 'pp-014',
    type: 'post_test',
    studentId: 'std-006',
    studentName: 'Vũ Thảo Vy',
    group: 'control',
    score: 7.0,
    maxScore: 10.0,
    verificationAccuracyPct: 48,
    aiErrorAcceptanceRatePct: 58,
    automationBiasIndicator: 61.5,
    timestamp: '2026-09-28T09:00:00.000Z',
  },
  {
    id: 'pp-015',
    type: 'post_test',
    studentId: 'std-007',
    studentName: 'Bùi Đức Anh',
    group: 'control',
    score: 6.0,
    maxScore: 10.0,
    verificationAccuracyPct: 38,
    aiErrorAcceptanceRatePct: 68,
    automationBiasIndicator: 69.0,
    timestamp: '2026-09-28T09:00:00.000Z',
  },
  {
    id: 'pp-016',
    type: 'post_test',
    studentId: 'std-008',
    studentName: 'Hoàng Mai Phương',
    group: 'control',
    score: 6.5,
    maxScore: 10.0,
    verificationAccuracyPct: 45,
    aiErrorAcceptanceRatePct: 60,
    automationBiasIndicator: 62.0,
    timestamp: '2026-09-28T09:00:00.000Z',
  },
];

// 15. RESEARCH NOTEBOOK
const SEED_NOTEBOOK: ResearchNotebookEntry[] = [
  {
    id: 'nb-001',
    title: 'Thiết kế Nghiên cứu: Hiệu quả Can thiệp Verification Trainer lên Thiên lệch Tự động hóa',
    researchQuestion: 'Công cụ tương tác rèn luyện năng lực kiểm chứng nội dung AI (Verification Trainer) có làm giảm đáng kể chỉ số Automation Bias và tăng độ chính xác kiểm chứng ở học sinh lớp 11 hay không?',
    hypothesis: 'H1: Học sinh trải qua can thiệp bằng Verification Trainer có tỷ lệ chấp nhận ảo giác AI thấp hơn có ý nghĩa thống kê (p < 0.05) và chỉ số Automation Bias Indicator giảm hơn 50% so với nhóm đối chứng.',
    independentVariable: 'Phương pháp can thiệp (Nhóm thực nghiệm: Quy trình 7 bước Verification Trainer; Nhóm đối chứng: Sử dụng AI tự do)',
    dependentVariable: 'Chỉ số Automation Bias Indicator (ABI), Tỷ lệ chấp nhận lỗi AI (AI Error Acceptance Rate), Độ chính xác kiểm chứng (Verification Accuracy), Thời gian kiểm chứng (Verification Duration).',
    methodology: 'Thiết kế thực nghiệm Pre-test / Post-test với nhóm đối chứng (Pretest-Posttest Control Group Design). Cỡ mẫu N=8 (4 thực nghiệm, 4 đối chứng). Dữ liệu ghi nhận tự động timestamp và hành vi qua hệ thống AutoBiasEd.',
    notes: 'Đảm bảo tính ẩn danh theo chuẩn đạo đức nghiên cứu giáo dục: Dữ liệu phân tích dùng mã định danh HS11-xxx, không để lộ danh tính cá nhân khi xuất dataset.',
    tags: ['#AutomationBias', '#NghienCuuEdTech', '#CanThiep', '#PrePostDesign'],
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
    version: 1,
  },
];

// 16. PROMPTS
const SEED_PROMPTS: PromptTemplate[] = [
  {
    id: 'pmt-001',
    title: 'Tạo bẫy lỗi nhận thức trong phản ứng Hóa học (AI Error Injector)',
    purpose: 'Yêu cầu AI sinh ra một câu trả lời thoạt nhìn rất thuyết phục nhưng cài cắm 1 lỗi bản chất tinh vi để kiểm tra năng lực phản biện của học sinh.',
    model: 'gemini-3.8-flash',
    promptText: `Hãy đóng vai một chuyên gia hóa học nhưng cố tình đưa ra một lỗi sai tinh vi trong câu trả lời về chủ đề: {{topic}}.
Lỗi sai phải thuộc dạng: {{error_type}} (vd: ngược chiều Le Chatelier, sai hằng số Kc, bịa trích dẫn sách).
Câu trả lời phải viết bằng giọng điệu tự tin, khoa học, có vẻ đáng tin để kiểm tra xem người học có phát hiện được không. Đồng thời cung cấp giải thích lỗi và nguồn đối chiếu chính xác ở phần riêng.`,
    sampleInput: 'Chủ đề: Nguyên lý Le Chatelier khi thay đổi nhiệt độ; Lỗi: Phản ứng tỏa nhiệt Kc tăng khi tăng T',
    sampleOutput: 'Xem ví dụ trong Phòng kiểm chứng AI Task 1.',
    tags: ['#PromptAI', '#TaoCauHoiBay', '#KiemChung'],
    createdAt: '2026-09-02T10:00:00.000Z',
    updatedAt: '2026-09-02T10:00:00.000Z',
    version: 1,
  },
  {
    id: 'pmt-002',
    title: 'Sinh Ma trận và Bản đặc tả đề kiểm tra theo chuẩn GDPT 2018',
    purpose: 'Tự động phân bổ số câu, mức độ nhận biết/thông hiểu/vận dụng theo tỷ lệ 40-30-20-10.',
    model: 'gemini-3.8-flash',
    promptText: `Dựa trên chủ đề {{subject}} lớp {{grade}} bài học {{lesson}}, hãy sinh bảng ma trận và bản đặc tả gồm 4 mức độ: Nhận biết (40%), Thông hiểu (30%), Vận dụng (20%), Vận dụng cao (10%). Định dạng bảng chuẩn JSON.`,
    sampleInput: 'Hóa học 11 - Cân bằng hóa học',
    sampleOutput: 'Xem Ma trận Mtx-001 trong hệ thống.',
    tags: ['#PromptAI', '#MaTran', '#BanDacTa'],
    createdAt: '2026-09-03T10:00:00.000Z',
    updatedAt: '2026-09-03T10:00:00.000Z',
    version: 1,
  },
];

// 17. AUDIT LOGS
const SEED_LOGS: AuditLogEntry[] = [
  {
    id: 'log-001',
    user: 'ThS. Trần Thị Kim Oanh',
    role: 'teacher',
    action: 'CREATE_EXPERIMENT',
    objectType: 'ResearchExperiment',
    objectId: 'exp-001',
    details: 'Khởi tạo nghiên cứu Automation Bias cho học sinh THPT 2025-2026.',
    timestamp: '2026-09-05T08:00:00.000Z',
  },
  {
    id: 'log-002',
    user: 'ThS. Trần Thị Kim Oanh',
    role: 'teacher',
    action: 'IMPORT_STUDENTS',
    objectType: 'Student',
    objectId: 'std-batch',
    details: 'Nhập danh sách 8 học sinh vào 2 nhóm đối chứng và thực nghiệm.',
    timestamp: '2026-09-05T08:35:00.000Z',
  },
  {
    id: 'log-003',
    user: 'Nguyễn Minh Khôi',
    role: 'student',
    action: 'SUBMIT_VERIFICATION',
    objectType: 'VerificationSubmission',
    objectId: 'vsub-002',
    details: 'Học sinh hoàn thành kiểm chứng Nhiệm vụ 1: Phát hiện ảo giác AI về chất xúc tác.',
    timestamp: '2026-09-15T09:13:05.000Z',
  },
];

// 18. TAGS
const SEED_TAGS: Tag[] = [
  { id: 'tag-1', name: '#Hóa11', color: 'blue' },
  { id: 'tag-2', name: '#AutomationBias', color: 'purple' },
  { id: 'tag-3', name: '#CanThiep', color: 'emerald' },
  { id: 'tag-4', name: '#DoiChung', color: 'amber' },
  { id: 'tag-5', name: '#Pretest', color: 'rose' },
  { id: 'tag-6', name: '#Posttest', color: 'indigo' },
  { id: 'tag-7', name: '#KiemChungAI', color: 'cyan' },
  { id: 'tag-8', name: '#HocLieuChuan', color: 'teal' },
];

// Helper to safely get from localStorage
function getLocal<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return defaultValue;
  }
}

// Helper to safely save to localStorage
function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

export class StorageService {
  // Initialization: check version to guarantee 100% unified data
  static init(): void {
    const currentVer = localStorage.getItem(STORAGE_KEYS.DB_VERSION);
    if (!currentVer || currentVer !== DB_VERSION) {
      setLocal(STORAGE_KEYS.DB_VERSION, DB_VERSION);
      setLocal(STORAGE_KEYS.CLASSROOMS, SEED_CLASSROOMS);
      setLocal(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);
      setLocal(STORAGE_KEYS.MATERIALS, SEED_MATERIALS);
      setLocal(STORAGE_KEYS.LESSONS, SEED_LESSONS);
      setLocal(STORAGE_KEYS.ASSIGNMENTS, SEED_ASSIGNMENTS);
      setLocal(STORAGE_KEYS.SUBMISSIONS, SEED_SUBMISSIONS);
      setLocal(STORAGE_KEYS.QUESTIONS, SEED_QUESTIONS);
      setLocal(STORAGE_KEYS.MATRICES, SEED_MATRICES);
      setLocal(STORAGE_KEYS.SPECS, SEED_SPECS);
      setLocal(STORAGE_KEYS.TESTS, SEED_TESTS);
      setLocal(STORAGE_KEYS.TEST_ATTEMPTS, SEED_TEST_ATTEMPTS);
      setLocal(STORAGE_KEYS.VERIFICATION_TASKS, SEED_VERIFICATION_TASKS);
      setLocal(STORAGE_KEYS.VERIFICATION_SUBMISSIONS, SEED_VERIFICATION_SUBMISSIONS);
      setLocal(STORAGE_KEYS.PRE_POST, SEED_PRE_POST);
      setLocal(STORAGE_KEYS.NOTEBOOK, SEED_NOTEBOOK);
      setLocal(STORAGE_KEYS.PROMPTS, SEED_PROMPTS);
      setLocal(STORAGE_KEYS.LOGS, SEED_LOGS);
      setLocal(STORAGE_KEYS.TAGS, SEED_TAGS);
      setLocal(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }
  }

  // AUDIT LOG
  static addLog(action: string, objectType: string, objectId: string, details: string, user = 'ThS. Trần Thị Kim Oanh', role = 'teacher'): void {
    const logs = this.getLogs();
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user,
      role,
      action,
      objectType,
      objectId,
      details,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    setLocal(STORAGE_KEYS.LOGS, logs.slice(0, 500));
  }

  static getLogs(): AuditLogEntry[] {
    return getLocal<AuditLogEntry[]>(STORAGE_KEYS.LOGS, SEED_LOGS);
  }

  // SETTINGS
  static getSettings(): AppSettings {
    return getLocal<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  static saveSettings(settings: AppSettings): void {
    setLocal(STORAGE_KEYS.SETTINGS, settings);
    this.addLog('UPDATE_SETTINGS', 'Settings', 'app-settings', 'Cập nhật cấu hình hệ thống & công thức Automation Bias');
  }

  // STUDENTS
  static getStudents(): Student[] {
    return getLocal<Student[]>(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);
  }

  static saveStudent(student: Student): void {
    const students = this.getStudents();
    const idx = students.findIndex((s) => s.id === student.id);
    const isNew = idx === -1;
    const now = new Date().toISOString();

    if (isNew) {
      students.unshift({
        ...student,
        createdAt: now,
        updatedAt: now,
        version: 1,
      });
      this.addLog('CREATE_STUDENT', 'Student', student.id, `Tạo học sinh mới: ${student.name} (${student.code})`);
    } else {
      const prev = students[idx];
      students[idx] = {
        ...student,
        updatedAt: now,
        version: (prev.version || 1) + 1,
      };
      this.addLog('UPDATE_STUDENT', 'Student', student.id, `Cập nhật thông tin học sinh: ${student.name} (v${students[idx].version})`);
    }
    setLocal(STORAGE_KEYS.STUDENTS, students);
  }

  static deleteStudent(id: string): { success: boolean; linkedCount: number; message?: string } {
    const submissions = this.getSubmissions().filter((s) => s.studentId === id);
    const verifications = this.getVerificationSubmissions().filter((v) => v.studentId === id);
    const linkedCount = submissions.length + verifications.length;

    const students = this.getStudents();
    const student = students.find((s) => s.id === id);
    const filtered = students.filter((s) => s.id !== id);
    setLocal(STORAGE_KEYS.STUDENTS, filtered);

    this.addLog('DELETE_STUDENT', 'Student', id, `Xóa học sinh: ${student?.name || id} (Đã giải phóng ${linkedCount} liên kết)`);
    return { success: true, linkedCount };
  }

  // CLASSROOMS
  static getClassrooms(): Classroom[] {
    return getLocal<Classroom[]>(STORAGE_KEYS.CLASSROOMS, SEED_CLASSROOMS);
  }

  static saveClassroom(cls: Classroom): void {
    const list = this.getClassrooms();
    const idx = list.findIndex((c) => c.id === cls.id);
    const now = new Date().toISOString();
    if (idx === -1) {
      list.unshift({ ...cls, createdAt: now, updatedAt: now });
      this.addLog('CREATE_CLASSROOM', 'Classroom', cls.id, `Tạo lớp học mới: ${cls.name}`);
    } else {
      list[idx] = { ...cls, updatedAt: now };
      this.addLog('UPDATE_CLASSROOM', 'Classroom', cls.id, `Cập nhật lớp học: ${cls.name}`);
    }
    setLocal(STORAGE_KEYS.CLASSROOMS, list);
  }

  static deleteClassroom(id: string): { success: boolean; studentCount: number } {
    const students = this.getStudents().filter((s) => s.classroomId === id);
    const list = this.getClassrooms().filter((c) => c.id !== id);
    setLocal(STORAGE_KEYS.CLASSROOMS, list);
    this.addLog('DELETE_CLASSROOM', 'Classroom', id, `Xóa lớp học id ${id}, liên kết ${students.length} học sinh`);
    return { success: true, studentCount: students.length };
  }

  // LEARNING MATERIALS
  static getMaterials(): LearningMaterial[] {
    return getLocal<LearningMaterial[]>(STORAGE_KEYS.MATERIALS, SEED_MATERIALS);
  }

  static saveMaterial(mat: LearningMaterial): void {
    const list = this.getMaterials();
    const idx = list.findIndex((m) => m.id === mat.id);
    const now = new Date().toISOString();
    if (idx === -1) {
      list.unshift({ ...mat, createdAt: now, updatedAt: now, version: 1 });
      this.addLog('CREATE_MATERIAL', 'LearningMaterial', mat.id, `Tải lên/Tạo học liệu: ${mat.title}`);
    } else {
      list[idx] = { ...mat, updatedAt: now, version: (list[idx].version || 1) + 1 };
      this.addLog('UPDATE_MATERIAL', 'LearningMaterial', mat.id, `Cập nhật học liệu: ${mat.title} (v${list[idx].version})`);
    }
    setLocal(STORAGE_KEYS.MATERIALS, list);
  }

  static deleteMaterial(id: string): boolean {
    const list = this.getMaterials();
    const item = list.find((m) => m.id === id);
    setLocal(STORAGE_KEYS.MATERIALS, list.filter((m) => m.id !== id));
    this.addLog('DELETE_MATERIAL', 'LearningMaterial', id, `Xóa học liệu: ${item?.title || id}`);
    return true;
  }

  // LESSONS
  static getLessons(): Lesson[] {
    return getLocal<Lesson[]>(STORAGE_KEYS.LESSONS, SEED_LESSONS);
  }

  static saveLesson(lesson: Lesson): void {
    const list = this.getLessons();
    const idx = list.findIndex((l) => l.id === lesson.id);
    const now = new Date().toISOString();
    if (idx === -1) {
      list.unshift({ ...lesson, createdAt: now, updatedAt: now, version: 1 });
      this.addLog('CREATE_LESSON', 'Lesson', lesson.id, `Tạo bài học mới: ${lesson.title}`);
    } else {
      list[idx] = { ...lesson, updatedAt: now, version: (list[idx].version || 1) + 1 };
      this.addLog('UPDATE_LESSON', 'Lesson', lesson.id, `Cập nhật bài học: ${lesson.title} (v${list[idx].version})`);
    }
    setLocal(STORAGE_KEYS.LESSONS, list);
  }

  static deleteLesson(id: string): boolean {
    const list = this.getLessons();
    const item = list.find((l) => l.id === id);
    setLocal(STORAGE_KEYS.LESSONS, list.filter((l) => l.id !== id));
    this.addLog('DELETE_LESSON', 'Lesson', id, `Xóa bài học: ${item?.title || id}`);
    return true;
  }

  // ASSIGNMENTS & SUBMISSIONS
  static getAssignments(): Assignment[] {
    return getLocal<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, SEED_ASSIGNMENTS);
  }

  static saveAssignment(asn: Assignment): void {
    const list = this.getAssignments();
    const idx = list.findIndex((a) => a.id === asn.id);
    const now = new Date().toISOString();
    if (idx === -1) {
      list.unshift({ ...asn, createdAt: now, updatedAt: now });
      this.addLog('CREATE_ASSIGNMENT', 'Assignment', asn.id, `Giao nhiệm vụ: ${asn.title}`);
    } else {
      list[idx] = { ...asn, updatedAt: now };
      this.addLog('UPDATE_ASSIGNMENT', 'Assignment', asn.id, `Cập nhật nhiệm vụ: ${asn.title}`);
    }
    setLocal(STORAGE_KEYS.ASSIGNMENTS, list);
  }

  static deleteAssignment(id: string): boolean {
    const list = this.getAssignments();
    setLocal(STORAGE_KEYS.ASSIGNMENTS, list.filter((a) => a.id !== id));
    this.addLog('DELETE_ASSIGNMENT', 'Assignment', id, `Xóa nhiệm vụ id ${id}`);
    return true;
  }

  static getSubmissions(): Submission[] {
    return getLocal<Submission[]>(STORAGE_KEYS.SUBMISSIONS, SEED_SUBMISSIONS);
  }

  static saveSubmission(sub: Submission): void {
    const list = this.getSubmissions();
    const idx = list.findIndex((s) => s.id === sub.id);
    if (idx === -1) {
      list.unshift(sub);
      this.addLog('SUBMIT_ASSIGNMENT', 'Submission', sub.id, `Nộp bài làm nhiệm vụ bởi ${sub.studentName}`);
    } else {
      list[idx] = sub;
      this.addLog('UPDATE_SUBMISSION', 'Submission', sub.id, `Cập nhật bài làm/chấm điểm cho ${sub.studentName}`);
    }
    setLocal(STORAGE_KEYS.SUBMISSIONS, list);
  }

  // QUESTION BANK
  static getQuestions(): Question[] {
    return getLocal<Question[]>(STORAGE_KEYS.QUESTIONS, SEED_QUESTIONS);
  }

  static saveQuestion(q: Question): void {
    const list = this.getQuestions();
    const idx = list.findIndex((item) => item.id === q.id);
    if (idx === -1) {
      list.unshift({ ...q, version: 1 });
      this.addLog('CREATE_QUESTION', 'Question', q.id, `Thêm câu hỏi [${q.code}]: ${q.question.substring(0, 40)}...`);
    } else {
      list[idx] = { ...q, version: (list[idx].version || 1) + 1 };
      this.addLog('UPDATE_QUESTION', 'Question', q.id, `Sửa câu hỏi [${q.code}] (v${list[idx].version})`);
    }
    setLocal(STORAGE_KEYS.QUESTIONS, list);
  }

  static deleteQuestion(id: string): boolean {
    const list = this.getQuestions();
    setLocal(STORAGE_KEYS.QUESTIONS, list.filter((q) => q.id !== id));
    this.addLog('DELETE_QUESTION', 'Question', id, `Xóa câu hỏi ${id}`);
    return true;
  }

  // MATRICES & SPECS
  static getMatrices(): TestMatrix[] {
    return getLocal<TestMatrix[]>(STORAGE_KEYS.MATRICES, SEED_MATRICES);
  }

  static saveMatrix(matrix: TestMatrix): void {
    const list = this.getMatrices();
    const idx = list.findIndex((m) => m.id === matrix.id);
    const now = new Date().toISOString();
    if (idx === -1) {
      list.unshift({ ...matrix, createdAt: now, updatedAt: now, version: 1 });
      this.addLog('CREATE_MATRIX', 'TestMatrix', matrix.id, `Tạo ma trận đề: ${matrix.title}`);
    } else {
      list[idx] = { ...matrix, updatedAt: now, version: (list[idx].version || 1) + 1 };
      this.addLog('UPDATE_MATRIX', 'TestMatrix', matrix.id, `Cập nhật ma trận đề: ${matrix.title} (v${list[idx].version})`);
    }
    setLocal(STORAGE_KEYS.MATRICES, list);
  }

  static deleteMatrix(id: string): boolean {
    const list = this.getMatrices();
    setLocal(STORAGE_KEYS.MATRICES, list.filter((m) => m.id !== id));
    this.addLog('DELETE_MATRIX', 'TestMatrix', id, `Xóa ma trận đề ${id}`);
    return true;
  }

  static getSpecs(): TestSpecification[] {
    return getLocal<TestSpecification[]>(STORAGE_KEYS.SPECS, SEED_SPECS);
  }

  static saveSpec(spec: TestSpecification): void {
    const list = this.getSpecs();
    const idx = list.findIndex((s) => s.id === spec.id);
    const now = new Date().toISOString();
    if (idx === -1) {
      list.unshift({ ...spec, createdAt: now, updatedAt: now, version: 1 });
      this.addLog('CREATE_SPEC', 'TestSpecification', spec.id, `Tạo bản đặc tả đề: ${spec.title}`);
    } else {
      list[idx] = { ...spec, updatedAt: now, version: (list[idx].version || 1) + 1 };
      this.addLog('UPDATE_SPEC', 'TestSpecification', spec.id, `Cập nhật bản đặc tả: ${spec.title} (v${list[idx].version})`);
    }
    setLocal(STORAGE_KEYS.SPECS, list);
  }

  static deleteSpec(id: string): boolean {
    const list = this.getSpecs();
    setLocal(STORAGE_KEYS.SPECS, list.filter((s) => s.id !== id));
    this.addLog('DELETE_SPEC', 'TestSpecification', id, `Xóa bản đặc tả ${id}`);
    return true;
  }

  // TESTS
  static getTests(): Test[] {
    return getLocal<Test[]>(STORAGE_KEYS.TESTS, SEED_TESTS);
  }

  static saveTest(test: Test): void {
    const list = this.getTests();
    const idx = list.findIndex((t) => t.id === test.id);
    const now = new Date().toISOString();
    if (idx === -1) {
      list.unshift({ ...test, createdAt: now, updatedAt: now, version: 1 });
      this.addLog('CREATE_TEST', 'Test', test.id, `Tạo đề kiểm tra mới: ${test.title}`);
    } else {
      list[idx] = { ...test, updatedAt: now, version: (list[idx].version || 1) + 1 };
      this.addLog('UPDATE_TEST', 'Test', test.id, `Cập nhật đề kiểm tra: ${test.title} (v${list[idx].version})`);
    }
    setLocal(STORAGE_KEYS.TESTS, list);
  }

  static deleteTest(id: string): boolean {
    const list = this.getTests();
    setLocal(STORAGE_KEYS.TESTS, list.filter((t) => t.id !== id));
    this.addLog('DELETE_TEST', 'Test', id, `Xóa đề kiểm tra ${id}`);
    return true;
  }

  static duplicateTest(id: string): Test | null {
    const list = this.getTests();
    const test = list.find((t) => t.id === id);
    if (!test) return null;
    const duplicated: Test = {
      ...test,
      id: `test-${Date.now()}`,
      title: `${test.title} (Bản sao)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };
    list.unshift(duplicated);
    setLocal(STORAGE_KEYS.TESTS, list);
    this.addLog('DUPLICATE_TEST', 'Test', duplicated.id, `Nhân bản đề kiểm tra: ${duplicated.title}`);
    return duplicated;
  }

  // TEST ATTEMPTS
  static getTestAttempts(): TestAttempt[] {
    return getLocal<TestAttempt[]>(STORAGE_KEYS.TEST_ATTEMPTS, SEED_TEST_ATTEMPTS);
  }

  static saveTestAttempt(attempt: TestAttempt): void {
    const list = this.getTestAttempts();
    const idx = list.findIndex((a) => a.id === attempt.id);
    if (idx === -1) {
      list.unshift(attempt);
      this.addLog('START_TEST', 'TestAttempt', attempt.id, `Học sinh ${attempt.studentName} bắt đầu làm đề ${attempt.testTitle}`);
    } else {
      list[idx] = attempt;
      if (attempt.status === 'submitted') {
        this.addLog('SUBMIT_TEST', 'TestAttempt', attempt.id, `Học sinh ${attempt.studentName} nộp đề đạt ${attempt.score}/${attempt.maxScore}đ`);
      }
    }
    setLocal(STORAGE_KEYS.TEST_ATTEMPTS, list);
  }

  // VERIFICATION TASKS & SUBMISSIONS
  static getVerificationTasks(): VerificationTask[] {
    return getLocal<VerificationTask[]>(STORAGE_KEYS.VERIFICATION_TASKS, SEED_VERIFICATION_TASKS);
  }

  static saveVerificationTask(task: VerificationTask): void {
    const list = this.getVerificationTasks();
    const idx = list.findIndex((t) => t.id === task.id);
    const now = new Date().toISOString();
    if (idx === -1) {
      list.unshift({ ...task, createdAt: now, updatedAt: now, version: 1 });
      this.addLog('CREATE_VERIFICATION_TASK', 'VerificationTask', task.id, `Tạo nhiệm vụ kiểm chứng: ${task.title}`);
    } else {
      list[idx] = { ...task, updatedAt: now, version: (list[idx].version || 1) + 1 };
      this.addLog('UPDATE_VERIFICATION_TASK', 'VerificationTask', task.id, `Sửa nhiệm vụ kiểm chứng: ${task.title} (v${list[idx].version})`);
    }
    setLocal(STORAGE_KEYS.VERIFICATION_TASKS, list);
  }

  static deleteVerificationTask(id: string): boolean {
    const list = this.getVerificationTasks();
    setLocal(STORAGE_KEYS.VERIFICATION_TASKS, list.filter((t) => t.id !== id));
    this.addLog('DELETE_VERIFICATION_TASK', 'VerificationTask', id, `Xóa nhiệm vụ kiểm chứng ${id}`);
    return true;
  }

  static getVerificationSubmissions(): VerificationSubmission[] {
    return getLocal<VerificationSubmission[]>(STORAGE_KEYS.VERIFICATION_SUBMISSIONS, SEED_VERIFICATION_SUBMISSIONS);
  }

  static saveVerificationSubmission(sub: VerificationSubmission): void {
    const list = this.getVerificationSubmissions();
    const idx = list.findIndex((s) => s.id === sub.id);
    if (idx === -1) {
      list.unshift(sub);
      this.addLog('SUBMIT_VERIFICATION', 'VerificationSubmission', sub.id, `Ghi nhận thực nghiệm kiểm chứng AI của ${sub.studentName} (Điều kiện: ${sub.condition})`);
    } else {
      list[idx] = sub;
    }
    setLocal(STORAGE_KEYS.VERIFICATION_SUBMISSIONS, list);
  }

  // PRE-TEST / POST-TEST ASSESSMENTS
  static getPrePost(): PrePostAssessment[] {
    return getLocal<PrePostAssessment[]>(STORAGE_KEYS.PRE_POST, SEED_PRE_POST);
  }

  static savePrePost(item: PrePostAssessment): void {
    const list = this.getPrePost();
    const idx = list.findIndex((p) => p.id === item.id);
    if (idx === -1) {
      list.unshift(item);
      this.addLog('RECORD_PRE_POST', 'PrePostAssessment', item.id, `Lưu kết quả ${item.type} cho ${item.studentName} (ABI: ${item.automationBiasIndicator.toFixed(1)})`);
    } else {
      list[idx] = item;
    }
    setLocal(STORAGE_KEYS.PRE_POST, list);
  }

  // RESEARCH NOTEBOOK
  static getNotebook(): ResearchNotebookEntry[] {
    return getLocal<ResearchNotebookEntry[]>(STORAGE_KEYS.NOTEBOOK, SEED_NOTEBOOK);
  }

  static saveNotebookEntry(entry: ResearchNotebookEntry): void {
    const list = this.getNotebook();
    const idx = list.findIndex((e) => e.id === entry.id);
    const now = new Date().toISOString();
    if (idx === -1) {
      list.unshift({ ...entry, createdAt: now, updatedAt: now, version: 1 });
      this.addLog('CREATE_NOTEBOOK_ENTRY', 'ResearchNotebook', entry.id, `Thêm mục nghiên cứu: ${entry.title}`);
    } else {
      list[idx] = { ...entry, updatedAt: now, version: (list[idx].version || 1) + 1 };
      this.addLog('UPDATE_NOTEBOOK_ENTRY', 'ResearchNotebook', entry.id, `Cập nhật mục nghiên cứu: ${entry.title}`);
    }
    setLocal(STORAGE_KEYS.NOTEBOOK, list);
  }

  static deleteNotebookEntry(id: string): boolean {
    const list = this.getNotebook();
    setLocal(STORAGE_KEYS.NOTEBOOK, list.filter((e) => e.id !== id));
    this.addLog('DELETE_NOTEBOOK_ENTRY', 'ResearchNotebook', id, `Xóa mục nghiên cứu ${id}`);
    return true;
  }

  // PROMPTS
  static getPrompts(): PromptTemplate[] {
    return getLocal<PromptTemplate[]>(STORAGE_KEYS.PROMPTS, SEED_PROMPTS);
  }

  static savePrompt(prompt: PromptTemplate): void {
    const list = this.getPrompts();
    const idx = list.findIndex((p) => p.id === prompt.id);
    const now = new Date().toISOString();
    if (idx === -1) {
      list.unshift({ ...prompt, createdAt: now, updatedAt: now, version: 1 });
      this.addLog('CREATE_PROMPT', 'PromptTemplate', prompt.id, `Tạo Prompt mẫu: ${prompt.title}`);
    } else {
      list[idx] = { ...prompt, updatedAt: now, version: (list[idx].version || 1) + 1 };
      this.addLog('UPDATE_PROMPT', 'PromptTemplate', prompt.id, `Cập nhật Prompt mẫu: ${prompt.title}`);
    }
    setLocal(STORAGE_KEYS.PROMPTS, list);
  }

  static deletePrompt(id: string): boolean {
    const list = this.getPrompts();
    setLocal(STORAGE_KEYS.PROMPTS, list.filter((p) => p.id !== id));
    this.addLog('DELETE_PROMPT', 'PromptTemplate', id, `Xóa Prompt mẫu ${id}`);
    return true;
  }

  // TAGS
  static getTags(): Tag[] {
    return getLocal<Tag[]>(STORAGE_KEYS.TAGS, SEED_TAGS);
  }

  static saveTag(tag: Tag): void {
    const list = this.getTags();
    const idx = list.findIndex((t) => t.id === tag.id);
    if (idx === -1) {
      list.push(tag);
      this.addLog('CREATE_TAG', 'Tag', tag.id, `Tạo thẻ Tag mới: ${tag.name}`);
    } else {
      list[idx] = tag;
    }
    setLocal(STORAGE_KEYS.TAGS, list);
  }

  static deleteTag(id: string): boolean {
    const list = this.getTags();
    setLocal(STORAGE_KEYS.TAGS, list.filter((t) => t.id !== id));
    this.addLog('DELETE_TAG', 'Tag', id, `Xóa thẻ Tag ${id}`);
    return true;
  }

  // DATA VAULT - EXPORT FULL BACKUP
  static exportFullBackupJSON(): string {
    const payload = {
      app: 'AutoBiasEd',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      data: {
        classrooms: this.getClassrooms(),
        students: this.getStudents(),
        materials: this.getMaterials(),
        lessons: this.getLessons(),
        assignments: this.getAssignments(),
        submissions: this.getSubmissions(),
        questions: this.getQuestions(),
        matrices: this.getMatrices(),
        specs: this.getSpecs(),
        tests: this.getTests(),
        testAttempts: this.getTestAttempts(),
        verificationTasks: this.getVerificationTasks(),
        verificationSubmissions: this.getVerificationSubmissions(),
        prePost: this.getPrePost(),
        notebook: this.getNotebook(),
        prompts: this.getPrompts(),
        logs: this.getLogs(),
        tags: this.getTags(),
        settings: this.getSettings(),
      },
    };
    this.addLog('EXPORT_BACKUP', 'DataVault', 'all', 'Xuất toàn bộ cơ sở dữ liệu hệ thống ra tệp JSON');
    return JSON.stringify(payload, null, 2);
  }

  // DATA VAULT - IMPORT FULL BACKUP
  static importFullBackupJSON(jsonStr: string, mode: 'replace' | 'merge' = 'replace'): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.data) {
        return { success: false, message: 'Tệp JSON không đúng cấu trúc sao lưu của AutoBiasEd (thiếu trường data).' };
      }

      const d = parsed.data;
      if (mode === 'replace') {
        if (d.classrooms) setLocal(STORAGE_KEYS.CLASSROOMS, d.classrooms);
        if (d.students) setLocal(STORAGE_KEYS.STUDENTS, d.students);
        if (d.materials) setLocal(STORAGE_KEYS.MATERIALS, d.materials);
        if (d.lessons) setLocal(STORAGE_KEYS.LESSONS, d.lessons);
        if (d.assignments) setLocal(STORAGE_KEYS.ASSIGNMENTS, d.assignments);
        if (d.submissions) setLocal(STORAGE_KEYS.SUBMISSIONS, d.submissions);
        if (d.questions) setLocal(STORAGE_KEYS.QUESTIONS, d.questions);
        if (d.matrices) setLocal(STORAGE_KEYS.MATRICES, d.matrices);
        if (d.specs) setLocal(STORAGE_KEYS.SPECS, d.specs);
        if (d.tests) setLocal(STORAGE_KEYS.TESTS, d.tests);
        if (d.testAttempts) setLocal(STORAGE_KEYS.TEST_ATTEMPTS, d.testAttempts);
        if (d.verificationTasks) setLocal(STORAGE_KEYS.VERIFICATION_TASKS, d.verificationTasks);
        if (d.verificationSubmissions) setLocal(STORAGE_KEYS.VERIFICATION_SUBMISSIONS, d.verificationSubmissions);
        if (d.prePost) setLocal(STORAGE_KEYS.PRE_POST, d.prePost);
        if (d.notebook) setLocal(STORAGE_KEYS.NOTEBOOK, d.notebook);
        if (d.prompts) setLocal(STORAGE_KEYS.PROMPTS, d.prompts);
        if (d.tags) setLocal(STORAGE_KEYS.TAGS, d.tags);
        if (d.settings) setLocal(STORAGE_KEYS.SETTINGS, d.settings);

        this.addLog('IMPORT_BACKUP', 'DataVault', 'all', 'Khôi phục toàn bộ cơ sở dữ liệu từ tệp JSON (chế độ Thay thế)');
        return { success: true, message: 'Đã khôi phục dữ liệu thành công!' };
      } else {
        const mergeArrays = (key: string, incoming: any[]) => {
          if (!incoming || !Array.isArray(incoming)) return;
          const current = getLocal<any[]>(key, []);
          const map = new Map<string, any>();
          current.forEach((item) => map.set(item.id, item));
          incoming.forEach((item) => map.set(item.id, item));
          setLocal(key, Array.from(map.values()));
        };

        mergeArrays(STORAGE_KEYS.CLASSROOMS, d.classrooms);
        mergeArrays(STORAGE_KEYS.STUDENTS, d.students);
        mergeArrays(STORAGE_KEYS.MATERIALS, d.materials);
        mergeArrays(STORAGE_KEYS.LESSONS, d.lessons);
        mergeArrays(STORAGE_KEYS.ASSIGNMENTS, d.assignments);
        mergeArrays(STORAGE_KEYS.SUBMISSIONS, d.submissions);
        mergeArrays(STORAGE_KEYS.QUESTIONS, d.questions);
        mergeArrays(STORAGE_KEYS.MATRICES, d.matrices);
        mergeArrays(STORAGE_KEYS.SPECS, d.specs);
        mergeArrays(STORAGE_KEYS.TESTS, d.tests);
        mergeArrays(STORAGE_KEYS.TEST_ATTEMPTS, d.testAttempts);
        mergeArrays(STORAGE_KEYS.VERIFICATION_TASKS, d.verificationTasks);
        mergeArrays(STORAGE_KEYS.VERIFICATION_SUBMISSIONS, d.verificationSubmissions);
        mergeArrays(STORAGE_KEYS.PRE_POST, d.prePost);
        mergeArrays(STORAGE_KEYS.NOTEBOOK, d.notebook);
        mergeArrays(STORAGE_KEYS.PROMPTS, d.prompts);
        mergeArrays(STORAGE_KEYS.TAGS, d.tags);

        this.addLog('IMPORT_BACKUP', 'DataVault', 'all', 'Hợp nhất dữ liệu thành công từ tệp JSON (chế độ Hợp nhất)');
        return { success: true, message: 'Đã hợp nhất dữ liệu thành công!' };
      }
    } catch (e: any) {
      return { success: false, message: `Lỗi đọc tệp JSON: ${e.message}` };
    }
  }

  // WIPE DATABASE
  static resetAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.DB_VERSION);
    localStorage.clear();
    this.init();
    this.addLog('RESET_DATABASE', 'DataVault', 'all', 'Đã đặt lại toàn bộ hệ thống về dữ liệu nghiên cứu mẫu ban đầu');
  }
}

// Auto-run init
StorageService.init();
