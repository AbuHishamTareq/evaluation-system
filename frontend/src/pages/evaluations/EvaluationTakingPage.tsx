import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/buttons/Button';
import { Card, CardContent } from '../../components/ui/cards/Card';
import { useEvaluationStore } from '../../stores/evaluationStore';
import { useAuthStore } from '../../stores/authStore';
import { usePhcMedicationStore } from '../../stores/phcMedicationStore';
import { useToast } from '../../components/ui/toast';

interface AnswerEntry {
  question_id: number;
  medication_id?: number;
  answer_text?: string;
  answer_yes_no?: string;
  answer_rating?: number;
  answer_multiple_choice?: string;
  comment?: string;
}

const calculateLocalScore = (answer: AnswerEntry, questionType: string, maxScore: number, questionOptions?: Record<string, unknown>[] | null): number => {
  switch (questionType) {
    case 'radio': {
      const opts = Array.isArray(questionOptions) ? questionOptions : [];
      if (opts.length > 0 && answer.answer_multiple_choice) {
        const idx = opts.findIndex((o: any) => o.value === answer.answer_multiple_choice);
        if (idx >= 0) {
          return ((opts.length - 1 - idx) / (opts.length - 1)) * maxScore;
        }
      }
      return answer.answer_yes_no === 'yes' ? maxScore : 0;
    }
    case 'rating':
      return ((answer.answer_rating ?? 0) / 5) * maxScore;
    case 'select':
      return answer.answer_multiple_choice ? maxScore : 0;
    case 'textarea':
    case 'text':
      return (answer.answer_text ?? '').trim().length > 0 ? maxScore * 0.5 : 0;
    default:
      return 0;
  }
};

