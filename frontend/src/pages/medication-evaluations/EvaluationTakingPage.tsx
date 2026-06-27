import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/buttons/Button';
import { Card, CardContent } from '../../components/ui/cards/Card';
import { MedicationEvalCard } from '../../components/features/medication-evaluations';
import { useMedicationEvaluationStore } from '../../stores/medicationEvaluationStore';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../../components/ui/toast';

export const EvaluationTakingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentEvaluation, fetchEvaluation, updateEvaluation, isLoading } = useMedicationEvaluationStore();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const { addToast } = useToast();

  const evaluationId = Number(id);

  // Local answers state: key = `${templateMedicationId}-${criterionId}`, value = answer string
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [saving, setSaving] = useState(false);
  const [medicationPage, setMedicationPage] = useState(0);
  const PER_PAGE = 10;

  useEffect(() => {
    if (evaluationId) {
      fetchEvaluation(evaluationId);
    }
  }, [evaluationId, fetchEvaluation]);

  // Transition from draft to in_progress on first load
  useEffect(() => {
    if (currentEvaluation && currentEvaluation.id === evaluationId && currentEvaluation.status === 'draft') {
      updateEvaluation(evaluationId, { status: 'in_progress' });
    }
  }, [currentEvaluation, evaluationId, updateEvaluation]);

  // Reset page when evaluation changes
  useEffect(() => {
    const timer = setTimeout(() => setMedicationPage(0), 0);
    return () => clearTimeout(timer);
  }, [currentEvaluation?.id]);

  // Populate answers from existing evaluation data
  useEffect(() => {
    if (currentEvaluation && currentEvaluation.id === evaluationId && currentEvaluation.answers) {
      const existingAnswers: Record<string, string | null> = {};
      currentEvaluation.answers.forEach((answer) => {
        const key = `${answer.template_medication_id}-${answer.criterion_id}`;
        existingAnswers[key] = answer.answer_value;
      });
      // Use a timeout to break the synchronous setState chain in the effect
      const timer = setTimeout(() => {
        setAnswers((prev) => ({ ...prev, ...existingAnswers }));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentEvaluation, evaluationId]);

  const handleAnswerChange = useCallback((templateMedicationId: number, criterionId: number, value: string | null) => {
    setAnswers((prev) => ({
      ...prev,
      [`${templateMedicationId}-${criterionId}`]: value,
    }));
  }, []);

  const buildAnswersPayload = () => {
    return Object.entries(answers).map(([key, value]) => {
      const [templateMedicationId, criterionId] = key.split('-').map(Number);
      return {
        template_medication_id: templateMedicationId,
        criterion_id: criterionId,
        answer_value: value,
      };
    });
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await updateEvaluation(evaluationId, {
        status: 'in_progress',
        answers: buildAnswersPayload(),
      });
      addToast('Draft saved successfully', 'success');
      navigate('/medication-evaluations');
    } catch {
      addToast('Failed to save draft', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await updateEvaluation(evaluationId, {
        status: 'completed',
        answers: buildAnswersPayload(),
      });
      addToast('Evaluation submitted successfully', 'success');
      navigate('/medication-evaluations');
    } catch {
      addToast('Failed to submit evaluation', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Compute totals ───────────────────────────────────────────────────────
  const computeTotalScore = (): number => {
    if (!currentEvaluation) return 0;
    const template = currentEvaluation.template;
    if (!template) return 0;
    let total = 0;
    (template.medications || []).forEach((med) => {
      (template.criteria || []).forEach((criterion) => {
        const key = `${med.id}-${criterion.id}`;
        const value = answers[key] ?? null;
        if (value === null || value === '') return;
        switch (criterion.type) {
          case 'number': {
            const num = parseFloat(value);
            if (!isNaN(num) && num >= 0) {
              const recommendedQty = med.recommended_quantity ?? 0;
              const ratio = num / Math.max(1, recommendedQty);
              total += Math.min(ratio, 1) * Number(criterion.weight);
            }
            break;
          }
          case 'yes_no':
            total += value === 'yes' ? Number(criterion.weight) : 0;
            break;
          case 'yes_no_partial':
            if (value === 'yes') total += Number(criterion.weight);
            else if (value === 'partial') total += Number(criterion.weight) / 2;
            break;
          case 'text':
            total += value.trim().length > 0 ? Number(criterion.weight) : 0;
            break;
        }
      });
    });
    return total;
  };

  const computeMaxScore = (): number => {
    if (!currentEvaluation) return 0;
    const template = currentEvaluation.template;
    if (!template) return 0;
    const criteria = template.criteria ?? [];
    const totalWeight = criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);
    return (template.medications?.length ?? 0) * totalWeight;
  };

  const isCompleted = currentEvaluation?.status === 'completed';
  const totalScore = computeTotalScore();
  const maxScore = computeMaxScore();
  const percentage = maxScore > 0 ? ((totalScore / maxScore) * 100) : 0;

  if (!currentEvaluation && isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!currentEvaluation) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Evaluation not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/medication-evaluations')}>
          Back to Evaluations
        </Button>
      </div>
    );
  }

  const template = currentEvaluation.template;
  const allMedications = template?.medications || [];
  const totalPages = Math.max(1, Math.ceil(allMedications.length / PER_PAGE));
  const safePage = Math.min(medicationPage, totalPages - 1);
  const paginatedMedications = allMedications.slice(safePage * PER_PAGE, (safePage + 1) * PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card variant="elevated" padding="lg">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-white shadow-lg">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900">
                  {template?.name || 'Medication Evaluation'}
                </h2>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {currentEvaluation.phc_center?.name || '—'}
                {currentEvaluation.evaluator?.name && ` • Evaluator: ${currentEvaluation.evaluator.name}`}
              </p>
            </div>
          </div>

          {/* Score summary */}
          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Total Score</p>
            <p className="text-2xl font-bold text-red-600">{totalScore.toFixed(1)}</p>
            <p className="text-sm text-slate-400">/ {maxScore.toFixed(1)} max</p>
            {maxScore > 0 && (
              <div className="mt-1">
                <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      percentage >= 80 ? 'bg-red-500' : percentage >= 60 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <p className={`text-xs font-semibold mt-0.5 ${
                  percentage >= 80 ? 'text-red-600' : percentage >= 60 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {percentage.toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Medication Cards */}
      {allMedications.length > 0 ? (
        <>
          <div className="space-y-4">
            {paginatedMedications.map((med) => (
              <MedicationEvalCard
                key={med.id}
                medication={med}
                criteria={template.criteria || []}
                answers={answers}
                onAnswerChange={handleAnswerChange}
                readOnly={isCompleted}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing {(safePage * PER_PAGE) + 1}–{Math.min((safePage + 1) * PER_PAGE, allMedications.length)} of {allMedications.length} medications
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage === 0}
                  onClick={() => setMedicationPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage >= totalPages - 1}
                  onClick={() => setMedicationPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent>
            <div className="text-center py-8 text-slate-400">
              <p>No medications found in this template.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions ribbon */}
      <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200 sticky bottom-4 shadow-lg">
        <div className="flex items-center gap-4">
          <p className="text-sm text-slate-500">
            {Object.values(answers).filter((v) => v !== null && v !== '').length} / {allMedications.length * (template?.criteria || []).length} answered
          </p>
          <p className={`text-lg font-bold ${percentage >= 80 ? 'text-amber-700' : percentage >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
            {percentage.toFixed(1)}%
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isCompleted && hasPermission('medication-evaluations.edit') && (
            <>
              <Button variant="outline" onClick={handleSaveDraft} isLoading={saving}>
                Save Progress
              </Button>
              <Button
                variant="gradient"
                gradient="from-stone-500 to-amber-800"
                onClick={handleSubmit}
                isLoading={saving}
              >
                Submit
              </Button>
            </>
          )}
          {isCompleted && (
            <Button variant="outline" onClick={() => navigate('/medication-evaluations')}>
              Back to Evaluations
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvaluationTakingPage;
