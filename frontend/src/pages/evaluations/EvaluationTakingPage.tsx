import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/buttons/Button';
import { Card, CardContent } from '../../components/ui/cards/Card';
import { useEvaluationStore } from '../../stores/evaluationStore';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../../components/ui/toast';
import type { Evaluation, EvaluationUpdateInput } from '../../types/evaluation';

interface AnswerEntry {
  question_id: number;
  answer_text?: string;
  answer_yes_no?: string;
  answer_rating?: number;
  answer_multiple_choice?: string;
  comment?: string;
}

const calculateLocalScore = (answer: AnswerEntry, questionType: string, maxScore: number): number => {
  switch (questionType) {
    case 'radio':
      return answer.answer_yes_no === 'yes' ? maxScore : 0;
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
  const { addToast } = useToast();

  const [answers, setAnswers] = useState<AnswerEntry[]>([]);
  const [saving, setSaving] = useState(false);

  const evaluationId = Number(id);

  useEffect(() => {
    if (evaluationId) {
      fetchEvaluationById(evaluationId);
    }
  }, [evaluationId, fetchEvaluationById]);

  useEffect(() => {
    if (currentEvaluation && currentEvaluation.id === evaluationId) {
      const existingAnswers = currentEvaluation.answers ?? [];
      if (existingAnswers.length > 0) {
        setAnswers(existingAnswers.map((a) => ({
          question_id: a.question_id,
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
    }
  }, [currentEvaluation, evaluationId]);

  const getAnswer = useCallback((questionId: number): AnswerEntry | undefined => {
    return answers.find((a) => a.question_id === questionId);
  }, [answers]);

  const updateAnswer = useCallback((questionId: number, partial: Partial<AnswerEntry>) => {
    setAnswers((prev) => prev.map((a) => a.question_id === questionId ? { ...a, ...partial } : a));
  }, []);

  const templateQuestions = currentEvaluation?.template?.questions ?? [];
  const totalMaxScore = templateQuestions.reduce((sum, tq) => sum + (tq.question?.max_score ?? 0) * tq.weight, 0);
  const totalScore = templateQuestions.reduce((sum, tq) => {
    const answer = getAnswer(tq.question_id);
    if (!answer) return sum;
    return sum + calculateLocalScore(answer, tq.question?.question_type ?? '', tq.question?.max_score ?? 0) * tq.weight;
  }, 0);
  const percentage = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateEvaluation(evaluationId, {
        answers: answers.map((a) => ({
          question_id: a.question_id,
          answer_text: a.answer_text,
          answer_yes_no: a.answer_yes_no,
          answer_rating: a.answer_rating,
          answer_multiple_choice: a.answer_multiple_choice,
          comment: a.comment,
        })),
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
        answers: answers.map((a) => ({
          question_id: a.question_id,
          answer_text: a.answer_text,
          answer_yes_no: a.answer_yes_no,
          answer_rating: a.answer_rating,
          answer_multiple_choice: a.answer_multiple_choice,
          comment: a.comment,
        })),
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

  const renderQuestionInput = (questionId: number, questionType: string, options: Record<string, unknown>[] | null, maxScore: number) => {
    const answer = getAnswer(questionId);

    switch (questionType) {
      case 'radio':
        return (
          <div className="flex gap-4">
            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${answer?.answer_yes_no === 'yes' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-gray-200 hover:border-emerald-300'}`}>
              <input
                type="radio"
                name={`q-${questionId}`}
                value="yes"
                checked={answer?.answer_yes_no === 'yes'}
                onChange={() => updateAnswer(questionId, { answer_yes_no: 'yes', answer_text: undefined, answer_rating: undefined, answer_multiple_choice: undefined })}
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
                onChange={() => updateAnswer(questionId, { answer_yes_no: 'no', answer_text: undefined, answer_rating: undefined, answer_multiple_choice: undefined })}
                className="text-red-600"
              />
              No
            </label>
          </div>
        );

      case 'rating':
        return (
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => updateAnswer(questionId, { answer_rating: star, answer_text: undefined, answer_yes_no: undefined, answer_multiple_choice: undefined })}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${(answer?.answer_rating ?? 0) >= star ? 'bg-amber-400 text-white scale-110' : 'bg-slate-100 text-slate-400 hover:bg-amber-100'}`}
              >
                {star}
              </button>
            ))}
          </div>
        );

      case 'select': {
        const opts = Array.isArray(options) ? options : [];
        return (
          <select
            value={answer?.answer_multiple_choice ?? ''}
            onChange={(e) => updateAnswer(questionId, { answer_multiple_choice: e.target.value || undefined, answer_text: undefined, answer_yes_no: undefined, answer_rating: undefined })}
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
            onChange={(e) => updateAnswer(questionId, { answer_text: e.target.value, answer_yes_no: undefined, answer_rating: undefined, answer_multiple_choice: undefined })}
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
            onChange={(e) => updateAnswer(questionId, { answer_text: e.target.value, answer_yes_no: undefined, answer_rating: undefined, answer_multiple_choice: undefined })}
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
      ) : (
        <div className="space-y-4">
          {templateQuestions
            .sort((a, b) => a.order - b.order)
            .map((tq) => {
              const question = tq.question;
              if (!question) return null;
              const answer = getAnswer(tq.question_id);
              const localScore = answer ? calculateLocalScore(answer, question.question_type, question.max_score) : 0;

              return (
                <Card key={tq.id} variant="elevated" padding="lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-gray-900">{question.question_text}</p>
                          {question.category && (
                            <span className="text-xs text-slate-400">{question.category.name}</span>
                          )}
                        </div>
                        <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                          Weight: {tq.weight} | Max: {question.max_score}
                        </span>
                      </div>
                      {renderQuestionInput(tq.question_id, question.question_type, question.options, question.max_score)}
                    </div>
                    <div className="text-right min-w-[60px]">
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
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200 sticky bottom-4 shadow-lg">
        <div className="flex items-center gap-4">
          <p className="text-sm text-slate-500">
            {answers.filter((a) => {
              if (a.answer_text !== undefined) return true;
              if (a.answer_yes_no !== undefined) return true;
              if (a.answer_rating !== undefined) return true;
              if (a.answer_multiple_choice !== undefined) return true;
              return false;
            }).length} / {templateQuestions.length} answered
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
