import { Test, Question, TestMatrix, TestSpecification, TestValidationResult, TestValidationCheck } from '../types';

export function validateTest(
  test: Partial<Test>,
  matrix?: TestMatrix,
  spec?: TestSpecification
): TestValidationResult {
  const checks: TestValidationCheck[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  const questions: Question[] = test.questions || [];

  // Check 1: Has questions
  if (questions.length === 0) {
    errors.push('Đề kiểm tra chưa có câu hỏi nào.');
    checks.push({
      label: 'Số lượng câu hỏi',
      passed: false,
      details: 'Đề kiểm tra chưa có câu hỏi nào. Cần ít nhất 1 câu hỏi.',
      severity: 'error',
    });
  } else {
    checks.push({
      label: 'Số lượng câu hỏi',
      passed: true,
      details: `Đề hiện có ${questions.length} câu hỏi.`,
      severity: 'info',
    });
  }

  // Check 2: Total points
  const totalCalculatedPoints = questions.reduce((acc, q) => acc + (Number(q.points) || 0), 0);
  const targetPoints = test.totalPoints || 10;
  if (Math.abs(totalCalculatedPoints - targetPoints) > 0.05) {
    warnings.push(`Tổng điểm các câu hỏi (${totalCalculatedPoints.toFixed(1)}đ) chưa khớp với tổng điểm dự kiến (${targetPoints}đ).`);
    checks.push({
      label: 'Tổng điểm kiểm tra',
      passed: false,
      details: `Tổng điểm hiện tại là ${totalCalculatedPoints.toFixed(1)} / ${targetPoints} điểm.`,
      severity: 'warning',
    });
  } else {
    checks.push({
      label: 'Tổng điểm kiểm tra',
      passed: true,
      details: `Tổng điểm đạt chuẩn ${targetPoints} điểm.`,
      severity: 'info',
    });
  }

  // Check 3: Check missing questions content or answers
  let emptyQuestionCount = 0;
  let missingAnswerCount = 0;
  let missingOptionsCount = 0;

  questions.forEach((q, idx) => {
    if (!q.question || q.question.trim().length < 5) {
      emptyQuestionCount++;
    }
    if (!q.correctAnswer || (typeof q.correctAnswer === 'string' && q.correctAnswer.trim() === '')) {
      missingAnswerCount++;
    }
    if (q.type === 'multiple_choice' && (!q.options || q.options.length < 2)) {
      missingOptionsCount++;
    }
  });

  if (emptyQuestionCount > 0) {
    errors.push(`Có ${emptyQuestionCount} câu hỏi bị thiếu nội dung hoặc quá ngắn.`);
    checks.push({
      label: 'Nội dung câu hỏi',
      passed: false,
      details: `${emptyQuestionCount} câu hỏi chưa hoàn thiện nội dung.`,
      severity: 'error',
    });
  } else {
    checks.push({
      label: 'Nội dung câu hỏi',
      passed: true,
      details: 'Tất cả câu hỏi đều có nội dung hoàn chỉnh.',
      severity: 'info',
    });
  }

  if (missingAnswerCount > 0) {
    errors.push(`Có ${missingAnswerCount} câu hỏi chưa có đáp án đúng.`);
    checks.push({
      label: 'Đáp án câu hỏi',
      passed: false,
      details: `${missingAnswerCount} câu hỏi đang để trống đáp án.`,
      severity: 'error',
    });
  } else {
    checks.push({
      label: 'Đáp án câu hỏi',
      passed: true,
      details: 'Tất cả câu hỏi đều đã được thiết lập đáp án đúng.',
      severity: 'info',
    });
  }

  if (missingOptionsCount > 0) {
    errors.push(`Có ${missingOptionsCount} câu trắc nghiệm thiếu các phương án A, B, C, D.`);
    checks.push({
      label: 'Phương án trắc nghiệm',
      passed: false,
      details: `${missingOptionsCount} câu trắc nghiệm chưa đủ ít nhất 2 phương án lựa chọn.`,
      severity: 'error',
    });
  }

  // Check 4: Check for duplicates
  const questionTexts = new Set<string>();
  let duplicateCount = 0;
  questions.forEach((q) => {
    const simplified = (q.question || '').trim().toLowerCase();
    if (simplified.length > 10) {
      if (questionTexts.has(simplified)) {
        duplicateCount++;
      } else {
        questionTexts.add(simplified);
      }
    }
  });

  if (duplicateCount > 0) {
    warnings.push(`Phát hiện ${duplicateCount} câu hỏi có nội dung trùng lặp.`);
    checks.push({
      label: 'Kiểm tra trùng lặp',
      passed: false,
      details: `Có ${duplicateCount} câu bị lặp nội dung.`,
      severity: 'warning',
    });
  } else {
    checks.push({
      label: 'Kiểm tra trùng lặp',
      passed: true,
      details: 'Không phát hiện câu hỏi trùng lặp.',
      severity: 'info',
    });
  }

  // Check 5: Matrix correspondence
  if (matrix) {
    const matrixTotalQuestions = matrix.rows.reduce((sum, r) => sum + r.questionsCount, 0);
    if (questions.length !== matrixTotalQuestions) {
      warnings.push(`Số câu hỏi (${questions.length}) chưa khớp với ma trận đề (${matrixTotalQuestions} câu).`);
      checks.push({
        label: 'Độ khớp với Ma trận',
        passed: false,
        details: `Đề có ${questions.length} câu, ma trận yêu cầu ${matrixTotalQuestions} câu.`,
        severity: 'warning',
      });
    } else {
      checks.push({
        label: 'Độ khớp với Ma trận',
        passed: true,
        details: 'Số lượng câu hỏi khớp hoàn toàn với Ma trận.',
        severity: 'info',
      });
    }
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    warnings,
    checks,
  };
}
