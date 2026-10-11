export type Role = 'teacher' | 'student' | 'admin';

export type CognitiveLevel = 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';

export interface Student {
  id: string;
  code: string; // Mã học sinh, vd: HS2026-001
  name: string;
  classroomId: string;
  className?: string;
  schoolYear: string;
  status: 'active' | 'inactive';
  group: 'control' | 'intervention'; // Nhóm thực nghiệm nghiên cứu
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface Classroom {
  id: string;
  name: string;
  grade: number; // 10, 11, 12
  schoolYear: string;
  teacherName: string;
  studentCount: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface LearningMaterial {
  id: string;
  title: string;
  subject: string;
  grade: number;
  topic: string;
  lesson: string;
  schoolYear: string;
  author: string;
  tags: string[];
  version: number;
  fileType: string;
  fileName: string;
  fileSize: number; // bytes
  fileDataUrl?: string; // base64 or text preview
  description: string;
  linkedLessonIds: string[];
  linkedTestIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  subject: string;
  grade: number;
  topic: string;
  objectives: string[];
  backgroundKnowledge: string;
  content: string;
  materialIds: string[];
  assignmentIds: string[];
  testIds: string[];
  verificationTaskIds: string[];
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  classroomId: string;
  subject: string;
  topic: string;
  deadline: string;
  attachedFiles: { name: string; size: number; url?: string }[];
  rubrics: string[];
  maxScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  content: string;
  attachedFiles: { name: string; size: number; dataUrl?: string; type?: string }[];
  submittedAt: string;
  status: 'draft' | 'submitted' | 'graded';
  score?: number;
  feedback?: string;
  gradedAt?: string;
}

export interface Question {
  id: string;
  code: string; // VD: C01, C02
  subject: string;
  grade: number;
  topic: string;
  cognitiveLevel: CognitiveLevel;
  type: QuestionType;
  question: string;
  options?: string[]; // for multiple_choice
  correctAnswer: string | string[]; // answer letter or text
  explanation: string;
  points: number;
  version: number;
  aiGenerated?: boolean;
}

export interface MatrixRow {
  id: string;
  topic: string;
  content: string;
  level: CognitiveLevel;
  questionsCount: number;
  points: number;
  percentage: number;
}

export interface TestMatrix {
  id: string;
  title: string;
  subject: string;
  grade: number;
  totalQuestions: number;
  totalPoints: number;
  rows: MatrixRow[];
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface SpecRow {
  id: string;
  topic: string;
  content: string;
  requirement: string; // Yêu cầu cần đạt
  level: CognitiveLevel;
  questionsCount: number;
  format: QuestionType;
  points: number;
  questionCodes: string[];
}

export interface TestSpecification {
  id: string;
  title: string;
  matrixId?: string;
  subject: string;
  grade: number;
  rows: SpecRow[];
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface TestValidationCheck {
  label: string;
  passed: boolean;
  details: string;
  severity: 'error' | 'warning' | 'info';
}

export interface TestValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  checks: TestValidationCheck[];
}

export interface Test {
  id: string;
  title: string;
  subject: string;
  grade: number;
  durationMinutes: number;
  totalQuestions: number;
  totalPoints: number;
  questions: Question[];
  matrixId?: string;
  specId?: string;
  status: 'draft' | 'published' | 'archived';
  validationResult?: TestValidationResult;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface TestAttempt {
  id: string;
  testId: string;
  testTitle: string;
  studentId: string;
  studentName: string;
  answers: Record<string, any>;
  startedAt: string;
  submittedAt?: string;
  score: number;
  maxScore: number;
  status: 'in_progress' | 'submitted';
}

export type AIErrorType =
  | 'none'
  | 'factual_error'
  | 'logical_fallacy'
  | 'fabricated_citation'
  | 'outdated_knowledge'
  | 'subtle_bias';

export interface VerificationTask {
  id: string;
  title: string;
  subject: string;
  topic: string;
  aiPrompt: string;
  aiResponse: string;
  groundTruth: string;
  errorType: AIErrorType;
  errorDescription: string;
  suggestedEvidence: string;
  learningMaterialRef: string;
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
  targetGroup?: 'control' | 'intervention' | 'all';
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface VerificationSubmission {
  id: string;
  taskId: string;
  taskTitle?: string;
  studentId: string;
  studentName: string;
  condition: 'control' | 'intervention';
  viewStartTime: string;
  initialDecisionTime: string;
  initialDecision: 'agree' | 'disagree' | 'uncertain';
  initialDecisionDurationSec: number;
  reason: string;
  selectedEvidence: string;
  editedResponse: string;
  finalDecision: 'agree' | 'disagree' | 'uncertain';
  confidence: number; // 1-5
  verificationDurationSec: number;
  editCount: number;
  isAiErrorAccepted: boolean;
  isCorrectDecision: boolean;
  attachedFiles?: { name: string; size: number; dataUrl?: string; type?: string }[];
  submittedAt: string;
}

export interface AutomationBiasFormulaConfig {
  errorAcceptanceWeight: number; // trọng số chấp nhận lỗi AI
  nonVerificationWeight: number; // trọng số không kiểm chứng
  confidenceWeight: number; // trọng số tự tin khi sai
  formulaName: string;
  formulaDescription: string;
}

export interface PrePostAssessment {
  id: string;
  type: 'pre_test' | 'post_test';
  studentId: string;
  studentName: string;
  group: 'control' | 'intervention';
  score: number;
  maxScore: number;
  verificationAccuracyPct: number;
  aiErrorAcceptanceRatePct: number;
  automationBiasIndicator: number; // 0 - 100 scale
  timestamp: string;
}

export interface ResearchNotebookEntry {
  id: string;
  title: string;
  researchQuestion: string;
  hypothesis: string;
  independentVariable: string;
  dependentVariable: string;
  methodology: string;
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface PromptTemplate {
  id: string;
  title: string;
  purpose: string;
  model: string;
  promptText: string;
  sampleInput: string;
  sampleOutput: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface AuditLogEntry {
  id: string;
  user: string;
  role: string;
  action: string;
  objectType: string;
  objectId: string;
  details: string;
  timestamp: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface AppSettings {
  anonymizeData: boolean;
  theme: 'light' | 'dark';
  aiModel: string;
  temperature: number;
  biasFormula: AutomationBiasFormulaConfig;
  autoSaveIntervalSec: number;
  lastBackupDate?: string;
}
