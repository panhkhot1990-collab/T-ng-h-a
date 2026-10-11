import { AutomationBiasFormulaConfig, VerificationSubmission, PrePostAssessment } from '../types';

export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, v) => acc + v, 0);
  return sum / values.length;
}

export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 !== 0) {
    return sorted[mid];
  }
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

export function calculateSD(values: number[]): number {
  if (values.length <= 1) return 0;
  const mean = calculateMean(values);
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function calculateMinMax(values: number[]): { min: number; max: number } {
  if (values.length === 0) return { min: 0, max: 0 };
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

export interface DescriptiveStats {
  count: number;
  mean: number;
  median: number;
  sd: number;
  min: number;
  max: number;
}

export function computeDescriptiveStats(values: number[]): DescriptiveStats {
  const { min, max } = calculateMinMax(values);
  return {
    count: values.length,
    mean: Number(calculateMean(values).toFixed(2)),
    median: Number(calculateMedian(values).toFixed(2)),
    sd: Number(calculateSD(values).toFixed(2)),
    min: Number(min.toFixed(2)),
    max: Number(max.toFixed(2)),
  };
}

/**
 * Calculates Automation Bias Indicator (0-100 scale) for a student or submission batch
 * Formula configured by user or default:
 * ABI = (Error Acceptance Rate * w1) + (Non-verification Rate * w2) + (Confidence When Flawed * w3)
 */
export function calculateAutomationBiasIndicator(
  submissions: VerificationSubmission[],
  formulaConfig: AutomationBiasFormulaConfig
): {
  abi: number;
  errorAcceptanceRatePct: number;
  nonVerificationRatePct: number;
  meanConfidence: number;
  interpretation: string;
} {
  if (submissions.length === 0) {
    return {
      abi: 0,
      errorAcceptanceRatePct: 0,
      nonVerificationRatePct: 0,
      meanConfidence: 0,
      interpretation: 'Chưa đủ dữ liệu thực nghiệm để tính toán chỉ báo.',
    };
  }

  // 1. Error acceptance rate: student accepted AI answer when AI was flawed
  const errorAcceptedCount = submissions.filter((s) => s.isAiErrorAccepted).length;
  const errorAcceptanceRatePct = (errorAcceptedCount / submissions.length) * 100;

  // 2. Non-verification rate: verification duration < 30s or edit count == 0 and no evidence selected
  const nonVerifiedCount = submissions.filter(
    (s) => s.verificationDurationSec < 30 && (!s.selectedEvidence || s.selectedEvidence.trim() === '')
  ).length;
  const nonVerificationRatePct = (nonVerifiedCount / submissions.length) * 100;

  // 3. Mean confidence (1-5 scaled to 0-100)
  const confidences = submissions.map((s) => s.confidence || 3);
  const meanConf = calculateMean(confidences);
  const confPct = (meanConf / 5) * 100;

  // Weighted calculation
  const totalWeight =
    formulaConfig.errorAcceptanceWeight +
    formulaConfig.nonVerificationWeight +
    formulaConfig.confidenceWeight;

  const abi =
    (errorAcceptanceRatePct * formulaConfig.errorAcceptanceWeight +
      nonVerificationRatePct * formulaConfig.nonVerificationWeight +
      confPct * formulaConfig.confidenceWeight) /
    (totalWeight || 1);

  let interpretation = '';
  if (abi < 25) {
    interpretation = 'Mức độ cảnh giác cao: Người học chủ động kiểm chứng, phản biện tốt các phát biểu của AI.';
  } else if (abi < 55) {
    interpretation = 'Mức độ thiên lệch trung bình: Người học có nhận thức phản biện nhưng đôi lúc còn phụ thuộc vào lập luận của AI.';
  } else {
    interpretation = 'Chỉ báo thiên lệch tự động hóa cao: Người học có xu hướng tiếp nhận ngay kết quả do AI cung cấp mà ít đối chiếu tài liệu nguồn.';
  }

  return {
    abi: Number(abi.toFixed(1)),
    errorAcceptanceRatePct: Number(errorAcceptanceRatePct.toFixed(1)),
    nonVerificationRatePct: Number(nonVerificationRatePct.toFixed(1)),
    meanConfidence: Number(meanConf.toFixed(2)),
    interpretation,
  };
}

// Compare Pre and Post tests
export function comparePrePost(preAssessments: PrePostAssessment[], postAssessments: PrePostAssessment[]) {
  const preScores = preAssessments.map((p) => p.score);
  const postScores = postAssessments.map((p) => p.score);
  const preABI = preAssessments.map((p) => p.automationBiasIndicator);
  const postABI = postAssessments.map((p) => p.automationBiasIndicator);
  const preAccuracy = preAssessments.map((p) => p.verificationAccuracyPct);
  const postAccuracy = postAssessments.map((p) => p.verificationAccuracyPct);

  return {
    preStats: {
      score: computeDescriptiveStats(preScores),
      abi: computeDescriptiveStats(preABI),
      accuracy: computeDescriptiveStats(preAccuracy),
    },
    postStats: {
      score: computeDescriptiveStats(postScores),
      abi: computeDescriptiveStats(postABI),
      accuracy: computeDescriptiveStats(postAccuracy),
    },
    deltaScore: Number((calculateMean(postScores) - calculateMean(preScores)).toFixed(2)),
    deltaABI: Number((calculateMean(postABI) - calculateMean(preABI)).toFixed(2)),
    deltaAccuracy: Number((calculateMean(postAccuracy) - calculateMean(preAccuracy)).toFixed(2)),
  };
}