export const EvaluationTakingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentEvaluation, fetchEvaluationById, updateEvaluation, submitEvaluation, approveEvaluation, isLoading } = useEvaluationStore();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const { items: phcMedications, fetchByCenter: fetchPhcMedications } = usePhcMedicationStore();
  const { addToast } = useToast();

  const [answers, setAnswers] = useState<AnswerEntry[]>([]);
  const [medicationAnswers, setMedicationAnswers] = useState<AnswerEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const PER_PAGE = 5;

  const evaluationId = Number(id);

  useEffect(() => {
    if (evaluationId) {
      fetchEvaluationById(evaluationId);
    }
  }, [evaluationId, fetchEvaluationById]);

  // Transition from draft to in_progress on first load
  useEffect(() => {
    if (currentEvaluation && currentEvaluation.id === evaluationId && currentEvaluation.status === 'draft') {
      updateEvaluation(evaluationId, { status: 'in_progress' });
    }
  }, [currentEvaluation, evaluationId, updateEvaluation]);

  useEffect(() => {
    if (currentEvaluation && currentEvaluation.id === evaluationId) {
      const existingAnswers = currentEvaluation.answers ?? [];
      if (existingAnswers.length > 0) {
        setAnswers(existingAnswers.filter((a) => !a.medication_id).map((a) => ({
          question_id: a.question_id,
          answer_text: a.answer_text ?? undefined,
          answer_yes_no: a.answer_yes_no ?? undefined,
          answer_rating: a.answer_rating ?? undefined,
          answer_multiple_choice: a.answer_multiple_choice ?? undefined,
          comment: a.comment ?? undefined,
        })));
        setMedicationAnswers(existingAnswers.filter((a) => a.medication_id).map((a) => ({
          question_id: a.question_id,
          medication_id: a.medication_id!,
          answer_text: a.answer_text ?? undefined,
          answer_yes_no: a.answer_yes_no ?? undefined,
          answer_rating: a.answer_rating ?? undefined,
          answer_multiple_choice: a.answer_multiple_choice ?? undefined,
          comment: a.comment ?? undefined,
        })));
      } else {
        const templateQuestions = currentEvaluation.template?.questions ?? [];
        setAnswers(templateQuestions.map((tq) => ({
          question_id: tq.question_id,
        })));
      }

      const centerId = currentEvaluation.phc_center_id;
      if (centerId) {
        fetchPhcMedications(centerId);
      }
    }
  }, [currentEvaluation, evaluationId, fetchPhcMedications]);

  const getAnswer = useCallback((questionId: number): AnswerEntry | undefined => {
    return answers.find((a) => a.question_id === questionId);
  }, [answers]);

  const updateAnswer = useCallback((questionId: number, partial: Partial<AnswerEntry>) => {
    setAnswers((prev) => prev.map((a) => a.question_id === questionId ? { ...a, ...partial } : a));
  }, []);

  const getMedicationAnswer = useCallback((questionId: number, medicationId: number): AnswerEntry | undefined => {
    return medicationAnswers.find((a) => a.question_id === questionId && a.medication_id === medicationId);
  }, [medicationAnswers]);

  const updateMedicationAnswer = useCallback((questionId: number, medicationId: number, partial: Partial<AnswerEntry>) => {
    setMedicationAnswers((prev) => {
      const existing = prev.findIndex((a) => a.question_id === questionId && a.medication_id === medicationId);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = { ...next[existing], ...partial };
        return next;
      }
      return [...prev, { question_id: questionId, medication_id: medicationId, ...partial }];
    });
  }, []);

  const templateQuestions = currentEvaluation?.template?.questions ?? [];
  const medicationCheckQuestions = templateQuestions.filter((tq) => tq.is_medication_check);
  const regularQuestions = templateQuestions.filter((tq) => !tq.is_medication_check);

  const totalMaxScore = templateQuestions.reduce((sum, tq) => sum + (tq.question?.max_score ?? 0) * tq.weight, 0);
  const totalScore = templateQuestions.reduce((sum, tq) => {
    const answer = getAnswer(tq.question_id);
    if (tq.is_medication_check) {
      let medSum = 0;
      for (const ma of medicationAnswers) {
        if (ma.question_id === tq.question_id) {
          medSum += calculateLocalScore(ma, tq.question?.question_type ?? '', tq.question?.max_score ?? 0, tq.question?.options) * tq.weight;
        }
      }
      return sum + medSum;
    }
    if (!answer) return sum;
    return sum + calculateLocalScore(answer, tq.question?.question_type ?? '', tq.question?.max_score ?? 0, tq.question?.options) * tq.weight;
  }, 0);
  const percentage = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateEvaluation(evaluationId, {
        status: currentEvaluation?.status === 'draft' ? 'in_progress' : undefined,
        answers: [
          ...answers.map((a) => ({
            question_id: a.question_id,
            answer_text: a.answer_text,
            answer_yes_no: a.answer_yes_no,
            answer_rating: a.answer_rating,
            answer_multiple_choice: a.answer_multiple_choice,
            comment: a.comment,
          })),
          ...medicationAnswers.map((a) => ({
            question_id: a.question_id,
            medication_id: a.medication_id,
            answer_text: a.answer_text,
            answer_yes_no: a.answer_yes_no,
            answer_rating: a.answer_rating,
            answer_multiple_choice: a.answer_multiple_choice,
            comment: a.comment,
          })),
        ],
      });
      addToast('Answers saved', 'success');
    } catch {
      addToast('Failed to save answers', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await updateEvaluation(evaluationId, {
        status: currentEvaluation?.status === 'draft' ? 'in_progress' : undefined,
        answers: [
          ...answers.map((a) => ({
            question_id: a.question_id,
            answer_text: a.answer_text,
            answer_yes_no: a.answer_yes_no,
            answer_rating: a.answer_rating,
            answer_multiple_choice: a.answer_multiple_choice,
            comment: a.comment,
          })),
          ...medicationAnswers.map((a) => ({
            question_id: a.question_id,
            medication_id: a.medication_id,
            answer_text: a.answer_text,
            answer_yes_no: a.answer_yes_no,
            answer_rating: a.answer_rating,
            answer_multiple_choice: a.answer_multiple_choice,
            comment: a.comment,
          })),
        ],
      });
      await submitEvaluation(evaluationId);
      addToast('Evaluation submitted successfully', 'success');
      navigate('/evaluations');
    } catch {
      addToast('Failed to submit evaluation', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    setSaving(true);
    try {
      await approveEvaluation(evaluationId);
      addToast('Evaluation approved', 'success');
      navigate('/evaluations');
    } catch {
      addToast('Failed to approve evaluation', 'error');
    } finally {
      setSaving(false);
    }
  };

  const isDraft = currentEvaluation?.status === 'draft' || currentEvaluation?.status === 'in_progress';
  const isCompleted = currentEvaluation?.status === 'completed';

  const renderQuestionInput = (questionId: number, questionType: string, options: Record<string, unknown>[] | null, overrideAnswer?: AnswerEntry, overrideUpdater?: (partial: Partial<AnswerEntry>) => void) => {
    const answer = overrideAnswer ?? getAnswer(questionId);
    const onUpdate = overrideUpdater ?? ((partial: Partial<AnswerEntry>) => updateAnswer(questionId, partial));

    switch (questionType) {
      case 'radio': {
        const opts = Array.isArray(options) && options.length > 0 ? options : null;
        if (opts) {
          return (
            <div className="flex flex-wrap gap-3">
              {opts.map((opt: any, i: number) => {
                const val = opt.value ?? String(i);
                const label = opt.label ?? val;
                const isSelected = answer?.answer_multiple_choice === val;
                return (
                  <label
                    key={val}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-gray-200 hover:border-emerald-300'}`}
                  >
                    <input
                      type="radio"
                      name={`q-${questionId}`}
                      value={val}
                      checked={isSelected}
                      onChange={() => onUpdate({ answer_multiple_choice: val, answer_text: undefined, answer_yes_no: undefined, answer_rating: undefined })}
                      className="text-emerald-600"
                    />
                    {label}
                  </label>
                );
              })}
            </div>
          );
        }
        return (
          <div className="flex gap-4">
            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${answer?.answer_yes_no === 'yes' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-gray-200 hover:border-emerald-300'}`}>
              <input
                type="radio"
                name={`q-${questionId}`}
                value="yes"
                checked={answer?.answer_yes_no === 'yes'}
                onChange={() => onUpdate({ answer_yes_no: 'yes', answer_text: undefined, answer_rating: undefined, answer_multiple_choice: undefined })}
                className="text-emerald-600"
              />
              Yes
            </label>
            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${answer?.answer_yes_no === 'no' ? 'bg-red-50 border-red-500 text-red-700' : 'border-gray-200 hover:border-red-300'}`}>
              <input
                type="radio"
                name={`q-${questionId}`}
                value="no"
                checked={answer?.answer_yes_no === 'no'}
                onChange={() => onUpdate({ answer_yes_no: 'no', answer_text: undefined, answer_rating: undefined, answer_multiple_choice: undefined })}
                className="text-red-600"
              />
              No
            </label>
          </div>
        );
      }

      case 'rating':
        return (
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => onUpdate({ answer_rating: star, answer_text: undefined, answer_yes_no: undefined, answer_multiple_choice: undefined })}
                className={`transition-all ${(answer?.answer_rating ?? 0) >= star ? 'text-amber-400 scale-110' : 'text-slate-300 hover:text-amber-300'}`}
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            ))}
          </div>
        );

      case 'select': {
        const opts = Array.isArray(options) ? options : [];
        return (
          <select
            value={answer?.answer_multiple_choice ?? ''}
            onChange={(e) => onUpdate({ answer_multiple_choice: e.target.value || undefined, answer_text: undefined, answer_yes_no: undefined, answer_rating: undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Select an option...</option>
            {opts.map((opt: any, i: number) => (
              <option key={i} value={typeof opt === 'string' ? opt : String(i)}>
                {typeof opt === 'string' ? opt : (opt.label ?? `Option ${i + 1}`)}
              </option>
            ))}
          </select>
        );
      }

      case 'textarea':
        return (
          <textarea
            value={answer?.answer_text ?? ''}
            onChange={(e) => onUpdate({ answer_text: e.target.value, answer_yes_no: undefined, answer_rating: undefined, answer_multiple_choice: undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            rows={4}
          />
        );

      case 'text':
      default:
        return (
          <input
            type="text"
            value={answer?.answer_text ?? ''}
            onChange={(e) => onUpdate({ answer_text: e.target.value, answer_yes_no: undefined, answer_rating: undefined, answer_multiple_choice: undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        );
    }
  };

  if (isLoading && !currentEvaluation) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!currentEvaluation || currentEvaluation.id !== evaluationId) {
    return (
      <div className="text-center py-24">
        <h2 className="text-xl font-semibold text-gray-900">Evaluation not found</h2>
        <Button className="mt-4" variant="outline" onClick={() => navigate('/evaluations')}>
          Back to Evaluations
        </Button>
      </div>
    );
  }

  const { template, center, staff } = currentEvaluation;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/evaluations')} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{template?.name || 'Evaluation'}</h1>
              <p className="text-sm text-slate-500">{center?.name}{staff ? ` • ${staff.first_name} ${staff.last_name}` : ''}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className={`text-3xl font-bold ${percentage >= 80 ? 'text-emerald-600' : percentage >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
              {percentage}%
            </p>
            <p className="text-xs text-slate-400">Score</p>
          </div>
        </div>
      </div>

      {/* Questions */}
      {templateQuestions.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-center text-slate-500 py-8">This template has no questions.</p>
          </CardContent>
        </Card>
      ) : (() => {
        const sorted = [...templateQuestions].sort((a, b) => a.order - b.order);
        const totalPages = Math.ceil(sorted.length / PER_PAGE);
        const page = Math.min(currentPage, totalPages - 1);
        const pageQuestions = sorted.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
        const startNum = page * PER_PAGE + 1;

        return (
          <>
            <div className="flex justify-center">
              <div className="flex gap-1 w-full max-w-md">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentPage(i)}
                    className={`h-2 flex-1 rounded-full transition-all ${i <= page ? 'bg-emerald-500' : 'bg-slate-200 hover:bg-slate-300'}`}
                    aria-label={`Go to page ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {pageQuestions.map((tq, idx) => {
                const question = tq.question;
                if (!question) return null;
                const answer = getAnswer(tq.question_id);
                const localScore = answer ? calculateLocalScore(answer, question.question_type, question.max_score, question.options) : 0;

                return (
                  <Card key={tq.id} variant="elevated" padding="lg">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0">
                              {startNum + idx}
                            </span>
                            <div>
                              <p className="font-medium text-gray-900">{question.question_text}</p>
                              {question.category && (
                                <span className="text-xs text-slate-400">{question.category.name}</span>
                              )}
                            </div>
                          </div>
                          <span className="text-xs font-medium text-slate-400 whitespace-nowrap shrink-0">
                            Weight: {tq.weight} | Max: {question.max_score}
                          </span>
                        </div>
                        {renderQuestionInput(tq.question_id, question.question_type, question.options)}
                      </div>
                      <div className="text-right min-w-[60px] shrink-0">
                        <p className={`text-lg font-bold ${localScore > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                          {localScore}/{question.max_score}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={answer?.comment ?? ''}
                        onChange={(e) => updateAnswer(tq.question_id, { comment: e.target.value || undefined })}
                        className="w-full text-sm px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                ← Previous
              </button>
              <p className="text-xs text-slate-400">Page {page + 1} of {totalPages}</p>
              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                Next →
              </button>
            </div>
          </>
        );
      }      )()}

      {/* Medication Check Section */}
      {medicationCheckQuestions.length > 0 && phcMedications.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Medication Check</h2>
          </div>

          {phcMedications.map((pm) => (
            <Card key={pm.id} variant="elevated" padding="lg">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-semibold text-gray-900">{pm.medication?.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {pm.medication?.strength && (
                      <span className="text-xs text-slate-500">{pm.medication.strength}</span>
                    )}
                    {pm.allocation_location && (
                      <span className="px-2 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded-full font-medium">
                        {pm.allocation_location}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-500">
                  Qty: {pm.recommended_quantity}
                </span>
              </div>

              <div className="space-y-4">
                {medicationCheckQuestions.map((tq) => {
                  const question = tq.question;
                  if (!question) return null;
                  const medAnswer = getMedicationAnswer(tq.question_id, pm.medication_id);
                  const localScore = calculateLocalScore(
                    medAnswer ?? { question_id: tq.question_id },
                    question.question_type,
                    question.max_score,
                    question.options,
                  );

                  return (
                    <div key={`${tq.id}-${pm.medication_id}`} className="flex items-start justify-between gap-4 p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-700">{question.question_text}</p>
                        </div>
                        {renderQuestionInput(
                          tq.question_id,
                          question.question_type,
                          question.options,
                          medAnswer,
                          (partial) => updateMedicationAnswer(tq.question_id, pm.medication_id, partial),
                        )}
                      </div>
                      <p className={`text-sm font-bold shrink-0 ${localScore > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                        {localScore}/{question.max_score}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200 sticky bottom-4 shadow-lg">
        <div className="flex items-center gap-4">
          <p className="text-sm text-slate-500">
            {[
              ...answers.filter((a) => {
                if (a.answer_text !== undefined) return true;
                if (a.answer_yes_no !== undefined) return true;
                if (a.answer_rating !== undefined) return true;
                if (a.answer_multiple_choice !== undefined) return true;
                return false;
              }),
              ...medicationAnswers.filter((a) => {
                if (a.answer_text !== undefined) return true;
                if (a.answer_yes_no !== undefined) return true;
                if (a.answer_rating !== undefined) return true;
                if (a.answer_multiple_choice !== undefined) return true;
                return false;
              }),
            ].length} / {regularQuestions.length + medicationCheckQuestions.length * phcMedications.length} answered
          </p>
          <p className={`text-lg font-bold ${percentage >= 80 ? 'text-emerald-600' : percentage >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
            {percentage}%
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDraft && (
            <>
              <Button variant="outline" onClick={handleSave} isLoading={saving}>
                Save Progress
              </Button>
              {hasPermission('evaluations.submit') && (
                <Button
                  variant="gradient"
                  gradient="from-emerald-500 to-teal-500"
                  onClick={handleSubmit}
                  isLoading={saving}
                  disabled={answers.length === 0}
                >
                  Submit
                </Button>
              )}
            </>
          )}
          {isCompleted && hasPermission('evaluations.approve') && (
            <Button
              variant="gradient"
              gradient="from-emerald-500 to-teal-500"
              onClick={handleApprove}
              isLoading={saving}
            >
              Approve
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvaluationTakingPage;
